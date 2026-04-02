# GitHub Issue → PR 自動作成セットアップ手順書

GitHubにIssueを書くだけで、Claude Codeが自動的に実装してPRを作成する仕組みのセットアップ手順。

## 前提条件

- GitHubリポジトリの管理者権限
- Claude Code CLI（ローカルで作業する場合）

## 全体像

```
Issue作成 → GitHub Actions起動 → Claude Codeが実装 → PR作成 → 自動レビュー
```

構成ファイル:

| ファイル | 役割 |
|---------|------|
| `.github/workflows/claude.yml` | Issue→PR自動作成ワークフロー |
| `.github/workflows/claude-code-review.yml` | PR自動レビューワークフロー |
| `.claude/settings.json` | Claude Codeのツール実行許可 |
| `CLAUDE.md` | プロジェクト知識（Claude Codeへの指示） |
| `.github/ISSUE_TEMPLATE/feature.yml` | 機能リクエスト用テンプレート |
| `.github/ISSUE_TEMPLATE/bugfix.yml` | バグ報告用テンプレート |

---

## 手順1: Claude Code GitHub Appのインストール

Claude Codeのターミナルで以下を実行:

```
/install-github-app
```

これにより以下が自動で行われる:
- Claude Code GitHub Appがリポジトリにインストールされる
- `CLAUDE_CODE_OAUTH_TOKEN` がGitHub Secretsに設定される
- 基本的なワークフローファイルが生成される

## 手順2: ワークフローファイルの設定

### 2-1. Issue→PR作成ワークフロー

`.github/workflows/claude.yml` を以下の内容で作成（または上書き）:

```yaml
name: Claude Code

on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
  issues:
    types: [opened, assigned, labeled]
  pull_request_review:
    types: [submitted]

jobs:
  claude:
    if: |
      (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@claude')) ||
      (github.event_name == 'pull_request_review_comment' && contains(github.event.comment.body, '@claude')) ||
      (github.event_name == 'pull_request_review' && contains(github.event.review.body, '@claude')) ||
      (github.event_name == 'issues' && github.event.action == 'opened') ||
      (github.event_name == 'issues' && github.event.action == 'labeled' && github.event.label.name == 'claude') ||
      (github.event_name == 'issues' && github.event.action == 'assigned')
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      issues: write
      id-token: write
      actions: read
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Run Claude Code
        id: claude
        uses: anthropics/claude-code-action@v1
        with:
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
          show_full_output: true
          additional_permissions: |
            actions: read
          prompt: |
            このIssueの内容に基づいて実装し、PRを作成してください。

            手順:
            1. まず docs/ ディレクトリ内のドキュメントをすべて読み、プロジェクトの設計・課題を理解する
            2. git log --oneline -20 で過去のコミットスタイルを確認する
            3. issueの内容を理解し、実装方針を決める
            4. ブランチを作成してチェックアウトする
            5. 必要な変更を実装する
            6. 変更をコミットする（過去のコミットメッセージのスタイルに合わせる）
            7. ブランチをプッシュする
            8. gh pr create でPRを作成する（本文にCloses #[issue番号]を含める）

            重要:
            - 必ずPRを作成して完了すること
            - docs/のドキュメントを必ず参照してから実装すること
            - 過去のコミット履歴を参考にコーディングスタイルを合わせること
```

**promptセクションのカスタマイズ**: プロジェクトに合わせて手順や重要事項を書き換えること。特に「docs/を参照」の部分は、ドキュメントの配置に合わせて変更する。

### 2-2. PR自動レビューワークフロー

`.github/workflows/claude-code-review.yml` を以下の内容で作成:

```yaml
name: Claude Code Review

on:
  pull_request:
    types: [opened, synchronize, ready_for_review, reopened]

jobs:
  claude-review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: read
      issues: read
      id-token: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 1

      - name: Run Claude Code Review
        id: claude-review
        uses: anthropics/claude-code-action@v1
        with:
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
          allowed_bots: 'claude'
          plugin_marketplaces: 'https://github.com/anthropics/claude-code.git'
          plugins: 'code-review@claude-code-plugins'
          prompt: '/code-review:code-review ${{ github.repository }}/pull/${{ github.event.pull_request.number }}'
```

**ポイント**: `allowed_bots: 'claude'` がないと、Claude botが作ったPRのレビューがエラーになる。

## 手順3: ツール実行許可の設定

`.claude/settings.json` を作成:

```json
{
  "permissions": {
    "allow": [
      "Bash(git:*)",
      "Bash(gh:*)",
      "Bash(npm:*)",
      "Bash(node:*)",
      "Bash(ls:*)",
      "Bash(cat:*)",
      "Bash(mkdir:*)",
      "Read",
      "Write",
      "Edit",
      "Glob",
      "Grep"
    ]
  }
}
```

