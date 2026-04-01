# 貼り付けテキスト自動選択 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** テキスト貼り付け時に、貼り付けた範囲を自動的に選択状態にする

**Architecture:** editor.js 1ファイルのみ変更。importに`EditorSelection`を追加し、pasteイベントハンドラ＋updateListenerの拡張を追加。サーバー・HTML・CSS変更不要。

**Tech Stack:** JavaScript (CodeMirror 6 EditorView.domEventHandlers, EditorView.updateListener, EditorSelection)

---

### Task 1: EditorSelectionのimportを追加

**Files:**
- Modify: `src/editor.js:3`

- [x] **Step 1: `@codemirror/state`のimportに`EditorSelection`を追加**

変更前:

```js
import { EditorState, StateEffect, StateField } from "@codemirror/state";
```

変更後:

```js
import { EditorState, StateEffect, StateField, EditorSelection } from "@codemirror/state";
```

- [x] **Step 2: ビルドして構文エラーがないことを確認**

```bash
npm run build
```

Expected: エラーなし。`app/dist/bundle.js`が生成される。

---

### Task 2: pasteSelectExtensionを定義

**Files:**
- Modify: `src/editor.js`（`selectionTheme`の後に追加）

- [x] **Step 1: フラグ変数と拡張を追加**

`selectionTheme` の定義の後（21行目付近）に以下を追加:

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

- [x] **Step 2: `createEditor`の`extensions`配列に`pasteSelectExtension`を追加**

変更前:

```js
extensions: [
  basicSetup,
  python(),
  selectionTheme,
  errorLineField,
```

変更後:

```js
extensions: [
  basicSetup,
  python(),
  selectionTheme,
  pasteSelectExtension,
  errorLineField,
```

- [x] **Step 3: ビルド**

```bash
npm run build
```

Expected: エラーなし。

- [ ] **Step 4: コミット**

```bash
git add src/editor.js
git commit -m "feat: auto-select pasted text in editor"
```

---

### Task 3: 動作確認

- [x] **Step 1: サーバーを再起動**

```bash
pkill -f "node server.js" 2>/dev/null; sleep 1; node server.js &
```

- [ ] **Step 2: Ctrl+V貼り付け → 選択状態になる**

1. 外部でテキストをコピー（例: `print("hello")`）
2. エディタ内でCtrl+V（またはCmd+V）
3. 貼り付けたテキストが薄藤色でハイライト表示されることを確認

- [ ] **Step 3: 右クリックメニューから貼り付け**

1. 外部でテキストをコピー
2. エディタ内で右クリック →「貼り付け」
3. 貼り付けたテキストがハイライト表示されることを確認

- [ ] **Step 4: 選択範囲を置換する貼り付け**

1. エディタ内のテキストを一部選択
2. Ctrl+Vで貼り付け
3. 選択範囲が置換され、置換後のテキストが選択状態になることを確認

- [ ] **Step 5: 通常のタイピングに影響がないこと**

1. エディタにキーボードで文字を入力
2. 入力中に意図しない選択状態にならないことを確認

- [ ] **Step 6: モバイル — 貼り付け動作**

1. モバイル端末またはDevToolsのモバイルエミュレーションでページを開く
2. ロングタップメニューから「貼り付け」を実行
3. 貼り付けたテキストがハイライト表示されることを確認

---

## 実装後の振り返り

（全タスク完了後にresult.mdとして別ファイルに記録）
