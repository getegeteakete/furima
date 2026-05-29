'use client';

// =============================================================
// Supabase版データストア
// -------------------------------------------------------------
// mockStore.ts と「完全に同じ関数シグネチャ」を提供する差し替え版。
// 仕組み: メモリ内キャッシュ + Supabase Realtime。
//   - 読み取り関数は同期的にキャッシュを返す（既存 useStoreData がそのまま動く）
//   - 書き込み関数は楽観的にキャッシュ更新 → 'furima-store-update' を発火 →
//     Supabase へ非同期で永続化（失敗時は再ハイドレートで整合）
//   - StoreProvider が起動時に hydrateAll() し、Realtime購読で自動更新する
//
// 移行手順:
//   各ページの import を  '../lib/mockStore' → '../lib/supabaseStore'  に変更し、
//   app/components/StoreProvider を ClientWrapper に追加するだけ。
// =============================================================

import { supabase } from './supabase/client';

// 型は mockStore と共有（type-only import なので localStorage 実体は読み込まれない）
import type {
  AdminEvent,
  AdminEventStatus,
  SellerApplication,
  SellerApplicationStatus,
  MockUser,
  UserRole,
  ChatSettings,
  ActiveSession,
  Transaction,
  Review,
  TransactionMessage,
} from './mockStore';

export type {
  AdminEvent,
  AdminEventStatus,
  SellerApplication,
  SellerApplicationStatus,
  MockUser,
  UserRole,
  ChatSettings,
  ActiveSession,
  Transaction,
  Review,
} from './mockStore';
export type { TransactionMessage } from './mockStore';

// ---------- デフォルト ----------
const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  sessionDurationSeconds: 600,
  maxImageSizeMB: 2,
  maxImagesPerMessage: 5,
  autoCloseOnTimeout: true,
  allowReRequest: true,
};

// ⑥のデモ用に固定（mockStore と同値）
export const CURRENT_MOCK_BUYER_ID = 'buyer-1';

// ---------- メモリキャッシュ ----------
const cache = {
  events: [] as AdminEvent[],
  users: [] as MockUser[],
  chatSettings: { ...DEFAULT_CHAT_SETTINGS } as ChatSettings,
  activeSessions: [] as ActiveSession[],
  transactions: [] as Transaction[],
  hydrated: false,
};

function isBrowser() {
  return typeof window !== 'undefined';
}

// 既存コンポーネントへ更新通知（useStoreData が購読している）
function notify(key: string) {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent('furima-store-update', { detail: { key } }));
}

// ---------- 行 ↔ ドメイン型 マッピング ----------
type Row = Record<string, any>;

function rowToEvent(e: Row, apps: Row[], res: Row[]): AdminEvent {
  return {
    id: e.id,
    date: e.date,
    startTime: e.start_time,
    endTime: e.end_time,
    region: e.region,
    title: e.title,
    description: e.description ?? '',
    maxSellers: e.max_sellers,
    maxBuyers: e.max_buyers,
    status: e.status as AdminEventStatus,
    managerId: e.manager_id ?? '',
    managerName: e.manager_name ?? '',
    createdAt: e.created_at,
    sellerApplications: apps
      .filter((a) => a.event_id === e.id)
      .map((a) => ({
        sellerId: a.seller_id,
        sellerName: a.seller_name,
        status: a.status as SellerApplicationStatus,
        appliedAt: a.applied_at,
      })),
    buyerReservations: res.filter((r) => r.event_id === e.id).map((r) => r.buyer_id),
  };
}

function rowToTransaction(t: Row): Transaction {
  return {
    id: t.id,
    eventId: t.event_id,
    eventTitle: t.event_title,
    sellerId: t.seller_id,
    sellerName: t.seller_name,
    buyerId: t.buyer_id,
    buyerName: t.buyer_name,
    productName: t.product_name,
    productPrice: t.product_price,
    purchasedAt: t.purchased_at,
    expiresAt: t.expires_at,
    chatOpen: t.chat_open ?? false,
    messages: (t.messages ?? []) as Transaction['messages'],
    buyerReview: (t.buyer_review ?? undefined) as Review | undefined,
    sellerReview: (t.seller_review ?? undefined) as Review | undefined,
  };
}

