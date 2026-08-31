# 選択範囲ハイライト修正 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** エディタでテキスト選択時に薄藤色（#d7d4f0）の背景ハイライトを正常に表示させる

**Architecture:** 2ファイル変更。style.cssの`.cm-content`から不透明背景を除去し、editor.jsのテーマセレクタを修正済み。サーバー変更不要。

**Tech Stack:** CSS, JavaScript (CodeMirror 6 EditorView.theme)

---

### Task 1: style.cssの`.cm-content`背景色を除去

**Files:**
- Modify: `app/style.css:117-119`

- [x] **Step 1: `.cm-content`の`background`プロパティを削除**

変更前:

```css
#editor .cm-editor .cm-content {
  background: #f0f8ff;
}
```

変更後:

```css
#editor .cm-editor .cm-content {
}
```

`.cm-content`を透過にすることで、`z-index: -1`の`.cm-selectionLayer`が見えるようになる。
水色の背景は親要素`#editor`の`background: #f0f8ff`で維持される。

- [x] **Step 2: ビルド**

```bash
npm run build
```

Expected: エラーなし。`app/dist/bundle.js`が生成される。

---

### Task 2: editor.jsのセレクタ修正（完了済み・記録）

**Files:**
- Modify: `src/editor.js:13-17`

- [x] **Step 1: selectionThemeのセレクタとプロパティを修正**

変更前:

```js
const selectionTheme = EditorView.theme({
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
    backgroundColor: "#d7d4f0 !important"
  }
});
```

変更後:

```js
const selectionTheme = EditorView.theme({
  "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground": {
    background: "#d7d4f0 !important"
  },
  ".cm-selectionBackground": {
    background: "#d7d4f080 !important"
  }
});
```

変更点:
- セレクタをデフォルトテーマと同じDOM構造（`> .cm-scroller > .cm-selectionLayer`）に合わせて詳細度を一致させた
- `backgroundColor` → `background` に統一し、ショートハンドの上書き問題を解消
- 非フォーカス時は半透明薄藤色（`#d7d4f080`）で表示

---

### Task 3: 動作確認

- [x] **Step 1: サーバーを再起動**

```bash
pkill -f "node server.js" 2>/dev/null; sleep 1; node server.js &
```

- [x] **Step 2: PC — マウスドラッグ選択**

1. https://exedev-online-python.exedev.net/app/ を開く
2. エディタ内のテキストをマウスドラッグで選択
3. 選択範囲が薄藤色（#d7d4f0）でハイライトされることを確認

- [x] **Step 3: PC — キーボード選択**

1. エディタにフォーカスを置く
2. Shift+矢印キーでテキストを選択
3. 選択範囲が紫色でハイライトされることを確認

- [x] **Step 4: PC — Ctrl+A（全選択）**

1. エディタ内でCtrl+A（またはCmd+A）を押す
2. 全テキストが紫色の背景でハイライトされることを確認

- [x] **Step 5: PC — フォーカス外し**

1. テキストを選択した状態でエディタ外をクリック
2. 選択範囲が半透明薄藤色（#d7d4f080）に変化することを確認

- [x] **Step 6: モバイル — ロングタップ選択**

1. モバイル端末またはDevToolsのモバイルエミュレーションでページを開く
2. エディタ内のテキストをロングタップで選択
3. 選択範囲にハイライトが表示されることを確認

- [x] **Step 7: エディタ背景色の維持確認**

1. エディタの背景が水色（#f0f8ff）のままであることを目視確認
2. 行番号部分（ガター）の背景色（#e8f4fc）が変わっていないことを確認

---

## 実装後の振り返り

（全タスク完了後にresult.mdとして別ファイルに記録）
