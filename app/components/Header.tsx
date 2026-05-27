'use client';

import Link from 'next/link';
import { useState } from 'react';
import SkipLink from './SkipLink';
import ThemeToggle from './ThemeToggle';
import { UserIcon } from './Icons';

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <SkipLink />
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-orange-100 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <span className="text-white font-black text-xl lg:text-2xl">F</span>
              </div>
              <div>
                <p className="text-lg lg:text-xl font-black text-orange-600 dark:text-orange-400 leading-none">フリマライブ</p>
                <p className="text-[10px] lg:text-xs text-gray-500 dark:text-gray-400 leading-none mt-0.5">Furima LIVE</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link href="/" className="text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">HOME</Link>
              <Link href="/events" className="text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">イベント</Link>
              <Link href="/seller" className="text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">出店者</Link>
              <Link href="/about" className="text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">使い方</Link>
            </nav>

            {/* CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <ThemeToggle />
              <Link href="/mypage" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-50 dark:bg-gray-800 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-gray-700 transition-colors">
                <UserIcon size={20} stroke={1.5} />
              </Link>
              <Link href="/login" className="text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                ログイン
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full text-sm font-bold shadow-md hover:shadow-xl hover:scale-105 transition-all dark:from-orange-600 dark:to-orange-700"
              >
                無料登録
              </Link>
            </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setOpen(!open)}
              className="p-2.5 rounded-lg hover:bg-orange-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center w-11 h-11"
              aria-label="Menu"
              aria-expanded={open}
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span className={`h-0.5 bg-gray-800 dark:bg-gray-200 w-full transition-all ${open ? 'rotate-45 translate-y-2.5' : ''}`} />
                <span className={`h-0.5 bg-gray-800 dark:bg-gray-200 w-full transition-all ${open ? 'opacity-0' : ''}`} />
                <span className={`h-0.5 bg-gray-800 dark:bg-gray-200 w-full transition-all ${open ? '-rotate-45 -translate-y-2.5' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {open && (
          <nav className="lg:hidden py-5 sm:py-6 border-t border-orange-100 dark:border-gray-800 space-y-1 animate-slide-in max-h-screen overflow-y-auto">
            <Link href="/" onClick={() => setOpen(false)} className="block py-4 px-5 text-base sm:text-lg font-bold text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-800 rounded-lg transition-colors active:scale-95">HOME</Link>
            <Link href="/events" onClick={() => setOpen(false)} className="block py-4 px-5 text-base sm:text-lg font-bold text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-800 rounded-lg transition-colors active:scale-95">イベント一覧</Link>
            <Link href="/mypage" onClick={() => setOpen(false)} className="block py-4 px-5 text-base sm:text-lg font-bold text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-800 rounded-lg transition-colors active:scale-95">マイページ</Link>
            <Link href="/seller" onClick={() => setOpen(false)} className="block py-4 px-5 text-base sm:text-lg font-bold text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-800 rounded-lg transition-colors active:scale-95">出店者ダッシュボード</Link>
            <Link href="/about" onClick={() => setOpen(false)} className="block py-4 px-5 text-base sm:text-lg font-bold text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-800 rounded-lg transition-colors active:scale-95">使い方</Link>
            <div className="pt-4 px-5 border-t border-orange-100 dark:border-gray-800 mt-4 space-y-3">
              <Link href="/login" onClick={() => setOpen(false)} className="block py-4 px-5 text-center text-base font-bold text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 rounded-full hover:border-orange-300 dark:hover:border-orange-500 transition-colors active:scale-95">
                ログイン
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="block py-4 px-5 text-center bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full text-base font-bold shadow-md hover:shadow-lg transition-all active:scale-95 dark:from-orange-600 dark:to-orange-700"
              >
                無料登録
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
    </>
  );
}