// =============================================================
// ハイドレート（StoreProvider が起動時/購読時に呼ぶ）
// =============================================================
export async function hydrateEvents(): Promise<void> {
  const [{ data: events }, { data: apps }, { data: res }] = await Promise.all([
    supabase.from('admin_events').select('*').order('created_at', { ascending: false }),
    supabase.from('seller_applications').select('*'),
    supabase.from('buyer_reservations').select('*'),
  ]);
  cache.events = (events ?? []).map((e) => rowToEvent(e, apps ?? [], res ?? []));
  notify('events');
}

export async function hydrateUsers(): Promise<void> {
  const { data } = await supabase.from('profiles').select('*').order('created_at');
  cache.users = (data ?? []).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email ?? '',
    role: u.role as UserRole,
  }));
  notify('users');
}

export async function hydrateChatSettings(): Promise<void> {
  const { data } = await supabase.from('chat_settings').select('*').eq('id', 1).maybeSingle();
  if (data) {
    cache.chatSettings = {
      sessionDurationSeconds: data.session_duration_seconds,
      maxImageSizeMB: data.max_image_size_mb,
      maxImagesPerMessage: data.max_images_per_message,
      autoCloseOnTimeout: data.auto_close_on_timeout,
      allowReRequest: data.allow_re_request,
    };
  }
  notify('chatSettings');
}

export async function hydrateSessions(): Promise<void> {
  const { data } = await supabase.from('active_sessions').select('*');
  cache.activeSessions = (data ?? []).map((s) => ({
    buyerId: s.buyer_id,
    eventId: s.event_id,
    sellerId: s.seller_id,
    startedAt: s.started_at,
  }));
  notify('activeSessions');
}

export async function hydrateTransactions(): Promise<void> {
  const { data } = await supabase
    .from('transactions')
    .select('*')
    // 7日経過分は除外。ただし継続会話中(chat_open)は期限に関係なく残す
    .or(`expires_at.gt.${new Date().toISOString()},chat_open.eq.true`)
    .order('purchased_at', { ascending: false });
  cache.transactions = (data ?? []).map(rowToTransaction);
  notify('transactions');
}

export async function hydrateAll(): Promise<void> {
  await Promise.all([
    hydrateEvents(),
    hydrateUsers(),
    hydrateChatSettings(),
    hydrateSessions(),
    hydrateTransactions(),
  ]);
  cache.hydrated = true;
  notify('all');
}

// =============================================================
// Realtime購読（StoreProvider から呼ぶ）。戻り値で unsubscribe。
// =============================================================
export function subscribeRealtime(): () => void {
  const channel = supabase
    .channel('furima-store')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_events' }, hydrateEvents)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'seller_applications' }, hydrateEvents)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'buyer_reservations' }, hydrateEvents)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, hydrateUsers)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_settings' }, hydrateChatSettings)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'active_sessions' }, hydrateSessions)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, hydrateTransactions)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// =============================================================
