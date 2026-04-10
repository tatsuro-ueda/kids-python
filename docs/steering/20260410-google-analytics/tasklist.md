# Googleアナリティクス導入 — Tasklist

## 前提ルール
- branch 作成時はローカルの main を明示して切る（`git checkout -b feature/xxx main`）
- merge 前に `git log origin/main..HEAD --oneline` で余計なコミットが混ざっていないか必ず確認する

## タスク

- [ ] 1. ブランチ作成（`feature/20260410-google-analytics`、main から切る）
- [ ] 2. `index.html.tpl` の `</head>` 直前に `<!-- GA_TAG -->` プレースホルダーを追加
- [ ] 3. `app/index.html` の `</head>` 直前に `<!-- GA_TAG -->` プレースホルダーを追加
- [ ] 4. `server.js` に GA タグ置換ロジックを実装
  - 環境変数 `GA_MEASUREMENT_ID` から測定IDを読む（未設定ならタグ出力しない）
  - EU 国コードリストを定義
  - HTML 配信時に geoip-lite で国判定し、EU 圏なら `<!-- GA_TAG -->` を除去、それ以外なら gtag スニペットに置換
  - gtag スニペットに子ども向け設定（`ad_storage: 'denied'`, `ad_personalization: 'denied'`）を含める
- [ ] 5. LP をリビルド（`npm run build:lp`）してプレースホルダーがビルド後 HTML に反映されることを確認
- [ ] 6. 動作確認（サーバー起動 → HTML レスポンスに GA タグが含まれることを確認）
- [ ] 7. 既存テスト実行（`npm test`）で既存機能に影響がないことを確認
- [ ] 8. コミット & merge 前確認（`git log origin/main..HEAD --oneline`）
