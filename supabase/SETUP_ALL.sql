-- =============================================================
-- フリマライブ  ワンショット・セットアップ SQL  (SETUP_ALL.sql)
-- =============================================================
-- これ1ファイルを Supabase の SQL Editor に貼り付けて「Run」するだけで、
-- 本番稼働に必要なテーブル・インデックス・Realtime・初期データが揃います。
-- すべて冪等（create ... if not exists / on conflict do nothing）なので、
-- 何度実行しても安全です。
--
-- 含まれる内容（実行順）:
--   1) 0001_init           … 全テーブル + インデックス + Realtime + 開発用RLS
--   2) 0003_notifications  … 通知テーブル（ベル/ドロワーの実データ）
--   3) 0004_products_stock … products に stock 列
--   4) 0005_products_image … products に image_url 列
--   5) seed                … 初期データ（出店者/商品/イベント/取引サンプル）
--   6) 0006_queue          … 整理券キュー（待機室の順番をサーバーで共有）
--   7) 0007_profiles_avatar … profiles に avatar_url 列（プロフィール画像）
--
-- ※ 本番のRLS厳格化（0002_production_rls.sql）は別途・認証が安定してから実行。
-- ※ Storage バケット（chat-images / product-images / avatars）はSQLでは作れません。
--    Storage → New bucket → Public で3つ作成してください。
-- =============================================================


-- ========== [1/5] 0001_init.sql ==========
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

-- ========== [2/5] 0003_notifications.sql ==========
-- =============================================================
-- フリマライブ  通知テーブル  (0003_notifications.sql)
-- =============================================================
-- 元仕様: 開催通知 / OPEN通知 / 順番通知 を会員ごとに配信する。
-- これまで NotificationContext はUI内のモックのみだったが、本テーブル +
-- Supabase Realtime により「実際に届く・複数端末で同期する」通知へ移行する。
--
-- 冪等配信:
--   Cron（5分毎）から繰り返し呼ばれても重複しないよう dedupe_key を持つ。
--   例) 'open:evt-001' / 'reminder:evt-001' / 'turn:evt-001:mina-craft'
--   user_id + dedupe_key で一意。インサートは upsert(onConflict, ignore) で行う。
--
-- このファイルは 0001 と同様「まず動かす」用の dev_all を含む。
-- 本番では 0002 末尾の notifications ポリシー（own-rows）に締めること。
-- =============================================================

create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,                          -- 受信者(profiles.id)
  type        text not null default 'info'
              check (type in ('open','event_start','turn','follow','like','info')),
  title       text not null,
  message     text not null default '',
  event_id    text,                                   -- 関連イベント(任意)
  event_name  text,                                   -- 表示用ラベル(任意)
  dedupe_key  text,                                   -- 冪等配信キー(任意)
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists idx_notifications_user
  on public.notifications(user_id, created_at desc);

-- 冪等配信: 同一ユーザーへの同一イベント通知は1件だけ
create unique index if not exists uq_notifications_dedupe
  on public.notifications(user_id, dedupe_key)
  where dedupe_key is not null;

-- Realtime: 受信者ごとの新着を購読
do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then
  null;
end $$;

-- ---------- 開発用 RLS（anon フルアクセス・0001 と同方針） ----------
alter table public.notifications enable row level security;
drop policy if exists dev_all on public.notifications;
create policy dev_all on public.notifications
  for all to anon, authenticated using (true) with check (true);

-- ========== [3/5] 0004_products_stock.sql ==========
-- =============================================================
-- フリマライブ  商品の在庫カラム追加  (0004_products_stock.sql)
-- =============================================================
-- 元仕様(出店者機能): 在庫管理 / SOLD OUT表示。
-- products には sold_out(boolean) は既にあるが、数量管理用の stock が無い。
-- stock を nullable で追加（null = 在庫数を管理しない＝個数無制限の意）。
-- 在庫表示・出店者の在庫編集に用いる。冪等。
-- =============================================================

alter table public.products
  add column if not exists stock int;

-- 既存行の在庫は未管理(null)のまま。必要なら個別に設定する。

-- ========== [4/5] 0005_products_image.sql ==========
-- =============================================================
-- フリマライブ  商品画像URL追加  (0005_products_image.sql)
-- =============================================================
-- 元仕様(出店者機能): 商品画像登録。
-- これまで商品はアイコン(icon)のみだった。Supabase Storage にアップした
-- 画像の公開URLを image_url に保持する（null=アイコン表示にフォールバック）。
-- 画像本体は public バケット 'product-images' に保存（要事前作成）。冪等。
-- =============================================================

