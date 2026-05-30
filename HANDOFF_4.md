# 🔄 フリマライブ プロジェクト 引き継ぎ書 #4

**最終更新**: 2026-05-30
**プロジェクト**: オンライン接客型フリマイベントサイト
**GitHub**: https://github.com/getegeteakete/furima.git
**本番URL**: https://furima.vercel.app/
**Supabase**: https://cccspbtjseallretqguz.supabase.co

---

## 🚨 最初に貼り付けるプロンプト（コピペ用）

```
フリマライブ（オンライン接客型フリマイベントサイト）の開発を継続します。
GitHubリポジトリ: https://github.com/getegeteakete/furima.git
本番URL: https://furima.vercel.app/
Supabase: 接続済み（URL: https://cccspbtjseallretqguz.supabase.co）

前回までの進捗は引き継ぎ書（HANDOFF_4.md）に記載しています。
内容を確認してから作業を開始してください。

【次にやりたいこと】
（ここに具体的な要望を書く）
```

**※ GitHub Push 用トークンは別途チャットで直接お渡しします**
（Fine-grained / Contents: Read and write。使用後は必ず revoke）

---

## 🔴 最優先：運営側でしか対応できない手作業（コード側は完了済み）

### ★今回NEW★ ⓪ Supabase で 0003_notifications.sql を実行（通知の実データ化に必須）
- `supabase/migrations/0003_notifications.sql` を SQL Editor で実行（冪等）
- これが無いと通知ベル/ドロワーが空のまま（テーブル未作成で fetch が失敗）
- Realtime publication への追加もこのSQLに含まれる

### ★今回NEW★ ⓪-b Supabase で 0004 / 0005 を実行（商品の在庫・画像カラム）
- `supabase/migrations/0004_products_stock.sql` … products に stock 列
- `supabase/migrations/0005_products_image.sql` … products に image_url 列
- いずれも冪等。未実行でも商品表示・追加は動くが在庫/画像の保存ができない
- 併せて `supabase/seed.sql` の products が未投入なら実行推奨（DB優先表示の元データ）

### ★今回NEW★ ②-c Supabase Storage に public バケット 'product-images' を作成
- Storage → New bucket → 名前 `product-images` / Public にチェック
- これが無いと商品画像アップロードが失敗（アイコン表示にフォールバック）

### ① Supabase で seed.sql を再実行（イベントID統一後の正データ投入）
- `supabase/seed.sql` を SQL Editor で実行（冪等）
- 既存 evt-001 が recruiting で残る場合: `update public.admin_events set status='live' where id='evt-001';`

### ② Supabase Storage に public バケット 'chat-images' を作成
- Storage → New bucket → 名前 `chat-images` / Public にチェック

### ③ Vercel 環境変数（自動化＝通知配信に必須）
- `SUPABASE_SERVICE_ROLE_KEY`（Supabase Settings→API の service_role）
- `CRON_SECRET`（任意の長いランダム文字列）
- 既存: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ⚠️ これが無いと Cron が 401/500 → **OPEN通知・開催通知が一切配信されない**

### ★今回NEW★ ③-b メール通知を使うなら Resend の環境変数（任意）
- `RESEND_API_KEY`（resend.com で発行）
- `RESEND_FROM`（例 `フリマライブ <noreply@検証済みドメイン>`・要ドメイン検証）
- 任意: `NEXT_PUBLIC_SITE_URL`（メール内リンク用・既定 https://furima.vercel.app）
- 未設定でも **in-app通知は動く**（メール送信だけスキップされる）

### ④ Vercel の Overdue（未払い）解決（未解決なら自動デプロイ・Cronが動かない）
- Settings → Billing で支払い／カード更新 → 最新コミットを Redeploy

### ⑤ 本番RLS適用（公開を厳密化するなら・認証が安定してから）
- `supabase/migrations/0002_production_rls.sql` を実行（notifications 用 own-rows ポリシー追加済）

