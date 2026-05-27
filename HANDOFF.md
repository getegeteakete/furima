# フリマライブ - 開発状況引き継ぎ書

最終更新: 2026-05-27 / コミット: `5ddbda6`

---

## 🎯 プロジェクト概要

**サービス名**: フリマライブ (Furima LIVE)
**コンセプト**: オンライン接客型フリマイベント
- 1店舗単独・時間限定（20:00-22:00等）開催
- 整理券方式 → マンツーマンチャット接客（10分/人）
- 出店料1,200円・販売手数料0円
- 全国47都道府県対応

**GitHub**: https://github.com/getegeteakete/furima
**本番URL**: https://furima.vercel.app/

---

## 🛠 技術スタック

- **Next.js 16.2.6** (App Router, Turbopack, React 19)
- **Tailwind CSS v4** (`@import "tailwindcss"`)
- **TypeScript 5**
- **@tabler/icons-react ^3.44.0** (アイコン統一)
- **Vercel** デプロイ
- **Noto Sans JP** フォント

---

## ✅ 完成済みページ（モック・UI完成）

| ルート | 内容 | ステータス |
|--------|------|-----------|
| `/` | TOP（Hero + Shopping Now + Item Lineup + Stats + FAQ + How To + CTA） | ✅ |
| `/events` | イベント一覧（地域・カテゴリフィルター付き） | ✅ |
| `/event/[id]` | イベント詳細（slug: mina-craft, kyoto-vintage, osaka-antique） | ✅ |
| `/event/[id]/waiting` | 整理券待機（15秒デモカウントダウン→シグナル受信） | ✅ |
| `/event/[id]/chat` | マンツーマンチャット（10分タイマー、商品購入、SOLD OUT） | ✅ |
| `/about` | 使い方（For Buyers/Sellers + 料金 + Features + CTA） | ✅ |
| `/register` | 登録（購入者/出店者タブ + LINE/Google） | ✅ |
| `/login` | ログイン | ✅ |
| `/seller` | 出店者ダッシュボード（概要/商品/イベント/分析タブ） | ✅ |

---

## 📐 デザインシステム（厳守事項）

### コンテナ
```tsx
<div className="container-main">  {/* max-width: 1280px, padding 16/24/32px */}
```

### セクション余白
```tsx
<section className="section-spacing-sm">  {/* py 48/64/80px */}
<section className="section-spacing">     {/* py 64/96/120px */}
```

### アイコン
**emoji一切禁止**。すべて `app/components/Icons.tsx` の Tabler Icons を使用：
```tsx
import { ProductIcon, UserIcon, CalendarIcon, ... } from './components/Icons';
<ProductIcon type="diamond" size={56} stroke={1.5} />
<UserIcon size={24} stroke={1.5} />
```

利用可能な ProductIconType:
```
diamond | shirt | lipstick | bag | jewelry | ring | necklace
fitness | shoe | food | electronics | handmade | wallet
store | package | sparkles
```

