# 「れんしゅうちょうのページ」方式ほぞん機能 — Implementation Plan

**Goal:** 複数のコードをページとして管理し、切り替え・保存できるようにする

**Architecture:** storage.jsにページCRUD追加、main.jsにタブバーUI追加、style.cssにタブスタイル追加

**Tech Stack:** JavaScript (localStorage, CodeMirror 6), CSS (flexbox, flex-wrap)

---

## フェーズ1: データ層（storage.js）

### Task 1: ページ管理のCRUD関数を追加

**Files:**
- Modify: `src/storage.js`

- [x] **Step 1: 定数とヘルパー関数を追加**

`storage.js`の先頭付近に以下の定数を追加:
- `PAGES_KEY = "python-editor-pages"` — ページ一覧メタデータ
- `PAGE_PREFIX = "python-editor-page-"` — 各ページのコード
- `OUTPUT_PREFIX = "python-editor-output-"` — 各ページの出力
- `ACTIVE_KEY = "python-editor-active"` — アクティブページID
- `MAX_PAGES = 32`
- `generateId()` — ユニークID生成（`"p" + Date.now()`）

- [x] **Step 2: ページ一覧の読み書き関数**

- [x] **Step 3: ページCRUD関数**

- [x] **Step 4: 既存データの移行関数**

`migrateIfNeeded()`:
1. `python-editor-pages`が存在すれば何もしない（移行済み）
2. `python-editor-code`が存在すれば「ページ1」として移行
3. どちらもなければデフォルトの「ページ1」を作成（`print("Hello, Python!")`）

- [x] **Step 5: ビルドして構文エラーがないことを確認**

---

### Task 2: 既存のsaveCode/loadCodeをページ対応に変更

- [x] **Step 1: `saveCode(code)` をアクティブページへの保存に変更**

- [x] **Step 2: `loadCode()` をアクティブページからの読み込みに変更**

- [x] **Step 3: ビルド確認**

---

## フェーズ2: UI — タブバー

### Task 3: HTMLにタブバーのコンテナを追加

**Files:**
- Modify: `app/index.html`

- [x] **Step 1: エディタの直上にタブバー用divを追加**

```html
<div id="page-tabs" class="page-tabs"></div>
```

`#editor` の直前に配置。中身はJSで動的に生成する。

- [x] **Step 2: ツールバーに「ほぞん」ボタンを追加**

`#run-btn` の後に:
```html
<button id="save-btn" data-i18n="app.save">ほぞん</button>
```

---

### Task 4: タブバーのCSS

**Files:**
- Modify: `app/style.css`

- [x] **Step 1: タブバーの基本スタイル**

- `.page-tabs`: `display: flex; flex-wrap: wrap; gap: 4px; padding: 4px; margin-bottom: 0;`
- タブとエディタの間に隙間ができないようにする

- [x] **Step 2: タブのスタイル**

- `.page-tab`: パステルカラー背景、上側のみ角丸（`border-radius: 8px 8px 0 0`）、パディング、カーソルpointer
- `.page-tab.active`: 白背景、太ボーダー下線なし（エディタと繋がって見える）
- `.page-tab .tab-close`: 小さな×ボタン、ホバーで色変更

- [x] **Step 3: タブの縮小表示**

- タブ数に応じてCSSクラスを切り替え（JSから `tabs-compact`, `tabs-icon` クラスを付与）
- `.tabs-compact .page-tab`: `max-width` を縮小、テキスト `overflow: hidden; text-overflow: ellipsis`
- `.tabs-icon .page-tab .tab-name`: `display: none`（ページ番号のみ表示）

- [x] **Step 4: 「＋」ボタンのスタイル**

- `.page-tab-add`: タブと同じ高さ、点線ボーダー、ホバーで背景色変更

- [x] **Step 5: 「ほぞん」ボタンのスタイル**

- `#save-btn`: パステルグリーン（`#a8d8a8`）、白文字
- 保存フィードバック時のアニメーション（`saved`クラスでテキスト変更+軽い拡大）

- [x] **Step 6: モバイル折り返し対応**

- `flex-wrap: wrap` で折り返し（デフォルトで有効）
- 各タブの `min-width` を設定して極端に小さくならないようにする

