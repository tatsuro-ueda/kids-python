# P6解決策: おてほんサンプルコード集 — Design

## 対象ファイル

| ファイル | 変更内容 |
|---|---|
| `src/samples.js` | 新規作成。サンプルデータ配列 |
| `src/main.js` | samples import、select change イベント追加 |
| `app/index.html` | `.samples-bar` と `<select id="samples">` 追加 |
| `app/style.css` | `.samples-bar`, `#samples` スタイル追加 |

## UI配置

```
┌──────────────────────────────────┐
│  header (マスコット + タイトル)    │
├──────────────────────────────────┤
│  #status (非表示時hidden)         │
├──────────────────────────────────┤
│  #editor (CodeMirror)            │
├──────────────────────────────────┤
│  .toolbar  [じっこう] [きょうゆう] │
├──────────────────────────────────┤  ← 新規追加
│  .samples-bar                    │
│    <select id="samples">         │
│      おてほん (placeholder)       │
│      はじめまして                  │
│      なまえをきいてみよう           │
│      くりかえそう                  │
│      もしも...なら                │
│      おみくじ                     │
│    </select>                     │
├──────────────────────────────────┤
│  #output (実行結果)               │
└──────────────────────────────────┘
```

配置はツールバーの直後、出力エリアの直前とする。

## サンプルデータ構造

`src/samples.js` が export する配列:

```js
export const samples = [
  {
    title: "はじめまして",
    code: "# Scratch: ...\nprint(\"こんにちは！\")\n"
  },
  // ...
];
```

- 各エントリは `{ title: string, code: string }` 形式
- `code` の先頭行にコメントで Scratch との対応を記載
- 変数名・コメントはひらがな中心

## select 変更時の動作フロー

1. ユーザーが `<select>` から項目を選択
2. `value === ""` (placeholder) なら何もしない
3. `confirm("いまのコードがきえるよ。いい？")` で確認
4. OK → `editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: code } })` で全文置換
5. Cancel → 何もしない
6. いずれの場合も `select.value = ""` で初期値に戻す

## スタイル方針

- `.samples-bar`: `margin: 8px 0` でツールバーと同じ間隔
- `#samples`: 既存のパステルカラー (`#b8d8e8`, `#f0f8ff`) に合わせた `border-radius: 20px` のドロップダウン
