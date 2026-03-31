# アーキテクチャ設計書 — Python Notebook

## テクノロジースタック

### 言語・ランタイム

| 技術 | バージョン | 選定理由 |
|------|-----------|----------|
| Node.js | v22+ | サーバーサイドは静的配信のみのため軽量ランタイムとして最適 |
| JavaScript (ES2020+) | ESM | ブラウザネイティブモジュール対応、TypeScript不要な規模感 |
| Python 3.12 | Pyodide同梱 | ユーザーが実行するターゲット言語、WASM経由でブラウザ内動作 |

### フレームワーク・ライブラリ

| 技術 | バージョン | 用途 | 選定理由 |
|------|-----------|------|----------|
| Pyodide | 2024.0 | ブラウザ内Python実行 | CPython互換のWASMランタイム、サーバーレス実行が可能 |
| CodeMirror | 6.x | コードエディタ | モダンで拡張性が高く、Python構文ハイライト対応 |
| i18next | 26.x | 国際化 | 49言語対応、LanguageDetector + HttpBackendで動的ロード |
| esbuild | 0.27.x | バンドラー | 高速ビルド、ESM出力、設定が最小限 |
| Playwright | 1.58.x | E2Eテスト・スクリーンショット | LP用スクリーンショット自動生成 |

## システム全体像

```mermaid
graph TB
    subgraph Browser["ユーザーのブラウザ"]
        UI["UI Layer<br/>index.html + style.css"]
        Editor["CodeMirror 6<br/>editor.js"]
        Runner["Python Runner<br/>runner.js"]
        I18n["i18next<br/>i18n.js"]
        Storage["localStorage<br/>storage.js"]
        Errors["Error Translator<br/>errors.js"]
        Samples["Sample Loader<br/>samples.js"]
        Pyodide["Pyodide<br/>Python 3.12 WASM"]
    end

    subgraph Server["静的サーバー"]
        ServerJS["server.js<br/>Node.js HTTP :3000"]
        StaticFiles["静的ファイル群"]
    end

    subgraph Build["ビルドパイプライン"]
        ESBuild["esbuild<br/>src/ → bundle.js"]
        LPBuild["build-lp.js<br/>テンプレート → HTML"]
        Validate["validate-i18n.js<br/>翻訳検証"]
        Screenshots["screenshots.js<br/>Playwright"]
    end

    UI --> Editor
    UI --> Runner
    UI --> I18n
    UI --> Storage
    Runner --> Pyodide
    Runner --> Errors
    Errors --> I18n
    Samples --> I18n

    ServerJS --> StaticFiles
    ESBuild --> StaticFiles
    LPBuild --> StaticFiles
```

## アーキテクチャパターン

### クライアントサイド完結型アーキテクチャ

本プロジェクトの最大の特徴は**サーバーレス実行**です。Python コードの実行、データ保存、国際化のすべてがブラウザ内で完結します。

```mermaid
graph TB
    subgraph Traditional["従来のオンラインIDE"]
        A1[ブラウザ] -->|コード送信| B1[サーバー]
        B1 -->|実行結果| A1
    end

    subgraph PythonNotebook["Python Notebook"]
        A2[ブラウザ] -->|直接実行| C2[Pyodide WASM]
        C2 -->|結果| A2
    end

    style B1 fill:#ff9999
    style C2 fill:#99ff99
```

### レイヤードアーキテクチャ

```mermaid
graph TB
    subgraph UILayer["UI Layer"]
        HTML["index.html<br/>DOM構造"]
        CSS["style.css<br/>スタイリング"]
        Main["main.js<br/>イベントハンドラ"]
    end

    subgraph ServiceLayer["Service Layer"]
        EditorSvc["editor.js<br/>エディタ制御"]
        RunnerSvc["runner.js<br/>コード実行"]
        ErrorSvc["errors.js<br/>エラー翻訳"]
        I18nSvc["i18n.js<br/>言語管理"]
        SampleSvc["samples.js<br/>サンプル取得"]
    end

    subgraph DataLayer["Data Layer"]
        LS["localStorage<br/>コード永続化"]
        URLHash["URL Hash<br/>コード共有"]
        JSON["locales/*.json<br/>翻訳データ"]
        PyodideRT["Pyodide WASM<br/>Python実行環境"]
    end

    Main --> EditorSvc
    Main --> RunnerSvc
    Main --> I18nSvc
    Main --> SampleSvc
    RunnerSvc --> ErrorSvc
    ErrorSvc --> I18nSvc
    SampleSvc --> I18nSvc

    EditorSvc --> LS
    RunnerSvc --> PyodideRT
    I18nSvc --> JSON
    Main --> URLHash

    style HTML fill:#e8f4fc
    style CSS fill:#e8f4fc
    style Main fill:#e8f4fc
```

