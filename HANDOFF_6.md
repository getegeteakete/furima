# 🔄 フリマライブ プロジェクト 引き継ぎ書 #6

**最終更新**: 2026-05-30
**プロジェクト**: オンライン接客型フリマイベントサイト
**GitHub**: https://github.com/getegeteakete/furima.git
**本番URL**: https://furima.vercel.app/
**Supabase**: https://cccspbtjseallretqguz.supabase.co
**最新コミット**: `aa1c626`（このファイル時点。push 済み）

> この #6 が最新の引き継ぎです。#1〜#5 は履歴として残置。
> #5 以降の差分（チャット安定化・整理券キュー・在庫減算・アバター・ショップDB化・
> 出店料フロー・分析実データ化）を反映済み。

---

## 🚨 最初に貼り付けるプロンプト（コピペ用）

```
フリマライブ（オンライン接客型フリマイベントサイト）の開発を継続します。
GitHubリポジトリ: https://github.com/getegeteakete/furima.git
本番URL: https://furima.vercel.app/
Supabase: 接続済み（URL: https://cccspbtjseallretqguz.supabase.co）

前回までの進捗は引き継ぎ書（HANDOFF_6.md）に記載しています。
内容を確認してから作業を開始してください。

【次にやりたいこと】
（ここに具体的な要望を書く）
```

**※ GitHub Push 用トークンは別途チャットで直接お渡しします**
（Fine-grained / Contents: Read and write。使用後は必ず revoke）

---

## 🔴 最優先：運営側でしか対応できない手作業（コードは完了済み）

実行しないと、実装済みの機能が本番で動かない／一部保存されない。

### ① Supabase SQL Editor で `supabase/SETUP_ALL.sql` を Run（最重要・冪等）
- これ1ファイルに 0001〜0008 + seed を統合済み。貼り付けて Run するだけ。
- 内容: 全テーブル / 通知 / 在庫・画像列 / 整理券キュー / アバター列 / 出店料列 / 初期データ。
- 何度実行しても安全（create if not exists / on conflict do nothing）。

### ② Supabase Storage に public バケットを3つ作成
- `chat-images` … チャット画像
- `product-images` … 商品画像
- `avatars` … プロフィール画像
- いずれも Storage → New bucket → **Public にチェック**。無い場合はフォールバック動作。

### ③ Vercel 環境変数
必須（通知の自動配信に使用）:
- `SUPABASE_SERVICE_ROLE_KEY`（Supabase Settings→API の service_role）
- `CRON_SECRET`（任意の長いランダム文字列。Cron認可）
- 既存: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

任意（メール通知を使うなら）:
- `RESEND_API_KEY`, `RESEND_FROM`（例 `フリマライブ <noreply@検証済みドメイン>`）
- `NEXT_PUBLIC_SITE_URL`（既定 https://furima.vercel.app）

### ④ Vercel の Overdue（未払い）を解決
- Settings → Billing。未解決だと自動デプロイ・Cron が動かない。解決後 Redeploy。

### ⑤（任意・後回し可）本番RLSの厳格化
- `supabase/migrations/0002_production_rls.sql` を実行（認証が安定してから）。
- 注意: 0002 は notifications までのポリシー。**queue_tickets / seller_applications の
  fee 列 / sellers / avatar はまだ dev_all（anon全許可）想定**。本番厳格化するなら
  これらの own-rows / admin ポリシーを 0002 に追記する作業が必要。

### 🔐 セキュリティ
- GitHubトークンは毎回チャットに平文で渡している → **使用後は必ず revoke**。

---

## ✅ これまでに完成している主な機能

- **Supabase 本接続**（DB + Auth + Realtime + Storage）。データ層は `app/lib/supabaseStore.ts`
- **認証**（メール+パスワード / 購入者・出店者ロール / /admin ガード）
- **イベントID統一**（admin_events が唯一の正・ID=evt-xxx）
- **開催成立判定の自動化**（Vercel Cron */5・3名予約 AND 3アカウントのチャット → 自動 live / ended）
- **接客チャットの Realtime化**（全体 + 個別1対1・出店者ライブ接客コンソール）
  - ★#5以降★ **購読の安定化**: カウントダウン再描画ごとの再購読/再取得を解消（安定ID依存）
