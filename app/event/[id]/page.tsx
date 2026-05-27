'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import { getEventById } from '../../lib/events';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const event = getEventById(eventId);
  const [isReserving, setIsReserving] = useState(false);

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

  const handleReserve = () => {
    setIsReserving(true);
    // モック：予約処理
    setTimeout(() => {
      router.push(`/event/${eventId}/waiting`);
    }, 800);
  };

  const reservationProgress = (event.currentReservations / event.maxReservations) * 100;
  const remainingSlots = event.maxReservations - event.currentReservations;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Back Button */}
      <div className="bg-white border-b border-gray-100 sticky top-16 lg:top-20 z-10">
        <div className="container-main py-3">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 font-medium"
          >
            <span>←</span> イベント一覧へ戻る
          </Link>
        </div>
      </div>

      {/* Shop Header */}
      <section className="bg-white">
        <div className="container-main py-6 sm:py-8 lg:py-10">
          <div className="grid grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-center">
            {/* Profile Image */}
            <div className="col-span-12 sm:col-span-4 lg:col-span-3 flex justify-center sm:justify-start">
              <div className="relative">
                <div className="w-28 h-28 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-5xl sm:text-6xl lg:text-7xl shadow-lg">
                  {event.profileEmoji}
                </div>
                {event.status === 'live' && (
                  <div className="absolute -top-2 -right-2 flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-full text-xs font-black shadow-md">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    LIVE
                  </div>
                )}
              </div>
            </div>

            {/* Shop Info */}
            <div className="col-span-12 sm:col-span-8 lg:col-span-9 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                <span className="text-xs sm:text-sm font-bold text-orange-600">📍 {event.region}</span>
                <span className="text-xs text-gray-400">|</span>
                <span className="text-xs sm:text-sm text-gray-600">{event.category}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-3">
                {event.name}
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-gray-700 mb-4 leading-relaxed">
                {event.description}
              </p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {event.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-bold">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Info Card */}
      <section className="bg-gradient-to-br from-orange-50 to-yellow-50">
        <div className="container-main py-6 sm:py-8">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-lg">
            <div className="grid grid-cols-12 gap-4 sm:gap-6">
              <div className="col-span-12 sm:col-span-6">
                <p className="text-xs text-gray-500 mb-1.5 font-bold tracking-widest uppercase">開催時間</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-1">
                  {event.startTime}〜{event.endTime}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">{event.date}</p>
              </div>

              <div className="col-span-12 sm:col-span-6 sm:border-l sm:border-gray-100 sm:pl-6">
                <p className="text-xs text-gray-500 mb-1.5 font-bold tracking-widest uppercase">予約状況</p>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-orange-600">
                    {event.currentReservations}
                  </span>
                  <span className="text-sm text-gray-500">/ {event.maxReservations}名</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all"
                    style={{ width: `${reservationProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  残り <span className="font-bold text-orange-600">{remainingSlots}名</span> 予約可能
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pickup Products */}
      <section className="bg-white">
        <div className="container-main py-8 sm:py-10 lg:py-12">
          <div className="text-center mb-6 sm:mb-8 lg:mb-10">
            <p className="text-xs sm:text-sm font-bold text-orange-500 mb-2 tracking-widest uppercase">PICKUP ITEMS</p>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 mb-2">
              ピックアップ商品 5品
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              {event.status === 'live' ? '全商品はチャット内でご確認いただけます' : 'イベント開催時に全商品公開'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
            {event.products.map((product) => (
              <div
                key={product.id}
                className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-orange-300 hover:shadow-lg transition-all"
              >
                <div className="aspect-square bg-gradient-to-br from-orange-100 via-orange-50 to-yellow-50 flex items-center justify-center text-5xl sm:text-6xl">
                  {product.emoji}
                </div>
                <div className="p-3 sm:p-4">
                  <p className="text-xs sm:text-sm font-black text-gray-900 mb-1 line-clamp-1">
                    {product.name}
                  </p>
                  <p className="text-orange-600 font-black text-sm sm:text-base">
                    ¥{product.price.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-orange-50">
        <div className="container-main py-8 sm:py-10">
          <h3 className="text-base sm:text-lg lg:text-xl font-black text-gray-900 mb-4 sm:mb-6 text-center">
            予約から購入までの流れ
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { num: '01', title: '予約', desc: '整理券を取得' },
              { num: '02', title: '待機', desc: '順番が来るまで待機' },
              { num: '03', title: 'チャット', desc: '出店者と1対1で接客' },
              { num: '04', title: '購入', desc: '商品を選んで購入' },
            ].map((step) => (
              <div key={step.num} className="bg-white rounded-2xl p-3 sm:p-4 text-center">
                <p className="text-orange-500 font-black text-xs sm:text-sm mb-1">STEP {step.num}</p>
                <p className="font-black text-sm sm:text-base text-gray-900 mb-1">{step.title}</p>
                <p className="text-[10px] sm:text-xs text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sticky CTA Button */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 shadow-2xl z-20">
        <div className="container-main py-4 sm:py-5">
          <button
            onClick={handleReserve}
            disabled={isReserving || remainingSlots === 0}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 sm:py-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-black text-base sm:text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isReserving ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                予約中...
              </>
            ) : remainingSlots === 0 ? (
              '満員御礼'
            ) : (
              <>このお店を予約する <span>→</span></>
            )}
          </button>
          <p className="text-center text-[10px] sm:text-xs text-gray-500 mt-2">
            予約後、整理券番号が発行されます
          </p>
        </div>
      </div>
    </div>
  );
}
