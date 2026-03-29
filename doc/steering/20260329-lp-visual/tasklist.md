# タスクリスト

## 🚨 タスク完全完了の原則

**このファイルの全タスクが完了するまで作業を継続すること**

### 必須ルール
- **全てのタスクを`[x]`にすること**
- 「時間の都合により別タスクとして実施予定」は禁止
- 「実装が複雑すぎるため後回し」は禁止
- 未完了タスク（`[ ]`）を残したまま作業を終了しない

### タスクスキップが許可される唯一のケース
- 実装方針の変更により、機能自体が不要になった
- アーキテクチャ変更により、別の実装方法に置き換わった

スキップ時は必ず理由を明記:
```markdown
- [x] ~~タスク名~~（実装方針変更により不要: 具体的な技術的理由）
```

---

## フェーズ0: ブランチ準備

- [x] 作業用ブランチを作成（`feature/20260329-lp-visual`）

## フェーズ1: Hero背景 — 波形SVG（B4）

- [ ] Heroセクションの背景をグラデーションに変更
  - [ ] `.hero` の `background` を `linear-gradient(180deg, #d0e8f5 0%, #e8f4fc 100%)` に
  - [ ] ドットパターン（`background-image: radial-gradient`）をHero以外のセクションに限定
- [ ] Hero直後に波形SVGを追加
  - [ ] `index.html` の `</section>` (hero) 直後に `.hero-wave` div + インラインSVGを追加
  - [ ] `.hero-wave svg` のスタイル（`display: block; width: 100%; height: 60px`）を追加

## フェーズ2: Heroレイアウト — スクショ+マスコット重ね（B1+A1）

- [ ] Hero内のHTML構造を変更
  - [ ] 既存の `<img class="hero-mascot">` を削除
  - [ ] `.hero-screenshot-wrapper` div を追加（`step-run.png` + `snake.png`）
- [ ] スクリーンショットのスタイルを追加
  - [ ] `.hero-screenshot`: `max-width: 300px`, 角丸, 影
- [ ] マスコット重ね表示のスタイルを追加
  - [ ] `.hero-mascot`: `position: absolute; right: -60px; bottom: -20px; width: 120px`
- [ ] モバイル対応
  - [ ] 幅375px以下でマスコット/スクショのサイズ調整

## フェーズ3: マスコットアニメーション（A3）

- [ ] `@keyframes float` アニメーションを定義（3秒周期、10px移動）
- [ ] `.hero-mascot` に `animation: float 3s ease-in-out infinite` を適用

## フェーズ4: Feature Card強化（C1+C3+C4）

- [ ] 絵文字アイコンを追加（C1）
  - [ ] 各カードに `<span class="feature-icon">` を追加（🌐, ✏️, 💬, 💾）
  - [ ] `.feature-icon` スタイル（`font-size: 2rem; display: block; margin-bottom: 8px`）
- [ ] アクセントカラーボーダーを追加（C3）
  - [ ] 各カードにmodifierクラスを付与（`--blue`, `--green`, `--pink`, `--yellow`）
  - [ ] `border-top: 4px solid <color>` の4色分スタイル
- [ ] ホバーアニメーションを追加（C4）
  - [ ] `.feature-card` に `transition: transform 0.2s ease, box-shadow 0.2s ease`
  - [ ] `.feature-card:hover` に `translateY(-4px)` + `box-shadow`

## フェーズ5: アクセシビリティ + 最終調整

- [ ] `prefers-reduced-motion` メディアクエリを追加
  - [ ] `.hero-mascot` のアニメーション無効化
  - [ ] `.feature-card` のトランジション無効化
- [ ] 目視確認
  - [ ] モバイル（375px）でレイアウト崩れなし
  - [ ] PC（1200px）でマスコット重ね表示が意図通り
  - [ ] 波形SVGがセクション間に隙間なし

## フェーズ6: mainマージ

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
