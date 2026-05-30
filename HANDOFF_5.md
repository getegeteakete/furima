# 🔄 フリマライブ プロジェクト 引き継ぎ書 #5

**最終更新**: 2026-05-30
**プロジェクト**: オンライン接客型フリマイベントサイト
**GitHub**: https://github.com/getegeteakete/furima.git
**本番URL**: https://furima.vercel.app/
**Supabase**: https://cccspbtjseallretqguz.supabase.co
**最新コミット**: `f202ffb`（このファイル時点。push 済み）

> この #5 が最新の引き継ぎです。#1〜#4 は履歴として残置。
> 過去経緯の詳細が必要なら HANDOFF_4.md（通知/メール/商品の実装メモ）を参照。

---

## 🚨 最初に貼り付けるプロンプト（コピペ用）

```
フリマライブ（オンライン接客型フリマイベントサイト）の開発を継続します。
GitHubリポジトリ: https://github.com/getegeteakete/furima.git
本番URL: https://furima.vercel.app/
Supabase: 接続済み（URL: https://cccspbtjseallretqguz.supabase.co）

前回までの進捗は引き継ぎ書（HANDOFF_5.md）に記載しています。
内容を確認してから作業を開始してください。

【次にやりたいこと】
（ここに具体的な要望を書く）
```

**※ GitHub Push 用トークンは別途チャットで直接お渡しします**
（Fine-grained / Contents: Read and write。使用後は必ず revoke）

---

## 🔴 最優先：運営側でしか対応できない手作業（コードは完了済み）

実行しないと、実装済みの機能が本番で動かない／一部保存されない。**①〜③が動作の前提**。

### ① Supabase SQL Editor で未適用のマイグレーションを実行（すべて冪等）
- `supabase/migrations/0003_notifications.sql` … 通知テーブル（無いとベルが常に空）
- `supabase/migrations/0004_products_stock.sql` … products に stock 列
- `supabase/migrations/0005_products_image.sql` … products に image_url 列
- `supabase/seed.sql` … 初期データ（admin_events / products 等。未投入なら実行推奨）

### ② Supabase Storage に public バケットを2つ作成
- `chat-images` … チャット画像（無いと dataURL フォールバック）
- `product-images` … 商品画像（無いとアイコン表示にフォールバック）
- どちらも Storage → New bucket → Public にチェック

### ③ Vercel 環境変数
必須（自動進行＝通知配信に使用）:
- `SUPABASE_SERVICE_ROLE_KEY`（Supabase Settings→API の service_role）
- `CRON_SECRET`（任意の長いランダム文字列。Cron認可）
- 既存: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

任意（メール通知を使うなら）:
- `RESEND_API_KEY`, `RESEND_FROM`（例 `フリマライブ <noreply@検証済みドメイン>`）
- `NEXT_PUBLIC_SITE_URL`（メール内リンク。既定 https://furima.vercel.app）

### ④ Vercel の Overdue（未払い）を解決
- Settings → Billing で支払い／カード更新 → 未解決だと自動デプロイ・Cronが動かない
- 解決後 Deployments で最新コミットを Redeploy

### ⑤ 本番RLS適用（公開を厳密化するなら・認証が安定してから）
- `supabase/migrations/0002_production_rls.sql` を実行
- 前提: 出店者アカウント作成 → profiles.shop_id 設定 → 自分を admin に（ファイル末尾チェックリスト参照）

### 🔐 セキュリティ
- GitHubトークンは毎回チャットに平文で渡している → **使用後は必ず revoke**

---

## ✅ これまでに完成している主な機能

