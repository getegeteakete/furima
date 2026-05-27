/**
 * スキップリンク
 * キーボードユーザーがメインコンテンツに直接遷移できる
 * WCAG 2.1 Level A: 2.4.1 Bypass Blocks
 */

export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="fixed top-0 left-0 z-50 px-4 py-2 bg-orange-600 text-white font-bold text-sm rounded-br-lg -translate-y-full focus:translate-y-0 transition-transform"
    >
      メインコンテンツへスキップ
    </a>
  );
}
