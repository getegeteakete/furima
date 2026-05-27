'use client';

import Link from 'next/link';
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PRODUCTS = [
  { id: 1, name: 'レジン樹脂アクセサリー', price: 2800, stock: 3, sold: 5, status: 'active', emoji: '💎' },
  { id: 2, name: '天然石ブレスレット', price: 3200, stock: 5, sold: 4, status: 'active', emoji: '📿' },
  { id: 3, name: '刻印ペンダント', price: 1600, stock: 0, sold: 3, status: 'soldout', emoji: '🔱' },
  { id: 4, name: 'ハンドメイドピアス', price: 2400, stock: 2, sold: 6, status: 'active', emoji: '✨' },
];

export default function SellerPage() {
  const [tab, setTab] = useState<'overview' | 'products' | 'events' | 'analytics'>('overview');

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Header />

      {/* Dashboard Header */}
      <section className="bg-gradient-to-br from-orange-500 to-orange-600 text-white py-10 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-orange-100 mb-1">SELLER DASHBOARD</p>
              <h1 className="text-3xl lg:text-4xl font-black">こんにちは、mina.craftさん 👋</h1>
              <p className="text-orange-100 mt-2">今日のイベントは <span className="font-black text-white">20:00開始</span> です！</p>
            </div>
            <div className="flex gap-3">
              <button className="px-5 py-3 bg-white text-orange-600 rounded-full font-black text-sm shadow-lg hover:scale-105 transition-all">
                + 商品を追加
              </button>
              <Link href="/live" className="px-5 py-3 bg-red-500 text-white rounded-full font-black text-sm shadow-lg hover:scale-105 transition-all flex items-center gap-1.5">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                ライブ配信
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-16 lg:top-20 z-30 bg-white border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: 'overview' as const, label: '概要', icon: '📊' },
              { id: 'products' as const, label: '商品管理', icon: '📦' },
              { id: 'events' as const, label: 'イベント管理', icon: '📅' },
              { id: 'analytics' as const, label: '売上分析', icon: '📈' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-shrink-0 px-5 py-4 text-sm font-bold transition-colors whitespace-nowrap ${
                  tab === t.id
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <span className="mr-1.5">{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tab === 'overview' && <Overview />}
        {tab === 'products' && <Products />}
        {tab === 'events' && <Events />}
        {tab === 'analytics' && <Analytics />}
      </section>

      <Footer />
    </div>
  );
}