alter table public.products
  add column if not exists image_url text;

-- ========== [5/5] seed.sql ==========
-- =============================================================
-- フリマライブ  シードデータ  (seed.sql)
-- events.ts の店舗・商品マスタ + mockStore.ts のデフォルト値を投入。
-- 何度流しても安全（ON CONFLICT DO NOTHING / 冪等）。
-- =============================================================

-- ---------- profiles (DEFAULT_USERS) ----------
insert into public.profiles (id, name, email, role) values
  ('admin-1',     '運営管理者',        'admin@furima.jp',   'admin'),
  ('mgr-1',       '田中マネージャー',  'tanaka@furima.jp',  'event_manager'),
  ('mgr-2',       '佐藤マネージャー',  'sato@furima.jp',    'event_manager'),
  ('seller-mina', 'mina.craft',        'mina@example.com',  'seller'),
  ('seller-kyoto','kyoto.vintage',     'kyoto@example.com', 'seller'),
  ('seller-osaka','osaka.antique',     'osaka@example.com', 'seller'),
  ('buyer-1',     '山田太郎',          'yamada@example.com','buyer'),
  ('demo-buyer-2','佐々木花子',        'sasaki@example.com','buyer'),
  ('demo-buyer-3','鈴木一郎',          'suzuki@example.com','buyer')
on conflict (id) do nothing;

-- ---------- sellers (店舗マスタ) ----------
insert into public.sellers (id, name, region, category, tags, description, icon, rating, followers) values
  ('mina-craft','mina.craft','滋賀','ハンドメイド',
   array['ハンドメイド','アクセ','レジン'],
   '滋賀発のハンドメイドアクセサリーショップ。レジン樹脂や天然石を使った一点物アイテムを取り扱っています。',
   'diamond',4.8,542),
  ('kyoto-vintage','kyoto.vintage','京都','古着',
   array['古着','レトロ','ヴィンテージ'],
   '京都の古着セレクトショップ。70-90年代のレトロアイテムを中心に取り扱っています。',
   'shirt',4.6,321),
  ('osaka-antique','osaka.antique','大阪','雑貨',
   array['雑貨','骨董','アンティーク'],
   '大阪の骨董雑貨ショップ。アンティーク食器や雑貨を中心に取り扱っています。',
   'package',4.9,678),
  ('fukuoka-handmade','fukuoka.handmade','福岡','ハンドメイド',
   array['ハンドメイド','バッグ','革製品'],
   '福岡発のレザークラフトショップ。天然素材を使った温かみのある作品を取り扱っています。',
   'bag',4.7,456),
  ('hokkaido-craft','hokkaido.craft','北海道','雑貨・工芸品',
   array['アイヌ工芸','木工','刺繍'],
   '北海道発の伝統工芸品。アイヌ文様を取り入れた現代的な作品を展開しています。',
   'sparkles',4.9,812)
on conflict (id) do nothing;

