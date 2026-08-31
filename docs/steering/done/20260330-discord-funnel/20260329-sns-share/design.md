# P2解決策: SNSシェアボタン — Design

## 方式

各SNSの共有Intent URLを使う。外部SDKなし、アイコンはSVGインライン。

---

## D1. 共有Intent URL

| SNS | URL |
|---|---|
| LINE | `https://social-plugins.line.me/lineit/share?url={url}` |
| X | `https://twitter.com/intent/tweet?url={url}&text={text}` |
| Facebook | `https://www.facebook.com/sharer/sharer.php?u={url}` |

- `{url}`: `encodeURIComponent()`でエンコードしたURL
- `{text}`: 「ブラウザだけでPythonが動く！小学生向けプログラミング練習帳」
- リンクは`target="_blank" rel="noopener"`で新しいタブで開く

---

## D2. LP側の配置

CTAセクション内、CTAボタンと補足テキストの下に「友だちに教える」として配置する。

```html
<section class="cta-section">
  <a href="/app/" class="cta-btn cta-btn-large">今すぐ試す</a>
  <p class="cta-note">アカウント登録不要・完全無料</p>
  <div class="share-section">
    <p class="share-label">友だちに教える</p>
    <div class="share-buttons">
      <a class="share-btn share-line" href="..." target="_blank" rel="noopener">LINE</a>
      <a class="share-btn share-x" href="..." target="_blank" rel="noopener">X</a>
      <a class="share-btn share-fb" href="..." target="_blank" rel="noopener">Facebook</a>
    </div>
  </div>
</section>
```

LP側のシェア対象URLはLPのURL（`location.href`）。JavaScriptで動的に設定する。

---

## D3. アプリ側の配置

「きょうゆう」ボタン押下後、出力エリアにURLコピー成功メッセージとSNSシェアボタンを表示する。

```
URLをコピーしたよ！おともだちにおしえてあげよう
SNSでもシェアできるよ
[LINE] [X] [Facebook]
```

SNSボタンはDOM要素として出力エリアに追加する。シェア対象URLはコード共有URL（`#code=...`付き）。

`src/main.js`のshareBtn clickハンドラ内で、`appendOutput()`の後にSNSリンクを生成して`outputEl`に追加する。

---

## D4. SVGアイコン

各SNSのロゴカラーでシンプルな丸型ボタンにする。

| SNS | ボタン色 | テキスト色 |
|---|---|---|
| LINE | `#06C755` | `#fff` |
| X | `#000` | `#fff` |
| Facebook | `#1877F2` | `#fff` |

ボタンスタイル:
- 角丸20px（既存ボタンと統一）
- `padding: 8px 16px`
- `font-size: 0.8rem`
- `font-weight: bold`
- `text-decoration: none`
- `display: inline-block`

---

## D5. 共有URL生成のヘルパー関数

`src/storage.js`に共有Intent URL生成関数を追加する。

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

LP側とアプリ側の両方からこの関数を使う。

---

## D6. 対象ファイル

| ファイル | 変更内容 |
|---|---|
| `src/storage.js` | `getShareIntentURLs()`関数を追加 |
| `src/main.js` | きょうゆうボタンハンドラにSNSリンク表示を追加 |
| `index.html` | CTAセクションにシェアボタンを追加、LP用の小さなJS追加 |
| `lp.css` | `.share-section`, `.share-buttons`, `.share-btn`のスタイル |
| `app/style.css` | `.share-buttons`, `.share-btn`のスタイル（出力エリア内） |
