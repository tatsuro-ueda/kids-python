---
status: done
priority: normal
scheduled: 2026-04-12T00:00:00.000+09:00
dateCreated: 2026-04-12T00:00:00.000+09:00
dateModified: 2026-04-12T00:00:00.000+09:00
tags:
  - task
  - archived
---

# 2026年4月12日 Python環境ロード中はコード入力画面を灰色にする

> 状態：④ Tasklist 実行中（委任）
> 次のゲート：（CC）全Gherkinを満たしたら Discussion でまとめ

---

## 1) Journey（どこへ行くか）

- **深層的目的**：読み込み中と分かって安心させる
- **やらないこと**：凝ったローディングアニメーション／エディタ機能の作り直し

```mermaid
flowchart TB
    subgraph BEFORE["Before（現状）"]
        direction TB
        B1[ページを開く]
        B1 --> B2[エディタは普通の白色で表示される]
        B2 --> B3[Python環境（Pyodide）はまだ読み込み中]
        B3 --> B_END[書ける気がして打ち込むが\n実行ボタンがまだ効かず戸惑う]
    end

    subgraph AFTER["After（達成状態）"]
        direction TB
        A1[ページを開く]
        A1 --> A2[エディタが灰色にグレーアウトされる]
        A2 --> A3[Python環境の読み込みが完了]
        A3 --> A_END[色が戻り\n「今から書けるよ」と伝わる]
    end

    BEFORE ~~~ AFTER

    classDef oldStyle fill:#f8d7da,stroke:#721c24,color:#000000;
    classDef newStyle fill:#d4edda,stroke:#155724,color:#000000;
    classDef endOld fill:#f5c6cb,stroke:#721c24,color:#000000,font-weight:bold;
    classDef endNew fill:#c3e6cb,stroke:#155724,color:#000000,font-weight:bold;

    class B1,B2,B3 oldStyle;
    class A1,A2,A3 newStyle;
    class B_END endOld;
    class A_END endNew;
```

---

## 2) Gherkin（完了条件）

### シナリオ1：正常系（ロード中にエディタが灰色になる）

> {ページを開いた直後・Pyodideロード中} で {エディタを見る} すると {グレーアウト表示になっている}

```mermaid
flowchart TD
    A1[ページを開く] --> A2[startLoadPyodide 開始]
    A2 --> A3[#editor に .loading クラス付与]
    A3 --> AOK["✓ CSSで灰色 + 操作不可"]

    classDef ok fill:#d4edda,stroke:#155724,color:#000000;
    class AOK ok;
```

---

### シナリオ2：正常系（ロード完了で元に戻る）

> {Pyodideロード完了} で {エディタを見る} すると {色が通常に戻り書き始められる}

```mermaid
flowchart TD
    B1[Pyodide ready] --> B2[onStatus null で呼ばれる]
    B2 --> B3[#editor の .loading クラス除去]
    B3 --> BOK["✓ 通常表示 + run-btn 有効"]

    classDef ok fill:#d4edda,stroke:#155724,color:#000000;
    class BOK ok;
```

---

### シナリオ3：異常系（ロード失敗でも状態が明確）

> {Pyodideロード失敗} で {エディタを見る} すると {灰色のままで「書けない状態」と視認できる}

```mermaid
flowchart TD
    C1[Pyodide load error] --> C2[onError 呼び出し]
    C2 --> C3{.loading クラスをどうする?}
    C3 -->|保持| COK["✓ 灰色のまま\n（まだ書けない）\n再試行ボタンは status に表示"]

    classDef ok fill:#d4edda,stroke:#155724,color:#000000;
    classDef gate fill:#e2e3f1,stroke:#3949ab,color:#000000;
    class C3 gate;
    class COK ok;
```

---

### シナリオ4：リスク確認（既存機能に悪影響がない）

> {グレーアウト実装済み} で {ロード完了後にコード入力・実行・保存・全画面切替} すると {既存機能が正常動作する}

```mermaid
flowchart TD
    D1[ロード完了後の状態] --> D2{エディタで通常操作可能?}
    D2 -->|Yes| DOK["✓ 影響なし"]
    D2 -->|No| DFAIL["⚠ 悪影響あり"]

    classDef ok fill:#d4edda,stroke:#155724,color:#000000;
    classDef fail fill:#f8d7da,stroke:#721c24,color:#000000;
    classDef gate fill:#e2e3f1,stroke:#3949ab,color:#000000;
    class D2 gate;
    class DOK ok;
    class DFAIL fail;
```

---

## 3) Design（どうやるか）

- **関連スキル・MCP**：なし（フロントエンドのみ）
- **既存ヒント**：`runBtn.disabled` はロード中すでに立っている。エディタ側には視覚フィードバックがないのが今の痛み

