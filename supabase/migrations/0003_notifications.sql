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
