# エラーメッセージ日本語化 - 設計書

## 概要

Pythonの英語エラーメッセージを小学生向けの日本語に変換して表示する。

## 実装方針

### 変換場所

`runner.js` 内でPythonエラーを受け取った後、JavaScriptで変換する。
Python側（`sys.excepthook`等）は変更しない。

### 新規ファイル

`src/errors.js` を追加する。エラー変換ロジックとメッセージ定義をここに集約する。

### マッチング方式

エラー種別（`SyntaxError`等）+ 英語メッセージの正規表現で具体的な日本語メッセージを出し分ける。

```javascript
const ERROR_MESSAGES = [
  {
    type: "SyntaxError",
    pattern: /unexpected EOF while parsing/,
    message: "カッコや引用符がとじられていないよ",
  },
  {
    type: "SyntaxError",
    pattern: /invalid syntax/,
    message: "書き方がまちがっているよ",
  },
  // ...
];
```

マッチ順: 配列の先頭から順に評価し、最初にマッチしたものを使う。
具体的なパターンを先に、汎用的なパターンを後に配置する。

### 対応するエラーメッセージ一覧

| エラー種別 | パターン | 日本語メッセージ |
|-----------|---------|----------------|
| `SyntaxError` | `unexpected EOF while parsing` | カッコやクォーテーションがとじられていないよ |
| `SyntaxError` | `invalid syntax` | かきかたがまちがっているよ |
| `SyntaxError` | `EOL while scanning string literal` | もじれつのクォーテーション（`'` や `"`）がとじられていないよ |
| `SyntaxError` | `invalid character` | ぜんかくもじがまざっているよ。はんかくでにゅうりょくしてね |
| `NameError` | `name '(.+)' is not defined` | 「{1}」はまだつくられていないよ。なまえがまちがっていないかたしかめてね |
| `TypeError` | `unsupported operand type` | ちがうしゅるいのもの（すうじともじなど）をまぜてけいさんしようとしているよ |
| `TypeError` | `can only concatenate str` | もじとすうじはそのままではつなげられないよ。`str()`でかこんでね |
| `TypeError` | `takes (\d+) positional argument` | かんすうにわたすものの かずがまちがっているよ |
| `IndentationError` | `unexpected indent` | じさげ（スペース）がおおすぎるよ |
| `IndentationError` | `expected an indented block` | じさげ（スペース）がたりないよ。`if`や`for`のつぎのぎょうはじさげしてね |
| `IndexError` | `list index out of range` | リストのばんごうがおおきすぎるよ。リストのながさをたしかめてね |
| `ZeroDivisionError` | `division by zero` | 0でわることはできないよ |
| `ValueError` | `invalid literal for int` | すうじにできないもじを すうじにかえようとしているよ |
| `ValueError` | `could not convert string to float` | すうじにできないもじを しょうすうにかえようとしているよ |
| `AttributeError` | `has no attribute '(.+)'` | 「{1}」というきのうはないよ。なまえがまちがっていないかたしかめてね |
| `KeyError` | `.+` | じしょにそのキーはないよ。キーのなまえをたしかめてね |

`{1}` は正規表現のキャプチャグループから動的に埋め込む。

### 未知のエラー（上記に該当しない場合）

汎用メッセージを表示する:

```
エラーがおきたよ
```

### 出力フォーマット

```
───────────────
○行目: 日本語メッセージ
▶ くわしくみる（クリックで開閉）
  ErrorType: original english message
───────────────
```

- 行番号が取得できない場合は「○行目:」を省略する
- 英語エラーは `<details>/<summary>` で折りたたみ、ふだんは非表示にする
- `<summary>` のテキストは「くわしくみる」とする

### エラー文字列のパース

Pyodideが返すエラー文字列から以下を抽出する:

```
Traceback (most recent call last):
  File "<exec>", line 3, in <module>
NameError: name 'x' is not defined
```

パース対象:
- **行番号**: `line (\d+)` から抽出
- **エラー種別**: 最終行の `:` の左側（`NameError`）
- **メッセージ**: 最終行の `:` の右側（`name 'x' is not defined`）

### 変更対象ファイル

| ファイル | 変更内容 |
|---------|---------|
| `src/errors.js` | 新規作成。エラーメッセージ定義・パース・変換ロジック |
| `src/runner.js` | エラー発生時に `errors.js` の変換関数を呼び出す |
| `src/main.js` | 変換済みメッセージの表示処理（区切り線付き） |
| `style.css` | エラー表示の区切り線スタイル |
| `dist/bundle.js` | 再ビルド |

### 処理フロー

```
[Python実行でエラー発生]
  → Pyodideがエラー文字列を返す
  → errors.js: パース（行番号・種別・メッセージを抽出）
  → errors.js: マッチング（種別+正規表現で日本語メッセージを選択）
  → main.js: 区切り線付きフォーマットで出力エリアに表示
```
