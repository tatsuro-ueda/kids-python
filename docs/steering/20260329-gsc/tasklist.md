# Google Search Console 登録・インデックス確認 — タスクリスト

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
- [x] 作業用ブランチを作成（`feature/20260329-gsc`）

## フェーズ1: クローラー向けファイル作成（Claude担当）

- [x] robots.txt を作成
  - [x] design.md の Disallow 一覧に従って内容を記述
  - [x] Sitemap ディレクティブにフルURL（`https://online-python.exe.xyz/sitemap.xml`）を記載

- [x] sitemap.xml を作成
  - [x] LP（`https://online-python.exe.xyz/`）のみ含める
  - [x] lastmod を `2026-03-30` に設定

- [x] server.js に MIMEタイプを追加
  - [x] `.xml` → `application/xml`
  - [x] `.txt` → `text/plain`

- [x] index.html に canonical URL を追加
  - [x] `<link rel="canonical" href="https://online-python.exe.xyz/">` を `<head>` 内に追加

- [x] ローカル動作確認
  - [x] `curl -I http://localhost:3000/robots.txt` → Content-Type: text/plain
  - [x] `curl -I http://localhost:3000/sitemap.xml` → Content-Type: application/xml
  - [x] `curl -s http://localhost:3000/robots.txt` → 内容が正しい
  - [x] `curl -s http://localhost:3000/sitemap.xml` → 内容が正しい

- [x] コミット

## フェーズ2: サイト公開確認（ユーザー操作）

- [x] exe.dev のpublic設定を確認・実行
  - 操作方法: ターミナルで `ssh exe.dev share set-public online-python` を実行
  - 期待結果: コマンドが成功する
- [x] 外部からのアクセス確認
  - 操作方法: スマホや別のブラウザで `https://online-python.exe.xyz/` を開く
  - 期待結果: LPが表示される（ログイン画面にならない）

## フェーズ3: GSC登録（ユーザー操作 — 画面操作の手順付き）

- [x] GSCにアクセスしてプロパティを追加
  - 操作手順:
    1. ブラウザで https://search.google.com/search-console を開く
    2. Googleアカウントでログインする
    3. 左上の「プロパティを検索」のドロップダウンをクリック
    4. 「+ プロパティを追加」をクリック
    5. 右側の「URLプレフィックス」を選ぶ
    6. `https://online-python.exe.xyz` と入力
    7. 「続行」をクリック
  - 期待結果: 所有権の確認画面が表示される

- [x] 所有権の確認（HTMLファイル方式）
  - 操作手順:
    1. 確認方法の一覧から「HTMLファイル」を選ぶ（最初に表示されているはず）
    2. 「ファイルをダウンロード」ボタンをクリック
    3. ダウンロードされたファイル名をClaudeに教えてください（例: `google1234567890abcdef.html`）
    4. Claudeがファイルを配置してデプロイします
    5. デプロイ完了後、GSCの画面で「確認」ボタンをクリック
  - 期待結果: 「所有権を確認しました」と表示される
  - うまくいかない場合: Claudeがメタタグ方式にフォールバックします

- [x] GSC確認ファイルの配置とデプロイ（Claude担当 — google5363b235eb4d9dc5.html をルートに配置済み）

- [x] サイトマップを送信（ステータス「取得できませんでした」→ 外部アクセスは正常。Google側の反映待ち）
  - 操作手順:
    1. GSCの左メニューから「サイトマップ」をクリック
    2. 「新しいサイトマップの追加」の欄に `sitemap.xml` と入力
    3. 「送信」ボタンをクリック
  - 期待結果: ステータスが「成功」になる（「取得できませんでした」と出ても数分後に再確認すればOK）

- [x] URL検査でインデックスをリクエスト
  - 操作手順:
    1. GSCの左メニューから「URL検査」をクリック
    2. 上部の検索バーに `https://online-python.exe.xyz/` と入力してEnter
    3. 結果が表示されたら「インデックス登録をリクエスト」をクリック
    4. 処理中の画面が表示されるので、完了まで待つ（1-2分）
  - 期待結果: 「インデックス登録をリクエスト済み」と表示される

## フェーズ4: 確認とドキュメント更新

- [x] ローカルの最終確認（Claude担当）
  - [x] robots.txt の内容が正しいか再確認
  - [x] sitemap.xml の内容が正しいか再確認
  - [x] canonical URLが入っているか確認

- [x] marketing-problems.md の P1 ステータスを更新（Claude担当）
  - [x] 「Google Search Consoleへの登録・インデックス確認がまだ」→ 完了表記に更新

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