```mermaid
flowchart LR
    subgraph INPUT["インプット"]
        I1["src/main.js\nstartLoadPyodide"]
        I2["src/runner.js\nloadPyodide コールバック"]
        I3["app/style.css"]
    end

    subgraph PROCESS["処理・変換"]
        P1["startLoadPyodide 開始時\neditorContainer に\n.loading を付与"]
        P2["onStatus(null) で\n.loading を除去"]
        P3["CSS で\n.loading 状態を\nグレースケール + 半透明 +\npointer-events: none"]
    end

    subgraph OUTPUT["アウトプット"]
        O1["エディタが灰色化 →\nロード完了で復帰"]
    end

    INPUT --> PROCESS --> OUTPUT

    classDef io fill:#e2e3f1,stroke:#3949ab,color:#000000;
    classDef proc fill:#fff3cd,stroke:#856404,color:#000000;
    classDef out fill:#d4edda,stroke:#155724,color:#000000;

    class I1,I2,I3 io;
    class P1,P2,P3 proc;
    class O1 out;
```

```mermaid
flowchart TD
    D1[① style.css に #editor.loading 追加] --> D2[② src/main.js で\nstartLoadPyodide 冒頭に\neditorContainer.classList.add loading]
    D2 --> D3[③ setStatus または\nstartLoadPyodide の成功コールバックで\n.loading を除去]
    D3 --> D4[④ npm run build]
    D4 --> D5[⑤ 動作確認]
    D5 --> D6[⑥ Discussion 記録]

    classDef done fill:#d4edda,stroke:#155724;
    class D6 done;
```

---

## 4) Tasklist

- [x] `app/style.css` に `#editor.loading` スタイルを追加（grayscale + opacity + pointer-events）
- [x] `src/main.js` に `editorContainer` の `.loading` クラス付与／除去を実装
- [x] `npm run build` でバンドル再生成（1.0mb, 164ms）
- [x] ビルドエラーがないことを確認
- [x] 既存テスト（`npm test`）12/12 pass
- [x] Gherkin全シナリオをCoVeで検証

---

## 5) Discussion（記録・反省）

### 2026年4月12日 01:30（実装・委任実行）

**Observe**：
- Pyodide ロードフローは `src/main.js` の `startLoadPyodide()` → `src/runner.js` の `loadPyodide()` で、完了時に `onStatus(null)` が呼ばれる
- 既存実装では `runBtn.disabled = true/false` の切替のみで、エディタ自体の視覚フィードバックは無し（Gherkin通りの痛み点を確認）
- `editorContainer` は `document.getElementById("editor")` でクロージャに入っており、`startLoadPyodide` から直接触れる

**Think**：
- クラスのトグルはエディタDOMのルート（`#editor`）に `.loading` を付ける1箇所で済む → CodeMirror 中の細かい要素に触らずに済む
- CSS は `filter: grayscale(1)` + `opacity: 0.5` + `pointer-events: none` の3点で「見た目グレー」「触れない」を同時実現
- `transition: filter 0.3s, opacity 0.3s` で切り替えを滑らかに → ロード完了時の復帰感が気持ちよくなる
- エラー時は `.loading` を**敢えて残す**ことで「まだ書けない」を視覚的に維持 → シナリオ3の要件

**Act**：
- `app/style.css:241-254` に `#editor.loading` を追加
- `src/main.js:326` に `editorContainer.classList.add("loading")` を追加
- `src/main.js:334-339` の `onStatus` コールバックで `msg===null` 時に `.loading` を除去
- `npm run build` → `app/dist/bundle.js` 再生成（1.0mb, 164ms）
- `npm test` → 12/12 pass（既存機能への悪影響なし）
- バンドルに `editorContainer.classList.add("loading")` と `.remove("loading")` の両方が含まれていることを grep で確認

**CoVe 検証**：
- シナリオ1（ロード中に灰色）：`startLoadPyodide()` 冒頭で `.loading` 付与 → CSS適用 → ✓
- シナリオ2（完了で復帰）：`onStatus(null)` ブランチで `.loading` 除去 → ✓
- シナリオ3（失敗時は灰色維持）：`onError` コールバックでは `.loading` に触れない → 視覚的に「書けない」を保持 → ✓
- シナリオ4（悪影響なし）：`pointer-events: none` は `.loading` クラス限定、`transition` は filter/opacity のみでレイアウトに影響せず、`npm test` 12/12 pass → ✓

---

### 反省とルール化

- CSSの `.loading` 状態で `pointer-events: none` を組み合わせると、見た目（grayscale + opacity）と挙動（操作不可）を1クラスで同時制御できる → 同系統のローディング UI で再利用できるパターン
- フロントエンド静的ファイルのみの変更なら server.js 再起動不要（メモリ `restart-server-before-verify` は `server.js` 変更時に限定される）
- 次にやること：次セッションで実機ブラウザで視覚確認（CC側では UI を開けないため）
