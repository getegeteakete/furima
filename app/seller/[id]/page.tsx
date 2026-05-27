'use client';

import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import {
  UserIcon,
  MapPinIcon,
  CalendarIcon,
  StarIcon,
  HeartIcon,
  ArrowRightIcon,
  PlusIcon,
  StoreIcon,
} from '../../components/Icons';
import { events, getEventById } from '../../lib/events';
import { useFavorites } from '../../components/FavoritesContext';
import type { ProductIconType } from '../../components/Icons';

type SellerPageProps = {
  params: { id: string };
};

// ダミーの出店者データ
const sellerProfiles: Record<string, {
  id: string;
  name: string;
  region: string;
  rating: number;
  reviews: number;
  followers: number;
  description: string;
  logo: ProductIconType;
  pastEvents: number;
  totalSales: number;
  joinDate: string;
  sns?: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
}> = {
  'mina-craft': {
    id: 'mina-craft',
    name: 'mina.craft',
    region: '滋賀',
    rating: 4.8,
    reviews: 127,
    followers: 542,
    description: '滋賀発のハンドメイドアクセサリーショップ。レジン樹脂や天然石を使った一点物アイテムを取り扱っています。丁寧な接客とこだわりの商品で多くのリピーター様にご愛用いただいています。',
    logo: 'diamond',
    pastEvents: 24,
    totalSales: 487,
    joinDate: '2023年4月',
    sns: {
      instagram: '@minacraft',
      twitter: '@minacraft2023',
    },
  },
  'kyoto-vintage': {
    id: 'kyoto-vintage',
    name: 'kyoto.vintage',
    region: '京都',
    rating: 4.6,
    reviews: 89,
    followers: 321,
    description: '京都の古着セレクトショップ。70-90年代のレトロアイテムを中心に取り扱っています。懐かしさと新しさを兼ね備えた商品を厳選しています。',
    logo: 'shirt',
    pastEvents: 18,
    totalSales: 234,
    joinDate: '2023年7月',
    sns: {
      instagram: '@kyotovintage',
    },
  },
  'osaka-antique': {
    id: 'osaka-antique',
    name: 'osaka.antique',
    region: '大阪',
    rating: 4.9,
    reviews: 156,
    followers: 678,
    description: '大阪の骨董雑貨ショップ。アンティーク食器や雑貨を中心に取り扱っています。昭和レトロから明治時代の品まで、幅広い年代の懐かしい品を揃えています。',
    logo: 'package',
    pastEvents: 32,
    totalSales: 621,
    joinDate: '2023年1月',
    sns: {
      instagram: '@osakaantique',
      website: 'www.osakaantique.jp',
    },
  },
};

