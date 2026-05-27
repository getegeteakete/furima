import type { ProductIconType } from '../components/Icons';

export type Product = {
  id: number;
  name: string;
  price: number;
  icon: ProductIconType;
  description: string;
};

export type Event = {
  id: string;
  name: string;
  region: string;
  category: string;
  tags: string[];
  description: string;
  icon: ProductIconType;
  startTime: string;
  endTime: string;
  date: string;
  maxReservations: number;
  currentReservations: number;
  status: 'upcoming' | 'live' | 'ended';
  products: Product[];
};

export const events: Event[] = [
  {
    id: 'mina-craft',
    name: 'mina.craft',
    region: '滋賀',
    category: 'ハンドメイド',
    tags: ['ハンドメイド', 'アクセ', 'レジン'],
    description: '滋賀発のハンドメイドアクセサリーショップ。レジン樹脂や天然石を使った一点物アイテムを取り扱っています。',
    icon: 'diamond',
    startTime: '20:00',
    endTime: '22:00',
    date: '今夜',
    maxReservations: 10,
    currentReservations: 7,
    status: 'live',
    products: [
      { id: 1, name: 'レジン樹脂ピアス', price: 2800, icon: 'jewelry', description: '透明感が美しいレジンの一点物' },
      { id: 2, name: '天然石ネックレス', price: 4500, icon: 'necklace', description: 'アメジストの天然石を使用' },
      { id: 3, name: 'ハンドメイドリング', price: 3200, icon: 'ring', description: 'シルバー925製の手作りリング' },
      { id: 4, name: 'ガラスチャーム', price: 1800, icon: 'sparkles', description: 'カラフルなガラス玉のチャーム' },
      { id: 5, name: 'シルバーブレス', price: 6500, icon: 'diamond', description: 'スターリングシルバー使用' },
    ],
  },
  {
    id: 'kyoto-vintage',
    name: 'kyoto.vintage',
    region: '京都',
    category: '古着',
    tags: ['古着', 'レトロ', 'ヴィンテージ'],
    description: '京都の古着セレクトショップ。70-90年代のレトロアイテムを中心に取り扱っています。',
    icon: 'shirt',
    startTime: '20:15',
    endTime: '22:15',
    date: '今夜',
    maxReservations: 10,
    currentReservations: 5,
    status: 'upcoming',
    products: [
      { id: 1, name: 'ヴィンテージワンピ', price: 8800, icon: 'shirt', description: '70年代のフラワー柄' },
      { id: 2, name: 'レトロブラウス', price: 4500, icon: 'shirt', description: 'パフスリーブが可愛い' },
      { id: 3, name: '80sジャケット', price: 12000, icon: 'shirt', description: 'デニム×レザー' },
      { id: 4, name: 'ハイウエストスカート', price: 5600, icon: 'shirt', description: 'プリーツデザイン' },
      { id: 5, name: 'レトロデニム', price: 6500, icon: 'shirt', description: 'リーバイス501' },
    ],
  },
  {
    id: 'osaka-antique',
    name: 'osaka.antique',
    region: '大阪',
    category: '雑貨',
    tags: ['雑貨', '骨董', 'アンティーク'],
    description: '大阪の骨董雑貨ショップ。アンティーク食器や雑貨を中心に取り扱っています。',
    icon: 'package',
    startTime: '20:30',
    endTime: '22:30',
    date: '今夜',
    maxReservations: 10,
    currentReservations: 3,
    status: 'upcoming',
    products: [
      { id: 1, name: 'アンティーク食器セット', price: 3800, icon: 'food', description: '昭和初期のレトロ柄' },
      { id: 2, name: 'ヴィンテージランプ', price: 12000, icon: 'package', description: 'ステンドグラス' },
      { id: 3, name: '骨董花瓶', price: 8500, icon: 'package', description: '九谷焼の一輪挿し' },
      { id: 4, name: 'レトロ柱時計', price: 6500, icon: 'package', description: '振り子付き動作品' },
      { id: 5, name: 'アンティーク手鏡', price: 9800, icon: 'sparkles', description: '銀メッキ装飾' },
    ],
  },
];

export const getEventById = (id: string): Event | undefined => {
  return events.find((e) => e.id === id);
};