- **Supabase 本接続**（DB + Auth + Realtime + Storage）。データ層は `app/lib/supabaseStore.ts`
- **認証**（メール+パスワード / 購入者・出店者ロール / /admin ガード）
- **イベントID統一**（admin_events が唯一の正・ID=evt-xxx）
- **開催成立判定の自動化**（Vercel Cron */5・3名予約 AND 3アカウントのチャット → 自動 live / 終了で ended）
- **接客チャットの Realtime化**（全体 + 個別1対1・出店者ライブ接客コンソール）
- **取引履歴 + 継続会話（chatOpen）+ 相互評価**
- **通知の実データ化 + Realtime化**（OPEN / 開催 / 順番）… in-app
- **メール通知（Resend）**… OPEN / 開催を予約者へ。新規分のみ送信で重複なし
- **商品データの本接続**… products テーブルにDB優先表示 + 出店者CRUD + SOLD OUT永続化 + 在庫
- **商品画像の Storage化**… 出店者が画像アップロード・全表示で画像/アイコン自動切替

---

## ⏳ 未着手・次にやるべきこと（優先順）

### 🥇 高優先
```
1. LINE通知（メールは実装済 → LINE Messaging API へ）※ユーザー指定で現状スコープ外
2. プロフィール画像(avatars)の Storage化（uploadImage 流用・バケット avatars）
3. 商品マスタ(sellers)のDB化
   - 商品は products に本接続済だが、ショップ情報(name/region/tags等)はまだ events.ts 静的
   - getSellerById を sellers テーブル読みに（PROFILE_TO_SHOP 依存の縮小）
```

### 🥈 通常
```
4. 整理券キューのサーバー化（現状 waiting は局所シミュレーション・順番通知は記録のみ）
5. 在庫数の自動減算（購入確定で stock を減らす）
6. 出店料1,200円の支払い確認フロー（運営は決済を持たない方針は維持）
7. 分析ダッシュボード（実データ集計・現状ダミー）
8. LINE/Googleログイン（ボタンはあるが未実装）
9. 商品公開仕様の厳密化（開催前=目玉5点/開催中=全/終了後=非公開）
```

---

## 🏗️ 技術スタック

```
Framework: Next.js 16.2.6 (App Router, Turbopack)
React 19.2.4 / TypeScript 5 / Tailwind CSS 4
データ: Supabase (PostgreSQL + Auth + Realtime + Storage)
        @supabase/supabase-js / @supabase/ssr
自動化: Vercel Cron (*/5) → /api/cron/event-automation（成立判定+通知配信）
メール: Resend REST API（fetch直叩き・SDK依存なし）
デプロイ: Vercel (auto-deploy from main / ※Overdue要確認)
```

---

## 📁 主要ファイル

```
furima/
├── supabase/
│   ├── migrations/0001_init.sql / 0002_production_rls.sql
│   │   / 0003_notifications.sql / 0004_products_stock.sql / 0005_products_image.sql
│   └── seed.sql
├── app/
│   ├── api/cron/event-automation/route.ts   # Cron 入口
│   ├── lib/
│   │   ├── supabaseStore.ts     # 🔑 データ層（読取=同期キャッシュ / 書込=楽観+永続 / Realtime）
│   │   │                        #    events / users / chatSettings / sessions / transactions
│   │   │                        #    / 通知CRUD+購読 / 商品CRUD+DB優先表示 / Storage
│   │   ├── eventAutomation.ts   # 成立判定+自動遷移+通知(冪等)+新規分メール
│   │   ├── notify/email.ts      # Resend送信（server-only・未設定ならskip）
│   │   ├── events.ts            # 静的マスタ(sellers) + Product型 + PROFILE_TO_SHOP
│   │   └── supabase/{client,server,admin}.ts
│   ├── components/
│   │   ├── AuthProvider.tsx     # user/profile（shopId含む）
│   │   ├── NotificationContext.tsx  # Supabase連携+Realtime（Drawerは無改修）
│   │   ├── ProductThumb.tsx     # 画像/アイコン自動切替の商品サムネ
│   │   └── StoreProvider.tsx    # 起動hydrate + Realtime購読
│   ├── seller/page.tsx          # 出店者ダッシュボード（商品管理=実CRUD: ProductManager）
│   ├── seller/[id]/page.tsx     # 出店者プロフィール
│   ├── event/[id]/page.tsx      # イベント詳細（目玉5点）
│   ├── event/[id]/seller/[sellerId]/{page,console,waiting}.tsx  # 購入者/出店者/待機
│   ├── favorites/page.tsx / mypage/page.tsx / admin/** など
```