#### 各レイヤーの責務

| レイヤー | 責務 | 許可される操作 | 禁止される操作 |
|---------|------|--------------|--------------|
| UI | ユーザー入力受付、DOM操作 | Service Layer呼び出し | Data Layer直接アクセス |
| Service | ビジネスロジック（実行、翻訳、エディタ制御） | Data Layer呼び出し | DOM操作 |
| Data | データ永続化、外部リソースアクセス | localStorage, fetch, Pyodide | ビジネスロジック実装 |

## モジュール依存関係

```mermaid
graph TD
    main["main.js<br/>(エントリーポイント)"]
    editor["editor.js<br/>(CodeMirror)"]
    runner["runner.js<br/>(Pyodide)"]
    errors["errors.js<br/>(エラー翻訳)"]
    i18n["i18n.js<br/>(i18next)"]
    storage["storage.js<br/>(localStorage)"]
    samples["samples.js<br/>(サンプルコード)"]

    main --> editor
    main --> runner
    main --> i18n
    main --> storage
    main --> samples
    runner --> errors
    errors --> i18n
    samples --> i18n

    style main fill:#ffd700
    style i18n fill:#87ceeb
```

## データフロー

### コード実行フロー

```mermaid
sequenceDiagram
    actor User as ユーザー
    participant UI as main.js
    participant Editor as editor.js
    participant Runner as runner.js
    participant Pyodide as Pyodide WASM
    participant Errors as errors.js
    participant I18n as i18n.js

    User->>UI: "実行" ボタンクリック
    UI->>Editor: getCode()
    Editor-->>UI: Pythonコード
    UI->>Runner: runPython(code)
    Runner->>Pyodide: runPythonAsync(code)

    alt 正常実行
        Pyodide-->>Runner: stdout出力
        Runner-->>UI: 実行結果
        UI->>User: 結果を表示
    else エラー発生
        Pyodide-->>Runner: Error
        Runner->>Errors: translateError(error)
        Errors->>I18n: t("error.xxxKey", params)
        I18n-->>Errors: 翻訳済みメッセージ
        Errors-->>Runner: 子ども向けエラーメッセージ
        Runner-->>UI: エラー情報 + 行番号
        UI->>Editor: highlightError(line)
        UI->>User: 翻訳エラー表示
    end
```

### コード共有フロー

```mermaid
sequenceDiagram
    actor Author as 作成者
    participant UI as main.js
    participant Storage as storage.js
    participant Clipboard as Clipboard API
    actor Reader as 閲覧者

    Author->>UI: "共有" ボタンクリック
    UI->>Storage: encodeToURL(code)
    Storage-->>UI: URL#code=base64...
    UI->>Clipboard: writeText(shareURL)
    UI->>Author: "コピーしました" 通知

    Note over Author,Reader: SNS/メッセージで共有

    Reader->>UI: 共有URLにアクセス
    UI->>Storage: decodeFromURL()
    Storage-->>UI: Pythonコード
    UI->>UI: エディタにコードをセット
```

### 言語検出・切替フロー

```mermaid
flowchart TD
    Start([ページ読み込み]) --> Q1{URLに ?lang= あり?}
    Q1 -->|Yes| SetLang1[その言語を設定]
    Q1 -->|No| Q2{localStorageに<br/>preferred-lang あり?}
    Q2 -->|Yes| SetLang2[保存済み言語を設定]
    Q2 -->|No| Q3{navigator.language<br/>を取得}
    Q3 --> SetLang3[ブラウザ言語を設定]

    SetLang1 --> Load[翻訳JSON読み込み]
    SetLang2 --> Load
    SetLang3 --> Load

    Load --> Apply[DOM要素を翻訳<br/>data-i18n属性]
    Apply --> RTL{RTL言語?<br/>ar/fa/ur/he}
    RTL -->|Yes| SetRTL[dir=rtl 設定]
    RTL -->|No| SetLTR[dir=ltr 維持]

    SetRTL --> Done([表示完了])
    SetLTR --> Done
```

