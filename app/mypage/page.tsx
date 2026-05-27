'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  UserIcon,
  CalendarIcon,
  HeartIcon,
  BagIcon,
  MapPinIcon,
  CheckIcon,
  ArrowRightIcon,
  StarIcon,
  PlusIcon,
  SettingsIcon,
} from '../components/Icons';
import { events } from '../lib/events';
import type { Event, Product } from '../lib/events';

type Tab = 'reservations' | 'favorites' | 'history';

const TABS: { id: Tab; label: string; icon: React.FC<any> }[] = [
  { id: 'reservations', label: '予約中', icon: CalendarIcon },
  { id: 'favorites', label: 'お気に入り', icon: HeartIcon },
  { id: 'history', label: '購入履歴', icon: BagIcon },
];

// ダミーデータ
const RESERVED_EVENTS = [
  {
    id: 'mina-craft',
    name: 'mina.craft',
    region: '滋賀',
    status: 'live' as const,
    date: '今日',
    time: '20:00-22:00',
    position: 3,
    waitingCount: 2,
    userPurchased: false,
  },
  {
    id: 'kyoto-vintage',
    name: 'kyoto.vintage',
    region: '京都',
    status: 'upcoming' as const,
    date: '明日',
    time: '20:15-22:15',
    position: 1,
    waitingCount: 4,
    userPurchased: false,
  },
];

const FAVORITE_EVENTS = [
  events[0], // mina-craft
  events[2], // osaka-antique
];

