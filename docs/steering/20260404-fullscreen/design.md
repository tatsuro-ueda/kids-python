# 設計 — 全画面編集モード

## コンセプト

「ひろげる」ボタンで画面全体をエディタに使い切る集中モード。余計なUI要素をすべて非表示にし、コードだけに没頭できる。実行したいときは Ctrl+Enter で画面下部に出力パネルが分割表示される。

## UIレイアウト

### 通常モード → 全画面モード

```
通常モード:                        全画面モード:
┌─────────────────────┐           ┌─────────────────────┐
│ 🐍 タイトル      🌐 │           │                 [×] │
├─────────────────────┤           │                     │
│ [ページ1][ページ2][＋]│           │                     │
├─────────────────────┤           │   コードエディタ      │
│   コードエディタ      │           │   (フォント18px)     │
│   (300px, 14px)     │           │                     │
├─────────────────────┤           │                     │
│ [じっこう][ほぞん]... │           │                     │
├─────────────────────┤           └─────────────────────┘
│   出力エリア         │
├─────────────────────┤
│   フッター           │
└─────────────────────┘
```

### 全画面モード + 出力パネル（実行後）

```
┌─────────────────────┐
│                 [×] │
│                     │
│   コードエディタ      │
│   (上半分)           │
│                     │
├─────────────────────┤
│   出力パネル     [×] │
│   (下半分)           │
└─────────────────────┘
```

## 全画面モードの切り替え

### 入り方

- ツールバーに「ひろげる」ボタンを追加
- ボタン位置: ツールバー右端（他のボタンと並列）
- スタイル: 他のツールバーボタンと同じ（角丸、太字、白文字）

### 抜け方

- 右上の「×」ボタンをクリック
- Escキーを押す

### CSS実装方針

`body` に `.fullscreen-mode` クラスを付与する方式:

```css
/* 全画面モード: 非表示にする要素 */
body.fullscreen-mode header,
body.fullscreen-mode #status,
body.fullscreen-mode #page-tabs,
body.fullscreen-mode .toolbar,
body.fullscreen-mode #output,
body.fullscreen-mode #help-form,
body.fullscreen-mode #bookmark-banner,
body.fullscreen-mode .export-hint-banner,
body.fullscreen-mode .dev-buttons,
body.fullscreen-mode .site-footer {
  display: none !important;
}

/* エディタを画面全体に広げる */
body.fullscreen-mode {
  padding: 0;
  background: #f0f8ff;  /* エディタ背景色に統一 */
}

body.fullscreen-mode .container {
  max-width: none;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

body.fullscreen-mode #editor {
  flex: 1;
  border: none;
  border-radius: 0;
}

body.fullscreen-mode #editor .cm-editor {
  height: 100%;
  font-size: 18px;
}
```

## フォントサイズ

| モード | フォントサイズ |
|--------|--------------|
| 通常 | 14px（現行通り） |
| 全画面 | 18px（固定） |

- 全画面モードに入ると即座に18pxに変更
- 通常モードに戻ると14pxに復帰
- CodeMirrorの `fontSize` は CSS で制御（`.cm-editor` に適用）

## 閉じるボタン（×）

- 画面右上に固定配置（`position: fixed`）
- 半透明の丸ボタン、ホバーで不透明に
- エディタの上にオーバーレイ表示（`z-index` で前面に）
- 子どもが見つけやすいサイズ（40px × 40px）

```css
.fullscreen-close {
  position: fixed;
  top: 12px;
  right: 12px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #b8d8e8;
  background: rgba(255, 255, 255, 0.8);
  font-size: 20px;
  cursor: pointer;
  z-index: 200;
  display: none;
}

body.fullscreen-mode .fullscreen-close {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

## 出力パネル（全画面モード専用）

### 表示トリガー

- Ctrl+Enter または「じっこう」ボタンでコードを実行したとき
- 実行前は出力パネルは非表示（エディタが100%）
- 再実行時は出力をクリアして再表示

### レイアウト

- エディタと出力パネルで画面を上下に分割
- 比率: エディタ 60% / 出力 40%（`flex` で制御）
- 出力パネルにも「×」ボタンがあり、閉じるとエディタが100%に戻る

### 出力パネルの構造

```html
<div id="fullscreen-output" hidden>
  <div class="fullscreen-output-header">
    <span data-i18n="app.outputLabel">けっか</span>
    <button class="fullscreen-output-close">×</button>
  </div>
  <pre class="fullscreen-output-content"></pre>
</div>
```

### スタイル

```css
#fullscreen-output {
  border-top: 2px solid #b8d8e8;
  background: #f0f8ff;
  display: flex;
  flex-direction: column;
  flex: 0 0 40%;
  max-height: 40vh;
}

.fullscreen-output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 12px;
  background: #e8f4fc;
  font-size: 0.85rem;
  font-weight: bold;
  color: #4a90c4;
}

.fullscreen-output-content {
  flex: 1;
  overflow: auto;
  padding: 12px;
  font-family: monospace;
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}
```

## 全画面中の「じっこう」ボタン

タブレット/Chromebookなどキーボードなし端末のために、全画面モード中にも「じっこう」ボタンを表示する。

- 閉じるボタン（×）の左隣に固定配置（`position: fixed`）
- 通常のツールバーと同じパステル水色
- 全画面モード中のみ表示

```css
.fullscreen-run {
  position: fixed;
  top: 12px;
  right: 60px;
  padding: 8px 20px;
  border-radius: 20px;
  border: none;
  background: #7ec8e3;
  color: #fff;
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
  z-index: 200;
  display: none;
}

body.fullscreen-mode .fullscreen-run {
  display: block;
}
```

## キーボードショートカット

| キー | 動作 |
|------|------|
| Esc | 全画面モードを抜ける |
| Ctrl+Enter | 全画面モード中にコードを実行 |

- Esc はエディタにフォーカスがないときも有効（`document` レベルでリスン）
- Ctrl+Enter は全画面モード中のみ有効（通常モードでは既存動作を維持）
- 「じっこう」ボタンと Ctrl+Enter は同じ処理を呼ぶ

## i18n対応

新規翻訳キー:

| キー | ja | en |
|------|----|----|
| `app.expand` | ひろげる | Expand |
| `app.outputLabel` | けっか | Output |
| `app.fullscreenRun` | じっこう | Run |

## 影響範囲

| ファイル | 変更内容 |
|---------|---------|
| `app/index.html` | 閉じるボタン、じっこうボタン、出力パネルのHTML追加 |
| `app/style.css` | 全画面モードのスタイル追加 |
| `src/main.js` | 全画面切り替えロジック、Ctrl+Enter、Escハンドラ、じっこうボタン |
| `locales/*/translation.json` | 新規翻訳キー追加 |

## スコープ外

- フォントサイズのユーザー調整（+/- ボタン）
- 分割比率のドラッグ調整
- 全画面モード中のタブ切り替え
- 全画面モード中の保存ボタン（自動保存で対応）
