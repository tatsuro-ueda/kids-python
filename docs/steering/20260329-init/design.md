# オンラインPython学習環境 - 設計書

## 画面レイアウト

上下分割の単一ページ構成。

```
+------------------------------------------+
|  ヘッダー（タイトル）                      |
+------------------------------------------+
|                                          |
|  コードエディタ（CodeMirror 6）            |
|                                          |
+------------------------------------------+
|  [実行] [クリア]                          |
+------------------------------------------+
|                                          |
|  出力エリア                               |
|                                          |
+------------------------------------------+
```

- ヘッダー: アプリタイトルのみ
- エディタ: 高さ固定（リサイズ不要）
- ボタン: エディタと出力の間に配置
- 出力エリア: `<pre>` ベースのテキスト表示

## コンポーネント設計

### CodeMirror 6 エディタ

- 使用パッケージ:
  - `@codemirror/view` - エディタUI
  - `@codemirror/state` - 状態管理
  - `@codemirror/lang-python` - Pythonシンタックスハイライト
  - `@codemirror/basic-setup` - 行番号・括弧マッチ等の基本機能
- 初期コードとして `print("Hello, Python!")` を表示する
- localStorageに保存済みコードがあればそちらを優先して復元する

### Pyodide

- ページ読み込み時に即座にロードを開始する
- ロード完了まではエディタ上に「Python環境を読み込み中...」と表示し、実行ボタンを無効化する
- ロード完了後、ボタンを有効化しステータス表示を消す

### input() 対応

Pyodideの `stdin` コールバックを上書きし、`prompt()` ダイアログに委譲する。

```javascript
pyodide.setStdin({
  stdin: () => {
    return prompt("入力してください:");
  }
});
```

### 出力キャプチャ

Pyodideの `stdout` / `stderr` コールバックを上書きし、出力エリアに追記する。

```javascript
pyodide.setStdout({ batched: (text) => appendOutput(text) });
pyodide.setStderr({ batched: (text) => appendOutput(text, "error") });
```

エラー出力は赤色で表示する。

### コード実行フロー

```
[実行ボタン押下]
  → 出力エリアをクリア
  → ボタンを無効化 + 「実行中...」表示
  → pyodide.runPythonAsync(code)
  → 完了/エラー後にボタンを有効化
```

`runPythonAsync` を使用し、UIスレッドのブロッキングを最小限にする。
ただしPyodideはメインスレッドで動作するため、無限ループ時はページが固まる点は許容する。

## データ永続化

### localStorage

| キー | 値 |
|------|----|
| `python-editor-code` | エディタの現在のコード文字列 |

- CodeMirrorの `updateListener` でキー入力ごとにリアルタイム保存する
- ページ読み込み時に `localStorage` から復元する
- 値がない場合は初期コード `print("Hello, Python!")` を表示する

## 依存ライブラリの管理

ローカルバンドル方式を採用する。

- npm でパッケージをインストールし、ESモジュールとしてバンドルする
- ビルドツール: **esbuild**（高速・設定が少ない）
- Pyodideは公式配布物（pyodide.js + .wasm）を `vendor/` に配置する

### ビルドフロー

```
npm install
  → node_modules/ に CodeMirror パッケージがインストールされる

npx esbuild main.js --bundle --outfile=dist/bundle.js --format=esm
  → dist/bundle.js に CodeMirror 含むバンドルが生成される
```

### ファイル構成

```
online-python/
├── index.html              # エントリポイント
├── style.css               # スタイル
├── src/
│   ├── main.js             # アプリ初期化・エディタ構築
│   ├── editor.js           # CodeMirror設定
│   ├── runner.js           # Pyodideロード・コード実行
│   └── storage.js          # localStorage読み書き
├── vendor/
│   └── pyodide/            # Pyodide配布物
├── dist/
│   └── bundle.js           # esbuildで生成
├── package.json
├── doc/
│   └── 20260329-init/
│       ├── requirements.md
│       └── design.md
└── .gitignore
```

## スタイル方針

- 白背景、黒文字
- フォント: エディタ・出力ともにモノスペース
- ボタン: シンプルな矩形、ホバー時に色変化
- 出力エリア: 薄いグレー背景で区別
- エラー出力: 赤色テキスト
- 最大幅 900px、中央揃え
