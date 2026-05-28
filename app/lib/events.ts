import type { ProductIconType } from '../components/Icons';

export type Product = {
  id: number;
  name: string;
  price: number;
  icon: ProductIconType;
  description: string;
};

export type Seller = {
  id: string;
  name: string;
  region: string;
  category: string;
  tags: string[];
  description: string;
  icon: ProductIconType;
  rating: number;
  followers: number;
  products: Product[]; // 目玉商品 5点
};

// 1つの時間帯・地域 = 複数の出店者
export type TimeSlotEvent = {
  id: string; // '20:00-shiga' など
  startTime: string; // '20:00'
  endTime: string; // '22:00'
  region: string; // '滋賀'
  date: string; // '今夜'
  status: 'upcoming' | 'live' | 'ended';
  sellers: Seller[]; // 複数の出店者（最大5つまで表示）
};

// 出店者マスターデータ
export const sellers: Seller[] = [
  {
    id: 'mina-craft',
    name: 'mina.craft',
    region: '滋賀',
    category: 'ハンドメイド',
    tags: ['ハンドメイド', 'アクセ', 'レジン'],
    description: '滋賀発のハンドメイドアクセサリーショップ。レジン樹脂や天然石を使った一点物アイテムを取り扱っています。',
    icon: 'diamond',
    rating: 4.8,
    followers: 542,
    products: [
      { id: 1, name: 'レジン樹脂ピアス', price: 2800, icon: 'jewelry', description: '透明感が美しいレジンの一点物' },
      { id: 2, name: '天然石ネックレス', price: 4500, icon: 'necklace', description: 'アメジストの天然石を使用' },
      { id: 3, name: 'ハンドメイドリング', price: 3200, icon: 'ring', description: 'シルバー925製の手作りリング' },
      { id: 4, name: 'ガラスチャーム', price: 1800, icon: 'sparkles', description: 'カラフルなガラス玉のチャーム' },
      { id: 5, name: 'シルバーブレス', price: 6500, icon: 'diamond', description: 'スターリングシルバー使用' },
      { id: 6, name: 'ドライフラワーピアス', price: 3000, icon: 'sparkles', description: '本物のお花を閉じ込めたピアス' },
      { id: 7, name: 'パールイヤリング', price: 3800, icon: 'jewelry', description: '淡水パールの上品なイヤリング' },
      { id: 8, name: 'レジンキーホルダー', price: 1500, icon: 'sparkles', description: '海をイメージしたブルーレジン' },
      { id: 9, name: '天然石ブレスレット', price: 4200, icon: 'diamond', description: 'ローズクォーツのブレスレット' },
      { id: 10, name: 'ビーズアンクレット', price: 2200, icon: 'necklace', description: '夏にぴったりのアンクレット' },
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
    rating: 4.6,
    followers: 321,
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
    rating: 4.9,
    followers: 678,
    products: [
      { id: 1, name: 'アンティーク食器セット', price: 3800, icon: 'food', description: '昭和初期のレトロ柄' },
      { id: 2, name: 'ヴィンテージランプ', price: 12000, icon: 'package', description: 'ステンドグラス' },
      { id: 3, name: '骨董花瓶', price: 8500, icon: 'package', description: '九谷焼の一輪挿し' },
      { id: 4, name: 'レトロ柱時計', price: 6500, icon: 'package', description: '振り子付き動作品' },
      { id: 5, name: 'アンティーク手鏡', price: 9800, icon: 'sparkles', description: '銀メッキ装飾' },
    ],
  },
  {
    id: 'fukuoka-handmade',
    name: 'fukuoka.handmade',
    region: '福岡',
    category: 'ハンドメイド',
    tags: ['ハンドメイド', 'バッグ', '革製品'],
    description: '福岡発のレザークラフトショップ。天然素材を使った温かみのある作品を取り扱っています。',
    icon: 'bag',
    rating: 4.7,
    followers: 456,
    products: [
      { id: 1, name: 'ヌメ革トートバッグ', price: 15000, icon: 'bag', description: '手染めヌメ革' },
      { id: 2, name: '本革ウォレット', price: 8500, icon: 'wallet', description: '迷彩柄' },
      { id: 3, name: 'レザーキーケース', price: 4800, icon: 'sparkles', description: 'ユリス色' },
      { id: 4, name: '手作り名刺入れ', price: 3500, icon: 'package', description: 'コンパクトサイズ' },
      { id: 5, name: '本革ベルト', price: 7200, icon: 'package', description: 'サスペンダーリング付き' },
    ],
  },
  {
    id: 'hokkaido-craft',
    name: 'hokkaido.craft',
    region: '北海道',
    category: '雑貨・工芸品',
    tags: ['アイヌ工芸', '木工', '刺繍'],
    description: '北海道発の伝統工芸品。アイヌ文様を取り入れた現代的な作品を展開しています。',
    icon: 'sparkles',
    rating: 4.9,
    followers: 812,
    products: [
      { id: 1, name: 'アイヌ刺繍コースター', price: 2200, icon: 'sparkles', description: '手刺繍' },
      { id: 2, name: '木彫り小物', price: 5500, icon: 'package', description: '白樺の木' },
      { id: 3, name: 'アイヌ文様ショール', price: 18000, icon: 'shirt', description: 'ウール素材' },
      { id: 4, name: '手作り手ぬぐい', price: 3200, icon: 'shirt', description: '伝統柄' },
      { id: 5, name: 'アイヌ工芸バッグ', price: 12500, icon: 'bag', description: '限定色' },
    ],
  },
];

// 時間帯・地域ごとのイベント（複数出店者を含む）
export const timeSlotEvents: TimeSlotEvent[] = [
  {
    id: '2000-shiga',
    startTime: '20:00',
    endTime: '22:00',
    region: '滋賀',
    date: '今夜',
    status: 'live',
    sellers: [sellers[0]], // mina.craft
  },
  {
    id: '2015-kyoto',
    startTime: '20:15',
    endTime: '22:15',
    region: '京都',
    date: '今夜',
    status: 'upcoming',
    sellers: [sellers[1]], // kyoto.vintage
  },
  {
    id: '2030-osaka',
    startTime: '20:30',
    endTime: '22:30',
    region: '大阪',
    date: '今夜',
    status: 'upcoming',
    sellers: [sellers[2]], // osaka.antique
  },
  {
    id: '2045-fukuoka',
    startTime: '20:45',
    endTime: '22:45',
    region: '福岡',
    date: '今夜',
    status: 'upcoming',
    sellers: [sellers[3]], // fukuoka.handmade
  },
  {
    id: '2100-hokkaido',
    startTime: '21:00',
    endTime: '23:00',
    region: '北海道',
    date: '今夜',
    status: 'upcoming',
    sellers: [sellers[4]], // hokkaido.craft
  },
];

// ヘルパー関数
export const getTimeSlotEventById = (id: string): TimeSlotEvent | undefined => {
  return timeSlotEvents.find((e) => e.id === id);
};

export const getSellerById = (id: string): Seller | undefined => {
  return sellers.find((s) => s.id === id);
};

// 後方互換性のための関数（古いEventType）
export type Event = TimeSlotEvent;
export const events = timeSlotEvents;
export const getEventById = getTimeSlotEventById;
