# 🔄 フリマライブ プロジェクト 引き継ぎ書 #7

**最終更新**: 2026-05-30
**プロジェクト**: オンライン接客型フリマイベントサイト
**GitHub**: https://github.com/getegeteakete/furima.git
**本番URL**: https://furima.vercel.app/
**Supabase**: https://cccspbtjseallretqguz.supabase.co

> この #7 が最新の引き継ぎです。#1〜#6 は履歴として残置。
> #6 以降の差分（整理券の自動done連携・売れ筋分析・出店者ダッシュボード配線・
> 本番RLS追補 0009）を反映済み。

---

## 🚨 最初に貼り付けるプロンプト（コピペ用）

```
フリマライブ（オンライン接客型フリマイベントサイト）の開発を継続します。
GitHubリポジトリ: https://github.com/getegeteakete/furima.git
本番URL: https://furima.vercel.app/
Supabase: 接続済み（URL: https://cccspbtjseallretqguz.supabase.co）

前回までの進捗は引き継ぎ書（HANDOFF_7.md）に記載しています。
内容を確認してから作業を開始してください。

【次にやりたいこと】
（ここに具体的な要望を書く）
```

**※ GitHub Push 用トークンは別途チャットで直接お渡しします**
（Fine-grained / Contents: Read and write。使用後は必ず revoke）

---

## ⭐ #7 で新しく入れたもの（今回の差分）

### 1. 整理券キューの自動 done 連携（接客終了で行列を解放）
- データ層に追加: `completeQueueTicket(eventId, sellerId, buyerId)` /
  `endServingTicket(eventId, sellerId)`（`app/lib/supabaseStore.ts`）。
- 購入者チャット（`event/[id]/seller/[sellerId]/page.tsx`）で、
  **手動終了・タイムアウト・離脱(アンマウント)** のいずれでも自分の整理券を
  自動 done 化して行列を解放。これまで `serving` が残り続けていた問題を解消。
  - 併せて `startSession`/`endSession` がモックID(`CURRENT_MOCK_BUYER_ID`)を
    使っていた不整合を **実 `buyerId`** に統一（認証解決のタイミング差は ref で吸収）。
- 出店者コンソール（`console/page.tsx`）に **「接客終了」ボタン** を追加
  （接客中のときだけ表示）。待機者が居なくても接客を綺麗に締められる。

### 2. 管理画面「売れ筋・分析」ページ（新規）
- `app/admin/analytics/page.tsx` を新設。取引履歴(transactions)から集計:
  - **売れ筋商品ランキング**（商品×出店者で件数・金額、販売数の多い順 TOP10）
  - **出店者ランキング（流通額）**（出店者ごとの流通額・販売点数 TOP10）
  - KPI: 販売件数 / 流通額(参考) / 購入ユーザー数 / 販売商品種
- 管理ナビ（`app/admin/layout.tsx`）に「売れ筋・分析」を追加。
- ⚠️ 金額は **運営は決済を持たない** ため取引記録の参考値である旨を明記。

### 3. 出店者ダッシュボードの非機能ボタン配線
- ヘッダー「新規イベント」→ `/events`（イベントを探す）に変更。
- 「予定中のイベント すべて見る」→ `/events`。
- クイックアクション4つを配線:
  - 新規商品登録 → 商品管理タブを開き **新規フォームを自動展開**（signal経由）
  - イベント管理 → イベント管理タブ
  - 在庫確認 → 商品管理タブ
  - 売上レポート → 売上分析タブ

### 4. 本番RLS追補 `supabase/migrations/0009_production_rls_extra.sql`（新規）
- 0002 適用後も dev_all のままだった領域を本番ポリシーへ締める:
  - **queue_tickets**: 当事者(購入者本人/担当ショップ/スタッフ)+予約済み購入者の
    READ、本人 INSERT(waiting)、本人/ショップ/スタッフ UPDATE、スタッフ DELETE。
    （自己参照RLS無限再帰を避け、参加者判定は buyer_reservations で行う）
  - **seller_applications の fee 申告**: 本人 UPDATE を許可しつつ、BEFORE UPDATE
    トリガー `guard_seller_application_update()` で非スタッフは fee_* 以外の列
    （status 等）を旧値強制 → 自己承認の偽装を防止。
  - **Storage**: avatars/product-images/chat-images バケットを public で作成し、
    avatars=本人フォルダ / product-images=担当ショップ or スタッフ / chat-images=
    認証済み の書込ポリシーを付与。
- ⚠️ **0002 の後に適用**すること（ヘルパー関数 is_staff/owns_shop に依存）。

---

## 🔴 最優先：運営側でしか対応できない手作業（コードは完了済み）

