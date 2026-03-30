# LP スクリーンショット多言語化 — タスクリスト

## 🚨 タスク完全完了の原則

**このファイルの全タスクが完了するまで作業を継続すること**

### 必須ルール
- **全てのタスクを`[x]`にすること**
- 「時間の都合により別タスクとして実施予定」は禁止
- 未完了タスク（`[ ]`）を残したまま作業を終了しない

### タスクスキップが許可される唯一のケース
- 実装方針の変更により不要になった場合のみ
- スキップ時は理由を明記: `- [x] ~~タスク名~~（理由）`

---

## フェーズ0: ブランチ準備

- [x] mainに未マージのfeatureブランチがないか確認
- [x] 作業用ブランチを作成（`feature/20260330-lp-screenshots-i18n`）

## フェーズ1: screenshots.js を多言語対応に拡張

- [x] 言語別コード例マッピングを定義
  - ja: `print("こんにちは！")` → `こんにちは！`
  - en: `print("Hello!")` → `Hello!`
  - es: `print("¡Hola!")` → `¡Hola!`
  - ar: `print("مرحبا!")` → `مرحبا!`
  - hi: `print("नमस्ते!")` → `नमस्ते!`

- [x] screenshots.js を書き換え: SCREENSHOT_LANGUAGES ループで各言語のスクリーンショットを生成
  - [x] `assets/screenshots/{lang}/` ディレクトリを自動作成
  - [x] `/app/?lang={lang}` でアプリを開く
  - [x] Pyodide ロード完了を待機（run-btn が enabled になるまで）
  - [x] step-open を撮影
  - [x] 言語別コード例を入力して step-write を撮影
  - [x] 実行して期待テキストを待機し step-run を撮影

- [x] OGP 画像も言語別に生成
  - [x] 各言語の翻訳JSON（lp.ogTitle, lp.ogDescription）を読み込む
  - [x] OGP 画像を `assets/ogp-{lang}.png` に出力

- [x] コミット

## フェーズ2: スクリーンショット生成を実行

- [x] サーバーを再起動（server.js 変更がなくても、最新のアプリで撮影するため）
- [x] `npm run screenshots` を実行
- [x] 生成結果を確認
  - [x] `ls assets/screenshots/{ja,en,es,ar,hi}/step-*.png` → 15ファイル
  - [x] `ls assets/ogp-{ja,en,es,ar,hi}.png` → 5ファイル
  - [x] `find assets/screenshots -name "*.png" -empty` → 結果なし
  - [x] ar の step-open.png を目視確認 → UIがRTLレイアウトになっている
- [x] 旧スクリーンショット（`assets/screenshots/step-*.png`、`assets/ogp.png`）を削除
- [x] コミット

## フェーズ3: build-lp.js と index.html.tpl を修正

- [x] build-lp.js: `screenshotPath` に `screenshotLang` を反映
  - 変更前: `const screenshotPath = \`${assetsPath}/screenshots\`;`
  - 変更後: `const screenshotPath = \`${assetsPath}/screenshots/${screenshotLang}\`;`

- [x] build-lp.js: `ogpImageUrl` 変数を追加して vars に渡す
  - `ogpImageUrl: \`${BASE_URL}/assets/ogp-${screenshotLang}.png\``

- [x] index.html.tpl: OGP 画像パスを変数化
  - 変更前: `<meta property="og:image" content="/assets/ogp.png">`
  - 変更後: `<meta property="og:image" content="{{ogpImageUrl}}">`

- [x] コミット

## フェーズ4: LP を再生成してテスト

- [ ] `npm run build-lp` を実行
- [ ] ビルド結果を確認
  - [ ] `grep "screenshots/ja" index.html` → マッチあり（日本語LP）
  - [ ] `grep "screenshots/en" en/index.html` → マッチあり（英語LP）
  - [ ] `grep "screenshots/ar" ar/index.html` → マッチあり（アラビア語LP）
  - [ ] `grep "screenshots/en" vi/index.html` → マッチあり（ベトナム語 → 英語フォールバック）
  - [ ] `grep "ogp-ja" index.html` → マッチあり
  - [ ] `grep "ogp-en" en/index.html` → マッチあり
- [ ] サーバーを再起動
- [ ] ブラウザで目視確認（ユーザー操作）
  - [ ] `https://online-python.exe.xyz/` → 日本語スクリーンショット
  - [ ] `https://online-python.exe.xyz/en/` → 英語スクリーンショット
  - [ ] `https://online-python.exe.xyz/ar/` → アラビア語スクリーンショット（RTL）
  - [ ] `https://online-python.exe.xyz/vi/` → 英語スクリーンショット（フォールバック）
- [ ] コミット

## フェーズ5: mainマージとドキュメント更新

- [ ] featureブランチをmainにマージ
- [ ] 実装後の振り返り（このファイルの下部に記録）

---

## 実装後の振り返り

### 実装完了日
{YYYY-MM-DD}

### 計画と実績の差分

**計画と異なった点**:
-

**新たに必要になったタスク**:
-

**技術的理由でスキップしたタスク**（該当する場合のみ）:
-

### 学んだこと

**技術的な学び**:
-

**プロセス上の改善点**:
-

### 次回への改善提案
-
