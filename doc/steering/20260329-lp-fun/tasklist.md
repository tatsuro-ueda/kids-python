# タスクリスト

## 🚨 タスク完全完了の原則

**このファイルの全タスクが完了するまで作業を継続すること**

### 必須ルール
- **全てのタスクを`[x]`にすること**
- 「時間の都合により別タスクとして実施予定」は禁止
- 未完了タスク（`[ ]`）を残したまま作業を終了しない

### タスクスキップが許可される唯一のケース
- 実装方針の変更により、機能自体が不要になった

---

## フェーズ0: ブランチ準備

- [x] 作業用ブランチを作成（`feature/20260329-lp-fun`）

## フェーズ1: CTA色変更（A5）

- [x] `.cta-btn` の `background` を `#ff8c42` に変更
- [x] `.cta-btn:hover` を `background: #e67a35; opacity: 1` に変更

## フェーズ2: 色分け（A1+A2+A3）

- [x] problemsリストの✓マーク色分け（A1）
  - [x] `.problem-list li:nth-child(n)::before` で4色（水色/緑/ピンク/黄）に
- [x] safetyのdt見出し色分け（A2）
  - [x] `.safety-list dt:nth-of-type(n)` で4色（青/緑/ピンク/黄）に
- [x] step-number背景色の3色化（A3）
  - [x] `.step:nth-child(n) .step-number` で3色（水色/緑/ピンク）に

## フェーズ3: マーカーペン装飾（A4）

- [x] `h2` に `background-image: linear-gradient(transparent 60%, #f5d99a88 60%)` を追加
- [x] `h2` を `display: inline` に変更
- [x] problems/safetyセクション内でもh2の中央寄せが維持されることを確認

## フェーズ4: 絵文字追加（B1+B2+B4）

- [ ] problemsリストに絵文字追加（B1）
  - [ ] 各liの先頭に😢💻🌍❓を追加
  - [ ] `::before` の `content: "\2713"` ルールを削除
  - [ ] `padding-left` を調整
- [ ] safetyのdtに絵文字追加（B2）
  - [ ] 各dtの先頭に🔒🐍📈🆓を追加
- [ ] problems見出し変更（B4）
  - [ ] 「こんな経験ありませんか？」→「こんなこと、ありませんか？」

## フェーズ5: コード例セクション新設（B3）

- [ ] `index.html` のfeaturesとsafetyの間に `.examples` セクションを追加
  - [ ] 3枚のexample-card（もよう/うた/ロケット）
  - [ ] 各カードに `.example-code`（pre）と `.example-result`（div）
- [ ] `lp.css` にスタイル追加
  - [ ] `.example-grid`: grid, gap
  - [ ] `.example-card`: 白背景, 角丸, オレンジの左ボーダー
  - [ ] `.example-code`: グレー背景, monospace
  - [ ] `.example-result`: 水色背景, 緑の左ボーダー
  - [ ] レスポンシブ: 768px以上で3カラム

## フェーズ6: フェードインアニメ（C1）

- [ ] `lp.css` に `.fade-in` / `.fade-in.visible` スタイル追加
  - [ ] 初期: `opacity: 0; transform: translateY(20px)`
  - [ ] visible: `opacity: 1; transform: translateY(0)`
  - [ ] transition: 0.6s ease
- [ ] `index.html` の対象6セクションに `fade-in` クラスを追加
  - [ ] `.problems`, `.features`, `.examples`, `.safety`, `.howto`, `.cta-section`
- [ ] `index.html` 末尾にIntersection ObserverのインラインJSを追加

## フェーズ7: バウンス+パルスアニメ（C2+C3）

- [ ] `@keyframes bounce` を定義（scale 1→1.3→1, 0.4s）
- [ ] `.howto.visible .step:nth-child(n) .step-number` に0.2秒間隔でbounce適用
- [ ] `@keyframes pulse` を定義（box-shadow波紋, 2s周期）
- [ ] `.cta-btn` にpulseアニメ適用

## フェーズ8: アクセシビリティ + 最終調整

- [ ] `prefers-reduced-motion` メディアクエリを更新
  - [ ] `.fade-in` の初期非表示を解除（`opacity: 1; transform: none; transition: none`）
  - [ ] `.cta-btn` のpulseアニメ無効化
  - [ ] `.step-number` のbounceアニメ無効化
- [ ] 目視確認
  - [ ] 全セクションに2色以上のカラーがあること
  - [ ] CTAがオレンジで目立つこと
  - [ ] コード例セクションが正しく表示されること
  - [ ] モバイル（375px）でレイアウト崩れなし

## フェーズ9: mainマージ

- [ ] featureブランチをmainにマージ
- [ ] 実装後の振り返り（このファイルの下部に記録）

---

## 実装後の振り返り

### 実装完了日
{YYYY-MM-DD}

### 計画と実績の差分

**計画と異なった点**:
- {計画時には想定していなかった技術的な変更点}

**新たに必要になったタスク**:
- {実装中に追加したタスク}

### 学んだこと

**技術的な学び**:
- {実装を通じて学んだ技術的な知見}

### 次回への改善提案
- {次回の機能追加で気をつけること}