### ① Supabase SQL Editor で `supabase/SETUP_ALL.sql` を Run（最重要・冪等）
- 0001〜0008 + seed を統合。貼り付けて Run するだけ（何度でも安全）。
- ※ 出店料の振込先列(fee_bank_info / fee_paypay_id)は SETUP_ALL に反映済み。
  既に SETUP_ALL を流した本番に追加だけしたい場合は
  `supabase/migrations/0010_chat_settings_fee_payout.sql` を Run（冪等）。
- ※ アクセス数(PV)用 `page_views` テーブルも SETUP_ALL に反映済み。
  既存本番へ追加だけなら `supabase/migrations/0011_page_views.sql` を Run（冪等）。

### ② Supabase Storage に public バケットを3つ作成
- `chat-images` / `product-images` / `avatars`（New bucket → **Public**）。
- ※ 本番RLS(0009)を流すと `storage.buckets` への upsert で自動作成も試みるが、
  ダッシュボードでの事前作成が確実。

### ③ Vercel 環境変数
- 必須: `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`,
  既存 `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- 任意(メール): `RESEND_API_KEY`, `RESEND_FROM`, `NEXT_PUBLIC_SITE_URL`

### ④ Vercel の Overdue（未払い）を解決 → Redeploy

### ⑤ 本番RLSの厳格化（認証が安定してから）
- `supabase/migrations/0002_production_rls.sql` を実行（dev_all → 認証ベース）。
- 続けて **`supabase/migrations/0009_production_rls_extra.sql`** を実行
  （queue_tickets / fee申告 / Storage を本番ポリシーに締める）。
- 適用前に各出店者の `profiles.shop_id` 設定と、自分の `role='admin'` 設定を忘れずに。

### 🔐 セキュリティ
- GitHubトークンは毎回チャットに平文 → **使用後は必ず revoke**。

---

## ✅ これまでに完成している主な機能（累積）

- Supabase 本接続（DB+Auth+Realtime+Storage）。データ層 `app/lib/supabaseStore.ts`
- 認証 / イベントID統一(admin_events=正) / 開催成立判定の自動化(Cron */5)
- 接客チャット Realtime化（全体+個別1対1・出店者コンソール）
- 整理券キューのサーバー化（#6）＋ **接客終了で自動 done 解放（#7）**
- 取引履歴+継続会話(chatOpen)+相互評価
- 通知の実データ化+Realtime化（OPEN/開催/順番）/ メール通知(Resend)
- 商品DB接続+画像Storage化+公開フェーズ厳密化+在庫自動減算
- プロフィール画像Storage化 / ショップ情報DB化 / 出店料1,200円フロー
- 出店者分析ダッシュボード（実データ）/ **管理 売れ筋・分析（#7）**

---

## ⏳ 未着手・次にやるべきこと（優先順）

```
1. LINE通知 / LINE・Googleログイン … ★ユーザー指定でスコープ外★（当面やらない）
2. 整理券: callNextInQueue の前 serving done と endServingTicket の役割整理
   （#7 で接客終了ボタンを追加済。運用で重複しないか本番で確認）
3. PVの本番RLS締め（現状 dev_all。0011 末尾コメントの pv_insert_any /
   pv_select_staff に差し替えると INSERT全員可・SELECTスタッフのみになる）
```

> ✅ #7 で「参加申請UI導線」「振込先表示」「アクセス数(PV)解析」を実装済み。

### 7. アクセス数（PV）解析（#7 で実装）
- 自前の軽量トラッキング。個人特定情報は持たず、匿名セッションID(sessionStorage)
  とパスのみ記録。
- DB: `supabase/migrations/0011_page_views.sql`（新規）＋ SETUP_ALL.sql に反映。
  page_views(path, session_id, viewed_at)。dev_all（本番締めは 0011 末尾コメント）。
- 記録: `app/components/PageViewTracker.tsx` を ClientWrapper に常設。
  usePathname のパス変化ごとに `recordPageView()` を fire-and-forget で実行。
- 集計: `getPageViewStats(days=14)` → 総PV / ユニークセッション / 日別推移 / 人気ページ。
- 表示: `/admin/analytics` 下部に「アクセス解析」セクション（KPI＋日別バー＋人気ページTOP10）。

### 6. 出店料の振込先表示（#7 で実装）
- 運営がチャット設定（/admin/chat-settings）で **出店料(¥1,200)の振込先**
  （銀行振込先テキスト / PayPay送金先）を登録できるようにした。
- 出店者の支払い申告パネル（/seller 「イベント管理」タブ）で、選択中の支払い方式
  （銀行 or PayPay）に応じた振込先を表示してから申告できる。
- データ層: `ChatSettings` に `feeBankInfo` / `feePaypayId` を追加。
  hydrate / updateChatSettings(patch) に列マッピングを追加。
- DB: `supabase/migrations/0010_chat_settings_fee_payout.sql`（新規・冪等）で
  chat_settings に fee_bank_info / fee_paypay_id 列を追加。SETUP_ALL.sql にも反映済み。
- ⚠️ **商品代金は引き続き運営が持たない**。本機能が保持するのは出店料の受取先のみ。

### 5. 出店者→イベント参加申請のUI導線（#7 後半で実装）
- `app/event/[id]/page.tsx` に、出店者ロールでログイン中 & 開催前(upcoming)の
  ときだけ「出店を申請する」CTA を追加。
- 状態に応じて出し分け: 未申請=申請ボタン / pending=承認待ち / approved=承認済み /
  rejected=非承認 / 定員到達=募集終了。
- データ層に `getSellerApplicationStatus(eventId, sellerId)` を追加
  （申請status + 定員full を返す。`applyAsSeller` は既存を使用）。
- ⚠️ 申請の seller_id は profiles.id 系（例 'seller-mina'）。本番RLS apps_insert_self
  が seller_id = auth.uid() を要求するため、CTA は profile.id で申請する。

---

## 🏗️ 技術スタック / 主要ファイル

```
Next.js 16.2.6 (App Router) / React 19 / TS5 / Tailwind 4 / Supabase / Vercel Cron(*/5)

