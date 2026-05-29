-- =============================================================
-- フリマライブ  初期スキーマ  (0001_init.sql)
-- =============================================================
-- 設計方針:
--   * 既存コード(mockStore.ts / events.ts)の文字列IDをそのまま使えるよう
--     ドメインテーブルは text 主キーを採用 → UI 側の書き換えを最小化。
--   * profiles.id は Supabase Auth の uid(uuid) を文字列として格納する想定。
--     （シードのデモユーザーは 'admin-1' 等の文字列IDをそのまま使用）
--   * このファイルは「まず動かす」ための開発用RLS(anonフルアクセス)を含む。
--     本番では必ず 0002_production_rls.sql を適用して締めること。
-- =============================================================

-- updated_at 自動更新トリガー用の関数
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- -------------------------------------------------------------
-- profiles  (MockUser / 会員・権限)
-- -------------------------------------------------------------
create table if not exists public.profiles (
  id          text primary key,                       -- auth.uid()::text もしくはデモID
  name        text not null,
  email       text unique,
  role        text not null default 'buyer'
              check (role in ('admin','event_manager','seller','buyer')),
  created_at  timestamptz not null default now()
);

-- -------------------------------------------------------------
-- sellers  (店舗マスタ / events.ts Seller)
-- -------------------------------------------------------------
create table if not exists public.sellers (
  id          text primary key,                       -- 'mina-craft' 等
  name        text not null,
  region      text not null,
  category    text not null default '',
  tags        text[] not null default '{}',
  description text not null default '',
  icon        text not null default 'package',
  rating      numeric(2,1) not null default 0,
  followers   int not null default 0,
  created_at  timestamptz not null default now()
);

-- -------------------------------------------------------------
-- products  (商品 / events.ts Product, 店舗ごと)
-- -------------------------------------------------------------
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  seller_id   text not null references public.sellers(id) on delete cascade,
  product_no  int  not null,                          -- 店舗内の表示用連番(UIのid)
  name        text not null,
  price       int  not null,
  icon        text not null default 'package',
  description text not null default '',
  sold_out    boolean not null default false,         -- SOLD OUT表示
  created_at  timestamptz not null default now(),
  unique (seller_id, product_no)
);
create index if not exists idx_products_seller on public.products(seller_id);

-- -------------------------------------------------------------
-- admin_events  (管理部が作成するイベント / AdminEvent)
-- -------------------------------------------------------------
create table if not exists public.admin_events (
  id           text primary key,                      -- 'evt-001' 等
  date         date not null,
  start_time   text not null,                         -- 'HH:mm'
  end_time     text not null,
  region       text not null,
  title        text not null,
  description  text not null default '',
  max_sellers  int  not null default 5,
  max_buyers   int  not null default 100,
  status       text not null default 'recruiting'
               check (status in ('recruiting','seller_closed','live','ended','cancelled')),
  manager_id   text,
  manager_name text,
  created_at   timestamptz not null default now()
);
create index if not exists idx_admin_events_date   on public.admin_events(date);
create index if not exists idx_admin_events_status on public.admin_events(status);

-- -------------------------------------------------------------
-- seller_applications  (出店申請・承認フロー / 旧ネスト配列を正規化)
-- -------------------------------------------------------------
create table if not exists public.seller_applications (
  id          uuid primary key default gen_random_uuid(),
  event_id    text not null references public.admin_events(id) on delete cascade,
  seller_id   text not null,
  seller_name text not null,
  status      text not null default 'pending'
              check (status in ('pending','approved','rejected')),
  applied_at  timestamptz not null default now(),
  unique (event_id, seller_id)
);
create index if not exists idx_seller_apps_event on public.seller_applications(event_id);

-- -------------------------------------------------------------
-- buyer_reservations  (来場予約 / 旧 buyerReservations 配列を正規化)
-- -------------------------------------------------------------
create table if not exists public.buyer_reservations (
  id         uuid primary key default gen_random_uuid(),
  event_id   text not null references public.admin_events(id) on delete cascade,
  buyer_id   text not null,
  created_at timestamptz not null default now(),
  unique (event_id, buyer_id)
);
create index if not exists idx_buyer_res_event on public.buyer_reservations(event_id);

