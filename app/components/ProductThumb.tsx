import { ProductIcon } from './Icons';
import type { Product } from '../lib/events';

// 商品サムネイル: image_url があれば画像、無ければアイコンにフォールバック。
// 親要素（aspect固定・overflow-hidden）の中で使う前提。
export default function ProductThumb({
  product,
  iconSize = 32,
  stroke = 1.5,
}: {
  product: Pick<Product, 'icon' | 'imageUrl' | 'name'>;
  iconSize?: number;
  stroke?: number;
}) {
  if (product.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    );
  }
  return <ProductIcon type={product.icon} size={iconSize} stroke={stroke} />;
}