**これがないと**: Claude Codeがgitコマンドやファイル編集を実行しようとしたときに `Error: This command requires approval` で失敗する。

## 手順4: CLAUDE.mdの作成

リポジトリルートに `CLAUDE.md` を作成する。このファイルはClaude Codeがリポジトリを理解するための知識ベースになる。

以下をプロジェクトに合わせて記載すること:

```markdown
# プロジェクト名

## プロジェクト概要
（プロジェクトの目的と特徴を1-2行で）

## 必須: ドキュメント参照
実装前に必ず以下のドキュメントを読むこと:
- `docs/xxx.md` - （説明）
- `docs/yyy.md` - （説明）

## コーディング規約
- （このプロジェクト固有のルール）
- （命名規則、ディレクトリ構成のルールなど）

## 技術スタック
- （使用言語・フレームワーク）
- （ビルドツール・デプロイ方法など）
```

**記載のコツ**:
- Claude Codeに「読んでほしいドキュメント」を明示する
- プロジェクト固有のルール（多言語対応、テンプレートの使い方など）を書く
- 技術スタックを明記しておくと、適切なコードが生成されやすい

## 手順5: Issueテンプレートの作成

### 機能リクエスト用

`.github/ISSUE_TEMPLATE/feature.yml`:

```yaml
name: 機能リクエスト
description: 新機能や改善の提案
labels: ["enhancement"]
body:
  - type: textarea
    id: what
    attributes:
      label: 何をしたいか
      description: 実現したいことを具体的に書いてください
      placeholder: "例: トップページに利用者数カウンターを表示したい"
    validations:
      required: true
  - type: textarea
    id: where
    attributes:
      label: どこに（対象ファイル・画面）
      description: 変更対象がわかれば記載してください
      placeholder: "例: index.html のヘッダー部分"
    validations:
      required: false
  - type: textarea
    id: why
    attributes:
      label: なぜ（背景・目的）
      description: この変更が必要な理由やコンテキスト
    validations:
      required: false
  - type: textarea
    id: details
    attributes:
      label: 補足情報
      description: 参考URL、スクリーンショット、デザイン案など
    validations:
      required: false
```

### バグ報告用

`.github/ISSUE_TEMPLATE/bugfix.yml`:

```yaml
name: バグ報告
description: バグや不具合の報告
labels: ["bug"]
body:
  - type: textarea
    id: what
    attributes:
      label: 何が起きているか
      description: 現在の動作と期待する動作を書いてください
    validations:
      required: true
  - type: textarea
    id: steps
    attributes:
      label: 再現手順
      description: バグを再現する手順
    validations:
      required: false
  - type: textarea
    id: details
    attributes:
      label: 補足情報
      description: スクリーンショット、ブラウザ、OS情報など
    validations:
      required: false
```

**テンプレートの目的**: Issueに「何を・どこに・なぜ」を構造化して書いてもらうことで、Claude Codeが的確に実装できる情報量を確保する。

## 手順6: コミット & プッシュ

すべてのファイルを作成したら、コミットしてプッシュ:

```bash
git add \
  .github/workflows/claude.yml \
  .github/workflows/claude-code-review.yml \
  .claude/settings.json \
  CLAUDE.md \
  .github/ISSUE_TEMPLATE/feature.yml \
  .github/ISSUE_TEMPLATE/bugfix.yml

git commit -m "ci: Issue→PR自動作成の仕組みをセットアップ"
git push origin main
```

## 動作確認

1. GitHubでIssueを新規作成する（テンプレートが表示されるはず）
2. GitHub Actionsタブで「Claude Code」ワークフローが起動することを確認
3. PRが自動作成されることを確認
4. PRに対してClaude Code Reviewが動くことを確認

## トリガー条件まとめ

| アクション | 動作 |
|-----------|------|
| Issue新規作成 | 自動でPR作成 |
| Issueに `claude` ラベルを付ける | 自動でPR作成 |
| Issueにassign | 自動でPR作成 |
| コメントに `@claude` と書く | Claude Codeが応答 |
| PR作成 | 自動レビュー |

## トラブルシューティング

| 症状 | 原因と対処 |
|------|-----------|
| Actionが `skipped` | `if` 条件に合致していない。Issue起因なら正常に2つのrunが出て1つはskipされる |
| `Failed to get GitHub App installation token` | `id-token: write` がpermissionsにあるか確認。`additional_permissions` に余計な権限を入れていないか確認 |
| `This command requires approval` | `.claude/settings.json` が存在しないか、必要なツールが許可されていない |
| `Workflow initiated by non-human actor` | `claude-code-review.yml` に `allowed_bots: 'claude'` を追加 |
| PRが作られずコメントだけ | promptの指示を「必ずPRを作成して完了すること」と強調する |
| `show_full_output` でログを見たい | ワークフローに `show_full_output: true` を追加してデバッグ |
