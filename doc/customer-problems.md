# Customer Problems — Bob Moesta式 Jobs-to-Be-Done 分析

## 1. ターゲットユーザー

小学校低学年（1〜2年生）の子どもたち、およびそのプログラミング学習を支援する**保護者・教師**。

```mermaid
mindmap
  root((ターゲット))
    子ども（小1〜2）
      プログラミングに興味がある
      ひらがなは読める
      英語は読めない
      タブレット操作に慣れている
    保護者
      子どもにプログラミングを学ばせたい
      自身はプログラミング未経験が多い
      環境構築に不安がある
    教師
      プログラミング教育の必修化対応
      クラス全員に同じ環境を提供したい
      Chromebook配備校が増加
```

---

## 2. 中心となるJob（JTBD）

> **子どもが「自分でプログラムを書いて動かせた！」という成功体験を得られるようにしたい**

これは子ども自身のJobであると同時に、保護者・教師が「雇いたい」Jobでもある。

```mermaid
graph TD
    subgraph FJ["Functional Job"]
        F1["ブラウザを開くだけで<br/>Python環境が使える"]
        F2["コードを書いて<br/>すぐ実行できる"]
        F3["エラーが出ても<br/>自分で直せる"]
    end
    subgraph EJ["Emotional Job"]
        E1["できた！と<br/>感じられる"]
        E2["怖くない<br/>楽しい体験"]
        E3["途中で<br/>挫折しない"]
    end
    subgraph SJ["Social Job"]
        S1["親に見て！と<br/>見せられる"]
        S2["教室で全員が<br/>同じ体験をできる"]
        S3["先生が<br/>サポートしやすい"]
    end

    F1 --> E2
    F2 --> E1
    F3 --> E3
    E1 --> S1
    E2 --> S2
    E3 --> S3
```

---

## 3. Struggling Moment（もがきの瞬間）

Bob Moestaのフレームワークでは、ユーザーが「今のやり方では限界だ」と感じる具体的な瞬間を特定する。

```mermaid
timeline
    title 保護者・教師のStruggling Moment Timeline
    section きっかけ
        学校でプログラミング教育が始まる : 「うちの子にもやらせたい」
        子どもが「プログラミングやりたい」と言う : 「何から始めればいいの？」
    section 最初の壁
        Pythonをインストールしようとする : 「PATH？ターミナル？意味不明…」
        Chromebookでインストール不可 : 「そもそもソフトが入れられない」
    section オンライン環境を試す
        Replitなどを開く : 「全部英語で子どもには無理」
        子どもがエラーに遭遇 : 「SyntaxError? 何これ？」
    section 挫折
        子どもが「わからない」と泣く : 「楽しいはずなのに…」
        保護者もエラーを読み解けない : 「私にも助けてあげられない」
```

### もがきの瞬間 詳細

| # | Struggling Moment | 誰が | 感情 |
|---|---|---|---|
| SM1 | Pythonインストールで`PATH`設定が必要と知った瞬間 | 保護者 | 「専門的すぎて手に負えない」 |
| SM2 | Chromebookにソフトがインストールできないと気づいた瞬間 | 教師 | 「クラス全員に環境を揃えられない」 |
| SM3 | 英語UIのオンライン環境を子どもに見せた瞬間 | 保護者 | 「これは小1には無理だ」 |
| SM4 | `SyntaxError: unexpected EOF` が表示された瞬間 | 子ども | 「こわい、壊れた？」 |
| SM5 | エラー行番号を見てもコードのどこか分からない瞬間 | 子ども | 「どこを直せばいいの？」 |
| SM6 | `input()`で突然ダイアログが出た瞬間 | 子ども | 「急に出てきた！何これ？」 |
| SM7 | ブラウザを閉じてコードが消えた瞬間 | 子ども | 「全部消えた！パニック！」 |

---

## 4. Four Forces（4つの力）