---

## 🔑 supabaseStore.ts 主要関数（抜粋）

```
読取(同期): getAdminEvents / getPublicEvents / getPublicEventById
            getUsers / getChatSettings / getActiveSessions / getTransactions
            getSellerProducts / getSellerPickupProducts  ← DB優先+静的フォールバック
書込: createAdminEvent / setEventStatus / applyAsSeller / reserveAsBuyer
      startSession / endSession / createTransaction / appendTransactionMessage
      submitBuyerReview / submitSellerReview
      createProduct / updateProduct / deleteProduct / setProductSoldOut
通知: fetchNotifications / createNotification / markNotificationRead
      markAllNotificationsRead / deleteNotification / clearNotifications
      subscribeToNotifications
チャット: fetchRoomMessages / sendChatMessage / subscribeToRoom
          fetchSellerRoomBuyers / subscribeToSellerPrivate
Storage: uploadChatImage(s) / uploadProductImage
購読/起動: hydrateAll / subscribeRealtime
```

---

## 📜 守るべき元仕様（変更しない）

```
1. 運営は決済を持たない（商品代金は出店者⇔購入者で直接）
2. 出店料は1,200円（銀行振込/PayPay）
3. 開催成立条件: 3名予約 AND 3アカウントのチャット ← 自動判定+通知配信済
4. 接客は1対1（整理券方式・デフォルト10分・管理者変更可）
5. 商品公開: 開催前=目玉5点 / 開催中=全商品 / 開催後=非公開（厳密化は未着手#9）
6. 複数出店者時の順序制御（購入者は同時1セッションのみ）
7. 取引履歴（終了後閲覧 + chatOpenなら期限なし継続会話）
8. 相互評価（1-5星 + コメント）
9. イベントの正は admin_events（ID=evt-xxx）に統一
```

---

## 🐛 既知の注意点

```
1. 上記🔴の手作業（SQL/バケット/環境変数/課金）が未了だと該当機能が動かない
2. 通知のOPEN/開催はCron経由 → CRON_SECRET と SUPABASE_SERVICE_ROLE_KEY 必須
3. メールは RESEND_API_KEY/RESEND_FROM 未設定なら送信スキップ（in-app通知は動く）
4. 整理券の待機ページは局所シミュレーション。順番通知は履歴記録のみ（本命は#4）
5. ショップ情報(sellers)はまだ events.ts 静的マスタ依存（商品本体はDB化済）
6. デモユーザー（admin-1, buyer-1 等）はAuth情報なし → ログインは新規登録アカウントで
7. 開発用RLS（dev_all=anon全許可）が有効。本番は 0002 を適用
8. GitHubトークンは毎回平文で渡される → 使用後は必ず revoke
```

---

## 🚀 開発フロー

```bash
git clone https://github.com/getegeteakete/furima.git
cd furima && npm install
# .env.local（ローカル開発時のみ）
#   NEXT_PUBLIC_SUPABASE_URL=https://cccspbtjseallretqguz.supabase.co
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=（Supabase Settings→API）
npm run dev
npm run build       # 必須（検証）
npx tsc --noEmit    # 必須（型）

# push（トークンはチャットで別途受領）
git add -A && git commit -m "feat: ..."
git push "https://x-access-token:[TOKEN]@github.com/getegeteakete/furima.git" main
# push後は remote URL からトークンを除去（インラインURLで渡せば保存されない）
```

🎉 通知（in-app+メール）・商品管理・SOLD OUT・商品画像まで実データで稼働。
次は avatars / sellers のDB化、整理券キューのサーバー化あたりが本命です。
