import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-orange-500 to-orange-600 text-white py-16 lg:py-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-orange-400 rounded-full opacity-40 translate-x-1/3 -translate-y-1/3" />
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm font-bold text-orange-100 mb-3">HOW TO USE</p>
          <h1 className="text-4xl lg:text-5xl font-black mb-4">
            フリマライブの使い方
          </h1>
          <p className="text-base lg:text-lg text-orange-100 max-w-2xl mx-auto leading-relaxed">
            購入者・出店者それぞれの始め方をご紹介。<br />
            誰でも簡単にオンラインフリマを楽しめます！
          </p>
        </div>
      </section>

      {/* For Buyer */}
      <section className="py-16 lg:py-24 bg-orange-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block px-5 py-2 bg-orange-600 text-white rounded-full text-sm font-black mb-4">
              FOR BUYERS
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900">購入者の方へ</h2>
            <p className="text-gray-600 mt-2">気になる商品を見つけて、出店者と直接会話しよう！</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: '01', title: '無料登録', desc: '会員登録は無料。LINE登録もOK', icon: '👤' },
              { step: '02', title: 'イベント予約', desc: '気になるイベントを予約', icon: '📅' },
              { step: '03', title: '開催時間に参加', desc: 'OPEN通知でお知らせ', icon: '🔔' },
              { step: '04', title: 'チャットでお買い物', desc: '出店者と会話しながら購入', icon: '💬' },
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition-shadow text-center">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center text-4xl">
                    {item.icon}
                  </div>
                  <span className="absolute -top-1 -right-1 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-black shadow-md">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-black text-gray-900 mb-2">{item.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Seller */}
      <section className="py-16 lg:py-24 bg-yellow-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block px-5 py-2 bg-orange-600 text-white rounded-full text-sm font-black mb-4">
              FOR SELLERS
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900">出店者の方へ</h2>
            <p className="text-gray-600 mt-2">商品を出品して、あなただけのオンラインフリマを開催！</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: '01', title: '出店者登録', desc: 'ショップ情報を登録', icon: '🏪' },
              { step: '02', title: '商品を登録', desc: '写真と説明をアップ', icon: '📦' },
              { step: '03', title: '開催日を予約', desc: '日時と地域を選ぶ', icon: '🗓️' },
              { step: '04', title: 'チャットで接客', desc: 'お客様と直接会話', icon: '💬' },
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition-shadow text-center">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center text-4xl">
                    {item.icon}
                  </div>
                  <span className="absolute -top-1 -right-1 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-black shadow-md">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-black text-gray-900 mb-2">{item.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="mt-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 lg:p-12 text-white text-center shadow-xl">
            <p className="text-sm font-bold text-orange-100 mb-3">PRICING</p>
            <h3 className="text-2xl lg:text-3xl font-black mb-6">出店料金</h3>
            <div className="inline-block bg-white text-orange-600 rounded-3xl p-6 lg:p-8 shadow-lg mb-6">
              <p className="text-sm font-bold mb-1">基本料金</p>
              <p className="text-5xl lg:text-6xl font-black">¥1,200</p>
              <p className="text-xs text-gray-500 mt-1">1イベントあたり</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
              {[
                '販売手数料 0円',
                '3名予約で開催成立',
                'PayPay・銀振対応',
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-2xl px-4 py-3">
                  <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-orange-600 text-xs font-black flex-shrink-0">✓</span>
                  <span className="text-sm font-bold">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">
            さあ、はじめよう！
          </h2>
          <p className="text-gray-600 mb-8">会員登録は無料。すぐに始められます。</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-black shadow-xl hover:scale-105 transition-all">
              無料で会員登録 →
            </Link>
            <Link href="/events" className="px-8 py-4 bg-white text-orange-600 border-2 border-orange-500 rounded-full font-bold hover:bg-orange-50 transition-all">
              イベントを見る
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
