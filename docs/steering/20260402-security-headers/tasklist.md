# タスクリスト

## 🚨 タスク完全完了の原則

**このファイルの全タスクが完了するまで作業を継続すること**

### 必須ルール
- **全てのタスクを`[x]`にすること**
- 「時間の都合により別タスクとして実施予定」は禁止
- 「実装が複雑すぎるため後回し」は禁止
- 未完了タスク（`[ ]`）を残したまま作業を終了しない

### タスクスキップが許可される唯一のケース
以下の技術的理由に該当する場合のみスキップ可能:
- 実装方針の変更により、機能自体が不要になった
- アーキテクチャ変更により、別の実装方法に置き換わった

スキップ時は必ず理由を明記:
```markdown
- [x] ~~タスク名~~（実装方針変更により不要: 具体的な技術的理由）
```

---

## フェーズ0: ブランチ準備

- [x] 作業用ブランチを作成（`feature/20260402-security-headers`）

## フェーズ1: テストヘルパー共有化

- [x] `test/helpers.js` を作成
  - [x] `request(port, urlPath, headers)` を `access-log.test.js` から切り出す
  - [x] `startServer()` を作成（サーバー起動 + ポート取得を共通化）
  - [x] `stopServer(server)` を作成（サーバー停止を共通化）
- [x] `test/access-log.test.js` をリファクタリング
  - [x] `helpers.js` の `request`, `startServer`, `stopServer` を使うように変更
  - [x] `waitForLog` はアクセスログ固有のため `access-log.test.js` に残す
- [x] 既存テストが通ることを確認（`npm test`）

## フェーズ2: セキュリティヘッダーのテスト作成（Red）

- [x] `test/security-headers.test.js` を作成
  - [x] 200レスポンスに `X-Content-Type-Options: nosniff` が含まれること
  - [x] 200レスポンスに `X-Frame-Options: DENY` が含まれること
  - [x] 200レスポンスに `Referrer-Policy: strict-origin-when-cross-origin` が含まれること
  - [x] 200レスポンスに `Permissions-Policy: camera=(), microphone=(), geolocation=()` が含まれること
  - [x] 404レスポンスにヘッダー4種が含まれること
  - [x] 403レスポンスにヘッダー4種が含まれること
  - [x] 200レスポンスの `Content-Type` が正しく設定されていること（上書きされない）
- [x] テストが失敗すること（Red）を確認（`npm test`）

## フェーズ3: 実装（Green）

- [x] `server.js` に `setSecurityHeaders(res)` 関数を追加
- [x] 403レスポンス（`/logs/` ブロック）の `res.writeHead` 前に `setSecurityHeaders` を呼び出す
- [x] 404レスポンス（ファイル未存在）の `res.writeHead` 前に `setSecurityHeaders` を呼び出す
- [x] 200レスポンス（正常配信）の `res.writeHead` 前に `setSecurityHeaders` を呼び出す
- [x] 全テストが通ることを確認（Green）（`npm test`）

## フェーズ4: 動作確認

- [x] `curl -I http://localhost:3000/app/` でヘッダー4種が返ることを確認
- [x] `curl -I http://localhost:3000/nonexistent` で404にもヘッダーが返ることを確認
- [x] `curl -I http://localhost:3000/logs/` で403にもヘッダーが返ることを確認

## フェーズ5: mainマージとドキュメント更新

- [x] featureブランチをmainにマージする
- [x] 実装後の振り返り（このファイルの下部に記録）

---

## 実装後の振り返り

### 実装完了日
2026-04-02

### 計画と実績の差分

**計画と異なった点**:
- `test/helpers.js`の`request`関数で`res.headers`を返すように拡張した（元の`access-log.test.js`版ではbodyとstatusのみだった）
- `package.json`のtestコマンドを`node --test test/`から`node --test test/*.test.js`に変更（`helpers.js`がテストファイルとして誤認識されるのを防止）

**新たに必要になったタスク**:
- なし。計画通りに実装完了。

### 学んだこと

**技術的な学び**:
- Node.js組み込みテストランナー(`node --test`)はディレクトリ指定時にすべての`.js`ファイルをテストとして実行するため、ヘルパーファイルはglobパターンで除外する必要がある
- `res.setHeader`は`res.writeHead`より前に呼ぶことで、ステータスコードに関係なく共通ヘッダーを付与できる

**プロセス上の改善点**:
- TDD（Red→Green）の流れでテストを先に書いたことで、実装漏れなく4種のヘッダーを全レスポンスに付与できた
- テストヘルパーの共有化を先に行ったことで、セキュリティヘッダーテストの実装がシンプルになった

### 次回への改善提案
- CSP（Content-Security-Policy）ヘッダーはPyodideのWASM実行との互換性検証が必要なため、別タスクとして計画すべき
- `docs/security-risks.md`のPhase 1にあるパストラバーサル対策・機密ディレクトリブロック拡張も早期に着手すべき
