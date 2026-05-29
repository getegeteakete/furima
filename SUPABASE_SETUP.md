# 🚀 Supabase セットアップ手順（フリマライブ）

このドキュメントの通りに進めれば、localStorage モックから Supabase バックエンドへ移行できます。
**コード側の足場は実装済み**なので、残りは「ダッシュボード操作」と「差し替え 2 ステップ」だけです。

---

## 📦 今回追加したファイル

```
supabase/
├── migrations/
│   ├── 0001_init.sql            # テーブル・索引・Realtime・開発用RLS
│   └── 0002_production_rls.sql  # 本番用RLS（認証導入後に適用）
└── seed.sql                     # 店舗/商品/ユーザー/イベント/デモ取引の初期データ

app/lib/supabase/
├── client.ts                    # ブラウザ用クライアント
└── server.ts                    # サーバー用クライアント

app/lib/supabaseStore.ts         # mockStore と同一APIの Supabase 版データ層
app/components/StoreProvider.tsx # 起動時ハイドレート + Realtime購読
middleware.ts                    # 認証セッション自動更新
.env.local.example               # 環境変数テンプレ
```

依存パッケージ `@supabase/supabase-js` と `@supabase/ssr` は `package.json` に追加済みです。

---

## STEP 1 — Supabase プロジェクト作成（ダッシュボード）

1. https://supabase.com にサインイン（GitHub アカウントでOK）
2. **New project** → 組織を選択
3. 入力:
   - **Name**: `furima`
   - **Database Password**: 強力なものを生成して**控える**（後で使う可能性あり）
   - **Region**: `Northeast Asia (Tokyo)` を推奨（日本ユーザー向け）
4. **Create new project** → 1〜2分で起動

---

## STEP 2 — APIキーを取得して .env.local を作る

1. ダッシュボード左下 ⚙️ **Project Settings → API**
2. 以下をコピー:
   - **Project URL**
   - **anon public** key
   - **service_role** key（秘密。サーバー専用）
3. ローカルで:

```bash
cp .env.local.example .env.local
```

`.env.local` に貼り付け:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
SUPABASE_SERVICE_ROLE_KEY=eyJhb...
```

> `.env.local` は `.gitignore` 済み（Git に乗りません）。

---

## STEP 3 — スキーマとシードを流す

ダッシュボード左 **SQL Editor → New query** で、以下を**この順番**で実行:

1. `supabase/migrations/0001_init.sql` の中身を貼り付け → **Run**
2. `supabase/seed.sql` の中身を貼り付け → **Run**

**Table Editor** に `profiles` / `sellers` / `products` / `admin_events` …
が並び、店舗5件・商品30件・デモ取引1件が入っていれば成功です。

> ⚠️ この時点の RLS は**開発用（anonフルアクセス）**です。一般公開前に必ず STEP 7 を行ってください。

---

## STEP 4 — 画像用 Storage バケットを作る（任意・後でOK）

チャット画像・商品画像をアップロードする場合:

1. **Storage → New bucket**
2. 作成:
   - `chat-images`（Public: ON でデモ可。本番は署名URL推奨）
   - `product-images`
   - `avatars`

> 現状チャット画像は dataURL でメモリ保持しています。Storage 連携は次フェーズで実装します。

---

## STEP 5 — 接続確認

```bash
npm run dev
```

ブラウザのコンソールでクライアントが初期化できるか軽く確認できます。
本格確認は STEP 6 の差し替え後に行います。

---

## STEP 6 — データ層を差し替える（2ステップ）

> ⚠️ **必ず STEP 2（.env.local 設定）を終えてから**行ってください。
> 環境変数が無い状態で差し替えると、クライアント初期化でエラーになります。

### ① 全ページの import を切り替え

`mockStore` → `supabaseStore` に一括置換:

```bash
grep -rl "lib/mockStore" app --include=*.tsx \
  | xargs sed -i "s#lib/mockStore#lib/supabaseStore#g"
```

> `supabaseStore` は `mockStore` と**関数名・引数・戻り値がすべて同一**なので、
> import パスを変えるだけで動きます（同期的な読み取りインターフェースも維持）。

### ② StoreProvider を ClientWrapper に追加

`app/ClientWrapper.tsx` を編集:

```tsx
'use client';
import { ReactNode } from 'react';
import ScrollToTop from './components/ScrollToTop';
import { NotificationProvider } from './components/NotificationContext';
import { FavoritesProvider } from './components/FavoritesContext';
import StoreProvider from './components/StoreProvider';   // ← 追加

export default function ClientWrapper({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>                                       {/* ← 追加 */}
      <NotificationProvider>
        <FavoritesProvider>
          {children}
          <ScrollToTop />
        </FavoritesProvider>
      </NotificationProvider>
    </StoreProvider>                                      {/* ← 追加 */}
  );
}
```

### 動作確認

```bash
npm run build      # 型・ビルド検証
npm run dev
```

- 2つのブラウザ（別端末/別ユーザー）で同じイベントを開く
- 片方で承認やステータス変更 → **もう片方に即反映**されれば Realtime 成功 🎉
- これが localStorage では不可能だった「端末間データ共有」の解決です

---

## STEP 7 — 認証導入後に本番RLSへ（公開前必須）

認証（Supabase Auth）を組み込み、`profiles` に `id = auth.uid()::text` で
行を作るフローを実装したら:

```
SQL Editor で supabase/migrations/0002_production_rls.sql を Run
```

これで開発用の anon フルアクセスが削除され、当事者・スタッフのみがデータを
読み書きできる本番ポリシーに切り替わります。

---

## STEP 8 — Vercel に環境変数を設定

本番デプロイ前に、Vercel ダッシュボード **Settings → Environment Variables** で
`.env.local` と同じ 3 つを登録 → Redeploy。

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

---

## 🗺️ この後の実装ロードマップ（引き継ぎ書の優先順に対応）

| 優先 | 項目 | 状態 |
|------|------|------|
| 🥇 | DB スキーマ・シード | ✅ 本対応で完了 |
| 🥇 | データ層 Supabase 化 | ✅ 差し替えで完了（STEP 6） |
| 🥇 | リアルタイムチャット | ◻ `messages` テーブル＋Realtimeで実装（基盤あり） |
| 🥇 | 認証 / `/admin` ガード | ◻ Supabase Auth（middleware 足場あり） |
| 🥈 | 画像アップロード | ◻ Storage 連携（バケット作成のみ） |
| 🥈 | 開催成立判定の自動化 | ◻ Edge Function / Cron |
| 🥉 | LINE / メール通知 | ◻ |
| 🥉 | 分析ダッシュボード | ◻ |

---

## ⚠️ 注意点

- **service_role key は絶対にクライアントへ出さない**（`NEXT_PUBLIC_` を付けない）。サーバー処理・Cron 専用。
- 開発用 RLS のまま公開しない（STEP 7 を必ず実施）。
- `supabaseStore` の書き込みは「楽観更新＋非同期永続化」。失敗時はコンソールにログが出るので、本番では Realtime 再ハイドレートで整合します。
- `mockStore.ts` は残してあります。差し替え後に不要なら削除してOK（型は `supabaseStore` が再エクスポート）。
