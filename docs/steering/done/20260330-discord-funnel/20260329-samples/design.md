# P6解決策: おてほんサンプルコード集 — Design

## 方式

Scratchのブロックと対応するPythonサンプルコードを「おてほん」ドロップダウンとしてアプリ内に提供する。サンプルを選ぶとエディタにコードが入り、すぐに実行できる。

---

## D1. UI配置

ツールバーの直後、出力エリアの直前にドロップダウンを配置する。

```
┌──────────────────────────────┐
│  header (マスコット + タイトル) │
├──────────────────────────────┤
│  #editor (CodeMirror)        │
├──────────────────────────────┤
│  .toolbar  [じっこう] [きょうゆう] │
├──────────────────────────────┤
│  .samples-bar                │
│    [おてほん ▼]               │
├──────────────────────────────┤
│  #output (実行結果)           │
└──────────────────────────────┘
```

- `<select id="samples">` を使用
- 最初の `<option value="">おてほん</option>` はプレースホルダ（選択不可）
- サンプルはJSで動的に `<option>` を追加

---

## D2. サンプルデータ

`src/samples.js` にサンプルデータの配列を定義する。

```js
export const samples = [
  { title: "はじめまして", code: "..." },
  { title: "なまえをきいてみよう", code: "..." },
  // ...
];
```

各エントリは `{ title: string, code: string }` 形式。後からサンプルを追加する場合はこの配列に追加するだけ。

### サンプル一覧

| # | タイトル | Scratch対応ブロック | Python概念 |
|---|---|---|---|
| 1 | はじめまして | — | `print()` |
| 2 | なまえをきいてみよう | 「○○とこたえて待つ」 | `input()` + `print()` |
| 3 | くりかえそう | 「○かいくりかえす」 | `for` ループ |
| 4 | もしも...なら | 「もし○なら」 | `if` / `else` |
| 5 | おみくじ | 「○から○までのらんすう」 | `random` |

### コードの方針

- 先頭行にコメントでScratchとの対応を記載（例: `# Scratchの「○かいくりかえす」とおなじだよ！`）
- 変数名・コメントはひらがな中心
- すべてのサンプルが「じっこう」で正常に動作すること

---

## D3. 選択時の動作フロー

1. ユーザーが `<select>` から項目を選択
2. `value === ""`（プレースホルダ）なら何もしない
3. `confirm("いまのコードがきえるよ。いい？")` で確認
4. OK → `editor.dispatch()` でエディタのコードを全文置換
5. キャンセル → 何もしない
6. いずれの場合も `select.value = ""` でプレースホルダに戻す

コード置換の実装:

```js
editor.dispatch({
  changes: { from: 0, to: editor.state.doc.length, insert: sample.code }
});
```

---

## D4. スタイル

既存のパステルデザインに合わせる。

- `.samples-bar`: `margin: 8px 0`（ツールバーと同じ間隔）
- `#samples`: `border: 2px solid #b8d8e8`, `border-radius: 20px`, `background: #f0f8ff`, `color: #4a90c4`

---

## D5. 対象ファイル

| ファイル | 変更内容 |
|---|---|
| `src/samples.js` | 新規作成。サンプルデータ配列 |
| `src/main.js` | samplesをimport、`<select>`にoption追加、changeイベント処理 |
| `app/index.html` | `.samples-bar`と`<select id="samples">`をツールバー下に追加 |
| `app/style.css` | `.samples-bar`、`#samples`のスタイル追加 |
