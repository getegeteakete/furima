'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import Header from '../components/Header';

type Message = {
  id: number;
  sender: string;
  text: string;
  type: 'user' | 'seller' | 'me' | 'system';
  time: string;
};

const INITIAL_MESSAGES: Message[] = [
  { id: 1, sender: 'system', text: 'mina.craft のイベントが開始しました 🎉', type: 'system', time: '20:00' },
  { id: 2, sender: 'nana♡', text: 'こんばんは〜！楽しみにしてました！', type: 'user', time: '20:01' },
  { id: 3, sender: 'mina.craft', text: 'みなさんこんばんは✨ 今日もよろしくお願いします！', type: 'seller', time: '20:01' },
  { id: 4, sender: 'moru', text: 'このアクセサリー、ローズクォーツ入ってますよね？', type: 'user', time: '20:03' },
  { id: 5, sender: 'mina.craft', text: 'はい！天然のローズクォーツとアメジストを使用しています💎', type: 'seller', time: '20:03' },
  { id: 6, sender: 'parumu', text: 'めっちゃ可愛い！欲しい〜！', type: 'user', time: '20:04' },
];

const PRODUCTS = [
  { id: 1, name: 'レジン樹脂アクセサリー', price: 2800, original: 3500, stock: 3, emoji: '💎', soldOut: false },
  { id: 2, name: '天然石ブレスレット', price: 3200, stock: 5, emoji: '📿', soldOut: false },
  { id: 3, name: '刻印ペンダント', price: 1600, stock: 0, emoji: '🔱', soldOut: true },
  { id: 4, name: 'ハンドメイドピアス', price: 2400, original: 2800, stock: 2, emoji: '✨', soldOut: false },
];

