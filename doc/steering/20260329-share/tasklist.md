# P2: コード共有機能 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** URLフラグメントでコードを共有できる「きょうゆう」ボタンを追加する

**Architecture:** `storage.js`にエンコード/デコード/検出関数を追加し、`loadCode()`を拡張して共有コードを優先返却する。`editor.js`は変更不要。`main.js`でエディタ生成前に共有URL検出 → confirm() → 共有コード設定の流れを呼ぶ。

**Tech Stack:** JavaScript (ESM), esbuild, Base64 (btoa/atob)

---

### Task 1: storage.jsに共有コード関数を追加

**Files:**
- Modify: `src/storage.js`

- [ ] **Step 1: storage.jsにエンコード/デコード/検出/設定関数を追加**

`src/storage.js`を以下に書き換える:

```js
const STORAGE_KEY = "python-editor-code";
const DEFAULT_CODE = 'print("Hello, Python!")';

let sharedCode = null;

export function encodeShareURL(code) {
  const encoded = btoa(encodeURIComponent(code));
  const url = `${location.origin}${location.pathname}#code=${encoded}`;
  return url;
}

export function detectSharedCode() {
  const hash = location.hash;
  if (!hash.startsWith("#code=")) return null;
  try {
    return decodeURIComponent(atob(hash.slice(6)));
  } catch {
    return null;
  }
}

export function setSharedCode(code) {
  sharedCode = code;
}

export function loadCode() {
  if (sharedCode !== null) return sharedCode;
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_CODE;
}

export function saveCode(code) {
  localStorage.setItem(STORAGE_KEY, code);
}
```

変更点:
- `sharedCode`モジュール変数を追加
- `encodeShareURL(code)`: コードをBase64エンコードして共有URLを生成
- `detectSharedCode()`: `location.hash`から`#code=`を検出しデコード。不正なBase64の場合はnullを返す
- `setSharedCode(code)`: 共有コードを内部変数に設定
- `loadCode()`: `sharedCode`があればそれを優先返却

- [ ] **Step 2: ビルドして構文エラーがないことを確認**

```bash
npm run build
```

Expected: エラーなし。`app/dist/bundle.js`が生成される。

- [ ] **Step 3: コミット**

```bash
git add src/storage.js
git commit -m "feat: add share URL encode/decode functions to storage.js"
```

---

### Task 2: app/index.htmlにきょうゆうボタンを追加し、スタイルを設定

**Files:**
- Modify: `app/index.html:19`
- Modify: `app/style.css:99-101`

- [ ] **Step 1: app/index.htmlのツールバーにきょうゆうボタンを追加**

変更前:

```html
    <div class="toolbar">
      <button id="run-btn" disabled>じっこう</button>
      <button id="clear-btn">けす</button>
    </div>
```

変更後:

```html
    <div class="toolbar">
      <button id="run-btn" disabled>じっこう</button>
      <button id="share-btn">きょうゆう</button>
    </div>
```

「けす」ボタンを「きょうゆう」ボタンに置き換える。（functional-design.mdでF4.出力クリアは削除済み）

- [ ] **Step 2: app/style.cssの#clear-btnを#share-btnに変更**

変更前:

```css
#clear-btn {
  background: #f5c6d0;
}
```

変更後:

```css
#share-btn {
  background: #f5c6d0;
}
```

- [ ] **Step 3: ビルドして確認**

```bash
npm run build
```

Expected: エラーなし。

- [ ] **Step 4: コミット**

```bash
git add app/index.html app/style.css
git commit -m "feat: replace clear button with share button in toolbar"
```

---

### Task 3: main.jsにきょうゆうボタンのハンドラと共有URL検出を追加

**Files:**
- Modify: `src/main.js`

- [ ] **Step 1: main.jsを書き換える**

`src/main.js`を以下に書き換える:

