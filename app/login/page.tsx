import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Header />

      <section className="py-12 lg:py-20">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-black text-gray-900 mb-3">おかえりなさい！</h1>
            <p className="text-sm text-gray-600">フリマライブにログイン</p>
          </div>

          <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl border border-orange-100">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">メールアドレス</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-orange-50 border border-orange-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-gray-700">パスワード</label>
                  <Link href="#" className="text-xs text-orange-600 font-bold">忘れた方</Link>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-orange-50 border border-orange-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <button className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-black shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
                ログイン
              </button>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">または</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <button className="w-full py-3 bg-green-500 text-white rounded-full font-bold text-sm shadow-md hover:bg-green-600 transition-colors">
                LINEでログイン
              </button>
              <button className="w-full py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-full font-bold text-sm hover:bg-gray-50 transition-colors">
                Googleでログイン
              </button>

              <p className="text-center text-sm text-gray-600 pt-4 border-t border-gray-100">
                アカウントをお持ちでないですか？
                <Link href="/register" className="text-orange-600 font-bold ml-1">無料登録</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
