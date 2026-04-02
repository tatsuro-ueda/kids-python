# 要求内容: 共通セキュリティヘッダー追加

## 概要

`server.js` の全HTTPレスポンスに共通セキュリティヘッダー4種を追加し、クリックジャッキング・MIMEスニッフィング・不要なブラウザAPIアクセスをブロックする。

## 背景

`docs/steering/20260402-security-headers/problems.md` で整理した通り、現在のサーバーはセキュリティヘッダーを一切設定しておらず、ブラウザの保護機能が有効化されていない。

## 受け入れ条件（Gherkin形式）

### AC-1: 攻撃者がiframeにサイトを埋め込めない

```gherkin
Given 攻撃者が自分のWebサイトを用意している
When  <iframe src="https://online-python.exe.xyz/app/"> を埋め込む
Then  ブラウザがX-Frame-Options: DENYにより読み込みを拒否する
And   子どもがクリックジャッキングの被害を受けない
```

### AC-2: 攻撃者がMIMEタイプを偽装できない

```gherkin
Given 攻撃者がテキストファイルにJavaScriptを埋め込んだ
When  ブラウザがそのファイルを読み込む
Then  X-Content-Type-Options: nosniff によりContent-Typeが尊重される
And   text/plainのファイルがスクリプトとして実行されない
```

### AC-3: 攻撃者がカメラ・マイクにアクセスできない

```gherkin
Given 攻撃者がiframe埋め込みやスクリプト注入に成功したと仮定する
When  navigator.mediaDevices.getUserMedia() でカメラ・マイクへのアクセスを試みる
Then  Permissions-Policy により要求がブロックされる
And   子どものカメラ・マイクが起動しない
```

### AC-4: 攻撃者がエラーページからも情報を得られない

```gherkin
Given 攻撃者がサイトの構造を探索している
When  存在しないURL（例: /admin）にリクエストを送信する
Then  404レスポンスにもセキュリティヘッダー4種が含まれる

When  /logs/ にリクエストを送信する
Then  403レスポンスにもセキュリティヘッダー4種が含まれる
```

### AC-5: 正規ユーザーの機能が壊れない

```gherkin
Given セキュリティヘッダーが設定されている
When  子どもが /app/ で以下の操作を行う:
      - コードエディタ（CodeMirror）でコードを書く
      - 「じっこう」ボタンでPythonコードを実行する（Pyodide）
      - 言語セレクタで言語を切り替える（i18next）
      - 「きょうゆう」ボタンでコードを共有する（URL Hash）
Then  すべての機能が正常に動作する

When  保護者がLP（/, /en/, /ja/ 等）を閲覧する
Then  ページが正常に表示される
And   スクロールアニメーションが動作する
And   CTAボタンから /app/ に遷移できる
```

## 追加するヘッダー

| ヘッダー | 値 | 目的 |
|---|---|---|
| X-Content-Type-Options | `nosniff` | MIMEスニッフィング防止 |
| X-Frame-Options | `DENY` | クリックジャッキング防止 |
| Referrer-Policy | `strict-origin-when-cross-origin` | リファラー情報の制御 |
| Permissions-Policy | `camera=(), microphone=(), geolocation=()` | 不要なブラウザAPIの無効化 |

## 成功指標

- `curl -I` で全レスポンス（200/404/403）にヘッダー4種が確認できる
- ブラウザでapp/・LPともに正常動作する

## スコープ外

- Content-Security-Policy — `docs/steering/20260402-csp-policy/` で別途実施
- HTTPS強制（Strict-Transport-Security） — リバースプロキシ層の責務
- パストラバーサル対策 — P1-2として別途実施
- 機密ディレクトリのブロック拡張 — P1-2と合わせて実施

## 参照ドキュメント

- `docs/steering/20260402-security-headers/problems.md` — 問題定義
- `docs/security-risks.md` — P1-1
- `server.js` — 変更対象
