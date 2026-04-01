# 設計

## 方針

editor.jsに約15行の拡張を追加するのみ。他ファイルの変更は不要。

## 仕組み

2つの部品を組み合わせる:

1. **pasteイベント検出**: ブラウザの`paste`イベントを監視し、「今から貼り付けが来る」というフラグを立てる
2. **挿入範囲の選択**: テキストが挿入されたとき、フラグが立っていれば挿入範囲を選択状態にする

## 設計判断

### updateListenerを別々に追加する

既存の`updateListener`（コード保存用）とは別に、貼り付け選択用の`updateListener`を追加する。
1つにまとめず、関心を分離する。万一問題があれば片方だけ外せる。

### EditorSelectionのimport追加

選択範囲の指定に`EditorSelection.range(from, to)`を使用するため、
`@codemirror/state`からのimportに`EditorSelection`を追加する。

## 実装

**変更箇所**: `src/editor.js`

### 1. importの追加

```js
// 変更前
import { EditorState, StateEffect, StateField } from "@codemirror/state";

// 変更後
import { EditorState, StateEffect, StateField, EditorSelection } from "@codemirror/state";
```

### 2. 拡張の定義（selectionThemeの後に追加）

```js
let isPasting = false;

const pasteSelectExtension = [
  EditorView.domEventHandlers({
    paste() { isPasting = true; }
  }),
  EditorView.updateListener.of((update) => {
    if (isPasting && update.docChanged) {
      isPasting = false;
      let from, to;
      update.changes.iterChanges((_fromA, _toA, fromB, toB) => {
        from = fromB;
        to = toB;
      });
      if (from !== undefined && from !== to) {
        update.view.dispatch({
          selection: EditorSelection.range(from, to)
        });
      }
    }
  })
];
```

### 3. extensionsへの追加

`createEditor`の`extensions`配列に`pasteSelectExtension`を追加する。

## 影響を受けない箇所

- 通常のキーボード入力: `isPasting`フラグが立たないため影響なし
- コード自動保存: 別の`updateListener`なので独立して動作
- 選択ハイライト表示: 20260401-selection-specificityで修正済み、そのまま活用される
