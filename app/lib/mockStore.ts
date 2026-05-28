'use client';

// =============================================
// モックデータストア（localStorage永続化）
// Supabase接続時はこのファイルのCRUD関数を差し替えるだけ
// =============================================

import { ProductIconType } from '../components/Icons';

// ---------- 型定義 ----------

export type AdminEventStatus = 'recruiting' | 'seller_closed' | 'live' | 'ended' | 'cancelled';
export type SellerApplicationStatus = 'pending' | 'approved' | 'rejected';

// 管理部が作成するイベント
export type AdminEvent = {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  region: string;
  title: string;
  description: string;
  maxSellers: number; // ⑤ 出店者上限
  maxBuyers: number; // ⑤ 来場者上限
  status: AdminEventStatus; // ② OPEN/CLOSE管理
  managerId: string; // ④ イベント管理者
  managerName: string;
  createdAt: string;
  // 申請中・承認済み出店者
  sellerApplications: SellerApplication[];
  // 来場者予約
  buyerReservations: string[]; // buyerId[]
};

export type SellerApplication = {
  sellerId: string;
  sellerName: string;
  status: SellerApplicationStatus; // ④ 承認フロー
  appliedAt: string;
};

// ④ ユーザー権限
export type UserRole = 'admin' | 'event_manager' | 'seller' | 'buyer';
export type MockUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

// ⑧⑨ チャット設定（管理者が制御）
export type ChatSettings = {
  sessionDurationSeconds: number; // ⑨ デフォルト接客時間（秒）
  maxImageSizeMB: number; // ⑧ 画像サイズ上限
  maxImagesPerMessage: number; // ⑧ メッセージあたり画像枚数
  autoCloseOnTimeout: boolean; // ⑨ 時間切れ自動退出
  allowReRequest: boolean; // ⑨ 再リクエスト許可
};

// ---------- デフォルト値 ----------

const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  sessionDurationSeconds: 600, // 10分
  maxImageSizeMB: 2,
  maxImagesPerMessage: 5,
  autoCloseOnTimeout: true,
  allowReRequest: true,
};

const DEFAULT_USERS: MockUser[] = [
  { id: 'admin-1', name: '運営管理者', email: 'admin@furima.jp', role: 'admin' },
  { id: 'mgr-1', name: '田中マネージャー', email: 'tanaka@furima.jp', role: 'event_manager' },
  { id: 'mgr-2', name: '佐藤マネージャー', email: 'sato@furima.jp', role: 'event_manager' },
  { id: 'seller-mina', name: 'mina.craft', email: 'mina@example.com', role: 'seller' },
  { id: 'seller-kyoto', name: 'kyoto.vintage', email: 'kyoto@example.com', role: 'seller' },
  { id: 'seller-osaka', name: 'osaka.antique', email: 'osaka@example.com', role: 'seller' },
  { id: 'buyer-1', name: '山田太郎', email: 'yamada@example.com', role: 'buyer' },
];

const DEFAULT_ADMIN_EVENTS: AdminEvent[] = [
  {
    id: 'evt-001',
    date: '2026-06-01',
    startTime: '20:00',
    endTime: '22:00',
    region: '滋賀',
    title: '【滋賀】夜のハンドメイドフリマ',
    description: '滋賀エリアの作家さんが集まるハンドメイドイベントです。',
    maxSellers: 5,
    maxBuyers: 100,
    status: 'recruiting',
    managerId: 'mgr-1',
    managerName: '田中マネージャー',
    createdAt: '2026-05-25T10:00:00Z',
    sellerApplications: [
      { sellerId: 'seller-mina', sellerName: 'mina.craft', status: 'approved', appliedAt: '2026-05-26T09:00:00Z' },
      { sellerId: 'seller-kyoto', sellerName: 'kyoto.vintage', status: 'pending', appliedAt: '2026-05-27T14:00:00Z' },
    ],
    buyerReservations: ['buyer-1'],
  },
  {
    id: 'evt-002',
    date: '2026-06-02',
    startTime: '21:00',
    endTime: '23:00',
    region: '大阪',
    title: '【大阪】古着＆ヴィンテージ市',
    description: '大阪の古着・アンティーク好き集まれ！',
    maxSellers: 3,
    maxBuyers: 50,
    status: 'recruiting',
    managerId: 'mgr-2',
    managerName: '佐藤マネージャー',
    createdAt: '2026-05-26T11:00:00Z',
    sellerApplications: [
      { sellerId: 'seller-osaka', sellerName: 'osaka.antique', status: 'pending', appliedAt: '2026-05-27T16:00:00Z' },
    ],
    buyerReservations: [],
  },
];

