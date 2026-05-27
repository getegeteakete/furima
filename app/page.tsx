'use client';

import { useState } from 'react';

export default function App() {
  const [view, setView] = useState<'home' | 'live' | 'seller'>('home');
  const [message, setMessage] = useState('');

  // ===== HOME VIEW =====
  if (view === 'home') {
    return (
      <div className="min-h-screen bg-white pb-16">
        {/* Demo Navigation */}
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <button
            onClick={() => setView('home')}
            className={`px-4 py-2 rounded-md text-xs font-medium transition-colors ${
              view === 'home' ? 'bg-black text-white' : 'bg-gray-200 text-black hover:bg-gray-300'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setView('live')}
            className={`px-4 py-2 rounded-md text-xs font-medium transition-colors ${
              view === 'live' ? 'bg-black text-white' : 'bg-gray-200 text-black hover:bg-gray-300'
            }`}
          >
            Live
          </button>
          <button
            onClick={() => setView('seller')}
            className={`px-4 py-2 rounded-md text-xs font-medium transition-colors ${
              view === 'seller' ? 'bg-black text-white' : 'bg-gray-200 text-black hover:bg-gray-300'
            }`}
          >
            Seller
          </button>
        </div>

        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 p-4">
          <p className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-2">
            フリマイベント
          </p>
          <h1 className="text-2xl font-medium text-black mb-4">本日のイベント</h1>
          <div className="flex gap-2">
            <select className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-black">
              <option>全国</option>
              <option>東京</option>
              <option>大阪</option>
              <option>福岡</option>
            </select>
            <button className="p-2 border border-gray-200 rounded-md bg-white text-black hover:bg-gray-50">
              🔍
            </button>
          </div>
        </div>

        {/* Banner */}
        <div className="m-4 p-5 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <p className="text-xs text-gray-600 font-medium mb-2">いますぐ</p>
          <h2 className="text-xl font-medium text-black mb-2">20:00 滋賀 OPEN</h2>
          <p className="text-sm text-gray-600">予約 3名 / 開催成立 ✓</p>
        </div>

        {/* Events List */}
        <div className="px-4 space-y-3">
          {[
            { time: '20:15', name: '京都ハンドメイド', tags: ['アクセ', '女性向け'], res: 2, status: 'available' },
            { time: '20:30', name: '大阪アンティーク', tags: ['雑貨', '骨董'], res: 5, status: 'full' },
            { time: '21:00', name: '福岡古着セレクト', tags: ['古着', 'トレンド'], res: 0, status: 'pending' },
          ].map((event, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200 p-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">{event.time} 開始</p>
                  <h3 className="text-sm font-medium text-black">{event.name}</h3>
                </div>
                <button className="text-gray-600 hover:text-black transition-colors text-lg">
                  ❤️
                </button>
              </div>
              <div className="px-4 pb-4">
                <div className="flex gap-2 mb-3">
                  {event.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  {event.status === 'full' ? `予約 ${event.res}名 / 満席` : event.status === 'pending' ? `予約 ${event.res}名 / 開催検討中` : `予約 ${event.res}名 / 残り ${5 - event.res}席`}
                </p>
                <button className={`w-full font-medium rounded-md text-sm py-3 transition-all ${
                  event.status === 'available'
                    ? 'bg-black text-white hover:bg-gray-900'
                    : 'bg-gray-100 text-black border border-gray-200 hover:bg-gray-50'
                }`}>
                  {event.status === 'available' ? '予約する' : event.status === 'full' ? 'キャンセル待ち' : 'リマインド設定'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
          <div className="flex justify-around items-center h-14 px-4">
            {[
              { emoji: '🏠', label: 'ホーム' },
              { emoji: '🔔', label: '通知' },
              { emoji: '❤️', label: 'お気に入り' },
              { emoji: '👤', label: 'マイページ' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1 py-2 px-4 text-center text-black">
                <span className="text-xl">{item.emoji}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </nav>
      </div>
    );
  }

  // ===== LIVE VIEW =====
  if (view === 'live') {
    return (
      <div className="min-h-screen bg-white flex flex-col pb-16">
        {/* Demo Navigation */}
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <button onClick={() => setView('home')} className={`px-4 py-2 rounded-md text-xs font-medium transition-colors ${view === 'home' ? 'bg-black text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`}>Home</button>
          <button onClick={() => setView('live')} className={`px-4 py-2 rounded-md text-xs font-medium transition-colors ${view === 'live' ? 'bg-black text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`}>Live</button>
          <button onClick={() => setView('seller')} className={`px-4 py-2 rounded-md text-xs font-medium transition-colors ${view === 'seller' ? 'bg-black text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`}>Seller</button>
        </div>

        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-600">京都ハンドメイド</p>
            <h2 className="text-lg font-medium text-black">mina.craft</h2>
          </div>
          <div className="flex gap-3 text-lg">
            <button className="text-black hover:text-gray-700">❤️</button>
            <button className="text-black hover:text-gray-700">⋮</button>
          </div>
        </div>

        {/* Product Section */}
        <div className="flex-none h-[60vh] bg-gray-100 border-b border-gray-200 overflow-y-auto">
          <div className="aspect-square bg-gray-200 flex items-center justify-center text-4xl">📷</div>
          <div className="p-4">
            <h3 className="text-lg font-medium text-black mb-2">レジン樹脂アクセサリー</h3>
            <div className="flex items-baseline gap-2 mb-3">
              <p className="text-2xl font-medium text-black">¥2,800</p>
              <p className="text-sm line-through text-gray-500">¥3,500</p>
            </div>
            <div className="flex gap-2 mb-3">
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">残り 3 個</span>
              <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded">⏱ タイムセール</span>
            </div>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">天然石を使用したユニークなレジン樹脂アクセサリーです。一点物なので他にはないデザインになっています。</p>
            <button className="w-full py-3 bg-black text-white rounded-md font-medium mb-2">カートに追加</button>
            <button className="w-full py-3 bg-white border border-gray-200 text-black rounded-md font-medium text-sm">詳細を見る</button>
          </div>
        </div>

        {/* Chat Section */}
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 sticky top-0 bg-white z-5">
            <button className="flex-1 py-3 px-4 text-sm font-medium text-black border-b-2 border-black">全体チャット</button>
            <button className="flex-1 py-3 px-4 text-sm font-medium text-gray-600 border-b-2 border-transparent">出店者に相談</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="flex justify-center py-2"><p className="text-xs text-gray-500">イベント開始</p></div>
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-gray-200 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-600 mb-1">ユーザー A</p>
                <div className="bg-gray-100 text-black rounded-2xl px-3 py-2 max-w-xs">このアクセ、すごく素敵ですね！</div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <div className="bg-black text-white rounded-2xl px-3 py-2 max-w-xs">色はどれが在庫ありますか？</div>
            </div>
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-200 flex-shrink-0 flex items-center justify-center text-blue-700 text-xs font-medium">出</div>
              <div>
                <p className="text-xs text-gray-600 mb-1">mina.craft</p>
                <div className="bg-gray-100 text-black rounded-2xl px-3 py-2 max-w-xs">ありがとうございます！ローズクォーツとアメジストが在庫あります。</div>
              </div>
            </div>
          </div>

          {/* Queue & Input */}
          <div className="bg-gray-50 border-t border-gray-200 p-3">
            <div className="flex justify-between items-center mb-3">
              <div className="flex gap-6 text-sm">
                <div>
                  <p className="text-xs text-gray-600 mb-1">接客中</p>
                  <p className="text-lg font-medium text-black">1 組</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">待機中</p>
                  <p className="text-lg font-medium text-black">2 組</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-black text-white rounded-md font-medium text-sm">相談する</button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="メッセージを入力..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-md bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button onClick={() => setMessage('')} className="p-2 bg-black text-white rounded-md hover:bg-gray-900 text-lg">
                ✈️
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== SELLER VIEW =====
  return (
    <div className="min-h-screen bg-white pb-16">
      {/* Demo Navigation */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button onClick={() => setView('home')} className={`px-4 py-2 rounded-md text-xs font-medium transition-colors ${view === 'home' ? 'bg-black text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`}>Home</button>
        <button onClick={() => setView('live')} className={`px-4 py-2 rounded-md text-xs font-medium transition-colors ${view === 'live' ? 'bg-black text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`}>Live</button>
        <button onClick={() => setView('seller')} className={`px-4 py-2 rounded-md text-xs font-medium transition-colors ${view === 'seller' ? 'bg-black text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`}>Seller</button>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 p-4">
        <p className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-2">出店者ダッシュボード</p>
        <h1 className="text-2xl font-medium text-black">mina.craft</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Next Event */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-600 font-medium mb-2">次回イベント</p>
          <h2 className="text-lg font-medium text-black mb-4">本日 20:15 開催</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">予約人数</p>
              <p className="text-2xl font-medium text-black">3 名</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">ステータス</p>
              <p className="text-base font-medium text-blue-600">✓ 開催成立</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 py-2 bg-black text-white rounded-md font-medium text-sm">イベント管理</button>
            <button className="flex-1 py-2 bg-gray-100 text-black border border-gray-200 rounded-md font-medium text-sm">詳細</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: '商品売上（本日）', value: '¥28,400', change: '+15%' },
            { label: '売上個数', value: '12 個', subtext: '開催中' },
            { label: 'チャット件数', value: '8 件', subtext: '対応中' },
            { label: 'フォロワー', value: '247 人', change: '+12' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-2">{stat.label}</p>
              <p className="text-xl font-medium text-black mb-1">{stat.value}</p>
              {stat.change && <p className="text-xs text-blue-600">↑ {stat.change}</p>}
              {stat.subtext && <p className="text-xs text-gray-600">{stat.subtext}</p>}
            </div>
          ))}
        </div>

        {/* Products */}
        <div>
          <h3 className="text-sm font-medium text-black mb-3">売れ筋商品（本日）</h3>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {[
              { name: 'レジン樹脂アクセサリー', price: '¥2,800', qty: '5 個', total: '¥14,000' },
              { name: '天然石ブレスレット', price: '¥3,200', qty: '4 個', total: '¥12,800' },
              { name: '刻印ペンダント', price: '¥1,600', qty: '3 個', total: '¥4,800' },
            ].map((product, idx) => (
              <div
                key={idx}
                className={`p-3 flex justify-between items-center ${idx < 2 ? 'border-b border-gray-200' : ''}`}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-black">{product.name}</p>
                  <p className="text-xs text-gray-600">{product.price} × {product.qty}</p>
                </div>
                <p className="text-sm font-medium text-black">{product.total}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div>
          <h3 className="text-sm font-medium text-black mb-3">アクション</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { emoji: '📦', label: '商品管理' },
              { emoji: '📅', label: 'イベント予約' },
              { emoji: '💬', label: 'チャット' },
              { emoji: '📊', label: '分析' },
            ].map((action) => (
              <button key={action.label} className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex flex-col items-center gap-2">
                <span className="text-2xl">{action.emoji}</span>
                <span className="text-xs font-medium text-black text-center">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
