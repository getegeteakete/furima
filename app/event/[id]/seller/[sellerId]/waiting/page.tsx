'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Header from '../../../../../components/Header';
import {
  ProductIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  TicketIcon,
  ClockIcon,
  HeartIcon,
  ChatIcon,
  BellIcon,
  HourglassIcon,
  SparklesIcon,
} from '../../../../../components/Icons';
import { getSellerById } from '../../../../../lib/events';
import { getPublicEventById, reserveAsBuyer, CURRENT_MOCK_BUYER_ID } from '../../../../../lib/supabaseStore';
import { useStoreData } from '../../../../../lib/useStore';
import { useAuth } from '../../../../../components/AuthProvider';

export default function WaitingPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const sellerId = params.sellerId as string;
  const eventGetter = useCallback(() => getPublicEventById(eventId), [eventId]);
  const [event] = useStoreData(eventGetter);
  const seller = getSellerById(sellerId);

  const [ticketNumber] = useState(3);
  const [currentServing, setCurrentServing] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [signalReceived, setSignalReceived] = useState(false);

  // ログイン中の購入者で来場予約を記録（成立判定の予約数に反映）
  const { profile } = useAuth();
  const buyerId = profile?.id ?? CURRENT_MOCK_BUYER_ID;
  const reservedRef = useRef(false);
  useEffect(() => {
    // イベントがハイドレートされてから1回だけ予約（冪等・既予約は無視）
    if (!event || reservedRef.current) return;
    reservedRef.current = true;
    reserveAsBuyer(eventId, buyerId);
  }, [event, eventId, buyerId]);

  useEffect(() => {
    if (signalReceived) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setCurrentServing((s) => {
            const newServing = s + 1;
            if (newServing >= ticketNumber) {
              setSignalReceived(true);
              return ticketNumber;
            }
            return newServing;
          });
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [signalReceived, ticketNumber]);

  if (!event) return null;
  if (!seller) return null;

  const waitingAhead = ticketNumber - currentServing;
  const estimatedMinutes = waitingAhead * 10;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100">
      <Header />

      {/* Back Link */}
      <div className="bg-white/80 backdrop-blur border-b border-orange-100 sticky top-16 lg:top-20 z-10">
        <div className="container-main py-4">
          <Link
            href={`/event/${eventId}`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 font-medium"
          >
            <ArrowLeftIcon size={16} stroke={2} />
            イベント詳細へ
          </Link>
        </div>
      </div>

      <div className="container-main py-10 sm:py-12 lg:py-16">
        <div className="max-w-md mx-auto">
          {/* Shop Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-orange-100 mb-6 flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-white flex-shrink-0">
              <ProductIcon type={seller.icon} size={32} stroke={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-orange-600 font-bold mb-1">{event.region}</p>
              <p className="text-base sm:text-lg font-black text-gray-900 truncate">{seller.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{event.startTime} - {event.endTime}</p>
            </div>
          </div>

          {/* Signal Received Modal */}
          {signalReceived ? (
            <div className="bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-3xl p-8 sm:p-10 shadow-2xl text-center relative overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full" />
              </div>

              <div className="relative">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur rounded-3xl mb-5 animate-bounce">
                  <SparklesIcon size={48} stroke={1.5} />
                </div>
                <p className="text-xs sm:text-sm font-bold mb-3 tracking-widest uppercase opacity-90">
                  Signal Received
                </p>
                <h2 className="text-2xl sm:text-3xl font-black mb-4 leading-tight">
                  あなたの順番です！
                </h2>
                <p className="text-sm mb-8 opacity-90 leading-relaxed">
                  チャットルームが準備できました。<br />
                  10分間、{seller.name}さんと<br className="sm:hidden" />1対1でお話できます。
                </p>

                <button
                  onClick={() => router.push(`/event/${eventId}/seller/${sellerId}`)}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-white text-green-600 rounded-full font-black text-base sm:text-lg shadow-xl hover:scale-105 transition-all active:scale-95"
                >
                  チャットを開始する <ArrowRightIcon size={20} stroke={2.5} />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Ticket */}
              <div className="bg-white rounded-3xl shadow-xl border border-orange-200 overflow-hidden mb-6 relative">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 py-4 text-center">
                  <p className="text-white text-xs sm:text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-2">
                    <TicketIcon size={16} stroke={2} />
                    あなたの整理券
                  </p>
                </div>

                <div className="px-6 py-10 sm:px-8 sm:py-12 text-center relative">
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-orange-50 rounded-full" />
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-orange-50 rounded-full" />

                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-bold tracking-widest uppercase">Ticket No.</p>
                  <div className="text-7xl sm:text-8xl font-black text-orange-600 mb-3 leading-none">
                    #{String(ticketNumber).padStart(2, '0')}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">{seller.name} - {event.date}</p>
                </div>

                <div className="border-t-2 border-dashed border-gray-200 dark:border-gray-800 mx-6" />

                <div className="px-6 py-6 sm:px-8 sm:py-8">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">現在 接客中</p>
                      <p className="text-2xl font-black text-gray-900">
                        #{String(currentServing).padStart(2, '0')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">あなたまで</p>
                      <p className="text-2xl font-black text-orange-600">
                        {waitingAhead}名待ち
                      </p>
                    </div>
                  </div>

                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-1000"
                      style={{ width: `${(currentServing / ticketNumber) * 100}%` }}
                    />
                  </div>

                  <p className="text-sm text-gray-600 text-center">
                    順番まで <span className="font-black text-orange-600">約{estimatedMinutes}分</span>
                  </p>
                </div>
              </div>

              {/* Countdown */}
              <div className="bg-white rounded-2xl p-5 mb-6 border border-orange-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0 text-orange-600">
                    <HourglassIcon size={24} stroke={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">次の方への引き継ぎまで</p>
                    <p className="text-lg font-black text-orange-600">
                      {secondsLeft}秒 <span className="text-xs font-medium text-gray-500 dark:text-gray-400">(デモ)</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="space-y-3">
                {[
                  { Icon: ChatIcon, text: 'チャット中はマンツーマンで接客を受けられます' },
                  { Icon: ClockIcon, text: '1人あたりの目安時間は約10分です' },
                  { Icon: BellIcon, text: '順番が来たら通知でお知らせします' },
                  { Icon: HeartIcon, text: 'チャット内で商品の購入手続きまで完結します' },
                ].map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-4 bg-white/80 backdrop-blur rounded-2xl p-4 sm:p-5 border border-orange-100">
                    <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0 text-orange-600">
                      <tip.Icon size={18} stroke={1.5} />
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{tip.text}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
