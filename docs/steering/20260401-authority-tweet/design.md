# 設計

## 方針

index.htmlにツイート埋め込みセクションを追加し、lp.cssにスタイルを追加する。
Xの公式埋め込み方式を使用し、読み込み失敗時のフォールバックも備える。

## 配置

「安心ポイント」セクション（`.safety`）の**直前**に新セクションを挿入する。

```
... scratch-story セクション ...
... examples セクション ...
→ ★ 新セクション: 教育の現場で使われています（ツイート埋め込み）
... safety セクション（保護者の方へ — 安心ポイント） ...
... howto セクション ...
```

信頼の導入として、安心ポイントを読む前にまず教育者の声を見せる構成。

## 実装

### 1. HTMLの追加（index.html）

`</section><!-- examples -->` と `<section class="safety">` の間に以下を挿入:

```html
<section class="testimonial fade-in">
  <h2>教育の現場で使われています</h2>
  <div class="testimonial-embed">
    <blockquote class="twitter-tweet" data-lang="ja">
      <p lang="ja" dir="ltr">普段はScratch、Python に挑戦したいという小学生の参加者が、英語のエラーメッセージで手こずっていて、日本語で表示されるといいのにねえ、と言っていたら、CoderDojo 調布の時間中にできてしまいました。</p>
      &mdash; 石原淳也(Junya Ishihara) (@jishiha)
      <a href="https://x.com/jishiha/status/2038450310004556197">March 30, 2026</a>
    </blockquote>
  </div>
</section>
```

`<blockquote class="twitter-tweet">` がXの公式埋め込みフォーマット。
スクリプトが読み込めない場合でも、このblockquoteがフォールバックとしてそのまま表示される。

### 2. 埋め込みスクリプト（index.html）

`</body>` の直前に以下を追加:

```html
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
```

`async` 属性により、LPの初期表示をブロックしない。

### 3. CSSの追加（lp.css）

```css
/* Testimonial (Tweet Embed) */
.testimonial {
  background: #fff;
  border-radius: 12px;
  border: 2px solid #b8d8e8;
}

.testimonial-embed {
  max-width: 550px;
  margin: 0 auto;
}
```

LPの他のセクション（`.problems`, `.safety`）と同じ白背景・ボーダーのカードスタイルに合わせる。
Xの埋め込みウィジェットの最大幅は550pxがデフォルト。

## フォールバック動作

Xのスクリプト（widgets.js）が読み込めない場合:
- `<blockquote>` がそのまま表示される
- ツイート本文・投稿者名・リンクがプレーンテキストとして読める
- 追加のJavaScript処理は不要（HTML自体がフォールバック）

## 多言語LP展開時の方針（今回はスコープ外）

各言語LPに展開する際は、`data-lang` をその言語に合わせる。
ウィジェットUI（「いいね」等のラベル、日付形式）が現地語になる。
ツイート本文は日本語のまま変わらない。

## 影響を受けない箇所

- 他のLPセクション: 挿入するだけで既存要素に変更なし
- パフォーマンス: async読み込みのため初期表示に影響なし
- 多言語LP: 今回は日本語LP（index.html）のみが対象
