import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50 flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center py-8 sm:py-12 lg:py-16">
        <div className="w-full max-w-md mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 px-6 py-6 sm:py-8 text-white text-center">
              <div className="text-4xl sm:text-5xl mb-3">👋</div>
              <h1 className="text-xl sm:text-2xl font-black mb-1">おかえりなさい</h1>
              <p className="text-xs sm:text-sm text-orange-100">フリマライブにログイン</p>
            </div>

            <div className="px-5 sm:px-6 py-6 sm:py-8 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  メールアドレス
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700">
                    パスワード
                  </label>
                  <Link href="#" className="text-[10px] sm:text-xs text-orange-600 font-bold hover:underline">
                    忘れた方
                  </Link>
                </div>
                <input
                  type="password"
                  placeholder="パスワードを入力"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input type="checkbox" id="remember" className="w-4 h-4 accent-orange-500" />
                <label htmlFor="remember" className="text-xs text-gray-600">
                  ログイン状態を保持する
                </label>
              </div>

              <button className="w-full px-6 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-black text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95">
                ログイン →
              </button>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[10px] text-gray-400">または</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="space-y-2">
                <button className="w-full px-6 py-3 bg-[#06C755] text-white rounded-full font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2">
                  <span>📱</span> LINEでログイン
                </button>
                <button className="w-full px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-full font-bold text-sm hover:border-gray-300 transition-all flex items-center justify-center gap-2">
                  <span>🌐</span> Googleでログイン
                </button>
              </div>
            </div>

            <div className="bg-gray-50 px-5 sm:px-6 py-4 text-center">
              <p className="text-xs sm:text-sm text-gray-600">
                会員未登録の方は <Link href="/register" className="text-orange-600 font-black hover:underline">無料登録</Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
