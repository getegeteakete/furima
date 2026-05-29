'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import type { UserRole } from '../lib/supabaseStore';

// 指定ロールのユーザーだけ children を表示。未ログイン/権限不足はメッセージを出す。
export default function AuthGuard({
  allow,
  children,
}: {
  allow: UserRole[];
  children: ReactNode;
}) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400 text-sm">読み込み中...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <p className="text-lg font-black text-gray-900 mb-2">ログインが必要です</p>
        <p className="text-sm text-gray-500 mb-6">このページは権限を持つユーザーのみ利用できます</p>
        <Link
          href="/login"
          className="px-6 py-3 bg-orange-600 text-white rounded-full font-bold text-sm hover:bg-orange-700 transition-colors"
        >
          ログインする
        </Link>
      </div>
    );
  }

  if (!profile || !allow.includes(profile.role)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <p className="text-lg font-black text-gray-900 mb-2">アクセス権限がありません</p>
        <p className="text-sm text-gray-500 mb-6">
          このページの閲覧には運営権限が必要です
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-full font-bold text-sm hover:bg-gray-300 transition-colors"
        >
          トップへ戻る
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