## ビルドパイプライン

```mermaid
flowchart TD
    subgraph Source["ソース"]
        SRC["src/*.js"]
        TPL["*.html.tpl"]
        LOCALES["locales/*/"]
    end

    subgraph BuildStep["ビルド"]
        ESB["esbuild"]
        BLP["build-lp.js"]
        VAL["validate-i18n.js"]
        SS["screenshots.js"]
    end

    subgraph Output["成果物"]
        BUNDLE["app/dist/bundle.js"]
        LP_JA["/index.html"]
        LP_EN["/en/index.html"]
        LP_XX["/xx/index.html"]
        PRIV["/privacy.html"]
        SHOTS["assets/screenshots/"]
    end

    SRC -->|npm run build| ESB --> BUNDLE
    TPL -->|npm run build:lp| BLP
    LOCALES --> BLP
    BLP --> LP_JA
    BLP --> LP_EN
    BLP --> LP_XX
    BLP --> PRIV
    LOCALES -->|npm run validate:i18n| VAL
    LP_JA -->|npm run screenshots| SS --> SHOTS
```

## ディレクトリ構造

```mermaid
graph TD
    ROOT["online-python/"]
    APP["app/<br/>Webアプリ本体"]
    SRC["src/<br/>ソースコード"]
    LOCALES["locales/<br/>49言語の翻訳"]
    VENDOR["vendor/<br/>Pyodide WASM"]
    SCRIPTS["scripts/<br/>ビルドツール"]
    ASSETS["assets/<br/>画像・スクリーンショット"]
    DOCS["docs/<br/>設計ドキュメント"]

    ROOT --> APP
    ROOT --> SRC
    ROOT --> LOCALES
    ROOT --> VENDOR
    ROOT --> SCRIPTS
    ROOT --> ASSETS
    ROOT --> DOCS

    APP --> APP_HTML["index.html"]
    APP --> APP_CSS["style.css"]
    APP --> APP_DIST["dist/bundle.js"]

    SRC --> SRC_MAIN["main.js"]
    SRC --> SRC_EDITOR["editor.js"]
    SRC --> SRC_RUNNER["runner.js"]
    SRC --> SRC_I18N["i18n.js"]
    SRC --> SRC_ERRORS["errors.js"]
    SRC --> SRC_STORAGE["storage.js"]
    SRC --> SRC_SAMPLES["samples.js"]

    LOCALES --> L_JA["ja/"]
    LOCALES --> L_EN["en/"]
    LOCALES --> L_XX["...47言語"]

    style APP fill:#e8f4fc
    style SRC fill:#fff3cd
    style LOCALES fill:#d4edda
    style VENDOR fill:#f8d7da
```

## データ永続化戦略

### ストレージ方式

| データ種別 | ストレージ | キー/形式 | ライフサイクル |
|-----------|----------|----------|--------------|
| ユーザーのコード | localStorage | `python-editor-code` | デバイスごと、永続 |
| 言語設定 | localStorage | `preferred-lang` | デバイスごと、永続 |
| バナー非表示 | localStorage | `bookmark-banner-dismissed` | デバイスごと、永続 |
| 共有コード | URL Hash | `#code=<base64>` | 一時的、URLで共有可能 |
| 翻訳データ | 静的JSON | `/locales/{lang}/*.json` | バージョン管理下 |
| サンプルコード | 静的JSON | `/locales/{lang}/samples.json` | バージョン管理下 |

```mermaid
graph TB
    subgraph ClientStorage["クライアント永続化"]
        LS["localStorage"]
        URL["URL Hash"]
    end

    subgraph ServerFiles["サーバー静的ファイル"]
        JSON2["locales/*.json"]
        WASM["vendor/pyodide/"]
    end

    LS ---|コード保存| Code["ユーザーコード"]
    LS ---|設定保存| Pref["言語設定"]
    URL ---|共有| Share["共有コード"]
    JSON2 ---|fetch| Trans["翻訳・サンプル"]
    WASM ---|fetch| Py["Python実行環境"]

    style LS fill:#fff3cd
    style URL fill:#d4edda
    style JSON2 fill:#e8f4fc
    style WASM fill:#f8d7da
```

