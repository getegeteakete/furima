import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { sendEmail, buildNotificationEmail, isEmailConfigured } from './notify/email';

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

// 開催リマインド（開催通知）を送る時間窓: 開始◯分前〜開始時刻
export const REMIND_WINDOW_MIN = 60;

type AdminEventRow = {
  id: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  status: string;
  title: string;
  region: string;
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

// 指定イベントを予約した購入者ID一覧
async function fetchReservedBuyerIds(
  supabase: SupabaseClient,
  eventId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from('buyer_reservations')
    .select('buyer_id')
    .eq('event_id', eventId);
  if (error) throw error;
  return (data ?? []).map((r) => r.buyer_id as string).filter(Boolean);
}

type NotifyTemplate = {
  type: 'open' | 'event_start';
  title: string;
  message: string;
  dedupePrefix: string; // 'open' / 'reminder' など
};

// 予約者全員へ通知を冪等配信（user_id + dedupe_key で重複防止）。
// service_role 前提（RLSバイパス）。送信できた件数を返す。
async function notifyReservedBuyers(
  supabase: SupabaseClient,
  event: AdminEventRow,
  tmpl: NotifyTemplate,
): Promise<number> {
  const buyerIds = await fetchReservedBuyerIds(supabase, event.id);
  if (buyerIds.length === 0) return 0;
  const dedupeKey = `${tmpl.dedupePrefix}:${event.id}`;
  const rows = buyerIds.map((uid) => ({
    user_id: uid,
    type: tmpl.type,
    title: tmpl.title,
    message: tmpl.message,
    event_id: event.id,
    event_name: event.title,
    dedupe_key: dedupeKey,
  }));
  const { data: inserted, error } = await supabase
    .from('notifications')
    .upsert(rows, { onConflict: 'user_id,dedupe_key', ignoreDuplicates: true })
    .select('user_id');
  if (error) {
    // 通知失敗は自動進行本体を止めない（ログのみ）
    console.error('[eventAutomation] notifyReservedBuyers failed:', error.message);
    return 0;
  }

  // ignoreDuplicates: true のため select は「今回新規に入った行」だけを返す。
  // = まだ通知していない受信者。この人たちにのみメールを送る（重複送信を防止）。
  const newRecipientIds = (inserted ?? []).map((r) => r.user_id as string).filter(Boolean);
  if (newRecipientIds.length > 0 && isEmailConfigured()) {
    await sendNotificationEmails(supabase, newRecipientIds, {
      title: tmpl.title,
      message: tmpl.message,
      eventId: event.id,
    });
  }
  return newRecipientIds.length;
}

// 受信者ID群のメールアドレスを引いて通知メールを送る（失敗は握りつぶしログのみ）
async function sendNotificationEmails(
  supabase: SupabaseClient,
  userIds: string[],
  notif: { title: string; message: string; eventId?: string },
): Promise<void> {
  const { data, error } = await supabase
    .from('profiles')
    .select('email')
    .in('id', userIds);
  if (error) {
    console.error('[eventAutomation] fetch emails failed:', error.message);
    return;
  }
  const emails = (data ?? [])
    .map((r) => r.email as string | null)
    .filter((e): e is string => Boolean(e));
  if (emails.length === 0) return;
  const { subject, html } = buildNotificationEmail(notif);
  // Resend は to に配列で複数指定可。多数の場合は分割（1リクエスト最大50宛先）。
  const CHUNK = 50;
  const chunks: string[][] = [];
  for (let i = 0; i < emails.length; i += CHUNK) chunks.push(emails.slice(i, i + CHUNK));
  const results = await Promise.allSettled(
    chunks.map((to) => sendEmail({ to, subject, html })),
  );
  const failed = results.filter(
    (r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.ok && !r.value.skipped),
  ).length;
  if (failed > 0) {
    console.error(`[eventAutomation] email send: ${failed}/${chunks.length} chunk(s) failed`);
  }
}

// 1回の自動進行サイクルを実行し、行ったアクションのログを返す
export async function runEventAutomation(
  supabase: SupabaseClient,
  now: Date = new Date(),
): Promise<{ checked: number; actions: EventActionLog[] }> {
  // 進行管理の対象になり得るイベントのみ取得
  const { data, error } = await supabase
    .from('admin_events')
    .select('id, date, start_time, end_time, status, title, region')
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

    // 1.5) 開催リマインド（開催通知）: 開始 REMIND_WINDOW_MIN 分前〜開始時刻の間で、
    //      まだ開催前(recruiting/seller_closed)のイベントの予約者へ1回だけ通知。
    if (e.status === 'recruiting' || e.status === 'seller_closed') {
      const remindFrom = new Date(start.getTime() - REMIND_WINDOW_MIN * 60 * 1000);
      if (now >= remindFrom && now < start) {
        const sent = await notifyReservedBuyers(supabase, e, {
          type: 'event_start',
          title: '開催通知',
          message: `${e.title} がまもなくOPENします（${e.start_time} 開始予定）。`,
          dedupePrefix: 'reminder',
        });
        if (sent > 0) {
          actions.push({
            eventId: e.id,
            from: e.status,
            to: e.status,
            reason: `開催リマインド配信（予約者${sent}名へ・冪等）`,
          });
        }
      }
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
          // OPEN通知: 予約者全員へ（冪等）
          await notifyReservedBuyers(supabase, e, {
            type: 'open',
            title: 'OPEN通知',
            message: `${e.title} がOPENしました！接客チャットに参加できます。`,
            dedupePrefix: 'open',
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
