'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  ProductIcon,
  ChartIcon,
  PackageIcon,
  CalendarIcon,
  CoinIcon,
  StarIcon,
  PlusIcon,
  TrendingUpIcon,
  BoltIcon,
  MapPinIcon,
  ArrowRightIcon,
  ReceiptIcon,
  BellIcon,
} from '../components/Icons';
import type { ProductIconType } from '../components/Icons';

type Tab = 'overview' | 'products' | 'events' | 'analytics';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: '概要' },
  { id: 'products', label: '商品管理' },
  { id: 'events', label: 'イベント管理' },
  { id: 'analytics', label: '売上分析' },
];

const PRODUCTS: { id: number; name: string; price: number; stock: number; sold: number; icon: ProductIconType }[] = [
  { id: 1, name: 'レジン樹脂ピアス', price: 2800, stock: 5, sold: 12, icon: 'jewelry' },
  { id: 2, name: '天然石ネックレス', price: 4500, stock: 3, sold: 8, icon: 'necklace' },
  { id: 3, name: 'ハンドメイドリング', price: 3200, stock: 7, sold: 15, icon: 'ring' },
  { id: 4, name: 'ガラスチャーム', price: 1800, stock: 10, sold: 6, icon: 'sparkles' },
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
      <section className="bg-white border-b border-gray-200 dark:border-gray-800">
        <div className="container-main py-8 sm:py-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0">
              <ProductIcon type="diamond" size={36} stroke={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-orange-600 mb-1">
                <MapPinIcon size={14} stroke={2} />
                <p className="text-xs font-bold">滋賀</p>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 truncate mb-1">
                mina.craft
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">出店者ダッシュボード</p>
            </div>
            <button className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-full text-sm font-bold hover:bg-orange-600 transition-all">
              <PlusIcon size={16} stroke={2.5} />
              新規イベント
            </button>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-white border-b border-gray-200 dark:border-gray-800 sticky top-16 lg:top-20 z-10">
        <div className="container-main">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-5 py-4 text-sm font-bold border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="flex-1">
        <div className="container-main py-10 sm:py-12">

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8 lg:space-y-10">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {[
                  { label: '今月の売上', value: '¥48,200', change: '+15%', Icon: CoinIcon },
                  { label: '販売点数', value: '47点', change: '+8点', Icon: PackageIcon },
                  { label: 'イベント開催', value: '8回', change: '+2回', Icon: CalendarIcon },
                  { label: '評価', value: '4.8', change: '★5つ', Icon: StarIcon },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                        <stat.Icon size={20} stroke={1.5} />
                      </div>
                      <span className="text-xs font-black text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1.5">{stat.label}</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Upcoming Events */}
              <div className="bg-white rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-black text-gray-900">予定中のイベント</h2>
                  <Link href="#" className="text-xs text-orange-600 font-bold hover:underline">
                    すべて見る
                  </Link>
                </div>
                <div className="divide-y divide-gray-100">
                  {UPCOMING_EVENTS.map((event) => (
                    <div key={event.id} className="px-6 py-5 flex items-center gap-4 hover:bg-orange-50 transition-colors">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        event.status === 'live' ? 'bg-red-100 text-red-600' : 'bg-orange-100 dark:bg-gray-800 text-orange-600'
                      }`}>
                        {event.status === 'live' ? <BoltIcon size={22} stroke={1.5} /> : <CalendarIcon size={22} stroke={1.5} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-gray-900">{event.date} {event.time}</p>
                        <p className="text-xs text-gray-500">予約 {event.reserved}/{event.max}名</p>
                      </div>
                      <div className="w-24 hidden sm:block">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-400 to-orange-600"
                            style={{ width: `${(event.reserved / event.max) * 100}%` }}
                          />
                        </div>
                      </div>
                      <ArrowRightIcon size={16} stroke={2} className="text-orange-600" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {[
                  { label: '新規商品登録', Icon: PlusIcon },
                  { label: 'イベント作成', Icon: CalendarIcon },
                  { label: '在庫確認', Icon: PackageIcon },
                  { label: '売上レポート', Icon: TrendingUpIcon },
                ].map((action) => (
                  <button
                    key={action.label}
                    className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-800 hover:border-orange-300 hover:shadow-md transition-all text-left"
                  >
                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-3 text-orange-600">
                      <action.Icon size={22} stroke={1.5} />
                    </div>
                    <p className="text-sm font-black text-gray-900">{action.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-gray-900">商品一覧 ({PRODUCTS.length}点)</h2>
                <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-full text-sm font-bold hover:bg-orange-600 transition-all">
                  <PlusIcon size={16} stroke={2.5} />
                  新規追加
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {PRODUCTS.map((product) => (
                  <div key={product.id} className="bg-white rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-all">
                    <div className="aspect-square bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-700">
                      <ProductIcon type={product.icon} size={56} stroke={1.5} />
                    </div>
                    <div className="p-5">
                      <p className="text-sm font-black text-gray-900 mb-2 truncate">{product.name}</p>
                      <p className="text-xl font-black text-orange-600 mb-4">¥{product.price.toLocaleString()}</p>
                      <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-100">
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
            <div className="bg-white rounded-3xl border border-gray-200 dark:border-gray-800 p-10 sm:p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-50 rounded-3xl mb-5 text-orange-600">
                <CalendarIcon size={40} stroke={1.5} />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-3">イベント管理</h2>
              <p className="text-sm text-gray-600 mb-8">開催スケジュールを管理します</p>
              <button className="inline-flex items-center gap-2 px-7 py-3.5 bg-orange-500 text-white rounded-full text-sm font-bold hover:bg-orange-600 transition-all">
                <PlusIcon size={16} stroke={2.5} />
                新しいイベントを作成
              </button>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="bg-white rounded-3xl border border-gray-200 dark:border-gray-800 p-7 sm:p-8 lg:p-10">
              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                  <ChartIcon size={20} stroke={1.5} />
                </div>
                <h2 className="text-lg font-black text-gray-900">月別売上推移</h2>
              </div>
              <div className="flex items-end gap-2 sm:gap-3 h-48 sm:h-56">
                {[35, 42, 28, 48, 55, 38, 62, 48].map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg transition-all hover:opacity-80 min-h-[20px]"
                      style={{ height: `${val}%` }}
                    />
                    <span className="text-xs text-gray-500">{idx + 5}月</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
