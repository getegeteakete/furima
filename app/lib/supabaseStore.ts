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
import { getSellerByProfileId, type Seller } from './events';

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
// 統一イベント: admin_events を唯一の正とし、公開/ライブ画面が読む形に合成
// -------------------------------------------------------------
// これにより予約(buyer_reservations) / チャット(messages) / セッション(active_sessions)
// がすべて同じ event.id（例 'evt-001'）で揃い、開催成立判定が正しく計算できる。
// 出店者・商品は静的マスタ(events.ts の sellers)から承認済み申請を引いて合成。
// =============================================================
export type PublicEventStatus = 'upcoming' | 'live' | 'ended' | 'cancelled';

export type PublicEvent = {
  id: string; // admin_events.id（共通イベントID）
  startTime: string;
  endTime: string;
  region: string;
  date: string;
  title: string;
  status: PublicEventStatus;
  sellers: Seller[]; // 承認済み出店者（ショップマスタから合成）
  reservationCount: number;
  maxBuyers: number;
};

// admin_events の status を 公開向け status へ変換
function toPublicStatus(s: AdminEventStatus): PublicEventStatus {
  switch (s) {
    case 'live':
      return 'live';
    case 'ended':
      return 'ended';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'upcoming'; // recruiting / seller_closed は公開上「開催前」
  }
}

function adminEventToPublic(e: AdminEvent): PublicEvent {
  const approvedSellers = e.sellerApplications
    .filter((a) => a.status === 'approved')
    .map((a) => getSellerByProfileId(a.sellerId))
    .filter((s): s is Seller => Boolean(s));
  return {
    id: e.id,
    startTime: e.startTime,
    endTime: e.endTime,
    region: e.region,
    date: e.date,
    title: e.title,
    status: toPublicStatus(e.status),
    sellers: approvedSellers,
    reservationCount: e.buyerReservations.length,
    maxBuyers: e.maxBuyers,
  };
}

// 公開イベント一覧（中止は除外）
export function getPublicEvents(): PublicEvent[] {
  return cache.events
    .filter((e) => e.status !== 'cancelled')
    .map(adminEventToPublic)
    .sort((a, b) => (a.startTime < b.startTime ? -1 : 1));
}

export function getPublicEventById(id: string): PublicEvent | undefined {
  const e = getAdminEventById(id);
  return e ? adminEventToPublic(e) : undefined;
}

// =============================================================
// 開催成立判定（元仕様③）
//   条件: 3名以上の予約 AND 3アカウント以上のチャット発生
// チャットの「アカウント数」は messages テーブルの distinct な参加者で数える。
// =============================================================
export const OPEN_THRESHOLD = { minReservations: 3, minChatAccounts: 3 } as const;

export type OpenEligibility = {
  reservationCount: number;
  chatAccountCount: number;
  reservationsMet: boolean;
  chatMet: boolean;
  eligible: boolean;
};

// チャットに参加した一意アカウント数を取得（購入者・出店者の sender_id を集計）
export async function getChatAccountCount(eventId: string): Promise<number> {
  const { data, error } = await supabase
    .from('messages')
    .select('sender_id, sender_role')
    .eq('event_id', eventId)
    .neq('sender_role', 'system');
  if (error) {
    persistError('getChatAccountCount', error);
    return 0;
  }
  const ids = new Set<string>();
  for (const r of data ?? []) {
    if (r.sender_id) ids.add(r.sender_id);
  }
  return ids.size;
}

