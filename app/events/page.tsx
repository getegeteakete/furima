'use client';

import Link from 'next/link';
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageHero from '../components/PageHero';

const REGIONS = ['全国', '北海道', '東北', '関東', '東京', '中部', '関西', '京都', '大阪', '中国', '四国', '九州', '福岡', '沖縄'];
const CATEGORIES = ['すべて', 'ハンドメイド', '古着', '雑貨', 'アクセサリー', 'ジュエリー', '食品', '家電', 'ベビー'];

type Status = 'live' | 'soon' | 'pending' | 'available';

type EventItem = {
  id: number;
  slug: string;
  time: string;
  date: string;
  region: string;
  name: string;
  seller: string;
  tags: string[];
  reserved: number;
  max: number;
  status: Status;
  emoji: string;
};

const EVENTS: EventItem[] = [
  { id: 1, slug: 'mina-craft', time: '20:00', date: '今日', region: '滋賀', name: 'mina.craft', seller: 'みなさん', tags: ['ハンドメイド', 'アクセサリー'], reserved: 7, max: 10, status: 'live', emoji: '💎' },
  { id: 2, slug: 'kyoto-vintage', time: '20:15', date: '今日', region: '京都', name: 'kyoto.vintage', seller: 'kyokoさん', tags: ['古着', 'レトロ'], reserved: 5, max: 8, status: 'soon', emoji: '👗' },
  { id: 3, slug: 'osaka-antique', time: '20:30', date: '今日', region: '大阪', name: 'osaka.antique', seller: 'たかしさん', tags: ['雑貨', '骨董'], reserved: 3, max: 10, status: 'soon', emoji: '🏺' },
  { id: 4, slug: 'mina-craft', time: '21:00', date: '今日', region: '福岡', name: 'hakata.select', seller: 'ゆうこさん', tags: ['古着', 'トレンド'], reserved: 1, max: 10, status: 'pending', emoji: '👜' },
  { id: 5, slug: 'mina-craft', time: '21:15', date: '今日', region: '北海道', name: 'hokkaido.food', seller: 'まいさん', tags: ['食品', '北海道産'], reserved: 7, max: 12, status: 'available', emoji: '🍯' },
  { id: 6, slug: 'mina-craft', time: '21:30', date: '今日', region: '東京', name: 'tokyo.crafts', seller: 'はるかさん', tags: ['ハンドメイド', 'インテリア'], reserved: 2, max: 10, status: 'available', emoji: '🕯️' },
  { id: 7, slug: 'mina-craft', time: '20:00', date: '明日', region: '名古屋', name: 'nagoya.jewelry', seller: 'りえさん', tags: ['ジュエリー', '天然石'], reserved: 6, max: 10, status: 'available', emoji: '💍' },
  { id: 8, slug: 'mina-craft', time: '20:30', date: '明日', region: '沖縄', name: 'okinawa.beauty', seller: 'なみさん', tags: ['化粧品', '自然派'], reserved: 4, max: 8, status: 'available', emoji: '💄' },
];

const statusLabels: Record<Status, { text: string; color: string }> = {
  live: { text: 'LIVE中', color: 'bg-red-500 text-white' },
  soon: { text: 'まもなくOPEN', color: 'bg-orange-500 text-white' },
  pending: { text: '開催検討中', color: 'bg-yellow-400 text-gray-900' },
  available: { text: '予約受付中', color: 'bg-green-500 text-white' },
};

export default function EventsPage() {
  const [region, setRegion] = useState('全国');
  const [category, setCategory] = useState('すべて');

  const filtered = EVENTS.filter((e) =>
    (region === '全国' || e.region === region) &&
    (category === 'すべて' || e.tags.some(t => t.includes(category)))
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <PageHero
        badge="Events"
        title="本日のフリマイベント"
        subtitle="全国の出店者と直接チャットでお買い物 ✨"
      />

      {/* Filters */}
      <section className="sticky top-16 lg:top-20 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 space-y-4">
          <div>
            <p className="text-xs font-bold text-gray-500 mb-2 tracking-widest uppercase">地域</p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {REGIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRegion(r)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    region === r
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 mb-2 tracking-widest uppercase">カテゴリー</p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    category === c
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <p className="text-xs sm:text-sm text-gray-600">
              <span className="font-black text-orange-600 text-base sm:text-lg">{filtered.length}</span> 件のイベント
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              {region !== '全国' && `${region} / `}{category !== 'すべて' && category}
            </p>
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {filtered.map((event) => (
                <Link
                  key={event.id}
                  href={`/event/${event.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-orange-300 hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  {/* Image area */}
                  <div className="relative aspect-[16/10] bg-gradient-to-br from-orange-300 via-orange-400 to-orange-500 flex items-center justify-center">
                    <span className="text-7xl sm:text-8xl group-hover:scale-110 transition-transform">{event.emoji}</span>
                    {/* Status badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black ${statusLabels[event.status].color}`}>
                        {event.status === 'live' && <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                        {statusLabels[event.status].text}
                      </span>
                    </div>
                    {/* Time badge */}
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur text-gray-900 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold">
                      {event.date} {event.time}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-5">
                    {/* Region */}
                    <p className="text-xs font-bold text-orange-600 mb-1.5">📍 {event.region}</p>

                    {/* Name */}
                    <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-1">{event.name}</h3>
                    <p className="text-xs text-gray-500 mb-3">出店者: {event.seller}</p>

                    {/* Tags */}
                    <div className="flex gap-1.5 flex-wrap mb-4">
                      {event.tags.map((tag) => (
                        <span key={tag} className="text-[10px] sm:text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full font-bold">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Footer: Progress + CTA */}
                    <div className="pt-4 border-t border-gray-100 space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-gray-600">予約状況</span>
                          <span className="font-black text-orange-600">{event.reserved} / {event.max}名</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all"
                            style={{ width: `${Math.min(100, (event.reserved / event.max) * 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          残り <span className="font-bold text-gray-900">{event.max - event.reserved}名</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-orange-600 font-black text-xs sm:text-sm group-hover:gap-2 transition-all">
                          {event.status === 'live' ? '入室する' : '予約する'} →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 py-16 sm:py-20 text-center">
              <div className="text-6xl sm:text-7xl mb-4">🔍</div>
              <p className="text-base sm:text-lg font-bold text-gray-900 mb-2">該当するイベントが見つかりません</p>
              <p className="text-xs sm:text-sm text-gray-500 mb-6">条件を変更して再度お試しください</p>
              <button
                onClick={() => { setRegion('全国'); setCategory('すべて'); }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-full font-bold text-sm hover:bg-orange-600 transition-all"
              >
                フィルターをリセット
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
