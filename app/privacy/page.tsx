import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ArrowLeftIcon } from '../components/Icons';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Back Link */}
      <div className="bg-white border-b border-gray-200 sticky top-16 lg:top-20 z-10">
        <div className="container-main py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 font-medium"
          >
            <ArrowLeftIcon size={16} stroke={2} />
            トップページへ戻る
          </Link>
        </div>
      </div>

      <main className="flex-1">
        <article className="container-main py-12 sm:py-16 max-w-3xl">
          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4">
              プライバシーポリシー
            </h1>
            <p className="text-gray-600">最終更新日: 2024年12月</p>
          </div>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. 個人情報の収集</h2>
              <p>
                本サービスを利用する際、以下の個人情報を収集する場合があります：
              </p>
              <ul className="space-y-2 list-disc list-inside mt-3">
                <li>氏名、メールアドレス、電話番号</li>
                <li>住所等の住所情報</li>
                <li>出店者の場合：銀行口座情報（出店料払い込み用）</li>
                <li>ログイン履歴やアクセス情報</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. 個人情報の利用</h2>
              <p>収集した個人情報は以下の目的で利用します：</p>
              <ul className="space-y-2 list-disc list-inside mt-3">
                <li>サービスの提供・改善</li>
                <li>ユーザーサポート・問い合わせ対応</li>
                <li>出店料の請求・管理</li>
                <li>マーケティング情報の送信（同意した場合）</li>
                <li>不正利用の防止・検出</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. 個人情報の保護</h2>
              <p>
                個人情報は適切に保護され、第三者への無断開示は行いません。ただし、以下の場合は除きます：
              </p>
              <ul className="space-y-2 list-disc list-inside mt-3">
                <li>法令に基づく開示要求</li>
                <li>ユーザーの同意がある場合</li>
                <li>取引に必要な情報の開示（出店者と購入者間のみ）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. チャット内容について</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>チャット内容は必要に応じてログとして保存される場合があります</li>
                <li>不正利用・トラブルの防止目的で監視される場合があります</li>
                <li>個人間の商談内容は当事者間のみの情報となります</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Cookie の使用</h2>
              <p>
                本サービスはCookieを使用してユーザー体験を向上させています。Cookie設定はブラウザで変更できます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. 外部サービスとの連携</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>決済サービス（PayPay等）との連携時に情報を共有する場合があります</li>
                <li>各サービスのプライバシーポリシーも併せてご確認ください</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. 個人情報のアクセス・削除</h2>
              <p>
                ユーザーは自分の個人情報について、以下の権利を有しています：
              </p>
              <ul className="space-y-2 list-disc list-inside mt-3">
                <li>アクセス権：保有情報の確認</li>
                <li>修正権：情報の修正・更新</li>
                <li>削除権：情報の削除要求（ただし取引記録等は保持される場合があります）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. プライバシーポリシーの変更</h2>
              <p>
                本ポリシーは予告なく変更される場合があります。重要な変更の場合はメール等で通知します。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">9. お問い合わせ</h2>
              <p>
                個人情報の取り扱いに関するご質問やご要望は、お問い合わせフォームからお気軽にご連絡ください。
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link
              href="/terms"
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-bold"
            >
              利用規約 <ArrowLeftIcon size={16} stroke={2} className="rotate-180" />
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