// ---------- localStorage キー ----------
const KEYS = {
  events: 'furima_admin_events',
  users: 'furima_users',
  chatSettings: 'furima_chat_settings',
  activeSessions: 'furima_active_sessions', // ⑥ 進行中セッション
  transactions: 'furima_transactions', // ① 取引履歴
};

// ---------- ヘルパー（SSR安全） ----------
function isBrowser() {
  return typeof window !== 'undefined';
}

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // 同タブ内の他コンポーネントに通知
    window.dispatchEvent(new CustomEvent('furima-store-update', { detail: { key } }));
  } catch {
    // ignore
  }
}

// =============================================
// イベント管理（②④⑤）
// =============================================

export function getAdminEvents(): AdminEvent[] {
  return read<AdminEvent[]>(KEYS.events, DEFAULT_ADMIN_EVENTS);
}

export function getAdminEventById(id: string): AdminEvent | undefined {
  return getAdminEvents().find((e) => e.id === id);
}

export function createAdminEvent(event: Omit<AdminEvent, 'id' | 'createdAt' | 'sellerApplications' | 'buyerReservations'>): AdminEvent {
  const events = getAdminEvents();
  const newEvent: AdminEvent = {
    ...event,
    id: `evt-${Date.now()}`,
    createdAt: new Date().toISOString(),
    sellerApplications: [],
    buyerReservations: [],
  };
  write(KEYS.events, [newEvent, ...events]);
  return newEvent;
}

export function updateAdminEvent(id: string, updates: Partial<AdminEvent>): void {
  const events = getAdminEvents();
  write(KEYS.events, events.map((e) => (e.id === id ? { ...e, ...updates } : e)));
}

export function deleteAdminEvent(id: string): void {
  write(KEYS.events, getAdminEvents().filter((e) => e.id !== id));
}

// ② OPEN/CLOSE切替
export function setEventStatus(id: string, status: AdminEventStatus): void {
  updateAdminEvent(id, { status });
}

// ④ 出店者申請の承認/却下
export function updateSellerApplication(eventId: string, sellerId: string, status: SellerApplicationStatus): void {
  const events = getAdminEvents();
  write(
    KEYS.events,
    events.map((e) => {
      if (e.id !== eventId) return e;
      return {
        ...e,
        sellerApplications: e.sellerApplications.map((a) =>
          a.sellerId === sellerId ? { ...a, status } : a
        ),
      };
    })
  );
}

// 出店者の参加申請（出店者側から）
export function applyAsSeller(eventId: string, sellerId: string, sellerName: string): { ok: boolean; message: string } {
  const event = getAdminEventById(eventId);
  if (!event) return { ok: false, message: 'イベントが見つかりません' };

  // ⑤ 出店者上限チェック（承認済みの数で判定）
  const approvedCount = event.sellerApplications.filter((a) => a.status === 'approved').length;
  if (approvedCount >= event.maxSellers) {
    return { ok: false, message: '出店者の募集は終了しました（定員に達しました）' };
  }
  // 重複チェック
  if (event.sellerApplications.some((a) => a.sellerId === sellerId)) {
    return { ok: false, message: 'すでに申請済みです' };
  }

  updateAdminEvent(eventId, {
    sellerApplications: [
      ...event.sellerApplications,
      { sellerId, sellerName, status: 'pending', appliedAt: new Date().toISOString() },
    ],
  });
  return { ok: true, message: '参加申請を送信しました（承認待ち）' };
}

