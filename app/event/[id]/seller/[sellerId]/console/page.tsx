'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback, type Dispatch, type SetStateAction } from 'react';
import Link from 'next/link';
import { ProductIcon, ArrowLeftIcon, SendIcon } from '../../../../../components/Icons';
import { getSellerById } from '../../../../../lib/events';
import {
  getPublicEventById,
  fetchRoomMessages,
  fetchSellerRoomBuyers,
  sendChatMessage,
  subscribeToRoom,
  subscribeToSellerPrivate,
  type ChatRoomMessage,
} from '../../../../../lib/supabaseStore';
import { useAuth } from '../../../../../components/AuthProvider';
import AuthGuard from '../../../../../components/AuthGuard';

type Message = {
  id: string;
  text: string;
  sender: 'me' | 'them' | 'system';
  timestamp: string;
  images?: string[];
};

type BuyerRoom = {
  buyerId: string;
  buyerName: string | null;
  lastText: string;
  lastAt: string;
};

function fmt(iso: string): string {
  return new Date(iso).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
}

// 出店者視点: 自分(seller)の発言 = me / 購入者の発言 = them
function toMessage(m: ChatRoomMessage): Message {
  const sender: Message['sender'] =
    m.senderRole === 'system' ? 'system' : m.senderRole === 'seller' ? 'me' : 'them';
  return {
    id: m.id,
    text: m.text,
    sender,
    timestamp: fmt(m.createdAt),
    images: m.images.length > 0 ? m.images : undefined,
  };
}