-- -------------------------------------------------------------
-- chat_settings  (チャット設定 / シングルトン)
-- -------------------------------------------------------------
create table if not exists public.chat_settings (
  id                       int primary key default 1 check (id = 1),
  session_duration_seconds int not null default 600,
  max_image_size_mb        int not null default 2,
  max_images_per_message   int not null default 5,
  auto_close_on_timeout    boolean not null default true,
  allow_re_request         boolean not null default true,
  updated_at               timestamptz not null default now()
);
drop trigger if exists trg_chat_settings_updated on public.chat_settings;
create trigger trg_chat_settings_updated before update on public.chat_settings
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------------
-- active_sessions  (⑥ 進行中の1対1接客 / 購入者は同時1セッションのみ)
-- -------------------------------------------------------------
create table if not exists public.active_sessions (
  id         uuid primary key default gen_random_uuid(),
  buyer_id   text not null,
  event_id   text not null,
  seller_id  text not null,
  started_at timestamptz not null default now(),
  unique (buyer_id, event_id)                         -- ⑥ ロック: 同イベント内で1件のみ
);
create index if not exists idx_active_sessions_event on public.active_sessions(event_id);

-- -------------------------------------------------------------
-- transactions  (① 取引履歴 + ② 相互評価, 7日間閲覧)
-- -------------------------------------------------------------
create table if not exists public.transactions (
  id            text primary key,                     -- 'txn-...'
  event_id      text not null,
  event_title   text not null,
  seller_id     text not null,
  seller_name   text not null,
  buyer_id      text not null,
  buyer_name    text not null,
  product_name  text not null,
  product_price int  not null,
  purchased_at  timestamptz not null default now(),
  expires_at    timestamptz not null,                 -- 閲覧期限(イベント終了+7日)
  chat_open     boolean not null default false,        -- 継続会話中(発送・住所連絡)。true なら7日期限の対象外
  messages      jsonb not null default '[]'::jsonb,    -- TransactionMessage[] のスナップショット
  buyer_review  jsonb,                                 -- {rating, comment, createdAt}
  seller_review jsonb,
  created_at    timestamptz not null default now()
);
create index if not exists idx_txn_buyer   on public.transactions(buyer_id);
create index if not exists idx_txn_seller  on public.transactions(seller_id);
create index if not exists idx_txn_expires on public.transactions(expires_at);

-- -------------------------------------------------------------
-- messages  (リアルタイムチャット: 全体 + 個別)
--   seller_id NULL = 全体チャット / seller_id+buyer_id = 個別チャット
-- -------------------------------------------------------------
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  event_id    text not null,
  seller_id   text,                                   -- NULL なら全体チャット
  buyer_id    text,                                   -- 個別チャットの購入者
  sender_role text not null check (sender_role in ('buyer','seller','system')),
  sender_id   text,
  sender_name text,
  text        text not null default '',
  images      text[] not null default '{}',
  created_at  timestamptz not null default now()
);
create index if not exists idx_messages_room
  on public.messages(event_id, seller_id, buyer_id, created_at);

-- =============================================================
-- Realtime: 変更を購読したいテーブルを publication に追加
-- =============================================================
do $$
begin
  alter publication supabase_realtime add table
    public.admin_events,
    public.seller_applications,
    public.buyer_reservations,
    public.active_sessions,
    public.transactions,
    public.messages,
    public.products,
    public.chat_settings;
exception when duplicate_object then
  null; -- 既に追加済みなら無視
end $$;

-- =============================================================
-- ⚠️ 開発用 RLS（anon フルアクセス）
-- -------------------------------------------------------------
-- 認証(Supabase Auth)を組み込むまでの「まず動かす」用ポリシー。
-- 本番公開前に必ず 0002_production_rls.sql を適用して締めること。
-- =============================================================
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','sellers','products','admin_events','seller_applications',
    'buyer_reservations','chat_settings','active_sessions','transactions','messages'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists dev_all on public.%I;', t);
    execute format(
      'create policy dev_all on public.%I for all to anon, authenticated using (true) with check (true);', t);
  end loop;
end $$;
