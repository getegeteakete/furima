'use client';

import { useMemo } from 'react';
import { getTransactions } from '../../lib/supabaseStore';
import type { Transaction } from '../../lib/supabaseStore';
import { useStoreData } from '../../lib/useStore';
import {
  ChartIcon,
  ReceiptIcon,
  CoinIcon,
  UserIcon,
  TrendingUpIcon,
  StoreIcon,
} from '../../components/Icons';

const yen = (n: number) => `¥${n.toLocaleString('ja-JP')}`;

type ProductRank = {
  key: string;
  productName: string;
  sellerName: string;
  count: number;
  revenue: number;
};

type SellerRank = {
  sellerId: string;
  sellerName: string;
  count: number;
  revenue: number;
};

export default function AdminAnalyticsPage() {
  const [transactions] = useStoreData(getTransactions);

  // 売れ筋商品: 商品名×出店者で件数・金額を集計し、販売数の多い順。
  const productRanking = useMemo<ProductRank[]>(() => {
    const map = new Map<string, ProductRank>();
    for (const t of transactions as Transaction[]) {
      const key = `${t.sellerId}::${t.productName}`;
      const cur = map.get(key);
      if (cur) {
        cur.count += 1;
        cur.revenue += t.productPrice;
      } else {
        map.set(key, {
          key,
          productName: t.productName,
          sellerName: t.sellerName,
          count: 1,
          revenue: t.productPrice,
        });
      }
    }
    return [...map.values()].sort((a, b) => b.count - a.count || b.revenue - a.revenue);
  }, [transactions]);

  // 出店者ランキング: 出店者ごとの流通額・販売点数（金額の多い順）。
  const sellerRanking = useMemo<SellerRank[]>(() => {
    const map = new Map<string, SellerRank>();
    for (const t of transactions as Transaction[]) {
      const cur = map.get(t.sellerId);
      if (cur) {
        cur.count += 1;
        cur.revenue += t.productPrice;
      } else {
        map.set(t.sellerId, {
          sellerId: t.sellerId,
          sellerName: t.sellerName,
          count: 1,
          revenue: t.productPrice,
        });
      }
    }
    return [...map.values()].sort((a, b) => b.revenue - a.revenue || b.count - a.count);
  }, [transactions]);

  const totalSales = transactions.length;
  const totalGmv = useMemo(
    () => (transactions as Transaction[]).reduce((s, t) => s + t.productPrice, 0),
    [transactions],
  );
  const uniqueBuyers = useMemo(
    () => new Set((transactions as Transaction[]).map((t) => t.buyerId)).size,
    [transactions],
  );

  const stats = [
    { label: '販売件数', value: String(totalSales), Icon: ReceiptIcon, color: 'from-orange-400 to-orange-600' },
    { label: '流通額（参考）', value: yen(totalGmv), Icon: CoinIcon, color: 'from-green-400 to-green-600' },
    { label: '購入ユーザー数', value: String(uniqueBuyers), Icon: UserIcon, color: 'from-blue-400 to-blue-600' },
    { label: '販売商品種', value: String(productRanking.length), Icon: StoreIcon, color: 'from-purple-400 to-purple-600' },
  ];

  const maxCount = productRanking[0]?.count ?? 1;
  const maxRevenue = sellerRanking[0]?.revenue ?? 1;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">売れ筋・分析</h1>
        <p className="text-sm text-gray-600">
          取引履歴をもとに集計した販売状況です。
          <span className="text-gray-400">（運営は決済を持たないため、金額は出店者⇔購入者間の取引記録の参考値です）</span>
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-3`}>
              <s.Icon size={22} stroke={2} />
            </div>
            <p className="text-2xl font-black text-gray-900 truncate">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* 売れ筋商品ランキング */}
      <div>
        <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
          <ChartIcon size={20} stroke={2} className="text-orange-600" />
          売れ筋商品ランキング
        </h2>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {productRanking.length === 0 && (
            <p className="p-8 text-center text-gray-400 text-sm">まだ販売データがありません</p>
          )}
          {productRanking.slice(0, 10).map((p, i) => (
            <div
              key={p.key}
              className={`flex items-center gap-4 p-4 ${i !== 0 ? 'border-t border-gray-100' : ''}`}
            >
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${
                  i === 0
                    ? 'bg-yellow-400 text-white'
                    : i === 1
                      ? 'bg-gray-300 text-white'
                      : i === 2
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-100 text-gray-500'
                }`}
              >
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate">{p.productName}</p>
                <p className="text-xs text-gray-500 truncate">{p.sellerName}</p>
                <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                    style={{ width: `${(p.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-black text-gray-900">{p.count}件</p>
                <p className="text-xs text-gray-500">{yen(p.revenue)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 出店者ランキング（流通額） */}
      <div>
        <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUpIcon size={20} stroke={2} className="text-orange-600" />
          出店者ランキング（流通額）
        </h2>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {sellerRanking.length === 0 && (
            <p className="p-8 text-center text-gray-400 text-sm">まだ販売データがありません</p>
          )}
          {sellerRanking.slice(0, 10).map((s, i) => (
            <div
              key={s.sellerId}
              className={`flex items-center gap-4 p-4 ${i !== 0 ? 'border-t border-gray-100' : ''}`}
            >
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${
                  i === 0
                    ? 'bg-yellow-400 text-white'
                    : i === 1
                      ? 'bg-gray-300 text-white'
                      : i === 2
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-100 text-gray-500'
                }`}
              >
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate">{s.sellerName}</p>
                <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                    style={{ width: `${(s.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-black text-gray-900">{yen(s.revenue)}</p>
                <p className="text-xs text-gray-500">{s.count}点販売</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
