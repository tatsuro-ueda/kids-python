# Googleアナリティクス導入 — Tasklist

## 前提ルール
- branch 作成時はローカルの main を明示して切る（`git checkout -b feature/xxx main`）
- merge 前に `git log origin/main..HEAD --oneline` で余計なコミットが混ざっていないか必ず確認する

## タスク

- [x] 1. ブランチ作成（`feature/20260410-google-analytics`、main から切る）
- [x] 2. `index.html.tpl` の `</head>` 直前に `<!-- GA_TAG -->` プレースホルダーを追加
- [x] 3. `app/index.html` の `</head>` 直前に `<!-- GA_TAG -->` プレースホルダーを追加
- [x] 4. `server.js` に GA タグ置換ロジックを実装
  - 環境変数 `GA_MEASUREMENT_ID` から測定IDを読む（未設定ならタグ出力しない）
  - EU 国コードリストを定義（EEA 27カ国 + アイスランド・リヒテンシュタイン・ノルウェー + UK）
  - HTML 配信時に geoip-lite で国判定し、EU 圏なら `<!-- GA_TAG -->` を除去、それ以外なら gtag スニペットに置換
  - gtag スニペットに子ども向け設定（`ad_storage: 'denied'`, `ad_personalization: 'denied'`）を含める
- [x] 5. LP をリビルド（`npm run build:lp`）してプレースホルダーがビルド後 HTML に反映されることを確認
- [x] 6. 動作確認（サーバー起動 → HTML レスポンスに GA タグが含まれることを確認）
  - GA_MEASUREMENT_ID 設定時: LP・App 両方で gtag スニペット出力 ✓
  - GA_MEASUREMENT_ID 未設定時: プレースホルダーもきれいに除去 ✓
  - ad_storage: 'denied' 確認 ✓
- [x] 7. 既存テスト実行（`npm test`）— 全12テスト合格
- [x] 8. コミット & merge 前確認（`git log origin/main..HEAD --oneline`）— コミット1つのみ ✓
