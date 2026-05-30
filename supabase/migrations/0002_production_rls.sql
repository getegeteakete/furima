-- =============================================================
-- フリマライブ  本番用 RLS  (0002_production_rls.sql)
-- =============================================================
-- ⚠️ これは Supabase Auth を組み込んだ「後」に適用するファイル。
--    前提: 会員登録時に profiles へ id = auth.uid()::text で行を作成していること。
--    適用すると 0001 の開発用 dev_all ポリシーを削除し、認証ベースに切り替える。
-- =============================================================

-- ---------- ヘルパー: 現在ユーザーの role / スタッフ判定 ----------
create or replace function public.current_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()::text;
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role() in ('admin','event_manager'), false);
$$;

-- ---------- 出店者アカウント ↔ ショップ の紐付け ----------
-- ⚠️ 重要: アプリのデータは「seller_id」が2系統に分かれている。
--   ・seller_applications.seller_id = profiles.id（例 'seller-mina'）
--   ・products / transactions / messages / active_sessions.seller_id
--       = sellers.id（ショップID。例 'mina-craft'）
-- ショップ系テーブルの当事者判定は auth.uid() では行えないため、
-- profiles に担当ショップ(shop_id)を持たせ、owns_shop() で判定する。
-- 本番運用前に各出店者アカウントへ shop_id を設定すること（手順は末尾コメント参照）。
alter table public.profiles
  add column if not exists shop_id text references public.sellers(id);

create or replace function public.owns_shop(target_shop text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()::text
      and shop_id is not null
      and shop_id = target_shop
  );
$$;

-- ---------- 開発用 dev_all ポリシーを全削除 ----------
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','sellers','products','admin_events','seller_applications',
    'buyer_reservations','chat_settings','active_sessions','transactions','messages',
    'notifications'
  ] loop
    execute format('drop policy if exists dev_all on public.%I;', t);
  end loop;
end $$;

-- ---------- profiles ----------
create policy profiles_select on public.profiles
  for select to authenticated using (true);
create policy profiles_update_self on public.profiles
  for update to authenticated using (id = auth.uid()::text) with check (id = auth.uid()::text);
create policy profiles_insert_self on public.profiles
  for insert to authenticated with check (id = auth.uid()::text);
create policy profiles_admin_all on public.profiles
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ---------- sellers / products / admin_events : 公開READ + スタッフWRITE ----------
create policy sellers_read on public.sellers for select to anon, authenticated using (true);
create policy sellers_staff on public.sellers for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy products_read on public.products for select to anon, authenticated using (true);
create policy products_staff on public.products for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy events_read on public.admin_events for select to anon, authenticated using (true);
create policy events_staff on public.admin_events for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ---------- seller_applications : 公開READ / 本人申請 / スタッフ承認 ----------
create policy apps_read on public.seller_applications for select to anon, authenticated using (true);
create policy apps_insert_self on public.seller_applications
  for insert to authenticated with check (seller_id = auth.uid()::text);
create policy apps_staff on public.seller_applications
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ---------- buyer_reservations : 本人 + スタッフ ----------
create policy res_select on public.buyer_reservations
  for select to authenticated using (buyer_id = auth.uid()::text or public.is_staff());
create policy res_insert_self on public.buyer_reservations
  for insert to authenticated with check (buyer_id = auth.uid()::text);
create policy res_delete_self on public.buyer_reservations
  for delete to authenticated using (buyer_id = auth.uid()::text or public.is_staff());

-- ---------- chat_settings : 公開READ / スタッフ更新 ----------
create policy chat_settings_read on public.chat_settings for select to anon, authenticated using (true);
create policy chat_settings_staff on public.chat_settings
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ---------- active_sessions : 当事者本人(購入者/担当ショップ) + スタッフ ----------
create policy sessions_select on public.active_sessions
  for select to authenticated using (buyer_id = auth.uid()::text or public.owns_shop(seller_id) or public.is_staff());
create policy sessions_write_self on public.active_sessions
  for all to authenticated using (buyer_id = auth.uid()::text) with check (buyer_id = auth.uid()::text);

-- ---------- transactions : 当事者(購入者/担当ショップ) + スタッフ ----------
create policy txn_select on public.transactions
  for select to authenticated using (buyer_id = auth.uid()::text or public.owns_shop(seller_id) or public.is_staff());
create policy txn_insert on public.transactions
  for insert to authenticated with check (buyer_id = auth.uid()::text or public.owns_shop(seller_id));
create policy txn_update_party on public.transactions
  for update to authenticated using (buyer_id = auth.uid()::text or public.owns_shop(seller_id))
  with check (buyer_id = auth.uid()::text or public.owns_shop(seller_id));

-- ---------- messages : ルーム当事者 ----------
-- 全体チャット(seller_id IS NULL)は認証ユーザーが閲覧可、
-- 個別チャットは当該購入者本人・担当ショップ・スタッフのみ。
create policy messages_select on public.messages
  for select to authenticated using (
    seller_id is null
    or buyer_id = auth.uid()::text
    or public.owns_shop(seller_id)
    or public.is_staff()
  );
-- 送信は「名乗り(sender_id)が本人」かつ「そのルームの当事者」であること。
create policy messages_insert on public.messages
  for insert to authenticated with check (
    sender_id = auth.uid()::text
    and (
      public.is_staff()
      or (sender_role = 'buyer'  and buyer_id  = auth.uid()::text)
      or (sender_role = 'seller' and public.owns_shop(seller_id))
    )
  );

-- ---------- notifications : 本人のみ閲覧/既読・配信はサーバー(service_role) ----------
-- 受信者本人だけが自分の通知を読める/既読/削除できる。
-- 作成(INSERT)は Cron/Edge の service_role が RLS をバイパスして行う想定。
-- クライアントからの follow/like 等の自己宛て通知のみ本人INSERTを許可。
create policy notifications_select_self on public.notifications
  for select to authenticated using (user_id = auth.uid()::text or public.is_staff());
create policy notifications_insert_self on public.notifications
  for insert to authenticated with check (user_id = auth.uid()::text or public.is_staff());
create policy notifications_update_self on public.notifications
  for update to authenticated using (user_id = auth.uid()::text) with check (user_id = auth.uid()::text);
create policy notifications_delete_self on public.notifications
  for delete to authenticated using (user_id = auth.uid()::text or public.is_staff());

-- =============================================================
-- 📋 本番化チェックリスト（このファイルを適用する前後で必須）
-- -------------------------------------------------------------
-- 【適用前】
--  1. Supabase Auth で全出店者アカウントを作成済みであること
--     （メール+パスワード。profiles に id=auth.uid() の行が作られる）
--  2. 各出店者の profiles 行に担当ショップ(shop_id)を設定すること。
--     これを忘れると出店者は自分の店のチャット・取引を一切見られない。
--       例) update public.profiles
--             set shop_id = 'mina-craft'
--           where email = 'mina@example.com';
--  3. 自分を管理者にする:
--       update public.profiles set role='admin' where email='<自分>';
--
-- 【適用】
--  4. このファイルを Supabase SQL Editor で実行。
--     → 開発用 dev_all（anon 全許可）が削除され、認証ベースに切替わる。
--
-- 【適用後の確認】
--  5. 購入者でログイン → 接客チャット送信 → 自分のメッセージが見える
--  6. 出店者でログイン → /event/.../console → 担当ショップの個別/全体が見える・送れる
--  7. 別ショップの出店者では、他店のDMが見えないこと（owns_shop による遮断）
--
-- 【ロールバック】
--  問題が出たら 0001 の dev_all を再作成すれば全許可に戻せる（開発時のみ）。
-- =============================================================
