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
import { getSellerById, PROFILE_TO_SHOP, type Seller, type Product } from './events';

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
  products: {} as Record<string, Product[]>, // shopId(sellers.id) -> Product[]
  productsLoaded: false,
  sellers: [] as Seller[], // DBのショップ情報（events.ts 静的マスタを上書き）
  sellersLoaded: false,
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
        feeStatus: (a.fee_status ?? 'unpaid') as 'unpaid' | 'submitted' | 'paid',
        feeMethod: (a.fee_method ?? null) as 'bank' | 'paypay' | null,
        feeSubmittedAt: a.fee_submitted_at ?? null,
        feePaidAt: a.fee_paid_at ?? null,
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

function rowToProduct(p: Row): Product {
  return {
    id: p.product_no as number,
    name: p.name,
    price: p.price,
    icon: p.icon ?? 'package',
    description: p.description ?? '',
    soldOut: p.sold_out ?? false,
    stock: p.stock ?? null,
    imageUrl: p.image_url ?? undefined,
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
      feeBankInfo: data.fee_bank_info ?? '',
      feePaypayId: data.fee_paypay_id ?? '',
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

export async function hydrateProducts(): Promise<void> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('product_no', { ascending: true });
  if (error) {
    persistError('hydrateProducts', error);
    return;
  }
  const byShop: Record<string, Product[]> = {};
  for (const r of data ?? []) {
    const p = rowToProduct(r as Row);
    (byShop[r.seller_id as string] ??= []).push(p);
  }
  cache.products = byShop;
  cache.productsLoaded = true;
  notify('products');
}

export async function hydrateSellers(): Promise<void> {
  const { data, error } = await supabase.from('sellers').select('*');
  if (error) {
    persistError('hydrateSellers', error);
    return;
  }
  cache.sellers = (data ?? []).map((s) => {
    const r = s as Row;
    const staticProducts = getSellerById(r.id as string)?.products ?? [];
    return {
      id: r.id as string,
      name: r.name as string,
      region: (r.region ?? '') as string,
      category: (r.category ?? '') as string,
      tags: (r.tags ?? []) as string[],
      description: (r.description ?? '') as string,
      icon: (r.icon ?? 'package') as Seller['icon'],
      rating: Number(r.rating ?? 0),
      followers: Number(r.followers ?? 0),
      products: staticProducts, // 目玉は静的を保持（商品本体は products テーブルが正）
    };
  });
  cache.sellersLoaded = true;
  notify('sellers');
}

export async function hydrateAll(): Promise<void> {
  await Promise.all([
    hydrateEvents(),
    hydrateUsers(),
    hydrateChatSettings(),
    hydrateSessions(),
    hydrateTransactions(),
    hydrateProducts(),
    hydrateSellers(),
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
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, hydrateProducts)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'sellers' }, hydrateSellers)
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
    .map((a) => getShopByProfileId(a.sellerId))
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
// ショップ情報（sellers テーブル）
// -------------------------------------------------------------
// 表示は「DB優先・無ければ events.ts の静的マスタにフォールバック」。
// DBにショップが投入済みなら name/region/tags/description/icon/rating/followers は
// DBが正。products(目玉) は静的マスタを保持（商品本体は products テーブルが正）。
// =============================================================

// 指定ショップ（sellers.id）の情報を取得（DB優先・静的フォールバック）
export function getShopById(id: string): Seller | undefined {
  const fromDb = cache.sellers.find((s) => s.id === id);
  const fromStatic = getSellerById(id);
  if (!fromDb) return fromStatic;
  // DBのショップ情報を静的に上書き。products は静的の目玉を維持。
  return {
    ...(fromStatic ?? ({} as Seller)),
    ...fromDb,
    products: fromStatic?.products ?? fromDb.products ?? [],
  };
}

// 出店者アカウント(profile.id) からショップ情報を解決（DB優先）
export function getShopByProfileId(profileId: string): Seller | undefined {
  const shopId = PROFILE_TO_SHOP[profileId] ?? profileId;
  return getShopById(shopId);
}

// =============================================================
// 商品（products テーブル）
// -------------------------------------------------------------
// 表示は「DB優先・無ければ events.ts の静的マスタにフォールバック」。
// これにより products 未投入でも従来通り表示され、投入済みならDBが正になる。
// shopId は sellers.id（例 'mina-craft'）。
// =============================================================

// 指定ショップの商品一覧（DB優先・静的フォールバック）
export function getSellerProducts(shopId: string): Product[] {
  const fromDb = cache.products[shopId];
  if (fromDb && fromDb.length > 0) return fromDb;
  // フォールバック: 静的マスタ（soldOut/stock を既定値で補完）
  const fallback = getSellerById(shopId)?.products ?? [];
  return fallback.map((p) => ({ soldOut: false, stock: null, ...p }));
}

// 目玉商品（開催前に出す先頭5点）
export function getSellerPickupProducts(shopId: string, count = 5): Product[] {
  return getSellerProducts(shopId).slice(0, count);
}

// 新規商品を登録。product_no はショップ内の最大+1を自動採番。
export function createProduct(
  shopId: string,
  data: { name: string; price: number; icon: Product['icon']; description?: string; stock?: number | null; imageUrl?: string },
): Product {
  const current = cache.products[shopId] ?? [];
  const nextNo = current.reduce((m, p) => Math.max(m, p.id), 0) + 1;
  const product: Product = {
    id: nextNo,
    name: data.name,
    price: data.price,
    icon: data.icon,
    description: data.description ?? '',
    soldOut: false,
    stock: data.stock ?? null,
    imageUrl: data.imageUrl,
  };
  cache.products = { ...cache.products, [shopId]: [...current, product] };
  notify('products');
  supabase
    .from('products')
    .insert({
      seller_id: shopId,
      product_no: nextNo,
      name: product.name,
      price: product.price,
      icon: product.icon,
      description: product.description,
      sold_out: false,
      stock: product.stock,
      image_url: product.imageUrl ?? null,
    })
    .then(({ error }) => persistError('createProduct', error));
  return product;
}

// 商品を更新（部分更新）
export function updateProduct(
  shopId: string,
  productNo: number,
  updates: Partial<Omit<Product, 'id'>>,
): void {
  const current = cache.products[shopId] ?? [];
  cache.products = {
    ...cache.products,
    [shopId]: current.map((p) => (p.id === productNo ? { ...p, ...updates } : p)),
  };
  notify('products');
  const patch: Row = {};
  if (updates.name !== undefined) patch.name = updates.name;
  if (updates.price !== undefined) patch.price = updates.price;
  if (updates.icon !== undefined) patch.icon = updates.icon;
  if (updates.description !== undefined) patch.description = updates.description;
  if (updates.soldOut !== undefined) patch.sold_out = updates.soldOut;
  if (updates.stock !== undefined) patch.stock = updates.stock;
  if (updates.imageUrl !== undefined) patch.image_url = updates.imageUrl || null;
  supabase
    .from('products')
    .update(patch)
    .eq('seller_id', shopId)
    .eq('product_no', productNo)
    .then(({ error }) => persistError('updateProduct', error));
}

// SOLD OUT を切り替え（購入者ページ/出店者管理から）
export function setProductSoldOut(shopId: string, productNo: number, soldOut: boolean): void {
  updateProduct(shopId, productNo, { soldOut });
}

// 購入確定で在庫を1減らす。
//  - 在庫管理なし(stock=null) または DB未登録 → 単品想定で即 SOLD OUT
//  - 在庫管理あり → 1減算し、0になったら SOLD OUT
export function decrementStock(
  shopId: string,
  productNo: number,
): { soldOut: boolean; stock: number | null } {
  const list = cache.products[shopId] ?? [];
  const p = list.find((x) => x.id === productNo);
  if (!p || p.stock == null) {
    setProductSoldOut(shopId, productNo, true);
    return { soldOut: true, stock: null };
  }
  const next = Math.max(0, p.stock - 1);
  const soldOut = next === 0;
  updateProduct(shopId, productNo, { stock: next, soldOut });
  return { soldOut, stock: next };
}

// 商品を削除
export function deleteProduct(shopId: string, productNo: number): void {
  const current = cache.products[shopId] ?? [];
  cache.products = { ...cache.products, [shopId]: current.filter((p) => p.id !== productNo) };
  notify('products');
  supabase
    .from('products')
    .delete()
    .eq('seller_id', shopId)
    .eq('product_no', productNo)
    .then(({ error }) => persistError('deleteProduct', error));
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

// 出店料（運営へ支払う固定額）
export const SELLER_FEE_YEN = 1200;

// 出店者が出店料の支払いを「申告」する（method を記録し submitted に）。
export function submitSellerFee(
  eventId: string,
  sellerId: string,
  method: 'bank' | 'paypay',
): void {
  const submittedAt = new Date().toISOString();
  cache.events = cache.events.map((e) =>
    e.id !== eventId
      ? e
      : {
          ...e,
          sellerApplications: e.sellerApplications.map((a) =>
            a.sellerId === sellerId
              ? { ...a, feeStatus: 'submitted', feeMethod: method, feeSubmittedAt: submittedAt }
              : a,
          ),
        },
  );
  notify('events');
  supabase
    .from('seller_applications')
    .update({ fee_status: 'submitted', fee_method: method, fee_submitted_at: submittedAt })
    .eq('event_id', eventId)
    .eq('seller_id', sellerId)
    .then(({ error }) => persistError('submitSellerFee', error));
}

// 運営が入金を確認する（paid に）。取り消し（submitted 戻し）も同関数で可。
export function confirmSellerFee(
  eventId: string,
  sellerId: string,
  paid = true,
): void {
  const paidAt = paid ? new Date().toISOString() : null;
  const nextStatus = paid ? 'paid' : 'submitted';
  cache.events = cache.events.map((e) =>
    e.id !== eventId
      ? e
      : {
          ...e,
          sellerApplications: e.sellerApplications.map((a) =>
            a.sellerId === sellerId
              ? { ...a, feeStatus: nextStatus, feePaidAt: paidAt }
              : a,
          ),
        },
  );
  notify('events');
  supabase
    .from('seller_applications')
    .update({ fee_status: nextStatus, fee_paid_at: paidAt })
    .eq('event_id', eventId)
    .eq('seller_id', sellerId)
    .then(({ error }) => persistError('confirmSellerFee', error));
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

// 出店者(sellerId = profiles.id)の、指定イベントへの申請状況を返す。
// 'none' = 未申請 / それ以外は申請の status（pending / approved / rejected）。
// 募集が定員に達しているか(full)も併せて返し、UIの出し分けに使う。
export function getSellerApplicationStatus(
  eventId: string,
  sellerId: string,
): { status: 'none' | 'pending' | 'approved' | 'rejected'; full: boolean } {
  const event = getAdminEventById(eventId);
  if (!event) return { status: 'none', full: false };
  const approvedCount = event.sellerApplications.filter((a) => a.status === 'approved').length;
  const full = approvedCount >= event.maxSellers;
  const mine = event.sellerApplications.find((a) => a.sellerId === sellerId);
  return { status: mine?.status ?? 'none', full };
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
  if (updates.feeBankInfo !== undefined) patch.fee_bank_info = updates.feeBankInfo;
  if (updates.feePaypayId !== undefined) patch.fee_paypay_id = updates.feePaypayId;
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
// 整理券キュー（queue_tickets テーブル）
// -------------------------------------------------------------
// (event_id, seller_id) ごとの待ち行列をサーバーで共有する。
// 元仕様: 整理券方式 / 順番待ち表示 / 接客開始ボタン / 順番通知。
// =============================================================
export type QueueStatus = 'waiting' | 'serving' | 'done' | 'cancelled';
export type QueueTicket = {
  id: string;
  eventId: string;
  sellerId: string;
  buyerId: string;
  buyerName: string | null;
  status: QueueStatus;
  ticketNo: number;
  createdAt: string;
};

type QueueRow = {
  id: string;
  event_id: string;
  seller_id: string;
  buyer_id: string;
  buyer_name: string | null;
  status: QueueStatus;
  ticket_no: number;
  created_at: string;
  updated_at: string;
};

function rowToTicket(r: QueueRow): QueueTicket {
  return {
    id: r.id,
    eventId: r.event_id,
    sellerId: r.seller_id,
    buyerId: r.buyer_id,
    buyerName: r.buyer_name,
    status: r.status,
    ticketNo: r.ticket_no,
    createdAt: r.created_at,
  };
}

// 行列に並ぶ（冪等: 既にチケットがあれば再利用。done/cancelled は waiting へ復帰）。
export async function joinQueue(
  eventId: string,
  sellerId: string,
  buyerId: string,
  buyerName: string | null,
): Promise<QueueTicket | null> {
  const { data: existing } = await supabase
    .from('queue_tickets')
    .select('*')
    .eq('event_id', eventId)
    .eq('seller_id', sellerId)
    .eq('buyer_id', buyerId)
    .maybeSingle();
  if (existing) {
    const r = existing as QueueRow;
    if (r.status === 'done' || r.status === 'cancelled') {
      const { data: upd } = await supabase
        .from('queue_tickets')
        .update({ status: 'waiting', updated_at: new Date().toISOString() })
        .eq('id', r.id)
        .select()
        .single();
      return upd ? rowToTicket(upd as QueueRow) : rowToTicket({ ...r, status: 'waiting' });
    }
    return rowToTicket(r);
  }
  // 連番採番（その行列の最大 ticket_no + 1）
  const { data: maxRow } = await supabase
    .from('queue_tickets')
    .select('ticket_no')
    .eq('event_id', eventId)
    .eq('seller_id', sellerId)
    .order('ticket_no', { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextNo = ((maxRow as { ticket_no: number } | null)?.ticket_no ?? 0) + 1;
  const { data, error } = await supabase
    .from('queue_tickets')
    .insert({
      event_id: eventId,
      seller_id: sellerId,
      buyer_id: buyerId,
      buyer_name: buyerName,
      status: 'waiting',
      ticket_no: nextNo,
    })
    .select()
    .single();
  if (error) {
    persistError('joinQueue', error);
    return null;
  }
  return rowToTicket(data as QueueRow);
}

// 行列の全チケット（ticket_no 昇順）
export async function getQueueTickets(eventId: string, sellerId: string): Promise<QueueTicket[]> {
  const { data, error } = await supabase
    .from('queue_tickets')
    .select('*')
    .eq('event_id', eventId)
    .eq('seller_id', sellerId)
    .order('ticket_no', { ascending: true });
  if (error) {
    persistError('getQueueTickets', error);
    return [];
  }
  return (data ?? []).map((d) => rowToTicket(d as QueueRow));
}

// 出店者が「次の方」を接客開始: 現在の serving を done にし、先頭の waiting を serving へ。
// serving になった購入者へ順番通知を配信。serving チケットを返す（居なければ null）。
export async function callNextInQueue(
  eventId: string,
  sellerId: string,
  sellerName?: string,
): Promise<QueueTicket | null> {
  const now = new Date().toISOString();
  await supabase
    .from('queue_tickets')
    .update({ status: 'done', updated_at: now })
    .eq('event_id', eventId)
    .eq('seller_id', sellerId)
    .eq('status', 'serving');
  const { data: head } = await supabase
    .from('queue_tickets')
    .select('*')
    .eq('event_id', eventId)
    .eq('seller_id', sellerId)
    .eq('status', 'waiting')
    .order('ticket_no', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!head) return null;
  const r = head as QueueRow;
  const { data: upd, error } = await supabase
    .from('queue_tickets')
    .update({ status: 'serving', updated_at: now })
    .eq('id', r.id)
    .select()
    .single();
  if (error) {
    persistError('callNextInQueue', error);
    return null;
  }
  await createNotification({
    userId: r.buyer_id,
    type: 'turn',
    title: '順番通知',
    message: `${sellerName ?? 'ショップ'} の順番が来ました。チャットを開始できます。`,
    eventId,
    eventName: sellerName,
    dedupeKey: `turn:${eventId}:${sellerId}:${r.buyer_id}:${r.ticket_no}`,
  });
  return rowToTicket(upd as QueueRow);
}

// 自分のチケットを離脱（cancelled）
export async function leaveQueue(
  eventId: string,
  sellerId: string,
  buyerId: string,
): Promise<void> {
  const { error } = await supabase
    .from('queue_tickets')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('event_id', eventId)
    .eq('seller_id', sellerId)
    .eq('buyer_id', buyerId);
  persistError('leaveQueue', error);
}

// 接客終了で自分のチケットを done にする（購入者側のセッション終了から呼ぶ）。
// waiting/serving のみ done 化（既に done/cancelled なら何もしない）。
export async function completeQueueTicket(
  eventId: string,
  sellerId: string,
  buyerId: string,
): Promise<void> {
  const { error } = await supabase
    .from('queue_tickets')
    .update({ status: 'done', updated_at: new Date().toISOString() })
    .eq('event_id', eventId)
    .eq('seller_id', sellerId)
    .eq('buyer_id', buyerId)
    .in('status', ['waiting', 'serving']);
  persistError('completeQueueTicket', error);
}

// 出店者が「接客終了」: 現在 serving の整理券を done にする（次の方は自動で呼ばない）。
// 待機者が居なくても接客を綺麗に締められるようにするための操作。done にした人数を返す。
export async function endServingTicket(
  eventId: string,
  sellerId: string,
): Promise<void> {
  const { error } = await supabase
    .from('queue_tickets')
    .update({ status: 'done', updated_at: new Date().toISOString() })
    .eq('event_id', eventId)
    .eq('seller_id', sellerId)
    .eq('status', 'serving');
  persistError('endServingTicket', error);
}

// 行列の変化を購読（event_id でサーバ絞り込み・seller はクライアント判定）
export function subscribeToQueue(
  eventId: string,
  sellerId: string,
  onChange: () => void,
): () => void {
  const channel = supabase
    .channel(`queue-${eventId}-${sellerId}-${Math.random().toString(36).slice(2, 8)}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'queue_tickets', filter: `event_id=eq.${eventId}` },
      (payload) => {
        const row = (payload.new ?? payload.old) as QueueRow | undefined;
        if (!row || row.seller_id === sellerId) onChange();
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
const PRODUCT_IMAGE_BUCKET = 'product-images';
const AVATAR_BUCKET = 'avatars';

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

// 任意バケットへ単一画像（dataURL）をアップロードし公開URLを返す。失敗時 null。
async function uploadImage(
  dataUrl: string,
  bucket: string,
  pathPrefix: string,
): Promise<string | null> {
  try {
    const { blob, ext } = dataUrlToBlob(dataUrl);
    const path = `${pathPrefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, blob, { contentType: blob.type, upsert: false });
    if (error) {
      persistError(`uploadImage(${bucket})`, error);
      return null;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  } catch (e) {
    persistError(`uploadImage(${bucket}) exception`, e);
    return null;
  }
}

// 単一チャット画像（dataURL）を Storage にアップロードし公開URLを返す。
export async function uploadChatImage(
  dataUrl: string,
  pathPrefix: string,
): Promise<string | null> {
  return uploadImage(dataUrl, CHAT_IMAGE_BUCKET, pathPrefix);
}

// 商品画像（dataURL）を product-images バケットへアップロードし公開URLを返す。
// 失敗時は null（呼び出し側でアイコン表示にフォールバック）。
export async function uploadProductImage(
  dataUrl: string,
  shopId: string,
): Promise<string | null> {
  return uploadImage(dataUrl, PRODUCT_IMAGE_BUCKET, shopId);
}

// プロフィール画像（dataURL）を 'avatars' バケットへアップロードし公開URLを返す。
// ⚠️ 事前にSupabaseで public バケット 'avatars' を作成しておくこと。
export async function uploadAvatar(
  dataUrl: string,
  profileId: string,
): Promise<string | null> {
  return uploadImage(dataUrl, AVATAR_BUCKET, profileId);
}

// profiles.avatar_url を更新（アップロード済みの公開URLを保存）。
export async function updateProfileAvatar(
  profileId: string,
  avatarUrl: string | null,
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', profileId);
  persistError('updateProfileAvatar', error);
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

// =============================================================
// 通知（開催通知 / OPEN通知 / 順番通知 など）
// -------------------------------------------------------------
// notifications テーブル + Realtime。NotificationContext がこれを使う。
// サーバー側（Cron）からの一斉配信は eventAutomation.ts が service_role
// で行う（RLSバイパス）。クライアントは自分宛ての通知のみ作成/既読できる。
// =============================================================
export type AppNotificationType =
  | 'open'
  | 'event_start'
  | 'turn'
  | 'follow'
  | 'like'
  | 'info';

export type AppNotification = {
  id: string;
  userId: string;
  type: AppNotificationType;
  title: string;
  message: string;
  eventId?: string;
  eventName?: string;
  read: boolean;
  createdAt: string;
};

function rowToNotification(r: Row): AppNotification {
  return {
    id: r.id,
    userId: r.user_id,
    type: (r.type ?? 'info') as AppNotificationType,
    title: r.title,
    message: r.message ?? '',
    eventId: r.event_id ?? undefined,
    eventName: r.event_name ?? undefined,
    read: r.read ?? false,
    createdAt: r.created_at,
  };
}

// 受信者の通知を新しい順に取得（直近100件）
export async function fetchNotifications(userId: string): Promise<AppNotification[]> {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) {
    persistError('fetchNotifications', error);
    return [];
  }
  return (data ?? []).map(rowToNotification);
}

// 自分宛て通知を1件作成（follow/like や順番通知の自己記録などクライアント発火用）
export async function createNotification(args: {
  userId: string;
  type: AppNotificationType;
  title: string;
  message?: string;
  eventId?: string;
  eventName?: string;
  dedupeKey?: string;
}): Promise<AppNotification | null> {
  if (!args.userId) return null;
  const payload = {
    user_id: args.userId,
    type: args.type,
    title: args.title,
    message: args.message ?? '',
    event_id: args.eventId ?? null,
    event_name: args.eventName ?? null,
    dedupe_key: args.dedupeKey ?? null,
  };
  // dedupeKey 指定時は重複を無視（冪等）。それ以外は通常INSERT。
  const query = args.dedupeKey
    ? supabase
        .from('notifications')
        .upsert(payload, { onConflict: 'user_id,dedupe_key', ignoreDuplicates: true })
        .select()
        .maybeSingle()
    : supabase.from('notifications').insert(payload).select().single();
  const { data, error } = await query;
  if (error) {
    persistError('createNotification', error);
    return null;
  }
  return data ? rowToNotification(data as Row) : null;
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
  persistError('markNotificationRead', error);
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  if (!userId) return;
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);
  persistError('markAllNotificationsRead', error);
}

export async function deleteNotification(id: string): Promise<void> {
  const { error } = await supabase.from('notifications').delete().eq('id', id);
  persistError('deleteNotification', error);
}

export async function clearNotifications(userId: string): Promise<void> {
  if (!userId) return;
  const { error } = await supabase.from('notifications').delete().eq('user_id', userId);
  persistError('clearNotifications', error);
}

// 受信者の通知を購読（自分宛ての INSERT / UPDATE / DELETE を受信）。
// 変更があるたび onChange を呼ぶ（呼び出し側で再取得 or 受信行で更新）。
export function subscribeToNotifications(
  userId: string,
  onChange: (change: { eventType: string; row: AppNotification | null; oldId?: string }) => void,
): () => void {
  if (!userId) return () => {};
  const channel = supabase
    .channel(`notifications-${userId}-${Math.random().toString(36).slice(2, 8)}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const newRow = payload.new && Object.keys(payload.new).length
          ? rowToNotification(payload.new as Row)
          : null;
        const oldId = (payload.old as Row | undefined)?.id as string | undefined;
        onChange({ eventType: payload.eventType, row: newRow, oldId });
      },
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

// 開発用リセットは Supabase 版では非対応（DBはダッシュボードで管理）
export function resetMockStore(): void {
  console.warn('[supabaseStore] resetMockStore は Supabase 版では無効です。');
}