// ⑤ 来場者予約（上限チェック付き）
export function reserveAsBuyer(eventId: string, buyerId: string): { ok: boolean; message: string } {
  const event = getAdminEventById(eventId);
  if (!event) return { ok: false, message: 'イベントが見つかりません' };

  if (event.buyerReservations.length >= event.maxBuyers) {
    return { ok: false, message: '来場予約は満員です' };
  }
  if (event.buyerReservations.includes(buyerId)) {
    return { ok: false, message: 'すでに予約済みです' };
  }

  updateAdminEvent(eventId, {
    buyerReservations: [...event.buyerReservations, buyerId],
  });
  return { ok: true, message: '来場予約が完了しました' };
}

// =============================================
// ユーザー・権限管理（④）
// =============================================

export function getUsers(): MockUser[] {
  return read<MockUser[]>(KEYS.users, DEFAULT_USERS);
}

export function updateUserRole(userId: string, role: UserRole): void {
  const users = getUsers();
  write(KEYS.users, users.map((u) => (u.id === userId ? { ...u, role } : u)));
}

export function getEventManagers(): MockUser[] {
  return getUsers().filter((u) => u.role === 'event_manager' || u.role === 'admin');
}

// =============================================
// チャット設定（⑧⑨）
// =============================================

export function getChatSettings(): ChatSettings {
  return read<ChatSettings>(KEYS.chatSettings, DEFAULT_CHAT_SETTINGS);
}

export function updateChatSettings(updates: Partial<ChatSettings>): void {
  write(KEYS.chatSettings, { ...getChatSettings(), ...updates });
}

// =============================================
// ⑥ 進行中セッション管理（複数出店者の順序制御）
// =============================================

export type ActiveSession = {
  buyerId: string;
  eventId: string;
  sellerId: string;
  startedAt: string;
};

export function getActiveSessions(): ActiveSession[] {
  return read<ActiveSession[]>(KEYS.activeSessions, []);
}

// 購入者が進行中のセッションを持っているか
export function getBuyerActiveSession(buyerId: string, eventId: string): ActiveSession | undefined {
  return getActiveSessions().find((s) => s.buyerId === buyerId && s.eventId === eventId);
}

// ⑥ 接客開始（ロック取得）
export function startSession(buyerId: string, eventId: string, sellerId: string): { ok: boolean; message: string } {
  const existing = getBuyerActiveSession(buyerId, eventId);
  if (existing && existing.sellerId !== sellerId) {
    return { ok: false, message: '別の出店者との接客が進行中です。先に終了してください。' };
  }
  const sessions = getActiveSessions().filter((s) => !(s.buyerId === buyerId && s.eventId === eventId));
  write(KEYS.activeSessions, [...sessions, { buyerId, eventId, sellerId, startedAt: new Date().toISOString() }]);
  return { ok: true, message: '接客を開始しました' };
}

// ⑥ 接客終了（ロック解除）
export function endSession(buyerId: string, eventId: string): void {
  const sessions = getActiveSessions().filter((s) => !(s.buyerId === buyerId && s.eventId === eventId));
  write(KEYS.activeSessions, sessions);
}

// ⑥ 予約可能か判定（他の出店者と接客中でないか）
export function canReserveSeller(buyerId: string, eventId: string, sellerId: string): { ok: boolean; message: string } {
  const active = getBuyerActiveSession(buyerId, eventId);
  if (active && active.sellerId !== sellerId) {
    return { ok: false, message: '現在ほかの出店者と接客中です。終了後に予約できます。' };
  }
  return { ok: true, message: '' };
}

// =============================================
// ① 取引履歴 & ② 評価
// =============================================

export type TransactionMessage = {
  text: string;
  sender: 'buyer' | 'seller';
  timestamp: string;
  images?: string[];
};

export type Review = {
  rating: number; // 1-5
  comment: string;
  createdAt: string;
};

