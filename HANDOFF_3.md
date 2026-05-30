# 🔄 フリマライブ プロジェクト 引き継ぎ書 #3

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

前回までの進捗は引き継ぎ書（HANDOFF_3.md）に記載しています。
内容を確認してから作業を開始してください。

【次にやりたいこと】
（ここに具体的な要望を書く）
```

**※ GitHub Push 用トークンは別途チャットで直接お渡しします**
（Fine-grained / Contents: Read and write。使用後は必ず revoke）

---

## 🔴 最優先：運営側でしか対応できない手作業（コード側は完了済み）

### ① Supabase で seed.sql を再実行（イベントID統一後の正データ投入）
- `supabase/seed.sql` を SQL Editor で実行（冪等・何度でもOK）
- 既存 evt-001 が recruiting で残っている場合は status が live に更新されないので、
  必要なら: `update public.admin_events set status='live' where id='evt-001';`

### ② Supabase Storage に public バケット 'chat-images' を作成
- Storage → New bucket → 名前 `chat-images` / Public にチェック
- これが無いとチャット画像アップロードが失敗（dataURLフォールバックはする）

### ③ Vercel 環境変数を追加（自動化に必須）
- `SUPABASE_SERVICE_ROLE_KEY`（Supabase Settings→API の service_role）
- `CRON_SECRET`（任意の長いランダム文字列。Cron認可用）
- 既存: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### ④ Vercel の Overdue（未払い）解決（未解決なら自動デプロイ・Cronが動かない）
- Settings → Billing で支払い／カード更新 → 最新コミットを Redeploy

### ⑤ 本番RLS適用（公開を厳密化するなら・認証が安定してから）
- 出店者アカウント作成 → profiles.shop_id 設定 → 自分を admin に
- `supabase/migrations/0002_production_rls.sql` を実行（末尾チェックリスト参照）

---

## 📊 今回のセッション（HANDOFF_2→3）でやったこと（全push済み）

| コミット | 内容 |
|----------|------|
| `caaeb1d` | 接客チャットのRealtime化 + 出店者ライブ接客コンソール + 本番RLS修正 |
| `98b4852` | **イベントID体系を admin_events に統一** + 開催成立判定の実装 |
| `d6fa4fb` | **開催成立判定の自動化（Vercel Cron）** + 来場予約の実記録 |
| `ff0b563` | チャット画像を Supabase Storage に移行 |

### ✅ 接客チャットのRealtime化（完了）
- 偽の自動返信を撤去。messages テーブル + Realtime で実際に双方向チャット
- 出店者ライブ接客コンソール `/event/[id]/seller/[sellerId]/console` を新規追加
  - 全体/個別タブ・未読バッジ・seller/admin/event_manager 権限ガード
- 購入者ページの送信→DB保存→両者にRealtime反映

### ✅ イベントID体系の統一（完了・実稼働の土台）
- 以前: 公開/ライブ=静的 timeSlotEvents(`2000-shiga`) / 管理=admin_events(`evt-001`) で分裂
- 現在: **admin_events を唯一の正**に統一。全公開/ライブ画面が getPublicEvents()/
  getPublicEventById() で admin_events を読む
- 予約・チャット・セッションがすべて同一ID(`evt-xxx`)で繋がる
- profile.id↔shop.id の対応表を events.ts の PROFILE_TO_SHOP に一元化
- timeSlotEvents は deprecated（出店者/商品マスタの参照のみ残置）
- ホームの壊れたイベントリンク(slug=shopId)を eventId に修正

### ✅ 開催成立判定 + 自動化（完了）
- 成立条件（元仕様③）= 3名予約 AND 3アカウントのチャット
- 管理イベント詳細に成立条件パネル + 未達時OPENの確認ダイアログ
- **Vercel Cron（5分毎）で自動進行**: app/api/cron/event-automation
  - 開始時刻到来 & 成立 → 自動 live / 終了時刻到来 → 自動 ended
  - app/lib/eventAutomation.ts（エンジン）/ app/lib/supabase/admin.ts（service_role）
- **来場予約の実記録**（重大バグ修正）: waiting ページが予約をDB保存していなかった
  → reserveAsBuyer を呼ぶよう修正。これで成立判定の予約数が実際に増える

### ✅ チャット画像 → Storage（完了・要バケット作成）
- dataURL を chat-images バケットへアップロード→公開URLを messages.images に格納
- DB行肥大化・5MB制限・性能/コストを解消

---

## ⏳ 未着手・次にやるべきこと（優先順）

### 🥇 高優先
```
1. 通知（OPEN通知・順番通知・開催通知）
   - 元仕様: 開催通知/OPEN通知/順番通知。現状 NotificationContext はUI内のみ
   - まず in-app 通知をRealtime化、その後 LINE/メール（Edge Function or Resend）

2. 商品画像・プロフィール画像も Storage へ（chat-images と同パターン）
   - バケット: product-images, avatars