---

### Task 5: タブバーの描画とページ切り替えロジック

**Files:**
- Modify: `src/main.js`

- [x] **Step 1: 起動時にmigrateIfNeeded()を呼ぶ**

`main()` の先頭でデータ移行を実行。

- [x] **Step 2: タブバー描画関数 `renderTabs()` を実装**

- `getPages()` からページ一覧を取得
- 各ページのタブ要素を生成（名前 + ×ボタン）
- アクティブページに `.active` クラス
- 末尾に「＋」ボタン
- タブ数に応じてコンテナに `tabs-compact` / `tabs-icon` クラスを付与

- [x] **Step 3: タブクリックでページ切り替え**

1. 現在のコードを `savePageCode()` で保存
2. 現在の出力を `savePageOutput()` で保存
3. `setActivePage(clickedId)`
4. 新しいページのコードをエディタにセット
5. 新しいページの出力を出力エリアにセット
6. `renderTabs()` で再描画

- [x] **Step 4: 「＋」ボタンで新規ページ作成**

1. 32ページ上限チェック（上限なら `alert(t("app.maxPages", { max: 32 }))` して終了）
2. `createPage()` でデフォルトコード付きページ作成
3. アクティブページに設定
4. エディタにデフォルトコードをセット
5. 出力エリアをクリア
6. `renderTabs()` で再描画

- [x] **Step 5: ビルドして動作確認**

```bash
npm run build
```

サーバー再起動して、タブバー表示・ページ切り替え・新規ページ追加を確認。

---

## フェーズ3: タブ操作（削除・リネーム）

### Task 6: ページ削除とUndo

**Files:**
- Modify: `src/main.js`

- [x] **Step 1: 「×」クリックでページ削除**

1. 最後の1ページなら `alert(t("app.deletePageLast"))` して終了
2. `confirm(t("app.deletePage"))` で確認
3. 削除前にコード・出力をメモリに一時保持（Undo用）
4. `deletePage(id)` 実行
5. 削除したページがアクティブだった場合、隣のページをアクティブに
6. `renderTabs()` で再描画

- [x] **Step 2: Undoリンクの表示**

出力エリアに「もとにもどす」リンクを表示:
1. 出力エリアをクリアし、Undoリンクを追加
2. 5秒後に自動消去（`setTimeout`）
3. クリックされたら一時保持データからページを復元、`renderTabs()`

- [x] **Step 3: ビルドして動作確認**

ページ削除 → Undoリンク表示 → 「もとにもどす」で復元を確認。

---

### Task 7: ページ名のインライン編集

**Files:**
- Modify: `src/main.js`

- [x] **Step 1: ダブルクリック（ダブルタップ）でインライン編集**

1. タブの名前部分をダブルクリックしたら、`<input>` に置き換え
2. 現在の名前を初期値にセット、全選択状態
3. Enterキー or フォーカスアウトで確定
4. Escキーでキャンセル
5. 20文字上限
6. `renamePage(id, newName)` で保存
7. `renderTabs()` で再描画

- [x] **Step 2: ビルドして動作確認**

---

## フェーズ4: 「ほぞん」ボタンとフィードバック

### Task 8: 「ほぞん」ボタンの実装

**Files:**
- Modify: `src/main.js`

- [x] **Step 1: 「ほぞん」ボタンのイベントハンドラ**

1. クリックで `savePageCode(activeId, code)` を実行
2. ボタンテキストを `t("app.saved")` に変更
3. `saved` CSSクラスを追加（アニメーション）
4. 1.5秒後に元のテキスト `t("app.save")` に戻す
5. `prefers-reduced-motion` の場合はアニメーションなしでテキスト変更のみ

- [x] **Step 2: ビルドして動作確認**

---

## フェーズ5: おてほん・きょうゆう連携

### Task 9: おてほんのページ対応

**Files:**
- Modify: `src/main.js`

- [x] **Step 1: サンプル選択時のダイアログを変更**

既存の `confirm(t("app.confirmReplace"))` を、2択ダイアログに変更:
- 「いまのページにいれる」→ 現在のページに上書き
- 「あたらしいページにする」→ 新規ページ作成、サンプル名をページ名に

