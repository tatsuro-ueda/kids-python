# P6残り: Scratchとの違いセクション — Design

## 方式

LPにストーリー形式の「Scratchの次は？」セクションを追加する。Scratchを知っている保護者が共感しながら読める語り口で、自然にプロダクトの価値へつなげる。

---

## D1. 配置

「特徴」セクションと「安心ポイント」セクションの間に挿入する。

```
特徴セクション
  ↓
★ Scratchセクション（新規追加）
  ↓
安心ポイントセクション
```

---

## D2. HTML構造

```html
<section class="scratch-story">
  <h2>Scratchの次は？</h2>
  <div class="story-content">
    <p>Scratchでブロックを並べてプログラムを作れるようになった。すごい！</p>
    <p>でも「文字でプログラムを書いてみたい」と思ったら、次のステップはPythonです。</p>
    <p>Pythonれんしゅうちょうなら、Scratchで学んだ「くりかえし」や「もしも」をそのままPythonで書いてみることができます。</p>
    <p>アプリの「おてほん」に、Scratchのブロックと同じことをするPythonコードが入っています。</p>
    <a href="/app/" class="cta-btn">おてほんを見てみる</a>
  </div>
</section>
```

---

## D3. スタイル

既存のLPデザイン（パステルカラー、角丸、白背景カード）に揃える。

```css
.scratch-story {
  background: #fff;
  border-radius: 12px;
  border: 2px solid #b8d8e8;
}

.story-content {
  line-height: 2;
}

.story-content p {
  margin-bottom: 16px;
  color: #555;
}
```

CTAボタンは既存の`.cta-btn`を再利用する。

---

## D4. 対象ファイル

| ファイル | 変更内容 |
|---|---|
| `index.html` | 「特徴」と「安心ポイント」の間にScratchセクションを追加 |
| `lp.css` | `.scratch-story`, `.story-content`のスタイル追加 |
