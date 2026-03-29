# 問題定義: エラーメッセージの日本語化

## 背景

- ユーザーは小学生
- 英語がわからないため、Pythonのエラーメッセージが理解できない

## 現状の問題

Pythonのエラーメッセージはすべて英語で表示される。例:

```
SyntaxError: invalid syntax
NameError: name 'x' is not defined
TypeError: unsupported operand type(s) for +: 'int' and 'str'
IndentationError: unexpected indent
```

小学生にとって:
1. 英語が読めない
2. プログラミング用語がわからない
3. 何を直せばいいかわからない

## ゴール

エラーメッセージを子供向けの日本語に変換し、何が間違っていて何を直せばいいかを伝える。

## 対象とすべきエラー（よくあるもの）

| エラー | 発生場面 |
|--------|----------|
| `SyntaxError` | カッコの閉じ忘れ、コロン忘れ、全角文字の混入など |
| `NameError` | 変数名のタイプミス、未定義の変数 |
| `TypeError` | 型の不一致（数字と文字の足し算など） |
| `IndentationError` | インデント（字下げ）の間違い |
| `IndexError` | リストの範囲外アクセス |
| `ZeroDivisionError` | ゼロで割った |
| `ValueError` | `int("abc")` のような変換エラー |
| `AttributeError` | 存在しないメソッド呼び出し |
| `KeyError` | 辞書に存在しないキー |

## 決定事項

- 翻訳方針: シンプルな日本語訳（「書き方がまちがっているよ」）
- 行番号: 「○行目」と日本語で表示する
- 元の英語エラー: 小さく併記する（先生が確認できるように）
