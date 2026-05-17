# 朝会支援UI（project-observer）仕様書

| 項目 | 内容 |
|------|------|
| 製品名（UI） | 朝会支援UI |
| パス | `/tools/project-observer` |
| コード上の識別子 | `project-observer` |
| 段階 | PoC（Proof of Concept） |
| マスタデータ | **Backlog**（本ツールは補助レイヤー） |

---

## 1. 目的と位置づけ

### 1.1 目的

ディレクターチームの**朝会**において、複数プロジェクトの状況を短時間で把握し、確認・優先付けの論点を揃える。

- 完了率・工数管理ツール**ではない**
- 「安全に進められるか」「認識が揃っているか」を**観測**する
- Backlog の正式情報を、ルールベースで**認知しやすく整理**して見せる

### 1.2 非目的（やらないこと）

- タスクの実行管理・スケジュール管理
- Backlog の代替（課題の編集・ステータス変更は Backlog 上で行う）
- クライアント向けレポートの自動生成
- 祝日を考慮した精密な SLA 管理（営業日は土日除外のみ）

### 1.3 基本原則

1. **Backlog が正式情報** — 判定の責任は Backlog 側
2. **ルールベース観測** — LLM 判定は使わない（PoC）
3. **ディレクター6名がスコープ** — 負荷・優先確認の「担当」表示はこの範囲
4. **新規未対応だけでは要注目にしない** — キーワード・次アクション・更新途切れで判断

---

## 2. 画面構成

### 2.1 ルート

| URL | 画面 | 説明 |
|-----|------|------|
| `/tools/project-observer` | 朝会支援UI（一覧） | 全プロジェクトのサマリー・チーム負荷・優先確認 |
| `/tools/project-observer/projects/[id]` | プロジェクト詳細 | 1 プロジェクトの深掘りパネル群 |

`[id]` は Backlog の **projectKey**（例: `NAITOHOUSE_CRH`）。

### 2.2 一覧画面の構成（上から）

| ブロック | コンポーネント | 内容 |
|----------|----------------|------|
| 免責 | `ObservationDisclaimer` | Backlog がマスタである旨 |
| 鮮度 | `DataFreshnessBanner` | 観測時刻・バッチ想定（毎日 6:00 JST） |
| 凡例 | `StatusLegend` | 共有ステータス・優先ルール |
| 艦隊サマリー | `FleetSummary` | 全案件の合計指標 |
| 優先確認 | `DirectorPromptsPanel` | チーム全体の high 優先プロンプト（初期6件・「もっと見る」で6件ずつ追加） |
| チーム負荷 | `FleetAssigneeOverview` | ディレクター別の横断負荷 |
| プロジェクト全体計測 | `ProjectCard` × N | 案件カード（共有ステータス・3指標） |

### 2.3 詳細画面の構成

| パネル | 内容 |
|--------|------|
| `SafetyReadinessPanel` | 共有ステータス・進行安全性・次アクション・共有観測文 |
| 観測メモ | `observerNote`（同期時の説明文） |
| 指標ピル | 要件未確定 / 確認待ち / 未返信 / 要確認 |
| `StatusReasonsPanel` | ステータス理由一覧 |
| `SharingGapPanel` | 共有途切れシグナル |
| `DirectorPromptsPanel` | 案件内の確認促し |
| `AssigneeLoadPanel` | ディレクター別負荷テーブル |
| `ObservedIssuesPanel` | 観測された課題 |
| その他 | 現在状態・文脈メモ・懸念コメント・リスクタイムライン |

### 2.4 UI 表記

- 製品名: **朝会支援UI**
- 常時ダークテーマ（`layout.tsx` で `className="dark"` を付与）
- 課題キーは Backlog 課題 URL へリンク（`BACKLOG_SPACE` 設定時）

---

## 3. データ取得

### 3.1 取得モード

```mermaid
flowchart TD
  A[loadAllProjects] --> B{BACKLOG_USE_MOCK?}
  B -->|yes| M[mock/raw-projects]
  B -->|no| C{本番 or BACKLOG_USE_SNAPSHOT?}
  C -->|yes| S[snapshot.json]
  S -->|空| D
  C -->|no| D[Backlog API 直接]
  D -->|失敗| S2[snapshot フォールバック]
  S2 -->|空| M
  D -->|成功| E[5分メモリキャッシュ]
```

| 環境 | 優先データ源 |
|------|----------------|
| `BACKLOG_USE_MOCK=true` または API 未設定 | モック |
| `NODE_ENV=production` または `BACKLOG_USE_SNAPSHOT=true` | `data/snapshot.json` → 失敗時 API → モック |
| 開発（`npm run dev`） | Backlog API（5分キャッシュ）→ スナップショット → モック |

### 3.2 環境変数

