# P1: 発見経路の構築 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** LP新設 + SEO/OGP整備で、保護者の検索行動からプロダクトへの導線を作る

**Architecture:** 既存アプリを`app/`サブディレクトリに移動し、ルートに軽量LP（HTML+CSS）を配置。Pyodideを読み込まないLPでCore Web Vitalsを確保。Playwrightでスクリーンショット・OGP画像を自動生成。

**Tech Stack:** HTML/CSS（LP）、Node.js（server.js）、esbuild（バンドル）、Playwright（スクリーンショット）

---

### Task 1: アプリをapp/サブディレクトリに移動

**Files:**
- Move: `index.html` → `app/index.html`
- Move: `style.css` → `app/style.css`
- Move: `dist/` → `app/dist/`

- [ ] **Step 1: app/ディレクトリを作成し、ファイルを移動**

```bash
mkdir -p app
git mv index.html app/index.html
git mv style.css app/style.css
git mv dist app/dist
```

- [ ] **Step 2: app/index.htmlのアセットパスを修正**

`app/index.html`の`<img>`タグを修正:

```html
<!-- 変更前 -->
<img src="assets/snake.png" alt="ヘビ" class="mascot">
<!-- 変更後 -->
<img src="../assets/snake.png" alt="ヘビ" class="mascot">
```

- [ ] **Step 3: app/index.htmlにnoindexメタタグを追加**

`<head>`内、`<title>`の直後に追加:

```html
<meta name="robots" content="noindex">
```

- [ ] **Step 4: コミット**

```bash
git add -A
git commit -m "refactor: move app files to app/ subdirectory for LP separation"
```

---

### Task 2: Pyodideパスとesbuild出力先を修正

**Files:**
- Modify: `src/runner.js:18-20`
- Modify: `package.json:10`

- [ ] **Step 1: src/runner.jsのPyodideパスを修正**

```js
// 変更前（2箇所）
const mod = await import("/vendor/pyodide/pyodide.mjs");
pyodide = await mod.loadPyodide({
  indexURL: "/vendor/pyodide/",
});

// 変更後
const mod = await import("../vendor/pyodide/pyodide.mjs");
pyodide = await mod.loadPyodide({
  indexURL: "../vendor/pyodide/",
});
```

- [ ] **Step 2: package.jsonのbuildスクリプトを修正**

```json
"build": "esbuild src/main.js --bundle --outfile=app/dist/bundle.js --format=esm --external:../vendor/*"
```

`--external`も`../vendor/*`に更新する（バンドル時にvendorを外部扱いにするパターン）。

- [ ] **Step 3: ビルドを実行して成功を確認**

```bash
npm run build
```

Expected: `app/dist/bundle.js`が生成される。エラーなし。

- [ ] **Step 4: コミット**

```bash
git add src/runner.js package.json app/dist/bundle.js
git commit -m "fix: update Pyodide paths and esbuild output for app/ directory"
```

---

### Task 3: server.jsのルーティングを更新

**Files:**
- Modify: `server.js`

- [ ] **Step 1: server.jsを更新**

`server.js`全体を以下に書き換える:

```js
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const ROOT = __dirname;

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".wasm": "application/wasm",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

http.createServer((req, res) => {
  let url = req.url.split("?")[0];

  if (url === "/") url = "/index.html";
  if (url === "/app" || url === "/app/") url = "/app/index.html";

  const filePath = path.join(ROOT, url);
  const ext = path.extname(filePath);
  const mime = MIME[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": mime });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
```

変更点:
- `/` → `/index.html`（LP）
- `/app` と `/app/` → `/app/index.html`（アプリ）
- `.png`と`.svg`のMIMEタイプを追加

- [ ] **Step 2: サーバーを起動してアプリの動作確認**

```bash
node server.js &
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/app/
# Expected: 200
kill %1
```

- [ ] **Step 3: コミット**

```bash
git add server.js
git commit -m "feat: update server routing for LP at / and app at /app/"
```

---

### Task 4: LP用CSS（lp.css）を作成

**Files:**
- Create: `lp.css`

- [ ] **Step 1: lp.cssを作成**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: sans-serif;
  color: #333;
  background-color: #e8f4fc;
  background-image: radial-gradient(#d0e8f5 10%, transparent 10%);
  background-size: 30px 30px;
  line-height: 1.7;
}

