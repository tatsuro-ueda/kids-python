# Kids Python - Online Python Editor

## プロジェクト概要
子ども向けオンラインPythonエディタ。50言語以上の多言語対応。

## 必須: ドキュメント参照
実装前に必ず `docs/` ディレクトリ内のドキュメントを読むこと:
- `docs/architecture.md` - アーキテクチャ設計
- `docs/functional-design.md` - 機能設計
- `docs/customer-problems.md` - 顧客課題
- `docs/design-problems.md` - 設計課題
- `docs/i18n-problems.md` - 国際化の課題
- `docs/marketing-problems.md` - マーケティング課題

## コーディング規約
- 過去のコミット履歴(`git log`)を参考にスタイルを合わせること
- 多言語対応を考慮すること（`locales/` ディレクトリ参照）
- テンプレートは `*.html.tpl` を使用

## 技術スタック
- Node.js / Express (server.js)
- バニラHTML/CSS/JS (フロントエンド)
- i18n: localesディレクトリのJSONファイル
