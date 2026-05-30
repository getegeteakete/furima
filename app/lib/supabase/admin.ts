import { createClient } from '@supabase/supabase-js';

// =============================================================
// サーバー専用 管理クライアント（service_role）
// -------------------------------------------------------------
// RLS をバイパスして横断的な集計・更新を行うため、Cron / Route Handler
// など「サーバー上でのみ」使う。絶対にクライアントへ import しないこと
// （'server-only' で誤用をビルド時に検出）。
// =============================================================
import 'server-only';

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL が未設定です。Vercel の環境変数を確認してください。',
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