32ページ上限時は上書きのみ（`confirm` でOK/キャンセル）。

- [x] **Step 2: ビルドして動作確認**

---

### Task 10: 共有URLのページ対応

**Files:**
- Modify: `src/main.js`

- [x] **Step 1: 共有URLからの読み込みを新規ページとして追加**

1. `detectSharedCode()` でコードを検出（既存ロジック）
2. 確認ダイアログ: 「きょうゆうされたコードをひらく？」
3. OKなら新規ページ作成（名前: 「きょうゆうされたコード」）
4. 32ページ上限の場合: 「いまのページにいれる？」で上書き確認
5. URLハッシュをクリア（`history.replaceState`）

- [x] **Step 2: ビルドして動作確認**

---

## フェーズ6: 出力のページ別保存

### Task 11: 実行結果をページごとに保存・復元

**Files:**
- Modify: `src/main.js`

- [x] **Step 1: コード実行後に出力をlocalStorageに保存**

`runBtn` のイベントハンドラ内で、実行完了後に `savePageOutput(activeId, outputEl.innerHTML)` を呼ぶ。

- [x] **Step 2: ページ切り替え時に出力を復元**

Task 5 Step 3 で既に出力復元を入れているが、`innerHTML` での復元を確認。未実行ページは空に。

- [x] **Step 3: ビルドして動作確認**

---

## フェーズ7: エクスポート案内

### Task 12: 「きょうゆう」でURLバックアップを案内

**Files:**
- Modify: `src/main.js`

- [x] **Step 1: 初回のみエクスポートヒントバナーを表示**

- localStorageキー `export-hint-dismissed` でフラグ管理
- ページが3ページ以上になったタイミングで一度だけ表示
- 内容: `t("app.exportHint")`
- 「とじる」ボタンで非表示

- [x] **Step 2: ビルドして動作確認**

---

## フェーズ8: i18n

### Task 13: 翻訳キーの追加（ja, en）

**Files:**
- Modify: `locales/ja/translation.json`
- Modify: `locales/en/translation.json`

- [x] **Step 1: ja/translation.json に新規キーを追加**

design.mdのi18n対応セクションの全キーを追加。

- [x] **Step 2: en/translation.json に新規キーを追加**

- [x] **Step 3: validate:i18nを実行して整合性確認**

```bash
npm run validate:i18n
```

---

## フェーズ9: 最終確認

### Task 14: 統合テスト

- [x] **Step 1: サーバー再起動して全機能確認**

```bash
pkill -f "node server.js" 2>/dev/null; sleep 1; node server.js &
```

- [x] **Step 2: 新規ユーザーフロー**

1. localStorageクリア
2. アプリを開く → 「ページ1」が1つ、デフォルトコード
3. コード編集 → 自動保存されている
4. 「＋」で新しいページ追加 → 「ページ2」
5. ページ1に戻る → コードが復元されている

- [x] **Step 3: ページ操作**

1. ページ名ダブルクリック → インライン編集 → 確定
2. 「×」でページ削除 → 確認ダイアログ → Undoリンク → 「もとにもどす」で復元
3. 最後の1ページは削除不可

- [x] **Step 4: 「ほぞん」ボタン**

1. 「ほぞん」クリック → 「✓ ほぞんしたよ！」アニメーション → 1.5秒後に戻る

- [x] **Step 5: おてほん連携**

1. おてほん選択 → 「いまのページにいれる？ あたらしいページにする？」
2. 「あたらしいページにする」→ サンプル名のページが追加される

- [x] **Step 6: 共有URL連携**

1. 共有URLでアクセス → 新規ページとして追加

- [x] **Step 7: 既存データ移行**

1. 旧形式のlocalStorage (`python-editor-code`) をセット
2. アプリ再読み込み → 「ページ1」として移行されている

- [x] **Step 8: タブ縮小表示**

1. ページを6個以上追加 → タブ名が省略される
2. ページを13個以上追加 → アイコンサイズになる

- [x] **Step 9: モバイル表示**

DevToolsでモバイル幅にして、タブが折り返し表示されることを確認。

---

## 実装後の振り返り

（全タスク完了後に記録）