**バックアップ**: ユーザーデータはlocalStorageのみに保存されるため、サーバーサイドのバックアップは不要。コード共有URL経由でユーザー自身がバックアップ可能。

## 国際化 (i18n) アーキテクチャ

### 言語展開フェーズ

```mermaid
gantt
    title 言語対応ロードマップ
    dateFormat YYYY-MM-DD
    section Phase 0
        日本語 ja            :done, p0, 2024-01-01, 30d
    section Phase 1
        英語 ヒンディー スペイン アラビア  :done, p1, after p0, 30d
    section Phase 2
        ポルトガル インドネシア ベトナム トルコ ベンガル :done, p2, after p1, 30d
    section Phase 3
        韓国 中国繁体 ペルシャ タイ 仏 ウルドゥー 露 :done, p3, after p2, 30d
    section Phase 4
        残り32言語              :done, p4, after p3, 60d
```

### i18n データフロー

```mermaid
flowchart TD
    subgraph TransFiles["翻訳ファイル構造"]
        T["translation.json"]
        S["samples.json"]
    end

    subgraph I18nConfig["i18next 設定"]
        Detector["LanguageDetector<br/>言語自動検出"]
        Backend["HttpBackend<br/>JSON動的ロード"]
        Core["i18next Core<br/>翻訳エンジン"]
    end

    subgraph Usage["利用箇所"]
        DOM["DOM翻訳<br/>data-i18n属性"]
        ErrTrans["エラー翻訳<br/>errors.js"]
        SampleUI["サンプル表示<br/>samples.js"]
    end

    Detector --> Core
    Backend --> Core
    T --> Backend
    S --> Backend
    Core --> DOM
    Core --> ErrTrans
    Core --> SampleUI
```

## エラー翻訳システム

```mermaid
flowchart TD
    PyErr["Python Error<br/>SyntaxError: invalid syntax"]
    Parse["エラーパーサー<br/>正規表現20+パターン"]
    Extract["情報抽出<br/>行番号 + エラー種別 + 変数名"]
    Translate["i18n翻訳<br/>t&#40;'error.syntaxInvalid'&#41;"]
    Display["ユーザー表示"]

    PyErr --> Parse
    Parse --> Extract
    Extract --> Translate
    Translate --> Display

    Display --> Friendly["子ども向けメッセージ<br/>「この書き方には間違いがあるよ」"]
    Display --> Detail["折りたたみ詳細<br/>元のエラーメッセージ"]
    Display --> Highlight["エディタ行ハイライト<br/>エラー行を赤表示"]
```

### 対応エラー種別

| カテゴリ | エラー種別 | 翻訳キー例 |
|---------|-----------|-----------|
| 構文 | SyntaxError (括弧未閉じ、不正文字等) | `error.parenOpen`, `error.syntaxInvalid` |
| 名前 | NameError (未定義変数) | `error.nameNotDefined` |
| 型 | TypeError (型不一致、引数不一致) | `error.typeConcat`, `error.argCount` |
| インデント | IndentationError | `error.indentUnexpected` |
| 範囲 | IndexError, KeyError | `error.indexRange`, `error.keyNotFound` |
| 数値 | ZeroDivisionError, ValueError | `error.zeroDivision`, `error.valueInvalid` |
| 属性 | AttributeError | `error.attributeNone` |

## セキュリティアーキテクチャ

### サンドボックスモデル

```mermaid
graph TB
    subgraph BrowserSandbox["ブラウザサンドボックス"]
        subgraph WASMSandbox["WASM サンドボックス"]
            PyodideExec["Pyodide<br/>Python実行"]
        end
        subgraph JSContext["JS コンテキスト"]
            AppJS["アプリケーション"]
            LS2["localStorage"]
        end
    end
    subgraph External["外部アクセス"]
        FS["ファイルシステム"]
        Network["ネットワーク"]
        OSApi["OS API"]
    end

    PyodideExec -.->|アクセス不可| FS
    PyodideExec -.->|アクセス不可| Network
    PyodideExec -.->|アクセス不可| OSApi
    AppJS --> LS2

    style FS fill:#ff9999
    style Network fill:#ff9999
    style OSApi fill:#ff9999
    style PyodideExec fill:#99ff99
```

### データ保護

