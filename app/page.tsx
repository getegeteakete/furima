import Link from 'next/link';
import Header from './components/Header';
import Footer from './components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />

      {/* ===== HERO SECTION ===== */}
      <section className="relative bg-white overflow-hidden">
        {/* Background decorations - constrained */}
        <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-orange-500 rounded-full opacity-90" />
          <div className="absolute top-20 left-32 w-40 h-40 bg-orange-400 rounded-full opacity-50" />
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-orange-500 rounded-full opacity-80" />
          <div className="absolute top-32 right-32 w-32 h-32 bg-orange-300 rounded-full opacity-40 hidden lg:block" />
          <div className="absolute top-40 right-16 hidden lg:grid grid-cols-10 gap-1.5">
            {Array.from({ length: 60 }).map((_, i) => (
              <div key={i} className="w-1 h-1 bg-yellow-400 rounded-full" />
            ))}
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 lg:pt-20 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Hero text */}
            <div className="relative z-10 text-center lg:text-left order-2 lg:order-1">
              <p className="text-sm lg:text-base font-bold text-orange-500 mb-3 lg:mb-4 tracking-wide">
                全国どこからでも！誰でも始められる
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.15] mb-6">
                <span className="text-orange-600">話題のオンライン</span><br />
                <span className="text-gray-900">フリマを</span>
                <span className="text-orange-600">楽しもう</span>
              </h1>
              <p className="text-base lg:text-lg text-gray-600 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                時間限定のチャット接客型フリマイベント。<br />
                出店者と直接会話しながら、特別なお買い物体験を。
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link
                  href="/events"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                >
                  イベントを見る <span>→</span>
                </Link>
                <Link
                  href="/seller"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-orange-600 border-2 border-orange-500 rounded-full font-bold hover:bg-orange-50 transition-all"
                >
                  出店してみる
                </Link>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-3 mt-8 justify-center lg:justify-start">
                {['47都道府県対応', '出店料1,200円〜', '会員登録無料'].map((label) => (
                  <div key={label} className="flex items-center gap-2 text-xs lg:text-sm text-gray-600">
                    <span className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs flex-shrink-0">✓</span>
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Phone mockup */}
            <div className="relative order-1 lg:order-2 flex justify-center items-center min-h-[480px] lg:min-h-[620px]">
              <PhoneMockup variant="home" />
            </div>
          </div>
        </div>

        {/* Wave bottom transition */}
        <div className="relative">
          <svg className="block w-full h-12 lg:h-20" viewBox="0 0 1440 80" preserveAspectRatio="none">
            <path fill="#FF6B00" d="M0,40 C320,0 720,80 1440,40 L1440,80 L0,80 Z" />
          </svg>
        </div>
      </section>

      {/* ===== SHOPPING NOW SECTION ===== */}
      <section className="relative bg-orange-500 text-white py-16 lg:py-24 overflow-hidden">
        {/* Decorations */}
        <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-40 h-40 bg-orange-400 rounded-full opacity-40" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-orange-300 rounded-full opacity-30" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 tracking-tight">SHOPPING NOW</h2>
          <p className="text-base lg:text-lg font-medium mb-2">見るだけでも楽しい！</p>
          <p className="text-sm lg:text-base text-orange-100 max-w-2xl mx-auto leading-relaxed">
            他では買えない掘り出し物や限定品も。<br className="hidden sm:block" />
            気になる商品はライブで直接質問できる、参加型ショッピング体験。
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mt-10 lg:mt-12 max-w-5xl mx-auto">
            {[
              { time: '20:00', region: '滋賀', name: 'mina.craft', tags: ['ハンドメイド', 'アクセ'], live: true },
              { time: '20:15', region: '京都', name: 'kyoto.vintage', tags: ['古着', 'レトロ'], live: false },
              { time: '20:30', region: '大阪', name: 'osaka.antique', tags: ['雑貨', '骨董'], live: false },
            ].map((event, idx) => (
              <Link
                key={idx}
                href="/live"
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 text-left hover:bg-white/20 hover:scale-105 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold">{event.time} 開始</span>
                  {event.live && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-red-500 rounded-full text-xs font-bold">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      LIVE
                    </span>
                  )}
                </div>
                <p className="text-sm opacity-80 mb-1">📍 {event.region}</p>
                <p className="text-lg font-bold mb-3">{event.name}</p>
                <div className="flex gap-2 flex-wrap">
                  {event.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-white/20 px-2 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>

          <Link
            href="/events"
            className="inline-flex items-center gap-2 mt-10 lg:mt-12 px-8 py-4 bg-white text-orange-600 rounded-full font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
          >
            すべてのイベントを見る →
          </Link>
        </div>
      </section>

      {/* ===== ITEM LINE UP SECTION ===== */}
      <section className="bg-orange-600 text-white py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 tracking-tight">ITEM LINE UP</h2>
          <p className="text-sm lg:text-base text-orange-100 mb-10 lg:mb-14 max-w-2xl mx-auto">
            ジャンル問わず、様々な魅力的な商品をライブ配信で紹介しています。
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 max-w-4xl mx-auto">
            {[
              { emoji: '👗', label: '女性服' },
              { emoji: '🧥', label: '男性服' },
              { emoji: '💄', label: '化粧品' },
              { emoji: '👜', label: '財布・小物' },
              { emoji: '💎', label: 'ジュエリー' },
              { emoji: '🏋️', label: 'フィットネス' },
              { emoji: '👟', label: 'スニーカー' },
              { emoji: '🍽️', label: '食品' },
              { emoji: '🎧', label: '家電' },
              { emoji: '🎨', label: 'ハンドメイド' },
            ].map((item) => (
              <div key={item.label} className="group cursor-pointer">
                <div className="aspect-square w-20 sm:w-24 mx-auto bg-white rounded-full flex items-center justify-center text-3xl sm:text-4xl mb-3 shadow-lg group-hover:scale-110 transition-transform">
                  {item.emoji}
                </div>
                <p className="text-xs sm:text-sm font-bold">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS SECTION (Yellow) ===== */}
      <section className="relative bg-gradient-to-b from-orange-500 via-orange-400 to-yellow-300 text-white py-16 lg:py-24 overflow-hidden">
        <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-orange-300 rounded-full opacity-50" />
          <div className="absolute bottom-10 left-1/3 w-40 h-40 bg-yellow-300 rounded-full opacity-50" />
          <div className="absolute top-1/3 right-10 w-32 h-32 bg-orange-200 rounded-full opacity-40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <div className="text-center lg:text-left order-2 lg:order-1">
              <p className="text-base lg:text-lg font-bold mb-3">あなたも今日からフリマ出店！</p>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                年間
                <span className="block text-6xl sm:text-7xl lg:text-8xl my-2">10,000</span>
                件以上のイベント開催！
              </h2>
              <p className="text-sm lg:text-base mb-8 leading-relaxed text-white/90">
                あなたも今日からオンラインフリマを始めてみよう！<br />
                出店料たったの<span className="font-black text-white">1,200円〜</span>
              </p>
              <Link
                href="/seller"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 rounded-full font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
              >
                出店してみる →
              </Link>
            </div>

            <div className="flex justify-center order-1 lg:order-2">
              <div className="scale-90 lg:scale-100">
                <PhoneMockup variant="live" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== POINTS SECTION ===== */}
      <section className="bg-yellow-300 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 lg:mb-14">
            <p className="text-sm lg:text-base font-bold text-orange-700 mb-3 tracking-wide">FAQ</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900">よくある質問</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {[
              {
                point: 'POINT.1',
                title: 'オンラインフリマって\n本当に売れるの？',
                emoji: '📦',
                badge: '年間販売数',
                value: '10万点',
                desc: 'ライブ接客だからこそ、商品の魅力が伝わりやすく購入者も安心。チャットで質問できる参加型ショッピング！',
              },
              {
                point: 'POINT.2',
                title: '販売するまでに\nお金はかかるの？',
                emoji: '💰',
                badge: '出店料',
                value: '1,200円',
                desc: '基本料金は1,200円のみ。販売手数料はかかりません。出店成立は3名以上の予約があった場合のみ。',
              },
              {
                point: 'POINT.3',
                title: 'オンラインフリマって\n簡単に始められる？',
                emoji: '✨',
                badge: 'ステップ',
                value: '2STEP',
                desc: '出店者登録 → 商品登録 → イベント開催の3ステップで始められます。商品写真と説明を載せるだけ。',
              },
            ].map((point, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-6 lg:p-7 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all">
                <div className="inline-block px-4 py-1.5 bg-orange-600 text-white text-xs font-black rounded-full mb-4">
                  {point.point}
                </div>
                <h3 className="text-lg lg:text-xl font-black text-gray-900 mb-4 whitespace-pre-line leading-tight">
                  {point.title}
                </h3>

                <div className="bg-orange-50 rounded-2xl p-5 mb-4 text-center">
                  <p className="text-xs text-orange-700 font-bold mb-1">{point.badge}</p>
                  <p className="text-3xl lg:text-4xl font-black text-orange-600 mb-1">{point.value}</p>
                  <span className="text-xl">{point.emoji}</span>
                </div>

                <p className="text-xs lg:text-sm text-gray-700 leading-relaxed">{point.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 lg:mb-14">
            <p className="text-sm lg:text-base font-bold text-orange-500 mb-3 tracking-wide">HOW TO USE</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900">
              <span className="text-orange-600">3STEP</span>で簡単スタート
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-10 relative">
            {[
              { step: '01', title: '会員登録', desc: '無料で会員登録。出店者として登録するか、購入者として参加するか選べます。', icon: '👤' },
              { step: '02', title: 'イベント予約', desc: '気になるイベントを予約。3名以上で開催成立！LINE通知で開催前にお知らせ。', icon: '📅' },
              { step: '03', title: 'チャット接客', desc: '出店者と直接チャットで会話しながらお買い物。LINE風UIで簡単操作。', icon: '💬' },
            ].map((step) => (
              <div key={step.step} className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-5">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-4xl shadow-xl">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-black text-gray-900 shadow-md">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-lg lg:text-xl font-black text-gray-900 mb-3">{step.title}</h3>
                <p className="text-xs lg:text-sm text-gray-600 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="relative py-16 lg:py-24 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white overflow-hidden">
        <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-orange-400 rounded-full opacity-30" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-yellow-300 rounded-full opacity-20" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 leading-tight">
            さあ、はじめよう！<br />
            あなたのフリマライフ
          </h2>
          <p className="text-sm lg:text-base mb-8 lg:mb-10 leading-relaxed text-orange-50">
            会員登録は無料！<br className="sm:hidden" />全国の出店者と購入者をつなぐ、新しいフリマ体験。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 lg:px-10 py-4 bg-white text-orange-600 rounded-full font-black shadow-2xl hover:scale-105 transition-all"
            >
              無料で会員登録 →
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center justify-center gap-2 px-8 lg:px-10 py-4 bg-orange-700/50 backdrop-blur text-white border-2 border-white/30 rounded-full font-bold hover:bg-orange-700 transition-all"
            >
              イベントを見る
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// ===== Phone Mockup Component =====
function PhoneMockup({ variant = 'home' }: { variant?: 'home' | 'live' }) {
  return (
    <div className="relative animate-float">
      {/* Phone frame */}
      <div className="relative w-56 sm:w-64 lg:w-72 h-[450px] sm:h-[520px] lg:h-[580px] bg-gray-900 rounded-[2.5rem] lg:rounded-[3rem] p-2.5 lg:p-3 shadow-2xl">
        <div className="absolute top-2.5 lg:top-3 left-1/2 -translate-x-1/2 w-28 h-5 lg:h-6 bg-gray-900 rounded-b-2xl z-10" />
        <div className="w-full h-full bg-white rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden flex flex-col">
          {variant === 'home' ? <PhoneHomeContent /> : <PhoneLiveContent />}
        </div>
      </div>

      {variant === 'home' && (
        <>
          <div className="absolute -left-4 lg:-left-12 top-10 bg-white rounded-2xl rounded-bl-sm shadow-xl px-3 py-2 max-w-[140px] animate-bounce-soft">
            <p className="text-[10px] font-bold text-orange-600 mb-0.5">nana♡</p>
            <p className="text-[10px] text-gray-700">それ欲しいです！</p>
          </div>
          <div className="absolute -right-2 lg:-right-10 top-28 bg-orange-500 text-white rounded-2xl rounded-br-sm shadow-xl px-3 py-2 max-w-[150px] animate-bounce-soft" style={{ animationDelay: '0.5s' }}>
            <p className="text-[10px] font-bold mb-0.5">moru(^o^)</p>
            <p className="text-[10px]">次のセールいつ〜？</p>
          </div>
          <div className="absolute -left-6 lg:-left-14 bottom-32 bg-white rounded-2xl rounded-bl-sm shadow-xl px-3 py-2 max-w-[140px] animate-bounce-soft" style={{ animationDelay: '1s' }}>
            <p className="text-[10px] font-bold text-orange-600 mb-0.5">parumu</p>
            <p className="text-[10px] text-gray-700">めっちゃ可愛い〜！</p>
          </div>
          <div className="absolute -right-2 lg:-right-4 bottom-24 bg-red-500 text-white rounded-full px-3 py-1.5 shadow-xl font-black text-xs animate-pulse-slow">
            SOLD!
          </div>
          <div className="absolute -left-1 lg:-left-4 bottom-10 bg-red-500 text-white rounded-full px-3 py-1.5 shadow-xl font-black text-xs animate-pulse-slow" style={{ animationDelay: '0.7s' }}>
            SOLD!
          </div>
        </>
      )}
    </div>
  );
}

function PhoneHomeContent() {
  return (
    <>
      <div className="bg-orange-500 px-3 pt-7 pb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-orange-600 font-black text-xs">F</div>
          <p className="text-white font-bold text-xs">フリマライブ</p>
        </div>
        <span className="text-white text-xs">🔔</span>
      </div>
      <div className="flex-1 bg-gradient-to-b from-orange-50 to-white p-2.5 overflow-hidden">
        <div className="bg-white rounded-xl p-2.5 shadow-sm mb-2.5 border border-orange-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-bold text-orange-600">20:00 開催中</span>
            <span className="flex items-center gap-1 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[8px] font-bold">
              <span className="w-1 h-1 bg-white rounded-full animate-pulse" />LIVE
            </span>
          </div>
          <p className="text-xs font-black text-gray-900">mina.craft</p>
          <p className="text-[9px] text-gray-500">滋賀 / ハンドメイド</p>
          <div className="mt-2 aspect-square bg-gradient-to-br from-orange-200 to-orange-300 rounded-lg flex items-center justify-center text-2xl">💎</div>
        </div>
        <div className="bg-white rounded-xl p-2.5 shadow-sm border border-orange-100 mb-2">
          <p className="text-[9px] font-bold text-orange-600 mb-0.5">20:15 開催予定</p>
          <p className="text-xs font-black text-gray-900">kyoto.vintage</p>
          <p className="text-[9px] text-gray-500">京都 / 古着</p>
        </div>
        <div className="bg-white rounded-xl p-2.5 shadow-sm border border-orange-100">
          <p className="text-[9px] font-bold text-orange-600 mb-0.5">20:30 開催予定</p>
          <p className="text-xs font-black text-gray-900">osaka.antique</p>
          <p className="text-[9px] text-gray-500">大阪 / 雑貨</p>
        </div>
      </div>
    </>
  );
}

function PhoneLiveContent() {
  return (
    <>
      <div className="bg-gray-900 text-white px-3 pt-7 pb-2 flex items-center justify-between">
        <p className="text-xs font-bold">mina.craft</p>
        <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500 rounded-full text-[9px] font-bold">
          <span className="w-1 h-1 bg-white rounded-full animate-pulse" />LIVE
        </span>
      </div>
      <div className="aspect-square bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center text-6xl">💎</div>
      <div className="bg-white px-3 py-2 border-b border-gray-100">
        <p className="text-xs font-black text-gray-900">レジン樹脂アクセサリー</p>
        <p className="text-orange-600 font-black text-sm mt-0.5">¥2,800</p>
      </div>
      <div className="flex-1 bg-gray-50 p-2 space-y-1.5 overflow-hidden">
        {[
          { name: 'nana♡', msg: 'これ可愛い！', own: false },
          { name: '出店者', msg: 'ありがとう♡', own: true },
          { name: 'moru', msg: '在庫ある？', own: false },
        ].map((m, i) => (
          <div key={i} className={`flex gap-1.5 ${m.own ? 'justify-end' : ''}`}>
            {!m.own && <div className="w-5 h-5 bg-orange-200 rounded-full flex-shrink-0" />}
            <div className={`px-2 py-1 rounded-lg max-w-[70%] ${m.own ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200'}`}>
              {!m.own && <p className="text-[8px] font-bold text-gray-500">{m.name}</p>}
              <p className="text-[10px]">{m.msg}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white border-t border-gray-200 p-2 flex gap-1">
        <div className="flex-1 bg-gray-100 rounded-full px-2 py-1 text-[9px] text-gray-400">メッセージ...</div>
        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-[10px]">→</div>
      </div>
    </>
  );
}
