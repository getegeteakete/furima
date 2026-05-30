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
