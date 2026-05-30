# 🚀 本番を「完璧に稼働」させる手順（運営作業・約10分）

コードは実装・ビルド済みです。実際に動くまでに**ダッシュボードでの手作業**が
いくつか必要です。上から順にこなせば完了します。所要時間の目安付き。

> 📌 前提: GitHub は push 済み。あとは Supabase と Vercel の設定だけ。

---

## ① Supabase: SQL を1ファイル実行（約2分）★最重要★

1. Supabase ダッシュボード → 左メニュー **SQL Editor** → **New query**
2. リポジトリの **`supabase/SETUP_ALL.sql`** を全文コピー＆ペースト
3. **Run** をクリック

これでテーブル・通知・在庫/画像カラム・Realtime・初期データが一括で入ります。
何度実行しても安全（冪等）です。

**確認**: 左メニュー Table Editor に `profiles / sellers / products / admin_events /
notifications / messages / transactions …` が並んでいればOK。

---

## ② Supabase: Storage バケットを2つ作成（約1分）

左メニュー **Storage** → **New bucket** を2回:

| バケット名 | 設定 | 用途 |
|---|---|---|
| `chat-images` | **Public にチェック** | チャット添付画像 |
| `product-images` | **Public にチェック** | 商品画像 |

※ 未作成でも落ちません（dataURL / アイコン表示にフォールバック）が、
作成すると画像が正しく公開URLで保存されます。

---

## ③ Vercel: 環境変数を設定（約3分）

Vercel → プロジェクト **furima** → **Settings → Environment Variables**

**必須**（通知の自動配信に使用）:
| Key | 値 |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → **service_role** key |
| `CRON_SECRET` | 任意の長いランダム文字列（例: `openssl rand -hex 32` の出力） |

**既存（確認）**: `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**任意**（メール通知を使うなら）:
| Key | 値 |
|---|---|
| `RESEND_API_KEY` | Resend の API キー |
| `RESEND_FROM` | 例 `フリマライブ <noreply@検証済みドメイン>` |
| `NEXT_PUBLIC_SITE_URL` | `https://furima.vercel.app`（未設定でも既定値あり） |

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` と `CRON_SECRET` が無いと Cron が 401/500 になり、
> **OPEN通知・開催通知が一切配信されません**。

設定後は **Deployments → 最新コミットを Redeploy**（環境変数を反映させるため）。

---

## ④ Vercel: 課金（Overdue）を解決（未払いがある場合）

Settings → **Billing** に「Overdue（未払い）」表示があれば支払い／カード更新。
未解決だと**自動デプロイも Cron も動きません**。解決後に再 Redeploy。

---

## ⑤（任意・後回しでOK）本番RLSの厳格化

公開を本番レベルで締めるときだけ。認証フローが安定してから:
1. 出店者アカウント作成 → `profiles.shop_id` を設定 → 自分を `admin` に
2. `supabase/migrations/0002_production_rls.sql` を SQL Editor で実行
（ファイル末尾のチェックリスト参照）

---

## ✅ 動作確認（①〜③のあと）

1. https://furima.vercel.app/ を開く → トップ表示
2. `/register` で購入者アカウントを新規登録 → ログイン
   - ※ デモユーザー(admin-1 等)はAuth情報なし。**新規登録アカウントで**ログイン
3. `/events` → 開催前イベントを開く → **目玉商品のみ**表示・COMING SOON
4. 出店者アカウントを別途作成 → `/seller` で商品登録・在庫/SOLD OUT編集が保存される
5. イベントを `live` にする（管理 or Cronの成立判定）→ チャット画面で**全商品**公開
6. 通知ベルに OPEN/開催通知が届く（Cron実行 or 手動トリガ後）

---

## 🔐 セキュリティ（毎回）

- GitHub トークンは**チャットに平文で渡している** → 作業後は**必ず revoke**
  （GitHub → Settings → Developer settings → Fine-grained tokens → 削除）
- 次回 push が必要になったら、その都度新規発行して使い捨てに。

---

困ったら: `HANDOFF_5.md`（直近の全体像）／ `HANDOFF_4.md`（実装メモ）を参照。
