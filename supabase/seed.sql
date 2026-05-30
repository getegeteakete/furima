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