app/lib/supabaseStore.ts      # データ層（読取=同期キャッシュ / 書込=楽観+永続 / Realtime）
  ★ completeQueueTicket / endServingTicket（#7）
app/admin/analytics/page.tsx  # ★売れ筋・分析（#7・新規）
app/admin/layout.tsx          # ナビに「売れ筋・分析」追加（#7）
app/seller/page.tsx           # ダッシュボード（クイックアクション配線済・#7）
app/event/[id]/seller/[sellerId]/page.tsx          # 購入者チャット（終了で整理券done・#7）
app/event/[id]/seller/[sellerId]/console/page.tsx  # 出店者コンソール（接客終了ボタン・#7）
supabase/migrations/0009_production_rls_extra.sql  # ★本番RLS追補（#7・新規）
supabase/SETUP_ALL.sql        # 1本Runで本番DB構築（0001〜0008+seed・dev_all）
supabase/migrations/0002_production_rls.sql        # 本番RLS本体（0009より先に適用）
```

---

## 📜 守るべき元仕様（変更しない）

```
1. 運営は決済を持たない（商品代金は出店者⇔購入者で直接）
   ※ 出店料1,200円だけは運営⇔出店者（申告→入金確認フロー実装済）
   ※ 売れ筋・分析の金額は「取引記録の参考値」であり運営が金銭を保持するものではない
2. 開催成立条件: 3名予約 AND 3アカウントのチャット ← 自動判定+通知配信済
3. 接客は1対1（整理券方式・デフォルト10分・管理者変更可）
4. 商品公開: 開催前=目玉5点 / 開催中=全商品 / 開催後=非公開
5. 複数出店者時の順序制御（購入者は同時1セッションのみ）
6. 取引履歴（終了後閲覧 + chatOpenなら期限なし継続会話）/ 相互評価
7. イベントの正は admin_events（ID=evt-xxx）に統一
```

---

## 🐛 既知の注意点

```
1. 上記🔴の手作業（SETUP_ALL/バケット3つ/環境変数/課金）が未了だと該当機能が動かない
2. 0009 は 0002 の後に適用（is_staff/owns_shop に依存）。順序を守ること。
3. メールは RESEND_API_KEY/RESEND_FROM 未設定なら送信スキップ（in-app通知は動く）
4. 売れ筋・分析は getTransactions() ベース。取引は7日(chatOpenなら延長)で purge される
   ため、長期の累積売上集計には別途アーカイブ設計が必要（現状は直近の参考集計）。
5. 開発用RLS(dev_all)は SETUP_ALL に残置。本番は 0002 → 0009 の順で締める。
6. GitHubトークンは毎回平文で渡される → 使用後は必ず revoke
```

---

## 🚀 開発フロー

```bash
git clone https://github.com/getegeteakete/furima.git
cd furima && npm install
# .env.local（ローカル開発時のみ）に SUPABASE_URL / ANON_KEY を設定
npm run dev
npx tsc --noEmit    # 型（必須）
npm run build       # 検証（20/20 緑が基準）

# push（トークンはチャットで別途受領・インラインURLで使い捨て）
git add -A && git commit -m "feat: ..."
git push "https://x-access-token:[TOKEN]@github.com/getegeteakete/furima.git" main
# 終わったらトークンを revoke
```

🎉 #7 で整理券の解放・売れ筋分析・ダッシュボード配線・本番RLS追補まで完了。
残りはスコープ外のLINE系を除けば、出店申請UI導線 / PV解析 / 振込先表示など。