```js
import { createEditor, highlightErrorLine, clearErrorHighlight } from "./editor.js";
import { loadPyodide, runCode } from "./runner.js";
import { translateError } from "./errors.js";
import { detectSharedCode, setSharedCode, encodeShareURL } from "./storage.js";

// 共有URL検出（エディタ生成前に実行）
const shared = detectSharedCode();
if (shared !== null) {
  if (confirm("おともだちのコードをひらく？")) {
    setSharedCode(shared);
  }
}

const editorContainer = document.getElementById("editor");
const outputEl = document.getElementById("output");
const runBtn = document.getElementById("run-btn");
const shareBtn = document.getElementById("share-btn");
const statusEl = document.getElementById("status");

const editor = createEditor(editorContainer);

function setStatus(msg) {
  if (msg) {
    statusEl.textContent = msg;
    statusEl.hidden = false;
    runBtn.disabled = true;
  } else {
    statusEl.hidden = true;
    runBtn.disabled = false;
  }
}

function appendOutput(text, type = "stdout") {
  const span = document.createElement("span");
  span.textContent = text + "\n";
  if (type === "stderr") span.className = "error";
  outputEl.appendChild(span);
}

function appendError(errorText) {
  const { japanese, original, lineNumber } = translateError(errorText);

  const wrapper = document.createElement("div");
  wrapper.className = "error-block";

  const line = lineNumber ? `${lineNumber}ぎょうめをみてね: ` : "";
  const msg = document.createElement("div");
  msg.className = "error-message";
  msg.textContent = `${line}${japanese}`;
  wrapper.appendChild(msg);

  const details = document.createElement("details");
  const summary = document.createElement("summary");
  summary.textContent = "くわしくみる";
  details.appendChild(summary);
  const pre = document.createElement("pre");
  pre.className = "error-original";
  pre.textContent = original;
  details.appendChild(pre);
  wrapper.appendChild(details);

  outputEl.appendChild(wrapper);

  if (lineNumber) {
    highlightErrorLine(editor, lineNumber);
  }
}

loadPyodide(setStatus);

runBtn.addEventListener("click", async () => {
  outputEl.textContent = "";
  clearErrorHighlight(editor);
  const code = editor.state.doc.toString();
  runBtn.disabled = true;
  runBtn.textContent = "じっこうちゅう...";
  try {
    await runCode(code, (t) => appendOutput(t), (t) => appendOutput(t, "stderr"));
  } catch (e) {
    console.log("--- raw error ---");
    console.log("e.message:", JSON.stringify(e.message));
    console.log("e.type:", e.type);
    console.log("e:", e);
    appendError(e.message);
  } finally {
    runBtn.disabled = false;
    runBtn.textContent = "じっこう";
  }
});

shareBtn.addEventListener("click", async () => {
  const code = editor.state.doc.toString();
  const url = encodeShareURL(code);
  outputEl.textContent = "";
  try {
    await navigator.clipboard.writeText(url);
    appendOutput("URLをコピーしたよ！おともだちにおしえてあげよう");
  } catch {
    appendOutput("このURLをコピーしてね:");
    appendOutput(url);
  }
});
```

変更点:
- `import`に`detectSharedCode`, `setSharedCode`, `encodeShareURL`を追加
- ファイル先頭（エディタ生成前）で共有URL検出 → `confirm()` → `setSharedCode()`
- `clearBtn`を`shareBtn`に置き換え
- `shareBtn`のクリックハンドラ: コードをエンコードしてクリップボードにコピー、失敗時はURLを出力エリアに表示

- [ ] **Step 2: ビルド**

```bash
npm run build
```

Expected: エラーなし。

- [ ] **Step 3: コミット**

```bash
git add src/main.js
git commit -m "feat: add share button handler and shared URL detection on load"
```

---

### Task 4: 動作確認

- [ ] **Step 1: サーバーを起動**

```bash
node server.js &
```

- [ ] **Step 2: ブラウザで/app/を開き、きょうゆうボタンの動作を確認**

1. http://localhost:3000/app/ を開く
2. エディタにコードを入力
3. 「きょうゆう」ボタンを押す
4. 出力エリアに「URLをコピーしたよ！おともだちにおしえてあげよう」が表示されることを確認

- [ ] **Step 3: 共有URLの読み込みを確認**

1. コピーされたURLを新しいタブで開く
2. 「おともだちのコードをひらく？」の確認ダイアログが表示されることを確認
3. OKを押すと共有コードがエディタに表示されることを確認
4. 再度URLを開き、キャンセルを押すとlocalStorageのコードが表示されることを確認

- [ ] **Step 4: 日本語コードの共有を確認**

1. エディタに `print("こんにちは！")` と入力
2. 「きょうゆう」ボタンを押す
3. 共有URLを新しいタブで開き、OKを押す
4. `print("こんにちは！")` が正しく復元されることを確認

- [ ] **Step 5: スクリーンショットを再生成**

アプリのUIが変わったため（けす→きょうゆう）、LP用スクリーンショットを更新する。

```bash
lsof -ti:3000 | xargs kill -9 2>/dev/null
node server.js &
sleep 1
npm run screenshots
kill %1 2>/dev/null
```

Expected: `assets/screenshots/`の3枚が更新される。

- [ ] **Step 6: コミット**

```bash
git add assets/screenshots/ assets/ogp.png
git commit -m "chore: regenerate screenshots after share button addition"
```
