'use client';

import { useEffect, useState, useCallback } from 'react';

// 47都道府県
export const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
];

// ストアの更新を購読してデータを再取得するフック
export function useStoreData<T>(getter: () => T): [T, () => void] {
  const [data, setData] = useState<T>(getter);

  const refresh = useCallback(() => {
    setData(getter());
  }, [getter]);

  useEffect(() => {
    // 初回マウント時に最新を取得（SSR対策）
    refresh();

    const handler = () => refresh();
    window.addEventListener('furima-store-update', handler);
    window.addEventListener('storage', handler); // 別タブ対応
    return () => {
      window.removeEventListener('furima-store-update', handler);
      window.removeEventListener('storage', handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [data, refresh];
}