3. 商品データの本接続
   - 現状 products テーブルはseed投入済みだが、出店者の商品は events.ts 静的マスタ依存
   - 商品登録/在庫/SOLD OUT を products テーブル経由に
```

### 🥈 通常
```
4. 出店料1,200円の支払い確認フロー（運営は決済を持たない方針は維持）
5. 分析ダッシュボード（実データ集計）
6. LINE/Googleログイン（ボタンはあるが未実装）
7. 商品公開仕様の厳密化（開催前=目玉5点/開催中=全/終了後=非公開）
```

---

## 🏗️ 技術スタック

```
Framework:    Next.js 16.2.6 (App Router, Turbopack)
React:        19.2.4 / TypeScript 5 / Tailwind CSS 4
データ:       Supabase (PostgreSQL + Auth + Realtime + Storage)
              @supabase/supabase-js 2.106.2 / @supabase/ssr 0.10.3
自動化:       Vercel Cron (*/5) → /api/cron/event-automation
デプロイ:     Vercel (auto-deploy from main / ※Overdue要確認)
```

---

## 📁 重要ファイル（今回追加・変更分）

```
furima/
├── vercel.json                        # crons 追加（5分毎）
├── supabase/
│   ├── migrations/0002_production_rls.sql  # shop_id/owns_shop で修正済（未適用）
│   └── seed.sql                       # admin_events 5件に拡充（再実行推奨）
├── app/
│   ├── api/cron/event-automation/route.ts  # 🔑 自動進行エンドポイント
│   ├── lib/
│   │   ├── eventAutomation.ts         # 🔑 成立判定+自動遷移エンジン
│   │   ├── supabase/admin.ts          # service_role クライアント(server-only)
│   │   ├── supabaseStore.ts           # PublicEvent合成/Realtimeチャット/Storage/成立判定
│   │   └── events.ts                  # PROFILE_TO_SHOP 対応表・getPublicEvent*
│   └── event/[id]/seller/[sellerId]/
│       ├── page.tsx                   # 購入者チャット（Realtime+Storage画像）
│       ├── console/page.tsx           # 🔑 出店者ライブ接客コンソール
│       └── waiting/page.tsx           # 予約をDB記録するよう修正
```

---

## 🔑 supabaseStore.ts 主要関数（今回追加分）

```
公開イベント（admin_events合成）:
  getPublicEvents / getPublicEventById  ← 公開/ライブ画面はこれを使う

成立判定:
  checkOpenEligibility / getChatAccountCount / OPEN_THRESHOLD

Realtimeチャット:
  fetchRoomMessages / sendChatMessage / subscribeToRoom
  fetchSellerRoomBuyers / subscribeToSellerPrivate

Storage:
  uploadChatImage / uploadChatImages
```

---

## 📜 守るべき元仕様（変更しない）

```
1. 運営は決済を持たない（商品代金は出店者⇔購入者で直接）
2. 出店料は1,200円（出店者が運営に支払い・銀行振込/PayPay）
3. 開催成立条件: 3名以上の予約 AND 3アカウント以上のチャット発生 ← 自動判定実装済
4. 接客は1対1（整理券方式・デフォルト10分・管理者変更可）
5. 商品公開: 開催前=目玉5点 / 開催中=全商品 / 開催後=非公開

追加実装済みの方針:
6. 複数出店者時の順序制御（購入者は同時1セッションのみ）
7. 取引履歴（イベント終了後の閲覧 + 継続会話=chatOpenなら期限なし）
8. 相互評価（1-5星 + コメント）
9. イベントの正は admin_events（ID=evt-xxx）に統一
```

---

## 🐛 既知の注意点

```
1. デモユーザー（admin-1, buyer-1, seller-mina 等）はAuth情報を持たない表示用データ
   → ログインは新規登録したアカウントで

2. 自動化は CRON_SECRET と SUPABASE_SERVICE_ROLE_KEY が無いと動かない（401/500）
   → Vercel 環境変数に登録すること

3. チャット画像は chat-images バケットが無いとアップロード失敗（dataURLにフォールバック）

4. 出店者の商品はまだ events.ts 静的マスタ依存（products テーブルは未接続）

5. 開発用RLS（dev_all=anon全許可）がまだ有効。本番は 0002 を適用

6. GitHubトークンは毎回平文で渡されている → 使用後は必ず revoke
```

---

**最後に**:
チャットRealtime化・イベントID統一・成立判定の自動化・画像のStorage化まで完了し、
「お客が予約→チャット→3アカウント集まれば自動OPEN→接客→取引」の一連が実データで回る
土台ができました。残る本命は **通知（OPEN/順番/開催）** と **商品データの本接続** です。
ただし上記🔴の運営側手作業（seed再実行・バケット作成・環境変数・課金）が前提です。

🎉 お疲れさまでした！
