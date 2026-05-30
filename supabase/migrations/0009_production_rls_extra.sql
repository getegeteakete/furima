-- =============================================================
-- フリマライブ  本番用 RLS 追補  (0009_production_rls_extra.sql)
-- =============================================================
-- ⚠️ 0002_production_rls.sql の「後」に適用すること。
--    0002 は profiles / sellers / products / admin_events / seller_applications /
--    buyer_reservations / chat_settings / active_sessions / transactions /
--    messages / notifications までを認証ベースに締めた。
--    本ファイルは 0002 適用後も dev_all（anon 全許可）のまま残っていた
--      ・queue_tickets（0006 で追加）
--      ・seller_applications の fee_* 列の本人申告（0008 で追加）
--      ・Storage バケット（avatars / product-images / chat-images）
--    を本番ポリシーへ締める。前提として 0002 のヘルパー関数
--      public.current_role() / public.is_staff() / public.owns_shop(text)
--    が作成済みであること。冪等（drop if exists → create）。
-- =============================================================

-- ============================================================================
-- 1) queue_tickets : 整理券キューを当事者ベースに締める
-- ----------------------------------------------------------------------------
--   READ  : 自分のチケット / 担当ショップ / スタッフ / そのイベントに予約済みの
--           購入者（待機室で待ち人数・接客中を見るため）。
--           ※ queue_tickets を自己参照すると RLS 無限再帰になるため、
--             「同じ行列の参加者」判定は buyer_reservations を用いる
--             （待機室は joinQueue 前に必ず reserveAsBuyer する設計）。
--   INSERT: 購入者本人が status='waiting' の自分の行だけ追加できる。
--   UPDATE: 自分の行（離脱=cancelled / 終了=done / 再入場=waiting）、
--           担当ショップ（次の方=serving・接客終了=done）、スタッフ。
--   DELETE: スタッフのみ（アプリは通常 delete しない）。
-- ============================================================================
alter table public.queue_tickets enable row level security;
drop policy if exists dev_all on public.queue_tickets;
drop policy if exists queue_select on public.queue_tickets;
drop policy if exists queue_insert_self on public.queue_tickets;
drop policy if exists queue_update_party on public.queue_tickets;
drop policy if exists queue_delete_staff on public.queue_tickets;

create policy queue_select on public.queue_tickets
  for select to authenticated using (
    buyer_id = auth.uid()::text
    or public.owns_shop(seller_id)
    or public.is_staff()
    or exists (
      select 1 from public.buyer_reservations r
      where r.event_id = queue_tickets.event_id
        and r.buyer_id = auth.uid()::text
    )
  );

create policy queue_insert_self on public.queue_tickets
  for insert to authenticated with check (
    buyer_id = auth.uid()::text and status = 'waiting'
  );

create policy queue_update_party on public.queue_tickets
  for update to authenticated using (
    buyer_id = auth.uid()::text
    or public.owns_shop(seller_id)
    or public.is_staff()
  ) with check (
    buyer_id = auth.uid()::text
    or public.owns_shop(seller_id)
    or public.is_staff()
  );

create policy queue_delete_staff on public.queue_tickets
  for delete to authenticated using (public.is_staff());

-- ============================================================================
-- 2) seller_applications : 出店料の本人申告(fee_*)を許可しつつ、承認列は保護
-- ----------------------------------------------------------------------------
--   0002 では apps_insert_self（本人申請）と apps_staff（運営の承認・全列）の
--   みで、出店者本人の UPDATE が無かった。submitSellerFee（fee_status='submitted'）
--   が本番で弾かれるため、本人 UPDATE を許可する。
--   ただし RLS は列単位の制限ができないため、本人が status を 'approved' 等に
--   書き換える自己承認を防ぐ目的で BEFORE UPDATE トリガーを噛ませ、
--   非スタッフの更新では fee_* 以外の列を旧値へ強制的に戻す。
-- ============================================================================
drop policy if exists apps_update_self on public.seller_applications;
create policy apps_update_self on public.seller_applications
  for update to authenticated
  using (seller_id = auth.uid()::text or public.is_staff())
  with check (seller_id = auth.uid()::text or public.is_staff());

