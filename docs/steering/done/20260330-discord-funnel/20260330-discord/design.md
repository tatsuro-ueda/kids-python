# 設計書

## アーキテクチャ概要

Discord公式UIでサーバーを手動作成し、チャンネル・ロール・テンプレートを設定する。アプリ側は `app/index.html` のフッターリンクを実際の招待URLに置き換えるのみ。

## コンポーネント設計

### 1. Discordサーバー

**責務**:
- 翻訳フィードバックの受付
- 言語別コミュニティの場
- 開発者とのコミュニケーション

**サーバー名**: `Pythonれんしゅうちょう / Python Notebook`

**アイコン**: `assets/snake.png` を使用

### 2. チャンネル構成

```
📢 INFO
  #welcome          — サーバー説明、ルール、リンク集
  #announcements     — リリース・翻訳更新の通知（管理者のみ投稿）

🌐 TRANSLATION
  #report-translation-issues — フォーラムチャンネル（テンプレート付き）
  #translation-general       — 翻訳に関する全般的な議論

🗣️ LANGUAGES（Phase 1主要言語）
  #lang-english
  #lang-hindi
  #lang-spanish
  #lang-arabic

🔧 DEV
  #dev              — 開発者向け議論
```

### 3. ロール

| ロール | 色 | 権限 | 対象 |
|---|---|---|---|
| `Admin` | 赤 | 全権限 | 開発者 |
| `Translator` | 青 | メッセージ送信、フォーラム投稿 | 翻訳フィードバックを1件以上送った人に付与 |
| `@everyone` | — | チャンネル閲覧、リアクション | 全員 |

### 4. フォーラムテンプレート（#report-translation-issues）

投稿タイトル: `[言語コード] 問題の概要`

本文テンプレート:
```
**言語**: (例: es / Spanish)
**場所**: (ボタン / エラーメッセージ / サンプルコード)
**翻訳キー**: (わかれば。例: error.parenOpen)
**現在の翻訳**:
**問題点**:
**提案する修正**:
```

### 5. #welcome チャンネルの内容

```
🐍 Welcome to Pythonれんしゅうちょう!

A browser-based Python IDE for kids, available in 17 languages.

🌐 **Help us improve translations!**
If you find a translation that sounds unnatural or incorrect:
1. Go to #report-translation-issues
2. Create a new post using the template
3. We'll fix it!

🔗 **Links**
• App: https://and-and.com/app/
• GitHub: (リポジトリURL)

📜 **Rules**
• Be kind and respectful
• Use English or your native language
• One issue per forum post
```

## データフロー

### 翻訳フィードバックフロー

```
1. ユーザーがアプリで不自然な翻訳に気づく
2. フッターの「翻訳を手伝う」リンクからDiscordに参加
3. #report-translation-issues でフォーラム投稿を作成
4. 開発者が確認し、翻訳JSONを修正
5. #announcements で修正をアナウンス
```

## 実装の順序

1. Discordサーバーを作成（手動）
2. チャンネル・ロールを設定（手動）
3. フォーラムテンプレートを設定（手動）
4. #welcome メッセージを投稿（手動）
5. 無期限招待リンクを生成
6. `app/index.html` のTODOプレースホルダーを実際のリンクに置換
7. ビルド・確認

## セキュリティ考慮事項

- 招待リンクは無期限・無制限で設定（パブリックコミュニティ）
- スパム対策: Discordのデフォルト検証レベル（メール認証必須）を設定
- `#announcements` は管理者のみ投稿可能に設定

## パフォーマンス考慮事項

- アプリ側の変更は `<a>` タグの `href` 属性のみ。パフォーマンス影響なし

## 将来の拡張性

- Phase 2: 言語チャンネルの追加（17言語分）
- Phase 2: Discordボットで翻訳報告 → GitHub Issue自動作成
- Phase 3: コーディネーター制度のロール追加
