# P6解決策: おてほんサンプルコード集 — Tasklist

- [ ] `src/samples.js` を新規作成（サンプルデータ5つ、Scratch対応コメント付き）
- [ ] `app/index.html` にツールバー下に `.samples-bar` と `<select id="samples">` を追加
- [ ] `app/style.css` に `.samples-bar` と `#samples` のスタイルを追加
- [ ] `src/main.js` に samples import と select change イベントハンドラを追加
- [ ] `npm run build` でビルド確認
- [ ] コミット

## 詳細

### T1. `src/samples.js` 新規作成

```js
// src/samples.js
export const samples = [
  {
    title: "はじめまして",
    code: `# Scratch: 「こんにちは！という」ブロックとおなじだよ
print("こんにちは！")
`,
  },
  {
    title: "なまえをきいてみよう",
    code: `# Scratch: 「○○とこたえて待つ」ブロックとおなじだよ
なまえ = input("なまえをおしえて: ")
print(なまえ + "さん、こんにちは！")
`,
  },
  {
    title: "くりかえそう",
    code: `# Scratch: 「○かいくりかえす」ブロックとおなじだよ
for かいすう in range(5):
    print(str(かいすう + 1) + "かいめ: こんにちは！")
`,
  },
  {
    title: "もしも...なら",
    code: `# Scratch: 「もし○なら」ブロックとおなじだよ
てんき = input("きょうのてんきは？(はれ/あめ): ")
if てんき == "はれ":
    print("おそとであそぼう！")
else:
    print("おうちでプログラミングしよう！")
`,
  },
  {
    title: "おみくじ",
    code: `# Scratch: 「○から○までのらんすう」ブロックとおなじだよ
import random
けっか = random.choice(["だいきち", "ちゅうきち", "しょうきち", "きち", "すえきち"])
print("きょうのうんせいは..." + けっか + "！")
`,
  },
];
```

### T2. `app/index.html` 修正

ツールバーの `</div>` の直後に追加:

```html
<div class="samples-bar">
  <select id="samples">
    <option value="">おてほん</option>
  </select>
</div>
```

### T3. `app/style.css` 修正

末尾に追加:

```css
.samples-bar {
  margin: 8px 0;
}

#samples {
  padding: 8px 16px;
  font-size: 0.9rem;
  border: 2px solid #b8d8e8;
  border-radius: 20px;
  background: #f0f8ff;
  color: #4a90c4;
  font-weight: bold;
  cursor: pointer;
  appearance: auto;
}
```

### T4. `src/main.js` 修正

import 追加:

```js
import { samples } from "./samples.js";
```

末尾に追加:

```js
const samplesSelect = document.getElementById("samples");
samples.forEach((s, i) => {
  const opt = document.createElement("option");
  opt.value = i;
  opt.textContent = s.title;
  samplesSelect.appendChild(opt);
});

samplesSelect.addEventListener("change", () => {
  const idx = samplesSelect.value;
  if (idx === "") return;
  const sample = samples[idx];
  if (confirm("いまのコードがきえるよ。いい？")) {
    editor.dispatch({
      changes: { from: 0, to: editor.state.doc.length, insert: sample.code },
    });
  }
  samplesSelect.value = "";
});
```

### T5. ビルド確認

```bash
cd /home/exedev/online-python && npm run build
```

### T6. コミット

```bash
git add src/samples.js app/index.html app/style.css src/main.js doc/steering/20260329-samples/
git commit -m "Add sample code dropdown for Scratch-to-Python bridge (P6)"
```
