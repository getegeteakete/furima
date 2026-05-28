# 🔄 フリマライブ プロジェクト 引き継ぎ書

**最終更新**: 2026-05-28  
**プロジェクト**: オンライン接客型フリマイベントサイト  
**GitHub**: https://github.com/getegeteakete/furima.git  
**本番URL**: https://furima.vercel.app/

---

## 🚨 最初に貼り付けるプロンプト（コピペ用）

```
フリマライブ（オンライン接客型フリマイベントサイト）の開発を継続します。
GitHubリポジトリ: https://github.com/getegeteakete/furima.git
本番URL: https://furima.vercel.app/

前回までの進捗は引き継ぎ書（HANDOFF_NEXT.md）に記載しています。
内容を確認してから作業を開始してください。

【次にやりたいこと】
（ここに具体的な要望を書く）
```

**※ GitHub Push 用のトークンは別途チャットで直接お渡しください**  
（セキュリティのため、ドキュメントには含めません）

---

## 📊 プロジェクト現状サマリー

### ✅ 完了済み（フロントエンドモック100%）

| カテゴリ | 内容 | ステータス |
|----------|------|------------|
| **基本ページ** | 16ページ全て完成 | ✅ |
| **ロゴ・ブランド** | SVG「F」ロゴ + iOSアイコン | ✅ |
| **紹介動画** | スマホ縦動画(2本結合・自動再生) + PC横動画 | ✅ |
| **予約フロー** | 詳細→整理券→チャット | ✅ |
| **管理画面** | /admin 6ページ完備 | ✅ |
| **イベント管理** | 作成・承認・OPEN/CLOSE | ✅ |
| **権限管理** | admin / event_manager / seller / buyer | ✅ |
| **複数出店者順序制御** | 1接客終了後に次予約可能 | ✅ |
| **チャット拡張** | 画像送信(2MB)・タイマー超過表示・再リクエスト | ✅ |
| **取引履歴** | 7日間閲覧可能 | ✅ |
| **相互評価** | 出店者⇔購入者で★評価（決済はナシ） | ✅ |
| **スマホ対応** | 全21ページ375px幅で検証済み | ✅ |

### ⏳ 未着手（Supabase接続が必要）

```
🔌 Supabase本接続:
  - localStorageモック → Supabase DBに置換
  - 認証（Supabase Auth）
  - リアルタイムチャット（Supabase Realtime）
  - 画像アップロード（Supabase Storage）

📺 動画:
  - PC版の新動画（横）が来たら結合実装
  
🔔 通知系:
  - LINE通知（出店者・購入者）
  - メール通知
  - Push通知（PWA）

📊 分析:
  - 売れ筋商品ランキング
  - 地域別人気度
  - 実データに基づくグラフ
```

---

## 🏗️ 技術スタック

```
Framework:    Next.js 16.2.6 (App Router)
React:        19.2.4
言語:         TypeScript 5
スタイル:     Tailwind CSS 4
アイコン:     @tabler/icons-react 3.44.0
データ:       localStorage (lib/mockStore.ts)
              → 将来 Supabase に置換予定
デプロイ:     Vercel (auto-deploy from main branch)
```

---

## 📁 重要なファイル構成

```
furima/
├── app/
│   ├── page.tsx                    # TOP（動画埋め込み）
│   ├── layout.tsx                  # viewport設定済み
│   ├── globals.css                 # iOS自動ズーム対策済み
│   │
│   ├── events/page.tsx             # イベント一覧（並び替え機能）
│   ├── event/[id]/page.tsx         # イベント詳細（複数出店者対応）
│   ├── event/[id]/seller/[sellerId]/
│   │   ├── waiting/page.tsx        # 整理券待機室
│   │   └── page.tsx                # 1対1チャット（画像送信・タイマー）
│   │
│   ├── transaction/[id]/page.tsx   # 取引履歴詳細（評価・チャット閲覧）
│   ├── mypage/page.tsx             # マイページ（取引履歴一覧）
│   ├── seller/page.tsx             # 出店者ダッシュ（取引履歴タブ）
│   │
│   ├── admin/                      # 🛡️ 管理画面（URL直アクセス）
│   │   ├── layout.tsx              # サイドバー
│   │   ├── page.tsx                # ダッシュボード
│   │   ├── events/
│   │   │   ├── page.tsx            # イベント一覧
│   │   │   ├── create/page.tsx     # イベント作成
│   │   │   └── [id]/page.tsx       # 詳細・承認・OPEN/CLOSE
│   │   ├── users/page.tsx          # ユーザー権限管理
│   │   └── chat-settings/page.tsx  # チャット設定
│   │
│   ├── lib/
│   │   ├── events.ts               # 出店者・イベントマスタ
│   │   ├── mockStore.ts            # 🔑 全データの中心（要熟読）
│   │   └── useStore.ts             # React購読フック + 都道府県
│   │
│   └── components/
│       ├── Header.tsx              # 全ページ共通ヘッダー
│       ├── Icons.tsx               # アイコン集
│       └── ...
│
└── public/
    ├── favicon.svg                 # ロゴ「F」
    ├── apple-touch-icon.svg
    └── videos/
        ├── furima-intro.mp4        # PC横動画
        └── furima-intro-mobile.mp4 # スマホ縦動画（2本結合済み）
```

