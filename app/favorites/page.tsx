'use client';

import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  HeartIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  ArrowRightIcon,
} from '../components/Icons';
import { events } from '../lib/events';
import { useFavorites } from '../components/FavoritesContext';

export default function FavoritesPage() {
  const { favoriteEvents } = useFavorites();
  const favoritesList = events.filter((e) => favoriteEvents.has(e.id));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Page Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="container-main py-8 sm:py-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0">
              <HeartIcon size={36} stroke={1.5} className="fill-current" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-1">マイコレクション</p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-1">
                お気に入い
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">{favoritesList.length}件</p>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1">
        <div className="container-main py-10 sm:py-12">
          
          {favoritesList.length > 0 ? (
            <div className="space-y-6">
              <p className="text-sm text-gray-600 mb-8">
                お気に入いに登録したイベントです。クリックすると詳細ページが表示されます。
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {favoritesList.map((event) => (
                  <Link key={event.id} href={`/event/${event.id}`}>
                    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-orange-200 transition-all h-full">
                      {/* Event Image */}
                      <div className="aspect-square bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-700 relative">
                        <div className="text-6xl">♦️</div>
                      </div>

                      {/* Event Details */}
                      <div className="p-6 sm:p-7">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="text-base sm:text-lg font-black text-gray-900 flex-1">
                            {event.name}
                          </h3>
                          <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full flex-shrink-0 whitespace-nowrap">
                            {event.region}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-gray-600 mb-4 line-clamp-2">
                          {event.description}
                        </p>

                        <div className="space-y-3 pb-4 border-b border-gray-100">
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                            <MapPinIcon size={14} stroke={2} />
                            <span>{event.region}</span>
                            <span>•</span>
                            <span className="font-bold text-gray-900">{event.category}</span>
                          </div>

                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                            <CalendarIcon size={14} stroke={2} />
                            <span>{event.date} {event.startTime}-{event.endTime}</span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {event.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 mt-4">
                          <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                            <UserIcon size={14} stroke={2} />
                            <span className="font-bold">{event.currentReservations}/{event.maxReservations}</span>
                            <span>予約</span>
                          </div>

                          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                            event.status === 'live'
                              ? 'bg-red-100 text-red-600'
                              : event.status === 'upcoming'
                              ? 'bg-orange-100 text-orange-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {event.status === 'live' ? '開催中' : event.status === 'upcoming' ? '予定' : '終了'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-200 p-10 sm:p-12 lg:p-16 text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-3xl mb-6 text-gray-400">
                <HeartIcon size={40} stroke={1.5} />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-3">
                お気に入いはまだありません
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-8">
                イベント一覧からお気に入いを登録すると、ここに表示されます。
              </p>
              <Link href="/events">
                <button className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95">
                  イベント一覧を見る
                  <ArrowRightIcon size={18} stroke={2} />
                </button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