export default function SellerProfilePage({ params }: SellerPageProps) {
  const seller = sellerProfiles[params.id];
  const { toggleFollow, isFollowing } = useFavorites();
  const isFollowingThisSeller = isFollowing(params.id);

  if (!seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-6 py-12">
            <p className="text-lg text-gray-600 mb-6">出店者が見つかりません</p>
            <Link href="/events">
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-full text-sm font-bold hover:bg-orange-600 transition-all">
                イベント一覧に戻る
                <ArrowRightIcon size={16} stroke={2} />
              </button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const sellerEvents = events.filter((e) => e.id === params.id);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Seller Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="container-main py-8 sm:py-10">
          <div className="flex items-start gap-5 sm:gap-6">
            {/* Logo */}
            <div className="w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl flex items-center justify-center text-white shadow-md flex-shrink-0 text-5xl">
              ♦️
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPinIcon size={16} stroke={2} className="text-orange-600" />
                  <p className="text-xs sm:text-sm font-bold text-orange-600">{seller.region}</p>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-2">
                  {seller.name}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">出店者プロフィール</p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 sm:gap-4 mt-4 text-xs sm:text-sm flex-wrap">
                <div className="flex items-center gap-1 font-bold text-gray-900">
                  <StarIcon size={14} stroke={2} className="text-yellow-500 fill-current" />
                  <span>{seller.rating}</span>
                  <span className="text-gray-500">({seller.reviews}件)</span>
                </div>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-1 font-bold text-gray-900">
                  <HeartIcon size={14} stroke={2} />
                  <span>{seller.followers}</span>
                  <span className="text-gray-500">フォロー</span>
                </div>
              </div>
            </div>

            {/* Follow Button */}
            <button
              onClick={() => toggleFollow(params.id)}
              className={`flex-shrink-0 px-5 sm:px-6 py-3 sm:py-3.5 rounded-full font-bold transition-all text-sm sm:text-base ${
                isFollowingThisSeller
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
              }`}
            >
              {isFollowingThisSeller ? 'フォロー中' : 'フォロー'}
            </button>
          </div>
        </div>
      </section>

      <main className="flex-1">
        <div className="container-main py-10 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7">
                <h2 className="text-base sm:text-lg font-black text-gray-900 mb-4">概要</h2>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-6">
                  {seller.description}
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-orange-50 rounded-xl">
                    <p className="text-2xl sm:text-3xl font-black text-orange-600 mb-1">
                      {seller.pastEvents}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">開催イベント</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <p className="text-2xl sm:text-3xl font-black text-blue-600 mb-1">
                      {seller.totalSales}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">販売点数</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <p className="text-2xl sm:text-3xl font-black text-purple-600 mb-1">
                      {seller.rating}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">評価</p>
                  </div>
                </div>
              </div>

              {/* SNS Links */}
              {seller.sns && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7">
                  <h2 className="text-base sm:text-lg font-black text-gray-900 mb-4">SNS・ウェブ</h2>
                  <div className="flex flex-wrap gap-3">
                    {seller.sns.instagram && (
                      <a
                        href={`https://instagram.com/${seller.sns.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-full text-sm font-bold transition-colors"
                      >
                        📷 {seller.sns.instagram}
                      </a>
                    )}
                    {seller.sns.twitter && (
                      <a
                        href={`https://twitter.com/${seller.sns.twitter.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full text-sm font-bold transition-colors"
                      >
                        𝕏 {seller.sns.twitter}
                      </a>
                    )}
                    {seller.sns.website && (
                      <a
                        href={`https://${seller.sns.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-full text-sm font-bold transition-colors"
                      >
                        🔗 ウェブサイト
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Events */}
              {sellerEvents.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7">
                  <h2 className="text-base sm:text-lg font-black text-gray-900 mb-4">開催中のイベント</h2>
                  <div className="space-y-4">
                    {sellerEvents.map((event) => (
                      <Link key={event.id} href={`/event/${event.id}`}>
                        <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-orange-50 transition-colors cursor-pointer">
                          <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
                            ♦️
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-black text-gray-900 mb-1">{event.name}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                              <CalendarIcon size={12} stroke={2} />
                              <span>{event.date} {event.startTime}-{event.endTime}</span>
                            </div>
                            <p className="text-xs text-gray-500">
                              予約: {event.currentReservations}/{event.maxReservations}
                            </p>
                          </div>
                          <ArrowRightIcon size={16} stroke={2} className="text-orange-600 flex-shrink-0" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7">
                <h3 className="text-sm font-black text-gray-900 mb-4">基本情報</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">登録日</span>
                    <span className="font-bold text-gray-900">{seller.joinDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">開催イベント</span>
                    <span className="font-bold text-gray-900">{seller.pastEvents}回</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">販売点数</span>
                    <span className="font-bold text-gray-900">{seller.totalSales}点</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">評価</span>
                    <span className="font-bold text-yellow-600 flex items-center gap-1">
                      {seller.rating}
                      <StarIcon size={14} stroke={2} className="fill-current" />
                    </span>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Link href="/events">
                <button className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                  <StoreIcon size={18} stroke={1.5} />
                  イベント一覧に戻る
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
