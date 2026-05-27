'use client';

import Link from 'next/link';
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function RegisterPage() {
  const [type, setType] = useState<'buyer' | 'seller'>('buyer');

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Header />

      <section className="py-12 lg:py-20">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-black text-gray-900 mb-3">
              <span className="text-orange-600">無料</span>で登録
            </h1>
            <p className="text-sm text-gray-600">わずか1分で完了！すぐにフリマライブを楽しめます</p>
          </div>

          <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl border border-orange-100">
            {/* Type tabs */}
            <div className="flex gap-2 mb-6 bg-orange-50 rounded-full p-1">
              <button
                onClick={() => setType('buyer')}
                className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${
                  type === 'buyer' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-600'
                }`}
              >
                購入者として
              </button>
              <button
                onClick={() => setType('seller')}
                className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${
                  type === 'seller' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-600'
                }`}
              >
                出店者として
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">
                  {type === 'seller' ? 'ショップ名' : 'ニックネーム'}
                </label>
                <input
                  type="text"
                  placeholder={type === 'seller' ? 'mina.craft' : 'nana♡'}
                  className="w-full px-4 py-3 bg-orange-50 border border-orange-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">メールアドレス</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-orange-50 border border-orange-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">パスワード</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-orange-50 border border-orange-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              {type === 'seller' && (
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-2">活動地域</label>
                  <select className="w-full px-4 py-3 bg-orange-50 border border-orange-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option>滋賀</option>
                    <option>京都</option>
                    <option>大阪</option>
                    <option>東京</option>
                    <option>福岡</option>
                  </select>
                </div>
              )}

              <label className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer">
                <input type="checkbox" className="mt-0.5 w-4 h-4 accent-orange-500" />
                <span>
                  <Link href="#" className="text-orange-600 underline">利用規約</Link>と
                  <Link href="#" className="text-orange-600 underline">プライバシーポリシー</Link>に同意します
                </span>
              </label>

              <button className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-black shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
                {type === 'seller' ? '出店者登録する' : '会員登録する'}
              </button>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">または</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <button className="w-full py-3 bg-green-500 text-white rounded-full font-bold text-sm shadow-md hover:bg-green-600 transition-colors">
                LINEで登録
              </button>
              <button className="w-full py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-full font-bold text-sm hover:bg-gray-50 transition-colors">
                Googleで登録
              </button>

              <p className="text-center text-sm text-gray-600 pt-4 border-t border-gray-100">
                すでにアカウントをお持ちですか？
                <Link href="/login" className="text-orange-600 font-bold ml-1">ログイン</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
