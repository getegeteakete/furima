'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  ProductIcon,
  ChartIcon,
  PackageIcon,
  CalendarIcon,
  CoinIcon,
  StarIcon,
  PlusIcon,
  TrendingUpIcon,
  BoltIcon,
  MapPinIcon,
  ArrowRightIcon,
  ReceiptIcon,
  ClockIcon,
  BellIcon,
  SendIcon,
} from '../components/Icons';
import type { ProductIconType } from '../components/Icons';
import {
  getSellerTransactions,
  getRemainingDays,
  getSellerProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  setProductSoldOut,
  uploadProductImage,
  getAdminEvents,
  submitSellerFee,
  SELLER_FEE_YEN,
} from '../lib/supabaseStore';
import { PROFILE_TO_SHOP, type Product } from '../lib/events';
import { useStoreData } from '../lib/useStore';
import { useAuth } from '../components/AuthProvider';
import ProductThumb from '../components/ProductThumb';

type Tab = 'overview' | 'products' | 'events' | 'transactions' | 'analytics';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: '概要' },
  { id: 'products', label: '商品管理' },
  { id: 'events', label: 'イベント管理' },
  { id: 'transactions', label: '取引履歴' },
  { id: 'analytics', label: '売上分析' },
];

export default function SellerPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  // 担当ショップ: profiles.shop_id（本番）→ デモ対応表 → 既定の順に解決
  const { profile } = useAuth();
  const shopId = profile?.shopId ?? PROFILE_TO_SHOP[profile?.id ?? ''] ?? 'mina-craft';
  const profileId = profile?.id ?? '';

  // 実データ: 取引（売上集計用）と、自分が承認済みのイベント
  const txGetter = useCallback(() => getSellerTransactions(shopId), [shopId]);
  const [sellerTx] = useStoreData(txGetter);
  const myEventsGetter = useCallback(
    () =>
      getAdminEvents().filter((e) =>
        e.sellerApplications.some((a) => a.sellerId === profileId && a.status === 'approved'),
      ),
    [profileId],
  );
  const [myEvents] = useStoreData(myEventsGetter);

  // 売上・販売点数・評価・開催回数・月別推移を取引から集計
  const metrics = useMemo(() => {
    const now = new Date();
    const ym = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;
    const thisYM = ym(now);
    const prevYM = ym(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    let revThis = 0;
    let revPrev = 0;
    let cntThis = 0;
    let cntPrev = 0;
    for (const t of sellerTx) {
      const k = ym(new Date(t.purchasedAt));
      if (k === thisYM) {
        revThis += t.productPrice;
        cntThis += 1;
      } else if (k === prevYM) {
        revPrev += t.productPrice;
        cntPrev += 1;
      }
    }
    const ratings = sellerTx
      .map((t) => t.buyerReview?.rating)
      .filter((r): r is number => typeof r === 'number');
    const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    const heldEvents = myEvents.filter((e) => e.status === 'ended').length;
    const revChange = revPrev > 0 ? Math.round(((revThis - revPrev) / revPrev) * 100) : null;
    const cntChange = cntThis - cntPrev;
    const series: { label: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const k = ym(d);
      const v = sellerTx
        .filter((t) => ym(new Date(t.purchasedAt)) === k)
        .reduce((a, t) => a + t.productPrice, 0);
      series.push({ label: `${d.getMonth() + 1}月`, value: v });
    }
    return { revThis, cntThis, avg, ratingsCount: ratings.length, heldEvents, revChange, cntChange, series };
  }, [sellerTx, myEvents]);

  // 予定中/開催中のイベント（自分が承認済みのもの）
  const upcomingEvents = myEvents
    .filter((e) => e.status === 'recruiting' || e.status === 'seller_closed' || e.status === 'live')
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Seller Header */}
      <section className="bg-white border-b border-gray-200 dark:border-gray-800">
        <div className="container-main py-8 sm:py-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0">
              <ProductIcon type="diamond" size={36} stroke={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-orange-600 mb-1">
                <MapPinIcon size={14} stroke={2} />
                <p className="text-xs font-bold">滋賀</p>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 truncate mb-1">
                mina.craft
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">出店者ダッシュボード</p>
            </div>
            <button className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-full text-sm font-bold hover:bg-orange-600 transition-all">
              <PlusIcon size={16} stroke={2.5} />
              新規イベント
            </button>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-white border-b border-gray-200 dark:border-gray-800 sticky top-16 lg:top-20 z-10">
        <div className="container-main">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-5 py-4 text-sm font-bold border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="flex-1">
        <div className="container-main py-10 sm:py-12">

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8 lg:space-y-10">
              {/* ライブ接客コンソールへの導線 */}
              <Link
                href={`/event/evt-001/seller/${shopId}/console`}
                className="block bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-6 sm:p-7 text-white hover:shadow-lg transition-all active:scale-[0.99]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-block w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                      <span className="text-xs font-bold opacity-90">開催中イベント</span>
                    </div>
                    <p className="text-lg sm:text-xl font-black leading-tight">ライブ接客を開始する</p>
                    <p className="text-sm opacity-90 mt-1">
                      全体チャット・個別接客をリアルタイムで対応できます
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <SendIcon size={24} stroke={2} />
                  </div>
                </div>
              </Link>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {[
                  {
                    label: '今月の売上',
                    value: `¥${metrics.revThis.toLocaleString()}`,
                    change: metrics.revChange === null ? '—' : `${metrics.revChange >= 0 ? '+' : ''}${metrics.revChange}%`,
                    Icon: CoinIcon,
                  },
                  {
                    label: '今月の販売点数',
                    value: `${metrics.cntThis}点`,
                    change: metrics.cntChange === 0 ? '±0点' : `${metrics.cntChange > 0 ? '+' : ''}${metrics.cntChange}点`,
                    Icon: PackageIcon,
                  },
                  {
                    label: '開催回数',
                    value: `${metrics.heldEvents}回`,
                    change: '累計',
                    Icon: CalendarIcon,
                  },
                  {
                    label: '評価',
                    value: metrics.ratingsCount ? metrics.avg.toFixed(1) : '—',
                    change: `${metrics.ratingsCount}件`,
                    Icon: StarIcon,
                  },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                        <stat.Icon size={20} stroke={1.5} />
                      </div>
                      <span className="text-xs font-black text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1.5">{stat.label}</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Upcoming Events */}
              <div className="bg-white rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-black text-gray-900">予定中のイベント</h2>
                  <Link href="#" className="text-xs text-orange-600 font-bold hover:underline">
                    すべて見る
                  </Link>
                </div>
                <div className="divide-y divide-gray-100">
                  {upcomingEvents.length === 0 && (
                    <p className="px-6 py-8 text-center text-sm text-gray-400">
                      参加予定のイベントはありません。
                    </p>
                  )}
                  {upcomingEvents.map((event) => {
                    const reserved = event.buyerReservations.length;
                    const max = event.maxBuyers || 1;
                    return (
                    <Link
                      key={event.id}
                      href={`/event/${event.id}/seller/${shopId}/console`}
                      className="px-6 py-5 flex items-center gap-4 hover:bg-orange-50 transition-colors"
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        event.status === 'live' ? 'bg-red-100 text-red-600' : 'bg-orange-100 dark:bg-gray-800 text-orange-600'
                      }`}>
                        {event.status === 'live' ? <BoltIcon size={22} stroke={1.5} /> : <CalendarIcon size={22} stroke={1.5} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-gray-900">{event.date} {event.startTime}-{event.endTime}</p>
                        <p className="text-xs text-gray-500">
                          {event.region}・予約 {reserved}/{event.maxBuyers}名
                          {event.status === 'live' && <span className="ml-1 text-red-500 font-bold">LIVE</span>}
                        </p>
                      </div>
                      <div className="w-24 hidden sm:block">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-400 to-orange-600"
                            style={{ width: `${Math.min(100, (reserved / max) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <ArrowRightIcon size={16} stroke={2} className="text-orange-600" />
                    </Link>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {[
                  { label: '新規商品登録', Icon: PlusIcon },
                  { label: 'イベント作成', Icon: CalendarIcon },
                  { label: '在庫確認', Icon: PackageIcon },
                  { label: '売上レポート', Icon: TrendingUpIcon },
                ].map((action) => (
                  <button
                    key={action.label}
                    className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-800 hover:border-orange-300 hover:shadow-md transition-all text-left"
                  >
                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-3 text-orange-600">
                      <action.Icon size={22} stroke={1.5} />
                    </div>
                    <p className="text-sm font-black text-gray-900">{action.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && <ProductManager shopId={shopId} />}

          {/* Events Tab */}
          {activeTab === 'events' && <SellerFeePanel profileId={profile?.id ?? ''} />}

          {/* Transactions Tab - 取引履歴 */}
          {activeTab === 'transactions' && <SellerTransactions shopId={shopId} />}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="bg-white rounded-3xl border border-gray-200 dark:border-gray-800 p-7 sm:p-8 lg:p-10">
              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                  <ChartIcon size={20} stroke={1.5} />
                </div>
                <h2 className="text-lg font-black text-gray-900">月別売上推移（直近6ヶ月）</h2>
              </div>
              {(() => {
                const maxVal = Math.max(1, ...metrics.series.map((s) => s.value));
                const total = metrics.series.reduce((a, s) => a + s.value, 0);
                if (total === 0) {
                  return (
                    <p className="text-center text-sm text-gray-400 py-12">
                      まだ売上データがありません。取引が確定すると、ここに月別の売上が表示されます。
                    </p>
                  );
                }
                return (
                  <div className="flex items-end gap-2 sm:gap-3 h-48 sm:h-56">
                    {metrics.series.map((s) => (
                      <div key={s.label} className="flex-1 flex flex-col items-center gap-2">
                        <span className="text-[10px] text-gray-500 font-bold">
                          {s.value > 0 ? `¥${(s.value / 1000).toFixed(0)}k` : ''}
                        </span>
                        <div
                          className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg transition-all hover:opacity-80 min-h-[4px]"
                          style={{ height: `${(s.value / maxVal) * 100}%` }}
                          title={`¥${s.value.toLocaleString()}`}
                        />
                        <span className="text-xs text-gray-500">{s.label}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

// 取引履歴（出店者視点）
function SellerTransactions({ shopId }: { shopId: string }) {
  const getter = useCallback(() => getSellerTransactions(shopId), [shopId]);
  const [transactions] = useStoreData(getter);

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
          <ReceiptIcon size={20} stroke={1.5} />
        </div>
        <h2 className="text-lg font-black text-gray-900">取引履歴</h2>
      </div>
      <p className="text-xs text-gray-500 mb-6">
        ※ チャットのやり取りはイベント終了後7日間まで確認できます
      </p>

      {transactions.length === 0 ? (
        <div className="py-12 text-center">
          <ReceiptIcon size={40} stroke={1.5} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">まだ取引履歴がありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((txn) => {
            const days = getRemainingDays(txn.expiresAt);
            return (
              <Link
                key={txn.id}
                href={`/transaction/${txn.id}?as=seller`}
                className="block bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">
                        取引完了
                      </span>
                      {txn.sellerReview ? (
                        <span className="flex items-center gap-0.5 text-yellow-500 text-xs font-bold">
                          <StarIcon size={12} stroke={2} className="fill-yellow-400" /> 評価済み
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-[10px] font-bold">
                          購入者を評価する
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-gray-900 truncate">{txn.productName}</p>
                    <p className="text-xs text-gray-500">購入者: {txn.buyerName} ・ ¥{txn.productPrice.toLocaleString()}</p>
                    {txn.chatOpen ? (
                      <p className="text-[10px] text-green-600 font-medium flex items-center gap-1 mt-1">
                        <SendIcon size={11} stroke={2} /> 購入者と連絡継続中
                      </p>
                    ) : (
                      <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                        <ClockIcon size={11} stroke={2} /> あと{days}日で閲覧期限
                      </p>
                    )}
                  </div>
                  <ArrowRightIcon size={18} stroke={2} className="text-gray-400 flex-shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// =============================================================
// 商品管理（出店者）— products テーブルにCRUD
// -------------------------------------------------------------
// 元仕様(出店者機能): 商品登録 / 商品説明 / 在庫管理 / SOLD OUT表示。
// DB優先（getSellerProducts）で表示し、追加/編集/削除/SOLD切替を永続化。
// =============================================================
const ICON_OPTIONS: ProductIconType[] = [
  'diamond', 'jewelry', 'ring', 'necklace', 'shirt', 'bag', 'wallet',
  'shoe', 'food', 'electronics', 'handmade', 'sparkles', 'package', 'store',
];

type ProductForm = {
  name: string;
  price: string;
  icon: ProductIconType;
  description: string;
  stock: string; // 空=在庫管理しない
  imageUrl: string; // 空=画像なし(アイコン表示)
};

const EMPTY_FORM: ProductForm = { name: '', price: '', icon: 'package', description: '', stock: '', imageUrl: '' };

function ProductManager({ shopId }: { shopId: string }) {
  const getter = useCallback(() => getSellerProducts(shopId), [shopId]);
  const [products] = useStoreData(getter);
  // editing: null=フォーム閉, 'new'=新規, number=該当product_noを編集
  const [editing, setEditing] = useState<'new' | number | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleImageFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return setError('画像ファイルを選択してください');
    setError('');
    setUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('読み込み失敗'));
        reader.readAsDataURL(file);
      });
      const url = await uploadProductImage(dataUrl, shopId);
      if (url) {
        setForm((f) => ({ ...f, imageUrl: url }));
      } else {
        setError('画像のアップロードに失敗しました（product-images バケット未作成の可能性）');
      }
    } catch {
      setError('画像の処理に失敗しました');
    } finally {
      setUploading(false);
    }
  };

  const openNew = () => {
    setForm(EMPTY_FORM);
    setError('');
    setEditing('new');
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name,
      price: String(p.price),
      icon: p.icon,
      description: p.description ?? '',
      stock: p.stock == null ? '' : String(p.stock),
      imageUrl: p.imageUrl ?? '',
    });
    setError('');
    setEditing(p.id);
  };

  const closeForm = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
  };

  const save = () => {
    const name = form.name.trim();
    const price = Number(form.price);
    if (!name) return setError('商品名を入力してください');
    if (!Number.isFinite(price) || price < 0) return setError('価格は0以上の数値で入力してください');
    const stock = form.stock.trim() === '' ? null : Number(form.stock);
    if (stock != null && (!Number.isInteger(stock) || stock < 0)) {
      return setError('在庫は0以上の整数、または空欄（管理しない）にしてください');
    }
    if (editing === 'new') {
      createProduct(shopId, {
        name,
        price,
        icon: form.icon,
        description: form.description.trim(),
        stock,
        imageUrl: form.imageUrl || undefined,
      });
    } else if (typeof editing === 'number') {
      updateProduct(shopId, editing, {
        name,
        price,
        icon: form.icon,
        description: form.description.trim(),
        stock,
        imageUrl: form.imageUrl, // '' なら画像クリア
      });
    }
    closeForm();
  };

  const remove = (p: Product) => {
    if (typeof window !== 'undefined' && !window.confirm(`「${p.name}」を削除しますか？`)) return;
    deleteProduct(shopId, p.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-black text-gray-900">商品一覧 ({products.length}点)</h2>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-full text-sm font-bold hover:bg-orange-600 transition-all"
        >
          <PlusIcon size={16} stroke={2.5} />
          新規追加
        </button>
      </div>

      {/* 追加/編集フォーム */}
      {editing !== null && (
        <div className="bg-white rounded-2xl border border-orange-200 p-5 sm:p-6 shadow-sm space-y-4">
          <p className="text-sm font-black text-gray-900">
            {editing === 'new' ? '新しい商品を追加' : '商品を編集'}
          </p>
          {error && <p className="text-xs font-bold text-red-600">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-bold text-gray-600">商品名</span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-400"
                placeholder="例: レジン樹脂ピアス"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-gray-600">価格 (円)</span>
              <input
                type="number"
                inputMode="numeric"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-400"
                placeholder="2800"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-gray-600">在庫数（空欄=管理しない）</span>
              <input
                type="number"
                inputMode="numeric"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-400"
                placeholder="（空欄可）"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-gray-600">アイコン</span>
              <select
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value as ProductIconType })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-orange-400"
              >
                {ICON_OPTIONS.map((ic) => (
                  <option key={ic} value={ic}>{ic}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-bold text-gray-600">商品説明</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-400"
              placeholder="透明感が美しいレジンの一点物"
            />
          </label>
          <div>
            <span className="text-xs font-bold text-gray-600">商品画像（任意・未設定ならアイコン表示）</span>
            <div className="mt-2 flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-600 flex-shrink-0">
                <ProductThumb product={{ icon: form.icon, imageUrl: form.imageUrl || undefined, name: form.name }} iconSize={32} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-xs font-bold hover:bg-gray-200 transition-all cursor-pointer w-fit">
                  {uploading ? 'アップロード中…' : '画像を選択'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => handleImageFile(e.target.files?.[0])}
                  />
                </label>
                {form.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))}
                    className="text-xs font-bold text-red-600 hover:underline w-fit"
                  >
                    画像を削除
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={save}
              disabled={uploading}
              className="px-5 py-2.5 bg-orange-500 text-white rounded-full text-sm font-bold hover:bg-orange-600 transition-all disabled:opacity-50"
            >
              保存
            </button>
            <button
              onClick={closeForm}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-full text-sm font-bold hover:bg-gray-200 transition-all"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* 商品グリッド */}
      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-sm text-gray-500">
          商品がまだありません。「新規追加」から登録してください。
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-all">
              <div className="relative aspect-square bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-700 overflow-hidden">
                <ProductThumb product={product} iconSize={56} />
                {product.soldOut && (
                  <span className="absolute top-2 left-2 px-2 py-1 bg-gray-900/80 text-white text-xs font-black rounded">
                    SOLD OUT
                  </span>
                )}
              </div>
              <div className="p-5">
                <p className="text-sm font-black text-gray-900 mb-1 truncate">{product.name}</p>
                <p className="text-xl font-black text-orange-600 mb-2">¥{product.price.toLocaleString()}</p>
                {product.description && (
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                )}
                <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-100 mb-3">
                  <span className="text-gray-500">
                    在庫: <span className="font-bold text-gray-900">{product.stock == null ? '管理なし' : product.stock}</span>
                  </span>
                  <span className={`font-bold ${product.soldOut ? 'text-gray-400' : 'text-green-600'}`}>
                    {product.soldOut ? '販売停止中' : '販売中'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(product)}
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition-all"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => setProductSoldOut(shopId, product.id, !product.soldOut)}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                      product.soldOut
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                    }`}
                  >
                    {product.soldOut ? '再販する' : 'SOLD OUT'}
                  </button>
                  <button
                    onClick={() => remove(product)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-all"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 出店料の支払い（申告）パネル — 自分が申請したイベントごとに表示
// 元仕様: 出店料1,200円（銀行振込/PayPay）を運営へ。申告→運営の入金確認で確定。
function SellerFeePanel({ profileId }: { profileId: string }) {
  const getter = useCallback(
    () => getAdminEvents().filter((e) => e.sellerApplications.some((a) => a.sellerId === profileId)),
    [profileId],
  );
  const [events] = useStoreData(getter);
  const [method, setMethod] = useState<Record<string, 'bank' | 'paypay'>>({});

  if (!profileId) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 dark:border-gray-800 p-8 text-center text-sm text-gray-500">
        ログインすると、申請したイベントの出店料を申告できます。
      </div>
    );
  }
  if (events.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 dark:border-gray-800 p-8 text-center text-sm text-gray-500">
        まだ申請したイベントがありません。イベントに参加申請すると、ここで出店料を申告できます。
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-sm text-gray-700">
        出店料は <span className="font-black text-orange-600">¥{SELLER_FEE_YEN.toLocaleString()}</span>（銀行振込 / PayPay）。
        お支払い後に「支払いを申告」すると、運営の入金確認で出店が確定します。
      </div>
      {events.map((e) => {
        const app = e.sellerApplications.find((a) => a.sellerId === profileId);
        if (!app) return null;
        const fee = app.feeStatus ?? 'unpaid';
        const m = method[e.id] ?? app.feeMethod ?? 'bank';
        return (
          <div key={e.id} className="bg-white rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="font-black text-gray-900">{e.title}</p>
              <span className="text-xs font-bold text-gray-500">{e.date} {e.startTime}〜</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              申請状態: {app.status === 'approved' ? '承認済み' : app.status === 'rejected' ? '却下' : '承認待ち'}
            </p>
            {fee === 'paid' ? (
              <div className="flex items-center gap-2 text-sm font-black text-green-600">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-600 text-white text-[11px]">✓</span>
                入金確認済み（出店確定）
              </div>
            ) : fee === 'submitted' ? (
              <div className="bg-yellow-50 rounded-xl p-3">
                <p className="text-sm text-yellow-700 font-bold">
                  支払い申告済み（{app.feeMethod === 'paypay' ? 'PayPay' : '銀行振込'}）— 運営の入金確認待ち
                </p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex gap-2">
                  {(['bank', 'paypay'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setMethod((prev) => ({ ...prev, [e.id]: opt }))}
                      className={`px-3 py-2 rounded-full text-xs font-bold border transition-all ${
                        m === opt ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-300'
                      }`}
                    >
                      {opt === 'bank' ? '銀行振込' : 'PayPay'}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => submitSellerFee(e.id, profileId, m)}
                  className="px-5 py-2.5 bg-orange-500 text-white rounded-full text-sm font-black hover:bg-orange-600 transition-all active:scale-95"
                >
                  ¥{SELLER_FEE_YEN.toLocaleString()} の支払いを申告
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