---

## 🔑 lib/mockStore.ts の重要関数

将来の Supabase 移行時、この関数群を Supabase クエリに差し替えるだけで完了します。

### イベント管理
```typescript
getAdminEvents(): AdminEvent[]
getAdminEventById(id): AdminEvent
createAdminEvent(data): AdminEvent
updateAdminEvent(id, updates): void
setEventStatus(id, status): void
deleteAdminEvent(id): void
updateSellerApplication(eventId, sellerId, status): void
applyAsSeller(eventId, sellerId, name): { ok, message }
reserveAsBuyer(eventId, buyerId): { ok, message }
```

### ユーザー権限
```typescript
getUsers(): MockUser[]
updateUserRole(userId, role): void
getEventManagers(): MockUser[]
```

### チャット設定
```typescript
getChatSettings(): ChatSettings
updateChatSettings(updates): void
```

### セッション制御（⑥順序制御）
```typescript
startSession(buyerId, eventId, sellerId): { ok, message }
endSession(buyerId, eventId): void
getBuyerActiveSession(buyerId, eventId): ActiveSession
canReserveSeller(buyerId, eventId, sellerId): { ok, message }
```

### 取引履歴 & 評価
```typescript
getTransactions(): Transaction[]    // 自動で7日経過分を除外
getBuyerTransactions(buyerId): Transaction[]
getSellerTransactions(sellerId): Transaction[]
getTransactionById(id): Transaction
createTransaction(data): Transaction
submitBuyerReview(txnId, review): void
submitSellerReview(txnId, review): void
getSellerAverageRating(sellerId): { average, count }
getRemainingDays(expiresAt): number
```

---

## 📜 重要な仕様（必ず守る）

### ✅ 元仕様書の方針（変更しないこと）

```
1. 運営は決済を持たない
   → 商品代金は出店者と購入者が直接やり取り
   → エスクロー型にしない
   → 評価機能はOK・決済仲介はNG

2. 出店料は1,200円
   → 出店者が運営に支払い（銀行振込 or PayPay）

3. 開催成立条件
   → 3名以上の予約来場 AND 3アカウント以上のチャット発生

4. 接客は1対1（マンツーマン）
   → 整理券方式で順番管理
   → デフォルト10分（管理者が変更可）

5. 商品公開
   → 開催前: 目玉商品5点のみ
   → 開催中: 全商品公開
   → 開催後: 非公開
```

### 🆕 追加実装した方針

```
6. 複数出店者時の順序制御（⑥）
   → 購入者は同時に1セッションのみ
   → 終了後に他出店者へ予約可能

7. 取引履歴
   → イベント終了後7日間チャット閲覧可
   → 自動で期限切れデータを除外

8. 相互評価
   → 1-5星 + コメント
   → 出店者⇔購入者の両方向
```

---

## 🚀 開発フロー（決まったやり方）

```bash
# 1. リポジトリをクローン
git clone https://github.com/getegeteakete/furima.git
cd furima
npm install

# 2. 開発
npm run dev   # 開発サーバー
npm run build # ビルド検証（必須）
npx tsc --noEmit  # 型チェック（必須）

# 3. コミット & プッシュ
git config user.email "dev@furima.jp"
git config user.name "Furima Dev"
git add -A
git commit -m "feat: ..."

# トークン認証でpush
git remote set-url origin https://[TOKEN]@github.com/getegeteakete/furima.git
git push origin main
# → Vercel自動デプロイ開始（3-5分）
```

---

## 📱 スマホ対応の必須チェック

新機能追加時は必ず Playwright で 375px 幅で確認すること：

```javascript
// 確認スクリプト例（/home/claude/mobile-check.js 参照）
const { chromium, devices } = require('playwright');
const iPhone = devices['iPhone 12'];
// 全ページの横はみ出しチェック → 必ず ✅ になること
```