section {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

h1 {
  font-size: 1.8rem;
  color: #4a90c4;
}

h2 {
  font-size: 1.4rem;
  color: #4a90c4;
  margin-bottom: 20px;
  text-align: center;
}

h3 {
  font-size: 1.1rem;
  color: #4a90c4;
  margin-bottom: 8px;
}

/* Hero */
.hero {
  text-align: center;
  padding: 60px 20px;
}

.hero-mascot {
  width: 100px;
  height: auto;
}

.hero-catch {
  font-size: 1.2rem;
  color: #555;
  margin: 16px 0 8px;
}

.hero-sub {
  font-size: 1rem;
  color: #888;
  margin-bottom: 24px;
}

/* CTA Button */
.cta-btn {
  display: inline-block;
  background: #7ec8e3;
  color: #fff;
  font-weight: bold;
  font-size: 1.1rem;
  padding: 14px 40px;
  border-radius: 20px;
  text-decoration: none;
}

.cta-btn:hover {
  opacity: 0.85;
}

.cta-btn-large {
  font-size: 1.3rem;
  padding: 18px 56px;
}

/* Problems */
.problems {
  background: #fff;
  border-radius: 12px;
  border: 2px solid #b8d8e8;
}

.problem-list {
  list-style: none;
}

.problem-list li {
  padding: 12px 0;
  border-bottom: 1px solid #e8f4fc;
  padding-left: 28px;
  position: relative;
}

.problem-list li:last-child {
  border-bottom: none;
}

.problem-list li::before {
  content: "\2713";
  position: absolute;
  left: 0;
  color: #f5c6d0;
  font-weight: bold;
}

/* Features */
.feature-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.feature-card {
  background: #f0f8ff;
  border: 2px solid #b8d8e8;
  border-radius: 12px;
  padding: 20px;
}

.feature-card p {
  color: #555;
}

/* Safety */
.safety {
  background: #fff;
  border-radius: 12px;
  border: 2px solid #b8d8e8;
}

.safety-list dt {
  font-weight: bold;
  color: #4a90c4;
  margin-top: 16px;
}

.safety-list dt:first-child {
  margin-top: 0;
}

.safety-list dd {
  color: #555;
  margin-left: 0;
  margin-top: 4px;
}

/* How-to Steps */
.steps {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.step {
  text-align: center;
  background: #f0f8ff;
  border: 2px solid #b8d8e8;
  border-radius: 12px;
  padding: 20px;
}

.step-number {
  display: inline-block;
  width: 36px;
  height: 36px;
  line-height: 36px;
  border-radius: 50%;
  background: #7ec8e3;
  color: #fff;
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.step img {
  width: 100%;
  border: 2px solid #b8d8e8;
  border-radius: 8px;
  margin: 12px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.step p {
  color: #555;
}

/* CTA Section */
.cta-section {
  text-align: center;
  padding: 48px 20px;
}

.cta-note {
  margin-top: 12px;
  color: #888;
  font-size: 0.9rem;
}

/* Responsive */
@media (min-width: 768px) {
  .feature-grid {
    grid-template-columns: 1fr 1fr;
  }

  .steps {
    flex-direction: row;
  }

  .step {
    flex: 1;
  }
}
```

- [ ] **Step 2: コミット**

```bash
git add lp.css
git commit -m "feat: add LP stylesheet with responsive design"
```

---

### Task 5: LP（index.html）を作成

**Files:**
- Create: `index.html`

- [ ] **Step 1: index.html（LP）を作成**

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pythonれんしゅうちょう — 小学生向けブラウザPython学習環境</title>
  <meta name="description" content="インストール不要、ブラウザだけで動く小学生向けPython学習環境。ひらがなUI、日本語エラーメッセージ、自動保存。Chromebook対応。">
  <meta property="og:title" content="Pythonれんしゅうちょう">
  <meta property="og:description" content="ブラウザだけでPythonが動く。小学生のためのプログラミング練習帳">
  <meta property="og:image" content="/assets/ogp.png">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="lp.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Pythonれんしゅうちょう",
    "description": "小学生向けブラウザPython学習環境",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Any (Web Browser)",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "JPY" },
    "audience": {
      "@type": "EducationalAudience",
      "educationalRole": "student",
      "typicalAgeRange": "6-8"
    }
  }
  </script>
</head>
<body>
  <section class="hero">
    <img src="assets/snake.png" alt="ヘビのマスコット" class="hero-mascot">
    <h1>Pythonれんしゅうちょう</h1>
    <p class="hero-catch">ブラウザだけでPythonが動く。<br>小学生のためのプログラミング練習帳</p>
    <p class="hero-sub">インストール不要。日本語エラー。ぜんぶひらがな。</p>
    <a href="/app/" class="cta-btn">今すぐ試す</a>
  </section>

  <section class="problems">
    <h2>こんな経験ありませんか？</h2>
    <ul class="problem-list">
      <li>Pythonをインストールしようとしたけど、難しくて断念した</li>
      <li>Chromebookだからソフトを入れられない</li>
      <li>オンラインのPython環境は全部英語で、子どもには使えなかった</li>
      <li>エラーメッセージが英語で、何を直せばいいか分からない</li>
    </ul>
  </section>

  <section class="features">
    <h2>特徴</h2>
    <div class="feature-grid">
      <div class="feature-card">
        <h3>インストール不要</h3>
        <p>ブラウザを開くだけ。Chromebookでもタブレットでも使えます。</p>
      </div>
      <div class="feature-card">
        <h3>ぜんぶひらがな</h3>
        <p>ボタンもメニューもひらがな。小学1年生から使えます。</p>
      </div>
      <div class="feature-card">
        <h3>日本語エラー</h3>
        <p>英語のエラーを子どもの言葉に翻訳。直し方も教えてくれます。</p>
      </div>
      <div class="feature-card">
        <h3>コードが消えない</h3>
        <p>自動保存。ブラウザを閉じても大丈夫。</p>
      </div>
    </div>
  </section>

  <section class="safety">
    <h2>保護者の方へ — 安心ポイント</h2>
    <dl class="safety-list">
      <dt>安全</dt>
      <dd>データはお子さまのブラウザ内で処理されます。外部サーバーへの送信はありません。</dd>
      <dt>本物のPython</dt>
      <dd>WebAssembly技術（Pyodide）により、標準のPython 3が動きます。</dd>
      <dt>将来も役立つ</dt>
      <dd>標準的なPython構文をそのまま学べるため、将来本格的な環境に移行しても知識が活かせます。</dd>
      <dt>完全無料</dt>
      <dd>アカウント登録も不要です。</dd>
    </dl>
  </section>

  <section class="howto">
    <h2>使い方はかんたん3ステップ</h2>
    <div class="steps">
      <div class="step">
        <span class="step-number">1</span>
        <h3>開く</h3>
        <img src="assets/screenshots/step-open.png" alt="ブラウザでPythonれんしゅうちょうを開いた画面">
        <p>URLにアクセスするだけ。</p>
      </div>
      <div class="step">
        <span class="step-number">2</span>
        <h3>書く</h3>
        <img src="assets/screenshots/step-write.png" alt="エディタにPythonコードを入力している画面">
        <p>コードを書く。</p>
      </div>
      <div class="step">
        <span class="step-number">3</span>
        <h3>実行</h3>
        <img src="assets/screenshots/step-run.png" alt="じっこうボタンを押して結果が表示された画面">
        <p>ボタンを押して結果を見る。</p>
      </div>
    </div>
  </section>

  <section class="cta-section">
    <a href="/app/" class="cta-btn cta-btn-large">今すぐ試す</a>
    <p class="cta-note">アカウント登録不要・完全無料</p>
  </section>
</body>
</html>
```

- [ ] **Step 2: サーバーを起動してLPの表示を確認**

```bash
node server.js &
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
# Expected: 200
kill %1
```

- [ ] **Step 3: コミット**

```bash
git add index.html
git commit -m "feat: add landing page with SEO meta tags and structured data"
```

---

### Task 6: PlaywrightでスクリーンショットとOGP画像を生成

**Files:**
- Create: `scripts/screenshots.js`
- Modify: `package.json` (scripts追加)
- Output: `assets/screenshots/step-open.png`, `step-write.png`, `step-run.png`, `assets/ogp.png`

- [ ] **Step 1: Playwrightをインストール**

```bash
npm install -D playwright
npx playwright install chromium
```

- [ ] **Step 2: scripts/screenshots.jsを作成**

```js
const { chromium } = require("playwright");

const BASE = "http://localhost:3000";

(async () => {
  const browser = await chromium.launch();

  // --- App screenshots ---
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  await page.goto(`${BASE}/app/`);
  await page.waitForSelector(".cm-editor");

  // Step 1: 開く（初期状態）
  await page.screenshot({ path: "assets/screenshots/step-open.png" });

  // Step 2: 書く（コード入力）
  // CodeMirrorのcontenteditable要素にフォーカスしてキー入力
  const cmContent = page.locator(".cm-content");
  await cmContent.click();
  // 既存テキストを全選択して上書き
  await page.keyboard.press("Control+a");
  await page.keyboard.type('print("こんにちは！")');
  await page.screenshot({ path: "assets/screenshots/step-write.png" });

  // Step 3: 実行（出力表示）
  await page.click("#run-btn");
  // Pyodideのロードと実行を待つ（最大30秒）
  await page.waitForFunction(
    () => document.getElementById("output").textContent.includes("こんにちは"),
    { timeout: 30000 }
  );
  await page.screenshot({ path: "assets/screenshots/step-run.png" });

  // --- OGP image ---
  const ogpPage = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await ogpPage.setContent(`
    <div style="
      width: 1200px; height: 630px;
      background: #e8f4fc;
      background-image: radial-gradient(#d0e8f5 10%, transparent 10%);
      background-size: 30px 30px;
      display: flex; align-items: center; justify-content: center;
      flex-direction: column; gap: 20px;
      font-family: sans-serif;
    ">
      <img src="${BASE}/assets/snake.png" style="width: 120px;">
      <h1 style="color: #4a90c4; font-size: 48px; margin: 0;">
        Pythonれんしゅうちょう
      </h1>
      <p style="color: #666; font-size: 24px; margin: 0;">
        ブラウザだけでPythonが動く。小学生のためのプログラミング練習帳
      </p>
    </div>
  `);
  await ogpPage.screenshot({ path: "assets/ogp.png" });

  await browser.close();
  console.log("Screenshots and OGP image generated.");
})();
```

- [ ] **Step 3: screenshotsディレクトリを作成**

```bash
mkdir -p assets/screenshots
```

- [ ] **Step 4: package.jsonにscreenshotsスクリプトを追加**

`package.json`の`scripts`に追加:

```json
"screenshots": "node scripts/screenshots.js"
```

- [ ] **Step 5: サーバーを起動してスクリーンショットを撮影**

```bash
node server.js &
SERVER_PID=$!
sleep 1
npm run screenshots
kill $SERVER_PID
```

Expected: 以下のファイルが生成される
- `assets/screenshots/step-open.png`
- `assets/screenshots/step-write.png`
- `assets/screenshots/step-run.png`
- `assets/ogp.png`

- [ ] **Step 6: 生成されたファイルを確認**

```bash
ls -la assets/screenshots/ assets/ogp.png
```

Expected: 4つのPNGファイルが存在し、それぞれ0バイトでないこと。

- [ ] **Step 7: コミット**

```bash
git add scripts/screenshots.js assets/screenshots/ assets/ogp.png package.json
git commit -m "feat: add Playwright screenshot generation for LP and OGP image"
```

---

### Task 7: 全体の動作確認

- [ ] **Step 1: ビルドを実行**

```bash
npm run build
```

Expected: エラーなし。`app/dist/bundle.js`が生成される。

- [ ] **Step 2: サーバーを起動して全ページを確認**

```bash
node server.js &
SERVER_PID=$!
sleep 1

# LP
echo "--- LP ---"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
# Expected: 200

# App
echo "--- App ---"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/app/
# Expected: 200

# LP CSS
echo "--- LP CSS ---"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/lp.css
# Expected: 200

# App CSS
echo "--- App CSS ---"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/app/style.css
# Expected: 200

# Bundle
echo "--- Bundle ---"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/app/dist/bundle.js
# Expected: 200

# OGP image
echo "--- OGP ---"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/assets/ogp.png
# Expected: 200

# Screenshots
echo "--- Screenshots ---"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/assets/screenshots/step-open.png
# Expected: 200

kill $SERVER_PID
```

- [ ] **Step 3: LPのメタタグを確認**

```bash
node server.js &
SERVER_PID=$!
sleep 1
curl -s http://localhost:3000/ | grep -E "(og:|twitter:|description|ld\+json)" | head -10
kill $SERVER_PID
```

Expected: OGPタグ、description、JSON-LDが含まれている。

- [ ] **Step 4: app/index.htmlのnoindexを確認**

```bash
node server.js &
SERVER_PID=$!
sleep 1
curl -s http://localhost:3000/app/ | grep "noindex"
kill $SERVER_PID
```

Expected: `<meta name="robots" content="noindex">`が含まれている。

- [ ] **Step 5: .gitignoreにnode_modulesを追加（未設定の場合）**

```bash
echo "node_modules/" >> .gitignore
```

- [ ] **Step 6: 最終コミット**

```bash
git add -A
git commit -m "feat: complete LP with SEO, OGP, and screenshots for P1 growth"
```
