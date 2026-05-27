'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import PageHero from '../components/PageHero';

export default function MyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <PageHero badge="MyPage" title="マイページ" subtitle="ご利用いただきありがとうございます" />
      <main className="flex-1 container-main py-16">
        <div className="max-w-2xl">
          <div className="bg-white rounded-3xl p-8 border-2 border-gray-200">
            <h2 className="text-2xl font-black text-gray-900 mb-6">プロフィール</h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <p className="text-sm text-gray-600 font-bold mb-1">ユーザー名</p>
                <p className="text-lg font-bold">ゲストユーザー</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-bold mb-1">メールアドレス</p>
                <p className="text-lg font-bold">user@example.com</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[
              { label: '予約中', value: '2件' },
              { label: '購入済み', value: '5件' },
              { label: 'フォロー中', value: '3人' },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-2xl p-6 border-2 border-gray-200 text-center">
                <p className="text-gray-600 font-bold mb-2">{item.label}</p>
                <p className="text-3xl font-black text-orange-600">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