### 既に実装済みのスマホ対応ポイント
- ✅ viewport設定（layout.tsx）
- ✅ iOS自動ズーム対策（globals.css の `font-size: 16px`）
- ✅ ハンバーガーメニュー
- ✅ チャット商品一覧の横スクロール
- ✅ 管理画面のレスポンシブ（全グリッドsm:/lg:対応）

---

## 🎯 次回想定される作業（優先順）

### 🥇 最優先（運営開始に必須）
```
1. Supabase セットアップ
   - プロジェクト作成
   - テーブル作成（users, events, transactions, sessions...）
   - mockStore.ts の関数を順次Supabaseクエリに差し替え

2. 認証実装
   - Supabase Auth でログイン/会員登録
   - /admin に認証ガード追加
   - 現在は URL 直アクセスのモック状態

3. WebSocket チャット
   - Supabase Realtime で1対1チャット
   - 全体チャットも同様に
```

### 🥈 高優先
```
4. 画像アップロード（Supabase Storage）
   - チャット画像（現在はdataURLでメモリ保持）
   - 商品画像
   - ロゴ・プロフィール画像

5. 開催成立判定の自動化
   - 3名以上の予約 AND 3アカウント以上のチャット
   - Cron job または Edge Function

6. PC版動画の結合
   - 新動画が届いたら furima-intro.mp4 に結合
   - スマホ版と同じ手順（ffmpeg slideleft transition）
```

### 🥉 通常
```
7. LINE通知連携
8. メール通知（SendGrid等）
9. 決済確認フロー（出店料1,200円の管理）
10. 分析ダッシュボード（実データ）
```

---

## 🐛 既知の制約・注意点

```
1. localStorage の制約
   → 1ブラウザ1端末しかデータ共有できない
   → ユーザーAの変更がユーザーBに反映されない
   → Supabase接続で解決

2. ファイル名はそのまま使える
   → furima-intro-mobile.mp4 は固定
   → 結合動画もこの名前で配置

3. GitHubトークン
   → 別途チャットで直接共有（ドキュメントには記載しない）
   → 漏洩リスクあり → 定期的に再発行推奨

4. Vercel自動デプロイ
   → main ブランチへのpushで即デプロイ
   → 3-5分でURL反映
```

---

## 📝 主要コミット履歴

```
546c73a feat: Transaction history & mutual rating (no escrow)
11c1aa9 improve: Thorough mobile responsive optimization
8032a2b improve: Mobile product list horizontal scroll in chat
f21757b improve: Mobile video autoplay (muted, loop, inline)
9c836f1 feat: Combine two mobile videos with slide transition
6c49141 feat: Implement 6 mock features (admin panel + chat extensions)
1b782eb feat: Implement 3 UI features (video, sort, product scroll)
defe32f fix: Event ID URL-safe format & update favicon to simple F
6af78bc fix: Correct booking flow - detail page to waiting room
7a04d90 feat: Add brand logo & update favicon configuration
1925a84 feat: 時間帯・地域別イベントフローを完全実装
```

---

## 🔗 重要URL一覧

```
本番:
  https://furima.vercel.app/                   # TOP
  https://furima.vercel.app/events             # イベント一覧
  https://furima.vercel.app/event/2000-shiga   # 詳細（3出店者）
  https://furima.vercel.app/mypage             # マイページ（取引履歴）
  https://furima.vercel.app/transaction/txn-demo-1  # 取引詳細
  https://furima.vercel.app/admin              # 管理ダッシュボード
  https://furima.vercel.app/admin/events/create # イベント作成
  https://furima.vercel.app/admin/users        # 権限管理
  https://furima.vercel.app/admin/chat-settings # チャット設定

開発:
  http://localhost:3000  (npm run dev)
```

---

## 💡 次回チャット開始時のフロー

```
1. このHANDOFF_NEXT.mdをClaudeに渡す
2. GitHubトークンを伝える
3. やりたいことを伝える

→ Claudeがリポジトリをクローン
→ 現状を確認
→ 作業開始
```

---

**最後に**:
ここまでの実装は全てモック（localStorage）で動作確認済みです。
データ層が抽象化されているので、Supabase接続は「mockStore.ts の関数を置き換えるだけ」で完了します。

UI・UX・状態遷移・バリデーション・スマホ対応は完成しているので、
次回は本格的なバックエンド構築に集中できる状態です。

🎉 お疲れさまでした！
