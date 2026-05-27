'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

type UserType = 'buyer' | 'seller';

export default function RegisterPage() {
  const [userType, setUserType] = useState<UserType>('buyer');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50 flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center py-8 sm:py-12 lg:py-16">
        <div className="w-full max-w-md mx-auto px-4 sm:px-6">
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 px-6 py-6 sm:py-8 text-white text-center">
              <div className="text-4xl sm:text-5xl mb-3">🌸</div>
              <h1 className="text-xl sm:text-2xl font-black mb-1">無料会員登録</h1>
              <p className="text-xs sm:text-sm text-orange-100">フリマライブを始めましょう</p>
            </div>

            {/* User Type Tabs */}
            <div className="px-5 sm:px-6 pt-5">
              <div className="flex bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setUserType('buyer')}
                  className={`flex-1 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all ${
                    userType === 'buyer'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-gray-600'
                  }`}
                >
                  購入者として
                </button>
                <button
                  onClick={() => setUserType('seller')}
                  className={`flex-1 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all ${
                    userType === 'seller'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-gray-600'
                  }`}
                >
                  出店者として
                </button>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500 text-center mt-2">
                {userType === 'buyer' ? '無料・すぐに始められます' : '出店時のみ1,200円〜'}
              </p>
            </div>

            {/* Form */}
            <div className="px-5 sm:px-6 py-5 sm:py-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  お名前 / ショップ名
                </label>
                <input
                  type="text"
                  placeholder={userType === 'buyer' ? '田中 太郎' : 'mina.craft'}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  メールアドレス
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  パスワード
                </label>
                <input
                  type="password"
                  placeholder="8文字以上"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              {userType === 'seller' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    地域
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-orange-500 focus:outline-none transition-colors bg-white">
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
                <label htmlFor="terms" className="text-[10px] sm:text-xs text-gray-600 leading-relaxed">
                  <Link href="#" className="text-orange-600 font-bold underline">利用規約</Link> および <Link href="#" className="text-orange-600 font-bold underline">プライバシーポリシー</Link> に同意します
                </label>
              </div>

              <button className="w-full px-6 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-black text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95">
                登録する →
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[10px] text-gray-400">または</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Social Login */}
              <div className="space-y-2">
                <button className="w-full px-6 py-3 bg-[#06C755] text-white rounded-full font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2">
                  <span>📱</span> LINEで登録
                </button>
                <button className="w-full px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-full font-bold text-sm hover:border-gray-300 transition-all flex items-center justify-center gap-2">
                  <span>🌐</span> Googleで登録
                </button>
              </div>
            </div>

            {/* Footer Link */}
            <div className="bg-gray-50 px-5 sm:px-6 py-4 text-center">
              <p className="text-xs sm:text-sm text-gray-600">
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
