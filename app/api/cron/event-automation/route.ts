import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '../../../lib/supabase/admin';
import { runEventAutomation } from '../../../lib/eventAutomation';

// Vercel Cron から定期実行される自動進行エンドポイント。
// 成立判定→自動OPEN / 終了時刻→自動CLOSE を行う。
// 認可: Authorization: Bearer <CRON_SECRET>
//   （Vercel Cron は自動で CRON_SECRET を Bearer 付与する。手動実行時も同様に。）

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  // CRON_SECRET 未設定なら拒否（事故防止）
  if (!secret) return false;
  const auth = req.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

async function handle(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  try {
    const supabase = createAdminClient();
    const result = await runEventAutomation(supabase);
    return NextResponse.json({
      ok: true,
      ranAt: new Date().toISOString(),
      checked: result.checked,
      actions: result.actions,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}
