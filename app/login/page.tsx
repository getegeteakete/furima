'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { LineIcon, GoogleIcon, ArrowRightIcon, LoginIcon } from '../components/Icons';
import { useAuth } from '../components/AuthProvider';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }
    setLoading(true);
    const res = await signIn(email, password);
    setLoading(false);
    if (res.ok) {
      router.push('/mypage');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50 flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 sm:py-16 lg:py-20">
        <div className="w-full max-w-md mx-auto px-4 sm:px-6">
          <div className="bg-white dark:bg-gray-950 rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 px-8 py-8 sm:py-10 text-white text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white dark:bg-gray-950/20 backdrop-blur rounded-2xl mb-4">
                <LoginIcon size={32} stroke={1.5} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black mb-2">おかえりなさい</h1>
              <p className="text-sm text-orange-100">フリマライブにログイン</p>
            </div>

            <div className="px-6 py-7 sm:py-8 space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    パスワード
                  </label>
                  <Link href="#" className="text-xs text-orange-600 font-bold hover:underline">
                    忘れた方
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    placeholder="パスワードを入力"
                    className="w-full px-4 py-3.5 pr-12 border-2 border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:border-orange-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOffSvg /> : <EyeSvg />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-black text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'ログイン中...' : <>ログイン <ArrowRightIcon size={18} stroke={2.5} /></>}
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
                <button className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-gray-950 border-2 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-full font-bold text-sm hover:border-gray-300 transition-all">
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

// パスワード表示/非表示アイコン
function EyeSvg() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffSvg() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
