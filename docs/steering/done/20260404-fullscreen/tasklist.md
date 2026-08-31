# 全画面編集モード — Implementation Plan

**Goal:** エディタを画面いっぱいに広げ、コードに集中できる全画面モードを追加する

**Architecture:** body.fullscreen-modeクラスでCSS制御、main.jsにモード切替ロジック追加

**Tech Stack:** JavaScript (CodeMirror 6), CSS (flexbox, position: fixed)

---

## フェーズ1: HTML構造

### Task 1: 全画面モード用のHTML要素を追加

**Files:**
- Modify: `app/index.html`

- [ ] **Step 1: ツールバーに「ひろげる」ボタンを追加**

`#help-btn` の後に:
```html
<button id="expand-btn" data-i18n="app.expand">ひろげる</button>
```

- [ ] **Step 2: 全画面モード用のオーバーレイ要素を追加**

`<div class="container">` の直前（bodyの直下）に:
```html
<button id="fullscreen-close" class="fullscreen-close">×</button>
<button id="fullscreen-run" class="fullscreen-run" data-i18n="app.fullscreenRun">じっこう</button>
<div id="fullscreen-output" hidden>
  <div class="fullscreen-output-header">
    <span data-i18n="app.outputLabel">けっか</span>
    <button id="fullscreen-output-close" class="fullscreen-output-close">×</button>
  </div>
  <pre id="fullscreen-output-content" class="fullscreen-output-content"></pre>
</div>
```

---

## フェーズ2: CSS

### Task 2: 全画面モードのスタイル

**Files:**
- Modify: `app/style.css`

- [ ] **Step 1: 非表示ルール**

`body.fullscreen-mode` 時に header, #status, #page-tabs, .toolbar, #output, #help-form, #bookmark-banner, .export-hint-banner, .dev-buttons, .site-footer を `display: none !important`。

- [ ] **Step 2: エディタ全画面化**

body.fullscreen-mode で padding:0, background統一。.container を height:100vh, flex-column。#editor を flex:1, border:none, border-radius:0。.cm-editor を height:100%, font-size:18px。

- [ ] **Step 3: 閉じるボタン（×）のスタイル**

position:fixed, top:12px, right:12px, 40px丸ボタン, 半透明背景, z-index:200。全画面モード時のみ display:flex。

- [ ] **Step 4: じっこうボタンのスタイル**

position:fixed, top:12px, right:60px, パステル水色, 角丸。全画面モード時のみ display:block。

- [ ] **Step 5: 出力パネルのスタイル**

#fullscreen-output: border-top, flex:0 0 40%, max-height:40vh。ヘッダーバー（タイトル+×ボタン）。コンテンツ領域（monospace, overflow:auto）。

---

## フェーズ3: ロジック

### Task 3: 全画面モードの切り替え

**Files:**
- Modify: `src/main.js`

- [ ] **Step 1: 全画面モード進入**

「ひろげる」ボタンのクリックで `document.body.classList.add("fullscreen-mode")`。

- [ ] **Step 2: 全画面モード離脱**

閉じるボタン（×）のクリック、またはEscキーで `document.body.classList.remove("fullscreen-mode")`。出力パネルも非表示に。

- [ ] **Step 3: Escキーハンドラ**

`document.addEventListener("keydown")` で Esc を検知。全画面モード中のみ反応。

---

### Task 4: 全画面モード中の実行

**Files:**
- Modify: `src/main.js`

- [ ] **Step 1: 実行関数の共通化**

既存の runBtn イベントハンドラの実行ロジックを `executeCode()` 関数に切り出す。通常モード・全画面モードの両方から呼べるようにする。

- [ ] **Step 2: Ctrl+Enter ハンドラ**

全画面モード中に Ctrl+Enter で `executeCode()` を呼ぶ。出力先を全画面出力パネルに向ける。

- [ ] **Step 3: 全画面じっこうボタンのハンドラ**

`#fullscreen-run` クリックで Step 2 と同じ処理。

- [ ] **Step 4: 出力パネルの表示/クリア**

実行時: #fullscreen-output を表示、内容をクリアして出力を流す。再実行時: クリアして再表示。

- [ ] **Step 5: 出力パネルの閉じるボタン**

`#fullscreen-output-close` クリックで #fullscreen-output を非表示にする。

---

## フェーズ4: i18n

### Task 5: 翻訳キーの追加

**Files:**
- Modify: `locales/ja/translation.json`
- Modify: `locales/en/translation.json`
- Modify: `locales/*/translation.json` (他49言語)

- [ ] **Step 1: ja/en に新規キーを追加**

`app.expand`, `app.outputLabel`, `app.fullscreenRun` の3キー。

- [ ] **Step 2: 他言語に英語フォールバックで追加**

- [ ] **Step 3: validate:i18n を実行して整合性確認**

---

## フェーズ5: ビルドと動作確認

### Task 6: 統合テスト

- [ ] **Step 1: ビルド**

```bash
npm run build
```

- [ ] **Step 2: サーバー再起動して確認**

- [ ] **Step 3: 基本フロー確認**

1. 「ひろげる」ボタン → 全画面モードに入る
2. ヘッダー/タブ/ツールバー/出力/フッターが非表示
3. エディタが画面全体、フォント18px
4. 右上に×ボタン表示

- [ ] **Step 4: 実行フロー確認**

1. Ctrl+Enter → 出力パネルが下部に分割表示
2. 全画面じっこうボタン → 同じ動作
3. 再実行 → 出力クリアして再表示
4. 出力パネル×ボタン → パネル閉じてエディタ100%

- [ ] **Step 5: 離脱フロー確認**

1. ×ボタン → 通常モードに戻る
2. Escキー → 通常モードに戻る
3. コード内容が保持されている

- [ ] **Step 6: エラー時の確認**

1. エラーを含むコードを実行 → 出力パネルにエラー表示
2. エディタのエラー行ハイライト

---

## 実装後の振り返り

（全タスク完了後に記録）
