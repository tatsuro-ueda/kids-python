---
status: none
priority: normal
scheduled: 2026-04-12T00:00:00.000+09:00
dateCreated: 2026-04-12T00:00:00.000+09:00
dateModified: 2026-04-12T00:00:00.000+09:00
tags:
  - task
---

# 2026年4月12日 ライブ共有・チャット関連の文言を全言語に展開

> 状態：① Journey
> 次のゲート：（ユーザー）Journey 確認・承認 →「Gherkin」と指示

---

## 1) Journey（どこへ行くか）

- **深層的目的**：どの言語で使っても迷わないようにする
- **やらないこと**：新機能追加／既存文言の見直し（今回追加分のみ対象）

```mermaid
flowchart TB
    subgraph BEFORE["Before（ja/en のみ）"]
        direction TB
        B1[ライブ共有・チャット文言が\nja/en にしか入っていない]
        B1 --> B_END[他言語ユーザーは\n英語フォールバックで\n読むことになる]
    end

    subgraph AFTER["After（50言語以上に展開）"]
        direction TB
        A1[全 locales/ に\nライブ共有・チャット文言を追加]
        A1 --> A_END[どの言語でも\nネイティブで表示]
    end

    BEFORE ~~~ AFTER

    classDef oldStyle fill:#f8d7da,stroke:#721c24,color:#000000;
    classDef newStyle fill:#d4edda,stroke:#155724,color:#000000;
    classDef endOld fill:#f5c6cb,stroke:#721c24,color:#000000,font-weight:bold;
    classDef endNew fill:#c3e6cb,stroke:#155724,color:#000000,font-weight:bold;

    class B1 oldStyle;
    class A1 newStyle;
    class B_END endOld;
    class A_END endNew;
```

### 対象キー（3タスク分の合計）

| タスク | 追加キー数 |
|---|---|
| remote-pair-view（ライブ共有） | 12 |
| live-output-share（出力共有） | 0（追加キーなし） |
| live-chat（チャット） | 9 |
| **合計** | **21キー** |

---

## 2) Gherkin（完了条件）

<!-- フェーズ2で記入 -->

---

## 3) Design（どうやるか）

<!-- フェーズ3で記入 -->

---

## 4) Tasklist

<!-- フェーズ4で記入 -->

---

## 5) Discussion（記録・反省）

<!-- フェーズ5で記入 -->
