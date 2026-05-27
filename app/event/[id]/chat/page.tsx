'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getEventById, type Product } from '../../../lib/events';

type Message = {
  id: number;
  text: string;
  sender: 'me' | 'shop' | 'system';
  timestamp: string;
  productId?: number;
};

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const event = getEventById(eventId);

  // State
  const [products, setProducts] = useState<(Product & { soldOut: boolean })[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10分 = 600秒
  const [sessionEnded, setSessionEnded] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize products with soldOut state
  useEffect(() => {
    if (event) {
      setProducts(event.products.map((p) => ({ ...p, soldOut: false })));
      setSelectedProduct(event.products[0]);

      // 初期メッセージ
      setMessages([
        {
          id: 1,
          text: '接客が開始されました。10分間ごゆっくりお楽しみください！',
          sender: 'system',
          timestamp: '20:00',
        },
        {
          id: 2,
          text: `こんにちは！${event.name}です。本日はお越しいただきありがとうございます🌸`,
          sender: 'shop',
          timestamp: '20:00',
        },
        {
          id: 3,
          text: '気になる商品があれば、上のリストからタップしてください。商品の詳細やお値段相談もOKです！',
          sender: 'shop',
          timestamp: '20:00',
        },
      ]);
    }
  }, [event]);

  // タイマー
  useEffect(() => {
    if (sessionEnded) return;
    if (timeLeft <= 0) {
      setSessionEnded(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, sessionEnded]);

  // チャット自動スクロール
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const sendMessage = () => {
    if (!input.trim() || sessionEnded) return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: input.trim(),
      sender: 'me',
      timestamp: new Date().toTimeString().slice(0, 5),
    };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');

    // モック：自動返信
    setTimeout(() => {
      const replies = [
        'ありがとうございます😊',
        'こちらの商品、人気なんですよ✨',
        '在庫はまだございます！',
        'ご質問あればお気軽に',
        '値段相談も承ります💕',
        'まとめ買いだとお値引きできますよ🎁',
      ];
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: replies[Math.floor(Math.random() * replies.length)],
          sender: 'shop',
          timestamp: new Date().toTimeString().slice(0, 5),
        },
      ]);
    }, 1200);
  };

  const askAboutProduct = (product: Product) => {
    setSelectedProduct(product);
    const askMessage: Message = {
      id: messages.length + 1,
      text: `「${product.name}」について教えてください！`,
      sender: 'me',
      timestamp: new Date().toTimeString().slice(0, 5),
      productId: product.id,
    };
    setMessages((prev) => [...prev, askMessage]);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: `「${product.name}」ですね！${product.description}。¥${product.price.toLocaleString()}でいかがでしょうか？✨`,
          sender: 'shop',
          timestamp: new Date().toTimeString().slice(0, 5),
        },
      ]);
    }, 800);
  };

  const purchaseProduct = () => {
    if (!selectedProduct) return;
    setShowPurchaseModal(false);

    // 商品をSOLD OUTに変更
    setProducts((prev) =>
      prev.map((p) => (p.id === selectedProduct.id ? { ...p, soldOut: true } : p))
    );

    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        text: `「${selectedProduct.name}」を購入確定しました！`,
        sender: 'me',
        timestamp: new Date().toTimeString().slice(0, 5),
      },
      {
        id: prev.length + 2,
        text: `🎉 ご購入ありがとうございます！後ほど住所等のご連絡をお願いします。商品は SOLD OUT 表示に変更しました。`,
        sender: 'shop',
        timestamp: new Date().toTimeString().slice(0, 5),
      },
    ]);
  };

  if (!event || !selectedProduct) return null;

  // セッション終了画面
  if (sessionEnded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
          <div className="text-6xl mb-4">🌸</div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-3">
            接客時間が終了しました
          </h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            {event.name}さんとのチャットが終了しました。<br />
            ご利用ありがとうございました！
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/events"
              className="w-full px-6 py-3 bg-orange-500 text-white rounded-full font-bold text-sm hover:bg-orange-600 transition-all"
            >
              他のイベントを見る
            </Link>
            <Link
              href="/"
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-bold text-sm hover:bg-gray-200 transition-all"
            >
              トップへ戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md z-20 flex-shrink-0">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push(`/event/${eventId}`)}
            className="text-white hover:bg-white/10 rounded-full p-1.5 transition-all"
            aria-label="戻る"
          >
            ←
          </button>
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-lg sm:text-xl flex-shrink-0">
            {event.profileEmoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm sm:text-base truncate flex items-center gap-2">
              {event.name}
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-500 rounded-full text-[9px] font-bold">
                <span className="w-1 h-1 bg-white rounded-full animate-pulse" />LIVE
              </span>
            </p>
            <p className="text-[10px] sm:text-xs opacity-90">マンツーマン接客中 💕</p>
          </div>
          <div className={`text-right flex-shrink-0 ${timeLeft < 60 ? 'animate-pulse' : ''}`}>
            <p className="text-[10px] opacity-80">残り時間</p>
            <p className={`font-black text-base sm:text-lg ${timeLeft < 60 ? 'text-yellow-200' : ''}`}>
              {formatTime(timeLeft)}
            </p>
          </div>
        </div>

        {/* Time progress bar */}
        <div className="h-1 bg-white/20">
          <div
            className="h-full bg-yellow-300 transition-all duration-1000"
            style={{ width: `${(timeLeft / 600) * 100}%` }}
          />
        </div>
      </header>

      {/* ===== TOP HALF: Products ===== */}
      <div className="flex-1 bg-white border-b-4 border-orange-100 flex flex-col overflow-hidden min-h-0">
        {/* Selected Product Showcase */}
        <div className="p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-yellow-50 border-b border-orange-100 flex-shrink-0">
          <div className="flex gap-3 items-center">
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl flex-shrink-0 ${
              products.find((p) => p.id === selectedProduct.id)?.soldOut
                ? 'bg-gray-200 grayscale'
                : 'bg-gradient-to-br from-orange-200 to-orange-400'
            }`}>
              {selectedProduct.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-orange-600 bg-white px-2 py-0.5 rounded-full">
                  選択中
                </span>
                {products.find((p) => p.id === selectedProduct.id)?.soldOut && (
                  <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                    SOLD OUT
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base font-black text-gray-900 truncate">
                {selectedProduct.name}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-600 mb-1 line-clamp-1">
                {selectedProduct.description}
              </p>
              <p className="text-lg sm:text-xl font-black text-orange-600">
                ¥{selectedProduct.price.toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => setShowPurchaseModal(true)}
              disabled={products.find((p) => p.id === selectedProduct.id)?.soldOut}
              className="px-3 py-2 sm:px-4 sm:py-2.5 bg-orange-500 text-white rounded-full text-xs sm:text-sm font-black flex-shrink-0 hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {products.find((p) => p.id === selectedProduct.id)?.soldOut ? '売切' : '購入'}
            </button>
          </div>
        </div>

        {/* Product List - Horizontal Scroll */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4">
          <p className="text-xs font-bold text-gray-700 mb-2 px-1">
            商品一覧 ({products.filter((p) => !p.soldOut).length}/{products.length})
          </p>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => !product.soldOut && askAboutProduct(product)}
                disabled={product.soldOut}
                className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                  selectedProduct.id === product.id
                    ? 'border-orange-500 ring-2 ring-orange-200'
                    : 'border-gray-200'
                } ${product.soldOut ? 'opacity-60 cursor-not-allowed' : 'hover:border-orange-400 active:scale-95'}`}
              >
                <div className={`aspect-square flex items-center justify-center text-3xl sm:text-4xl relative ${
                  product.soldOut
                    ? 'bg-gray-100 grayscale'
                    : 'bg-gradient-to-br from-orange-100 to-yellow-100'
                }`}>
                  {product.emoji}
                  {product.soldOut && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white text-[10px] sm:text-xs font-black bg-red-500 px-2 py-0.5 rounded-full transform -rotate-12">
                        SOLD OUT
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-1.5 sm:p-2 bg-white">
                  <p className="text-[9px] sm:text-[10px] font-bold text-gray-900 line-clamp-1">
                    {product.name}
                  </p>
                  <p className={`text-[10px] sm:text-xs font-black ${product.soldOut ? 'text-gray-400 line-through' : 'text-orange-600'}`}>
                    ¥{product.price.toLocaleString()}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== BOTTOM HALF: Chat ===== */}
      <div className="flex-1 bg-orange-50 flex flex-col overflow-hidden min-h-0">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3">
          {messages.map((msg) => {
            if (msg.sender === 'system') {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <span className="bg-orange-100 text-orange-700 text-[10px] sm:text-xs px-3 py-1 rounded-full">
                    {msg.text}
                  </span>
                </div>
              );
            }

            const isMe = msg.sender === 'me';
            return (
              <div
                key={msg.id}
                className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
              >
                {!isMe && (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-sm sm:text-base flex-shrink-0">
                    {event.profileEmoji}
                  </div>
                )}
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  <div
                    className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isMe
                        ? 'bg-orange-500 text-white rounded-br-sm'
                        : 'bg-white text-gray-900 rounded-bl-sm shadow-sm border border-orange-100'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-gray-400 mt-0.5 px-1">{msg.timestamp}</span>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="bg-white border-t border-orange-100 p-2 sm:p-3 flex-shrink-0">
          <div className="flex gap-2 items-end">
            <div className="flex-1 bg-gray-100 rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="メッセージを入力..."
                className="w-full bg-transparent outline-none text-xs sm:text-sm placeholder-gray-400"
                disabled={sessionEnded}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sessionEnded}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm sm:text-base hover:bg-orange-600 transition-all disabled:opacity-50 active:scale-90 flex-shrink-0"
              aria-label="送信"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">{selectedProduct.emoji}</div>
              <p className="text-sm text-gray-600 mb-1">{selectedProduct.name}</p>
              <p className="text-3xl font-black text-orange-600">
                ¥{selectedProduct.price.toLocaleString()}
              </p>
            </div>

            <div className="bg-orange-50 rounded-2xl p-4 mb-6">
              <p className="text-xs font-bold text-orange-700 mb-2">💡 購入後の流れ</p>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• チャットで住所・支払い方法をご相談</li>
                <li>• 直接お振込・PayPay等で決済</li>
                <li>• 商品は出店者から直接発送</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={purchaseProduct}
                className="w-full px-6 py-3.5 bg-orange-500 text-white rounded-full font-black text-sm hover:bg-orange-600 transition-all active:scale-95"
              >
                購入を確定する
              </button>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="w-full px-6 py-3.5 bg-gray-100 text-gray-700 rounded-full font-bold text-sm hover:bg-gray-200 transition-all"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
