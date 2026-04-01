# 設計

## 方針

シンプルに、最小限の変更で3つの原因を解消する。

## 設計判断

### 1. .cm-content の背景色除去

`.cm-content` の `background: #f0f8ff` を除去し、`transparent` にする。
水色の背景は親要素 `#editor` の `background: #f0f8ff` で維持する。

これにより `.cm-selectionLayer`（`z-index: -1`）が `.cm-content` を透過して見えるようになる。

**変更箇所**: `app/style.css`

```css
/* 変更前 */
#editor .cm-editor .cm-content {
  background: #f0f8ff;
}

/* 変更後: background行を削除 */
#editor .cm-editor .cm-content {
  /* backgroundを指定しない（transparentがデフォルト） */
}
```

### 2. セレクタ詳細度の修正（修正済み）

`src/editor.js` の `selectionTheme` セレクタをデフォルトテーマと同じDOM構造に合わせた。

```js
// 修正済み
const selectionTheme = EditorView.theme({
  "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground": {
    background: "#d7d4f0 !important"
  },
  ".cm-selectionBackground": {
    background: "#d7d4f080 !important"
  }
});
```

### 3. プロパティの統一（修正済み）

`backgroundColor` → `background` に統一済み。

## 選択色

- フォーカス時: `#d7d4f0`（薄藤色）
- 非フォーカス時: `#d7d4f080`（半透明薄藤色、50%透明度）
- サイト全体の水色基調と調和する薄藤色を採用

## 影響を受けない箇所

- `.cm-gutters` の背景色（`#e8f4fc`）: 現状維持
- `cm-error-line` の背景色（`#fde8e8`）: 選択範囲との重なりは自然な表示に任せる

## モバイル対応

モバイル端末でのロングタップ選択もスコープに含める。
CodeMirrorの `drawSelection()` はモバイルでも `.cm-selectionBackground` を描画するため、
今回の修正でモバイルも同時に対応される想定。
動作確認時にモバイル表示も検証する。
