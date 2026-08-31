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

- [x] `npm run build-lp` を実行（50言語、100ファイル、警告0）
- [x] ビルド結果を確認
  - [x] `grep "screenshots/ja" index.html` → マッチあり（日本語LP）
  - [x] `grep "screenshots/en" en/index.html` → マッチあり（英語LP）
  - [x] `grep "screenshots/ar" ar/index.html` → マッチあり（アラビア語LP）
  - [x] `grep "screenshots/en" vi/index.html` → マッチあり（ベトナム語 → 英語フォールバック）
  - [x] `grep "ogp-ja" index.html` → マッチあり
  - [x] `grep "ogp-en" en/index.html` → マッチあり
- [x] サーバーを再起動
- [x] ブラウザで目視確認（ユーザー操作）— 完璧とのこと
  - [x] `https://online-python.exe.xyz/` → 日本語スクリーンショット
  - [x] `https://online-python.exe.xyz/en/` → 英語スクリーンショット
  - [x] `https://online-python.exe.xyz/ar/` → アラビア語スクリーンショット（RTL）
  - [x] `https://online-python.exe.xyz/vi/` → 英語スクリーンショット（フォールバック）
- [x] コミット

## フェーズ5: mainマージとドキュメント更新

- [x] featureブランチをmainにマージ
- [x] 実装後の振り返り（このファイルの下部に記録）

---

## 実装後の振り返り

### 実装完了日
2026-03-30

### 計画と実績の差分

**計画と異なった点**:
- 特になし。計画通りに完了

**新たに必要になったタスク**:
- なし

**技術的理由でスキップしたタスク**:
- なし（全タスク完了）

### 学んだこと

**技術的な学び**:
- build-lp.js に `screenshotLang` が既に計算されていたため、接続は1行の修正で済んだ。事前のコードリーディングが設計判断の精度を上げた
- Playwright の `?lang=xx` でアプリの言語切替がそのまま動く。i18n実装が堅牢だった証拠
- アラビア語のRTLスクリーンショットも特別な対応なく撮影できた（アプリ側のRTL対応が機能していた）

**プロセス上の改善点**:
- requirements → design（ブレインストーミング）→ tasklist の順で進めたことで、実装時に迷いがなかった

### 次回への改善提案
- SCREENSHOT_LANGUAGES を増やす際は screenshots.js の LANG_CONFIG も同時更新が必要。コメントに明記済みだが、CIでの整合性チェックも検討