function ConsoleInner() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const sellerId = params.sellerId as string;
  const event = getPublicEventById(eventId);
  const seller = getSellerById(sellerId);

  const { profile } = useAuth();
  const sellerName = seller?.name ?? profile?.name ?? '出店者';
  // 本番RLSの messages_insert は sender_id = auth.uid() を要求するため、
  // 送信者IDはログイン中の出店者アカウント(profile.id = auth uid)を使う。
  const senderId = profile?.id ?? seller?.id ?? null;

  // 'public' = 全体チャット / それ以外は購入者ID（個別ルーム）
  const [activeRoom, setActiveRoom] = useState<'public' | string>('public');
  // 購読を張り直さずに最新の activeRoom を参照するための ref
  const activeRoomRef = useRef<'public' | string>('public');
  useEffect(() => {
    activeRoomRef.current = activeRoom;
  }, [activeRoom]);
  const [buyers, setBuyers] = useState<BuyerRoom[]>([]);
  const [publicMsgs, setPublicMsgs] = useState<Message[]>([]);
  const [privateMsgs, setPrivateMsgs] = useState<Record<string, Message[]>>({});
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const appendUnique = useCallback(
    (setter: Dispatch<SetStateAction<Message[]>>, msg: Message) =>
      setter((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg])),
    [],
  );

  const appendToBuyer = useCallback((buyerId: string, msg: Message) => {
    setPrivateMsgs((prev) => {
      const cur = prev[buyerId] ?? [];
      if (cur.some((m) => m.id === msg.id)) return prev;
      return { ...prev, [buyerId]: [...cur, msg] };
    });
  }, []);

  // 初期ロード: 全体チャット履歴 + 購入者一覧 + 各個別ルーム履歴
  useEffect(() => {
    if (!event || !seller) return;
    let active = true;
    (async () => {
      const [pub, buyerList] = await Promise.all([
        fetchRoomMessages(event.id, null, null),
        fetchSellerRoomBuyers(event.id, seller.id),
      ]);
      if (!active) return;
      setPublicMsgs(pub.map(toMessage));
      setBuyers(buyerList);
      const histories = await Promise.all(
        buyerList.map((b) => fetchRoomMessages(event.id, seller.id, b.buyerId)),
      );
      if (!active) return;
      const map: Record<string, Message[]> = {};
      buyerList.forEach((b, i) => {
        map[b.buyerId] = histories[i].map(toMessage);
      });
      setPrivateMsgs(map);
    })();
    return () => {
      active = false;
    };
    // event はレンダー毎に新オブジェクトになるため id で固定（再取得ループ防止）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, sellerId, event?.id, seller?.id]);

  // Realtime: 全体チャット + 自分宛の全個別ルーム
  useEffect(() => {
    if (!event || !seller) return;
    const unsubPublic = subscribeToRoom(event.id, null, null, (m) =>
      appendUnique(setPublicMsgs, toMessage(m)),
    );
    const unsubPrivate = subscribeToSellerPrivate(event.id, seller.id, (m) => {
      if (!m.buyerId) return;
      const bId: string = m.buyerId;
      appendToBuyer(bId, toMessage(m));
      // 購入者一覧を更新（新規購入者の自動追加 + 最新メッセージ反映）
      setBuyers((prev) => {
        const others = prev.filter((b) => b.buyerId !== bId);
        const existing = prev.find((b) => b.buyerId === bId);
        const name = m.senderRole === 'buyer' && m.senderName ? m.senderName : (existing?.buyerName ?? null);
        return [{ buyerId: bId, buyerName: name, lastText: m.text, lastAt: m.createdAt }, ...others];
      });
      // 未読カウント（購入者からの発言で、開いていないルーム）
      if (m.senderRole === 'buyer') {
        setUnread((prev) =>
          activeRoomRef.current === bId ? prev : { ...prev, [bId]: (prev[bId] ?? 0) + 1 },
        );
      }
    });
    return () => {
      unsubPublic();
      unsubPrivate();
    };
    // event はレンダー毎に新オブジェクトになるため id で固定し、活性ルームは ref 参照。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, sellerId, event?.id, seller?.id, appendUnique, appendToBuyer]);

  // ルームを開いたら未読クリア
  useEffect(() => {
    if (activeRoom !== 'public') setUnread((prev) => ({ ...prev, [activeRoom]: 0 }));
  }, [activeRoom]);

  const shownMessages =
    activeRoom === 'public' ? publicMsgs : (privateMsgs[activeRoom] ?? []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [shownMessages]);

  const send = async () => {
    const text = input.trim();
    if (!text || !event || !seller) return;
    setInput('');
    const isPublic = activeRoom === 'public';
    const saved = await sendChatMessage({
      eventId: event.id,
      sellerId: seller.id,
      buyerId: isPublic ? null : activeRoom,
      senderRole: 'seller',
      senderId,
      senderName: sellerName,
      text,
    });
    if (saved) {
      if (isPublic) appendUnique(setPublicMsgs, toMessage(saved));
      else appendToBuyer(activeRoom, toMessage(saved));
    }
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

  const activeBuyer = activeRoom !== 'public' ? buyers.find((b) => b.buyerId === activeRoom) : null;

  return (
    <div className="h-[100dvh] bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => router.push('/seller')} aria-label="戻る" className="active:scale-90 transition-transform">
          <ArrowLeftIcon size={22} stroke={2} />
        </button>
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <ProductIcon type={seller.icon} size={20} stroke={1.5} />
        </div>
        <div className="min-w-0">
          <h1 className="font-black text-base leading-tight truncate">{seller.name} 接客コンソール</h1>
          <p className="text-xs opacity-90">
            {event.startTime}〜{event.endTime} {event.region}
          </p>
        </div>
      </div>

      {/* Room tabs: 全体 + 購入者リスト（横スクロール） */}
      <div className="bg-orange-50 border-b border-orange-100 px-3 py-2 flex gap-2 overflow-x-auto flex-shrink-0">
        <button
          onClick={() => setActiveRoom('public')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            activeRoom === 'public' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-orange-200'
          }`}
        >
          全体チャット
        </button>
        {buyers.length === 0 && (
          <span className="text-xs text-gray-400 self-center px-1">まだ個別の問い合わせはありません</span>
        )}
        {buyers.map((b) => (
          <button
            key={b.buyerId}
            onClick={() => setActiveRoom(b.buyerId)}
            className={`relative px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              activeRoom === b.buyerId ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-orange-200'
            }`}
          >
            {b.buyerName ?? `購入者 ${b.buyerId.slice(0, 6)}`}
            {(unread[b.buyerId] ?? 0) > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {unread[b.buyerId]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 bg-orange-50 overflow-y-auto p-4 space-y-3 min-h-0">
        {shownMessages.length === 0 && (
          <div className="text-center text-sm text-gray-400 mt-10">
            {activeRoom === 'public' ? '全体チャットはまだありません' : 'この購入者との会話はまだありません'}
          </div>
        )}
        {shownMessages.map((msg) => {
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
              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                {msg.images && msg.images.length > 0 && (
                  <div className={`grid gap-1 mb-1 ${msg.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {msg.images.map((img, idx) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={idx}
                        src={img}
                        alt={`画像${idx + 1}`}
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

      {/* Input */}
      <div className="bg-white border-t border-orange-100 p-3 flex-shrink-0">
        <p className="text-[11px] text-gray-400 mb-2 px-1">
          {activeRoom === 'public'
            ? '全体チャットに投稿（参加者全員に表示されます）'
            : `${activeBuyer?.buyerName ?? '購入者'} とのマンツーマン接客`}
        </p>
        <div className="flex gap-2 items-end">
          <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="メッセージを入力..."
              className="w-full bg-transparent outline-none text-sm placeholder-gray-400"
            />
          </div>
          <button
            onClick={send}
            disabled={!input.trim()}
            className="w-11 h-11 bg-orange-500 rounded-full flex items-center justify-center text-white hover:bg-orange-600 transition-all disabled:opacity-50 active:scale-90 flex-shrink-0"
            aria-label="送信"
          >
            <SendIcon size={18} stroke={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SellerConsolePage() {
  // 出店者・スタッフのみアクセス可
  return (
    <AuthGuard allow={['seller', 'admin', 'event_manager']}>
      <ConsoleInner />
    </AuthGuard>
  );
}
