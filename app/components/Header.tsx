'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-xl lg:text-2xl">F</span>
            </div>
            <div>
              <p className="text-lg lg:text-xl font-black text-orange-600 leading-none">フリマライブ</p>
              <p className="text-[10px] lg:text-xs text-gray-500 leading-none mt-0.5">Furima LIVE</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/" className="text-sm font-bold text-gray-700 hover:text-orange-600 transition-colors">HOME</Link>
            <Link href="/events" className="text-sm font-bold text-gray-700 hover:text-orange-600 transition-colors">イベント</Link>
            <Link href="/seller" className="text-sm font-bold text-gray-700 hover:text-orange-600 transition-colors">出店者</Link>
            <Link href="/about" className="text-sm font-bold text-gray-700 hover:text-orange-600 transition-colors">使い方</Link>
          </nav>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login" className="text-sm font-bold text-gray-700 hover:text-orange-600 transition-colors">
              ログイン
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full text-sm font-bold shadow-md hover:shadow-xl hover:scale-105 transition-all"
            >
              無料登録
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 rounded-lg hover:bg-orange-50 transition-colors"
            aria-label="Menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`h-0.5 bg-gray-800 transition-all ${open ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`h-0.5 bg-gray-800 transition-all ${open ? 'opacity-0' : ''}`} />
              <span className={`h-0.5 bg-gray-800 transition-all ${open ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile Nav */}
        {open && (
          <nav className="lg:hidden py-4 border-t border-orange-100 space-y-1 animate-slide-in">
            <Link href="/" onClick={() => setOpen(false)} className="block py-3 px-4 text-sm font-bold text-gray-700 hover:bg-orange-50 rounded-lg">HOME</Link>
            <Link href="/events" onClick={() => setOpen(false)} className="block py-3 px-4 text-sm font-bold text-gray-700 hover:bg-orange-50 rounded-lg">イベント一覧</Link>
            <Link href="/seller" onClick={() => setOpen(false)} className="block py-3 px-4 text-sm font-bold text-gray-700 hover:bg-orange-50 rounded-lg">出店者ダッシュボード</Link>
            <Link href="/about" onClick={() => setOpen(false)} className="block py-3 px-4 text-sm font-bold text-gray-700 hover:bg-orange-50 rounded-lg">使い方</Link>
            <div className="pt-3 border-t border-orange-100 mt-3 space-y-2">
              <Link href="/login" onClick={() => setOpen(false)} className="block py-3 px-4 text-center text-sm font-bold text-gray-700 border border-gray-200 rounded-full">
                ログイン
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="block py-3 px-4 text-center bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full text-sm font-bold shadow-md"
              >
                無料登録
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