-- ---------- products ----------
insert into public.products (seller_id, product_no, name, price, icon, description) values
  -- mina.craft
  ('mina-craft',1,'レジン樹脂ピアス',2800,'jewelry','透明感が美しいレジンの一点物'),
  ('mina-craft',2,'天然石ネックレス',4500,'necklace','アメジストの天然石を使用'),
  ('mina-craft',3,'ハンドメイドリング',3200,'ring','シルバー925製の手作りリング'),
  ('mina-craft',4,'ガラスチャーム',1800,'sparkles','カラフルなガラス玉のチャーム'),
  ('mina-craft',5,'シルバーブレス',6500,'diamond','スターリングシルバー使用'),
  ('mina-craft',6,'ドライフラワーピアス',3000,'sparkles','本物のお花を閉じ込めたピアス'),
  ('mina-craft',7,'パールイヤリング',3800,'jewelry','淡水パールの上品なイヤリング'),
  ('mina-craft',8,'レジンキーホルダー',1500,'sparkles','海をイメージしたブルーレジン'),
  ('mina-craft',9,'天然石ブレスレット',4200,'diamond','ローズクォーツのブレスレット'),
  ('mina-craft',10,'ビーズアンクレット',2200,'necklace','夏にぴったりのアンクレット'),
  -- kyoto.vintage
  ('kyoto-vintage',1,'ヴィンテージワンピ',8800,'shirt','70年代のフラワー柄'),
  ('kyoto-vintage',2,'レトロブラウス',4500,'shirt','パフスリーブが可愛い'),
  ('kyoto-vintage',3,'80sジャケット',12000,'shirt','デニム×レザー'),
  ('kyoto-vintage',4,'ハイウエストスカート',5600,'shirt','プリーツデザイン'),
  ('kyoto-vintage',5,'レトロデニム',6500,'shirt','リーバイス501'),
  -- osaka.antique
  ('osaka-antique',1,'アンティーク食器セット',3800,'food','昭和初期のレトロ柄'),
  ('osaka-antique',2,'ヴィンテージランプ',12000,'package','ステンドグラス'),
  ('osaka-antique',3,'骨董花瓶',8500,'package','九谷焼の一輪挿し'),
  ('osaka-antique',4,'レトロ柱時計',6500,'package','振り子付き動作品'),
  ('osaka-antique',5,'アンティーク手鏡',9800,'sparkles','銀メッキ装飾'),
  -- fukuoka.handmade
  ('fukuoka-handmade',1,'ヌメ革トートバッグ',15000,'bag','手染めヌメ革'),
  ('fukuoka-handmade',2,'本革ウォレット',8500,'wallet','迷彩柄'),
  ('fukuoka-handmade',3,'レザーキーケース',4800,'sparkles','ユリス色'),
  ('fukuoka-handmade',4,'手作り名刺入れ',3500,'package','コンパクトサイズ'),
  ('fukuoka-handmade',5,'本革ベルト',7200,'package','サスペンダーリング付き'),
  -- hokkaido.craft
  ('hokkaido-craft',1,'アイヌ刺繍コースター',2200,'sparkles','手刺繍'),
  ('hokkaido-craft',2,'木彫り小物',5500,'package','白樺の木'),
  ('hokkaido-craft',3,'アイヌ文様ショール',18000,'shirt','ウール素材'),
  ('hokkaido-craft',4,'手作り手ぬぐい',3200,'shirt','伝統柄'),
  ('hokkaido-craft',5,'アイヌ工芸バッグ',12500,'bag','限定色')
on conflict (seller_id, product_no) do nothing;

-- ---------- chat_settings (シングルトン) ----------
insert into public.chat_settings (id) values (1)
on conflict (id) do nothing;

-- ---------- admin_events ----------
-- timeSlotEvents の5枠を admin_events として投入（公開/ライブ画面の正のイベント）。
-- 公開statusへの変換: live→LIVE / recruiting・seller_closed→開催前 / ended→終了。
-- 滋賀(evt-001)を開催中(live)・3出店者、他は開催前として現行デモを再現。
insert into public.admin_events
  (id, date, start_time, end_time, region, title, description, max_sellers, max_buyers, status, manager_id, manager_name, created_at) values
  ('evt-001','2026-06-01','20:00','22:00','滋賀','【滋賀】夜のハンドメイドフリマ',
   '滋賀エリアの作家さんが集まるハンドメイドイベントです。',5,100,'live','mgr-1','田中マネージャー','2026-05-25T10:00:00Z'),
  ('evt-002','2026-06-01','20:15','22:15','京都','【京都】古着＆ヴィンテージ市',
   '京都の古着・ヴィンテージ好き集まれ！',3,50,'recruiting','mgr-2','佐藤マネージャー','2026-05-26T11:00:00Z'),
  ('evt-003','2026-06-01','20:30','22:30','大阪','【大阪】骨董・アンティーク雑貨市',
   '大阪の骨董・アンティーク雑貨を扱う夜市です。',3,50,'recruiting','mgr-2','佐藤マネージャー','2026-05-26T12:00:00Z'),
  ('evt-004','2026-06-01','20:45','22:45','福岡','【福岡】レザークラフト夜市',
   '福岡発のレザークラフト作家による出店イベント。',3,50,'recruiting','mgr-1','田中マネージャー','2026-05-26T13:00:00Z'),
  ('evt-005','2026-06-01','21:00','23:00','北海道','【北海道】伝統工芸クラフト市',
   'アイヌ文様を取り入れた現代工芸品の出店イベント。',3,50,'recruiting','mgr-1','田中マネージャー','2026-05-26T14:00:00Z')
on conflict (id) do nothing;

