# P6残り: Scratchとの違いセクション — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** LPに「Scratchの次は？」ストーリーセクションを追加し、Scratchユーザーの保護者にプロダクトの価値を伝える

**Architecture:** LPの「特徴」と「安心ポイント」の間にHTMLセクションを追加し、lp.cssにスタイルを追加する。2ファイルのみの変更。

**Tech Stack:** HTML, CSS

---

### Task 1: index.htmlにScratchセクションを追加

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 「特徴」セクション閉じタグの直後にScratchセクションを挿入**

`</section>` (features) と `<section class="safety">` の間に以下を追加:

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

- [ ] **Step 2: コミット**

```bash
git add index.html
git commit -m "feat: add Scratch bridge story section to LP"
```

---

### Task 2: lp.cssにScratchセクションのスタイルを追加

**Files:**
- Modify: `lp.css`

- [ ] **Step 1: Share Sectionの前にScratch Storyスタイルを追加**

`/* Share Section */` の前に以下を追加:

```css
/* Scratch Story */
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

.story-content .cta-btn {
  margin-top: 8px;
}
```

- [ ] **Step 2: コミット**

```bash
git add lp.css
git commit -m "feat: add Scratch story section styles to LP"
```

---

### Task 3: 動作確認

- [ ] **Step 1: サーバーを起動してLPを確認**

```bash
node server.js &
curl -s http://localhost:3000/ | grep -c "scratch-story"
kill %1
```

Expected: 1（セクションが存在する）

- [ ] **Step 2: セクション順序の確認**

```bash
node server.js &
curl -s http://localhost:3000/ | grep -oE 'class="(features|scratch-story|safety)"'
kill %1
```

Expected:
```
class="features"
class="scratch-story"
class="safety"
```
