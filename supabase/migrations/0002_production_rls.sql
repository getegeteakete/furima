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

-- ---------- 開発用 dev_all ポリシーを全削除 ----------
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','sellers','products','admin_events','seller_applications',
    'buyer_reservations','chat_settings','active_sessions','transactions','messages'
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

-- ---------- active_sessions : 当事者本人(購入者) + スタッフ ----------
create policy sessions_select on public.active_sessions
  for select to authenticated using (buyer_id = auth.uid()::text or seller_id = auth.uid()::text or public.is_staff());
create policy sessions_write_self on public.active_sessions
  for all to authenticated using (buyer_id = auth.uid()::text) with check (buyer_id = auth.uid()::text);

-- ---------- transactions : 当事者 + スタッフ ----------
create policy txn_select on public.transactions
  for select to authenticated using (buyer_id = auth.uid()::text or seller_id = auth.uid()::text or public.is_staff());
create policy txn_insert on public.transactions
  for insert to authenticated with check (buyer_id = auth.uid()::text or seller_id = auth.uid()::text);
create policy txn_update_party on public.transactions
  for update to authenticated using (buyer_id = auth.uid()::text or seller_id = auth.uid()::text)
  with check (buyer_id = auth.uid()::text or seller_id = auth.uid()::text);

-- ---------- messages : ルーム当事者 ----------
-- 全体チャット(seller_id IS NULL)は来場予約者が閲覧可、個別は当事者のみ
create policy messages_select on public.messages
  for select to authenticated using (
    seller_id is null
    or buyer_id = auth.uid()::text
    or seller_id = auth.uid()::text
    or public.is_staff()
  );
create policy messages_insert on public.messages
  for insert to authenticated with check (
    sender_id = auth.uid()::text or public.is_staff()
  );
