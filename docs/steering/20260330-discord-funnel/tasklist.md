# Discord導線の整備 — タスクリスト

## 🚨 タスク完全完了の原則

**このファイルの全タスクが完了するまで作業を継続すること**

### 必須ルール
- **全てのタスクを`[x]`にすること**
- 未完了タスク（`[ ]`）を残したまま作業を終了しない

---

## フェーズ0: ブランチ準備

- [x] mainに未マージのfeatureブランチがないか確認
- [x] 作業用ブランチを作成（`feature/20260330-discord-funnel`）

## フェーズ1: 招待リンク取得 + アプリのTODO置換

- [x] 無期限招待リンクを取得（ユーザーから受領済み: `https://discord.gg/sZCdKvT5Df`）
- [x] app/index.html の `discord.gg/TODO` を `discord.gg/sZCdKvT5Df` に置換
- [x] コミット

## フェーズ2: 翻訳JSONに3キー追加（50言語）

- [ ] 全50言語の translation.json に以下の3キーを追加
  - `lp.communityLabel` — 「コミュニティに参加しよう」
  - `lp.communityButton` — 「Discordに参加する」
  - `lp.footerDiscord` — 「コミュニティ（Discord）」
- [ ] コミット

## フェーズ3: LPテンプレート + CSS修正

- [ ] index.html.tpl: CTAセクションの共有ボタン後にDiscord導線を追加
- [ ] index.html.tpl: フッターにDiscordリンクを追加
- [ ] lp.css: community-section スタイルを追加（Discordブランドカラー #5865F2）
- [ ] コミット

## フェーズ4: LP再生成 + テスト

- [ ] `npm run build-lp` を実行
- [ ] ビルド結果を確認
  - [ ] `grep "discord.gg" index.html` → CTAセクション+フッターの2箇所
  - [ ] `grep "discord.gg" en/index.html` → 2箇所
  - [ ] `grep "TODO" app/index.html` → マッチなし
- [ ] サーバーを再起動
- [ ] ブラウザで目視確認（ユーザー操作）
  - [ ] `https://online-python.exe.xyz/` → フッターとCTAにDiscordリンク
  - [ ] `https://online-python.exe.xyz/en/` → 英語テキストでDiscordリンク
  - [ ] `https://online-python.exe.xyz/app/` → フッターのリンクがDiscordに遷移
- [ ] コミット

## フェーズ5: mainマージ

- [ ] featureブランチをmainにマージ
- [ ] push
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
