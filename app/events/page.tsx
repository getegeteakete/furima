'use client';

import Link from 'next/link';
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const REGIONS = ['全国', '北海道', '東北', '関東', '東京', '中部', '関西', '京都', '大阪', '中国', '四国', '九州', '福岡', '沖縄'];
const CATEGORIES = ['すべて', 'ハンドメイド', '古着', '雑貨', 'アクセサリー', 'ジュエリー', '食品', '家電', 'ベビー'];

type Status = 'live' | 'soon' | 'pending' | 'available';

const EVENTS: { id: number; time: string; date: string; region: string; name: string; seller: string; tags: string[]; reserved: number; max: number; status: Status; emoji: string }[] = [
  { id: 1, time: '20:00', date: '今日', region: '滋賀', name: 'mina.craft', seller: 'みなさん', tags: ['ハンドメイド', 'アクセサリー'], reserved: 4, max: 10, status: 'live', emoji: '💎' },
  { id: 2, time: '20:15', date: '今日', region: '京都', name: 'kyoto.vintage', seller: 'kyokoさん', tags: ['古着', 'レトロ'], reserved: 3, max: 8, status: 'soon', emoji: '👗' },
  { id: 3, time: '20:30', date: '今日', region: '大阪', name: 'osaka.antique', seller: 'たかしさん', tags: ['雑貨', '骨董'], reserved: 5, max: 5, status: 'soon', emoji: '🏺' },
  { id: 4, time: '21:00', date: '今日', region: '福岡', name: 'hakata.select', seller: 'ゆうこさん', tags: ['古着', 'トレンド'], reserved: 1, max: 10, status: 'pending', emoji: '👜' },
  { id: 5, time: '21:15', date: '今日', region: '北海道', name: 'hokkaido.food', seller: 'まいさん', tags: ['食品', '北海道産'], reserved: 7, max: 12, status: 'available', emoji: '🍯' },
  { id: 6, time: '21:30', date: '今日', region: '東京', name: 'tokyo.crafts', seller: 'はるかさん', tags: ['ハンドメイド', 'インテリア'], reserved: 2, max: 10, status: 'available', emoji: '🕯️' },
  { id: 7, time: '20:00', date: '明日', region: '名古屋', name: 'nagoya.jewelry', seller: 'りえさん', tags: ['ジュエリー', '天然石'], reserved: 6, max: 10, status: 'available', emoji: '💍' },
  { id: 8, time: '20:30', date: '明日', region: '沖縄', name: 'okinawa.beauty', seller: 'なみさん', tags: ['化粧品', '自然派'], reserved: 4, max: 8, status: 'available', emoji: '💄' },
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
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Header />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-orange-500 to-orange-600 text-white py-16 lg:py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-orange-400 rounded-full opacity-40 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-300 rounded-full opacity-30 -translate-x-1/3 translate-y-1/3" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-bold text-orange-100 mb-2">EVENTS</p>
          <h1 className="text-4xl lg:text-5xl font-black mb-4">本日のフリマイベント</h1>
          <p className="text-base lg:text-lg text-orange-100">
            全国の出店者と直接チャットでお買い物 ✨
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 lg:top-20 z-40 bg-white border-b border-orange-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">
          <div>
            <p className="text-xs font-bold text-gray-500 mb-2">地域で絞り込む</p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {REGIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRegion(r)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    region === r ? 'bg-orange-500 text-white shadow-md' : 'bg-orange-50 text-gray-700 hover:bg-orange-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 mb-2">カテゴリーで絞り込む</p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    category === c ? 'bg-orange-500 text-white shadow-md' : 'bg-orange-50 text-gray-700 hover:bg-orange-100'
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <p className="text-sm text-gray-600 mb-6">
          {filtered.length}件のイベント
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {filtered.map((event) => {
            const slugMap: Record<string, string> = {
              'mina.craft': 'mina-craft',
              'kyoto.vintage': 'kyoto-vintage',
              'osaka.antique': 'osaka-antique',
            };
            const eventSlug = slugMap[event.name] || 'mina-craft'; // フォールバック
            return (
            <Link
              key={event.id}
              href={`/event/${eventSlug}`}
              className="bg-white rounded-3xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all overflow-hidden border border-orange-100 group"
            >
              <div className="relative aspect-[16/9] bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center text-7xl">
                {event.emoji}
                <div className="absolute top-3 left-3">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${statusLabels[event.status].color}`}>
                    {event.status === 'live' && <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                    {statusLabels[event.status].text}
                  </span>
                </div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full">
                  <span className="text-xs font-bold text-gray-900">{event.date} {event.time}</span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-orange-600 font-bold">📍 {event.region}</span>
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-1">{event.name}</h3>
                <p className="text-xs text-gray-500 mb-3">出店者: {event.seller}</p>
                <div className="flex gap-1.5 flex-wrap mb-4">
                  {event.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-bold bg-orange-50 text-orange-700 px-2 py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-600">
                    <span className="font-bold text-orange-600">{event.reserved}</span>
                    <span> / {event.max}名予約</span>
                  </div>
                  <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full text-xs font-bold shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
                    {event.status === 'live' ? '入室する →' : '予約する →'}
                  </button>
                </div>
                {/* Progress bar */}
                <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all"
                    style={{ width: `${Math.min(100, (event.reserved / event.max) * 100)}%` }}
                  />
                </div>
              </div>
            </Link>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🔍</p>
            <p className="text-gray-600">条件に合うイベントが見つかりませんでした</p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