export type Transaction = {
  id: string;
  eventId: string;
  eventTitle: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  productName: string;
  productPrice: number;
  purchasedAt: string;
  // ① チャット履歴（7日間閲覧可能）
  messages: TransactionMessage[];
  expiresAt: string; // 閲覧期限（イベント終了 + 7日）
  // ② 相互評価
  buyerReview?: Review; // 購入者→出店者の評価
  sellerReview?: Review; // 出店者→購入者の評価
};

const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn-demo-1',
    eventId: '2000-shiga',
    eventTitle: '【滋賀】夜のハンドメイドフリマ',
    sellerId: 'mina-craft',
    sellerName: 'mina.craft',
    buyerId: 'buyer-1',
    buyerName: '山田太郎',
    productName: '天然石ネックレス',
    productPrice: 4500,
    purchasedAt: new Date(Date.now() - 2 * 86400000).toISOString(), // 2日前
    messages: [
      { text: '「天然石ネックレス」について教えてください！', sender: 'buyer', timestamp: '20:05' },
      { text: '「天然石ネックレス」ですね！アメジストの天然石を使用。¥4,500でいかがでしょうか？', sender: 'seller', timestamp: '20:06' },
      { text: '素敵です！購入します', sender: 'buyer', timestamp: '20:08' },
      { text: 'ありがとうございます！発送先を教えてください', sender: 'seller', timestamp: '20:09' },
    ],
    expiresAt: new Date(Date.now() + 5 * 86400000).toISOString(), // あと5日
  },
];

function purgeExpired(list: Transaction[]): Transaction[] {
  const now = Date.now();
  return list.filter((t) => new Date(t.expiresAt).getTime() > now);
}

export function getTransactions(): Transaction[] {
  return purgeExpired(read<Transaction[]>(KEYS.transactions, DEFAULT_TRANSACTIONS));
}

// 購入者の取引履歴
export function getBuyerTransactions(buyerId: string): Transaction[] {
  return getTransactions().filter((t) => t.buyerId === buyerId);
}

// 出店者の取引履歴
export function getSellerTransactions(sellerId: string): Transaction[] {
  return getTransactions().filter((t) => t.sellerId === sellerId);
}

export function getTransactionById(id: string): Transaction | undefined {
  return getTransactions().find((t) => t.id === id);
}

// ① 取引を記録（購入完了時）
export function createTransaction(data: Omit<Transaction, 'id' | 'purchasedAt' | 'expiresAt'>): Transaction {
  const transactions = getTransactions();
  const txn: Transaction = {
    ...data,
    id: `txn-${Date.now()}`,
    purchasedAt: new Date().toISOString(),
    // イベント終了後7日間（簡易的に購入から7日）
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
  };
  write(KEYS.transactions, [txn, ...transactions]);
  return txn;
}

// ② 購入者が出店者を評価
export function submitBuyerReview(transactionId: string, review: Review): void {
  const transactions = getTransactions();
  write(
    KEYS.transactions,
    transactions.map((t) => (t.id === transactionId ? { ...t, buyerReview: review } : t))
  );
}

// ② 出店者が購入者を評価
export function submitSellerReview(transactionId: string, review: Review): void {
  const transactions = getTransactions();
  write(
    KEYS.transactions,
    transactions.map((t) => (t.id === transactionId ? { ...t, sellerReview: review } : t))
  );
}

// 出店者の平均評価を計算
export function getSellerAverageRating(sellerId: string): { average: number; count: number } {
  const reviews = getTransactions()
    .filter((t) => t.sellerId === sellerId && t.buyerReview)
    .map((t) => t.buyerReview!.rating);
  if (reviews.length === 0) return { average: 0, count: 0 };
  return {
    average: reviews.reduce((a, b) => a + b, 0) / reviews.length,
    count: reviews.length,
  };
}

// 残り閲覧日数
export function getRemainingDays(expiresAt: string): number {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

// =============================================
// リセット（開発用）
// =============================================
export function resetMockStore(): void {
  if (!isBrowser()) return;
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  window.dispatchEvent(new CustomEvent('furima-store-update', { detail: { key: 'all' } }));
}

// 現在のモックユーザー（買い手）— ⑥のデモ用に固定
export const CURRENT_MOCK_BUYER_ID = 'buyer-1';

