'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageHero from '../components/PageHero';
import { sellers } from '../lib/events';
import { getPublicEvents } from '../lib/supabaseStore';
import { useStoreData } from '../lib/useStore';
import { ProductIcon } from '../components/Icons';
import Link from 'next/link';

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [query, setQuery] = useState(q);
  const [publicEvents] = useStoreData(getPublicEvents);

  const eventResults = publicEvents.filter((e) =>
    e.region.toLowerCase().includes(query.toLowerCase()) ||
    e.sellers.some((s) => s.name.toLowerCase().includes(query.toLowerCase()))
  );

  const sellerResults = sellers.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    s.category.toLowerCase().includes(query.toLowerCase()) ||
    s.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <PageHero badge="Search" title="検索" subtitle={query ? `「${query}」の検索結果` : '出店者やイベントを検索'} />

      <main className="flex-1 container-main py-12">
        <div className="mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="出店者名やカテゴリで検索..."
            className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl text-lg font-bold focus:outline-none focus:border-orange-500"
          />
        </div>

        {!query ? (
          <div className="text-center py-16 text-gray-600">
            <p className="text-lg font-bold">検索キーワードを入力してください</p>
          </div>
        ) : (
          <>
            {/* Events */}
            {eventResults.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-black text-gray-900 mb-6">イベント</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {eventResults.map((event) => (
                    <Link key={event.id} href={`/event/${event.id}`}>
                      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-orange-300 transition-all">
                        <p className="text-sm text-orange-600 font-bold mb-2">{event.startTime}〜{event.endTime}</p>
                        <p className="text-xl font-black text-gray-900 mb-2">{event.region}</p>
                        <p className="text-sm text-gray-600">{event.sellers.length}店舗出店</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Sellers */}
            {sellerResults.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-black text-gray-900 mb-6">出店者</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sellerResults.map((seller) => (
                    <Link key={seller.id} href={`/seller/${seller.id}`}>
                      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-orange-300 transition-all">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <ProductIcon type={seller.icon} size={24} />
                          </div>
                          <div>
                            <p className="font-black text-gray-900">{seller.name}</p>
                            <p className="text-xs text-gray-600">{seller.category}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{seller.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {eventResults.length === 0 && sellerResults.length === 0 && (
              <div className="text-center py-16 text-gray-600">
                <p className="text-lg font-bold">検索結果が見つかりません</p>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