const PURCHASE_HISTORY = [
  {
    id: 1,
    eventName: 'kyoto.vintage',
    region: '京都',
    productName: 'ヴィンテージワンピ',
    price: 8800,
    purchaseDate: '2024-05-25',
    status: '配送完了' as const,
    image: 'shirt',
  },
  {
    id: 2,
    eventName: 'mina.craft',
    region: '滋賀',
    productName: 'レジン樹脂ピアス',
    price: 2800,
    purchaseDate: '2024-05-20',
    status: '配送中' as const,
    image: 'jewelry',
  },
  {
    id: 3,
    eventName: 'osaka.antique',
    region: '大阪',
    productName: 'アンティーク食器セット',
    price: 3800,
    purchaseDate: '2024-05-15',
    status: '配送完了' as const,
    image: 'food',
  },
];

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<Tab>('reservations');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* User Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="container-main py-8 sm:py-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0">
              <UserIcon size={36} stroke={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-1">ログイン中</p>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 mb-1">
                さくら
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">購入者アカウント</p>
            </div>
            <button className="hidden sm:inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0">
              <SettingsIcon size={20} stroke={1.5} className="text-gray-600" />
            </button>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-white border-b border-gray-200 sticky top-16 lg:top-20 z-10">
        <div className="container-main">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 px-5 py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <TabIcon size={16} stroke={1.5} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <main className="flex-1">
        <div className="container-main py-10 sm:py-12">
          
          {/* 予約中イベント Tab */}
          {activeTab === 'reservations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base sm:text-lg font-black text-gray-900">
                  予約中 ({RESERVED_EVENTS.length}件)
                </h2>
              </div>

              {RESERVED_EVENTS.length > 0 ? (
                <div className="space-y-4">
                  {RESERVED_EVENTS.map((reservation) => (
                    <Link key={reservation.id} href={`/event/${reservation.id}`}>
                      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 hover:shadow-md hover:border-orange-200 transition-all">
                        <div className="flex items-start gap-4">
                          {/* Status Badge */}
                          <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm ${
                            reservation.status === 'live'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-orange-100 text-orange-600'
                          }`}>
                            {reservation.position}番
                          </div>

                          {/* Event Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm sm:text-base font-black text-gray-900 truncate">
                                {reservation.name}
                              </h3>
                              {reservation.status === 'live' && (
                                <span className="flex-shrink-0 text-xs font-black text-white bg-red-500 px-2 py-1 rounded-full">
                                  開催中
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                              <MapPinIcon size={12} stroke={2} />
                              <span>{reservation.region}</span>
                              <span>•</span>
                              <CalendarIcon size={12} stroke={2} />
                              <span>{reservation.date} {reservation.time}</span>
                            </div>

                            {/* Queue Info */}
                            {reservation.status === 'live' && (
                              <div className="text-xs text-orange-600 font-bold">
                                🎯 あと {reservation.waitingCount}名お待たせ中...
                              </div>
                            )}
                          </div>

                          <ArrowRightIcon size={16} stroke={2} className="text-orange-600 flex-shrink-0" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 p-10 sm:p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4 text-gray-400">
                    <CalendarIcon size={32} stroke={1.5} />
                  </div>
                  <p className="text-sm text-gray-600 mb-6">予約中のイベントはありません</p>
                  <Link href="/events">
                    <button className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-full text-sm font-bold hover:bg-orange-600 transition-all">
                      イベントを探す
                      <ArrowRightIcon size={16} stroke={2} />
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* お気に入り Tab */}
          {activeTab === 'favorites' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base sm:text-lg font-black text-gray-900">
                  お気に入り ({FAVORITE_EVENTS.length}件)
                </h2>
              </div>

              {FAVORITE_EVENTS.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {FAVORITE_EVENTS.map((event) => (
                    <Link key={event.id} href={`/event/${event.id}`}>
                      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-orange-200 transition-all">
                        {/* Event Image */}
                        <div className="aspect-square bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-700 relative">
                          <div className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                            <HeartIcon size={18} stroke={2} className="text-orange-600 fill-current" />
                          </div>
                          {/* Icon placeholder */}
                          <div className="text-5xl">♦️</div>
                        </div>

                        {/* Event Details */}
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-sm font-black text-gray-900 flex-1">{event.name}</h3>
                            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full flex-shrink-0">
                              {event.region}
                            </span>
                          </div>

                          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{event.description}</p>

                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                            <CalendarIcon size={12} stroke={2} />
                            <span>{event.date} {event.startTime}-{event.endTime}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <UserIcon size={12} stroke={2} />
                              <span>{event.currentReservations}/{event.maxReservations}予約</span>
                            </div>
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                              event.status === 'live'
                                ? 'bg-red-100 text-red-600'
                                : event.status === 'upcoming'
                                ? 'bg-orange-100 text-orange-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {event.status === 'live' ? '開催中' : event.status === 'upcoming' ? '予定' : '終了'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 p-10 sm:p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4 text-gray-400">
                    <HeartIcon size={32} stroke={1.5} />
                  </div>
                  <p className="text-sm text-gray-600 mb-6">お気に入りはまだありません</p>
                  <Link href="/events">
                    <button className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-full text-sm font-bold hover:bg-orange-600 transition-all">
                      イベントを探す
                      <ArrowRightIcon size={16} stroke={2} />
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* 購入履歴 Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base sm:text-lg font-black text-gray-900">
                  購入履歴 ({PURCHASE_HISTORY.length}件)
                </h2>
              </div>

              {PURCHASE_HISTORY.length > 0 ? (
                <div className="space-y-4">
                  {PURCHASE_HISTORY.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 hover:shadow-md transition-all">
                      <div className="flex gap-4 sm:gap-6">
                        {/* Product Image */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center flex-shrink-0 text-3xl">
                          ♦️
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <p className="text-xs text-gray-500 mb-0.5">{item.eventName}</p>
                              <h3 className="text-sm sm:text-base font-black text-gray-900 truncate">
                                {item.productName}
                              </h3>
                            </div>
                            <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                              item.status === '配送完了'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {item.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                            <MapPinIcon size={12} stroke={2} />
                            <span>{item.region}</span>
                            <span>•</span>
                            <CalendarIcon size={12} stroke={2} />
                            <span>{item.purchaseDate}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <p className="text-base sm:text-lg font-black text-orange-600">
                              ¥{item.price.toLocaleString()}
                            </p>
                            <button className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors">
                              詳細を見る →
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 p-10 sm:p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4 text-gray-400">
                    <BagIcon size={32} stroke={1.5} />
                  </div>
                  <p className="text-sm text-gray-600 mb-6">購入履歴がありません</p>
                  <Link href="/events">
                    <button className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-full text-sm font-bold hover:bg-orange-600 transition-all">
                      はじめてのお買い物
                      <ArrowRightIcon size={16} stroke={2} />
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
