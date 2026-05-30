-- =============================================================
-- フリマライブ  アクセス数(PV)トラッキング  (0011_page_views.sql)
-- =============================================================
-- 元仕様(運営管理者機能・サイト管理): アクセス数確認。
-- 軽量な自前PVトラッキング。個人を特定する情報は保持しない。
--   ・path       … 閲覧パス（クエリは除去して保存）
--   ・session_id … ブラウザ単位の匿名ランダムID（sessionStorage 由来・氏名等は無し）
--   ・viewed_at  … 閲覧時刻
-- 集計用途のみ。RLS は INSERT を anon/authenticated に開け、SELECT はスタッフのみ。
-- 冪等（create if not exists）。
-- =============================================================

create table if not exists public.page_views (
  id          uuid primary key default gen_random_uuid(),
  path        text not null,
  session_id  text not null,
  viewed_at   timestamptz not null default now()
);

create index if not exists idx_page_views_viewed_at on public.page_views(viewed_at);
create index if not exists idx_page_views_path on public.page_views(path);

alter table public.page_views enable row level security;

-- 開発用: anon でも INSERT/SELECT 可（0001 と同方針の dev_all）。
-- 本番では 0002 系の締めに倣い、下の本番ポリシーへ差し替える（末尾コメント参照）。
drop policy if exists dev_all on public.page_views;
create policy dev_all on public.page_views
  for all to anon, authenticated using (true) with check (true);

-- =============================================================
-- 【本番ポリシー（0002 適用後に差し替える場合）】
--   dev_all を消し、INSERT は全員可・SELECT はスタッフのみに締める:
--
--   drop policy if exists dev_all on public.page_views;
--   create policy pv_insert_any on public.page_views
--     for insert to anon, authenticated with check (true);
--   create policy pv_select_staff on public.page_views
--     for select to authenticated using (public.is_staff());
--
--   ※ public.is_staff() は 0002_production_rls.sql で定義される。
-- =============================================================
