'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import {
  ProductIcon,
  MapPinIcon,
  ClockIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  UserIcon,
  CalendarIcon,
  ChatIcon,
  BagIcon,
} from '../../components/Icons';
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
    setTimeout(() => {
      router.push(`/event/${eventId}/waiting`);
    }, 800);
  };

  const reservationProgress = (event.currentReservations / event.maxReservations) * 100;
  const remainingSlots = event.maxReservations - event.currentReservations;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Back Link */}
      <div className="bg-white border-b border-gray-200 dark:border-gray-800 sticky top-16 lg:top-20 z-10">
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

      {/* Shop Header */}
      <section className="bg-white">
        <div className="container-main py-8 sm:py-10 lg:py-12">
          <div className="grid grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* Profile Icon */}
            <div className="col-span-12 sm:col-span-4 lg:col-span-3 flex justify-center sm:justify-start">
              <div className="relative">
                <div className="w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl flex items-center justify-center text-white shadow-lg">
                  <ProductIcon type={event.icon} size={72} stroke={1.5} />
                </div>
                {event.status === 'live' && (
                  <div className="absolute -top-2 -right-2 flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-full text-xs font-black shadow-md">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    LIVE
                  </div>
                )}
              </div>
            </div>

            {/* Shop Info */}
            <div className="col-span-12 sm:col-span-8 lg:col-span-9 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-3 text-orange-600">
                <MapPinIcon size={16} stroke={2} />
                <span className="text-sm font-bold">{event.region}</span>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-600">{event.category}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4">
                {event.name}
              </h1>
              <p className="text-sm sm:text-base text-gray-700 mb-5 leading-relaxed">
                {event.description}
              </p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {event.tags.map((tag) => (
                  <span key={tag} className="px-4 py-1.5 bg-orange-50 dark:bg-gray-900 text-orange-700 rounded-full text-xs font-bold">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Info Card */}
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="container-main py-8 sm:py-10">
          <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-md border border-gray-200 dark:border-gray-800">
            <div className="grid grid-cols-12 gap-6 lg:gap-8">
              <div className="col-span-12 sm:col-span-6">
                <div className="flex items-center gap-2 text-orange-600 mb-2">
                  <ClockIcon size={16} stroke={2} />
                  <span className="text-xs font-black tracking-widest uppercase">開催時間</span>
                </div>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-2">
                  {event.startTime}〜{event.endTime}
                </p>
                <p className="text-sm text-gray-600">{event.date}</p>
              </div>

              <div className="col-span-12 sm:col-span-6 sm:border-l sm:border-gray-200 dark:border-gray-800 sm:pl-8">
                <div className="flex items-center gap-2 text-orange-600 mb-2">
                  <UserIcon size={16} stroke={2} />
                  <span className="text-xs font-black tracking-widest uppercase">予約状況</span>
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-orange-600">
                    {event.currentReservations}
                  </span>
                  <span className="text-base text-gray-500 dark:text-gray-400">/ {event.maxReservations}名</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all"
                    style={{ width: `${reservationProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  残り <span className="font-black text-orange-600">{remainingSlots}名</span> 予約可能
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pickup Products */}
      <section className="bg-white">
        <div className="container-main py-10 sm:py-14 lg:py-16">
          <div className="text-center mb-10 lg:mb-12">
            <p className="text-xs sm:text-sm font-bold text-orange-600 mb-3 tracking-widest uppercase">Pickup Items</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-3">
              ピックアップ商品 5品
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              {event.status === 'live' ? '全商品はチャット内でご確認いただけます' : 'イベント開催時に全商品公開'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
            {event.products.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:border-orange-300 hover:shadow-lg transition-all"
              >
                <div className="aspect-square bg-gradient-to-br from-orange-100 via-orange-50 to-yellow-50 flex items-center justify-center text-orange-600">
                  <ProductIcon type={product.icon} size={56} stroke={1.5} />
                </div>
                <div className="p-4 sm:p-5">
                  <p className="text-sm font-black text-gray-900 mb-2 line-clamp-1">
                    {product.name}
                  </p>
                  <p className="text-orange-600 font-black text-base sm:text-lg">
                    ¥{product.price.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-orange-50 dark:bg-gray-900">
        <div className="container-main py-10 sm:py-12">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 mb-8 text-center">
            予約から購入までの流れ
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {[
              { num: '01', Icon: CalendarIcon, title: '予約', desc: '整理券を取得' },
              { num: '02', Icon: ClockIcon, title: '待機', desc: '順番まで待機' },
              { num: '03', Icon: ChatIcon, title: 'チャット', desc: '1対1で接客' },
              { num: '04', Icon: BagIcon, title: '購入', desc: '商品を購入' },
            ].map((step) => (
              <div key={step.num} className="bg-white rounded-2xl p-5 sm:p-6 text-center border border-orange-100 dark:border-gray-800">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl mb-3 text-orange-600">
                  <step.Icon size={24} stroke={1.5} />
                </div>
                <p className="text-orange-500 font-black text-xs mb-1">STEP {step.num}</p>
                <p className="font-black text-sm sm:text-base text-gray-900 mb-1">{step.title}</p>
                <p className="text-xs text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sticky CTA Button */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 dark:border-gray-800 shadow-2xl z-20">
        <div className="container-main py-5 sm:py-6">
          <button
            onClick={handleReserve}
            disabled={isReserving || remainingSlots === 0}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 sm:py-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-black text-base sm:text-lg shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isReserving ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                予約中...
              </>
            ) : remainingSlots === 0 ? (
              '満員御礼'
            ) : (
              <>このお店を予約する <ArrowRightIcon size={20} stroke={2.5} /></>
            )}
          </button>
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2.5">
            予約後、整理券番号が発行されます
          </p>
        </div>
      </div>
    </div>
  );
}
