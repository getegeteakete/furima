'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import {
  ProductIcon,
  MapPinIcon,
  ClockIcon,
  ArrowLeftIcon,
  UserIcon,
  CalendarIcon,
  StarIcon,
} from '../../components/Icons';
import { getPublicEventById, getBuyerActiveSession, getSellerPickupProducts, CURRENT_MOCK_BUYER_ID } from '../../lib/supabaseStore';
import { useStoreData } from '../../lib/useStore';
import ProductThumb from '../../components/ProductThumb';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const eventGetter = useCallback(() => getPublicEventById(eventId), [eventId]);
  const [event] = useStoreData(eventGetter);
  const [countdownTime, setCountdownTime] = useState<number | null>(null);
  const [activeSellerId, setActiveSellerId] = useState<string | null>(null); // ⑥ 接客中の出店者

  // ⑥ 進行中セッションを検知
  useEffect(() => {
    const check = () => {
      const session = getBuyerActiveSession(CURRENT_MOCK_BUYER_ID, eventId);
      setActiveSellerId(session?.sellerId ?? null);
    };
    check();
    window.addEventListener('furima-store-update', check);
    window.addEventListener('focus', check);
    return () => {
      window.removeEventListener('furima-store-update', check);
      window.removeEventListener('focus', check);
    };
  }, [eventId]);

  // カウントダウンタイマー
  useEffect(() => {
    if (event?.status !== 'upcoming') return;

    const interval = setInterval(() => {
      setCountdownTime((prev) => {
        if (prev === null) return 1800; // 30分
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [event?.status]);

  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container-main py-20 text-center">
          <p className="text-xl text-gray-600">イベントが見つかりません</p>
          <Link href="/events" className="inline-block mt-6 text-orange-600 font-bold">
            ← イベント一覧へ戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Back Link */}
      <div className="bg-white border-b border-gray-200 sticky top-16 lg:top-20 z-10">
        <div className="container-main py-4">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 font-medium"
          >
            <ArrowLeftIcon size={16} stroke={2} />
            イベント一覧へ戻る
          </Link>
        </div>
      </div>

      {/* Timeslot Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="container-main py-10 sm:py-12 lg:py-14">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="px-4 py-2 bg-orange-100 rounded-full">
                <p className="text-sm font-bold text-orange-700">時間帯イベント</p>
              </div>
              {event.status === 'upcoming' && (
                <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-black">
                  COMING SOON
                </span>
              )}
              {event.status === 'live' && (
                <span className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-full text-xs font-black">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />LIVE
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4">
              {event.startTime}〜{event.endTime} {event.region}
            </h1>

            {/* Countdown */}
            {event.status === 'upcoming' && countdownTime !== null && (
              <div className="inline-block mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-xs text-orange-700 font-bold mb-1">開催まで</p>
                <p className="text-3xl font-black text-orange-600 font-mono">
                  {formatCountdown(countdownTime)}
                </p>
              </div>
            )}

            <div className="flex items-center gap-4 text-gray-700">
              <div className="flex items-center gap-2">
                <MapPinIcon size={18} stroke={2} className="text-orange-600" />
                <span className="font-bold">{event.region}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon size={18} stroke={2} className="text-orange-600" />
                <span>{event.date}</span>
              </div>
            </div>
          </div>

          {/* Seller Count */}
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-sm font-bold text-orange-700">
              🏪 出店者: <span className="text-2xl text-orange-600">{event.sellers.length}</span> 店舗
            </p>
          </div>
        </div>
      </section>

      {/* Sellers */}
      <section className="bg-white">
        <div className="container-main py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-10">
            本イベントの出店者
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {event.sellers.map((seller) => (
              <div
                key={seller.id}
                className="bg-white border-2 border-gray-200 rounded-3xl overflow-hidden hover:border-orange-300 hover:shadow-lg transition-all"
              >
                {/* Seller Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 sm:p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-white flex-shrink-0">
                      <ProductIcon type={seller.icon} size={40} stroke={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl sm:text-2xl font-black text-white mb-1 truncate">
                        {seller.name}
                      </h3>
                      <p className="text-sm text-white/90">{seller.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-white/80">
                    <span className="flex items-center gap-1">
                      <StarIcon size={14} stroke={2} className="fill-white text-white" />
                      {seller.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <UserIcon size={14} stroke={2} />
                      {seller.followers} フォロー
                    </span>
                  </div>
                </div>

                {/* Seller Description */}
                <div className="p-6 sm:p-8">
                  <p className="text-sm text-gray-700 mb-6 leading-relaxed">
                    {seller.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {seller.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-bold">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Featured Products */}
                  <div className="mb-8">
                    <p className="text-xs font-bold text-orange-600 mb-4 tracking-widest uppercase">
                      目玉商品（5点）
                      <span className="sm:hidden text-gray-400 normal-case font-normal ml-1">← 横スクロール</span>
                    </p>
                    {/* スマホ: 横スクロール / PC: 5列グリッド */}
                    <div className="flex sm:grid sm:grid-cols-5 gap-3 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 scrollbar-hide -mx-1 px-1">
                      {getSellerPickupProducts(seller.id, 5).map((product) => (
                        <div
                          key={product.id}
                          className="flex flex-col items-center text-center hover:scale-105 transition-transform cursor-pointer flex-shrink-0 w-20 sm:w-auto"
                        >
                          <div className="w-full aspect-square bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center mb-2 text-orange-600 overflow-hidden">
                            <ProductThumb product={product} iconSize={24} />
                          </div>
                          <p className="text-xs font-bold text-gray-900 line-clamp-1 mb-1 w-full">
                            {product.name}
                          </p>
                          <p className="text-xs font-black text-orange-600">
                            ¥{product.price.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button - ⑥ 順序制御 */}
                  {(() => {
                    const isBlockedByOther = activeSellerId !== null && activeSellerId !== seller.id;
                    const isCurrentSession = activeSellerId === seller.id;
                    return (
                      <>
                        <button
                          onClick={() => router.push(`/event/${eventId}/seller/${seller.id}/waiting`)}
                          disabled={isBlockedByOther}
                          className={`w-full py-4 rounded-2xl font-bold transition-all active:scale-95 ${
                            isBlockedByOther
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : isCurrentSession
                              ? 'bg-green-500 text-white hover:shadow-lg'
                              : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg'
                          }`}
                        >
                          {isBlockedByOther
                            ? '他の出店者と接客中です'
                            : isCurrentSession
                            ? `${seller.name} の接客に戻る`
                            : `${seller.name} に予約する`}
                        </button>
                        {isBlockedByOther && (
                          <p className="text-xs text-gray-400 text-center mt-2">
                            現在の接客を終了すると予約できます
                          </p>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
