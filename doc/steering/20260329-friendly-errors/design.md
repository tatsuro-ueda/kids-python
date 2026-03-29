# エラーメッセージ改善 - 設計書

## へんこうがいよう

1. `src/errors.js` のメッセージをよりぐたいてき・やさしい表現にさしかえ
2. エラーぎょうのエディタハイライトきのうをついか
3. ふくすうエラー時はさいしょの1つだけひょうじ

## へんこうたいしょうファイル

| ファイル | へんこうないよう |
|---------|----------------|
| `src/errors.js` | メッセージていぎのさしかえ、パースロジックの改善 |
| `src/editor.js` | エラーぎょうハイライト用のAPIをエクスポート |
| `src/main.js` | ハイライト呼び出し、ふくすうエラーの制御 |
| `style.css` | エラーぎょうハイライトのスタイル |
| `dist/bundle.js` | 再ビルド |

## 1. メッセージていぎ（src/errors.js）

げんざいの `ERROR_MESSAGES` はいれいをよりぐたいてきにする。

### さしかえ一覧

```javascript
const ERROR_MESSAGES = [
  // SyntaxError: ぐたいてきなパターンを先に
  { type: "SyntaxError", pattern: /unexpected EOF while parsing/,
    message: "とじカッコ `)` や `]` がたりないよ。ひらいたカッコをとじてね" },
  { type: "SyntaxError", pattern: /EOL while scanning string literal/,
    message: "`'` や `\"` のしるしがとじられていないよ。もじのおわりにもつけてね" },
  { type: "SyntaxError", pattern: /invalid character.*\(U\+FF/,
    message: "にほんごモードのもじがまざっているよ。キーボードをえいすうにきりかえてね" },
  { type: "SyntaxError", pattern: /invalid character/,
    message: "つかえないもじがはいっているよ。けしてかきなおしてね" },
  { type: "SyntaxError", pattern: /expected ':'/,
    message: "`:` がないよ。`if` や `for` のおわりには `:` をつけてね" },
  { type: "SyntaxError", pattern: /unmatched '\)'/,
    message: "とじカッコ `)` がおおいよ。カッコのかずをたしかめてね" },
  { type: "SyntaxError", pattern: /invalid syntax/,
    message: "かきかたがまちがっているよ。スペルやきごうをたしかめてね" },

  // NameError
  { type: "NameError", pattern: /name '(.+)' is not defined/,
    message: "`$1` ってなに？ まだつくってないか、なまえをまちがえているよ" },

  // TypeError
  { type: "TypeError", pattern: /can only concatenate str/,
    message: "もじとすうじはそのままくっつけられないよ。`str()` でかこんでみてね" },
  { type: "TypeError", pattern: /unsupported operand type/,
    message: "もじとすうじをまぜてけいさんしようとしているよ。`int()` や `str()` でそろえてね" },
  { type: "TypeError", pattern: /(.+)\(\) takes (\d+) positional argument.* (\d+) .* given/,
    message: "`$1()` にいれるものは $2こなのに、$3こいれているよ" },
  { type: "TypeError", pattern: /missing (\d+) required positional argument/,
    message: "たりないよ！ あと $1こ いれてね" },

  // IndentationError
  { type: "IndentationError", pattern: /unexpected indent/,
    message: "スペースがおおいよ。まえのぎょうとそろえてね" },
  { type: "IndentationError", pattern: /expected an indented block/,
    message: "スペースがたりないよ。`if` や `for` のつぎのぎょうは スペース4つ いれてね" },

  // IndexError
  { type: "IndexError", pattern: /list index out of range/,
    message: "リストのばんごうがおおきすぎるよ。`len()` でながさをたしかめてね" },

  // ZeroDivisionError
  { type: "ZeroDivisionError", pattern: /division by zero/,
    message: "0でわることはできないよ。わるすうじをたしかめてね" },

  // ValueError
  { type: "ValueError", pattern: /invalid literal for int/,
    message: "`int()` のなかみがすうじじゃないよ。すうじだけいれてね" },
  { type: "ValueError", pattern: /could not convert string to float/,
    message: "`float()` のなかみがすうじじゃないよ。すうじだけいれてね" },

  // AttributeError
  { type: "AttributeError", pattern: /'(.+)' .* has no attribute '(.+)'/,
    message: "`$1` に `$2` っていうきのうはないよ。なまえをたしかめてね" },

  // KeyError
  { type: "KeyError", pattern: /.+/,
    message: "じしょにそのなまえはないよ。`print()` でなかみをたしかめてね" },
];
```

### パースロジックの改善

`parseError()` は現状のまま。ただし `IndentationError` もマッチするよう正規表現を修正:

```javascript
// 現状: /^(\w+Error|KeyError):\s*(.+)$/
// 修正: /^(\w+Error):\s*(.+)$/
// （IndentationError, KeyError 等すべて \w+Error にマッチ済みなのでそのまま）
```

→ 実際にはげんざいの正規表現で `IndentationError` もマッチするため、変更不要。

### ふくすうエラーの制御

`translateError()` の変更はなし。呼び出し側（`main.js`）で制御する。

## 2. エディタ行ハイライト（src/editor.js）

CodeMirror 6 の `Decoration` でエラー行をハイライトする。

### しくみ

- `editor.js` からエディタインスタンスにアクセスできる関数をエクスポート
- `highlightErrorLine(view, lineNumber)` — 指定行にハイライト装飾を追加
- `clearErrorHighlight(view)` — ハイライトを消す

### じっそう方法

`StateEffect` と `StateField` を使う:

```javascript
import { StateEffect, StateField } from "@codemirror/state";
import { Decoration, EditorView } from "@codemirror/view";

