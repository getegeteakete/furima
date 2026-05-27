import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { LineIcon, GoogleIcon, ArrowRightIcon, LoginIcon } from '../components/Icons';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50 flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 sm:py-16 lg:py-20">
        <div className="w-full max-w-md mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 px-8 py-8 sm:py-10 text-white text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur rounded-2xl mb-4">
                <LoginIcon size={32} stroke={1.5} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black mb-2">おかえりなさい</h1>
              <p className="text-sm text-orange-100">フリマライブにログイン</p>
            </div>

            <div className="px-6 py-7 sm:py-8 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  メールアドレス
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-sm focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-gray-700">
                    パスワード
                  </label>
                  <Link href="#" className="text-xs text-orange-600 font-bold hover:underline">
                    忘れた方
                  </Link>
                </div>
                <input
                  type="password"
                  placeholder="パスワードを入力"
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-sm focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input type="checkbox" id="remember" className="w-4 h-4 accent-orange-500" />
                <label htmlFor="remember" className="text-xs text-gray-600">
                  ログイン状態を保持する
                </label>
              </div>

              <button className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-black text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95">
                ログイン <ArrowRightIcon size={18} stroke={2.5} />
              </button>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">または</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="space-y-3">
                <button className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#06C755] text-white rounded-full font-bold text-sm hover:opacity-90 transition-all">
                  <LineIcon size={20} stroke={1.5} />
                  LINEでログイン
                </button>
                <button className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-gray-200 text-gray-700 rounded-full font-bold text-sm hover:border-gray-300 transition-all">
                  <GoogleIcon size={20} stroke={1.5} />
                  Googleでログイン
                </button>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-5 text-center">
              <p className="text-sm text-gray-600">
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
