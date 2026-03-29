# Functional Design

## コンセプト

**「Pythonれんしゅうちょう」** — ブラウザだけで動く、小学校低学年向けのPython学習環境。インストール不要、サーバー不要、すべてクライアントサイドで完結する。

## アーキテクチャ

```
┌──────────────────────────────────┐
│           ブラウザ                │
│                                  │
│  / index.html + lp.css (LP)      │
│  /app/ index.html + style.css    │
│  ┌────────────────────────────┐  │
│  │ dist/bundle.js (esbuild)   │  │
│  │  ├─ main.js    UI制御      │  │
│  │  ├─ editor.js  CodeMirror  │  │
│  │  ├─ runner.js  Pyodide実行 │  │
│  │  ├─ errors.js  エラー翻訳  │  │
│  │  ├─ storage.js 自動保存    │  │
│  │  └─ samples.js おてほん    │  │
│  └────────────────────────────┘  │
│  vendor/pyodide/  (WASM)         │
│  localStorage     (コード保存)   │
└──────────────────────────────────┘
```

- **CodeMirror 6**: シンタックスハイライト、行番号、エラー行ハイライト
- **Pyodide**: WebAssemblyによるブラウザ内Python実行
- **esbuild**: ESMバンドル（`src/` → `dist/bundle.js`）
- **localStorage**: コードの自動保存・復元

## ページ構成

### ランディングページ（`/index.html`）

保護者向けのSEO最適化されたランディングページ:

