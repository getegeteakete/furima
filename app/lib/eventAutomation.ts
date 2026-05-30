import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';

// =============================================================
// イベント自動進行エンジン（サーバー専用）
// -------------------------------------------------------------
// 元仕様③: 開催成立条件 = 3名以上の予約 AND 3アカウント以上のチャット発生
// Cron から定期実行し、時刻に応じて status を自動遷移させる。
//   recruiting/seller_closed →(開始時刻到来 & 成立) live
//   live                      →(終了時刻到来) ended
// 成立条件を満たさないまま開始時刻が来た場合は live にせず据え置き
// （運営が手動でOPENする余地を残す。中止運用は別途）。
// =============================================================

export const OPEN_THRESHOLD = { minReservations: 3, minChatAccounts: 3 } as const;

type AdminEventRow = {
  id: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  status: string;
};

export type EventActionLog = {
  eventId: string;
  from: string;
  to: string;
  reason: string;
};

// 'HH:mm' + 'YYYY-MM-DD' を Date(UTC基準のJST想定) に変換。
// 注: 本番の正確なタイムゾーン運用は要検討。ここでは date+time を
// Asia/Tokyo(+09:00) として解釈する。
function toDateTime(date: string, hhmm: string): Date {
  return new Date(`${date}T${hhmm}:00+09:00`);
}

// 指定イベントのチャット参加アカウント数（system を除く一意 sender_id）
async function countChatAccounts(
  supabase: SupabaseClient,
  eventId: string,
): Promise<number> {
  const { data, error } = await supabase
    .from('messages')
    .select('sender_id, sender_role')
    .eq('event_id', eventId)
    .neq('sender_role', 'system');
  if (error) throw error;
  const ids = new Set<string>();
  for (const r of data ?? []) {
    if (r.sender_id) ids.add(r.sender_id as string);
  }
  return ids.size;
}

// 指定イベントの予約数
async function countReservations(
  supabase: SupabaseClient,
  eventId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from('buyer_reservations')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId);
  if (error) throw error;
  return count ?? 0;
}

// 1回の自動進行サイクルを実行し、行ったアクションのログを返す
export async function runEventAutomation(
  supabase: SupabaseClient,
  now: Date = new Date(),
): Promise<{ checked: number; actions: EventActionLog[] }> {
  // 進行管理の対象になり得るイベントのみ取得
  const { data, error } = await supabase
    .from('admin_events')
    .select('id, date, start_time, end_time, status')
    .in('status', ['recruiting', 'seller_closed', 'live']);
  if (error) throw error;

  const events = (data ?? []) as AdminEventRow[];
  const actions: EventActionLog[] = [];

  for (const e of events) {
    const start = toDateTime(e.date, e.start_time);
    const end = toDateTime(e.date, e.end_time);

    // 1) live のイベントが終了時刻を過ぎたら ended に
    if (e.status === 'live' && now >= end) {
      const { error: upErr } = await supabase
        .from('admin_events')
        .update({ status: 'ended' })
        .eq('id', e.id);
      if (!upErr) {
        actions.push({ eventId: e.id, from: e.status, to: 'ended', reason: '終了時刻を経過' });
      }
      continue;
    }

    // 2) 開催前のイベントが開始時刻を迎えたら、成立条件を満たす場合のみ live に
    if ((e.status === 'recruiting' || e.status === 'seller_closed') && now >= start && now < end) {
      const [reservations, chatAccounts] = await Promise.all([
        countReservations(supabase, e.id),
        countChatAccounts(supabase, e.id),
      ]);
      const eligible =
        reservations >= OPEN_THRESHOLD.minReservations &&
        chatAccounts >= OPEN_THRESHOLD.minChatAccounts;
      if (eligible) {
        const { error: upErr } = await supabase
          .from('admin_events')
          .update({ status: 'live' })
          .eq('id', e.id);
        if (!upErr) {
          actions.push({
            eventId: e.id,
            from: e.status,
            to: 'live',
            reason: `成立条件クリア（予約${reservations} / チャット${chatAccounts}）`,
          });
        }
      } else {
        // 開始時刻は来たが未成立 → ログのみ（状態は据え置き、運営判断に委ねる）
        actions.push({
          eventId: e.id,
          from: e.status,
          to: e.status,
          reason: `開始時刻到来も未成立（予約${reservations}/${OPEN_THRESHOLD.minReservations} ・ チャット${chatAccounts}/${OPEN_THRESHOLD.minChatAccounts}）`,
        });
      }
    }
  }

  return { checked: events.length, actions };
}