```mermaid
graph TD
    PUSH["PUSH（現状への不満）<br/>──────────────<br/>・環境構築が難しすぎる<br/>・英語UIは子どもに使えない<br/>・エラーが読めず手が止まる<br/>・保護者もサポートできない"]
    PULL["PULL（新しい解決策の魅力）<br/>──────────────<br/>・ブラウザだけで動く<br/>・ひらがなUIで子どもが読める<br/>・エラーが日本語で分かる<br/>・インストール不要"]
    ANXIETY["ANXIETY（不安）<br/>──────────────<br/>・本当にPythonが動くの？<br/>・ブラウザだけで大丈夫？<br/>・将来本物の環境に移行できる？<br/>・データが消えない？"]
    HABIT["HABIT（慣性）<br/>──────────────<br/>・Scratchで十分では？<br/>・今のやり方に慣れている<br/>・別の教材を買ってしまった<br/>・学校指定のツールがある"]

    PUSH -->|"変えたい"| CENTER((切り替え<br/>の判断))
    PULL -->|"惹かれる"| CENTER
    ANXIETY -->|"でも不安"| CENTER
    HABIT -->|"今のままで"| CENTER

    style PUSH fill:#ffe0e0,stroke:#cc0000
    style PULL fill:#e0ffe0,stroke:#00cc00
    style ANXIETY fill:#fff5e0,stroke:#cc9900
    style HABIT fill:#e0e8ff,stroke:#0044cc
    style CENTER fill:#f5f5f5,stroke:#666
```

### Push（現状への不満）— なぜ今のやり方を「解雇」したいか

1. **環境構築の壁が高すぎる** — Pythonインストール、PATH設定、ターミナル操作は小学生には不可能。保護者にも煩雑
2. **端末の制約** — タブレットやChromebookにはソフトをインストールできない
3. **英語UI** — 既存オンライン環境のボタン・メニューが全て英語で、子どもが操作できない
4. **英語エラーメッセージ** — `SyntaxError`等は小学生にも保護者にも意味不明
5. **エラー箇所の特定困難** — 行番号が出てもコードとの対応が取れない
6. **input()の分断体験** — promptダイアログがコード実行の流れから唐突
7. **コード消失** — ブラウザを閉じるとコードが消え、子どもがパニックになる

### Pull（新しい解決策への魅力）

1. **ゼロセットアップ** — URLを開くだけで即座にPython環境が使える
2. **ひらがなUI** — 小学1年生でも読めるインターフェース
3. **日本語エラー翻訳** — 何が間違っていて、どう直せばいいか子どもの言葉で伝える
4. **エラー行ハイライト** — エディタ上で問題箇所がピンクに光る
5. **自動保存** — コードが消えない安心感
6. **親しみやすいデザイン** — パステルカラーとマスコットで「楽しそう」と感じる

### Anxiety（切り替えへの不安）

1. 「ブラウザだけで本当にPythonが動くの？」 → **Pyodide（WebAssembly）で本物のPythonが動く**
2. 「将来、本格的な環境に移行するとき困らない？」 → **標準Pythonの構文をそのまま学べる**
3. 「データがブラウザに保存されて消えない？」 → **localStorageで自動保存**
4. 「サーバーに依存して止まらない？」 → **完全クライアントサイド、サーバー不要**

### Habit（現状維持の慣性）

1. 「Scratchで十分では？」 → Scratchはビジュアルプログラミングで、テキストコーディングへの橋渡しが必要
2. 「すでに別の教材を購入済み」 → 本ツールは無料で併用可能
3. 「学校指定のツールがある」 → ブラウザベースなので追加導入が容易

---

## 5. 既存の代替品（Competing Solutions）

子ども・保護者・教師が現在「雇っている」代替品を分析する。

```mermaid
graph TD
    JOB["Job: 子どもにPythonの<br/>成功体験を与えたい"]

    JOB --> A["Scratch<br/>（ビジュアルプログラミング）"]
    JOB --> B["Replit<br/>（オンラインIDE）"]
    JOB --> C["Google Colab<br/>（ノートブック）"]
    JOB --> D["ローカルPython<br/>（インストール型）"]
    JOB --> E["プログラミング教室<br/>（対面・有料）"]
    JOB --> F["Pythonれんしゅうちょう<br/>（本プロダクト）"]

    A -.->|"Pythonじゃない"| X1((不満))
    B -.->|"英語UI"| X2((不満))
    C -.->|"Googleアカウント必要"| X3((不満))
    D -.->|"環境構築が困難"| X4((不満))
    E -.->|"高コスト・通学負担"| X5((不満))

    style F fill:#e8f4fc,stroke:#4a90d9,stroke-width:3px
    style X1 fill:#ffe0e0,stroke:#cc0000
    style X2 fill:#ffe0e0,stroke:#cc0000
    style X3 fill:#ffe0e0,stroke:#cc0000
    style X4 fill:#ffe0e0,stroke:#cc0000
    style X5 fill:#ffe0e0,stroke:#cc0000
```

