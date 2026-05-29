'use client';

import { ReactNode, useEffect } from 'react';
import { hydrateAll, subscribeRealtime } from '../lib/supabaseStore';
import { isSupabaseConfigured } from '../lib/supabase/client';

// 起動時に Supabase からデータを読み込み、Realtime購読でキャッシュを最新に保つ。
// ClientWrapper の Provider 群に追加して使う。
export default function StoreProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // 環境変数が未設定なら何もしない（アプリは表示されるがデータは空）
    if (!isSupabaseConfigured) return;
    let unsub: (() => void) | undefined;
    hydrateAll()
      .then(() => {
        unsub = subscribeRealtime();
      })
      .catch((e) => console.error('[StoreProvider] hydrate failed:', e));
    return () => unsub?.();
  }, []);

  return <>{children}</>;
}
