# P1解決策: 発見経路の構築 — Design

## 概要

ランディングページ（LP）を新設し、SEO・OGPを整備して、保護者の検索行動からプロダクトへの導線を作る。

---

## 1. ファイル構成の変更

### 現状

```
/
├── index.html          ← アプリ（ルート直下）
├── style.css
├── server.js
├── dist/bundle.js
├── vendor/pyodide/
└── assets/snake.png
```

### 変更後

```
/
├── index.html          ← LP（新規作成）
├── lp.css              ← LP用スタイル（新規作成）
├── app/
│   ├── index.html      ← アプリ（既存index.htmlを移動）
│   ├── style.css       ← アプリ用スタイル（既存style.cssを移動）
│   └── dist/bundle.js  ← バンドル（既存を移動）
├── server.js           ← ルーティング更新
├── vendor/pyodide/     ← 既存のまま
├── assets/
│   ├── snake.png       ← 既存
│   ├── ogp.png         ← 新規（OGP画像）
│   └── screenshots/    ← 新規（Playwright自動生成）
│       ├── step-open.png
│       ├── step-write.png
│       └── step-run.png
└── scripts/
    └── screenshots.js  ← 新規（Playwright撮影スクリプト）
```

### 移動するファイル

| 元 | 先 | 備考 |
|---|---|---|
| `index.html` | `app/index.html` | パス参照を相対パスに更新 |
| `style.css` | `app/style.css` | 変更なし |
| `dist/` | `app/dist/` | ビルド出力先の変更 |

`app/index.html` 内のパス更新:
- `href="style.css"` → そのまま（同階層）
- `src="dist/bundle.js"` → そのまま（同階層）
- `src="assets/snake.png"` → `src="../assets/snake.png"`
- `vendor/pyodide/` への参照（runner.js内） → `../vendor/pyodide/`

---

## 2. server.jsの更新

```js
http.createServer((req, res) => {
  let url = req.url.split("?")[0];

  // ルート → LP
  if (url === "/") url = "/index.html";

  // /app → /app/index.html
  if (url === "/app" || url === "/app/") url = "/app/index.html";

  let filePath = path.join(ROOT, url);
  // ... 以降は既存のファイル配信ロジック
});
```

---

## 3. LP（index.html）の設計

### 3.1 HTML構造

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
  <!-- S1: メインビジュアル -->
  <section class="hero">
    <img src="assets/snake.png" alt="ヘビのマスコット" class="hero-mascot">
    <h1>Pythonれんしゅうちょう</h1>
    <p class="hero-catch">ブラウザだけでPythonが動く。<br>小学生のためのプログラミング練習帳</p>
    <p class="hero-sub">インストール不要。日本語エラー。ぜんぶひらがな。</p>
    <a href="/app/" class="cta-btn">今すぐ試す</a>
  </section>

  <!-- S2: こんな経験ありませんか？ -->
  <section class="problems">
    <h2>こんな経験ありませんか？</h2>
    <ul class="problem-list">
      <li>Pythonをインストールしようとしたけど、難しくて断念した</li>
      <li>Chromebookだからソフトを入れられない</li>
      <li>オンラインのPython環境は全部英語で、子どもには使えなかった</li>
      <li>エラーメッセージが英語で、何を直せばいいか分からない</li>
    </ul>
  </section>

  <!-- S3: 特徴 -->
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

  <!-- S4: 安心ポイント -->
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

  <!-- S5: 使い方 -->
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

  <!-- S6: CTA -->
  <section class="cta-section">
    <a href="/app/" class="cta-btn cta-btn-large">今すぐ試す</a>
    <p class="cta-note">アカウント登録不要・完全無料</p>
  </section>
</body>
</html>
```

### 3.2 lp.cssの設計方針

アプリ（style.css）と共通のデザイントークンを使い、LP固有のレイアウトを定義する。

**共通デザイントークン**（アプリと揃える）:

| トークン | 値 | 用途 |
|---|---|---|
| 背景色 | `#e8f4fc` | ページ背景 |
| カード背景 | `#f0f8ff` | 特徴カード、ステップ |
| ボーダー | `#b8d8e8` | カード枠線 |
| アクセント | `#7ec8e3` | CTAボタン |
| テキスト | `#333` | 本文 |
| 見出し | `#4a90c4` | h1, h2 |
| 角丸 | `12px`（カード）, `20px`（ボタン） | |

**LP固有のスタイル**:

