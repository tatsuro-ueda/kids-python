# P2-2: SNSシェアボタン — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** LP・アプリの両方にLINE/X/FacebookのSNSシェアボタンを追加する

**Architecture:** `storage.js`に共有Intent URL生成関数を追加。LP側はCTAセクションに静的ボタン+小さなJS。アプリ側は「きょうゆう」ボタン押下後に出力エリアにSNSボタンをDOM追加。

**Tech Stack:** JavaScript (ESM), HTML/CSS, SNS Intent URL

---

### Task 1: storage.jsにSNS共有URL生成関数を追加

**Files:**
- Modify: `src/storage.js`

- [ ] **Step 1: getShareIntentURLs関数を追加**

`src/storage.js`の末尾に追加:

```js
const SHARE_TEXT = "ブラウザだけでPythonが動く！小学生向けプログラミング練習帳";

export function getShareIntentURLs(url) {
  const encoded = encodeURIComponent(url);
  const text = encodeURIComponent(SHARE_TEXT);
  return {
    line: `https://social-plugins.line.me/lineit/share?url=${encoded}`,
    x: `https://twitter.com/intent/tweet?url=${encoded}&text=${text}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
  };
}
```

- [ ] **Step 2: ビルド確認**

```bash
npm run build
```

Expected: エラーなし。

- [ ] **Step 3: コミット**

```bash
git add src/storage.js
git commit -m "feat: add SNS share intent URL generator"
```

---

### Task 2: アプリ側 — きょうゆうボタン押下後にSNSボタンを表示

**Files:**
- Modify: `src/main.js`
- Modify: `app/style.css`

- [ ] **Step 1: main.jsのshareBtn handlerにSNSボタン表示を追加**

`src/main.js`のimportを変更:

```js
import { detectSharedCode, setSharedCode, encodeShareURL, getShareIntentURLs } from "./storage.js";
```

shareBtnのイベントハンドラを以下に書き換え:

```js
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

  const intents = getShareIntentURLs(url);
  const div = document.createElement("div");
  div.className = "share-buttons";
  div.innerHTML = `
    SNSでもシェアできるよ
    <div class="share-links">
      <a class="share-btn share-line" href="${intents.line}" target="_blank" rel="noopener">LINE</a>
      <a class="share-btn share-x" href="${intents.x}" target="_blank" rel="noopener">X</a>
      <a class="share-btn share-fb" href="${intents.facebook}" target="_blank" rel="noopener">Facebook</a>
    </div>
  `;
  outputEl.appendChild(div);
});
```

- [ ] **Step 2: app/style.cssにSNSボタンのスタイルを追加**

`app/style.css`の末尾に追加:

```css
.share-buttons {
  margin-top: 8px;
  font-size: 14px;
}

.share-links {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.share-btn {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  color: #fff;
  text-decoration: none;
}

.share-btn:hover {
  opacity: 0.85;
}

.share-line {
  background: #06C755;
}

.share-x {
  background: #000;
}

.share-fb {
  background: #1877F2;
}
```

- [ ] **Step 3: ビルド確認**

```bash
npm run build
```

Expected: エラーなし。

- [ ] **Step 4: コミット**

```bash
git add src/main.js app/style.css
git commit -m "feat: show SNS share buttons after share in app"
```

---

### Task 3: LP側 — CTAセクションにSNSシェアボタンを追加

**Files:**
- Modify: `index.html`
- Modify: `lp.css`

- [ ] **Step 1: index.htmlのCTAセクションにシェアボタンを追加**

CTAセクションを以下に書き換え:

```html
  <section class="cta-section">
    <a href="/app/" class="cta-btn cta-btn-large">今すぐ試す</a>
    <p class="cta-note">アカウント登録不要・完全無料</p>
    <div class="share-section">
      <p class="share-label">友だちに教える</p>
      <div class="share-links" id="lp-share-links"></div>
    </div>
  </section>
  <script>
    const SHARE_TEXT = "ブラウザだけでPythonが動く！小学生向けプログラミング練習帳";
    const url = encodeURIComponent(location.href.split("#")[0]);
    const text = encodeURIComponent(SHARE_TEXT);
    document.getElementById("lp-share-links").innerHTML = `
      <a class="share-btn share-line" href="https://social-plugins.line.me/lineit/share?url=${url}" target="_blank" rel="noopener">LINE</a>
      <a class="share-btn share-x" href="https://twitter.com/intent/tweet?url=${url}&text=${text}" target="_blank" rel="noopener">X</a>
      <a class="share-btn share-fb" href="https://www.facebook.com/sharer/sharer.php?u=${url}" target="_blank" rel="noopener">Facebook</a>
    `;
  </script>
```

- [ ] **Step 2: lp.cssにシェアセクションのスタイルを追加**

`lp.css`の末尾（`@media`の前）に追加:

```css
/* Share Section */
.share-section {
  margin-top: 24px;
}

.share-label {
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 12px;
}

.share-links {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.share-btn {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  color: #fff;
  text-decoration: none;
}

.share-btn:hover {
  opacity: 0.85;
}

.share-line {
  background: #06C755;
}

.share-x {
  background: #000;
}

.share-fb {
  background: #1877F2;
}
```

- [ ] **Step 3: コミット**

```bash
git add index.html lp.css
git commit -m "feat: add SNS share buttons to LP CTA section"
```

---

### Task 4: 動作確認

- [ ] **Step 1: ビルドしてサーバー起動**

```bash
npm run build
```

- [ ] **Step 2: LP側の確認**

1. http://localhost:3000/ を開く
2. CTAセクション下にLINE/X/Facebookボタンが表示されることを確認
3. 各ボタンをクリックして対応するSNSのシェア画面が新しいタブで開くことを確認

- [ ] **Step 3: アプリ側の確認**

1. http://localhost:3000/app/ を開く
2. コードを入力して「きょうゆう」ボタンを押す
3. 出力エリアにURLコピーメッセージ + SNSボタンが表示されることを確認
4. 各SNSボタンをクリックしてシェア画面が開くことを確認

- [ ] **Step 4: スクリーンショット再生成**

```bash
lsof -ti:3000 | xargs kill -9 2>/dev/null
node server.js &
sleep 1
npm run screenshots
kill %1 2>/dev/null
```
