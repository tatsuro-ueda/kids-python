# ローディングアニメーション — 設計

## 実装方針

アニメーションはローディング中のみ適用する。`#status`に`.loading`クラスを付与して切り替える。

### 1. テキストのspan化とクラス制御（JS）

`main.js`のステータス表示を2パターンに分ける:

- **ローディング時（`onStatus`）**: テキストを1文字ずつ`<span>`に分割、`.loading`クラスを付与
- **非ローディング時・完了時**: `.loading`を外し、フェードアウトして`hidden`

```js
// ローディング表示
statusEl.innerHTML = msg.split("").map((ch, i) =>
  `<span style="--i:${i}">${ch}</span>`
).join("");
statusEl.classList.add("loading");
statusEl.hidden = false;

// ローディング完了 → フェードアウト
statusEl.classList.add("fade-out");
statusEl.addEventListener("animationend", () => {
  statusEl.hidden = true;
  statusEl.classList.remove("loading", "fade-out");
}, { once: true });
```

### 2. バナー外観

ローディング中はバナー背景・ボーダーを透明にし、テキストだけを浮かせて表示する。

```css
/* デフォルト（非ローディング時の通常ステータス） */
#status {
  background: #fffbe6;
  border: 1px solid #ffe58f;
  padding: 8px 12px;
  margin-bottom: 8px;
  border-radius: 12px;
  font-size: 0.9rem;
  text-align: center;
}

/* ローディング中：バナー背景を消してテキストだけ浮かせる */
#status.loading {
  background: linear-gradient(90deg, #4a90c4, #f5c6d0, #7ec8e3, #4a90c4);
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  border-color: transparent;
  font-size: 1.1rem;
  font-weight: bold;
  animation: shimmer 2s ease-in-out infinite;
}
```

- フォントサイズを`0.9rem`→`1.1rem`に拡大、太字にして目立たせる
- `border-color: transparent`でボーダーも消す
- `background`プロパティでバナー背景色を上書き（グラデーションのみ残る）

### 3. シマーグラデーション（CSS）

配色はアプリの既存パレット（水色 `#4a90c4`、ピンク `#f5c6d0`、明るい水色 `#7ec8e3`）を使用。

```css
@keyframes shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}
```

### 4. ウェーブバウンス（CSS）

各`span`に`animation: bounce`を付与し、`animation-delay`を`--i`で計算してずらす。`.loading`内のspanのみ対象。

```css
#status.loading span {
  display: inline-block;
  animation: bounce 1.2s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.05s);
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
```

### 5. フェードアウト（CSS）

ロード完了時に0.5秒かけてフェードアウトする。

```css
#status.fade-out {
  animation: fadeOut 0.5s ease-out forwards;
}

@keyframes fadeOut {
  0% { opacity: 1; }
  100% { opacity: 0; }
}
```

`animationend`イベントで`hidden = true`にし、クラスをクリーンアップする。

### 6. prefers-reduced-motion

アニメーション無効時はシマー・バウンスを止め、静的テキスト表示にフォールバック。フェードアウトも即時非表示にする。

```css
@media (prefers-reduced-motion: reduce) {
  #status.loading,
  #status.loading span,
  #status.fade-out {
    animation: none;
  }
  #status.loading {
    color: #4a90c4;
    background: #fffbe6;
    -webkit-background-clip: border-box;
    background-clip: border-box;
    border-color: #ffe58f;
  }
}
```

reduced-motion時はフェードアウトが発火しないため、JS側で`animationend`を待たず即座に`hidden = true`にする分岐が必要。

```js
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  statusEl.hidden = true;
  statusEl.classList.remove("loading", "fade-out");
} else {
  statusEl.classList.add("fade-out");
  statusEl.addEventListener("animationend", () => {
    statusEl.hidden = true;
    statusEl.classList.remove("loading", "fade-out");
  }, { once: true });
}
```

## 変更ファイル

- `app/style.css`: `#status`のスタイル変更、`.loading`/`.fade-out`クラス、keyframes 3つ追加
- `src/main.js`: ステータス表示のspan化、クラス制御、フェードアウト処理
