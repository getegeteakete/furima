'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import { ArrowLeftIcon, StarIcon, CheckIcon, ClockIcon } from '../../components/Icons';
import {
  getTransactionById,
  submitBuyerReview,
  submitSellerReview,
  getRemainingDays,
} from '../../lib/mockStore';
import { useStoreData } from '../../lib/useStore';

export default function TransactionDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const txnId = params.id as string;
  // ?as=seller で出店者視点、デフォルトは購入者視点
  const viewAs = searchParams.get('as') === 'seller' ? 'seller' : 'buyer';

  const getter = useCallback(() => getTransactionById(txnId), [txnId]);
  const [txn] = useStoreData(getter);

  if (!txn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <ClockIcon size={48} stroke={1.5} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">この取引履歴は見つかりませんでした</p>
          <p className="text-xs text-gray-400 mb-6">
            ※ 取引履歴はイベント終了後7日間で自動的に閲覧できなくなります
          </p>
          <Link href="/mypage" className="text-orange-600 font-bold text-sm">
            ← マイページへ戻る
          </Link>
        </div>
      </div>
    );
  }

  const remainingDays = getRemainingDays(txn.expiresAt);
  const partnerName = viewAs === 'buyer' ? txn.sellerName : txn.buyerName;
  const myReview = viewAs === 'buyer' ? txn.buyerReview : txn.sellerReview;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <Link href="/mypage" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 font-medium">
          <ArrowLeftIcon size={16} stroke={2} /> マイページへ戻る
        </Link>

        {/* 取引サマリー */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
              取引完了
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <ClockIcon size={14} stroke={2} />
              あと{remainingDays}日で閲覧期限
            </span>
          </div>
          <h1 className="text-xl font-black text-gray-900">{txn.productName}</h1>
          <p className="text-2xl font-black text-orange-600 mt-1">¥{txn.productPrice.toLocaleString()}</p>
          <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600 space-y-1">
            <p>イベント: {txn.eventTitle}</p>
            <p>{viewAs === 'buyer' ? '出店者' : '購入者'}: {partnerName}</p>
            <p className="text-xs text-gray-400">購入日: {new Date(txn.purchasedAt).toLocaleString('ja-JP')}</p>
          </div>
        </div>

        {/* ② 評価セクション */}
        <ReviewSection
          txnId={txn.id}
          viewAs={viewAs}
          partnerName={partnerName}
          existingReview={myReview}
        />

        {/* ① チャット履歴 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-yellow-50">
            <h2 className="font-black text-gray-900">チャット履歴</h2>
            <p className="text-xs text-gray-500 mt-0.5">取引時のやり取りを確認できます（残り{remainingDays}日）</p>
          </div>
          <div className="p-4 space-y-3 max-h-[50vh] overflow-y-auto bg-orange-50/30">
            {txn.messages.map((msg, i) => {
              // 自分視点で左右を決定
              const isMine = (viewAs === 'buyer' && msg.sender === 'buyer') || (viewAs === 'seller' && msg.sender === 'seller');
              return (
                <div key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[75%]`}>
                    {msg.images && msg.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-1 mb-1">
                        {msg.images.map((img, idx) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={idx} src={img} alt="" className="rounded-lg max-w-[120px] object-cover" />
                        ))}
                      </div>
                    )}
                    {msg.text && (
                      <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                        isMine ? 'bg-orange-500 text-white rounded-br-sm' : 'bg-white text-gray-900 rounded-bl-sm border border-orange-100'
                      }`}>
                        {msg.text}
                      </div>
                    )}
                    <span className="text-[10px] text-gray-400 mt-0.5 px-1">{msg.timestamp}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              ※ 商品代金のお支払いは出店者と購入者で直接お願いします
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ② 評価コンポーネント
function ReviewSection({
  txnId,
  viewAs,
  partnerName,
  existingReview,
}: {
  txnId: string;
  viewAs: 'buyer' | 'seller';
  partnerName: string;
  existingReview?: { rating: number; comment: string; createdAt: string };
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) {
      alert('星評価を選択してください');
      return;
    }
    const review = { rating, comment, createdAt: new Date().toISOString() };
    if (viewAs === 'buyer') {
      submitBuyerReview(txnId, review);
    } else {
      submitSellerReview(txnId, review);
    }
    setSubmitted(true);
  };

  // 既に評価済み
  if (existingReview || submitted) {
    const r = existingReview || { rating, comment };
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <CheckIcon size={20} stroke={2.5} className="text-green-500" />
          <h2 className="font-black text-gray-900">評価を送信しました</h2>
        </div>
        <div className="flex gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <StarIcon key={n} size={24} stroke={1.5} className={n <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
          ))}
        </div>
        {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border-2 border-orange-200">
      <h2 className="font-black text-gray-900 mb-1">
        {partnerName} さんを評価
      </h2>
      <p className="text-xs text-gray-500 mb-4">
        取引はいかがでしたか？{viewAs === 'buyer' ? '出店者' : '購入者'}への評価をお願いします
      </p>

      {/* 星評価 */}
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform active:scale-90"
          >
            <StarIcon
              size={36}
              stroke={1.5}
              className={n <= (hover || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="感想やメッセージを入力（任意）"
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none mb-3"
      />

      <button
        onClick={handleSubmit}
        className="w-full py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all active:scale-[0.99]"
      >
        評価を送信する
      </button>
    </div>
  );
}