-- 承認済み出店者（公開画面に表示される）。滋賀は3出店者で賑わいを再現。
insert into public.seller_applications (event_id, seller_id, seller_name, status, applied_at) values
  ('evt-001','seller-mina','mina.craft','approved','2026-05-26T09:00:00Z'),
  ('evt-001','seller-kyoto','kyoto.vintage','approved','2026-05-26T09:10:00Z'),
  ('evt-001','seller-osaka','osaka.antique','approved','2026-05-26T09:20:00Z'),
  ('evt-002','seller-kyoto','kyoto.vintage','approved','2026-05-27T14:00:00Z'),
  ('evt-003','seller-osaka','osaka.antique','approved','2026-05-27T16:00:00Z'),
  ('evt-004','seller-fukuoka','fukuoka.handmade','approved','2026-05-27T17:00:00Z'),
  ('evt-005','seller-hokkaido','hokkaido.craft','approved','2026-05-27T18:00:00Z')
on conflict (event_id, seller_id) do nothing;

-- 来場予約（evt-001 を成立判定デモ用に3名投入 → 予約条件クリア）
insert into public.buyer_reservations (event_id, buyer_id) values
  ('evt-001','buyer-1'),
  ('evt-001','demo-buyer-2'),
  ('evt-001','demo-buyer-3')
on conflict (event_id, buyer_id) do nothing;

-- ---------- transactions (txn-demo-1) ----------
insert into public.transactions
  (id, event_id, event_title, seller_id, seller_name, buyer_id, buyer_name,
   product_name, product_price, purchased_at, expires_at, messages) values
  ('txn-demo-1','evt-001','【滋賀】夜のハンドメイドフリマ','mina-craft','mina.craft',
   'buyer-1','山田太郎','天然石ネックレス',4500,
   now() - interval '2 days', now() + interval '5 days',
   '[
     {"text":"「天然石ネックレス」について教えてください！","sender":"buyer","timestamp":"20:05"},
     {"text":"「天然石ネックレス」ですね！アメジストの天然石を使用。¥4,500でいかがでしょうか？","sender":"seller","timestamp":"20:06"},
     {"text":"素敵です！購入します","sender":"buyer","timestamp":"20:08"},
     {"text":"ありがとうございます！発送先を教えてください","sender":"seller","timestamp":"20:09"}
   ]'::jsonb)
on conflict (id) do nothing;

-- ========== [6/6] 0006_queue.sql ==========
-- =============================================================
-- フリマライブ  整理券キュー  (0006_queue.sql)
-- =============================================================
-- 元仕様(チャット仕様・接客順番管理): 整理券方式・順番待ち表示・接客開始ボタン・順番通知。
-- これまで待機室は画面内シミュレーション（整理券#固定・自動進行）だったため、
-- 複数の購入者間で順番が共有されていなかった。本テーブルで実体化する。
--
-- モデル: (event_id, seller_id) ごとに1本の待ち行列。
--   buyer が並ぶと ticket_no（その行列内の連番）を採番し status='waiting'。
--   出店者が「接客開始」を押すと先頭の waiting を 'serving' に遷移＋順番通知を配信。
--   接客終了で 'done'。離脱で 'cancelled'。
--   (event_id, seller_id, buyer_id) で一意 → 同じ人は二重に並ばない（再入場は再利用）。
--
-- 冪等。dev_all（anon全許可）は 0001/0003 と同方針。本番は own-rows へ締める。
-- =============================================================

create table if not exists public.queue_tickets (
  id          uuid primary key default gen_random_uuid(),
  event_id    text not null,
  seller_id   text not null,
  buyer_id    text not null,
  buyer_name  text,
  status      text not null default 'waiting'
              check (status in ('waiting','serving','done','cancelled')),
  ticket_no   int  not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (event_id, seller_id, buyer_id)
);

create index if not exists idx_queue_seller
  on public.queue_tickets(event_id, seller_id, ticket_no);

-- Realtime: 行列の変化（並ぶ/呼ばれる/終了）を購読
do $$
begin
  alter publication supabase_realtime add table public.queue_tickets;
exception when duplicate_object then
  null;
end $$;

-- ---------- 開発用 RLS（anon フルアクセス・0001 と同方針） ----------
alter table public.queue_tickets enable row level security;
drop policy if exists dev_all on public.queue_tickets;
create policy dev_all on public.queue_tickets
  for all to anon, authenticated using (true) with check (true);

-- ========== [7/7] 0007_profiles_avatar.sql ==========
-- =============================================================
-- フリマライブ  プロフィール画像URL  (0007_profiles_avatar.sql)
-- =============================================================
-- 元仕様(会員機能): プロフィール登録。アバター画像を Supabase Storage に保存し、
-- その公開URLを profiles.avatar_url に保持する（null=既定アイコン表示）。
-- 画像本体は public バケット 'avatars' に保存（要事前作成）。冪等。
-- =============================================================

alter table public.profiles
  add column if not exists avatar_url text;
