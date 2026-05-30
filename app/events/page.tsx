'use client';

import Link from 'next/link';
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageHero from '../components/PageHero';
import {
  ProductIcon,
  MapPinIcon,
  ClockIcon,
  ArrowRightIcon,
  HeartIcon,
  UserIcon,
} from '../components/Icons';
import { useFavorites } from '../components/FavoritesContext';
import { getPublicEvents } from '../lib/supabaseStore';
import { useStoreData } from '../lib/useStore';

const REGIONS = ['全国', '北海道', '東北', '関東', '東京', '中部', '関西', '京都', '大阪', '中国', '四国', '九州', '福岡', '沖縄'];
const CATEGORIES = ['すべて', 'ハンドメイド', '古着', '雑貨', 'アクセサリー', 'ジュエリー', '食品', '家電'];

export default function EventsPage() {
  const [region, setRegion] = useState('全国');
  const [category, setCategory] = useState('すべて');
  const [sortBy, setSortBy] = useState<'time' | 'region' | 'sellers'>('time');
  const { toggleFavorite, isFavorite } = useFavorites();

  // admin_events ベースの公開イベント（予約・チャットと同じID基盤）
  const [publicEvents] = useStoreData(getPublicEvents);

  // フィルター適用
  const filtered = publicEvents.filter((event) => {
    const regionMatch = region === '全国' || event.region === region;
    const categoryMatch = category === 'すべて' || event.sellers.some((s) => s.tags.some((t) => t.includes(category)));
    return regionMatch && categoryMatch;
  });

  // 並び替え適用
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'time':
        return a.startTime.localeCompare(b.startTime);
      case 'region':
        return a.region.localeCompare(b.region, 'ja');
      case 'sellers':
        return b.sellers.length - a.sellers.length;
      default:
        return 0;
    }
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'live':
        return { text: 'LIVE中', bg: 'bg-red-500', text_color: 'text-white' };
      case 'upcoming':
        return { text: 'まもなくOPEN', bg: 'bg-orange-100', text_color: 'text-orange-700' };
      case 'ended':
        return { text: '終了', bg: 'bg-gray-200', text_color: 'text-gray-600' };
      default:
        return { text: '予約受付中', bg: 'bg-green-500', text_color: 'text-white' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <PageHero
        badge="Events"
        title="本日のフリマイベント"
        subtitle="全国の出店者と直接チャットでお買い物"
      />

      {/* Filters */}
      <section className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container-main py-6 sm:py-8 space-y-5">
          {/* Region Filter */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-3">地域から探す</p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {REGIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRegion(r)}
                  className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                    region === r
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-3">カテゴリから探す</p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                    category === c
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Buttons */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-3">並び替え</p>
            <div className="flex gap-2">
              {([
                { key: 'time', label: '⏰ 時間順' },
                { key: 'region', label: '📍 地域順' },
                { key: 'sellers', label: '🏪 出店者数順' },
              ] as const).map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSortBy(s.key)}
                  className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                    sortBy === s.key
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <main className="flex-1">
        <section className="container-main py-12 sm:py-16">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg font-bold mb-4">該当するイベントがありません</p>
              <button
                onClick={() => {
                  setRegion('全国');
                  setCategory('すべて');
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-full font-bold hover:bg-orange-600 transition-all"
              >
                フィルターをリセット
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {sorted.map((event) => {
                const label = getStatusLabel(event.status);

                return (
                  <Link
                    key={event.id}
                    href={`/event/${event.id}`}
                    className="group"
                  >
                    <div className="bg-white rounded-3xl overflow-hidden border-2 border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all h-full flex flex-col">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 relative overflow-hidden">
                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />

                        <div className="relative">
                          <div className="flex items-center gap-3 mb-4">
                            <span className={`${label.bg} ${label.text_color} px-3 py-1 rounded-full text-xs font-black`}>
                              {label.text}
                            </span>
                          </div>

                          <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">
                            {event.startTime}〜{event.endTime}
                          </h3>

                          <p className="text-white/90 font-bold text-lg">{event.region}</p>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col">
                        <p className="text-xs text-orange-600 font-bold mb-3 tracking-widest uppercase">
                          {event.sellers.length} 店舗出店
                        </p>

                        {/* Sellers Preview */}
                        <div className="space-y-3 mb-6 flex-1">
                          {event.sellers.slice(0, 3).map((seller) => (
                            <div key={seller.id} className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center text-orange-600 flex-shrink-0">
                                <ProductIcon type={seller.icon} size={20} stroke={1.5} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{seller.name}</p>
                                <p className="text-xs text-gray-600">{seller.category}</p>
                              </div>
                            </div>
                          ))}
                          {event.sellers.length > 3 && (
                            <p className="text-xs text-orange-600 font-bold px-3 py-2 bg-orange-50 rounded-lg">
                              +{event.sellers.length - 3} 店舗
                            </p>
                          )}
                        </div>

                        {/* CTA Button */}
                        <button className="w-full py-3 bg-orange-50 text-orange-600 rounded-xl font-bold hover:bg-orange-100 transition-all flex items-center justify-center gap-2 group-hover:gap-3">
                          詳細を見る
                          <ArrowRightIcon size={16} stroke={2.5} className="transition-transform" />
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
