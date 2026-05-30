'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { recordPageView } from '../lib/supabaseStore';

// パスが変わるたびに1ページビューを記録する（匿名・個人情報なし）。
// 接客チャット等のリアルタイム画面も対象だが、記録は fire-and-forget で
// 失敗してもUIに影響しない。
export default function PageViewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname) return;
    recordPageView(pathname);
  }, [pathname]);
  return null;
}