| 変数 | 必須 | 説明 |
|------|------|------|
| `BACKLOG_SPACE` | 実データ時 | `https://xxx.backlog.jp` またはスペース ID |
| `BACKLOG_API_KEY` | 実データ時 | API キー |
| `BACKLOG_PROJECT_IDS` | 実データ時 | カンマ区切り projectKey |
| `BACKLOG_INTERNAL_EMAIL_DOMAIN` | 任意 | 社内判定用（既定: `creativehope.jp`） |
| `BACKLOG_USE_MOCK` | 任意 | `true` でモック強制 |
| `BACKLOG_USE_SNAPSHOT` | 任意 | `true` でスナップショット優先 |

### 3.3 静的デプロイ前の同期

```bash
npm run observer:sync
npm run build
```

- `scripts/sync-project-observer.ts` が Backlog から取得し `app/tools/project-observer/data/snapshot.json` に書き出す
- 静的エクスポート（`output: 'export'`）ではビルド時に API を叩かない運用を想定
- **`/projects/[id]` はビルド時に `snapshot.json` の projectKey だけ HTML 化される**（古い `out/` を配信すると 404）
- URL は **`trailingSlash: true`** のため末尾 `/` 必須（例: `.../projects/NAITOHOUSE_CRH/`）

### 3.4 Backlog 同期の制限（PoC）

| 項目 | 値 |
|------|-----|
| コメント取得対象課題 | 未完了課題のうち**更新日が新しい順で最大 40 件** |
| 課題あたりコメント | **最新 10 件**（`order=desc`） |
| コメント解析 | 課題本文 + 上記コメントを結合 |
| 状態・担当変更日 | 課題の `updated` で**近似**（履歴 API 未使用） |
| 営業日 | 土日除外のみ（祝日なし） |
| API レート | コメント取得ごとに約 80ms 待機 |

---

## 4. 観測スコープ

### 4.1 ディレクターチーム（負荷・担当表示）

Backlog 表示名が**完全一致**するユーザーのみ。

| ID | Backlog 表示名 |
|----|----------------|
| nakaya | CRH_中谷信明 |
| nakano | CRH_中野 絵理子 |
| masui | CRH_増位 |
| urabe | CRH_浦辺良亮 |
| kuge | 久下 しおり |
| kosugi | 小杉 慶来 |

定義: `lib/observation/config.ts` の `DIRECTOR_TEAM`。

### 4.2 観測対象の課題（担当・登録者）

同期・集計・一覧の対象は、**未完了**かつ次を満たす課題のみ（いずれかで可）:

- **担当者**（`assignee`）の表示名が `DIRECTOR_TEAM` と完全一致
- **登録者**（`createdUser`）の表示名が `DIRECTOR_TEAM` と完全一致

実装: `isDirectorTeamScopedIssue`（`lib/observation/config.ts`）。Backlog 同期時にフィルタ。

### 4.3 観測対象外の課題（件名）

Backlog 課題の**件名（summary）**に次の文字列を**含む**課題は、集計・一覧・プロンプトのいずれにも含めない。

| 除外文字列 |
|------------|
| 工数管理 |
| 工数計上 |

実装: `lib/observation/issue-exclusions.ts`（Backlog 同期時にフィルタ。スナップショット読込時は観測課題・タイムライン等を再フィルタ）。

### 4.4 社内ユーザー判定（未返信など）

次のいずれか:

- メールアドレスが `*@{BACKLOG_INTERNAL_EMAIL_DOMAIN}` で終わる
- 表示名が `DIRECTOR_TEAM` のいずれかと一致

---

## 5. 共有ステータス（ShareStatus）

**優先: 要注目 > 注意 > 安定**

### 5.1 要注目（attention）

案件内に以下いずれかが 1 件以上（**新規未対応のみは含めない**）:

| シグナル | 検出方法（課題本文 + 最新10コメント） |
|----------|--------------------------------------|
| 未FIX | `/未FIX|未fix|まだFIX/i` |
| 暫定対応 | `/暫定|一旦対応|仮対応/i` |
| 要件未確定 | `/要件未確定|要件未決/i` |
| 仕様未決 | `/仕様未決|仕様未確定|仕様未合意/i` |
| 次アクション不明 | 有効な次アクション記載が案件内にない |

### 5.2 注意（caution）

要注目でない場合、次のいずれか:

- **3 営業日以上**、課題更新・コメント・状態・担当変更のいずれかが途切れている（複合条件あり）
- 注意理由が **2 件以上**
- 更新・コメント・状態・担当・次アクションがすべて 3 営業日以上途切れ → 「状況共有が途切れている」

「更新」の定義: Backlog **課題の `updated`**（案件内最新）。

### 5.3 安定（stable）

- 要注目条件なし
- **3 営業日以内**に課題更新あり
- 案件として**次アクションが明記**されている（後述）

---

## 6. 次アクション

### 6.1 有効な次アクション

