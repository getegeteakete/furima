import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageHero from '../components/PageHero';

const BUYER_STEPS = [
  { num: '01', icon: '👤', title: '無料会員登録', desc: 'メールアドレスで簡単登録。LINEやGoogleアカウントでもOK。' },
  { num: '02', icon: '📅', title: 'イベントを予約', desc: '気になるお店を見つけて予約。整理券番号が発行されます。' },
  { num: '03', icon: '💬', title: 'マンツーマン接客', desc: '順番が来たら通知。10分間1対1でチャット相談できます。' },
  { num: '04', icon: '🛍️', title: 'その場で購入', desc: '気に入った商品をチャット内で購入。出店者が直接発送します。' },
];

const SELLER_STEPS = [
  { num: '01', icon: '📝', title: '出店者登録', desc: 'プロフィール・ショップ名・地域・SNSリンクを登録。' },
  { num: '02', icon: '📦', title: '商品登録', desc: '商品の写真・説明・価格を登録。ピックアップ5品を選択。' },
  { num: '03', icon: '🗓️', title: 'イベント設定', desc: '開催日時を設定。3名以上の予約で開催成立！' },
  { num: '04', icon: '💎', title: 'ライブ接客', desc: '時間が来たらお客様とチャット開始。10分ずつ接客します。' },
];

const FEATURES = [
  { icon: '🎫', title: '整理券システム', desc: '予約順に整理券を配布。順番が来たら通知でお知らせします。' },
  { icon: '💕', title: 'マンツーマン接客', desc: '1対1だから商品の詳細や値段相談もしっかり対応できます。' },
  { icon: '🌏', title: '全国47都道府県', desc: '地域別カテゴリで地方の隠れた名店を発見できます。' },
  { icon: '💰', title: '手数料0円', desc: '販売手数料はゼロ。出店料の1,200円のみで気軽に始められます。' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <PageHero
        badge="How To Use"
        title="フリマライブの使い方"
        subtitle="購入者・出店者それぞれの簡単3ステップで始められます"
      />

      <main className="flex-1">
        {/* For Buyers */}
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
            <div className="text-center mb-10 sm:mb-12 lg:mb-16">
              <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs sm:text-sm font-black mb-4">
                FOR BUYERS
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-3">
                購入者の方へ
              </h2>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 max-w-2xl mx-auto">
                4つの簡単ステップでお買い物が完了します
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {BUYER_STEPS.map((step) => (
                <div key={step.num} className="relative">
                  {/* Number badge */}
                  <div className="absolute -top-3 left-5 z-10">
                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-black rounded-full shadow-md">
                      STEP {step.num}
                    </span>
                  </div>

                  <div className="bg-white border-2 border-orange-100 rounded-2xl p-5 sm:p-6 pt-7 sm:pt-8 hover:border-orange-300 hover:shadow-lg transition-all h-full">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl mb-4 shadow-md">
                      {step.icon}
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-10 lg:mt-12">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-7 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-bold text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                イベントを探す →
              </Link>
            </div>
          </div>
        </section>

        {/* For Sellers */}
        <section className="bg-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
            <div className="text-center mb-10 sm:mb-12 lg:mb-16">
              <span className="inline-block px-4 py-1.5 bg-orange-600 text-white rounded-full text-xs sm:text-sm font-black mb-4">
                FOR SELLERS
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-3">
                出店者の方へ
              </h2>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 max-w-2xl mx-auto">
                ハンドメイド作家・古着販売者・雑貨販売者の方々が活躍中
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {SELLER_STEPS.map((step) => (
                <div key={step.num} className="relative">
                  <div className="absolute -top-3 left-5 z-10">
                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-xs font-black rounded-full shadow-md">
                      STEP {step.num}
                    </span>
                  </div>

                  <div className="bg-white border-2 border-orange-200 rounded-2xl p-5 sm:p-6 pt-7 sm:pt-8 hover:border-orange-400 hover:shadow-lg transition-all h-full">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl mb-4 shadow-md">
                      {step.icon}
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
            <div className="text-center mb-10 lg:mb-12">
              <span className="inline-block px-4 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-xs sm:text-sm font-black mb-4">
                PRICING
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-3">
                料金プラン
              </h2>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                出店者のみ料金が発生します。購入者は完全無料。
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-2xl text-center relative overflow-hidden">
                <div aria-hidden className="absolute -top-10 -right-10 w-40 h-40 bg-orange-400 rounded-full opacity-30" />
                <div aria-hidden className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-300 rounded-full opacity-20" />

                <div className="relative">
                  <p className="text-xs sm:text-sm font-bold mb-2 tracking-widest uppercase opacity-90">出店料</p>
                  <div className="flex items-baseline justify-center gap-1 mb-4">
                    <span className="text-5xl sm:text-6xl lg:text-7xl font-black">1,200</span>
                    <span className="text-xl sm:text-2xl font-bold">円</span>
                  </div>
                  <p className="text-xs sm:text-sm opacity-90 mb-6">1イベント / 税込</p>

                  <div className="bg-white/10 backdrop-blur rounded-2xl p-4 sm:p-5 text-left space-y-2 mb-6">
                    {[
                      '販売手数料 0円',
                      '商品登録 無制限',
                      '3名以上で開催成立',
                      '銀行振込・PayPay対応',
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs sm:text-sm">
                        <span className="w-5 h-5 rounded-full bg-white text-orange-600 flex items-center justify-center text-xs font-black flex-shrink-0">✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 sm:py-4 bg-white text-orange-600 rounded-full font-black text-sm sm:text-base shadow-xl hover:scale-105 transition-all"
                  >
                    出店者登録する →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
            <div className="text-center mb-10 lg:mb-12">
              <span className="inline-block px-4 py-1.5 bg-gray-200 text-gray-700 rounded-full text-xs sm:text-sm font-black mb-4">
                FEATURES
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900">
                フリマライブの特徴
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 hover:shadow-md transition-all">
                  <div className="text-3xl sm:text-4xl mb-3">{feature.icon}</div>
                  <h3 className="text-sm sm:text-base font-black text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-4 lg:mb-6 leading-tight">
              さあ、はじめよう！
            </h2>
            <p className="text-sm sm:text-base mb-8 lg:mb-10 text-orange-50">
              会員登録は無料。今すぐ始められます。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-7 sm:px-10 py-3.5 sm:py-4 bg-white text-orange-600 rounded-full font-black text-sm sm:text-base shadow-xl hover:scale-105 transition-all"
              >
                無料で会員登録 →
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center justify-center gap-2 px-7 sm:px-10 py-3.5 sm:py-4 bg-orange-700/50 backdrop-blur text-white border-2 border-white/30 rounded-full font-bold text-sm sm:text-base hover:bg-orange-700 transition-all"
              >
                イベントを見る
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