- `.hero`: 中央寄せ、パディング大きめ、背景ドットパターン（アプリと同じ）
- `.problem-list`: チェックマーク付きリスト、各項目にパディング
- `.feature-grid`: 2x2グリッド（モバイルでは1カラム）
- `.feature-card`: 白背景カード、ボーダー、角丸12px
- `.safety-list`: `<dl>`による定義リスト
- `.steps`: 横並び3カラム（モバイルでは縦積み）
- `.step img`: 幅100%、ボーダー・角丸付き、影あり
- `.cta-btn`: アプリの`#run-btn`と同じスタイル、大きめサイズ
- `.cta-btn-large`: さらに大きい最終CTA

**レスポンシブ**:

```css
/* モバイル（デフォルト）: 1カラム */
.feature-grid { grid-template-columns: 1fr; }
.steps { flex-direction: column; }

/* タブレット・PC */
@media (min-width: 768px) {
  .feature-grid { grid-template-columns: 1fr 1fr; }
  .steps { flex-direction: row; }
}
```

---

## 4. app/index.htmlの変更

既存の`index.html`を`app/index.html`に移動し、以下を変更する。

### 4.1 メタタグ追加

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pythonれんしゅうちょう</title>
  <meta name="robots" content="noindex">
  <link rel="stylesheet" href="style.css">
</head>
```

### 4.2 アセットパスの修正

```html
<img src="../assets/snake.png" alt="ヘビ" class="mascot">
```

### 4.3 runner.js内のPyodideパス修正

`src/runner.js`内のPyodideロードパスを更新する。

```js
// 変更前
indexURL: "/vendor/pyodide/"
// 変更後
indexURL: "../vendor/pyodide/"
```

---

## 5. Playwrightスクリーンショット撮影

### 5.1 scripts/screenshots.js

```js
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });

  // Step 1: 開く（初期状態）
  await page.goto("http://localhost:3000/app/");
  await page.waitForSelector(".cm-editor");
  await page.screenshot({ path: "assets/screenshots/step-open.png" });

  // Step 2: 書く（コード入力後）
  const editor = page.locator(".cm-content");
  await editor.click();
  await editor.fill('print("こんにちは！")');
  await page.screenshot({ path: "assets/screenshots/step-write.png" });

  // Step 3: 実行（出力表示後）
  await page.click("#run-btn");
  await page.waitForFunction(
    () => document.getElementById("output").textContent.includes("こんにちは")
  );
  await page.screenshot({ path: "assets/screenshots/step-run.png" });

  await browser.close();
})();
```

### 5.2 実行方法

```bash
npx playwright install chromium
node scripts/screenshots.js
```

package.jsonにスクリプトを追加:

```json
{
  "scripts": {
    "screenshots": "node scripts/screenshots.js"
  }
}
```

---

## 6. OGP画像の生成

マスコット画像（`assets/snake.png`）を使い、HTML+CSSでOGP画像を組み立て、Playwrightでスクリーンショットを撮る。

### 6.1 scripts/screenshots.jsに追加

```js
// OGP画像生成
const ogpPage = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await ogpPage.setContent(`
  <div style="
    width: 1200px; height: 630px;
    background: #e8f4fc;
    display: flex; align-items: center; justify-content: center;
    flex-direction: column; gap: 20px;
    font-family: sans-serif;
  ">
    <img src="http://localhost:3000/assets/snake.png" style="width: 120px;">
    <h1 style="color: #4a90c4; font-size: 48px; margin: 0;">
      Pythonれんしゅうちょう
    </h1>
    <p style="color: #666; font-size: 24px; margin: 0;">
      ブラウザだけでPythonが動く。小学生のためのプログラミング練習帳
    </p>
  </div>
`);
await ogpPage.screenshot({ path: "assets/ogp.png" });
```

---

## 7. esbuildの出力先変更

### 7.1 package.jsonのbuildスクリプト更新

```json
{
  "scripts": {
    "build": "esbuild src/main.js --bundle --outfile=app/dist/bundle.js --format=esm"
  }
}
```

---

## 8. 実装順序

| 順 | 作業 | 依存 |
|---|---|---|
| 1 | `app/`ディレクトリ作成、既存ファイル移動 | なし |
| 2 | パス参照の修正（HTML, runner.js） | 1 |
| 3 | esbuildの出力先変更、ビルド確認 | 2 |
| 4 | server.jsのルーティング更新 | 1 |
| 5 | アプリの動作確認（`/app/`で正常動作） | 2, 3, 4 |
| 6 | `lp.css` 作成 | なし |
| 7 | `index.html`（LP）作成 | 6 |
| 8 | Playwrightスクリーンショット撮影 | 5 |
| 9 | OGP画像生成 | 5 |
| 10 | LP にスクリーンショット・OGP画像を組み込み | 7, 8, 9 |
| 11 | 全体の動作確認 | 10 |
