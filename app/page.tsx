import Link from 'next/link';
import Header from './components/Header';
import Footer from './components/Footer';
import {
  ProductIcon,
  UserIcon,
  CalendarIcon,
  ChatIcon,
  BagIcon,
  PackageIcon,
  CoinIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckIcon,
  MapPinIcon,
  ClockIcon,
  ShirtIcon,
  DiamondIcon,
  LipstickIcon,
  WalletIcon,
  BarbellIcon,
  ShoeIcon,
  BowlIcon,
  HeadphonesIcon,
  PaletteIcon,
} from './components/Icons';
import type { ProductIconType } from './components/Icons';

const SHOPPING_EVENTS: { slug: string; time: string; region: string; name: string; tags: string[]; live: boolean; icon: ProductIconType }[] = [
  { slug: 'mina-craft', time: '20:00', region: '滋賀', name: 'mina.craft', tags: ['ハンドメイド', 'アクセ'], live: true, icon: 'diamond' },
  { slug: 'kyoto-vintage', time: '20:15', region: '京都', name: 'kyoto.vintage', tags: ['古着', 'レトロ'], live: false, icon: 'shirt' },
  { slug: 'osaka-antique', time: '20:30', region: '大阪', name: 'osaka.antique', tags: ['雑貨', '骨董'], live: false, icon: 'package' },
];

const ITEM_CATEGORIES = [
  { Icon: ShirtIcon, label: '女性服' },
  { Icon: ShirtIcon, label: '男性服' },
  { Icon: LipstickIcon, label: '化粧品' },
  { Icon: WalletIcon, label: '小物' },
  { Icon: DiamondIcon, label: 'ジュエリー' },
  { Icon: BarbellIcon, label: 'フィットネス' },
  { Icon: ShoeIcon, label: 'スニーカー' },
  { Icon: BowlIcon, label: '食品' },
  { Icon: HeadphonesIcon, label: '家電' },
  { Icon: PaletteIcon, label: 'ハンドメイド' },
];

const FAQ_POINTS = [
  {
    point: 'POINT.1',
    title: '本当に売れるの？',
    Icon: PackageIcon,
    badge: '年間販売数',
    value: '10万点',
    desc: 'ライブ接客で商品の魅力が伝わりやすく、購入者も安心。チャットで質問できます。',
  },
  {
    point: 'POINT.2',
    title: 'お金はかかるの？',
    Icon: CoinIcon,
    badge: '出店料',
    value: '1,200円',
    desc: '基本料金のみ。販売手数料はかかりません。出店成立は3名以上の予約。',
  },
  {
    point: 'POINT.3',
    title: '簡単に始められる？',
    Icon: SparklesIcon,
    badge: 'ステップ',
    value: '3STEP',
    desc: '登録 → 商品登録 → イベント開催。たったこれだけです！',
  },
];