- **Hero**: マスコット（160px、フロートアニメーション）、グラデーション背景、波SVGディバイダー、アプリスクリーンショット
- **保護者の悩み**: Pythonインストール困難、Chromebook非対応、英語UI、エラーメッセージ不明瞭
- **4つの特徴カード**: インストール不要(🌐)、ひらがなUI(✏️)、日本語エラー(💬)、自動保存(💾)
- **コード例セクション**: 3つのデモカード（実際のコードと出力を表示）
- **使い方3ステップ**: ひらく → かく → じっこう
- **保護者の安心ポイント**: データ送信なし、無料、広告なし
- **CTAボタン**: オレンジ(#ff8c42)、パルスアニメーション
- **SEO**: meta description、OGP画像、JSON-LD構造化データ
- **アニメーション**: フェードインスクロール、バウンスエフェクト、`prefers-reduced-motion`対応

### アプリ（`/app/index.html`）

上下分割のシングルページ構成（`noindex`指定）:

```
┌─────────────────────────────┐
│  🐍 Pythonれんしゅうちょう      │  ← ヘッダー（マスコット + タイトル）
├─────────────────────────────┤
│                             │
│    コードエディタ             │  ← CodeMirror（高さ固定300px）
│                             │
├─────────────────────────────┤
│  [じっこう] [きょうゆう]       │  ← ツールバー
│  [おてほん ▼]                │  ← サンプルドロップダウン
├─────────────────────────────┤
│                             │
│    出力エリア                 │  ← print結果 / エラーメッセージ
│                             │
├─────────────────────────────┤
│  ブックマークバナー            │  ← 初回訪問時に表示
└─────────────────────────────┘
```

## 機能一覧

### F1. コード編集

- CodeMirror 6ベースのエディタ
- Pythonシンタックスハイライト
- 行番号表示
- テキスト選択色をパステルパープル(`#a88cd8`)でカスタム（`EditorView.theme()` API使用）
- キーストロークごとにlocalStorageへ自動保存
- 次回アクセス時にコードを自動復元（デフォルト: `print("Hello, Python!")`）

### F2. コード実行

- Pyodide（WebAssembly）によるブラウザ内Python実行
- 実行中は「じっこうちゅう...」表示でボタン無効化
- Pyodideロード中は「Python環境を読み込み中...」ステータス表示
- `print()` の出力を出力エリアに表示
- `input()` は `builtins.input` オーバーライドでブラウザの `prompt()` ダイアログを使用
  - Pythonのプロンプト文字列をダイアログにそのまま表示
  - キャンセル時は `EOFError` を発生

### F3. エラー表示（日本語翻訳）

- Pythonエラーをひらがな中心の子ども向け日本語に翻訳
- 対応エラー型: SyntaxError, NameError, TypeError, IndentationError, IndexError, ZeroDivisionError, ValueError, AttributeError, KeyError
- エラー行番号を「○ぎょうめをみてね:」形式で表示
- エラー発生行をエディタ上でピンク(#fde8e8)にハイライト（StateFieldベース）
- 原文の英語エラーは「くわしくみる」折りたたみで参照可能
- 方針:
  - ひらがなのみ使用（漢字不使用、コード記号・関数名は例外）
  - 問題を具体的に指摘（「カッコ `(` がとじられていないよ」）
  - 修正方法をセットで提示（「`)` をつけてね」）
  - カタカナ専門用語を避ける（「クォーテーション」→「`'` や `"` のしるし」）

### F4. おてほん（サンプルコード）

- 「おてほん」ドロップダウンメニュー
- Scratchからの移行を意識した11のサンプル（難易度順）:
  1. はじめまして（`print()`）
  2. なまえをきいてみよう（`input()`、変数、文字列結合）
  3. たしざんけいさんき（算術演算、`int()`、`str()`）
  4. もしも...なら（`if/else`、`==`比較）
  5. いろいろあいさつ（`if/elif/else`、`<`比較）
  6. くりかえそう（`for`、`range()`）
  7. カウントダウン（`while`ループ、変数の更新）
  8. なんばんめ？（リスト、インデックス）
  9. もじをかぞえよう（`len()`、文字列のforループ）
  10. おみくじ（`import`、`random.choice()`）
  11. すうじあてゲーム（総合: `while True`、`break`、`random`、`if/elif/else`、`input`）
- 各サンプルにScratch→Python対応コメント付き
- 既存コードがある場合は確認ダイアログを表示

### F5. コード共有

- 「きょうゆう」ボタンでコードをURLハッシュ(`#code=...`)にエンコード
- クリップボードにコピー

### F6. ブックマークバナー

- 初回訪問時に「ブックマークしておくと、つぎもすぐひらけるよ！」バナーを表示
- 「とじる」ボタンで非表示

## ビジュアルデザイン

子ども向けの親しみやすい外観:

- **配色**: パステルカラー（水色 `#e8f4fc`、ピンク `#f5c6d0`、アリスブルー `#f0f8ff`）
- **背景**: 水色ベースにドットパターン（CSS radial-gradient）
- **ボタン**: 角丸20px、パステルカラー、フラットスタイル
- **マスコット**: ヘビのイラスト（ヘッダー80px、LP Hero 160px、フロートアニメーション）
- **ボーダー**: 2px solid 水色、角丸12px
- **テキスト**: ひらがな表記（「じっこう」「きょうゆう」）
- **LP見出し**: マーカーペン風の黄色ハイライト背景
- **LP特徴カード**: 絵文字アイコン、4色アクセントボーダー、ホバーリフト
- **アニメーション**: `prefers-reduced-motion`対応

## 技術スタック

| 領域 | 技術 |
|------|------|
| エディタ | CodeMirror 6 (`codemirror`, `@codemirror/lang-python`, `@codemirror/view`, `@codemirror/state`) |
| Python実行 | Pyodide (WebAssembly, `vendor/pyodide/`) |
| バンドル | esbuild (`src/` → `dist/bundle.js`, ESM) |
| 永続化 | localStorage |
| スクリーンショット | Playwright (`scripts/screenshots.js`) |
| サーバー | Node.js静的ファイルサーバー（開発用、本番はexe.dev VM） |

## ファイル構成

```
├── index.html          ランディングページ
├── lp.css              LPスタイル
├── privacy.html        プライバシーポリシー
├── package.json        依存関係・ビルドスクリプト
├── server.js           開発用静的サーバー
├── app/
│   ├── index.html      アプリ本体
│   ├── style.css       アプリスタイル
│   └── dist/           esbuildバンドル出力
├── src/
│   ├── main.js         UI制御・イベントハンドリング
│   ├── editor.js       CodeMirror設定・エラー行ハイライト
│   ├── runner.js       Pyodideロード・コード実行・input()パッチ
│   ├── errors.js       エラーメッセージ定義・翻訳ロジック
│   ├── storage.js      localStorage保存・読み込み・共有URL生成
│   └── samples.js      おてほんサンプルコード定義
├── scripts/
│   └── screenshots.js  Playwrightスクリーンショット自動生成
├── vendor/pyodide/     Pyodide配布ファイル
├── assets/
│   ├── snake.png       マスコット画像
│   ├── ogp.png         OGP画像
│   └── screenshots/    LP用スクリーンショット
└── docs/               ドキュメント
    ├── functional-design.md    機能設計書
    ├── customer-problems.md    顧客課題
    ├── design-problems.md      デザイン課題
    ├── marketing-problems.md   マーケティング課題
    └── steering/               ステアリングドキュメント（開発履歴）
```