- **整理券キューのサーバー化**（★#5以降★ `queue_tickets`）
  - (event×seller) ごとの待ち行列。購入者は待機室で並び、Realtimeで自分の整理券/接客中/
    待ち人数を表示。出店者コンソールの「次の方を接客開始」で先頭を serving にし、
    対象購入者へ **順番通知（'turn'）を冪等配信**＋その個別ルームへ自動切替。
- **取引履歴 + 継続会話（chatOpen）+ 相互評価**
- **通知の実データ化 + Realtime化**（OPEN / 開催 / 順番）… in-app
- **メール通知（Resend）**… OPEN / 開催を予約者へ（新規分のみ・重複なし）
- **商品データの本接続**（products・DB優先表示 + 出店者CRUD + SOLD OUT永続化 + 在庫）
- **商品画像の Storage化**（product-images）
- **商品公開仕様の厳密化**（★#5以降★ 購入者チャット: 開催前=目玉5点 / 開催中=全 / 開催後=非公開）
- **在庫の自動減算**（★#5以降★ 購入確定で stock を1減算・0でSOLD OUT・未管理は即SOLD OUT）
- **プロフィール画像の Storage化**（★#5以降★ avatars バケット・マイページでアップロード）
- **ショップ情報のDB化**（★#5以降★ sellers テーブル・DB優先 + 静的フォールバック）
- **出店料1,200円の支払い確認フロー**（★#5以降★ 出店者が申告→運営が入金確認）
- **分析ダッシュボードの実データ化**（★#5以降★ 出店者の売上/販売点数/評価/開催回数/
  月別推移/予定イベントを取引・承認イベントから集計。/admin は既に実データ）

---

## ⏳ 未着手・次にやるべきこと（優先順）

```
1. LINE通知 / LINE・Googleログイン … ★ユーザー指定でスコープ外★（当面やらない）
2. 管理画面に「売れ筋商品」ランキング（transactions から集計・現状なし）
3. 出店者ダッシュボードの非機能ボタン配線（クイックアクション/イベント作成など）
4. 整理券キュー: 接客終了(セッション終了)時に自動で done にする連携
   （現状は出店者が「次の方」を押したときに前の serving を done にする）
5. 本番RLSの厳格化（queue_tickets / fee列 / sellers / avatar のポリシー追記）
6. アクセス数（PV）解析（要トラッキング基盤・現状なし）
```

---

## 🏗️ 技術スタック

```
Framework: Next.js 16.2.6 (App Router, Turbopack)
React 19 / TypeScript 5 / Tailwind CSS 4
データ: Supabase (PostgreSQL + Auth + Realtime + Storage) / @supabase/supabase-js / @supabase/ssr
自動化: Vercel Cron (*/5) → /api/cron/event-automation（成立判定+通知配信）
メール: Resend REST API（fetch直叩き）
デプロイ: Vercel (auto-deploy from main / ※Overdue要確認)
```

---

## 📁 主要ファイル

```
furima/
├── supabase/
│   ├── SETUP_ALL.sql            # ★これ1本Runで本番DB構築（0001〜0008+seed・冪等）
│   ├── migrations/0001〜0008.sql # 個別マイグレーション（0002=本番RLS・任意）
│   └── seed.sql
├── app/
│   ├── api/cron/event-automation/route.ts
│   ├── lib/
│   │   ├── supabaseStore.ts     # 🔑 データ層（読取=同期キャッシュ / 書込=楽観+永続 / Realtime）
│   │   ├── eventAutomation.ts   # 成立判定+自動遷移+通知(冪等)+新規分メール
│   │   ├── notify/email.ts      # Resend送信（server-only）
│   │   ├── events.ts            # 静的マスタ(sellers/PROFILE_TO_SHOP) + Product/Seller型
│   │   └── supabase/{client,server,admin}.ts
│   ├── components/
│   │   ├── AuthProvider.tsx     # user/profile（shopId, avatarUrl 含む）
│   │   ├── NotificationContext.tsx / NotificationDrawer.tsx
│   │   ├── ProductThumb.tsx / StoreProvider.tsx
│   ├── seller/page.tsx          # 出店者DB（商品CRUD=ProductManager / 出店料=SellerFeePanel / 分析=実データ）
│   ├── seller/[id]/page.tsx     # 出店者プロフィール（getShopById=DB優先）
│   ├── event/[id]/page.tsx      # イベント詳細（目玉5点）
│   ├── event/[id]/seller/[sellerId]/
│   │   ├── page.tsx             # 購入者チャット（商品公開フェーズ制御・在庫減算）
│   │   ├── console.tsx(console/page.tsx) # 出店者ライブ接客（整理券バー+次の方を接客開始）
│   │   └── waiting/page.tsx     # 待機室（サーバー整理券キュー）
│   ├── admin/**                 # 運営（events / events/[id]=出店料入金確認 / users / chat-settings）
│   ├── favorites/ mypage/(アバター) など
```