// イベントが開催成立条件を満たすか判定（予約は同期キャッシュ、チャットはDB集計）
export async function checkOpenEligibility(eventId: string): Promise<OpenEligibility> {
  const event = getAdminEventById(eventId);
  const reservationCount = event?.buyerReservations.length ?? 0;
  const chatAccountCount = await getChatAccountCount(eventId);
  const reservationsMet = reservationCount >= OPEN_THRESHOLD.minReservations;
  const chatMet = chatAccountCount >= OPEN_THRESHOLD.minChatAccounts;
  return {
    reservationCount,
    chatAccountCount,
    reservationsMet,
    chatMet,
    eligible: reservationsMet && chatMet,
  };
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

// =============================================================
// リアルタイムチャット（messages テーブル）
// -------------------------------------------------------------
// ルームの定義（schema 準拠）:
//   全体チャット : event_id + seller_id IS NULL + buyer_id IS NULL
//   個別チャット : event_id + seller_id + buyer_id（出店者⇔購入者 1対1）
// 取引履歴チャット(transactions.messages)とは別物。こちらは「開催中の接客」用。
// =============================================================
export type ChatRoomMessage = {
  id: string;
  eventId: string;
  sellerId: string | null; // NULL = 全体チャット
  buyerId: string | null;
  senderRole: 'buyer' | 'seller' | 'system';
  senderId: string | null;
  senderName: string | null;
  text: string;
  images: string[];
  createdAt: string;
};

type MessageRow = {
  id: string;
  event_id: string;
  seller_id: string | null;
  buyer_id: string | null;
  sender_role: 'buyer' | 'seller' | 'system';
  sender_id: string | null;
  sender_name: string | null;
  text: string | null;
  images: string[] | null;
  created_at: string;
};

function rowToChatMessage(r: MessageRow): ChatRoomMessage {
  return {
    id: r.id,
    eventId: r.event_id,
    sellerId: r.seller_id,
    buyerId: r.buyer_id,
    senderRole: r.sender_role,
    senderId: r.sender_id,
    senderName: r.sender_name,
    text: r.text ?? '',
    images: r.images ?? [],
    createdAt: r.created_at,
  };
}

// 指定ルームの履歴を古い順で取得
export async function fetchRoomMessages(
  eventId: string,
  sellerId: string | null,
  buyerId: string | null,
): Promise<ChatRoomMessage[]> {
  let q = supabase
    .from('messages')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });
  q = sellerId === null ? q.is('seller_id', null) : q.eq('seller_id', sellerId);
  q = buyerId === null ? q.is('buyer_id', null) : q.eq('buyer_id', buyerId);
  const { data, error } = await q;
  if (error) {
    persistError('fetchRoomMessages', error);
    return [];
  }
  return (data ?? []).map((d) => rowToChatMessage(d as MessageRow));
}

// メッセージを送信（成功時は挿入された行を返す＝楽観表示に使える）
export async function sendChatMessage(args: {
  eventId: string;
  sellerId: string | null;
  buyerId: string | null;
  senderRole: 'buyer' | 'seller' | 'system';
  senderId?: string | null;
  senderName?: string | null;
  text?: string;
  images?: string[];
}): Promise<ChatRoomMessage | null> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      event_id: args.eventId,
      seller_id: args.sellerId,
      buyer_id: args.buyerId,
      sender_role: args.senderRole,
      sender_id: args.senderId ?? null,
      sender_name: args.senderName ?? null,
      text: args.text ?? '',
      images: args.images ?? [],
    })
    .select()
    .single();
  if (error) {
    persistError('sendChatMessage', error);
    return null;
  }
  return rowToChatMessage(data as MessageRow);
}

