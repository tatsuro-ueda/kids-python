# Functional Design

## コンセプト

**「Pythonれんしゅうちょう」** — ブラウザだけで動く、小学校低学年向けのPython学習環境。インストール不要、サーバー不要、すべてクライアントサイドで完結する。

## アーキテクチャ

```
┌──────────────────────────────────┐
│           ブラウザ                │
│                                  │
│  index.html + style.css          │
│  ┌────────────────────────────┐  │
│  │ dist/bundle.js (esbuild)   │  │
│  │  ├─ main.js    UI制御      │  │
│  │  ├─ editor.js  CodeMirror  │  │
│  │  ├─ runner.js  Pyodide実行 │  │
│  │  ├─ errors.js  エラー翻訳  │  │
│  │  └─ storage.js 自動保存    │  │
│  └────────────────────────────┘  │
│  vendor/pyodide/  (WASM)         │
│  localStorage     (コード保存)   │
└──────────────────────────────────┘
```

- **CodeMirror 6**: シンタックスハイライト、行番号、エラー行ハイライト
- **Pyodide**: WebAssemblyによるブラウザ内Python実行
- **esbuild**: ESMバンドル（`src/` → `dist/bundle.js`）
- **localStorage**: コードの自動保存・復元

## 画面構成

上下分割のシングルページ構成:

```
┌─────────────────────────┐
│    🐍 Pythonれんしゅうちょう    │  ← ヘッダー（マスコット + タイトル）
├─────────────────────────┤
│                         │
│    コードエディタ         │  ← CodeMirror（高さ固定300px）
│                         │
├─────────────────────────┤
│  [じっこう]               │  ← ツールバー
├─────────────────────────┤
│                         │
│    出力エリア             │  ← print結果 / エラーメッセージ
│                         │
└─────────────────────────┘
```

## 機能一覧

### F1. コード編集

- CodeMirror 6ベースのエディタ
- Pythonシンタックスハイライト
- 行番号表示
- テキスト選択色をパステルパープル(`#a88cd8`)でカスタム
- キーストロークごとにlocalStorageへ自動保存
- 次回アクセス時にコードを自動復元（デフォルト: `print("Hello, Python!")`）

### F2. コード実行

- Pyodide（WebAssembly）によるブラウザ内Python実行
- 実行中は「じっこうちゅう...」表示でボタン無効化
- Pyodideロード中は「Python環境を読み込み中...」ステータス表示
- `print()` の出力を出力エリアに表示
- `input()` はブラウザの `prompt()` ダイアログで代替
  - Pythonのプロンプト文字列をダイアログに表示
  - キャンセル時は `EOFError` を発生

### F3. エラー表示（日本語翻訳）

- Pythonエラーをひらがな中心の子ども向け日本語に翻訳
- 対応エラー型: SyntaxError, NameError, TypeError, IndentationError, IndexError, ZeroDivisionError, ValueError, AttributeError, KeyError
- エラー行番号を「○ぎょうめをみてね:」形式で表示
- エラー発生行をエディタ上でピンクにハイライト
- 原文の英語エラーは「くわしくみる」折りたたみで参照可能
- 方針:
  - ひらがなのみ使用（漢字不使用、コード記号・関数名は例外）
  - 問題を具体的に指摘（「カッコ `(` がとじられていないよ」）
  - 修正方法をセットで提示（「`)` をつけてね」）


## ビジュアルデザイン

子ども向けの親しみやすい外観:

- **配色**: パステルカラー（水色 `#e8f4fc`、ピンク `#f5c6d0`、アリスブルー `#f0f8ff`）
- **背景**: 水色ベースにドットパターン（CSS radial-gradient）
- **ボタン**: 角丸20px、パステルカラー、フラットスタイル
- **マスコット**: ヘビのイラスト（ヘッダー、80px）
- **ボーダー**: 2px solid 水色、角丸12px
- **テキスト**: ひらがな表記（「じっこう」「けす」）

## 技術スタック

| 領域 | 技術 |
|------|------|
| エディタ | CodeMirror 6 (`codemirror`, `@codemirror/lang-python`, `@codemirror/view`, `@codemirror/state`) |
| Python実行 | Pyodide (WebAssembly, `vendor/pyodide/`) |
| バンドル | esbuild (`src/` → `dist/bundle.js`, ESM) |
| 永続化 | localStorage |
| サーバー | Node.js静的ファイルサーバー（開発用、本番はexe.dev VM） |

## ファイル構成

```
├── index.html          メインページ
├── style.css           スタイル
├── package.json        依存関係・ビルドスクリプト
├── server.js           開発用静的サーバー
├── src/
│   ├── main.js         UI制御・イベントハンドリング
│   ├── editor.js       CodeMirror設定・エラー行ハイライト
│   ├── runner.js       Pyodideロード・コード実行・input()パッチ
│   ├── errors.js       エラーメッセージ定義・翻訳ロジック
│   └── storage.js      localStorage保存・読み込み
├── dist/               esbuildバンドル出力
├── vendor/pyodide/     Pyodide配布ファイル
├── assets/             マスコット画像等
└── doc/                ドキュメント
    ├── customer-problems.md
    ├── functional-design.md
    └── steering/       ステアリングドキュメント（開発履歴）
```
