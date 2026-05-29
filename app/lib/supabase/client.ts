'use client';

import { createBrowserClient } from '@supabase/ssr';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 環境変数が未設定でも import 時にクラッシュしないようにする。
// （Vercel に環境変数を入れる前や、ローカル未設定でもアプリは表示され、
//   Supabase 関連の処理だけが無効化される）
export const isSupabaseConfigured = Boolean(url && anon);

if (!isSupabaseConfigured && typeof window !== 'undefined') {
  console.warn(
    '[supabase] NEXT_PUBLIC_SUPABASE_URL / ANON_KEY が未設定です。' +
      'Vercel または .env.local に設定してください。',
  );
}

// ブラウザ用 Supabase クライアント。
// createBrowserClient は内部でシングルトン化されるため毎回呼んでも安全。
export function createClient() {
  return createBrowserClient(
    url ?? 'https://placeholder.supabase.co',
    anon ?? 'placeholder-anon-key',
  );
}

// 使い回し用シングルトン
export const supabase = createClient();