---

## 📊 今回のセッション（HANDOFF_3→4）でやったこと

### ✅ 通知の実データ化 + Realtime化（完了）★今回の本命★
これまで `NotificationContext` はハードコードのモック3件だけだった。これを
Supabase の `notifications` テーブル + Realtime に置き換え、「実際に届く・複数端末で同期する」
通知へ移行した。元仕様の **OPEN通知 / 開催通知 / 順番通知** を実配信する。

- **新テーブル `notifications`**（`supabase/migrations/0003_notifications.sql`）
  - user_id（受信者）, type, title, message, event_id, event_name, dedupe_key, read, created_at
  - `unique(user_id, dedupe_key)` で**冪等配信**（Cronが5分毎に呼んでも重複しない）
  - Realtime publication に追加済
- **データ層**（`app/lib/supabaseStore.ts` に追加）
  - `fetchNotifications / createNotification / markNotificationRead /`
    `markAllNotificationsRead / deleteNotification / clearNotifications /`
    `subscribeToNotifications`（user_id でフィルタした Realtime購読）
  - 型: `AppNotification`, `AppNotificationType`
- **`NotificationContext.tsx` を全面刷新**
  - ログイン中ユーザー（useAuth）の通知を読み込み → Realtime購読 → 同期表示
  - 公開API（addNotification/markAsRead/markAllAsRead/removeNotification/clearAll/unreadCount）は
    据え置きなので **NotificationDrawer.tsx は無改修で動作**
  - 未ログイン/未設定時は空表示（落ちない）
- **配信トリガー（サーバー・冪等）**（`app/lib/eventAutomation.ts`）
  - **OPEN通知**: イベントが成立して `live` に遷移したら、予約者全員へ配信（dedupe `open:<id>`）
  - **開催通知**: 開始 `REMIND_WINDOW_MIN`(=60)分前〜開始までに予約者へ1回配信（dedupe `reminder:<id>`）
  - service_role で RLS バイパス、`upsert(onConflict, ignoreDuplicates)` で重複防止
- **順番通知（クライアント）**（`waiting/page.tsx`）
  - 整理券の順番が来たら（signal受信時）通知履歴に1回記録

検証: `npx tsc --noEmit` ✅ / `npm run build` ✅（全24ルート）/ 変更ファイル eslint クリーン

---

### ✅ メール通知（Resend）（完了・要環境変数）★追加実装★
in-app通知の作成を契機に、予約者へメールも届くようにした。
- `app/lib/notify/email.ts` — Resend REST APIを fetch で叩く送信ヘルパー（npm依存なし）
  - `RESEND_API_KEY` / `RESEND_FROM` 未設定なら送信スキップ（in-app通知は動く）
  - `buildNotificationEmail()` でHTMLメール本文（イベントへのリンク付き）を生成
- `eventAutomation.ts` の配信に統合
  - upsert(`ignoreDuplicates`)の `.select()` が返す**新規挿入分の受信者だけ**にメール送信
    → 同じ人への二重送信を防止（in-app と同じ冪等境界）
  - profiles からメールアドレスを引き、Resend へ最大50宛先/リクエストで分割送信
  - 送信失敗は自動進行を止めずログのみ（Promise.allSettled）
- 対象: OPEN通知 / 開催通知（サーバー発火）。順番通知はin-appのみ（クライアント発火のため）

---

### ✅ 商品データの本接続（完了・要 0004 SQL）★追加実装★
出店者の商品が events.ts の静的マスタ依存だったのを、products テーブルへ本接続した。
**DB優先・無ければ静的マスタにフォールバック**するため、products 未投入でも従来通り表示される。
- マイグレーション `0004_products_stock.sql` — products に `stock`(在庫) 列を追加（null=管理しない）
- `Product` 型を拡張: `soldOut?` / `stock?`
- `app/lib/supabaseStore.ts` に商品レイヤを追加
  - `getSellerProducts(shopId)`（DB優先＋静的フォールバック）/ `getSellerPickupProducts`(目玉5点)
  - `createProduct / updateProduct / deleteProduct / setProductSoldOut`
  - products をキャッシュ＋Realtime購読（SOLD OUT が全画面に即反映）
