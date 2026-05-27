'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  SearchIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  ArrowRightIcon,
  StoreIcon,
  CloseIcon,
} from '../components/Icons';
import { events } from '../lib/events';

type SearchTab = 'events' | 'sellers';

type Seller = {
  id: string;
  name: string;
  region: string;
  rating: number;
  followers: number;
  category: string;
};

const SELLERS: Seller[] = [
  {
    id: 'mina-craft',
    name: 'mina.craft',
    region: '滋賀',
    rating: 4.8,
    followers: 542,
    category: 'ハンドメイド',
  },
  {
    id: 'kyoto-vintage',
    name: 'kyoto.vintage',
    region: '京都',
    rating: 4.6,
    followers: 321,
    category: '古着',
  },
  {
    id: 'osaka-antique',
    name: 'osaka.antique',
    region: '大阪',
    rating: 4.9,
    followers: 678,
    category: '雑貨',
  },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams?.get('q') ?? '';

  const [searchQuery, setSearchQuery] = useState(query);
  const [searchTab, setSearchTab] = useState<SearchTab>('events');

  // 検索ロジック
  const searchEvents = (q: string) => {
    if (!q.trim()) return [];
    const lowerQ = q.toLowerCase();
    return events.filter(
      (e) =>
        e.name.toLowerCase().includes(lowerQ) ||
        e.region.toLowerCase().includes(lowerQ) ||
        e.category.toLowerCase().includes(lowerQ) ||
        e.tags.some((tag) => tag.toLowerCase().includes(lowerQ)) ||
        e.description.toLowerCase().includes(lowerQ)
    );
  };

  const searchSellers = (q: string) => {
    if (!q.trim()) return [];
    const lowerQ = q.toLowerCase();
    return SELLERS.filter(
      (s) =>
        s.name.toLowerCase().includes(lowerQ) ||
        s.region.toLowerCase().includes(lowerQ) ||
        s.category.toLowerCase().includes(lowerQ)
    );
  };

  const foundEvents = searchEvents(searchQuery);
  const foundSellers = searchSellers(searchQuery);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    router.push('/search');
  };

  return (
    <>
      {/* Search Header */}
      <section className="bg-white border-b border-gray-200 sticky top-16 sm:top-20 z-40">
        <div className="container-main py-5 sm:py-6">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <SearchIcon
                size={20}
                stroke={2}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="イベント・出店者を検索..."
                className="w-full pl-10 pr-10 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="クリア"
                >
                  <CloseIcon size={18} stroke={2} />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              className="px-5 py-3 bg-orange-500 text-white rounded-full text-sm font-bold hover:bg-orange-600 transition-all active:scale-95"
            >
              検索
            </button>
          </div>
        </div>
      </section>

      <main className="flex-1">
        <div className="container-main py-10 sm:py-12">
          {searchQuery.trim() ? (
            <>
              {/* Results Tabs */}
              <div className="flex gap-1 border-b border-gray-200 mb-8">
                <button
                  onClick={() => setSearchTab('events')}
                  className={`py-4 px-6 text-sm font-bold border-b-2 transition-all ${
                    searchTab === 'events'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  イベント ({foundEvents.length})
                </button>
                <button
                  onClick={() => setSearchTab('sellers')}
                  className={`py-4 px-6 text-sm font-bold border-b-2 transition-all ${
                    searchTab === 'sellers'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  出店者 ({foundSellers.length})
                </button>
              </div>

              {/* Events Results */}
              {searchTab === 'events' && (
                <div className="space-y-6">
                  {foundEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {foundEvents.map((event) => (
                        <Link key={event.id} href={`/event/${event.id}`}>
                          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-orange-200 transition-all">
                            <div className="aspect-video bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-700 text-4xl">
                              ♦️
                            </div>
                            <div className="p-5 sm:p-6">
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <h3 className="text-base sm:text-lg font-black text-gray-900 flex-1">
                                  {event.name}
                                </h3>
                                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full flex-shrink-0 whitespace-nowrap">
                                  {event.region}
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
                                {event.description}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                <CalendarIcon size={14} stroke={2} />
                                <span>{event.date} {event.startTime}-{event.endTime}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <UserIcon size={14} stroke={2} />
                                  <span>{event.currentReservations}/{event.maxReservations}</span>
                                </div>
                                <span
                                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                    event.status === 'live'
                                      ? 'bg-red-100 text-red-600'
                                      : event.status === 'upcoming'
                                      ? 'bg-orange-100 text-orange-600'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {event.status === 'live'
                                    ? '開催中'
                                    : event.status === 'upcoming'
                                    ? '予定'
                                    : '終了'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                      <SearchIcon size={40} stroke={1.5} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">
                        「{searchQuery}」に関するイベントは見つかりませんでした
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Sellers Results */}
              {searchTab === 'sellers' && (
                <div className="space-y-4">
                  {foundSellers.length > 0 ? (
                    foundSellers.map((seller) => (
                      <Link key={seller.id} href={`/seller/${seller.id}`}>
                        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 hover:shadow-md hover:border-orange-200 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-white flex-shrink-0 text-3xl">
                              ♦️
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <h3 className="text-base sm:text-lg font-black text-gray-900 truncate">
                                  {seller.name}
                                </h3>
                                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full flex-shrink-0 whitespace-nowrap">
                                  {seller.region}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mb-2">{seller.category}</p>
                              <div className="flex items-center gap-3 text-xs text-gray-600">
                                <span className="font-bold text-yellow-600 flex items-center gap-0.5">
                                  ⭐ {seller.rating}
                                </span>
                                <span className="text-gray-400">|</span>
                                <span className="font-bold text-gray-900">
                                  {seller.followers} フォロー
                                </span>
                              </div>
                            </div>
                            <ArrowRightIcon size={16} stroke={2} className="text-orange-600 flex-shrink-0" />
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                      <StoreIcon size={40} stroke={1.5} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">
                        「{searchQuery}」に関する出店者は見つかりませんでした
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="max-w-2xl mx-auto text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-3xl mb-6 text-gray-400">
                <SearchIcon size={40} stroke={1.5} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-3">検索</h2>
              <p className="text-gray-600 mb-8">
                イベント名、出店者名、地域名などを入力して検索できます
              </p>
              <div className="bg-orange-50 rounded-2xl p-6 space-y-2 text-sm text-left">
                <p className="font-bold text-orange-900 mb-3">🔍 検索のヒント</p>
                <ul className="space-y-1 text-gray-700">
                  <li>• ショップ名で検索：「mina.craft」</li>
                  <li>• 地域名で検索：「京都」「大阪」</li>
                  <li>• カテゴリで検索：「ハンドメイド」「古着」</li>
                  <li>• キーワードで検索：「レジン」「ジュエリー」</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <Suspense fallback={<div className="flex-1 bg-gray-50" />}>
        <SearchContent />
      </Suspense>
      <Footer />
    </div>
  );
}
