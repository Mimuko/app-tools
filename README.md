# app-tools

各種開発ツールを統合したWebアプリケーションです。

## 概要

本アプリケーションは、開発業務を効率化するためのツール集です。現在、以下の2つのツールを提供しています：

- **実装依頼生成ツール**: 実装依頼内容を自動生成するツール
- **公開前確認チェックリスト**: 公開可否を判断するための確認項目を条件に応じて表示するツール

## 機能

### 実装依頼生成ツール (`/tools/request`)

実装依頼内容をフォーム入力から自動生成します。以下の2つのフェーズに対応しています：

- **設計・調査フェーズ（STEP 1）**: 作り方・影響・判断材料を整理し、実装できる形にする工程
- **実装フェーズ（STEP 2）**: 要件が確定しており、手を動かせば完成する状態

生成されるテキストは、Slack投稿用とBacklog用（設計・実装）の形式に対応しています。

### 公開前確認チェックリスト (`/tools/qa`)

公開可否を判断するための最低限の確認項目を、技術スタックやプロジェクトタイプに応じて表示します。

- 条件選択（技術スタック、プロジェクトタイプ）に応じてチェックリストを動的に更新
- チェック項目のオン/オフ切り替え
- チェックリストのコピー機能

## 技術スタック

- **フレームワーク**: Next.js 14.2.5 (App Router)
- **言語**: TypeScript 5.5.4
- **UI**: React 18.3.1
- **スタイリング**: Tailwind CSS 3.4.7
- **バリデーション**: Zod 3.23.8
- **デプロイ**: Netlify

## セットアップ

### 前提条件

- Node.js（Voltaで管理）
- npm

### インストール

```bash
# 依存関係のインストール
npm install
```

## 開発

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認できます。`BASE_PATH` は開発時には適用されないため、常にルート（`/`）でアクセスできます。

### リント

```bash
npm run lint
```

## ビルド

### 本番ビルド

```bash
npm run build
```

本番環境では静的エクスポート（`output: 'export'`）が有効になり、`out` ディレクトリにビルド結果が出力されます。

ビルド後、`scripts/inline-css.js` が自動実行され、CSSがインライン化されます。

### 本番サーバーの起動

```bash
npm start
```

## デプロイ

### Netlify

本アプリケーションは Netlify にデプロイされています。

- ビルドコマンド: `npm run build`
- 公開ディレクトリ: `out`
- リダイレクト設定: `netlify.toml` でSPA用のリダイレクトを設定

### Xserverなどのレンタルサーバー

XserverなどのApacheサーバーにも静的ファイルとしてデプロイ可能です。

#### ルートディレクトリに配置する場合

1. **ビルドの実行**
   ```bash
   npm run build
   ```

2. **ファイルのアップロード**
   - `out` ディレクトリ内のすべてのファイルを、サーバーの公開ディレクトリ（通常は `public_html` など）にアップロードします
   - `public/.htaccess` ファイルも `out` ディレクトリにコピーされていることを確認してください

#### サブディレクトリに配置する場合（例: `/crh/request-content-generation-tool/`）

**方法1: 環境変数ファイルを使用（推奨）**

リポジトリに反映させたくない設定を管理する場合、`.env.local`ファイルを使用します。

1. **環境変数ファイルの作成**
   - プロジェクトルートに `.env.local` ファイルを作成します
   - 以下の内容を記述します：
     ```
     BASE_PATH=/crh/request-content-generation-tool
     ```
   - `.env.local` は `.gitignore` に含まれているため、リポジトリにコミットされません

2. **ビルドの実行**
   ```bash
   npm run build
   ```
   - Next.jsが自動的に `.env.local` を読み込みます

3. **ファイルのアップロード**
   - `out` ディレクトリ内のすべてのファイルを、指定したサブディレクトリ（例: `public_html/crh/request-content-generation-tool/`）にアップロードします
   - `public/.htaccess` ファイルも `out` ディレクトリにコピーされていることを確認してください

**方法2: コマンドラインで環境変数を指定**

```bash
# Windows (コマンドプロンプト)
set BASE_PATH=/crh/request-content-generation-tool
npm run build

# Windows (PowerShell)
$env:BASE_PATH="/crh/request-content-generation-tool"
npm run build

# Linux/Mac
BASE_PATH=/crh/request-content-generation-tool npm run build
```

**注意事項:**
- パスの先頭と末尾にスラッシュは不要です
- 複数の環境で異なるパスを使用する場合は、`.env.local`、`.env.production` などを環境ごとに作成できます

**注意事項:**
- Next.jsの静的エクスポートでは、各ルートに対してHTMLファイルが生成されます
- `trailingSlash: true` が設定されているため、URLの末尾にスラッシュが付きます（例: `/tools/`）
- すべての機能はクライアントサイドで動作するため、サーバー側の特別な設定は不要です
- サブディレクトリに配置する場合は、必ず `BASE_PATH` を指定してビルドしてください
- `BASE_PATH` は本番ビルド時（`npm run build`）にのみ適用されます。開発時（`npm run dev`）は常に http://localhost:3000 でアクセスできます

## プロジェクト構造

```
app-tools/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # ルートレイアウト
│   ├── page.tsx            # ホームページ（/toolsにリダイレクト）
│   ├── globals.css         # グローバルスタイル
│   └── tools/              # ツールページ
│       ├── page.tsx        # ツール一覧
│       ├── request/        # 実装依頼生成ツール
│       └── qa/              # 公開前確認チェックリスト
├── components/             # 共通コンポーネント
│   ├── Form.tsx            # フォームコンポーネント
│   ├── FormSection.tsx     # フォームセクション
│   └── Output.tsx          # 出力表示コンポーネント
├── lib/                    # ユーティリティ関数
│   ├── generateBacklog.ts  # Backlogテキスト生成
│   ├── generateSlack.ts    # Slackテキスト生成
│   ├── validation.ts       # バリデーション
│   └── visibility.ts       # フィールド表示制御
├── shared/                 # 共有コンポーネント・ライブラリ
│   ├── components/         # 共有コンポーネント
│   │   ├── AppHeader.tsx   # アプリヘッダー
│   │   ├── AppFooter.tsx   # アプリフッター
│   │   └── ThemeToggle.tsx # テーマ切り替え
│   └── lib/                # 共有ライブラリ
│       └── theme.tsx        # テーマ管理
├── types/                  # TypeScript型定義
│   └── form.ts             # フォームデータ型
├── scripts/                # ビルドスクリプト
│   └── inline-css.js       # CSSインライン化
├── netlify.toml            # Netlify設定
├── next.config.js          # Next.js設定
├── tailwind.config.ts      # Tailwind CSS設定
└── tsconfig.json           # TypeScript設定
```

## ライセンス

このプロジェクトはプライベートプロジェクトです。
