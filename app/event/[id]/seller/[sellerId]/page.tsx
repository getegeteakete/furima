'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import Link from 'next/link';
import {
  ProductIcon,
  ArrowLeftIcon,
  SendIcon,
  CloseIcon,
  CheckIcon,
  HeartIcon,
  RefreshIcon,
} from '../../../../components/Icons';
import { getTimeSlotEventById, getSellerById, type Product } from '../../../../lib/events';
import {
  getChatSettings,
  startSession,
  endSession,
  createTransaction,
  CURRENT_MOCK_BUYER_ID,
  fetchRoomMessages,
  sendChatMessage,
  subscribeToRoom,
  type ChatSettings,
  type ChatRoomMessage,
} from '../../../../lib/supabaseStore';
import { useAuth } from '../../../../components/AuthProvider';

type Message = {
  id: string;
  text: string;
  sender: 'me' | 'shop' | 'system';
  timestamp: string;
  productId?: number;
  images?: string[]; // ⑧ 画像URL（dataURL）
};

// HH:mm 整形
function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
}

// DBの ChatRoomMessage → 画面表示用 Message（閲覧者視点で me/shop を判定）
function toMessage(m: ChatRoomMessage, viewerId: string): Message {
  const sender: Message['sender'] =
    m.senderRole === 'system'
      ? 'system'
      : m.senderRole === 'buyer' && m.senderId === viewerId
        ? 'me'
        : 'shop';
  return {
    id: m.id,
    text: m.text,
    sender,
    timestamp: fmtTime(m.createdAt),
    images: m.images.length > 0 ? m.images : undefined,
  };
}

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const sellerId = params.sellerId as string;
  const event = getTimeSlotEventById(eventId);
  const seller = getSellerById(sellerId);

  const [products, setProducts] = useState<(Product & { soldOut: boolean })[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(600);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [endReason, setEndReason] = useState<'timeout' | 'manual'>('manual'); // ⑨
  const [overtimeSeconds, setOvertimeSeconds] = useState(0); // ⑨ 超過時間
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [chatTab, setChatTab] = useState<'private' | 'public'>('private');
  const [chatSettings, setChatSettings] = useState<ChatSettings | null>(null); // ⑧⑨
  const [selectedImages, setSelectedImages] = useState<{ id: string; dataUrl: string }[]>([]); // ⑧
  const [reRequested, setReRequested] = useState(false); // ⑨ 再リクエスト
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [publicMessages, setPublicMessages] = useState<Message[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ログイン中の購入者の識別情報（未ログイン時はデモ購入者にフォールバック）
  const { profile } = useAuth();
  const buyerId = profile?.id ?? CURRENT_MOCK_BUYER_ID;
  const buyerName = profile?.name ?? '山田太郎';

  useEffect(() => {
    if (seller) {
      setProducts(seller.products.map((p) => ({ ...p, soldOut: false })));
      setSelectedProduct(seller.products[0]);
    }
  }, [seller]);

  // 重複なしで追記（Realtime のエコーと楽観追加の二重表示を防ぐ）
  const appendUnique = (
    setter: Dispatch<SetStateAction<Message[]>>,
    msg: Message,
  ) => setter((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));

  // 個別チャット & 全体チャットの履歴読み込み + Realtime購読
  useEffect(() => {
    if (!event || !seller) return;
    let active = true;

    // 履歴の読み込み（個別 / 全体）
    (async () => {
      const [priv, pub] = await Promise.all([
        fetchRoomMessages(event.id, seller.id, buyerId),
        fetchRoomMessages(event.id, null, null),
      ]);
      if (!active) return;
      setMessages(
        priv.length > 0
          ? priv.map((m) => toMessage(m, buyerId))
          : [
              {
                id: 'welcome-private',
                text: `接客が開始されました。${seller.name} とのマンツーマンチャットです。ごゆっくりどうぞ！`,
                sender: 'system',
                timestamp: event.startTime,
              },
            ],
      );
      setPublicMessages(
        pub.length > 0
          ? pub.map((m) => toMessage(m, buyerId))
          : [
              {
                id: 'welcome-public',
                text: `${seller.name} がOPENしました！`,
                sender: 'system',
                timestamp: event.startTime,
              },
            ],
      );
    })();

    // Realtime購読（個別 / 全体）
    const unsubPrivate = subscribeToRoom(event.id, seller.id, buyerId, (m) =>
      appendUnique(setMessages, toMessage(m, buyerId)),
    );
    const unsubPublic = subscribeToRoom(event.id, null, null, (m) =>
      appendUnique(setPublicMessages, toMessage(m, buyerId)),
    );

    return () => {
      active = false;
      unsubPrivate();
      unsubPublic();
    };
  }, [event, seller, buyerId]);

  // ⑧⑨ チャット設定を読み込み + ⑥ セッション開始（ロック取得）
  useEffect(() => {
    const settings = getChatSettings();
    setChatSettings(settings);
    setTimeLeft(settings.sessionDurationSeconds);

    if (event && seller) {
      startSession(CURRENT_MOCK_BUYER_ID, event.id, seller.id);
    }
    // アンマウント時にセッション解除
    return () => {
      if (event) endSession(CURRENT_MOCK_BUYER_ID, event.id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ⑨ タイマー：0到達後は超過時間をマイナスカウント
  useEffect(() => {
    if (sessionEnded) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          // 時間切れ
          if (chatSettings?.autoCloseOnTimeout) {
            setEndReason('timeout');
            setSessionEnded(true);
            return 0;
          }
          // 自動退出OFF → 超過時間カウント開始
          setOvertimeSeconds((o) => o + 1);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionEnded, chatSettings]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, publicMessages, chatTab]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // ⑨ 超過時間をマイナス表示
  const formatOvertime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `−${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // ⑧ 画像選択（サイズ・枚数チェック）
  const handleImageSelect = (files: FileList | null) => {
    if (!files || !chatSettings) return;
    const maxBytes = chatSettings.maxImageSizeMB * 1024 * 1024;
    const toAdd: { id: string; dataUrl: string }[] = [];

    Array.from(files).forEach((file) => {
      if (file.size > maxBytes) {
        alert(`「${file.name}」は${chatSettings.maxImageSizeMB}MBを超えています`);
        return;
      }
      if (selectedImages.length + toAdd.length >= chatSettings.maxImagesPerMessage) {
        alert(`画像は最大${chatSettings.maxImagesPerMessage}枚までです`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImages((prev) => {
          if (prev.length >= chatSettings.maxImagesPerMessage) return prev;
          return [...prev, { id: Math.random().toString(36).slice(2), dataUrl: e.target?.result as string }];
        });
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ⑨ 手動終了
  const handleManualEnd = () => {
    setEndReason('manual');
    setSessionEnded(true);
    if (event) endSession(CURRENT_MOCK_BUYER_ID, event.id);
  };

  // ⑨ 再リクエスト（順番の最後に並ぶ）
  const handleReRequest = () => {
    setReRequested(true);
  };

  const sendMessage = async () => {
    if ((!input.trim() && selectedImages.length === 0) || sessionEnded) return;
    if (!event || !seller) return;

    const text = input.trim();
    const images = selectedImages.map((i) => i.dataUrl);
    setInput('');
    setSelectedImages([]);

    // 実DBへ送信（Realtime購読が自分の挿入も受信して画面へ反映。appendUniqueで重複防止）
    const saved = await sendChatMessage({
      eventId: event.id,
      sellerId: seller.id,
      buyerId,
      senderRole: 'buyer',
      senderId: buyerId,
      senderName: buyerName,
      text,
      images,
    });
    // 楽観表示（Realtimeが遅延/失敗しても即時に見える。idはDB採番のものを使用）
    if (saved) appendUnique(setMessages, toMessage(saved, buyerId));
  };

  const askAboutProduct = async (product: Product) => {
    setSelectedProduct(product);
    if (!event || !seller) return;
    const saved = await sendChatMessage({
      eventId: event.id,
      sellerId: seller.id,
      buyerId,
      senderRole: 'buyer',
      senderId: buyerId,
      senderName: buyerName,
      text: `「${product.name}」について教えてください！`,
    });
    if (saved) {
      const msg = toMessage(saved, buyerId);
      appendUnique(setMessages, { ...msg, productId: product.id });
    }
  };

  const purchaseProduct = async () => {
    if (!selectedProduct || !event || !seller) return;
    setShowPurchaseModal(false);

    setProducts((prev) =>
      prev.map((p) => (p.id === selectedProduct.id ? { ...p, soldOut: true } : p))
    );

    // 購入確定の連絡を実チャットへ送信（出店者にリアルタイムで届く）
    const saved = await sendChatMessage({
      eventId: event.id,
      sellerId: seller.id,
      buyerId,
      senderRole: 'buyer',
      senderId: buyerId,
      senderName: buyerName,
      text: `「${selectedProduct.name}」を購入確定しました！住所等のご連絡をお願いします。`,
    });
    if (saved) appendUnique(setMessages, toMessage(saved, buyerId));

    // ① 取引履歴に記録（接客チャットの内容をスナップショット・継続会話の起点）
    const snapshot = [...messages, ...(saved ? [toMessage(saved, buyerId)] : [])]
      .filter((m) => m.sender !== 'system')
      .map((m) => ({
        text: m.text,
        sender: (m.sender === 'me' ? 'buyer' : 'seller') as 'buyer' | 'seller',
        timestamp: m.timestamp,
        images: m.images,
      }));
    createTransaction({
      eventId: event.id,
      eventTitle: `${event.startTime}〜${event.endTime} ${event.region}`,
      sellerId: seller.id,
      sellerName: seller.name,
      buyerId,
      buyerName,
      productName: selectedProduct.name,
      productPrice: selectedProduct.price,
      messages: snapshot,
    });
  };

  if (!event || !seller) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container-main py-20 text-center">
          <p className="text-xl text-gray-600">イベントまたは出店者が見つかりません</p>
          <Link href="/events" className="inline-block mt-6 text-orange-600 font-bold">
            ← イベント一覧へ戻る
          </Link>
        </div>
      </div>
    );
  }

  if (!event || !selectedProduct) return null;

  if (sessionEnded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-2xl text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-3xl mb-5 text-orange-600">
            <HeartIcon size={40} stroke={1.5} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">
            {endReason === 'timeout' ? '接客時間が終了しました' : '接客を終了しました'}
          </h2>

          {/* ⑨ 超過時間の表示 */}
          {overtimeSeconds > 0 && (
            <div className="bg-red-50 rounded-2xl p-4 mb-4">
              <p className="text-xs text-red-600 font-bold mb-1">超過時間</p>
              <p className="text-3xl font-black text-red-500 font-mono">
                {formatOvertime(overtimeSeconds)}
              </p>
            </div>
          )}

          <p className="text-sm text-gray-600 mb-8 leading-relaxed">
            {seller.name}さんとのチャットが終了しました。<br />
            ご利用ありがとうございました！
          </p>

          <div className="flex flex-col gap-3">
            {/* ⑨ 再リクエスト（設定で許可されている場合） */}
            {chatSettings?.allowReRequest && (
              reRequested ? (
                <div className="w-full px-6 py-3.5 bg-green-100 text-green-700 rounded-full font-bold text-sm flex items-center justify-center gap-2">
                  <CheckIcon size={18} stroke={2.5} />
                  再リクエストを送信しました（順番待ちの最後尾に追加）
                </div>
              ) : (
                <button
                  onClick={handleReRequest}
                  className="w-full px-6 py-3.5 bg-blue-600 text-white rounded-full font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <RefreshIcon size={18} stroke={2} />
                  もう一度 {seller.name} に並ぶ
                </button>
              )
            )}
            <Link
              href={`/event/${eventId}`}
              className="w-full px-6 py-3.5 bg-orange-500 text-white rounded-full font-bold text-sm hover:bg-orange-600 transition-all"
            >
              他の出店者を見る
            </Link>
            <Link
              href="/events"
              className="w-full px-6 py-3.5 bg-gray-100 text-gray-700 rounded-full font-bold text-sm hover:bg-gray-200 transition-all"
            >
              イベント一覧へ
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
            <ArrowLeftIcon size={20} stroke={2} />
          </button>
          <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center flex-shrink-0">
            <ProductIcon type={seller.icon} size={22} stroke={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm sm:text-base truncate flex items-center gap-2">
              {seller.name}
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-500 rounded-full text-[9px] font-bold">
                <span className="w-1 h-1 bg-white rounded-full animate-pulse" />LIVE
              </span>
            </p>
            <p className="text-xs opacity-90">{chatTab === 'private' ? 'マンツーマン接客中' : '全体チャット'}</p>
          </div>
          <div className={`text-right flex-shrink-0 ${timeLeft < 60 && timeLeft > 0 ? 'animate-pulse' : ''}`}>
            <p className="text-[10px] opacity-80">{overtimeSeconds > 0 ? '超過時間' : '残り時間'}</p>
            <p className={`font-black text-base sm:text-lg font-mono ${
              overtimeSeconds > 0 ? 'text-red-200' : timeLeft < 60 ? 'text-yellow-200' : ''
            }`}>
              {overtimeSeconds > 0 ? formatOvertime(overtimeSeconds) : formatTime(timeLeft)}
            </p>
          </div>
          <button
            onClick={handleManualEnd}
            className="flex-shrink-0 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-full text-xs font-bold transition-all active:scale-95"
          >
            終了
          </button>
        </div>
        
        {/* Chat Tab Navigation */}
        <div className="px-4 border-t border-white/20 flex gap-2">
          <button
            onClick={() => setChatTab('private')}
            className={`flex-1 py-3 px-4 text-sm font-bold transition-all border-b-2 ${
              chatTab === 'private'
                ? 'border-white text-white'
                : 'border-transparent text-white/70 hover:text-white'
            }`}
          >
            個別チャット
          </button>
          <button
            onClick={() => setChatTab('public')}
            className={`flex-1 py-3 px-4 text-sm font-bold transition-all border-b-2 ${
              chatTab === 'public'
                ? 'border-white text-white'
                : 'border-transparent text-white/70 hover:text-white'
            }`}
          >
            全体チャット
          </button>
        </div>
        
        <div className="h-1 bg-white/20">
          <div
            className={`h-full transition-all duration-1000 ${overtimeSeconds > 0 ? 'bg-red-400' : 'bg-yellow-300'}`}
            style={{ width: overtimeSeconds > 0 ? '100%' : `${chatSettings ? (timeLeft / chatSettings.sessionDurationSeconds) * 100 : 0}%` }}
          />
        </div>
      </header>

      {/* TOP HALF: Products (個別チャット時のみ) */}
      {chatTab === 'private' && (
      <div className="flex-shrink-0 sm:flex-1 bg-white border-b-4 border-orange-100 flex flex-col overflow-hidden min-h-0 max-h-[42vh] sm:max-h-none">
        <div className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 border-b border-orange-100 flex-shrink-0">
          <div className="flex gap-3 items-center">
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              products.find((p) => p.id === selectedProduct.id)?.soldOut
                ? 'bg-gray-200 text-gray-400'
                : 'bg-gradient-to-br from-orange-200 to-orange-400 text-orange-800'
            }`}>
              <ProductIcon type={selectedProduct.icon} size={40} stroke={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-orange-600 bg-white px-2 py-0.5 rounded-full">選択中</span>
                {products.find((p) => p.id === selectedProduct.id)?.soldOut && (
                  <span className="text-[10px] font-bold text-red-600 bg-red-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                    SOLD OUT
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base font-black text-gray-900 truncate">
                {selectedProduct.name}
              </p>
              <p className="text-xs text-gray-600 mb-1 line-clamp-1">{selectedProduct.description}</p>
              <p className="text-lg sm:text-xl font-black text-orange-600">
                ¥{selectedProduct.price.toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => setShowPurchaseModal(true)}
              disabled={products.find((p) => p.id === selectedProduct.id)?.soldOut}
              className="px-4 py-2.5 bg-orange-500 text-white rounded-full text-sm font-black flex-shrink-0 hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {products.find((p) => p.id === selectedProduct.id)?.soldOut ? '売切' : '購入'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
          <p className="text-xs font-bold text-gray-700 mb-3 px-1">
            商品一覧 ({products.filter((p) => !p.soldOut).length}/{products.length})
            <span className="sm:hidden text-gray-400 font-normal ml-1">← 横にスクロール</span>
          </p>

          {/* スマホ: 横スクロール / PC: グリッド */}
          <div className="flex sm:grid sm:grid-cols-3 gap-3 overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0 scrollbar-hide -mx-1 px-1">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => !product.soldOut && askAboutProduct(product)}
                disabled={product.soldOut}
                className={`relative rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 w-28 sm:w-auto ${
                  selectedProduct.id === product.id
                    ? 'border-orange-500 ring-2 ring-orange-200'
                    : 'border-gray-200 dark:border-gray-800'
                } ${product.soldOut ? 'opacity-60 cursor-not-allowed' : 'hover:border-orange-400 active:scale-95'}`}
              >
                <div className={`aspect-square flex items-center justify-center relative ${
                  product.soldOut
                    ? 'bg-gray-100 text-gray-400'
                    : 'bg-gradient-to-br from-orange-100 to-yellow-100 text-orange-700'
                }`}>
                  <ProductIcon type={product.icon} size={32} stroke={1.5} />
                  {product.soldOut && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white text-[10px] font-black bg-red-500 px-2 py-0.5 rounded-full transform -rotate-12">
                        SOLD OUT
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-2 bg-white">
                  <p className="text-[11px] font-bold text-gray-900 line-clamp-1">
                    {product.name}
                  </p>
                  <p className={`text-xs font-black ${product.soldOut ? 'text-gray-400 line-through' : 'text-orange-600'}`}>
                    ¥{product.price.toLocaleString()}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* BOTTOM HALF: Chat */}
      <div className="flex-1 bg-orange-50 flex flex-col overflow-hidden min-h-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {(chatTab === 'private' ? messages : publicMessages).map((msg) => {
            if (msg.sender === 'system') {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <span className="bg-orange-100 text-orange-700 text-[10px] sm:text-xs px-3 py-1.5 rounded-full">
                    {msg.text}
                  </span>
                </div>
              );
            }

            const isMe = msg.sender === 'me';
            return (
              <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                {!isMe && (
                  <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <ProductIcon type={seller.icon} size={18} stroke={1.5} />
                  </div>
                )}
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  {/* ⑧ 画像表示 */}
                  {msg.images && msg.images.length > 0 && (
                    <div className={`grid gap-1 mb-1 ${msg.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                      {msg.images.map((img, idx) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={idx}
                          src={img}
                          alt={`送信画像${idx + 1}`}
                          className="rounded-xl max-w-[140px] max-h-[140px] object-cover border border-orange-100"
                        />
                      ))}
                    </div>
                  )}
                  {msg.text && (
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? 'bg-orange-500 text-white rounded-br-sm'
                          : 'bg-white text-gray-900 rounded-bl-sm shadow-sm border border-orange-100'
                      }`}
                    >
                      {msg.text}
                    </div>
                  )}
                  <span className="text-[10px] text-gray-400 mt-0.5 px-1">{msg.timestamp}</span>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {chatTab === 'private' && (
          <div className="bg-white border-t border-orange-100 p-3 flex-shrink-0">
            {/* ⑧ 選択済み画像プレビュー */}
            {selectedImages.length > 0 && (
              <div className="flex gap-2 mb-2 flex-wrap">
                {selectedImages.map((img) => (
                  <div key={img.id} className="relative w-14 h-14 rounded-lg overflow-hidden border border-orange-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.dataUrl} alt="プレビュー" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setSelectedImages((prev) => prev.filter((i) => i.id !== img.id))}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center"
                      aria-label="削除"
                    >
                      <CloseIcon size={12} stroke={2.5} />
                    </button>
                  </div>
                ))}
                <span className="text-[10px] text-gray-400 self-end">
                  {selectedImages.length}/{chatSettings?.maxImagesPerMessage ?? 5}枚
                </span>
              </div>
            )}
            <div className="flex gap-2 items-end">
              {/* ⑧ 画像送信ボタン */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageSelect(e.target.files)}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={sessionEnded}
                className="w-11 h-11 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-all active:scale-90 flex-shrink-0 disabled:opacity-50"
                aria-label="画像を送る"
                title={`画像送信（最大${chatSettings?.maxImageSizeMB ?? 2}MB・${chatSettings?.maxImagesPerMessage ?? 5}枚）`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </button>
              <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="メッセージを入力..."
                  className="w-full bg-transparent outline-none text-sm placeholder-gray-400"
                  disabled={sessionEnded}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={(!input.trim() && selectedImages.length === 0) || sessionEnded}
                className="w-11 h-11 bg-orange-500 rounded-full flex items-center justify-center text-white hover:bg-orange-600 transition-all disabled:opacity-50 active:scale-90 flex-shrink-0"
                aria-label="送信"
              >
                <SendIcon size={18} stroke={2} />
              </button>
            </div>
          </div>
        )}
        {chatTab === 'public' && (
          <div className="bg-white border-t border-orange-100 p-4 flex-shrink-0 text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              💬 全体チャットは閲覧のみです
            </p>
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-7 sm:p-8 shadow-2xl">
            <div className="flex justify-between items-start mb-5">
              <h3 className="text-lg font-black text-gray-900">購入確認</h3>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="閉じる"
              >
                <CloseIcon size={20} stroke={2} />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-200 to-orange-400 rounded-2xl mb-4 text-orange-800">
                <ProductIcon type={selectedProduct.icon} size={40} stroke={1.5} />
              </div>
              <p className="text-sm text-gray-600 mb-1">{selectedProduct.name}</p>
              <p className="text-4xl font-black text-orange-600">
                ¥{selectedProduct.price.toLocaleString()}
              </p>
            </div>

            <div className="bg-orange-50 rounded-2xl p-5 mb-6">
              <p className="text-xs font-bold text-orange-700 mb-3">購入後の流れ</p>
              <ul className="text-xs text-gray-700 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckIcon size={14} stroke={3} className="text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>チャットで住所・支払い方法をご相談</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon size={14} stroke={3} className="text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>直接お振込・PayPay等で決済</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon size={14} stroke={3} className="text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>商品は出店者から直接発送</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={purchaseProduct}
                className="w-full px-6 py-4 bg-orange-500 text-white rounded-full font-black text-sm hover:bg-orange-600 transition-all active:scale-95"
              >
                購入を確定する
              </button>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="w-full px-6 py-4 bg-gray-100 text-gray-700 rounded-full font-bold text-sm hover:bg-gray-200 transition-all"
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
