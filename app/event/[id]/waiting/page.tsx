'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import { getEventById } from '../../../lib/events';

export default function WaitingPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const event = getEventById(eventId);

  // モック状態管理
  const [ticketNumber] = useState(3); // あなたの整理券
  const [currentServing, setCurrentServing] = useState(1); // 現在接客中の番号
  const [secondsLeft, setSecondsLeft] = useState(15); // デモ用：15秒で次の人へ
  const [signalReceived, setSignalReceived] = useState(false);

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

  const waitingAhead = ticketNumber - currentServing;
  const estimatedMinutes = waitingAhead * 10;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100">
      <Header />

      {/* Back Link */}
      <div className="bg-white/80 backdrop-blur border-b border-orange-100 sticky top-16 lg:top-20 z-10">
        <div className="container-main py-3">
          <Link
            href={`/event/${eventId}`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 font-medium"
          >
            <span>←</span> {event.name}の詳細へ
          </Link>
        </div>
      </div>

      <div className="container-main py-8 sm:py-12 lg:py-16">
        <div className="max-w-md mx-auto">
          {/* Shop Header Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-lg mb-6 flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0">
              {event.profileEmoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-orange-600 font-bold mb-0.5">📍 {event.region}</p>
              <p className="text-base sm:text-lg font-black text-gray-900 truncate">{event.name}</p>
              <p className="text-xs text-gray-500">
                {event.startTime} - {event.endTime}
              </p>
            </div>
          </div>

          {/* Signal Received Modal */}
          {signalReceived ? (
            <div className="bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full" />
              </div>

              <div className="relative">
                <div className="text-5xl sm:text-6xl mb-3 animate-bounce">🎉</div>
                <p className="text-xs sm:text-sm font-bold mb-2 tracking-widest uppercase opacity-90">
                  Signal Received
                </p>
                <h2 className="text-2xl sm:text-3xl font-black mb-3 leading-tight">
                  あなたの順番です！
                </h2>
                <p className="text-xs sm:text-sm mb-6 opacity-90">
                  チャットルームが準備できました。<br />
                  10分間、{event.name}さんと1対1でお話できます。
                </p>

                <button
                  onClick={() => router.push(`/event/${eventId}/chat`)}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-white text-green-600 rounded-full font-black text-base sm:text-lg shadow-xl hover:scale-105 transition-all active:scale-95"
                >
                  チャットを開始する →
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Ticket Card */}
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6 relative">
                {/* Top Strip */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 py-3 text-center">
                  <p className="text-white text-xs sm:text-sm font-bold tracking-widest uppercase">
                    あなたの整理券
                  </p>
                </div>

                {/* Ticket Body */}
                <div className="px-6 py-8 sm:px-8 sm:py-10 text-center relative">
                  {/* Perforated edge effect */}
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-orange-50 rounded-full" />
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-orange-50 rounded-full" />

                  <p className="text-xs text-gray-500 mb-2 font-bold tracking-widest uppercase">Ticket No.</p>
                  <div className="text-7xl sm:text-8xl font-black text-orange-600 mb-2 leading-none">
                    #{String(ticketNumber).padStart(2, '0')}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">{event.name} - {event.date}</p>
                </div>

                {/* Dashed Divider */}
                <div className="border-t-2 border-dashed border-gray-200 mx-6" />

                {/* Status */}
                <div className="px-6 py-5 sm:px-8 sm:py-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">現在 接客中</p>
                      <p className="text-xl sm:text-2xl font-black text-gray-900">
                        #{String(currentServing).padStart(2, '0')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-0.5">あなたまで</p>
                      <p className="text-xl sm:text-2xl font-black text-orange-600">
                        {waitingAhead}名待ち
                      </p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-1000"
                      style={{ width: `${(currentServing / ticketNumber) * 100}%` }}
                    />
                  </div>

                  <p className="text-xs text-gray-600 text-center">
                    順番まで <span className="font-black text-orange-600">約{estimatedMinutes}分</span>
                  </p>
                </div>
              </div>

              {/* Next Person Countdown */}
              <div className="bg-white/80 backdrop-blur rounded-2xl p-4 sm:p-5 mb-6 border border-orange-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">⏱️</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-0.5">次の方への引き継ぎまで</p>
                    <p className="text-base sm:text-lg font-black text-orange-600">
                      {secondsLeft}秒 <span className="text-xs font-medium text-gray-500">(デモ)</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Tips */}
              <div className="space-y-3">
                {[
                  { icon: '💡', text: 'チャット中はマンツーマンで接客を受けられます' },
                  { icon: '⏰', text: '1人あたりの目安時間は約10分です' },
                  { icon: '🔔', text: '順番が来たら通知でお知らせします' },
                  { icon: '💬', text: 'チャット内で商品の購入手続きまで完結します' },
                ].map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white/60 backdrop-blur rounded-2xl p-3 sm:p-4">
                    <span className="text-lg sm:text-xl flex-shrink-0">{tip.icon}</span>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{tip.text}</p>
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
