'use client';

import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageHero from '../components/PageHero';
import {
  ProductIcon,
  ArrowLeftIcon,
  HeartIcon,
  StarIcon,
  UserIcon,
} from '../components/Icons';
import { useFavorites } from '../components/FavoritesContext';
import { sellers } from '../lib/events';
import { getSellerProducts } from '../lib/supabaseStore';
import ProductThumb from '../components/ProductThumb';

export default function FavoritesPage() {
  const { followingSellers, toggleFollow } = useFavorites();

  const followedSellers = sellers.filter((seller) => followingSellers.has(seller.id));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <PageHero
        badge="Favorites"
        title="フォロー中の出店者"
        subtitle={`${followedSellers.length}人の出店者をフォロー中`}
      />

      <main className="flex-1">
        <section className="container-main py-12 sm:py-16">
          {followedSellers.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg font-bold mb-6">フォロー中の出店者がいません</p>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all"
              >
                イベントを探す
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {followedSellers.map((seller) => (
                <div
                  key={seller.id}
                  className="bg-white rounded-3xl overflow-hidden border-2 border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all flex flex-col"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-white flex-shrink-0">
                        <ProductIcon type={seller.icon} size={32} stroke={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-black text-white mb-1 truncate">
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

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <p className="text-sm text-gray-700 mb-4 line-clamp-2 flex-1">
                      {seller.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {seller.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-bold">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Products Preview */}
                    <div className="mb-6">
                      <p className="text-xs font-bold text-orange-600 mb-3">目玉商品</p>
                      <div className="grid grid-cols-3 gap-2">
                        {getSellerProducts(seller.id).map((product) => (
                          <div
                            key={product.id}
                            className="flex flex-col items-center text-center"
                          >
                            <div className="w-full aspect-square bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center mb-1 text-orange-600 overflow-hidden">
                              <ProductThumb product={product} iconSize={16} />
                            </div>
                            <p className="text-xs font-bold text-gray-900 line-clamp-1">
                              {product.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFollow(seller.id);
                        }}
                        className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                      >
                        <HeartIcon size={16} stroke={2} className="fill-red-600 text-red-600" />
                        フォロー中
                      </button>
                      <Link
                        href={`/seller/${seller.id}`}
                        className="flex-1 py-3 bg-orange-50 text-orange-600 rounded-xl font-bold hover:bg-orange-100 transition-all text-center"
                      >
                        プロフィール
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