// 読み取り（同期・キャッシュ）
// =============================================================
export function getAdminEvents(): AdminEvent[] {
  return cache.events;
}
export function getAdminEventById(id: string): AdminEvent | undefined {
  return cache.events.find((e) => e.id === id);
}
export function getUsers(): MockUser[] {
  return cache.users;
}
export function getEventManagers(): MockUser[] {
  return cache.users.filter((u) => u.role === 'event_manager' || u.role === 'admin');
}
export function getChatSettings(): ChatSettings {
  return cache.chatSettings;
}
export function getActiveSessions(): ActiveSession[] {
  return cache.activeSessions;
}
export function getBuyerActiveSession(buyerId: string, eventId: string): ActiveSession | undefined {
  return cache.activeSessions.find((s) => s.buyerId === buyerId && s.eventId === eventId);
}
export function getTransactions(): Transaction[] {
  return cache.transactions;
}
export function getBuyerTransactions(buyerId: string): Transaction[] {
  return cache.transactions.filter((t) => t.buyerId === buyerId);
}
export function getSellerTransactions(sellerId: string): Transaction[] {
  return cache.transactions.filter((t) => t.sellerId === sellerId);
}
export function getTransactionById(id: string): Transaction | undefined {
  return cache.transactions.find((t) => t.id === id);
}
export function getSellerAverageRating(sellerId: string): { average: number; count: number } {
  const reviews = cache.transactions
    .filter((t) => t.sellerId === sellerId && t.buyerReview)
    .map((t) => t.buyerReview!.rating);
  if (reviews.length === 0) return { average: 0, count: 0 };
  return { average: reviews.reduce((a, b) => a + b, 0) / reviews.length, count: reviews.length };
}
export function getRemainingDays(expiresAt: string): number {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

// =============================================================
// 書き込み（楽観更新 + 非同期永続化）
// =============================================================
function persistError(label: string, error: unknown) {
  if (error) console.error(`[supabaseStore] ${label} failed:`, error);
}

// ---- イベント ----
export function createAdminEvent(
  event: Omit<AdminEvent, 'id' | 'createdAt' | 'sellerApplications' | 'buyerReservations'>,
): AdminEvent {
  const newEvent: AdminEvent = {
    ...event,
    id: `evt-${Date.now()}`,
    createdAt: new Date().toISOString(),
    sellerApplications: [],
    buyerReservations: [],
  };
  cache.events = [newEvent, ...cache.events];
  notify('events');
  supabase
    .from('admin_events')
    .insert({
      id: newEvent.id,
      date: newEvent.date,
      start_time: newEvent.startTime,
      end_time: newEvent.endTime,
      region: newEvent.region,
      title: newEvent.title,
      description: newEvent.description,
      max_sellers: newEvent.maxSellers,
      max_buyers: newEvent.maxBuyers,
      status: newEvent.status,
      manager_id: newEvent.managerId,
      manager_name: newEvent.managerName,
      created_at: newEvent.createdAt,
    })
    .then(({ error }) => persistError('createAdminEvent', error));
  return newEvent;
}

export function updateAdminEvent(id: string, updates: Partial<AdminEvent>): void {
  cache.events = cache.events.map((e) => (e.id === id ? { ...e, ...updates } : e));
  notify('events');
  // スカラー項目のみ admin_events に反映（関係データは専用関数で扱う）
  const patch: Row = {};
  if (updates.date !== undefined) patch.date = updates.date;
  if (updates.startTime !== undefined) patch.start_time = updates.startTime;
  if (updates.endTime !== undefined) patch.end_time = updates.endTime;
  if (updates.region !== undefined) patch.region = updates.region;
  if (updates.title !== undefined) patch.title = updates.title;
  if (updates.description !== undefined) patch.description = updates.description;
  if (updates.maxSellers !== undefined) patch.max_sellers = updates.maxSellers;
  if (updates.maxBuyers !== undefined) patch.max_buyers = updates.maxBuyers;
  if (updates.status !== undefined) patch.status = updates.status;
  if (updates.managerId !== undefined) patch.manager_id = updates.managerId;
  if (updates.managerName !== undefined) patch.manager_name = updates.managerName;
  if (Object.keys(patch).length === 0) return;
  supabase
    .from('admin_events')
    .update(patch)
    .eq('id', id)
    .then(({ error }) => persistError('updateAdminEvent', error));
}

export function deleteAdminEvent(id: string): void {
  cache.events = cache.events.filter((e) => e.id !== id);
  notify('events');
  supabase
    .from('admin_events')
    .delete()
    .eq('id', id)
    .then(({ error }) => persistError('deleteAdminEvent', error));
}

export function setEventStatus(id: string, status: AdminEventStatus): void {
  updateAdminEvent(id, { status });
}

export function updateSellerApplication(
  eventId: string,
  sellerId: string,
  status: SellerApplicationStatus,
): void {
  cache.events = cache.events.map((e) =>
    e.id !== eventId
      ? e
      : {
          ...e,
          sellerApplications: e.sellerApplications.map((a) =>
            a.sellerId === sellerId ? { ...a, status } : a,
          ),
        },
  );
  notify('events');
  supabase
    .from('seller_applications')
    .update({ status })
    .eq('event_id', eventId)
    .eq('seller_id', sellerId)
    .then(({ error }) => persistError('updateSellerApplication', error));
}

export function applyAsSeller(
  eventId: string,
  sellerId: string,
  sellerName: string,
): { ok: boolean; message: string } {
  const event = getAdminEventById(eventId);
  if (!event) return { ok: false, message: 'イベントが見つかりません' };
  const approvedCount = event.sellerApplications.filter((a) => a.status === 'approved').length;
  if (approvedCount >= event.maxSellers) {
    return { ok: false, message: '出店者の募集は終了しました（定員に達しました）' };
  }
  if (event.sellerApplications.some((a) => a.sellerId === sellerId)) {
    return { ok: false, message: 'すでに申請済みです' };
  }
  const appliedAt = new Date().toISOString();
  updateAdminEvent(eventId, {
    sellerApplications: [
      ...event.sellerApplications,
      { sellerId, sellerName, status: 'pending', appliedAt },
    ],
  });
  supabase
    .from('seller_applications')
    .insert({ event_id: eventId, seller_id: sellerId, seller_name: sellerName, status: 'pending', applied_at: appliedAt })
    .then(({ error }) => persistError('applyAsSeller', error));
  return { ok: true, message: '参加申請を送信しました（承認待ち）' };
}

export function reserveAsBuyer(eventId: string, buyerId: string): { ok: boolean; message: string } {
  const event = getAdminEventById(eventId);
  if (!event) return { ok: false, message: 'イベントが見つかりません' };
  if (event.buyerReservations.length >= event.maxBuyers) {
    return { ok: false, message: '来場予約は満員です' };
  }
  if (event.buyerReservations.includes(buyerId)) {
    return { ok: false, message: 'すでに予約済みです' };
  }
  updateAdminEvent(eventId, { buyerReservations: [...event.buyerReservations, buyerId] });
  supabase
    .from('buyer_reservations')
    .insert({ event_id: eventId, buyer_id: buyerId })
    .then(({ error }) => persistError('reserveAsBuyer', error));
  return { ok: true, message: '来場予約が完了しました' };
}

// ---- ユーザー権限 ----
export function updateUserRole(userId: string, role: UserRole): void {
  cache.users = cache.users.map((u) => (u.id === userId ? { ...u, role } : u));
  notify('users');
  supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .then(({ error }) => persistError('updateUserRole', error));
}

// ---- チャット設定 ----
export function updateChatSettings(updates: Partial<ChatSettings>): void {
  cache.chatSettings = { ...cache.chatSettings, ...updates };
  notify('chatSettings');
  const patch: Row = {};
  if (updates.sessionDurationSeconds !== undefined) patch.session_duration_seconds = updates.sessionDurationSeconds;
  if (updates.maxImageSizeMB !== undefined) patch.max_image_size_mb = updates.maxImageSizeMB;
  if (updates.maxImagesPerMessage !== undefined) patch.max_images_per_message = updates.maxImagesPerMessage;
  if (updates.autoCloseOnTimeout !== undefined) patch.auto_close_on_timeout = updates.autoCloseOnTimeout;
  if (updates.allowReRequest !== undefined) patch.allow_re_request = updates.allowReRequest;
  supabase
    .from('chat_settings')
    .update(patch)
    .eq('id', 1)
    .then(({ error }) => persistError('updateChatSettings', error));
}

// ---- ⑥ セッション ----
export function startSession(
  buyerId: string,
  eventId: string,
  sellerId: string,
): { ok: boolean; message: string } {
  const existing = getBuyerActiveSession(buyerId, eventId);
  if (existing && existing.sellerId !== sellerId) {
    return { ok: false, message: '別の出店者との接客が進行中です。先に終了してください。' };
  }
  const startedAt = new Date().toISOString();
  cache.activeSessions = [
    ...cache.activeSessions.filter((s) => !(s.buyerId === buyerId && s.eventId === eventId)),
    { buyerId, eventId, sellerId, startedAt },
  ];
  notify('activeSessions');
  // unique(buyer_id,event_id) のため delete → insert で置換
  (async () => {
    await supabase.from('active_sessions').delete().eq('buyer_id', buyerId).eq('event_id', eventId);
    const { error } = await supabase
      .from('active_sessions')
      .insert({ buyer_id: buyerId, event_id: eventId, seller_id: sellerId, started_at: startedAt });
    persistError('startSession', error);
  })();
  return { ok: true, message: '接客を開始しました' };
}

export function endSession(buyerId: string, eventId: string): void {
  cache.activeSessions = cache.activeSessions.filter(
    (s) => !(s.buyerId === buyerId && s.eventId === eventId),
  );
  notify('activeSessions');
  supabase
    .from('active_sessions')
    .delete()
    .eq('buyer_id', buyerId)
    .eq('event_id', eventId)
    .then(({ error }) => persistError('endSession', error));
}

export function canReserveSeller(
  buyerId: string,
  eventId: string,
  sellerId: string,
): { ok: boolean; message: string } {
  const active = getBuyerActiveSession(buyerId, eventId);
  if (active && active.sellerId !== sellerId) {
    return { ok: false, message: '現在ほかの出店者と接客中です。終了後に予約できます。' };
  }
  return { ok: true, message: '' };
}

// ---- ① 取引履歴 / ② 評価 ----
export function createTransaction(
  data: Omit<Transaction, 'id' | 'purchasedAt' | 'expiresAt'>,
): Transaction {
  const purchasedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();
  const txn: Transaction = { ...data, id: `txn-${Date.now()}`, purchasedAt, expiresAt };
  cache.transactions = [txn, ...cache.transactions];
  notify('transactions');
  supabase
    .from('transactions')
    .insert({
      id: txn.id,
      event_id: txn.eventId,
      event_title: txn.eventTitle,
      seller_id: txn.sellerId,
      seller_name: txn.sellerName,
      buyer_id: txn.buyerId,
      buyer_name: txn.buyerName,
      product_name: txn.productName,
      product_price: txn.productPrice,
      purchased_at: purchasedAt,
      expires_at: expiresAt,
      messages: txn.messages,
    })
    .then(({ error }) => persistError('createTransaction', error));
  return txn;
}

// ① 取引チャットへメッセージを追記（出店者⇔購入者の継続会話）
// 送信すると chatOpen=true になり、7日の閲覧期限に関係なく会話を続けられる。
export function appendTransactionMessage(
  transactionId: string,
  message: Omit<TransactionMessage, 'timestamp'> & { timestamp?: string },
): void {
  const timestamp =
    message.timestamp ??
    new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  const msg: TransactionMessage = { ...message, timestamp };
  // 楽観更新
  const target = cache.transactions.find((t) => t.id === transactionId);
  const nextMessages = [...(target?.messages ?? []), msg];
  cache.transactions = cache.transactions.map((t) =>
    t.id === transactionId ? { ...t, messages: nextMessages, chatOpen: true } : t,
  );
  notify('transactions');
  // 永続化（messages 全体を書き戻し + chat_open を立てる）
  supabase
    .from('transactions')
    .update({ messages: nextMessages, chat_open: true })
    .eq('id', transactionId)
    .then(({ error }) => persistError('appendTransactionMessage', error));
}

export function submitBuyerReview(transactionId: string, review: Review): void {
  cache.transactions = cache.transactions.map((t) =>
    t.id === transactionId ? { ...t, buyerReview: review } : t,
  );
  notify('transactions');
  supabase
    .from('transactions')
    .update({ buyer_review: review })
    .eq('id', transactionId)
    .then(({ error }) => persistError('submitBuyerReview', error));
}

export function submitSellerReview(transactionId: string, review: Review): void {
  cache.transactions = cache.transactions.map((t) =>
    t.id === transactionId ? { ...t, sellerReview: review } : t,
  );
  notify('transactions');
  supabase
    .from('transactions')
    .update({ seller_review: review })
    .eq('id', transactionId)
    .then(({ error }) => persistError('submitSellerReview', error));
}

// 開発用リセットは Supabase 版では非対応（DBはダッシュボードで管理）
export function resetMockStore(): void {
  console.warn('[supabaseStore] resetMockStore は Supabase 版では無効です。');
}