### 代替品の詳細比較

| 代替品 | Jobの達成度 | 子ども向けか | 導入の手軽さ | コスト | 致命的な不満 |
|---|---|---|---|---|---|
| **Scratch** | 中（Pythonではない） | ◎ | ◎ | 無料 | テキストコーディングを学べない |
| **Replit** | 高 | ✕ | ○ | 無料〜有料 | 英語UI、業務用の見た目 |
| **Google Colab** | 高 | ✕ | △ | 無料 | Googleアカウント必要、ノートブック形式が子どもに不向き |
| **ローカルPython** | 最高 | ✕ | ✕ | 無料 | 環境構築が子ども・保護者に不可能 |
| **プログラミング教室** | 高 | ◎ | ◎ | 月1〜2万円 | 高コスト、通学の時間的負担 |
| **Pythonれんしゅうちょう** | 高 | ◎ | ◎ | 無料 | — |

---

## 6. Effort-Impact Matrix（既存代替品）

代替品を「導入の手間（Effort）」と「Jobの達成度（Impact）」で評価する。

```mermaid
quadrantChart
    title Effort-Impact Matrix
    x-axis Easy --> Hard
    y-axis Low Impact --> High Impact
    quadrant-1 Improve
    quadrant-2 Ideal
    quadrant-3 Compromise
    quadrant-4 Avoid
    Our Product: [0.15, 0.82]
    Scratch: [0.15, 0.40]
    Replit: [0.35, 0.70]
    Google Colab: [0.50, 0.68]
    Coding School: [0.70, 0.80]
    Local Python: [0.90, 0.90]
```

> **凡例**: Our Product = Pythonれんしゅうちょう / Coding School = プログラミング教室 / Local Python = ローカルPython

### マトリクスの読み方

- **左上（理想ゾーン）**: **Pythonれんしゅうちょう** — 導入が最も簡単で、Jobの達成度も高い
- **右上（改善余地あり）**: ローカルPython、プログラミング教室 — Job達成度は高いが、導入コストが大きい
- **左下（妥協ゾーン）**: Scratch — 手軽だが、Pythonを学ぶというJobは達成できない
- **中央**: Replit、Google Colab — そこそこ手軽でJob達成度もあるが、子ども向けではない

```mermaid
graph TD
    subgraph EF["Effortの内訳"]
        E_INSTALL["環境構築"]
        E_ACCOUNT["アカウント作成"]
        E_LANGUAGE["言語の壁"]
        E_COST["金銭コスト"]
        E_TRAVEL["通学の負担"]
    end

    subgraph IM["Impactの内訳"]
        I_PYTHON["本物のPythonか"]
        I_TEXT["テキストコーディングか"]
        I_ERROR["エラーを自力解決できるか"]
        I_FUN["楽しいと感じるか"]
        I_CONTINUE["継続できるか"]
    end
```

### 代替品ごとのEffort-Impact詳細スコア

| 代替品 | 環境構築 | アカウント | 言語の壁 | 金銭コスト | Effort合計 | 本物Python | テキスト | エラー解決 | 楽しさ | 継続性 | Impact合計 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Pythonれんしゅうちょう** | 0 | 0 | 0 | 0 | **0** | ◎ | ◎ | ◎ | ◎ | ○ | **高** |
| **Scratch** | 0 | 0 | 1 | 0 | **1** | ✕ | ✕ | ◎ | ◎ | ◎ | **低** |
| **Replit** | 0 | 2 | 3 | 0 | **5** | ◎ | ◎ | ✕ | ✕ | △ | **中** |
| **Google Colab** | 0 | 3 | 2 | 0 | **5** | ◎ | ◎ | ✕ | ✕ | △ | **中** |
| **プログラミング教室** | 0 | 1 | 0 | 5 | **6** | ◎ | ◎ | ◎ | ◎ | ◎ | **高** |
| **ローカルPython** | 5 | 0 | 2 | 0 | **7** | ◎ | ◎ | ✕ | ✕ | △ | **中** |