---

## 🔑 supabaseStore.ts 主要関数（抜粋・★は#5以降追加）

```
読取(同期): getAdminEvents / getPublicEvents(ById) / getUsers / getChatSettings
            getActiveSessions / getTransactions / getSeller(Pickup)Products
            ★getShopById / getShopByProfileId（sellersのDB優先）
書込: createAdminEvent / setEventStatus / updateSellerApplication / applyAsSeller
      reserveAsBuyer / startSession / endSession
      createProduct / updateProduct / deleteProduct / setProductSoldOut
      ★decrementStock（購入で在庫1減算）
      ★submitSellerFee / confirmSellerFee（出店料 申告/入金確認・SELLER_FEE_YEN=1200）
      createTransaction / appendTransactionMessage / submitBuyerReview / submitSellerReview
整理券★: joinQueue / getQueueTickets / callNextInQueue / leaveQueue / subscribeToQueue
通知: fetchNotifications / createNotification / mark(All)NotificationRead
      deleteNotification / clearNotifications / subscribeToNotifications
チャット: fetchRoomMessages / sendChatMessage / subscribeToRoom
          fetchSellerRoomBuyers / subscribeToSellerPrivate
Storage: uploadChatImage(s) / uploadProductImage / ★uploadAvatar / ★updateProfileAvatar
購読/起動: hydrateAll / subscribeRealtime（★sellers / ★queue_tickets 含む）
```

---

## 📜 守るべき元仕様（変更しない）

```
1. 運営は決済を持たない（商品代金は出店者⇔購入者で直接）
   ※ 出店料1,200円だけは運営⇔出店者（申告→入金確認フロー実装済）
2. 開催成立条件: 3名予約 AND 3アカウントのチャット ← 自動判定+通知配信済
3. 接客は1対1（整理券方式・デフォルト10分・管理者変更可）← サーバーキュー実装済
4. 商品公開: 開催前=目玉5点 / 開催中=全商品 / 開催後=非公開 ← 実装済
5. 複数出店者時の順序制御（購入者は同時1セッションのみ）
6. 取引履歴（終了後閲覧 + chatOpenなら期限なし継続会話）/ 相互評価（1-5星+コメント）
7. イベントの正は admin_events（ID=evt-xxx）に統一
```

---

## 🐛 既知の注意点

```
1. 上記🔴の手作業（SETUP_ALL/バケット3つ/環境変数/課金）が未了だと該当機能が動かない
2. 通知のOPEN/開催はCron経由 → CRON_SECRET と SUPABASE_SERVICE_ROLE_KEY 必須
   （順番通知だけは出店者の「次の方」操作でクライアントから配信されるためCron不要）
3. メールは RESEND_API_KEY/RESEND_FROM 未設定なら送信スキップ（in-app通知は動く）
4. デモユーザー（admin-1 等）はAuth情報なし → ログインは新規登録アカウントで
5. 開発用RLS（dev_all=anon全許可）が広く有効。本番は 0002+追加ポリシーで締める
6. 出店料の銀行口座/PayPay先の「具体的な振込先表示」は未実装（金額/方式選択+申告のみ）。
   必要なら chat_settings などに振込先情報を持たせて表示する拡張を。
7. seller/[id] や待機室/コンソールの getShopById は同期参照（hydrate後に再描画で反映）
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
npx tsc --noEmit    # 必須（型）
npm run build       # 必須（検証・19/19 緑が基準）

# push（トークンはチャットで別途受領・インラインURLで使い捨て）
git add -A && git commit -m "feat: ..."
git push "https://x-access-token:[TOKEN]@github.com/getegeteakete/furima.git" main
# 終わったらトークンを revoke
```

🎉 通知・チャット・整理券・在庫・アバター・ショップDB・出店料・分析まで実データで稼働。
残るはスコープ外のLINE系を除けば、売れ筋ランキング/非機能ボタン配線/RLS厳格化など仕上げ中心。
