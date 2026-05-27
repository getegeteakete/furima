'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

type Tab = 'overview' | 'products' | 'events' | 'analytics';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview', label: '概要', icon: '📊' },
  { id: 'products', label: '商品管理', icon: '📦' },
  { id: 'events', label: 'イベント管理', icon: '📅' },
  { id: 'analytics', label: '売上分析', icon: '💰' },
];

const PRODUCTS = [
  { id: 1, name: 'レジン樹脂ピアス', price: 2800, stock: 5, sold: 12, emoji: '💎' },
  { id: 2, name: '天然石ネックレス', price: 4500, stock: 3, sold: 8, emoji: '🌟' },
  { id: 3, name: 'ハンドメイドリング', price: 3200, stock: 7, sold: 15, emoji: '✨' },
  { id: 4, name: 'ガラスチャーム', price: 1800, stock: 10, sold: 6, emoji: '🔮' },
];

const UPCOMING_EVENTS = [
  { id: 1, date: '今日', time: '20:00-22:00', reserved: 7, max: 10, status: 'live' },
  { id: 2, date: '明日', time: '20:00-22:00', reserved: 5, max: 10, status: 'upcoming' },
  { id: 3, date: '12/20', time: '19:00-21:00', reserved: 2, max: 10, status: 'upcoming' },
];

export default function SellerPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Seller Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-md flex-shrink-0">
              💎
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-orange-600 font-bold mb-0.5">📍 滋賀</p>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 truncate">
                mina.craft ダッシュボード
              </h1>
              <p className="text-xs text-gray-500">最終ログイン: 今日 20:00</p>
            </div>
            <button className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-full text-xs font-bold hover:bg-orange-600 transition-all">
              + 新規イベント
            </button>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-white border-b border-gray-200 sticky top-16 lg:top-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 sm:py-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6 lg:space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: '今月の売上', value: '¥48,200', change: '+15%', color: 'orange', icon: '💰' },
                  { label: '販売点数', value: '47点', change: '+8点', color: 'blue', icon: '📦' },
                  { label: 'イベント開催', value: '8回', change: '+2回', color: 'purple', icon: '📅' },
                  { label: '評価', value: '4.8', change: '★★★★★', color: 'yellow', icon: '⭐' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{stat.icon}</span>
                      <span className="text-[10px] sm:text-xs font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Upcoming Events */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-sm sm:text-base lg:text-lg font-black text-gray-900">予定中のイベント</h2>
                  <Link href="#" className="text-xs text-orange-600 font-bold hover:underline">
                    すべて見る →
                  </Link>
                </div>
                <div className="divide-y divide-gray-100">
                  {UPCOMING_EVENTS.map((event) => (
                    <div key={event.id} className="px-5 sm:px-6 py-4 flex items-center gap-4 hover:bg-orange-50 transition-colors">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                        event.status === 'live' ? 'bg-red-100' : 'bg-orange-100'
                      }`}>
                        {event.status === 'live' ? '🔴' : '📅'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-gray-900">{event.date} {event.time}</p>
                        <p className="text-xs text-gray-500">予約 {event.reserved}/{event.max}名</p>
                      </div>
                      <div className="w-20 sm:w-24 hidden sm:block">
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-400 to-orange-600"
                            style={{ width: `${(event.reserved / event.max) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-orange-600">→</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { label: '新規商品登録', icon: '➕', color: 'orange' },
                  { label: 'イベント作成', icon: '📅', color: 'blue' },
                  { label: '在庫確認', icon: '📦', color: 'green' },
                  { label: '売上レポート', icon: '📊', color: 'purple' },
                ].map((action) => (
                  <button
                    key={action.label}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all text-left"
                  >
                    <div className="text-2xl sm:text-3xl mb-2">{action.icon}</div>
                    <p className="text-xs sm:text-sm font-black text-gray-900">{action.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-black text-gray-900">商品一覧 ({PRODUCTS.length}点)</h2>
                <button className="px-4 py-2 bg-orange-500 text-white rounded-full text-xs font-bold hover:bg-orange-600 transition-all">
                  + 新規追加
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {PRODUCTS.map((product) => (
                  <div key={product.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                    <div className="aspect-square bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-6xl">
                      {product.emoji}
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-black text-gray-900 mb-1 truncate">{product.name}</p>
                      <p className="text-lg font-black text-orange-600 mb-3">¥{product.price.toLocaleString()}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">在庫: <span className="font-bold text-gray-900">{product.stock}</span></span>
                        <span className="text-gray-500">販売: <span className="font-bold text-gray-900">{product.sold}</span></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
                <div className="text-5xl mb-3">📅</div>
                <h2 className="text-base sm:text-lg font-black text-gray-900 mb-2">イベント管理</h2>
                <p className="text-xs sm:text-sm text-gray-600 mb-6">開催スケジュールを管理します</p>
                <button className="px-6 py-3 bg-orange-500 text-white rounded-full text-sm font-bold hover:bg-orange-600 transition-all">
                  新しいイベントを作成
                </button>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-base sm:text-lg font-black text-gray-900 mb-4">月別売上推移</h2>
                <div className="flex items-end gap-2 sm:gap-3 h-40 sm:h-48">
                  {[35, 42, 28, 48, 55, 38, 62, 48].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg transition-all hover:opacity-80"
                        style={{ height: `${val}%` }}
                      />
                      <span className="text-[10px] text-gray-500">{idx + 5}月</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
