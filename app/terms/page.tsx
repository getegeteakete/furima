import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ArrowLeftIcon } from '../components/Icons';

export default function TermsPage() {
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
              利用規約
            </h1>
            <p className="text-gray-600">最終更新日: 2024年12月</p>
          </div>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. サービスについて</h2>
              <p>
                フリマライブは、個人出店者と購入者がオンライン上でリアルタイムにチャット接客を行うフリマイベントプラットフォームです。本サービスの利用に際しては、以下の規約に同意するものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. ユーザーの責任</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>ユーザーは、本サービスの利用に関する全責任を負うものとします</li>
                <li>登録情報は正確かつ最新の情報を提供してください</li>
                <li>ログイン情報の管理は自己責任で行ってください</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. 商品売買について</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>商品の売買は、出店者と購入者の直接取引です</li>
                <li>運営側は商品の品質やトラブルに関与しません</li>
                <li>返品・返金についても双方で協議して解決してください</li>
                <li>禁止商品（医薬品、偽造品、盗難品など）の売買は厳禁です</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. 禁止事項</h2>
              <p className="mb-3">以下の行為は禁止されています：</p>
              <ul className="space-y-2 list-disc list-inside">
                <li>違法な商品の売買</li>
                <li>著作権、商標権の侵害</li>
                <li>詐欺的な行為</li>
                <li>他ユーザーへの嫌がらせや暴言</li>
                <li>本サービスの不正利用</li>
                <li>個人情報の不適切な利用</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. 利用料金</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>出店者は1回の出店につき1,200円の出店料が必要です</li>
                <li>出店料の支払い方法：銀行振込、PayPay</li>
                <li>開催成立条件：3名以上の予約または3アカウント以上のチャット</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. 個人情報の保護</h2>
              <p>
                個人情報の取り扱いについては、別途プライバシーポリシーをご確認ください。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. 免責事項</h2>
              <p>
                本サービスは「現状のまま」提供されており、運営側は以下について責任を負いません：
              </p>
              <ul className="space-y-2 list-disc list-inside">
                <li>商品品質に関するトラブル</li>
                <li>取引トラブルや紛争</li>
                <li>サービス提供の中断や停止</li>
                <li>ユーザー間のトラブル</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. 規約の変更</h2>
              <p>
                運営側は予告なく本規約を変更することができます。変更後のサービス利用をもって、新規約に同意したものとみなします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">9. お問い合わせ</h2>
              <p>
                本規約に関するご質問は、お問い合わせフォームからお気軽にご連絡ください。
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link
              href="/privacy"
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-bold"
            >
              プライバシーポリシー <ArrowLeftIcon size={16} stroke={2} className="rotate-180" />
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
