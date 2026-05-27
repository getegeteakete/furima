import Link from 'next/link';
import Header from './components/Header';
import Footer from './components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />

      {/* ===== HERO SECTION ===== */}
      <section className="relative bg-white overflow-hidden">
        <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-32 w-96 h-96 bg-orange-500 rounded-full opacity-90" />
          <div className="absolute top-20 left-24 w-48 h-48 bg-orange-400 rounded-full opacity-50" />
          <div className="absolute -top-20 -right-24 w-96 h-96 bg-orange-500 rounded-full opacity-80" />
          <div className="absolute top-40 right-32 w-40 h-40 bg-orange-300 rounded-full opacity-40 hidden lg:block" />
        </div>

        <div className="relative section-spacing">
          <div className="container-main">
            <div className="grid grid-cols-12 gap-6 lg:gap-12 items-center">
              {/* Text */}
              <div className="col-span-12 lg:col-span-6 text-center lg:text-left py-4 sm:py-6 lg:py-8">
                <p className="text-xs sm:text-sm lg:text-base font-bold text-orange-500 mb-3 lg:mb-4 tracking-widest uppercase">
                  全国対応・誰でも始められる
                </p>
                <h1 className="text-2xl sm:text-3xl lg:text-6xl font-black leading-tight mb-6 lg:mb-8 break-words">
                  <span className="text-orange-600">話題の</span><br className="hidden sm:block" />
                  オンライン<br className="hidden sm:block" />
                  <span className="text-orange-600">フリマを</span><br />
                  楽しもう
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-gray-700 mb-8 lg:mb-10">
                  時間限定のチャット接客型フリマイベント。<br />
                  出店者と直接会話しながら、特別なお買い物体験を。
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8 lg:mb-10">
                  <Link
                    href="/events"
                    className="inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-bold text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95"
                  >
                    イベントを見る <span>→</span>
                  </Link>
                  <Link
                    href="/seller"
                    className="inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3 sm:py-4 bg-white text-orange-600 border-2 border-orange-500 rounded-full font-bold text-sm sm:text-base hover:bg-orange-50 transition-all active:scale-95"
                  >
                    出店してみる
                  </Link>
                </div>
                <div className="space-y-2 sm:space-y-0 flex flex-col sm:flex-row flex-wrap gap-3 text-xs sm:text-sm justify-center lg:justify-start">
                  {['47都道府県対応', '出店料1,200円〜', '登録無料'].map((label) => (
                    <div key={label} className="flex items-center gap-2 text-gray-700">
                      <span className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-bold flex-shrink-0">✓</span>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phone */}
              <div className="col-span-12 lg:col-span-6 flex justify-center items-center min-h-[320px] sm:min-h-[480px] lg:min-h-[620px]">
                <PhoneMockup variant="home" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative h-10 sm:h-16 lg:h-20">
          <svg className="w-full h-full" viewBox="0 0 1440 100" preserveAspectRatio="none">
            <path fill="#FF6B00" d="M0,50 Q360,0 720,50 T1440,50 L1440,100 L0,100 Z" />
          </svg>
        </div>
      </section>

      {/* ===== SHOPPING NOW SECTION ===== */}
      <section className="relative bg-orange-500 text-white overflow-hidden">
        <div aria-hidden className="absolute inset-0">
          <div className="absolute top-12 right-8 w-40 h-40 bg-orange-400 rounded-full opacity-40" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-orange-300 rounded-full opacity-30" />
        </div>

        <div className="relative section-spacing">
          <div className="container-main">
            <div className="text-center mb-10 sm:mb-12 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black mb-3 lg:mb-4">SHOPPING NOW</h2>
              <p className="text-sm sm:text-base lg:text-lg font-medium mb-2 lg:mb-3 text-orange-100">見るだけでも楽しい！</p>
              <p className="text-xs sm:text-sm lg:text-base text-orange-100 max-w-2xl mx-auto">
                他では買えない掘り出し物や限定品も。気になる商品はライブで直接質問できます。
              </p>
            </div>

            <div className="grid grid-cols-12 gap-5 sm:gap-6 lg:gap-8 mb-10 sm:mb-12 lg:mb-16">
              {[
                { time: '20:00', region: '滋賀', name: 'mina.craft', tags: ['ハンドメイド', 'アクセ'], live: true },
                { time: '20:15', region: '京都', name: 'kyoto.vintage', tags: ['古着', 'レトロ'], live: false },
                { time: '20:30', region: '大阪', name: 'osaka.antique', tags: ['雑貨', '骨董'], live: false },
              ].map((event, idx) => (
                <div key={idx} className="col-span-12 sm:col-span-6 lg:col-span-4">
                  <Link
                    href="/live"
                    className="block bg-white/10 backdrop-blur border border-white/20 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-7 text-left hover:bg-white/20 hover:scale-105 transition-all h-full"
                  >
                    <div className="flex items-center justify-between mb-4 lg:mb-5">
                      <span className="text-xs sm:text-sm font-bold">{event.time} 開始</span>
                      {event.live && (
                        <span className="flex items-center gap-1 px-2.5 py-1 bg-red-500 rounded-full text-[10px] sm:text-xs font-bold">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                          LIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm opacity-80 mb-2 lg:mb-3">📍 {event.region}</p>
                    <p className="text-base sm:text-lg font-bold mb-4 lg:mb-5">{event.name}</p>
                    <div className="flex gap-2 flex-wrap">
                      {event.tags.map((tag) => (
                        <span key={tag} className="text-[10px] sm:text-xs bg-white/20 px-2.5 py-1 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-7 sm:px-8 py-3 sm:py-4 bg-white text-orange-600 rounded-full font-bold text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95"
              >
                すべてのイベントを見る →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ITEM LINE UP SECTION ===== */}
      <section className="relative bg-orange-600 text-white overflow-hidden">
        <div className="relative section-spacing">
          <div className="container-main text-center">
            <div className="mb-10 sm:mb-12 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black mb-3 lg:mb-4">ITEM LINE UP</h2>
              <p className="text-xs sm:text-sm lg:text-base text-orange-100">
                様々な魅力的な商品をライブ配信で紹介しています。
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-8 max-w-5xl mx-auto">
              {[
                { emoji: '👗', label: '女性服' },
                { emoji: '🧥', label: '男性服' },
                { emoji: '💄', label: '化粧品' },
                { emoji: '👜', label: '小物' },
                { emoji: '💎', label: 'ジュエリー' },
                { emoji: '🏋️', label: 'フィットネス' },
                { emoji: '👟', label: 'スニーカー' },
                { emoji: '🍽️', label: '食品' },
                { emoji: '🎧', label: '家電' },
                { emoji: '🎨', label: 'ハンドメイド' },
              ].map((item) => (
                <div key={item.label} className="group">
                  <div className="aspect-square bg-white rounded-full flex items-center justify-center text-3xl sm:text-4xl lg:text-5xl mb-2 lg:mb-4 shadow-lg group-hover:scale-110 transition-transform cursor-pointer">
                    {item.emoji}
                  </div>
                  <p className="text-xs lg:text-sm font-bold text-white/90 break-words">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="relative bg-gradient-to-b from-orange-500 via-orange-400 to-yellow-300 text-white overflow-hidden">
        <div aria-hidden className="absolute inset-0">
          <div className="absolute top-16 left-8 w-32 h-32 bg-orange-300 rounded-full opacity-50" />
          <div className="absolute -bottom-20 left-1/4 w-48 h-48 bg-yellow-300 rounded-full opacity-40" />
          <div className="absolute top-1/3 -right-12 w-40 h-40 bg-orange-200 rounded-full opacity-40" />
        </div>

        <div className="relative section-spacing">
          <div className="container-main">
            <div className="grid grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="col-span-12 lg:col-span-6 text-center lg:text-left py-4 lg:py-0">
                <p className="text-xs sm:text-sm lg:text-base font-bold mb-3 lg:mb-4">あなたも今日からフリマ出店！</p>
                <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black leading-tight mb-6 lg:mb-8 break-words">
                  年間<br className="hidden sm:block" />
                  <span className="block text-4xl sm:text-5xl lg:text-7xl my-2">10,000</span>
                  件以上のイベント開催！
                </h2>
                <p className="text-xs sm:text-sm lg:text-base text-white/90 mb-8 lg:mb-10">
                  出店料たったの<span className="font-black text-white">1,200円〜</span>
                </p>
                <Link
                  href="/seller"
                  className="inline-flex items-center gap-2 px-7 sm:px-8 py-3 sm:py-4 bg-white text-orange-600 rounded-full font-bold text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95"
                >
                  出店してみる →
                </Link>
              </div>

              <div className="col-span-12 lg:col-span-6 flex justify-center">
                <div className="scale-75 sm:scale-90 lg:scale-100">
                  <PhoneMockup variant="live" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ POINTS SECTION ===== */}
      <section className="relative bg-yellow-300 overflow-hidden">
        <div className="relative section-spacing">
          <div className="container-main">
            <div className="text-center mb-10 sm:mb-12 lg:mb-16">
              <p className="text-xs sm:text-sm lg:text-base font-bold text-orange-700 mb-3 lg:mb-4 tracking-widest uppercase">FAQ</p>
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-gray-900">よくある質問</h2>
            </div>

            <div className="grid grid-cols-12 gap-5 sm:gap-6 lg:gap-8">
              {[
                {
                  point: 'POINT.1',
                  title: '本当に\n売れるの？',
                  emoji: '📦',
                  badge: '年間販売数',
                  value: '10万点',
                  desc: 'ライブ接客で商品の魅力が伝わりやすく、購入者も安心。チャットで質問できます。',
                },
                {
                  point: 'POINT.2',
                  title: 'お金は\nかかるの？',
                  emoji: '💰',
                  badge: '出店料',
                  value: '1,200円',
                  desc: '基本料金のみ。販売手数料はかかりません。出店成立は3名以上の予約。',
                },
                {
                  point: 'POINT.3',
                  title: '簡単に\n始められる？',
                  emoji: '✨',
                  badge: 'ステップ',
                  value: '3STEP',
                  desc: '登録 → 商品登録 → イベント開催。たったこれだけです！',
                },
              ].map((point, idx) => (
                <div key={idx} className="col-span-12 sm:col-span-6 lg:col-span-4">
                  <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-7 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all h-full flex flex-col">
                    <div className="inline-block w-fit px-3 lg:px-4 py-1.5 bg-orange-600 text-white text-xs font-black rounded-full mb-4 lg:mb-6">
                      {point.point}
                    </div>
                    <h3 className="text-sm sm:text-base lg:text-lg font-black text-gray-900 mb-4 lg:mb-6 whitespace-pre-line leading-snug">
                      {point.title}
                    </h3>

                    <div className="bg-orange-50 rounded-2xl p-4 sm:p-5 lg:p-6 mb-4 lg:mb-6 text-center flex-shrink-0">
                      <p className="text-[10px] sm:text-xs lg:text-sm text-orange-700 font-bold mb-1.5 lg:mb-2">{point.badge}</p>
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-orange-600 mb-1.5 lg:mb-2">{point.value}</p>
                      <span className="text-xl lg:text-2xl">{point.emoji}</span>
                    </div>

                    <p className="text-xs sm:text-sm lg:text-base text-gray-700 leading-relaxed flex-1">
                      {point.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW TO USE SECTION ===== */}
      <section className="relative bg-white overflow-hidden">
        <div className="relative section-spacing">
          <div className="container-main">
            <div className="text-center mb-10 sm:mb-12 lg:mb-16">
              <p className="text-xs sm:text-sm lg:text-base font-bold text-orange-500 mb-3 tracking-widest uppercase">HOW TO USE</p>
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-gray-900">
                <span className="text-orange-600">3STEP</span>で簡単スタート
              </h2>
            </div>

            <div className="grid grid-cols-12 gap-8 lg:gap-12">
              {[
                { step: '01', title: '会員登録', desc: '無料で登録。出店者か購入者か選べます。', icon: '👤' },
                { step: '02', title: 'イベント予約', desc: '気になるイベントを予約。3名以上で成立！', icon: '📅' },
                { step: '03', title: 'チャット接客', desc: '出店者と直接会話しながらお買い物。', icon: '💬' },
              ].map((item) => (
                <div key={item.step} className="col-span-12 sm:col-span-6 lg:col-span-4 text-center">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 mx-auto mb-5 lg:mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-4xl sm:text-5xl lg:text-6xl shadow-lg">
                      {item.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-yellow-400 rounded-full flex items-center justify-center text-xs sm:text-sm font-black text-gray-900 shadow-md">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-black text-gray-900 mb-3 lg:mb-4">{item.title}</h3>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-700 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white overflow-hidden">
        <div aria-hidden className="absolute inset-0">
          <div className="absolute -top-24 -right-16 w-80 h-80 bg-orange-400 rounded-full opacity-30" />
          <div className="absolute -bottom-24 -left-16 w-80 h-80 bg-yellow-300 rounded-full opacity-20" />
        </div>

        <div className="relative section-spacing">
          <div className="container-main text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black mb-5 sm:mb-6 lg:mb-8 leading-tight break-words">
              さあ、はじめよう！<br />
              あなたのフリマライフ
            </h2>
            <p className="text-xs sm:text-sm lg:text-base mb-8 sm:mb-10 lg:mb-12 text-orange-50">
              会員登録は無料！全国の出店者と購入者をつなぐ、新しいフリマ体験。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-7 sm:px-10 lg:px-12 py-3 sm:py-4 bg-white text-orange-600 rounded-full font-bold text-sm sm:text-base shadow-xl hover:shadow-2xl hover:scale-105 transition-all active:scale-95"
              >
                無料で会員登録 →
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center justify-center gap-2 px-7 sm:px-10 lg:px-12 py-3 sm:py-4 bg-orange-700/50 backdrop-blur text-white border-2 border-white/30 rounded-full font-bold text-sm sm:text-base hover:bg-orange-700 transition-all active:scale-95"
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

function PhoneMockup({ variant = 'home' }: { variant?: 'home' | 'live' }) {
  return (
    <div className="relative animate-float">
      <div className="relative w-52 sm:w-64 lg:w-80 h-[440px] sm:h-[540px] lg:h-[650px] bg-gray-900 rounded-3xl lg:rounded-4xl p-3 lg:p-4 shadow-2xl">
        <div className="absolute top-3 lg:top-4 left-1/2 -translate-x-1/2 w-32 h-6 lg:h-7 bg-gray-900 rounded-b-2xl z-10" />
        <div className="w-full h-full bg-white rounded-3xl lg:rounded-4xl overflow-hidden flex flex-col">
          {variant === 'home' ? <PhoneHomeContent /> : <PhoneLiveContent />}
        </div>
      </div>

      {variant === 'home' && (
        <>
          <div className="absolute -left-8 lg:-left-16 top-16 bg-white rounded-2xl rounded-bl-sm shadow-xl px-3 lg:px-4 py-2 lg:py-3 max-w-[140px] animate-bounce-soft">
            <p className="text-[8px] lg:text-xs font-bold text-orange-600 mb-0.5">nana♡</p>
            <p className="text-[7px] lg:text-xs text-gray-700">欲しい！</p>
          </div>
          <div className="absolute -right-6 lg:-right-12 top-40 bg-orange-500 text-white rounded-2xl rounded-br-sm shadow-xl px-3 lg:px-4 py-2 lg:py-3 max-w-[130px] animate-bounce-soft" style={{ animationDelay: '0.5s' }}>
            <p className="text-[8px] lg:text-xs font-bold mb-0.5">moru</p>
            <p className="text-[7px] lg:text-xs">セール？</p>
          </div>
          <div className="absolute -left-10 lg:-left-16 bottom-32 bg-white rounded-2xl rounded-bl-sm shadow-xl px-3 lg:px-4 py-2 lg:py-3 max-w-[130px] animate-bounce-soft" style={{ animationDelay: '1s' }}>
            <p className="text-[8px] lg:text-xs font-bold text-orange-600 mb-0.5">parumu</p>
            <p className="text-[7px] lg:text-xs text-gray-700">可愛い！</p>
          </div>
        </>
      )}
    </div>
  );
}

function PhoneHomeContent() {
  return (
    <>
      <div className="bg-orange-500 px-3 lg:px-4 pt-6 lg:pt-8 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-orange-600 font-black text-[10px]">F</div>
          <p className="text-white font-bold text-[10px] lg:text-xs">フリマ</p>
        </div>
        <span className="text-white text-xs">🔔</span>
      </div>
      <div className="flex-1 bg-gradient-to-b from-orange-50 to-white p-2.5 lg:p-3 overflow-hidden space-y-2">
        <div className="bg-white rounded-lg lg:rounded-2xl p-2.5 lg:p-3 shadow-sm border border-orange-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[7px] lg:text-xs font-bold text-orange-600">20:00 開催中</span>
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[7px] font-bold">
              <span className="w-0.5 h-0.5 bg-white rounded-full animate-pulse" />LIVE
            </span>
          </div>
          <p className="text-[9px] lg:text-xs font-black text-gray-900">mina.craft</p>
          <p className="text-[8px] text-gray-500">滋賀</p>
        </div>
      </div>
    </>
  );
}

function PhoneLiveContent() {
  return (
    <>
      <div className="bg-gray-900 text-white px-3 lg:px-4 pt-6 lg:pt-8 pb-1.5 flex items-center justify-between">
        <p className="text-[8px] lg:text-xs font-bold">mina.craft</p>
        <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-red-500 rounded-full text-[7px] font-bold">
          <span className="w-0.5 h-0.5 bg-white rounded-full animate-pulse" />LIVE
        </span>
      </div>
      <div className="aspect-square bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center text-6xl lg:text-7xl">💎</div>
      <div className="bg-white px-3 lg:px-4 py-2 border-b border-gray-100">
        <p className="text-[8px] lg:text-xs font-black text-gray-900">レジンアクセサリー</p>
        <p className="text-orange-600 font-black text-xs lg:text-sm mt-0.5">¥2,800</p>
      </div>
    </>
  );
}
