'use client';

import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageHero from '../components/PageHero';
import { ArrowRightIcon, StarIcon, ClockIcon, ReceiptIcon } from '../components/Icons';
import { getBuyerTransactions, getRemainingDays, uploadAvatar, updateProfileAvatar } from '../lib/supabaseStore';
import { useStoreData } from '../lib/useStore';
import { useCallback, useState, useRef } from 'react';
import { useAuth } from '../components/AuthProvider';

export default function MyPage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const buyerId = user?.id ?? '__none__';
  const getter = useCallback(() => getBuyerTransactions(buyerId), [buyerId]);
  const [transactions] = useStoreData(getter);

  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const onPickAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = reject;
        r.readAsDataURL(file);
      });
      const url = await uploadAvatar(dataUrl, profile.id);
      if (url) {
        await updateProfileAvatar(profile.id, url);
        await refreshProfile();
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  // 未ログイン時はログイン誘導
  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-lg font-black text-gray-900 mb-2">ログインが必要です</p>
          <p className="text-sm text-gray-500 mb-6">マイページの閲覧にはログインしてください</p>
          <Link href="/login" className="px-6 py-3 bg-orange-600 text-white rounded-full font-bold text-sm hover:bg-orange-700 transition-colors">
            ログインする
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <PageHero badge="MyPage" title="マイページ" subtitle="ご利用いただきありがとうございます" />
      <main className="flex-1 container-main py-10 sm:py-16">
        <div className="max-w-2xl">
          {/* プロフィール */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-gray-200">
            <h2 className="text-2xl font-black text-gray-900 mb-6">プロフィール</h2>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-black flex-shrink-0">
                {profile?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatarUrl} alt="プロフィール画像" className="w-full h-full object-cover" />
                ) : (
                  profile?.name?.charAt(0)?.toUpperCase() ?? 'U'
                )}
              </div>
              <div>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-sm font-bold hover:bg-orange-100 transition-colors disabled:opacity-50"
                >
                  {uploading ? 'アップロード中…' : '画像を変更'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" onChange={onPickAvatar} className="hidden" />
                <p className="text-[11px] text-gray-400 mt-1.5">JPG / PNG・正方形がおすすめ</p>
              </div>
            </div>
            <div className="space-y-4 text-gray-700">
              <div>
                <p className="text-sm text-gray-600 font-bold mb-1">ユーザー名</p>
                <p className="text-lg font-bold">{profile?.name ?? '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-bold mb-1">メールアドレス</p>
                <p className="text-lg font-bold">{profile?.email ?? user?.email ?? '—'}</p>
              </div>
              {profile?.role && (
                <div>
                  <p className="text-sm text-gray-600 font-bold mb-1">アカウント種別</p>
                  <p className="text-lg font-bold">
                    {profile.role === 'seller' ? '出店者'
                      : profile.role === 'admin' ? '運営管理者'
                      : profile.role === 'event_manager' ? 'イベント管理者'
                      : '購入者'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 統計 */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-6 sm:mt-8">
            {[
              { label: '予約中', value: '2件' },
              { label: '購入済み', value: `${transactions.length}件` },
              { label: 'フォロー中', value: '3人' },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-2xl p-4 sm:p-6 border-2 border-gray-200 text-center">
                <p className="text-gray-600 font-bold mb-2 text-xs sm:text-base">{item.label}</p>
                <p className="text-2xl sm:text-3xl font-black text-orange-600">{item.value}</p>
              </div>
            ))}
          </div>

          {/* 取引履歴 */}
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <ReceiptIcon size={22} stroke={2} className="text-orange-600" />
              <h2 className="text-xl font-black text-gray-900">取引履歴</h2>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              ※ チャットのやり取りはイベント終了後7日間まで確認できます
            </p>

            {transactions.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 border-2 border-gray-200 text-center">
                <ReceiptIcon size={40} stroke={1.5} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">まだ取引履歴がありません</p>
                <Link href="/events" className="text-orange-600 font-bold text-sm mt-3 inline-block">
                  イベントを探す →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((txn) => {
                  const days = getRemainingDays(txn.expiresAt);
                  return (
                    <Link
                      key={txn.id}
                      href={`/transaction/${txn.id}`}
                      className="block bg-white rounded-2xl p-4 sm:p-5 border-2 border-gray-200 hover:border-orange-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">
                              取引完了
                            </span>
                            {txn.buyerReview ? (
                              <span className="flex items-center gap-0.5 text-yellow-500 text-xs font-bold">
                                <StarIcon size={12} stroke={2} className="fill-yellow-400" /> 評価済み
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-[10px] font-bold">
                                評価待ち
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-gray-900 truncate">{txn.productName}</p>
                          <p className="text-xs text-gray-500">{txn.sellerName} ・ ¥{txn.productPrice.toLocaleString()}</p>
                          <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                            <ClockIcon size={11} stroke={2} /> あと{days}日で閲覧期限
                          </p>
                        </div>
                        <ArrowRightIcon size={18} stroke={2} className="text-gray-400 flex-shrink-0" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
