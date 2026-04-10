---
status: in-progress
priority: normal
scheduled: 2026-04-10T00:00:00.000+09:00
dateCreated: 2026-04-10T00:00:00.000+09:00
dateModified: 2026-04-10T00:00:00.000+09:00
tags:
  - task
---

# 2026年4月10日 Googleアナリティクス導入

> 状態：① Journey ② Gherkin ③ Design ④ Tasklist ⑤ Discussion
> 次のゲート：（ユーザー）Gherkin の内容を確認・承認 →「Design」と指示

---

## 1) Journey（どこへ行くか）

- **深層的目的**：ユーザーの反応を知り改善に活かす
- **やらないこと**：複雑なカスタムイベント設計（まずは基本導入）

```mermaid
flowchart TB
    subgraph BEFORE["Before（現状）"]
        direction TB
        B1[サイトを公開している]
        B1 --> B2[ユーザーがどう使っているか見えない]
        B2 --> B_END[反応がわからず改善の手がかりがない]
    end

    subgraph AFTER["After（達成状態）"]
        direction TB
        A1[サイトを公開している]
        A1 --> A2[GAでアクセス状況・行動が見える]
        A2 --> A_END[反応が見えて嬉しい＆改善のきっかけになる]
    end

    BEFORE ~~~ AFTER

    classDef oldStyle fill:#f8d7da,stroke:#721c24,color:#000000;
    classDef newStyle fill:#d4edda,stroke:#155724,color:#000000;
    classDef endOld fill:#f5c6cb,stroke:#721c24,color:#000000,font-weight:bold;
    classDef endNew fill:#c3e6cb,stroke:#155724,color:#000000,font-weight:bold;

    class B1,B2 oldStyle;
    class A1,A2 newStyle;
    class B_END endOld;
    class A_END endNew;
```

---

## 2) Gherkin（完了条件）

### シナリオ1：正常系（GAがデータを収集できる）

> {GAタグがLP・アプリ両方に埋め込まれた状態} で {ページにアクセス} すると {GAリアルタイムレポートにアクセスが表示される}

```mermaid
flowchart TD
    A1[ユーザーがページにアクセス] --> A2[gtagスクリプトが読み込まれる]
    A2 --> A3[ページビューイベントが送信される]
    A3 --> AOK["✓ GAリアルタイムにアクセスが表示"]

    classDef ok fill:#d4edda,stroke:#155724,color:#000000;
    class AOK ok;
```

### シナリオ2：正常系（LP・アプリ両方で計測される）

> {GAタグ導入済み} で {LPとアプリそれぞれにアクセス} すると {両方のページビューがGAに記録される}

```mermaid
flowchart TD
    B1[LPにアクセス] --> B2[index.html.tpl経由でgtag発火]
    B3[アプリにアクセス] --> B4[app/index.html経由でgtag発火]
    B2 --> BOK["✓ 両方のPVがGAに記録"]
    B4 --> BOK

    classDef ok fill:#d4edda,stroke:#155724,color:#000000;
    class BOK ok;
```

### シナリオ3：リスク確認（既存機能に悪影響がない）

> {GAタグ追加後} で {エディタでPython実行・保存・全画面切替} すると {既存機能が正常に動作する}

```mermaid
flowchart TD
    C1[GAタグ追加後の状態] --> C2{エディタ機能が正常?}
    C2 -->|Yes| COK["✓ 影響なし"]
    C2 -->|No| CFAIL["⚠ 悪影響あり"]

    classDef ok fill:#d4edda,stroke:#155724,color:#000000;
    classDef fail fill:#f8d7da,stroke:#721c24,color:#000000;
    classDef gate fill:#e2e3f1,stroke:#3949ab,color:#000000;
    class C2 gate;
    class COK ok;
    class CFAIL fail;
```

### シナリオ4：リスク確認（CSP導入時に備える）

> {CSPは現在未実装だが} で {将来CSP導入時にGAが必要とするドメインを} すると {Designにメモとして残しておく}

```mermaid
flowchart TD
    D1[CSPは現在未実装] --> D2[GA導入で必要なドメインを特定]
    D2 --> DOK["✓ googletagmanager.com / google-analytics.com をDesignにメモ"]

    classDef ok fill:#d4edda,stroke:#155724,color:#000000;
    class DOK ok;
```

### シナリオ5：正常系（子ども向けプライバシー設定が有効）

> {GA4プロパティ設定済み} で {gtagの設定を確認} すると {広告パーソナライズ無効・COPPA対応フラグが設定されている}

```mermaid
flowchart TD
    E1[gtag設定を確認] --> E2{ads_personalization: denied?}
    E2 -->|Yes| E3{ad_storage: denied?}
    E3 -->|Yes| EOK["✓ 子ども向け設定が有効"]
    E2 -->|No| EFAIL["⚠ 広告パーソナライズが有効なまま"]
    E3 -->|No| EFAIL

    classDef ok fill:#d4edda,stroke:#155724,color:#000000;
    classDef fail fill:#f8d7da,stroke:#721c24,color:#000000;
    classDef gate fill:#e2e3f1,stroke:#3949ab,color:#000000;
    class E2,E3 gate;
    class EOK ok;
    class EFAIL fail;
```

### シナリオ6：正常系（EU圏ユーザーはトラッキングしない）

> {EU圏からのアクセス} で {ページを開く} すると {GAタグが発火せずトラッキングされない}

