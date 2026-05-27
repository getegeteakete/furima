import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-white dark:from-gray-900 to-gray-50 dark:to-gray-800 text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-2xl">F</span>
              </div>
              <div>
                <p className="text-xl font-black text-orange-600 dark:text-orange-400">フリマライブ</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">Furima LIVE</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-md">
              全国どこからでも！時間限定のオンライン接客型フリマイベント。<br />
              チャットで出店者と会話しながらお買い物を楽しめます。
            </p>
            <div className="flex gap-3 mt-6">
              {['X', 'IG', 'FB', 'LINE'].map((sns) => (
                <a key={sns} href="#" className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 hover:bg-orange-500 text-gray-900 dark:text-white flex items-center justify-center text-xs font-bold transition-all">
                  {sns}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">サービス</h3>
            <ul className="space-y-3">
              <li><Link href="/events" className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">イベント一覧</Link></li>
              <li><Link href="/seller" className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">出店者になる</Link></li>
              <li><Link href="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">使い方</Link></li>
              <li><Link href="/register" className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">無料会員登録</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">サポート</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">よくある質問</a></li>
              <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">お問い合わせ</a></li>
              <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">利用規約</a></li>
              <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">プライバシーポリシー</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500 dark:text-gray-500">© 2026 フリマライブ. All rights reserved.</p>
          <p className="text-xs text-gray-500 dark:text-gray-500">運営: 株式会社フリマライブ</p>
        </div>
      </div>
    </footer>
  );
}