create or replace function public.guard_seller_application_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- スタッフは全列変更可（承認・入金確認など）
  if public.is_staff() then
    return new;
  end if;
  -- 本人の自己更新は fee_status / fee_method / fee_submitted_at のみ反映。
  -- それ以外（status / seller_id / seller_name / event_id / applied_at / fee_paid_at）は
  -- 旧値を強制し、自己承認や入金確認の偽装を防ぐ。
  new.status        := old.status;
  new.seller_id     := old.seller_id;
  new.seller_name   := old.seller_name;
  new.event_id      := old.event_id;
  new.applied_at    := old.applied_at;
  new.fee_paid_at   := old.fee_paid_at;
  return new;
end $$;

drop trigger if exists trg_guard_seller_application_update on public.seller_applications;
create trigger trg_guard_seller_application_update
  before update on public.seller_applications
  for each row execute function public.guard_seller_application_update();

-- ============================================================================
-- 3) Storage バケット（avatars / product-images / chat-images）
-- ----------------------------------------------------------------------------
--   バケットを public（公開READ）で用意し、書き込みを当事者に限定する。
--     avatars        … 先頭フォルダ = profiles.id(=auth.uid) の本人のみ書込
--     product-images … 先頭フォルダ = shopId、担当ショップ or スタッフのみ書込
--     chat-images    … 認証済みの接客参加者なら書込可（ルーム当事者性は
--                       messages 側の RLS で別途担保）
--   ※ public バケットの閲覧は公開URLで行うため SELECT ポリシーは公開に開ける。
-- ============================================================================

-- バケットを作成（無ければ）。public=true。
insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('product-images', 'product-images', true),
  ('chat-images', 'chat-images', true)
on conflict (id) do update set public = true;

-- 既存の同名ポリシーを掃除（冪等）
drop policy if exists media_public_read on storage.objects;
drop policy if exists avatars_write_self on storage.objects;
drop policy if exists avatars_update_self on storage.objects;
drop policy if exists avatars_delete_self on storage.objects;
drop policy if exists product_images_write_shop on storage.objects;
drop policy if exists product_images_update_shop on storage.objects;
drop policy if exists product_images_delete_shop on storage.objects;
drop policy if exists chat_images_write_auth on storage.objects;

-- 公開READ（3バケット）
create policy media_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id in ('avatars', 'product-images', 'chat-images'));

-- avatars: 本人フォルダのみ
create policy avatars_write_self on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy avatars_update_self on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy avatars_delete_self on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- product-images: 担当ショップ or スタッフ
create policy product_images_write_shop on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and (public.owns_shop((storage.foldername(name))[1]) or public.is_staff())
  );
create policy product_images_update_shop on storage.objects
  for update to authenticated
  using (
    bucket_id = 'product-images'
    and (public.owns_shop((storage.foldername(name))[1]) or public.is_staff())
  )
  with check (
    bucket_id = 'product-images'
    and (public.owns_shop((storage.foldername(name))[1]) or public.is_staff())
  );
create policy product_images_delete_shop on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'product-images'
    and (public.owns_shop((storage.foldername(name))[1]) or public.is_staff())
  );

-- chat-images: 認証済みなら書込可（ルーム当事者性は messages の RLS で担保）
create policy chat_images_write_auth on storage.objects
  for insert to authenticated
  with check (bucket_id = 'chat-images');

-- =============================================================
-- 📋 適用順チェックリスト
-- -------------------------------------------------------------
--  1. SETUP_ALL.sql（または 0001〜0008）で全テーブルを構築済み
--  2. 0002_production_rls.sql を適用（認証ベースに切替・shop_id 設定済み）
--  3. 本ファイル(0009)を適用 → queue / fee申告 / Storage を本番ポリシーに締める
--
-- 【適用後の確認】
--  ・購入者: 待機室で並べる / 待ち人数・接客中が見える / 離脱できる
--  ・出店者: コンソールで「次の方」「接客終了」で自店の整理券を操作できる
--  ・出店者: 出店料の支払い申告(submitted)はできるが、status は変えられない
--  ・出店者: 自分の shopId 配下にのみ商品画像をアップロードできる
--  ・購入者/出店者: 自分のアバターを自分のフォルダにアップロードできる
-- =============================================================