const setErrorLine = StateEffect.define();
const clearErrorLine = StateEffect.define();

const errorLineField = StateField.define({
  create() { return Decoration.none; },
  update(decos, tr) {
    for (const e of tr.effects) {
      if (e.is(setErrorLine)) {
        const line = tr.state.doc.line(e.value);
        return Decoration.set([
          errorLineDeco.range(line.from)
        ]);
      }
      if (e.is(clearErrorLine)) {
        return Decoration.none;
      }
    }
    return decos;
  },
  provide: f => EditorView.decorations.from(f),
});

const errorLineDeco = Decoration.line({ class: "cm-error-line" });
```

- `createEditor()` の `extensions` に `errorLineField` を追加
- `highlightErrorLine(view, lineNumber)` と `clearErrorHighlight(view)` をエクスポート

### スタイル（style.css に追加）

```css
.cm-error-line {
  background: #fff0f0;
}
```

## 3. main.js の変更

### エラー表示フロー

```
[Python実行でエラー発生]
  → catch(e) で e.message を受け取る
  → translateError() でパース・変換
  → appendError() でメッセージ表示（さいしょの1つだけ）
  → highlightErrorLine() でエディタのエラー行をハイライト
```

### ふくすうエラーの制御

Pyodideは1つのエラーで実行をとめるため、catch に入るのは1回。
現状のままで「さいしょの1つだけ」は自然にみたされる。

### 実行時のハイライトクリア

`runBtn` クリック時に `clearErrorHighlight()` を呼ぶ。

```javascript
runBtn.addEventListener("click", async () => {
  outputEl.textContent = "";
  clearErrorHighlight(editor);    // ← 追加
  // ...
  } catch (e) {
    appendError(e.message);
    const { lineNumber } = translateError(e.message);
    if (lineNumber) highlightErrorLine(editor, lineNumber);  // ← 追加
  }
});
```

## しょりフロー（まとめ）

```
1. ユーザーが「じっこう」をクリック
2. まえのハイライトをクリア
3. Pyodideでコードをじっこう
4. エラーがおきたら:
   a. errors.js でパース → にほんごメッセージにへんかん
   b. main.js でメッセージをひょうじ
   c. editor.js でエラーぎょうをハイライト
5. せいじょうしゅうりょうなら なにもしない
```
