'use client';

import { useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import {
  ProductIcon,
  ArrowLeftIcon,
  StarIcon,
  UserIcon,
  HeartIcon,
} from '../../components/Icons';
import { getSellerById } from '../../lib/events';
import { getSellerProducts } from '../../lib/supabaseStore';
import ProductThumb from '../../components/ProductThumb';
import { useStoreData } from '../../lib/useStore';
import { useFavorites } from '../../components/FavoritesContext';

export default function SellerProfilePage() {
  const params = useParams();
  const sellerId = params.id as string;
  const seller = getSellerById(sellerId);
  const productsGetter = useCallback(() => getSellerProducts(sellerId), [sellerId]);
  const [products] = useStoreData(productsGetter);
  const { toggleFollow, isFollowing } = useFavorites();

  if (!seller) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container-main py-20 text-center">
          <p className="text-xl text-gray-600">出店者が見つかりません</p>
          <Link href="/events" className="inline-block mt-6 text-orange-600 font-bold">
            ← イベント一覧へ戻る
          </Link>
        </div>
      </div>
    );
  }

  const isFollowed = isFollowing(sellerId);

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

      {/* Profile Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="container-main py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-10">
            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl flex items-center justify-center text-white flex-shrink-0">
              <ProductIcon type={seller.icon} size={64} stroke={1.5} />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="mb-4">
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">{seller.name}</h1>
                <p className="text-lg text-gray-600 mb-4">{seller.category}</p>
              </div>

              <div className="flex items-center gap-6 justify-center sm:justify-start mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">評価</p>
                  <div className="flex items-center gap-2">
                    <StarIcon size={20} stroke={2} className="fill-orange-500 text-orange-500" />
                    <p className="text-2xl font-black text-gray-900">{seller.rating}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">フォロワー</p>
                  <div className="flex items-center gap-2">
                    <UserIcon size={20} stroke={2} />
                    <p className="text-2xl font-black text-gray-900">{seller.followers}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => toggleFollow(sellerId)}
                className={`px-8 py-3 rounded-full font-bold text-lg transition-all ${
                  isFollowed
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                {isFollowed ? 'フォロー中' : 'フォローする'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="container-main py-12 sm:py-16">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-black text-gray-900 mb-6">プロフィール</h2>
          <p className="text-gray-700 leading-relaxed mb-8">{seller.description}</p>

          <h2 className="text-2xl font-black text-gray-900 mb-6">タグ</h2>
          <div className="flex flex-wrap gap-3 mb-8">
            {seller.tags.map((tag) => (
              <span key={tag} className="px-4 py-2 bg-orange-50 text-orange-700 rounded-full font-bold">
                #{tag}
              </span>
            ))}
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-6">目玉商品（5点）</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white border-2 border-gray-200 rounded-2xl p-4 text-center hover:border-orange-300 transition-all"
              >
                <div className="w-full aspect-square bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center mb-3 text-orange-600 overflow-hidden">
                  <ProductThumb product={product} iconSize={32} />
                </div>
                <p className="text-sm font-black text-gray-900 mb-2 line-clamp-2">{product.name}</p>
                <p className="text-lg font-black text-orange-600">¥{product.price.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