### カラーパレット
- メイン: `orange-500` (#FF6B00)
- グラデ: `from-orange-500 to-orange-600`
- アクセント: `yellow-300`, `yellow-400`
- ベース: `gray-50`, `gray-100`, `gray-200`

### ボタン
```tsx
// Primary
<button className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95">

// Secondary
<button className="px-8 py-4 bg-white text-orange-600 border-2 border-orange-500 rounded-full font-bold hover:bg-orange-50 transition-all">
```

### グローバルCSS（globals.css）
```css
html, body { overflow-x: hidden !important; max-width: 100vw; }
* { box-sizing: border-box; }
section, header, footer, main { max-width: 100vw; overflow-x: clip; }
```

---

## 📁 ファイル構造

```
/home/claude/furima/
├── app/
│   ├── components/
│   │   ├── Header.tsx          ← ロゴ + Nav(HOME/イベント/出店者/使い方) + ログイン/無料登録
│   │   ├── Footer.tsx          ← 4列フッター（サービス/サポート/SNS）
│   │   ├── PageHero.tsx        ← 共通ページヘッダー（badge + title + subtitle）
│   │   └── Icons.tsx           ← Tabler Icons 統一ラッパー（必読）
│   ├── lib/
│   │   └── events.ts           ← 3イベントデータ + Product型 + getEventById()
│   ├── about/page.tsx
│   ├── events/page.tsx         ← 8件のEVENTSハードコード
│   ├── event/[id]/
│   │   ├── page.tsx            ← イベント詳細
│   │   ├── waiting/page.tsx    ← 整理券待機
│   │   └── chat/page.tsx       ← マンツーマンチャット
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── seller/page.tsx
│   ├── globals.css             ← overflow制御 + container-main + section-spacing
│   ├── layout.tsx              ← Noto Sans JP + メタデータ
│   └── page.tsx                ← TOP
├── vercel.json
├── package.json                ← @tabler/icons-react ^3.44.0 含む
└── next.config.ts
```

---

## 🚧 [PENDING] 次にやるべきこと（優先順位順）

### 🔥 Phase 1: モック完成（仕様書未実装機能）
仕様書 `/mnt/project/オンライン接客型フリマイベントサイト_仕様書` 参照

#### 1. 全体チャット（イベント参加者全員）
- 仕様書「7. チャット機能 - 全体チャット」
- 用途: にぎわい演出、商品紹介、コメント表示
- 実装場所: `/event/[id]/chat` に「全体」「個別」タブ追加？または別ルート

#### 2. 通知システム UI
- 開催通知
- OPEN通知
- 順番通知
- ベルアイコンクリックでドロワー or ページ

#### 3. お気に入り・フォロー機能
- イベントカードに ❤️ ボタン
- `/favorites` ページ
- `/seller/[id]` 公開プロフィールページ
- フォロー中の出店者一覧

#### 4. マイページ（購入者）
- `/mypage`
- 予約中イベント
- お気に入り
- 購入履歴

#### 5. 出店者管理機能の中身
現在モック表示のみ。実態を作る：
- 商品登録フォーム `/seller/products/new`
- イベント作成フォーム `/seller/events/new`
- 商品編集
- 在庫管理（SOLD OUT切替）

#### 6. 検索機能
- ヘッダーに検索アイコン
- `/search?q=...`

#### 7. イベント開催前/開催中/開催終了の状態管理
仕様書「9. 商品公開仕様」
- 開催前: ピックアップ5点のみ + COMING SOON
- 開催開始: 全商品公開
- 開催終了: 商品非公開
- タイムセール表示

#### 8. 利用規約・プライバシーポリシーページ
- `/terms`
- `/privacy`
- 禁止商品の明記

### 🛡 Phase 2: 運営管理画面
仕様書「15. 運営管理者機能」
- `/admin` 配下
- 会員管理（出店者/購入者）
- イベント管理（承認、OPEN/CLOSE切替）
- 商品管理（ピックアップ管理）
- チャット監視
- 通知管理
- バナー管理
- アクセス分析

### 💾 Phase 3: バックエンド統合
- Supabase or Firebase 接続
- 認証実装
- リアルタイムチャット（WebSocket / Supabase Realtime）
- 商品画像アップロード
- 決済（出店料: PayPay/銀行振込）

---

## 🎨 デザイン参考

- メインの参考: peaceyoulive.com（オレンジ系、丸み、親しみやすさ）
- アイコン: 一色一筆書きスタンプ風（**emoji禁止**）
- レスポンシブ: Mobile First（sm: 640px, lg: 1024px）
- 文字: word-break: keep-all（日本語の中途半端な改行回避）

---

## ⚠️ ユーザーの過去フィードバック（重要）

これまでに何度も指摘された項目。**繰り返さないこと**：

1. ❌ コンテンツが左右にはみ出す → `container-main` 必須
2. ❌ 上下の余白不足 → `section-spacing-sm` 最低限
3. ❌ カード内padding不足 → `p-7 sm:p-8` 推奨
4. ❌ emoji使用 → **完全禁止、Tabler Icons のみ**
5. ❌ 文字が見切れる → `word-break: keep-all` + 適切な width
6. ❌ "上場会社並み" の品質を要求 → 中途半端な妥協NG

---

## 🚀 デプロイフロー

```bash
cd /home/claude/furima
rm -rf .next
npm run build              # ビルド検証
git add -A
git commit -m "..."
git push origin main       # Vercel自動デプロイ（3-5分）
```

GitHub: `getegeteakete/furima` (PATはリモートURLに埋込み済み)
本番: `https://furima.vercel.app/`

---

## 📝 次セッション開始時の推奨アクション

1. このドキュメントを最初に読む
2. ユーザーに「Phase 1のどれから着手するか」確認
3. **おすすめ着手順**:
   - (a) 出店者の商品登録フォーム（仕様書の中核機能）
   - (b) マイページ（購入者の予約・お気に入り）
   - (c) 通知システム UI
   - (d) 全体チャット
4. 着手前に**該当ページの既存コードを view**（デザイン基準厳守のため）
5. **emoji絶対禁止・余白たっぷり・container-main必須**

---

## 🔗 関連リソース

- 仕様書: `/mnt/project/オンライン接客型フリマイベントサイト_仕様書`
- 過去transcript:
  - `2026-05-27-08-26-35-furima-vercel-deploy.txt` (デプロイ・初期構築)
  - `2026-05-27-09-19-13-furima-redesign-iterations.txt` (デザイン繰り返し改善)