const HOW_STEPS = [
  { step: '01', Icon: UserIcon, title: '会員登録', desc: '無料で登録。出店者か購入者か選べます。' },
  { step: '02', Icon: CalendarIcon, title: 'イベント予約', desc: '気になるイベントを予約。3名以上で成立！' },
  { step: '03', Icon: ChatIcon, title: 'チャット接客', desc: '出店者と直接会話しながらお買い物。' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden">
      <Header />

      {/* ===== HERO ===== */}
      <section className="relative bg-white dark:bg-gray-950 overflow-hidden">
        <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-50 dark:bg-gray-9000 rounded-full opacity-30" />
          <div className="absolute top-24 left-24 w-48 h-48 bg-orange-200 rounded-full opacity-20" />
          <div className="absolute -top-20 -right-32 w-96 h-96 bg-orange-50 dark:bg-gray-9000 rounded-full opacity-25" />
        </div>

        <div className="relative container-main section-spacing-sm">
          <div className="grid grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="col-span-12 lg:col-span-6 text-center lg:text-left">
              <p className="text-xs sm:text-sm lg:text-base font-bold text-orange-500 mb-4 tracking-widest uppercase">
                全国対応・誰でも始められる
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black leading-tight mb-7 text-gray-900 dark:text-white">
                <span className="text-orange-600">話題の</span><br />
                オンライン<br />
                <span className="text-orange-600">フリマを</span><br />
                楽しもう
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-700 dark:text-gray-300 mb-10 leading-relaxed">
                時間限定のチャット接客型フリマイベント。<br />
                出店者と直接会話しながら、特別なお買い物体験を。
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10">
                <Link
                  href="/events"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-bold text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95"
                >
                  イベントを見る <ArrowRightIcon size={18} stroke={2.5} />
                </Link>
                <Link
                  href="/seller"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-gray-950 text-orange-600 border-2 border-orange-500 rounded-full font-bold text-sm sm:text-base hover:bg-orange-50 dark:hover:bg-gray-900 transition-all active:scale-95"
                >
                  出店してみる
                </Link>
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 text-sm justify-center lg:justify-start">
                {['47都道府県対応', '出店料1,200円〜', '登録無料'].map((label) => (
                  <div key={label} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span className="w-6 h-6 rounded-full bg-orange-100 dark:bg-gray-800 flex items-center justify-center text-orange-600 flex-shrink-0">
                      <CheckIcon size={14} stroke={3} />
                    </span>
                    <span className="text-xs sm:text-sm font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Phone Mockup */}
            <div className="col-span-12 lg:col-span-6 flex justify-center items-center">
              <div className="relative animate-float">
                <div className="relative w-56 sm:w-64 lg:w-72 h-[460px] sm:h-[520px] lg:h-[580px] bg-gray-900 rounded-[2.5rem] lg:rounded-[3rem] p-3 shadow-2xl">
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-2xl z-10" />
                  <div className="w-full h-full bg-white dark:bg-gray-950 rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden flex flex-col">
                    <div className="bg-orange-50 dark:bg-gray-9000 px-4 pt-7 pb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-white dark:bg-gray-950 rounded-full flex items-center justify-center text-orange-600 font-black text-xs">F</div>
                        <p className="text-white font-bold text-xs">フリマライブ</p>
                      </div>
                      <ProductIcon type="sparkles" size={14} stroke={2} className="text-white" />
                    </div>
                    <div className="flex-1 bg-gradient-to-b from-orange-50 to-white p-3 space-y-2.5">
                      <div className="bg-white dark:bg-gray-950 rounded-xl p-3 shadow-sm border border-orange-100 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-orange-600">20:00 開催中</span>
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-bold">
                            <span className="w-1 h-1 bg-white dark:bg-gray-950 rounded-full animate-pulse" />LIVE
                          </span>
                        </div>
                        <p className="text-sm font-black text-gray-900 dark:text-white">mina.craft</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">滋賀</p>
                        <div className="aspect-square bg-gradient-to-br from-orange-200 to-orange-300 rounded-lg flex items-center justify-center text-orange-700">
                          <DiamondIcon size={48} stroke={1.5} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="relative h-12 sm:h-16 lg:h-20">
          <svg className="w-full h-full" viewBox="0 0 1440 100" preserveAspectRatio="none">
            <path fill="#FF6B00" d="M0,50 Q360,0 720,50 T1440,50 L1440,100 L0,100 Z" />
          </svg>
        </div>
      </section>

      {/* ===== SHOPPING NOW ===== */}
      <section className="relative bg-gradient-to-br from-orange-100 to-orange-200 dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden">
        <div aria-hidden className="absolute inset-0">
          <div className="absolute top-12 right-8 w-40 h-40 bg-orange-300 rounded-full opacity-20" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-orange-400 rounded-full opacity-15" />
        </div>

        <div className="relative container-main section-spacing-sm">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 text-orange-700 dark:text-white">SHOPPING NOW</h2>
            <p className="text-base lg:text-lg font-bold mb-3 text-orange-600 dark:text-orange-300">見るだけでも楽しい！</p>
            <p className="text-sm lg:text-base text-gray-700 dark:text-gray-300 max-w-2xl mx-auto font-medium">
              他では買えない掘り出し物や限定品も。気になる商品はライブで直接質問できます。
            </p>
          </div>

          <div className="grid grid-cols-12 gap-6 lg:gap-8 mb-12 lg:mb-16">
            {SHOPPING_EVENTS.map((event, idx) => (
              <div key={idx} className="col-span-12 sm:col-span-6 lg:col-span-4">
                <Link
                  href={`/event/${event.slug}`}
                  className="block bg-white dark:bg-gray-950/10 backdrop-blur border border-white/20 rounded-3xl p-7 lg:p-8 text-left hover:bg-white dark:bg-gray-950/20 hover:scale-105 transition-all h-full"
                >
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-sm font-bold">{event.time} 開始</span>
                    {event.live && (
                      <span className="flex items-center gap-1 px-3 py-1 bg-red-500 rounded-full text-xs font-bold">
                        <span className="w-1.5 h-1.5 bg-white dark:bg-gray-950 rounded-full animate-pulse" />
                        LIVE
                      </span>
                    )}
                  </div>
                  <div className="w-14 h-14 bg-white dark:bg-gray-950/20 rounded-2xl flex items-center justify-center mb-4">
                    <ProductIcon type={'diamond'} size={28} stroke={1.5} />
                  </div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <MapPinIcon size={12} stroke={2} />
                    <span className="text-xs opacity-80">{event.region}</span>
                  </div>
                  <p className="text-lg font-bold mb-4">イベント</p>
                  <div className="flex gap-2 flex-wrap">
                    {event.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-white dark:bg-gray-950/20 px-3 py-1 rounded-full">{tag}</span>
                    ))}
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-gray-950 text-orange-600 rounded-full font-bold text-sm sm:text-base shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              すべてのイベントを見る <ArrowRightIcon size={18} stroke={2.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== INTRO VIDEO ===== */}
      <section className="relative bg-white dark:bg-gray-950 overflow-hidden">
        <div className="relative container-main section-spacing-sm">
          <div className="text-center mb-10 lg:mb-12">
            <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-black tracking-widest uppercase mb-4">
              About Us
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white">
              フリマライブとは？
            </h2>
            <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-medium">
              サービスの使い方や魅力を動画でわかりやすくご紹介します。
            </p>
          </div>

          {/* Video Frame */}
          <div className="max-w-4xl mx-auto">
            {/* スマホ版: 縦動画 (9:16) */}
            <div className="lg:hidden max-w-xs mx-auto">
              <div className="relative aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl ring-4 ring-orange-500/20">
                <video
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                  preload="metadata"
                >
                  <source src="/videos/furima-intro-mobile.mp4" type="video/mp4" />
                  お使いのブラウザは動画再生に対応していません。
                </video>
              </div>
            </div>

            {/* PC版: 横動画 (16:9) */}
            <div className="hidden lg:block">
              <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl ring-4 ring-orange-500/20">
                <video
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                  preload="metadata"
                >
                  <source src="/videos/furima-intro.mp4" type="video/mp4" />
                  お使いのブラウザは動画再生に対応していません。
                </video>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ITEM LINE UP ===== */}
      <section className="relative bg-orange-600 text-white overflow-hidden">
        <div className="relative container-main section-spacing-sm text-center">
          <div className="mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">ITEM LINE UP</h2>
            <p className="text-sm lg:text-base text-orange-100">
              様々な魅力的な商品をライブ配信で紹介しています。
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
            {ITEM_CATEGORIES.map((item) => (
              <div key={item.label} className="group">
                <div className="aspect-square bg-white dark:bg-gray-950 rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform cursor-pointer text-orange-600">
                  <item.Icon size={40} stroke={1.5} />
                </div>
                <p className="text-xs sm:text-sm font-bold text-white/90">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="relative bg-gradient-to-b from-orange-500 via-orange-400 to-yellow-300 text-white overflow-hidden">
        <div aria-hidden className="absolute inset-0">
          <div className="absolute top-16 left-8 w-32 h-32 bg-orange-300 rounded-full opacity-50" />
          <div className="absolute -bottom-20 left-1/4 w-48 h-48 bg-yellow-300 rounded-full opacity-40" />
        </div>

        <div className="relative container-main section-spacing-sm">
          <div className="grid grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="col-span-12 lg:col-span-7 text-center lg:text-left">
              <p className="text-sm lg:text-base font-bold mb-4">あなたも今日からフリマ出店！</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-7">
                年間<br className="hidden sm:block" />
                <span className="block text-5xl sm:text-6xl lg:text-8xl my-2">10,000</span>
                件以上のイベント開催！
              </h2>
              <p className="text-sm lg:text-base text-white/90 mb-10">
                出店料たったの<span className="font-black text-white">1,200円〜</span>
              </p>
              <Link
                href="/seller"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-gray-950 text-orange-600 rounded-full font-bold text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                出店してみる <ArrowRightIcon size={18} stroke={2.5} />
              </Link>
            </div>

            <div className="col-span-12 lg:col-span-5 flex justify-center">
              <div className="w-48 sm:w-56 lg:w-64 h-[380px] sm:h-[440px] lg:h-[500px] bg-gray-900 rounded-[2.5rem] lg:rounded-[3rem] p-3 shadow-2xl">
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-gray-900 rounded-b-2xl z-10" />
                <div className="w-full h-full bg-white dark:bg-gray-950 rounded-[2rem] overflow-hidden flex flex-col">
                  <div className="bg-gray-900 text-white px-4 pt-7 pb-2 flex items-center justify-between">
                    <p className="text-xs font-bold">mina.craft</p>
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500 rounded-full text-[9px] font-bold">
                      <span className="w-1 h-1 bg-white dark:bg-gray-950 rounded-full animate-pulse" />LIVE
                    </span>
                  </div>
                  <div className="aspect-square bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center text-orange-800">
                    <DiamondIcon size={80} stroke={1.5} />
                  </div>
                  <div className="bg-white dark:bg-gray-950 px-4 py-3 border-b border-gray-100">
                    <p className="text-xs font-black text-gray-900 dark:text-white">レジンアクセサリー</p>
                    <p className="text-orange-600 font-black text-sm mt-1">¥2,800</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ POINTS ===== */}
      <section className="relative bg-yellow-300 overflow-hidden">
        <div className="relative container-main section-spacing-sm">
          <div className="text-center mb-12 lg:mb-16">
            <p className="text-xs sm:text-sm lg:text-base font-bold text-orange-700 mb-4 tracking-widest uppercase">FAQ</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white">よくある質問</h2>
          </div>

          <div className="grid grid-cols-12 gap-6 lg:gap-8">
            {FAQ_POINTS.map((point, idx) => (
              <div key={idx} className="col-span-12 sm:col-span-6 lg:col-span-4">
                <div className="bg-white dark:bg-gray-950 rounded-3xl p-7 sm:p-8 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all h-full flex flex-col">
                  <div className="inline-block w-fit px-4 py-1.5 bg-orange-600 text-white text-xs font-black rounded-full mb-5">
                    {point.point}
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white mb-5 leading-snug">
                    {point.title}
                  </h3>

                  <div className="bg-orange-50 dark:bg-gray-900 rounded-2xl p-5 lg:p-6 mb-5 text-center flex-shrink-0">
                    <p className="text-xs lg:text-sm text-orange-700 font-bold mb-2">{point.badge}</p>
                    <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-orange-600 mb-3">{point.value}</p>
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-orange-100 dark:bg-gray-800 rounded-xl text-orange-600">
                      <point.Icon size={20} stroke={1.5} />
                    </div>
                  </div>

                  <p className="text-sm lg:text-base text-gray-700 dark:text-gray-300 leading-relaxed flex-1">
                    {point.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW TO USE ===== */}
      <section className="relative bg-white dark:bg-gray-950 overflow-hidden">
        <div className="relative container-main section-spacing-sm">
          <div className="text-center mb-12 lg:mb-16">
            <p className="text-xs sm:text-sm lg:text-base font-bold text-orange-500 mb-4 tracking-widest uppercase">HOW TO USE</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white">
              <span className="text-orange-600">3STEP</span>で簡単スタート
            </h2>
          </div>

          <div className="grid grid-cols-12 gap-8 lg:gap-12">
            {HOW_STEPS.map((item) => (
              <div key={item.step} className="col-span-12 sm:col-span-6 lg:col-span-4 text-center">
                <div className="relative w-28 h-28 lg:w-32 lg:h-32 mx-auto mb-7">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white shadow-lg">
                    <item.Icon size={48} stroke={1.5} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-11 h-11 lg:w-12 lg:h-12 bg-yellow-400 rounded-full flex items-center justify-center text-xs lg:text-sm font-black text-gray-900 dark:text-white shadow-md">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-lg lg:text-xl font-black text-gray-900 dark:text-white mb-4">{item.title}</h3>
                <p className="text-sm lg:text-base text-gray-700 dark:text-gray-300 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white overflow-hidden">
        <div aria-hidden className="absolute inset-0">
          <div className="absolute -top-24 -right-16 w-80 h-80 bg-orange-400 rounded-full opacity-30 blur-2xl" />
          <div className="absolute -bottom-24 -left-16 w-80 h-80 bg-yellow-300 rounded-full opacity-20 blur-2xl" />
        </div>

        <div className="relative container-main section-spacing-sm">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 leading-tight">
              さあ、はじめよう！<br />
              あなたのフリマライフ
            </h2>
            <p className="text-sm lg:text-base mb-10 lg:mb-12 text-orange-50">
              会員登録は無料！全国の出店者と購入者をつなぐ、新しいフリマ体験。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-white dark:bg-gray-950 text-orange-600 rounded-full font-bold text-sm sm:text-base shadow-xl hover:scale-105 transition-all"
              >
                無料で会員登録 <ArrowRightIcon size={18} stroke={2.5} />
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

      <Footer />
    </div>
  );
}
