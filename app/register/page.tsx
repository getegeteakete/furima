'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { LineIcon, GoogleIcon, ArrowRightIcon, SparklesIcon } from '../components/Icons';

type UserType = 'buyer' | 'seller';

export default function RegisterPage() {
  const [userType, setUserType] = useState<UserType>('buyer');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50 flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 sm:py-16 lg:py-20">
        <div className="w-full max-w-md mx-auto px-4 sm:px-6">
          <div className="bg-white dark:bg-gray-950 rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 px-8 py-8 sm:py-10 text-white text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white dark:bg-gray-950/20 backdrop-blur rounded-2xl mb-4">
                <SparklesIcon size={32} stroke={1.5} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black mb-2">無料会員登録</h1>
              <p className="text-sm text-orange-100">フリマライブを始めましょう</p>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-6">
              <div className="flex bg-gray-100 rounded-full p-1.5">
                <button
                  onClick={() => setUserType('buyer')}
                  className={`flex-1 py-3 rounded-full text-sm font-black transition-all ${
                    userType === 'buyer'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-gray-600'
                  }`}
                >
                  購入者として
                </button>
                <button
                  onClick={() => setUserType('seller')}
                  className={`flex-1 py-3 rounded-full text-sm font-black transition-all ${
                    userType === 'seller'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-gray-600'
                  }`}
                >
                  出店者として
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                {userType === 'buyer' ? '無料・すぐに始められます' : '出店時のみ1,200円〜'}
              </p>
            </div>

            {/* Form */}
            <div className="px-6 py-7 sm:py-8 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  お名前 / ショップ名
                </label>
                <input
                  type="text"
                  placeholder={userType === 'buyer' ? '田中 太郎' : 'mina.craft'}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  メールアドレス
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  パスワード
                </label>
                <input
                  type="password"
                  placeholder="8文字以上"
                  className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              {userType === 'seller' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                    地域
                  </label>
                  <select className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:border-orange-500 focus:outline-none transition-colors bg-white dark:bg-gray-950">
                    <option>選択してください</option>
                    <option>北海道</option>
                    <option>東京</option>
                    <option>大阪</option>
                    <option>京都</option>
                    <option>福岡</option>
                  </select>
                </div>
              )}

              <div className="flex items-start gap-2 pt-1">
                <input type="checkbox" id="terms" className="mt-1 w-4 h-4 accent-orange-500" />
                <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed">
                  <Link href="#" className="text-orange-600 font-bold underline">利用規約</Link> および <Link href="#" className="text-orange-600 font-bold underline">プライバシーポリシー</Link> に同意します
                </label>
              </div>

              <button className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-black text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95">
                登録する <ArrowRightIcon size={18} stroke={2.5} />
              </button>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">または</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="space-y-3">
                <button className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#06C755] text-white rounded-full font-bold text-sm hover:opacity-90 transition-all">
                  <LineIcon size={20} stroke={1.5} />
                  LINEで登録
                </button>
                <button className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-gray-950 border-2 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-full font-bold text-sm hover:border-gray-300 transition-all">
                  <GoogleIcon size={20} stroke={1.5} />
                  Googleで登録
                </button>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-5 text-center">
              <p className="text-sm text-gray-600">
                すでに会員の方は <Link href="/login" className="text-orange-600 font-black hover:underline">ログイン</Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