- 表示3ページ（event詳細 / seller profile / favorites）を DB優先表示に切替
- 購入者チャット（buyer page）: DB商品を読み、購入時に **SOLD OUT を DB 永続化**
- 出店者ダッシュボードの「商品管理」タブ: ハードコード廃止 → **実CRUD UI**
  （追加 / 編集 / 削除 / SOLD OUT切替 / 在庫編集）
- 担当ショップ解決: `profiles.shop_id`(本番) → `PROFILE_TO_SHOP`(デモ対応表) → 既定 'mina-craft'
  - `AuthProvider` に `shopId` を追加（`select('*')` なので 0002 未適用でも安全）

---

### ✅ 商品画像の Storage 化（完了・要 0005 SQL + バケット）★追加実装★
商品はアイコンのみだったのを、画像アップロードに対応。
- マイグレーション `0005_products_image.sql` — products に `image_url` 列
- Storageアップローダを汎用化（`uploadImage(bucket,...)`）し、`uploadProductImage` を追加
  （バケット `product-images`・未作成ならアイコン表示にフォールバック）
- 出店者の商品管理フォームに画像アップロード（プレビュー / 画像削除）を追加
- 表示は `Product.imageUrl` 優先・無ければアイコン。共通部品 `components/ProductThumb.tsx`
  を全商品表示（管理UI / 購入者チャット / イベント詳細 / 出店者プロフィール / お気に入り）に適用

---

## ⏳ 未着手・次にやるべきこと（優先順）

### 🥇 高優先
```
1. LINE通知（メールは実装済 → LINE Messaging API へ）※今回スコープ外指定

2. プロフィール画像（avatars）の Storage 化
   - uploadImage を流用しやすい。バケット: avatars
   - mypage / プロフィール編集に画像アップロードを追加

3. 商品マスタ（sellers）のDB化
   - 商品は products に本接続済だが、ショップ情報(name/region/tags等)はまだ events.ts 静的
   - getSellerById を sellers テーブル読みに（PROFILE_TO_SHOP 依存の縮小）
```

### 🥈 通常
```
4. 整理券キューのサーバー化（現状 waiting は局所シミュレーション）
5. 在庫数の自動減算（購入確定で stock を減らす）
6. 出店料1,200円の支払い確認フロー
7. 分析ダッシュボード（実データ集計）
8. LINE/Googleログイン（ボタンはあるが未実装）
9. 商品公開仕様の厳密化（開催前=目玉5点/開催中=全/終了後=非公開）
```

### 🥈 通常
```
4. 整理券キューのサーバー化（現状 waiting は局所シミュレーション）
   - active_sessions を基に「現在接客中/待機順」を実データ化し、順番通知をサーバー駆動に
5. 出店料1,200円の支払い確認フロー（運営は決済を持たない方針は維持）
6. 分析ダッシュボード（実データ集計）
7. LINE/Googleログイン（ボタンはあるが未実装）
8. 商品公開仕様の厳密化（開催前=目玉5点/開催中=全/終了後=非公開）
```

---

## 🏗️ 技術スタック

```
Framework:    Next.js 16.2.6 (App Router, Turbopack)
React:        19.2.4 / TypeScript 5 / Tailwind CSS 4
データ:       Supabase (PostgreSQL + Auth + Realtime + Storage)
自動化:       Vercel Cron (*/5) → /api/cron/event-automation（成立判定+通知配信）
デプロイ:     Vercel (auto-deploy from main / ※Overdue要確認)
```

---

## 📁 重要ファイル（今回追加・変更分）

