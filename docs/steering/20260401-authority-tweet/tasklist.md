# 権威ツイート埋め込み — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** LPの「安心ポイント」セクション直前に、CoderDojo石原淳也さんのツイート埋め込みを追加する

**Architecture:** 2ファイル変更。index.htmlにセクション＋スクリプト追加、lp.cssにスタイル追加。サーバー・JS変更不要。

**Tech Stack:** HTML, CSS, X(Twitter) oEmbed widgets.js

---

### Task 1: index.htmlにツイート埋め込みセクションを追加

**Files:**
- Modify: `index.html`

- [x] **Step 1: examplesセクションとsafetyセクションの間にtestimonialセクションを挿入**

`</section><!-- examples の閉じ -->` と `<section class="safety fade-in">` の間に以下を挿入:

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

- [x] **Step 2: `</body>`の直前にXの埋め込みスクリプトを追加**

```html
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
```

---

### Task 2: lp.cssにスタイルを追加

**Files:**
- Modify: `lp.css`

- [x] **Step 1: testimonialセクションのスタイルを追加**

`.scratch-story` スタイルの後に以下を追加:

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

---

### Task 3: 動作確認

- [x] **Step 1: サーバーを再起動**

```bash
pkill -f "node server.js" 2>/dev/null; sleep 1; node server.js &
```

- [ ] **Step 2: ツイート埋め込みの表示確認**

1. https://exedev-online-python.exedev.net/ を開く
2. 「安心ポイント」セクションの直前に「教育の現場で使われています」セクションが表示される
3. Xのウィジェットとしてツイートが埋め込み表示される

- [ ] **Step 3: フォールバック確認**

1. DevToolsのNetworkタブでwidgets.jsをブロックしてページをリロード
2. blockquoteがプレーンテキストとして表示されることを確認

- [ ] **Step 4: パフォーマンス確認**

1. DevToolsのNetworkタブでページ読み込みを確認
2. widgets.jsがasyncで読み込まれ、LPの初期表示をブロックしていないことを確認

- [ ] **Step 5: コミット**

```bash
git add index.html lp.css
git commit -m "feat: LPにCoderDojo石原さんのツイート埋め込みを追加（P3対策）"
```

---

## 実装後の振り返り

（全タスク完了後にresult.mdとして別ファイルに記録）