// 1つのチャットルームを購読（新着 INSERT を受信）
// Realtime の postgres_changes は単一の等値フィルタのみ確実に効くため、
// サーバ側は event_id で絞り、seller_id / buyer_id の一致はクライアントで判定する。
export function subscribeToRoom(
  eventId: string,
  sellerId: string | null,
  buyerId: string | null,
  onInsert: (msg: ChatRoomMessage) => void,
): () => void {
  const roomKey = `${eventId}:${sellerId ?? 'ALL'}:${buyerId ?? 'ALL'}`;
  const channel = supabase
    .channel(`room-${roomKey}-${Math.random().toString(36).slice(2, 8)}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `event_id=eq.${eventId}`,
      },
      (payload) => {
        const r = payload.new as MessageRow;
        const sellerMatch = (r.seller_id ?? null) === sellerId;
        const buyerMatch = (r.buyer_id ?? null) === buyerId;
        if (sellerMatch && buyerMatch) onInsert(rowToChatMessage(r));
      },
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

// 出店者の個別ルームに参加している購入者一覧（最新メッセージ付き・更新が新しい順）
export async function fetchSellerRoomBuyers(
  eventId: string,
  sellerId: string,
): Promise<{ buyerId: string; buyerName: string | null; lastText: string; lastAt: string }[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('event_id', eventId)
    .eq('seller_id', sellerId)
    .not('buyer_id', 'is', null)
    .order('created_at', { ascending: true });
  if (error) {
    persistError('fetchSellerRoomBuyers', error);
    return [];
  }
  const map = new Map<string, { buyerId: string; buyerName: string | null; lastText: string; lastAt: string }>();
  for (const d of data ?? []) {
    const r = d as MessageRow;
    if (!r.buyer_id) continue;
    const prev = map.get(r.buyer_id);
    const buyerName =
      r.sender_role === 'buyer' && r.sender_name ? r.sender_name : (prev?.buyerName ?? null);
    map.set(r.buyer_id, {
      buyerId: r.buyer_id,
      buyerName,
      lastText: r.text ?? '',
      lastAt: r.created_at,
    });
  }
  return Array.from(map.values()).sort((a, b) => (a.lastAt < b.lastAt ? 1 : -1));
}

// 出店者の全個別ルームを購読（どの購入者からの新着でも受信）
export function subscribeToSellerPrivate(
  eventId: string,
  sellerId: string,
  onInsert: (msg: ChatRoomMessage) => void,
): () => void {
  const channel = supabase
    .channel(`seller-${eventId}-${sellerId}-${Math.random().toString(36).slice(2, 8)}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `event_id=eq.${eventId}` },
      (payload) => {
        const r = payload.new as MessageRow;
        if (r.seller_id === sellerId && r.buyer_id) onInsert(rowToChatMessage(r));
      },
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

// =============================================================
// 画像アップロード（Supabase Storage）
// -------------------------------------------------------------
// チャット画像を dataURL でDB保存していたのを Storage へ移行。
// バケット 'chat-images'（public）に保存し、公開URLを messages.images に格納する。
// ⚠️ 事前にSupabaseで public バケット 'chat-images' を作成しておくこと。
// =============================================================
const CHAT_IMAGE_BUCKET = 'chat-images';

// dataURL を Blob に変換
function dataUrlToBlob(dataUrl: string): { blob: Blob; ext: string } {
  const [meta, b64] = dataUrl.split(',');
  const mime = /data:(.*?);/.exec(meta)?.[1] ?? 'image/png';
  const ext = mime.split('/')[1]?.split('+')[0] ?? 'png';
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { blob: new Blob([bytes], { type: mime }), ext };
}

// 単一画像（dataURL）を Storage にアップロードし公開URLを返す。
// 失敗時は null（呼び出し側で dataURL フォールバック可）。
export async function uploadChatImage(
  dataUrl: string,
  pathPrefix: string,
): Promise<string | null> {
  try {
    const { blob, ext } = dataUrlToBlob(dataUrl);
    const path = `${pathPrefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from(CHAT_IMAGE_BUCKET)
      .upload(path, blob, { contentType: blob.type, upsert: false });
    if (error) {
      persistError('uploadChatImage', error);
      return null;
    }
    const { data } = supabase.storage.from(CHAT_IMAGE_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  } catch (e) {
    persistError('uploadChatImage(exception)', e);
    return null;
  }
}

// 複数 dataURL をまとめてアップロード。アップロード失敗分は dataURL のまま残す
// （表示は維持しつつ、成功したものは軽量なURLに置き換わる）。
export async function uploadChatImages(
  dataUrls: string[],
  pathPrefix: string,
): Promise<string[]> {
  if (dataUrls.length === 0) return [];
  const results = await Promise.all(
    dataUrls.map(async (d) => {
      if (!d.startsWith('data:')) return d; // 既にURLならそのまま
      const url = await uploadChatImage(d, pathPrefix);
      return url ?? d;
    }),
  );
  return results;
}

// 開発用リセットは Supabase 版では非対応（DBはダッシュボードで管理）
export function resetMockStore(): void {
  console.warn('[supabaseStore] resetMockStore は Supabase 版では無効です。');
}
