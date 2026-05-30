'use client';

import { useState, useCallback } from 'react';
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

const UPCOMING_EVENTS = [
  { id: 1, date: '今日', time: '20:00-22:00', reserved: 7, max: 10, status: 'live' },
  { id: 2, date: '明日', time: '20:00-22:00', reserved: 5, max: 10, status: 'upcoming' },
  { id: 3, date: '12/20', time: '19:00-21:00', reserved: 2, max: 10, status: 'upcoming' },
];

export default function SellerPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  // 担当ショップ: profiles.shop_id（本番）→ デモ対応表 → 既定の順に解決
  const { profile } = useAuth();
  const shopId = profile?.shopId ?? PROFILE_TO_SHOP[profile?.id ?? ''] ?? 'mina-craft';

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
                  { label: '今月の売上', value: '¥48,200', change: '+15%', Icon: CoinIcon },
                  { label: '販売点数', value: '47点', change: '+8点', Icon: PackageIcon },
                  { label: 'イベント開催', value: '8回', change: '+2回', Icon: CalendarIcon },
                  { label: '評価', value: '4.8', change: '★5つ', Icon: StarIcon },
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
                  {UPCOMING_EVENTS.map((event) => (
                    <div key={event.id} className="px-6 py-5 flex items-center gap-4 hover:bg-orange-50 transition-colors">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        event.status === 'live' ? 'bg-red-100 text-red-600' : 'bg-orange-100 dark:bg-gray-800 text-orange-600'
                      }`}>
                        {event.status === 'live' ? <BoltIcon size={22} stroke={1.5} /> : <CalendarIcon size={22} stroke={1.5} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-gray-900">{event.date} {event.time}</p>
                        <p className="text-xs text-gray-500">予約 {event.reserved}/{event.max}名</p>
                      </div>
                      <div className="w-24 hidden sm:block">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-400 to-orange-600"
                            style={{ width: `${(event.reserved / event.max) * 100}%` }}
                          />
                        </div>
                      </div>
                      <ArrowRightIcon size={16} stroke={2} className="text-orange-600" />
                    </div>
                  ))}
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
          {activeTab === 'events' && (
            <div className="bg-white rounded-3xl border border-gray-200 dark:border-gray-800 p-10 sm:p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-50 rounded-3xl mb-5 text-orange-600">
                <CalendarIcon size={40} stroke={1.5} />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-3">イベント管理</h2>
              <p className="text-sm text-gray-600 mb-8">開催スケジュールを管理します</p>
              <button className="inline-flex items-center gap-2 px-7 py-3.5 bg-orange-500 text-white rounded-full text-sm font-bold hover:bg-orange-600 transition-all">
                <PlusIcon size={16} stroke={2.5} />
                新しいイベントを作成
              </button>
            </div>
          )}

          {/* Transactions Tab - 取引履歴 */}
          {activeTab === 'transactions' && <SellerTransactions shopId={shopId} />}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="bg-white rounded-3xl border border-gray-200 dark:border-gray-800 p-7 sm:p-8 lg:p-10">
              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                  <ChartIcon size={20} stroke={1.5} />
                </div>
                <h2 className="text-lg font-black text-gray-900">月別売上推移</h2>
              </div>
              <div className="flex items-end gap-2 sm:gap-3 h-48 sm:h-56">
                {[35, 42, 28, 48, 55, 38, 62, 48].map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg transition-all hover:opacity-80 min-h-[20px]"
                      style={{ height: `${val}%` }}
                    />
                    <span className="text-xs text-gray-500">{idx + 5}月</span>
                  </div>
                ))}
              </div>
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
