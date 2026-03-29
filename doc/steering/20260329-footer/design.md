# フッター追加 — Design

## 方式

LP（index.html）とアプリ（app/index.html）の両方に共通のフッターHTMLを追加する。プライバシーポリシーは別ページ（privacy.html）として新規作成する。

---

## D1. フッターHTML

LP・アプリ共通の構造:

```html
<footer class="site-footer">
  <p>運営: Feel Physics</p>
  <p><a href="mailto:tatsuro.ueda@feel-physics.jp">お問い合わせ</a> ｜ <a href="/privacy.html">プライバシーポリシー</a></p>
  <p>&copy; 2026 Feel Physics</p>
</footer>
```

---

## D2. フッタースタイル

LP（lp.css）とアプリ（app/style.css）の両方に同じスタイルを追加:

```css
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

---

## D3. プライバシーポリシーページ（privacy.html）

- ルート直下に配置（`/privacy.html`）
- LPと同じlp.cssを使用
- 内容:
  - データの取り扱い（ブラウザ内処理、外部送信なし）
  - localStorageの使用目的（コード自動保存、ブックマークバナー表示状態）
  - Cookie（使用していない）
  - 連絡先

---

## D4. server.jsの変更

変更不要。既存の静的ファイル配信で `/privacy.html` はそのまま配信される。

---

## D5. 対象ファイル

| ファイル | 変更内容 |
|---|---|
| `index.html` | `</body>`の前にフッターHTMLを追加 |
| `app/index.html` | `</body>`の前にフッターHTMLを追加 |
| `lp.css` | `.site-footer`スタイルを追加 |
| `app/style.css` | `.site-footer`スタイルを追加 |
| `privacy.html` | 新規作成。プライバシーポリシーページ |