---

## 7. Switch Timeline（切り替えのタイムライン）

Bob Moesta式の「切り替え」は一瞬の判断ではなく、段階的に進む。

```mermaid
journey
    title 保護者の切り替えジャーニー
    section 第1の考え（Passive Looking）
      子どもがプログラミングやりたいと言う: 3: 保護者
      なんとなくPythonを調べる: 3: 保護者
```
```mermaid
journey
    title 保護者の切り替えジャーニー
    section 第2の考え（Active Looking）
      インストールの手順を見て挫折: 1: 保護者
      オンライン環境を探し始める: 3: 保護者
      Replitを試すが英語で断念: 2: 保護者, 子ども
```
```mermaid
journey
    title 保護者の切り替えジャーニー
    section 決断（Deciding）
      Pythonれんしゅうちょうを見つける: 4: 保護者
      子どもに触らせてみる: 5: 保護者, 子ども
```
```mermaid
journey
    title 保護者の切り替えジャーニー
    section 最初の体験（First Use）
      print文を実行して出力を見る: 5: 子ども
      エラーが日本語で出て自分で直す: 5: 子ども
      できた！と言う: 5: 子ども, 保護者
```

---

## 8. Progress Making Forces（進歩を生む力）

各Struggling Momentに対して、本プロダクトがどのように「進歩」を実現するか。

```mermaid
flowchart TD
    subgraph SM["Struggling Moment"]
        SM1["環境構築できない"]
        SM2["英語UIが読めない"]
        SM3["エラーが意味不明"]
        SM4["エラー箇所が分からない"]
        SM5["input が唐突"]
        SM6["コードが消える"]
    end

    subgraph SOL["Progress（解決策）"]
        P1["ブラウザ完結<br/>Pyodide/WASM"]
        P2["ひらがなUI<br/>パステルデザイン"]
        P3["日本語エラー翻訳<br/>修正方法の提示"]
        P4["エラー行<br/>ピンクハイライト"]
        P5["インライン<br/>input UI"]
        P6["localStorage<br/>自動保存"]
    end

    subgraph OUT["Outcome（成果）"]
        O1["URLを開いて<br/>即コーディング"]
        O2["子どもが一人で<br/>操作できる"]
        O3["エラーを自分で<br/>理解・修正"]
        O4["問題箇所を<br/>すぐ発見"]
        O5["自然な流れで<br/>対話的プログラム"]
        O6["安心して<br/>試行錯誤"]
    end

    SM1 --> P1 --> O1
    SM2 --> P2 --> O2
    SM3 --> P3 --> O3
    SM4 --> P4 --> O4
    SM5 --> P5 --> O5
    SM6 --> P6 --> O6
```

---

## 9. Demand-Side Insight（需要サイドの洞察）

```mermaid
mindmap
  root((なぜ今<br/>このJobが<br/>重要か))
    プログラミング教育必修化
      2020年〜小学校で必修
      教師の負担増
      端末整備は進むが教材が追いつかない
    GIGAスクール構想
      1人1台端末
      Chromebook比率が高い
      インストール型ツールが使えない
    保護者の関心の高まり
      将来のために
      でも自分は教えられない
      手軽で安全な学習環境を求めている
    Scratchからの卒業
      ビジュアルからテキストの移行期
      ちょうどいい橋渡しがない
      Pythonは次のステップとして認知
```

### 切り替えを後押しする3つの問い（Moesta式）

1. **What's pushing you away?**（何が今のやり方から離れさせる？）
   → 環境構築の難しさ、英語の壁、エラーで止まる体験

2. **What's pulling you toward?**（何が新しい解決策に引き寄せる？）
   → ゼロセットアップ、ひらがな、日本語エラー、可愛いデザイン

3. **What's holding you back?**（何が切り替えを躊躇させる？）
   → 「本物のPython？」「データ消えない？」「将来移行できる？」
   → いずれもプロダクトの技術的特性（Pyodide、localStorage、標準Python構文）で解消可能
