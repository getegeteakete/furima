import 'server-only';

// =============================================================
// メール送信（Resend REST API・サーバー専用）
// -------------------------------------------------------------
// 依存を増やさないため SDK ではなく fetch で直接叩く。
// 必要な環境変数（Vercel に設定）:
//   RESEND_API_KEY  … Resend の API キー（re_... ）
//   RESEND_FROM     … 送信元（例 'フリマライブ <noreply@yourdomain>'）
//                     ※ Resend で検証済みドメインのアドレスにすること
// 未設定なら送信せず { skipped:true } を返す（自動進行を止めない）。
// =============================================================

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM);
}

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://furima.vercel.app';
}

export type SendEmailResult =
  | { ok: true; id?: string }
  | { ok: false; skipped?: boolean; error?: string };

export async function sendEmail(args: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) {
    return { ok: false, skipped: true };
  }
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: args.to, subject: args.subject, html: args.html }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { ok: false, error: `Resend ${res.status}: ${text}` };
    }
    const data = (await res.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: data.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}

// 通知メールの本文（シンプルなHTML）。イベントへのリンク付き。
export function buildNotificationEmail(args: {
  title: string;
  message: string;
  eventId?: string;
}): { subject: string; html: string } {
  const link = args.eventId ? `${siteUrl()}/event/${args.eventId}` : siteUrl();
  const subject = `【フリマライブ】${args.title}`;
  const html = `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1f2937;">
    <div style="font-size:14px;font-weight:700;color:#ea580c;letter-spacing:.05em;">フリマライブ</div>
    <h1 style="font-size:20px;font-weight:800;margin:12px 0;">${escapeHtml(args.title)}</h1>
    <p style="font-size:15px;line-height:1.7;color:#374151;">${escapeHtml(args.message)}</p>
    <a href="${link}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#ea580c;color:#fff;text-decoration:none;border-radius:9999px;font-weight:700;font-size:15px;">イベントを見る</a>
    <p style="font-size:12px;color:#9ca3af;margin-top:24px;">この通知の配信停止はサイトの設定から行えます。</p>
  </div>`;
  return { subject, html };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