| 対象 | 保護方式 | 備考 |
|------|---------|------|
| ユーザーコード | localStorageにのみ保存 | サーバーに送信しない |
| 共有URL | Base64エンコード（暗号化ではない） | ユーザー操作必須 |
| Python実行 | WASM サンドボックス | ブラウザ外へのアクセス不可 |
| プライバシー | データ収集なし | プライバシーポリシーに明記 |

### 入力検証

- **Pythonコード**: Pyodideサンドボックス内で実行、ブラウザ外へのアクセスは不可
- **URL共有パラメータ**: Base64デコード失敗時はサイレントに無視
- **言語選択**: i18nextがサポート言語リストで検証

## パフォーマンス要件

### 初回ロード

| リソース | サイズ(概算) | キャッシュ戦略 |
|---------|-------------|-------------|
| Pyodide WASM + stdlib | ~50MB | ブラウザキャッシュ（変更頻度: 低） |
| bundle.js | ~150KB | ブラウザキャッシュ（ビルド毎に更新） |
| 翻訳JSON | ~5KB/言語 | ブラウザキャッシュ |
| style.css | ~5KB | ブラウザキャッシュ |

### Pyodide ロードシーケンス

```mermaid
sequenceDiagram
    participant Browser as ブラウザ
    participant Server2 as 静的サーバー
    participant PyodideWASM as Pyodide WASM

    Browser->>Server2: bundle.js (150KB)
    Browser->>Server2: translation.json (5KB)
    Note over Browser: UI表示完了（即座に操作可能）

    Browser->>Server2: pyodide.js + .wasm (~50MB)
    Note over Browser: "Pythonの準備中..." アニメーション表示
    Server2-->>Browser: Pyodide ロード完了
    Browser->>PyodideWASM: 初期化
    PyodideWASM-->>Browser: 準備完了
    Note over Browser: "実行" ボタン有効化
```

## スケーラビリティ設計

### 現在の設計が有効な範囲

```mermaid
quadrantChart
    title スケーラビリティ評価
    x-axis "低い同時利用" --> "高い同時利用"
    y-axis "低い機能要求" --> "高い機能要求"
    quadrant-1 "将来検討が必要"
    quadrant-2 "現在の設計で対応可能"
    quadrant-3 "現在の設計で十分"
    quadrant-4 "CDN配信で対応可能"
    "現在の状態": [0.3, 0.35]
    "CDN導入後": [0.8, 0.35]
    "ユーザーアカウント追加時": [0.5, 0.75]
    "コラボ編集追加時": [0.8, 0.9]
```

- **水平スケーリング**: 静的ファイル配信のためCDNで対応可能
- **計算負荷**: クライアントサイド実行のためサーバー負荷なし
- **データ増加**: localStorageの5MB制限内で運用（コード保存のみ）
- **言語追加**: `locales/` にディレクトリ追加するだけで拡張可能

## デプロイメント

### 現在の構成

```mermaid
flowchart TD
    Dev["開発者"] -->|git push| Repo["Git リポジトリ"]
    Dev -->|npm run build| BuildProc["ビルド"]
    BuildProc --> Bundle2["bundle.js"]
    BuildProc --> LP2["ランディングページ"]

    subgraph Production["本番環境"]
        ServerProd["Node.js<br/>server.js :3000"]
        Static2["静的ファイル群"]
    end

    Bundle2 --> Static2
    LP2 --> Static2
    ServerProd --> Static2

    User2["エンドユーザー"] -->|HTTPS| ServerProd
```

### ビルドコマンド

```bash
npm install              # 依存パッケージインストール
npm run build            # src/ → app/dist/bundle.js
npm run build:lp         # テンプレート → 49言語のLP/プライバシーページ
npm run validate:i18n    # 翻訳ファイルの構造検証
npm run screenshots      # LP用スクリーンショット生成 (Playwright)
```

## SEO 構成

```mermaid
graph TD
    subgraph LPPages["ランディングページ (SEO対象)"]
        LP_JA2["/index.html (ja)"]
        LP_EN2["/en/index.html"]
        LP_ES["/es/index.html"]
        LP_XX2["/xx/index.html"]
    end

    subgraph AppNoindex["アプリ (noindex)"]
        APP2["/app/index.html"]
    end

    subgraph SEOMeta["SEOメタデータ"]
        Hreflang["hreflang リンク<br/>49言語相互参照"]
        JSONLD["JSON-LD<br/>WebApplication スキーマ"]
        OG["Open Graph<br/>タイトル・説明・画像"]
        Sitemap2["sitemap.xml"]
        Robots["robots.txt"]
    end

    LP_JA2 --- Hreflang
    LP_JA2 --- JSONLD
    LP_JA2 --- OG
    Sitemap2 --> LP_JA2
    Robots -->|Allow| LP_JA2
    Robots -->|Disallow| APP2

    style APP2 fill:#ff9999
    style LP_JA2 fill:#99ff99
```

