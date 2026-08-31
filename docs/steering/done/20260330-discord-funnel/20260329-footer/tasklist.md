# フッター追加 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** LP・アプリにフッター（運営者・連絡先・ポリシーリンク）を追加し、プライバシーポリシーページを新規作成する

**Architecture:** 5ファイル変更。HTMLにフッター追加、CSSにスタイル追加、privacy.htmlを新規作成。サーバー変更不要。

**Tech Stack:** HTML, CSS

---

### Task 1: privacy.htmlを新規作成

**Files:**
- Create: `privacy.html`

- [ ] **Step 1: privacy.htmlを作成**

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>プライバシーポリシー — Pythonれんしゅうちょう</title>
  <meta name="robots" content="noindex">
  <link rel="stylesheet" href="lp.css">
</head>
<body>
  <section class="hero" style="padding: 30px 20px;">
    <a href="/" style="text-decoration: none;">
      <img src="assets/snake.png" alt="ヘビのマスコット" class="hero-mascot" style="width: 60px;">
      <h1>Pythonれんしゅうちょう</h1>
    </a>
  </section>

  <section class="safety">
    <h2>プライバシーポリシー</h2>
    <dl class="safety-list">
      <dt>データの取り扱い</dt>
      <dd>Pythonれんしゅうちょうで入力されたコードや実行結果は、すべてお使いのブラウザ内で処理されます。外部サーバーへのデータ送信は一切行いません。</dd>

      <dt>ローカルストレージの使用</dt>
      <dd>以下の目的でブラウザのローカルストレージを使用しています。
        <ul style="margin-top: 8px; padding-left: 20px;">
          <li>入力したコードの自動保存（ブラウザを閉じても復元できるようにするため）</li>
          <li>ブックマーク案内の表示状態の記録</li>
        </ul>
      </dd>

      <dt>Cookieについて</dt>
      <dd>Cookieは使用していません。</dd>

      <dt>アクセス解析</dt>
      <dd>現在、アクセス解析ツールは使用していません。将来導入する場合は、このページを更新してお知らせします。</dd>

      <dt>お問い合わせ</dt>
      <dd>プライバシーに関するご質問は、<a href="mailto:tatsuro.ueda@feel-physics.jp">tatsuro.ueda@feel-physics.jp</a> までご連絡ください。</dd>
    </dl>
  </section>

  <footer class="site-footer">
    <p>運営: Feel Physics</p>
    <p><a href="mailto:tatsuro.ueda@feel-physics.jp">お問い合わせ</a> ｜ <a href="/privacy.html">プライバシーポリシー</a></p>
    <p>&copy; 2026 Feel Physics</p>
  </footer>
</body>
</html>
```

- [ ] **Step 2: コミット**

```bash
git add privacy.html
git commit -m "feat: add privacy policy page"
```

---

### Task 2: LP・アプリにフッターHTMLを追加

**Files:**
- Modify: `index.html`
- Modify: `app/index.html`

- [ ] **Step 1: index.html（LP）の`</body>`の前にフッターを追加**

`</script>` と `</body>` の間に挿入:

```html
  <footer class="site-footer">
    <p>運営: Feel Physics</p>
    <p><a href="mailto:tatsuro.ueda@feel-physics.jp">お問い合わせ</a> ｜ <a href="/privacy.html">プライバシーポリシー</a></p>
    <p>&copy; 2026 Feel Physics</p>
  </footer>
```

- [ ] **Step 2: app/index.html（アプリ）の`</body>`の前にフッターを追加**

`<script type="module" src="dist/bundle.js"></script>` と `</body>` の間に挿入:

```html
  <footer class="site-footer">
    <p>運営: Feel Physics</p>
    <p><a href="mailto:tatsuro.ueda@feel-physics.jp">お問い合わせ</a> ｜ <a href="/privacy.html">プライバシーポリシー</a></p>
    <p>&copy; 2026 Feel Physics</p>
  </footer>
```

- [ ] **Step 3: コミット**

```bash
git add index.html app/index.html
git commit -m "feat: add footer to LP and app"
```

---

### Task 3: CSS にフッタースタイルを追加

**Files:**
- Modify: `lp.css`
- Modify: `app/style.css`

- [ ] **Step 1: lp.cssの末尾（`@media`の前）にフッタースタイルを追加**

```css
/* Footer */
.site-footer {
  text-align: center;
  padding: 24px 20px;
  margin-top: 20px;
  font-size: 0.8rem;
  color: #888;
}

.site-footer a {
  color: #4a90c4;
  text-decoration: none;
}

.site-footer a:hover {
  text-decoration: underline;
}

.site-footer p {
  margin: 4px 0;
}
```

- [ ] **Step 2: app/style.cssの末尾に同じスタイルを追加**

lp.cssと同じ `.site-footer` スタイルを追加する。

- [ ] **Step 3: コミット**

```bash
git add lp.css app/style.css
git commit -m "feat: add footer styles to LP and app CSS"
```

---

### Task 4: 動作確認

- [ ] **Step 1: サーバー起動して全ページ確認**

```bash
node server.js &
sleep 1

echo "--- LP footer ---"
curl -s http://localhost:3000/ | grep -c "site-footer"

echo "--- App footer ---"
curl -s http://localhost:3000/app/ | grep -c "site-footer"

echo "--- Privacy page ---"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/privacy.html

kill %1
```

Expected: LP 1, App 1, Privacy 200