export default function LivePage() {
  const [tab, setTab] = useState<'all' | 'private'>('all');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
  const [queueOpen, setQueueOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const now = new Date();
    setMessages([...messages, {
      id: Date.now(),
      sender: 'あなた',
      text: input,
      type: 'me',
      time: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
    }]);
    setInput('');

    // Simulated seller response
    setTimeout(() => {
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        sender: 'mina.craft',
        text: 'ご質問ありがとうございます！詳しくお答えしますね✨',
        type: 'seller',
        time: `${now.getHours()}:${String(now.getMinutes() + 1).padStart(2, '0')}`,
      }]);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Event header bar */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-full flex items-center justify-center text-2xl flex-shrink-0">
              💎
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500 rounded-full text-[10px] font-black">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />LIVE
                </span>
                <p className="text-xs text-orange-100">📍 滋賀</p>
              </div>
              <p className="font-black text-sm lg:text-base truncate">mina.craft</p>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-4 text-xs">
            <div className="text-center">
              <p className="text-orange-100 text-[10px]">視聴中</p>
              <p className="font-black">24人</p>
            </div>
            <div className="text-center">
              <p className="text-orange-100 text-[10px]">予約</p>
              <p className="font-black">7人</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content - Mobile: stacked, Desktop: 2-col */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto bg-white shadow-xl lg:my-4 lg:rounded-3xl overflow-hidden">
        {/* Product Section */}
        <div className="lg:w-1/2 lg:overflow-y-auto flex flex-col">
          {/* Main product */}
          <div className="relative aspect-square lg:aspect-auto lg:h-80 bg-gradient-to-br from-orange-200 via-orange-300 to-orange-400 flex items-center justify-center">
            <span className="text-9xl lg:text-[10rem]">{selectedProduct.emoji}</span>
            {/* Floating bubbles */}
            <div className="absolute top-4 left-4 right-4 flex gap-2 flex-wrap">
              <span className="px-3 py-1.5 bg-red-500 text-white rounded-full text-xs font-black shadow-lg animate-pulse">
                ⏱ タイムセール
              </span>
              {selectedProduct.stock <= 3 && !selectedProduct.soldOut && (
                <span className="px-3 py-1.5 bg-yellow-400 text-gray-900 rounded-full text-xs font-black shadow-lg">
                  残り{selectedProduct.stock}個！
                </span>
              )}
              {selectedProduct.soldOut && (
                <span className="px-3 py-1.5 bg-gray-900 text-white rounded-full text-xs font-black shadow-lg">
                  SOLD OUT
                </span>
              )}
            </div>
          </div>

          {/* Product details */}
          <div className="p-5 lg:p-6 border-b border-gray-100">
            <h2 className="text-xl lg:text-2xl font-black text-gray-900 mb-2">{selectedProduct.name}</h2>
            <div className="flex items-baseline gap-3 mb-4">
              <p className="text-3xl font-black text-orange-600">¥{selectedProduct.price.toLocaleString()}</p>
              {selectedProduct.original && (
                <p className="text-sm line-through text-gray-400">¥{selectedProduct.original.toLocaleString()}</p>
              )}
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              天然石を使用したユニークなレジン樹脂アクセサリー。一点物なので他にはないデザインです。お好みのカラーで仕上げます。
            </p>
            <button
              disabled={selectedProduct.soldOut}
              className={`w-full py-4 rounded-full font-black shadow-lg transition-all ${
                selectedProduct.soldOut
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-xl hover:scale-[1.02]'
              }`}
            >
              {selectedProduct.soldOut ? 'SOLD OUT' : '💬 出店者に相談する'}
            </button>
          </div>

          {/* Product list */}
          <div className="p-5 lg:p-6">
            <p className="text-xs font-bold text-gray-500 mb-3">本日の出品商品 ({PRODUCTS.length}点)</p>
            <div className="grid grid-cols-3 lg:grid-cols-4 gap-2">
              {PRODUCTS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className={`relative aspect-square rounded-2xl flex items-center justify-center text-3xl transition-all ${
                    selectedProduct.id === p.id
                      ? 'bg-orange-100 ring-2 ring-orange-500'
                      : 'bg-gray-100 hover:bg-orange-50'
                  }`}
                >
                  {p.emoji}
                  {p.soldOut && (
                    <span className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center text-[8px] font-black text-white">
                      SOLD
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="lg:w-1/2 flex flex-col bg-white border-l border-gray-100 min-h-[60vh] lg:min-h-0">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-white">
            <button
              onClick={() => setTab('all')}
              className={`flex-1 py-3 text-sm font-bold transition-colors ${
                tab === 'all' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500'
              }`}
            >
              💬 全体チャット
            </button>
            <button
              onClick={() => setTab('private')}
              className={`flex-1 py-3 text-sm font-bold transition-colors relative ${
                tab === 'private' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500'
              }`}
            >
              🔒 個別相談
              <span className="absolute top-2 right-3 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>

          {tab === 'all' ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-orange-50/30 to-white">
                {messages.map((msg) => {
                  if (msg.type === 'system') {
                    return (
                      <div key={msg.id} className="flex justify-center">
                        <span className="text-[10px] bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-bold">
                          {msg.text}
                        </span>
                      </div>
                    );
                  }
                  if (msg.type === 'me') {
                    return (
                      <div key={msg.id} className="flex justify-end gap-2">
                        <div className="max-w-[75%]">
                          <div className="bg-orange-500 text-white rounded-2xl rounded-tr-sm px-4 py-2.5">
                            <p className="text-sm">{msg.text}</p>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1 text-right">{msg.time}</p>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={msg.id} className="flex gap-2">
                      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black ${
                        msg.type === 'seller' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {msg.type === 'seller' ? '出' : msg.sender[0]}
                      </div>
                      <div className="max-w-[75%]">
                        <p className="text-[10px] font-bold text-gray-500 mb-0.5">{msg.sender}</p>
                        <div className={`rounded-2xl rounded-tl-sm px-4 py-2.5 ${
                          msg.type === 'seller' ? 'bg-orange-100 text-gray-900' : 'bg-white border border-gray-200 text-gray-900'
                        }`}>
                          <p className="text-sm">{msg.text}</p>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">{msg.time}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Queue info */}
              <button
                onClick={() => setQueueOpen(!queueOpen)}
                className="bg-orange-50 border-t border-orange-100 px-4 py-3 flex items-center justify-between hover:bg-orange-100 transition-colors"
              >
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-gray-500">接客中:</span>
                    <span className="font-black text-orange-600 ml-1">1組</span>
                  </div>
                  <div>
                    <span className="text-gray-500">待機:</span>
                    <span className="font-black text-orange-600 ml-1">2組</span>
                  </div>
                </div>
                <span className="text-orange-600 text-lg">{queueOpen ? '−' : '+'}</span>
              </button>

              {queueOpen && (
                <div className="bg-orange-50 px-4 pb-4 border-b border-orange-100">
                  <div className="bg-white rounded-xl p-3 space-y-2 shadow-sm">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center font-black text-[10px]">1</span>
                      <span className="font-bold">nana♡</span>
                      <span className="text-gray-400">接客中...</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center font-black text-[10px]">2</span>
                      <span className="font-bold">moru</span>
                      <span className="text-gray-400">待機中</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center font-black text-[10px]">3</span>
                      <span className="font-bold text-orange-600">あなた</span>
                      <span className="text-gray-400">次番</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="border-t border-gray-200 p-3 flex gap-2 bg-white">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="メッセージを入力..."
                  className="flex-1 px-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-bold shadow-md disabled:opacity-50 hover:scale-110 transition-all"
                >
                  ↑
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="text-6xl mb-4">🔒</div>
              <h3 className="text-lg font-black text-gray-900 mb-2">個別相談チャット</h3>
              <p className="text-sm text-gray-600 mb-6 max-w-xs">
                出店者と1対1で会話できます。<br />
                商品の詳細・サイズ確認・<br />
                住所交換などはこちらで。
              </p>
              <div className="bg-orange-50 rounded-2xl p-4 max-w-sm w-full">
                <p className="text-xs text-orange-700 font-bold mb-2">📋 現在の整理券</p>
                <p className="text-4xl font-black text-orange-600 mb-1">3番目</p>
                <p className="text-xs text-gray-600">あと約 5分でお呼びします</p>
              </div>
              <button className="mt-6 px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-bold shadow-lg">
                整理券を取る
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