課題本文・コメントから**最後の意味のある行**を抽出し、次を満たすとき有効:

- 6 文字未満は無効
- NG パターンに一致しない（例: `確認します` のみ、`一旦対応`、`検討中` など）

定義: `lib/observation/next-action.ts`, `config.ts` の `nextActionNgPatterns`。

### 6.2 派生指標

| 指標 | ルール |
|------|--------|
| `nextActionClarity` | 無し→`unclear`、あり+更新が新しい→`clear`、それ以外→`partial` |
| `proceedSafety` | 要注目/不明瞭→`hold`、注意/部分→`careful`、それ以外→`safe` |

※ 一覧の `ProjectCard` では慎重/次アクションバッジは**非表示**（詳細画面の `SafetyReadinessPanel` では表示）。

---

## 7. 負荷指標（ディレクター向け）

「忙しさ」ではなく **確認待ち・未返信・要確認** を数える。

### 7.1 未返信（unreplied）

| 条件 | 説明 |
|------|------|
| 最新コメント | 課題の**最新1件**のコメント（最大10件のうち先頭） |
| 未返信 | その投稿者が**社内ユーザー** |
| カウント | 上記かつ課題担当が**ディレクターチーム**のとき、案件・担当別に +1 |

UI 表記: **未返信（社内最終コメント）** — クライアント返信待ちのイメージ。

### 7.2 確認待ち（awaitingConfirmation）

- 課題担当がディレクター
- 最新コメントが社内（= 未返信と同じ `lastCommentInternal` 条件）

### 7.3 要確認（needsReview）

- 課題担当がディレクター
- 課題の共有ステータスが `attention` または `caution`

### 7.4 認知負荷（cognitiveLoad）

担当者ごとに `確認待ち + 未返信 + 要確認` の合計:

| 合計 | レベル |
|------|--------|
| ≥ 7 | high |
| ≥ 4 | elevated |
| ≥ 2 | moderate |
| それ以外 | light |

---

## 8. 優先確認（DirectorPrompt）

### 8.1 一覧「チーム全体 — 優先確認」

- 全プロジェクトの `directorPrompts` から `priority === 'high'` のみ（件数上限なし）
- UI は初期 **6 件** 表示。「もっと見る」で **6 件ずつ** 追加、「閉じる」で初期表示に戻す
- 各カードは **Backlog 課題 URL** へリンク（`issueKey` 使用）

### 8.2 プロンプト生成

| source | 意味 | forDirector（担当行） |
|--------|------|------------------------|
| `status_change` | 非安定の観測課題（最大3件/案件） | 課題の Backlog 担当が**スコープ内ディレクター**のときのみ表示 |
| `assignee_change` | 負荷上 `suggestedNext` があるディレクター | そのディレクター名 |

表示: `担当: {名前}`（スコープ外・未設定の場合は行ごと非表示）。

---

## 9. ディレクトリ構成

```
app/tools/project-observer/
├── SPEC.md                 # 本仕様書
├── page.tsx                # 一覧
├── layout.tsx              # メタデータ・ダーク強制・CSS
├── observer.css
├── projects/[id]/page.tsx  # 詳細
├── components/             # UI
├── lib/
│   ├── load-projects.ts    # データ入口
│   ├── evaluate-records.ts # 観測結果の組み立て
│   └── observation/        # 判定ロジック
│       ├── config.ts       # 定数・ディレクター一覧
│       ├── evaluate.ts     # 共有ステータス・負荷
│       └── next-action.ts
├── mock/                   # モックデータ
├── data/snapshot.json      # 静的用スナップショット
└── types/index.ts

lib/backlog/                # Backlog API・同期
├── client.ts
├── sync-project.ts
├── issue-signals.ts
├── env.ts
└── business-days.ts

scripts/sync-project-observer.ts
```

---

## 10. 開発・運用

### 10.1 ローカル開発

```bash
# .env.local に BACKLOG_* を設定
npm run dev
# → http://localhost:3000/tools/project-observer
```

環境変数変更後は **dev サーバー再起動**が必要。Backlog 取得結果は **約5分キャッシュ**。

### 10.2 本番ビルド（静的）

```bash
npm run observer:sync   # スナップショット更新
npm run build
```

### 10.3 既知の制限・今後の拡張候補

- [ ] Backlog 課題履歴 API による正確な状態・担当変更日
- [ ] 祝日カレンダー対応の営業日
- [ ] 優先確認の `assignee_change` と課題キーの対応付け
- [ ] コメント解析対象課題数の設定化
- [ ] バッチ AM6:00 の自動実行（現状は表示ラベルのみ）
- [ ] README への運用手順統合

---

## 11. 変更履歴（ドキュメント）

| 日付 | 内容 |
|------|------|
| 2026-05-17 | 初版（朝会支援UI・Backlog 連携 PoC 時点の実装に基づく） |
