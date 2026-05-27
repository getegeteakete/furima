import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageHero from '../components/PageHero';
import {
  UserIcon,
  CalendarIcon,
  ChatIcon,
  BagIcon,
  PackageIcon,
  StoreIcon,
  SparklesIcon,
  TicketIcon,
  HeartIcon,
  MapPinIcon,
  CoinIcon,
  CheckIcon,
  ArrowRightIcon,
} from '../components/Icons';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <PageHero
        badge="How To Use"
        title="フリマライブの使い方"
        subtitle="購入者・出店者それぞれの簡単4ステップで始められます"
      />

      <main className="flex-1">
        {/* === FOR BUYERS === */}
        <section className="bg-white section-spacing-sm">
          <div className="container-main">
            <div className="text-center mb-16 lg:mb-20">
              <span className="inline-block px-5 py-2 bg-orange-100 text-orange-700 rounded-full text-xs sm:text-sm font-black mb-5 tracking-widest uppercase">
                For Buyers
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-5">
                購入者の方へ
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                4つの簡単ステップでお買い物が完了します
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {[
                { num: '01', Icon: UserIcon, title: '無料会員登録', desc: 'メールアドレスで簡単登録。LINEやGoogleアカウントでもOK。' },
                { num: '02', Icon: CalendarIcon, title: 'イベントを予約', desc: '気になるお店を見つけて予約。整理券番号が発行されます。' },
                { num: '03', Icon: ChatIcon, title: 'マンツーマン接客', desc: '順番が来たら通知。10分間1対1でチャット相談できます。' },
                { num: '04', Icon: BagIcon, title: 'その場で購入', desc: '気に入った商品をチャット内で購入。出店者が直接発送します。' },
              ].map((step) => (
                <div key={step.num} className="relative pt-5">
                  <div className="absolute -top-1 left-6 z-10">
                    <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-black rounded-full shadow-md tracking-wider">
                      STEP {step.num}
                    </span>
                  </div>

                  <div className="bg-white border-2 border-gray-100 rounded-3xl p-7 sm:p-8 hover:border-orange-300 hover:shadow-xl transition-all h-full">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl flex items-center justify-center mb-6 text-orange-600">
                      <step.Icon size={36} stroke={1.5} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-14 lg:mt-16">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-bold text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                イベントを探す <ArrowRightIcon size={20} />
              </Link>
            </div>
          </div>
        </section>

        {/* === FOR SELLERS === */}
        <section className="bg-orange-50 section-spacing-sm">
          <div className="container-main">
            <div className="text-center mb-16 lg:mb-20">
              <span className="inline-block px-5 py-2 bg-orange-600 text-white rounded-full text-xs sm:text-sm font-black mb-5 tracking-widest uppercase">
                For Sellers
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-5">
                出店者の方へ
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                ハンドメイド作家・古着販売者・雑貨販売者の方々が活躍中
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {[
                { num: '01', Icon: StoreIcon, title: '出店者登録', desc: 'プロフィール・ショップ名・地域・SNSリンクを登録。' },
                { num: '02', Icon: PackageIcon, title: '商品登録', desc: '商品の写真・説明・価格を登録。ピックアップ5品を選択。' },
                { num: '03', Icon: CalendarIcon, title: 'イベント設定', desc: '開催日時を設定。3名以上の予約で開催成立！' },
                { num: '04', Icon: SparklesIcon, title: 'ライブ接客', desc: '時間が来たらお客様とチャット開始。10分ずつ接客します。' },
              ].map((step) => (
                <div key={step.num} className="relative pt-5">
                  <div className="absolute -top-1 left-6 z-10">
                    <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-xs font-black rounded-full shadow-md tracking-wider">
                      STEP {step.num}
                    </span>
                  </div>

                  <div className="bg-white border-2 border-orange-200 rounded-3xl p-7 sm:p-8 hover:border-orange-400 hover:shadow-xl transition-all h-full">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mb-6 text-orange-700">
                      <step.Icon size={36} stroke={1.5} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* === PRICING === */}
        <section className="bg-white section-spacing-sm">
          <div className="container-main">
            <div className="text-center mb-14 lg:mb-16">
              <span className="inline-block px-5 py-2 bg-yellow-100 text-yellow-800 rounded-full text-xs sm:text-sm font-black mb-5 tracking-widest uppercase">
                Pricing
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-5">
                料金プラン
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
                出店者のみ料金が発生します。購入者は完全無料。
              </p>
            </div>

            <div className="max-w-lg mx-auto px-4">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 sm:p-10 lg:p-12 text-white shadow-2xl text-center relative overflow-hidden">
                <div aria-hidden className="absolute -top-16 -right-16 w-48 h-48 bg-orange-400 rounded-full opacity-30" />
                <div aria-hidden className="absolute -bottom-16 -left-16 w-48 h-48 bg-yellow-300 rounded-full opacity-20" />

                <div className="relative">
                  <p className="text-xs sm:text-sm font-bold mb-3 tracking-widest uppercase opacity-90">出店料</p>
                  <div className="flex items-baseline justify-center gap-2 mb-3">
                    <span className="text-6xl sm:text-7xl lg:text-8xl font-black">1,200</span>
                    <span className="text-2xl sm:text-3xl font-bold">円</span>
                  </div>
                  <p className="text-xs sm:text-sm opacity-90 mb-8">1イベント / 税込</p>

                  <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-left space-y-3 mb-8">
                    {['販売手数料 0円', '商品登録 無制限', '3名以上で開催成立', '銀行振込・PayPay対応'].map((item) => (
                      <div key={item} className="flex items-center gap-3 text-sm">
                        <span className="w-6 h-6 rounded-full bg-white text-orange-600 flex items-center justify-center flex-shrink-0">
                          <CheckIcon size={16} stroke={3} />
                        </span>
                        <span className="font-medium">{item}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 bg-white text-orange-600 rounded-full font-black text-sm sm:text-base shadow-xl hover:scale-105 transition-all"
                  >
                    出店者登録する <ArrowRightIcon size={18} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* === FEATURES === */}
        <section className="bg-gray-50 section-spacing-sm">
          <div className="container-main">
            <div className="text-center mb-14 lg:mb-16">
              <span className="inline-block px-5 py-2 bg-gray-200 text-gray-700 rounded-full text-xs sm:text-sm font-black mb-5 tracking-widest uppercase">
                Features
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900">
                フリマライブの特徴
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {[
                { Icon: TicketIcon, title: '整理券システム', desc: '予約順に整理券を配布。順番が来たら通知でお知らせします。' },
                { Icon: HeartIcon, title: 'マンツーマン接客', desc: '1対1だから商品の詳細や値段相談もしっかり対応できます。' },
                { Icon: MapPinIcon, title: '全国47都道府県', desc: '地域別カテゴリで地方の隠れた名店を発見できます。' },
                { Icon: CoinIcon, title: '手数料0円', desc: '販売手数料はゼロ。出店料の1,200円のみで気軽に始められます。' },
              ].map((feature) => (
                <div key={feature.title} className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all">
                  <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center mb-5 text-orange-600">
                    <feature.Icon size={28} stroke={1.5} />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* === CTA === */}
        <section className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white relative overflow-hidden">
          <div aria-hidden className="absolute inset-0">
            <div className="absolute -top-24 -right-16 w-80 h-80 bg-orange-400 rounded-full opacity-30 blur-2xl" />
            <div className="absolute -bottom-24 -left-16 w-80 h-80 bg-yellow-300 rounded-full opacity-20 blur-2xl" />
          </div>

          <div className="relative section-spacing-sm">
            <div className="container-main max-w-3xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 leading-tight">
                さあ、はじめよう！
              </h2>
              <p className="text-sm sm:text-base lg:text-lg mb-10 lg:mb-12 text-orange-50">
                会員登録は無料。今すぐ始められます。
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-white text-orange-600 rounded-full font-black text-sm sm:text-base shadow-xl hover:scale-105 transition-all"
                >
                  無料で会員登録 <ArrowRightIcon size={20} />
                </Link>
                <Link
                  href="/events"
                  className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-orange-700/50 backdrop-blur text-white border-2 border-white/30 rounded-full font-bold text-sm sm:text-base hover:bg-orange-700 transition-all"
                >
                  イベントを見る
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