```mermaid
flowchart TD
    F1[ユーザーがアクセス] --> F2{リクエスト元がEU圏?}
    F2 -->|Yes| FOK["✓ GAタグを出力しない"]
    F2 -->|No| F3[GAタグが発火]
    F3 --> F3OK["✓ 通常通り計測"]

    classDef ok fill:#d4edda,stroke:#155724,color:#000000;
    classDef gate fill:#e2e3f1,stroke:#3949ab,color:#000000;
    class F2 gate;
    class FOK,F3OK ok;
```

---

## 3) Design（どうやるか）

- **関連スキル・MCP**：なし（バニラJS + server.js の修正のみ）

### 全体構成図

```mermaid
flowchart TD
    subgraph INPUT["インプット"]
        I1["index.html.tpl\n（LP テンプレート）"]
        I2["app/index.html\n（エディタ）"]
        I3["server.js\n（配信サーバー）"]
        I4["geoip-lite\n（既存・国判定）"]
    end

    subgraph PROCESS["処理・変換"]
        P1["HTMLに\nGA プレースホルダー\n&lt;!-- GA_TAG --&gt;\nを埋め込む"]
        P2["server.js が\nHTML配信時に\n国判定して\nプレースホルダーを\n置換 or 除去"]
    end

    subgraph OUTPUT["アウトプット"]
        O1["非EU → GAタグ入りHTML"]
        O2["EU → GAタグなしHTML"]
    end

    INPUT --> PROCESS --> OUTPUT

    classDef io fill:#e2e3f1,stroke:#3949ab,color:#000000;
    classDef proc fill:#fff3cd,stroke:#856404,color:#000000;
    classDef out fill:#d4edda,stroke:#155724,color:#000000;

    class I1,I2,I3,I4 io;
    class P1,P2 proc;
    class O1,O2 out;
```

### リクエスト処理フロー

```mermaid
flowchart TD
    R1["ユーザーがページにアクセス"]
    R1 --> R2["server.js がリクエスト受信"]
    R2 --> R3["ファイルを読み込む\n（index.html / app/index.html）"]
    R3 --> R4{"拡張子が .html ?"}
    R4 -->|No| R5["そのまま返す\n（CSS/JS/画像など）"]
    R4 -->|Yes| R6["geoip-lite で\nIPから国コードを取得"]
    R6 --> R7{"EU圏の国コード？"}
    R7 -->|Yes| R8["&lt;!-- GA_TAG --&gt; を\n空文字に置換"]
    R7 -->|No| R9["&lt;!-- GA_TAG --&gt; を\ngtagスニペットに置換"]
    R8 --> R10["HTMLを返す"]
    R9 --> R10

    classDef gate fill:#e2e3f1,stroke:#3949ab,color:#000000;
    classDef ok fill:#d4edda,stroke:#155724,color:#000000;
    classDef warn fill:#fff3cd,stroke:#856404,color:#000000;
    classDef action fill:#f0f0f0,stroke:#333,color:#000000;

    class R4,R7 gate;
    class R5,R10 ok;
    class R8 warn;
    class R9 action;
```

### gtagスニペットの構成

```mermaid
flowchart TD
    G1["&lt;script async src=\ngoogletagmanager.com/gtag/js?id=G-XXX&gt;"]
    G1 --> G2["gtag('js', new Date())"]
    G2 --> G3["gtag('consent', 'default', ...)"]
    G3 --> G4["ad_storage: 'denied'\nad_personalization: 'denied'\nanalytics_storage: 'granted'"]
    G4 --> G5["gtag('config', 'G-XXX')"]

    classDef code fill:#f5f5f5,stroke:#333,color:#000000;
    classDef important fill:#fff3cd,stroke:#856404,color:#000000,font-weight:bold;

    class G1,G2,G3,G5 code;
    class G4 important;
```

### 変更対象ファイル一覧

```mermaid
flowchart TD
    F1["① index.html.tpl"]
    F1 --> F1D["headの末尾に\n&lt;!-- GA_TAG --&gt; を追加"]

    F2["② app/index.html"]
    F2 --> F2D["headの末尾に\n&lt;!-- GA_TAG --&gt; を追加"]

    F3["③ server.js"]
    F3 --> F3A["GA_MEASUREMENT_ID を\n環境変数から読む"]
    F3A --> F3B["EU国コードリストを定義"]
    F3B --> F3C["HTML配信時に\nプレースホルダーを置換する\nロジックを追加"]

    F4["④ scripts/build-lp.js"]
    F4 --> F4D["変更不要\n（tplにプレースホルダーが\n入るだけなので\nビルド時は素通り）"]

    classDef file fill:#e2e3f1,stroke:#3949ab,color:#000000,font-weight:bold;
    classDef detail fill:#f0f0f0,stroke:#333,color:#000000;
    classDef skip fill:#d4edda,stroke:#155724,color:#000000;

    class F1,F2,F3 file;
    class F1D,F2D,F3A,F3B,F3C detail;
    class F4 file;
    class F4D skip;
```

### CSPメモ（将来のCSP導入時に参照）

GA4に必要な許可ドメイン：
- `script-src`: `https://www.googletagmanager.com`
- `connect-src`: `https://www.google-analytics.com`, `https://analytics.google.com`
- `img-src`: `https://www.google-analytics.com`

---

## 4) Tasklist

<!-- フェーズ4で記入 -->

---

## 5) Discussion（記録・反省）

### 2026年4月10日（Design確認・GA4プロパティ作成）

**Observe**：GA4プロパティを作成し、測定ID `G-ND7RDEHXPK` を取得。管理方法は環境変数 `GA_MEASUREMENT_ID` に決定。
**Think**：IDが確定したので実装に進める状態。
**Act**：Designセクション記入完了、測定ID記録。