function Overview() {
  return (
    <div className="space-y-8">
      {/* Next event card */}
      <div className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-3xl p-6 lg:p-8 text-white shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="relative">
          <p className="text-orange-100 text-sm font-bold mb-2">📅 次回イベント</p>
          <h2 className="text-2xl lg:text-3xl font-black mb-4">本日 20:00 開催</h2>
          <div className="grid grid-cols-3 gap-4 mb-6 max-w-lg">
            <div>
              <p className="text-orange-100 text-xs mb-1">予約数</p>
              <p className="text-2xl lg:text-3xl font-black">7名</p>
            </div>
            <div>
              <p className="text-orange-100 text-xs mb-1">出品数</p>
              <p className="text-2xl lg:text-3xl font-black">12点</p>
            </div>
            <div>
              <p className="text-orange-100 text-xs mb-1">ステータス</p>
              <p className="text-lg lg:text-xl font-black text-yellow-300">✓ 成立</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-white text-orange-600 rounded-full font-bold text-sm shadow hover:scale-105 transition-all">
              詳細を見る
            </button>
            <button className="px-5 py-2.5 bg-white/20 backdrop-blur text-white border border-white/30 rounded-full font-bold text-sm hover:bg-white/30 transition-all">
              編集する
            </button>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: '今日の売上', value: '¥28,400', change: '+15%', up: true, icon: '💰' },
          { label: '販売個数', value: '12個', change: '+3', up: true, icon: '📦' },
          { label: 'チャット', value: '8件', change: '対応中', up: false, icon: '💬' },
          { label: 'フォロワー', value: '247人', change: '+12', up: true, icon: '⭐' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-500">{stat.label}</p>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className="text-2xl lg:text-3xl font-black text-gray-900 mb-1">{stat.value}</p>
            <p className={`text-xs font-bold ${stat.up ? 'text-green-600' : 'text-orange-600'}`}>
              {stat.up && '↑ '}{stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-lg font-black text-gray-900 mb-4">クイックアクション</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { emoji: '📦', label: '商品を追加', desc: '新規商品を登録' },
            { emoji: '📅', label: 'イベント予約', desc: '新規開催日を予約' },
            { emoji: '💬', label: 'チャット', desc: '未対応 3件' },
            { emoji: '📊', label: '売上分析', desc: '今月のレポート' },
          ].map((action) => (
            <button key={action.label} className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100 hover:shadow-lg hover:-translate-y-1 transition-all text-left group">
              <div className="w-12 h-12 bg-orange-100 group-hover:bg-orange-500 rounded-2xl flex items-center justify-center text-2xl mb-3 transition-colors">
                {action.emoji}
              </div>
              <p className="font-black text-gray-900 mb-1">{action.label}</p>
              <p className="text-xs text-gray-500">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Top products */}
      <div>
        <h3 className="text-lg font-black text-gray-900 mb-4">本日の売れ筋商品</h3>
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
          {PRODUCTS.slice(0, 3).map((p, idx) => (
            <div key={p.id} className={`flex items-center gap-4 p-4 ${idx < 2 ? 'border-b border-gray-100' : ''}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black ${
                idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-100 text-gray-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {idx + 1}位
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-2xl">{p.emoji}</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate">{p.name}</p>
                <p className="text-xs text-gray-500">¥{p.price.toLocaleString()} × {p.sold}個</p>
              </div>
              <p className="font-black text-orange-600">¥{(p.price * p.sold).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Products() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-gray-900">商品一覧 ({PRODUCTS.length})</h2>
        <button className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-bold text-sm shadow-md hover:scale-105 transition-all">
          + 新規商品
        </button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PRODUCTS.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square bg-gradient-to-br from-orange-200 to-orange-400 flex items-center justify-center text-7xl relative">
              {p.emoji}
              {p.status === 'soldout' && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-2xl font-black text-white">SOLD OUT</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <p className="font-bold text-gray-900 mb-1">{p.name}</p>
              <p className="text-2xl font-black text-orange-600 mb-3">¥{p.price.toLocaleString()}</p>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>在庫: <span className="font-bold text-gray-900">{p.stock}</span></span>
                <span>販売済: <span className="font-bold text-gray-900">{p.sold}</span></span>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-orange-50 text-orange-600 rounded-full text-xs font-bold hover:bg-orange-100 transition-colors">
                  編集
                </button>
                <button className="flex-1 py-2 bg-gray-50 text-gray-700 rounded-full text-xs font-bold hover:bg-gray-100 transition-colors">
                  {p.status === 'active' ? '非公開' : '公開'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Events() {
  const events = [
    { id: 1, date: '今日', time: '20:00-22:00', region: '滋賀', reserved: 7, max: 10, status: 'live' },
    { id: 2, date: '明日', time: '20:00-22:00', region: '滋賀', reserved: 3, max: 10, status: 'upcoming' },
    { id: 3, date: '5/30', time: '21:00-23:00', region: '京都', reserved: 0, max: 10, status: 'open' },
    { id: 4, date: '5/25', time: '20:00-22:00', region: '滋賀', reserved: 12, max: 10, status: 'completed' },
  ];
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-gray-900">イベント一覧</h2>
        <button className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-bold text-sm shadow-md hover:scale-105 transition-all">
          + 新規予約
        </button>
      </div>
      <div className="space-y-3">
        {events.map((e) => (
          <div key={e.id} className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex flex-col items-center justify-center">
                <p className="text-[10px] text-orange-700 font-bold">{e.date}</p>
                <p className="text-xs font-black text-orange-600">{e.time.split('-')[0]}</p>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs text-gray-500">📍 {e.region}</p>
                  {e.status === 'live' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white rounded-full text-[10px] font-black">
                      <span className="w-1 h-1 bg-white rounded-full animate-pulse" />LIVE
                    </span>
                  )}
                  {e.status === 'completed' && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold">完了</span>
                  )}
                </div>
                <p className="font-bold text-gray-900">{e.time}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1 max-w-xs">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>予約 {e.reserved}/{e.max}</span>
                      <span>{Math.min(100, Math.round((e.reserved / e.max) * 100))}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600" style={{ width: `${Math.min(100, (e.reserved / e.max) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button className="px-5 py-2 bg-orange-50 text-orange-600 rounded-full text-xs font-bold hover:bg-orange-100 transition-colors">
              {e.status === 'live' ? '配信中 →' : e.status === 'completed' ? 'レポート' : '管理'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Analytics() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-gray-900">売上分析</h2>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100">
          <p className="text-xs font-bold text-gray-500 mb-2">今月の売上</p>
          <p className="text-3xl font-black text-gray-900">¥184,200</p>
          <p className="text-xs text-green-600 font-bold mt-1">↑ +28%（先月比）</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100">
          <p className="text-xs font-bold text-gray-500 mb-2">開催回数</p>
          <p className="text-3xl font-black text-gray-900">8回</p>
          <p className="text-xs text-green-600 font-bold mt-1">↑ +3回（先月比）</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100">
          <p className="text-xs font-bold text-gray-500 mb-2">平均客単価</p>
          <p className="text-3xl font-black text-gray-900">¥3,420</p>
          <p className="text-xs text-green-600 font-bold mt-1">↑ +5%（先月比）</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100">
        <p className="text-sm font-bold text-gray-900 mb-4">月別売上推移</p>
        <div className="flex items-end justify-between gap-2 h-40">
          {[40, 55, 35, 70, 60, 85, 75, 95, 80, 110, 145, 184].map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-gradient-to-t from-orange-500 to-orange-300 rounded-t-lg transition-all hover:from-orange-600 hover:to-orange-400" style={{ height: `${v / 2}%` }} />
              <span className="text-[10px] text-gray-500">{i + 1}月</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