## テスト戦略

### 現在のテスト体制

| テスト種別 | ツール | 対象 | 状態 |
|-----------|-------|------|------|
| i18n検証 | validate-i18n.js | 翻訳JSONの構造・キー一貫性 | 実装済み |
| スクリーンショット | Playwright | LP表示確認 | 実装済み |
| ユニットテスト | 未定 | ビジネスロジック | 未実装 |
| E2Eテスト | Playwright (候補) | コード実行フロー | 未実装 |

### 推奨テストピラミッド

```mermaid
graph TB
    E2E["E2E テスト<br/>コード実行・共有フロー"]
    INT["統合テスト<br/>エラー翻訳・i18n連携"]
    UNIT["ユニットテスト<br/>errors.js, storage.js"]

    E2E --- INT
    INT --- UNIT

    style UNIT fill:#99ff99
    style INT fill:#fff3cd
    style E2E fill:#f8d7da
```

## 技術的制約

### 環境要件

| 要件 | 値 | 備考 |
|------|---|------|
| ブラウザ | WebAssembly + ES2020対応 | Chrome 80+, Firefox 79+, Safari 14.1+, Edge 80+ |
| ネットワーク | 初回ロード時に必要 | Pyodide ~50MBのダウンロード |
| ストレージ | localStorage 5MB以内 | コード保存のみ、十分な容量 |
| サーバー | 静的ファイル配信可能な任意のHTTPサーバー | Node.js, Nginx, CDN等 |

### パフォーマンス制約

- Pyodide初回ロード: ネットワーク速度に依存（50MB）
- Python実行速度: ネイティブ比で約10-100倍遅い（WASMオーバーヘッド）
- メモリ: Pyodideが数百MBのメモリを使用（モバイルでは制約あり）

## 依存関係管理

| ライブラリ | 用途 | バージョン管理方針 | 更新頻度 |
|-----------|------|-------------------|---------|
| codemirror | エディタ | `^6.0.2` (マイナー自動) | 中 |
| @codemirror/lang-python | Python構文 | `^6.2.1` (マイナー自動) | 低 |
| @codemirror/view | エディタ描画 | `^6.40.0` (マイナー自動) | 中 |
| @codemirror/state | エディタ状態 | `^6.6.0` (マイナー自動) | 低 |
| i18next | 国際化 | `^26.0.1` (マイナー自動) | 中 |
| i18next-browser-languagedetector | 言語検出 | `^8.2.1` (マイナー自動) | 低 |
| i18next-http-backend | 翻訳ロード | `^3.0.2` (マイナー自動) | 低 |
| esbuild | バンドラー | `^0.27.4` (マイナー自動) | 高 |
| playwright | テスト | `^1.58.2` (devDependency) | 高 |
| Pyodide | Python WASM | vendorディレクトリに固定 | 低（年次） |

## 設計判断の根拠

| 判断 | 選択 | 根拠 |
|------|------|------|
| Python実行方式 | クライアントサイド (Pyodide) | サーバースケーリング不要、プライバシー保護、オフライン動作可能 |
| フレームワーク | なし (Vanilla JS) | アプリ規模が小さく、フレームワークのオーバーヘッドが不要 |
| 状態管理 | localStorage直接 | 単一値の保存のみ、状態管理ライブラリ不要 |
| バンドラー | esbuild | 高速、設定最小限、ESM出力対応 |
| 型システム | なし (JavaScript) | モジュール数が少なく、TypeScriptの導入コストが見合わない |
| CSS | Vanilla CSS | コンポーネント数が少なく、CSSフレームワーク不要 |
| テンプレート | 独自 (`{{var}}`) | LP生成のみ、テンプレートエンジン導入不要 |
| ユーザー認証 | なし | 教育用途、プライバシー重視、複雑さ回避 |
| データベース | なし | サーバーサイドのデータ保存が不要 |