```
furima/
├── supabase/migrations/
│   ├── 0002_production_rls.sql        # notifications own-rows ポリシー追記
│   └── 0003_notifications.sql         # 🆕 通知テーブル+Realtime+dev RLS（要実行）
├── supabase/migrations/
│   ├── 0002_production_rls.sql        # notifications own-rows ポリシー追記
│   ├── 0003_notifications.sql         # 🆕 通知テーブル+Realtime+dev RLS（要実行）
│   └── 0004_products_stock.sql        # 🆕 products に stock 列追加（要実行）
├── app/
│   ├── components/
│   │   ├── NotificationContext.tsx    # 🔁 Supabase連携+Realtimeに刷新
│   │   └── AuthProvider.tsx           # shopId(担当ショップ)を追加
│   ├── lib/
│   │   ├── notify/email.ts            # Resendメール送信(server-only・依存なし)
│   │   ├── events.ts                  # Product型に soldOut?/stock? を追加
│   │   ├── supabaseStore.ts           # 通知CRUD+購読 / 商品CRUD+DB優先表示 を追加
│   │   └── eventAutomation.ts         # OPEN/開催通知の冪等配信 + 新規分のみメール送信
│   ├── seller/page.tsx                # 商品管理タブを実CRUD UIに（ProductManager）
│   ├── seller/[id]/page.tsx           # 商品をDB優先表示
│   ├── favorites/page.tsx             # 商品をDB優先表示
│   └── event/[id]/page.tsx + .../seller/[sellerId]/page.tsx  # 目玉/商品をDB優先・SOLD OUT永続化
```

---

## 🔑 supabaseStore.ts 通知関数（今回追加）

```
fetchNotifications(userId)                          直近100件
createNotification({userId,type,title,message,...,dedupeKey?})  自己宛て作成(冪等可)
markNotificationRead(id) / markAllNotificationsRead(userId)
deleteNotification(id) / clearNotifications(userId)
subscribeToNotifications(userId, onChange)          Realtime購読(自分宛て)
型: AppNotification / AppNotificationType('open'|'event_start'|'turn'|'follow'|'like'|'info')
```

---

## 📜 守るべき元仕様（変更しない）
```
1. 運営は決済を持たない（商品代金は出店者⇔購入者で直接）
2. 出店料は1,200円（銀行振込/PayPay）
3. 開催成立条件: 3名予約 AND 3アカウントのチャット ← 自動判定+通知配信済
4. 接客は1対1（整理券方式・デフォルト10分・管理者変更可）
5. 商品公開: 開催前=目玉5点 / 開催中=全商品 / 開催後=非公開
6. 複数出店者時の順序制御（購入者は同時1セッションのみ）
7. 取引履歴（終了後閲覧 + chatOpenなら期限なし継続会話）
8. 相互評価（1-5星 + コメント）
9. イベントの正は admin_events（ID=evt-xxx）に統一
```

---

## 🐛 既知の注意点
```
1. 通知は 0003_notifications.sql の実行が前提（未実行だとベルが常に空）
2. OPEN通知/開催通知は Cron 経由 → CRON_SECRET と SUPABASE_SERVICE_ROLE_KEY 必須
3. 整理券の待機ページは依然ローカルシミュレーション（順番通知は記録のみ・本命は次項4）
4. デモユーザー（admin-1 等）はAuth情報なし → ログインは新規登録アカウントで
5. 出店者の商品はまだ events.ts 静的マスタ依存
6. 開発用RLS（dev_all=anon全許可）がまだ有効。本番は 0002 を適用
7. GitHubトークンは毎回平文で渡される → 使用後は必ず revoke
```

---

**最後に**:
元仕様の3通知（OPEN/開催/順番）が「実際に届く」土台ができました。
in-app通知は Realtime で複数端末同期します。次は **LINE/メールの外部配信** と
**商品データの本接続** が本命です。ただし上記🔴の運営側手作業
（特に **0003 のSQL実行** と **Vercel環境変数**）が動作の前提です。

🎉 お疲れさまでした！
