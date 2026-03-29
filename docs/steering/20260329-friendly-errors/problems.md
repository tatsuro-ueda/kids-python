# 問題定義: エラーメッセージがわかりにくい（第2イテレーション）

## クレーム内容

前回の日本語化で翻訳はされたが、小学生にとってまだわかりにくい。

現状の例:
- 「カッコやクォーテーションがとじられていないよ」 → 「クォーテーション」って何？
- 「ぜんかくもじがまざっているよ。はんかくでにゅうりょくしてね」 → 「ぜんかく」「はんかく」がわからない
- 「かんすうにわたすものの かずがまちがっているよ」 → 抽象的すぎる

## ゴール

「ここにとじかっこがないよ」のように、**何がどこで起きているか**を具体的に、
小学生が読んでもすぐ直せるレベルのメッセージにする。

## 改善方針

1. **カタカナ専門用語を避ける**: 「クォーテーション」→「`'`や`"`のしるし」
2. **具体的に指す**: 「書き方がまちがっている」→「ここに `:` がないよ」「ここにとじカッコ `)` がないよ」
3. **直し方をセットで伝える**: 何が悪いかだけでなく、どうすれば直るかを書く
4. **行番号を目立たせる**: 「3ぎょうめをみてね」を先頭に

## 改善後のメッセージ一覧

| エラー種別 | パターン | 改善後メッセージ |
|-----------|---------|----------------|
| `SyntaxError` | `unexpected EOF while parsing` | とじカッコ `)` や `]` がたりないよ。ひらいたカッコをとじてね |
| `SyntaxError` | `EOL while scanning string literal` | `'` や `"` のしるしがとじられていないよ。もじのおわりにもつけてね |
| `SyntaxError` | `invalid character.*\\(U\+FF` | にほんごモードのもじがまざっているよ。キーボードをえいすうにきりかえてね |
| `SyntaxError` | `expected ':'` | `:` がないよ。`if` や `for` のおわりには `:` をつけてね |
| `SyntaxError` | `unmatched '\\)'` | とじカッコ `)` がおおいよ。カッコのかずをたしかめてね |
| `SyntaxError` | `invalid syntax` | かきかたがまちがっているよ。スペルやきごうをたしかめてね |
| `NameError` | `name '(.+)' is not defined` | `$1` ってなに？ まだつくってないか、なまえをまちがえているよ |
| `TypeError` | `can only concatenate str` | もじとすうじはそのままくっつけられないよ。`str()` でかこんでみてね |
| `TypeError` | `unsupported operand type` | もじとすうじをまぜてけいさんしようとしているよ。`int()` や `str()` でそろえてね |
| `TypeError` | `(.+)\(\) takes (\d+) positional argument.* (\d+) .* given` | `$1()` にいれるものは $2こなのに、$3こいれているよ |
| `TypeError` | `missing (\d+) required positional argument` | たりないよ！ あと $1こ いれてね |
| `IndentationError` | `unexpected indent` | スペースがおおいよ。まえのぎょうとそろえてね |
| `IndentationError` | `expected an indented block` | スペースがたりないよ。`if` や `for` のつぎのぎょうは スペース4つ いれてね |
| `IndexError` | `list index out of range` | リストのばんごうがおおきすぎるよ。`len()` でながさをたしかめてね |
| `ZeroDivisionError` | `division by zero` | 0でわることはできないよ。わるすうじをたしかめてね |
| `ValueError` | `invalid literal for int` | `int()` のなかみがすうじじゃないよ。すうじだけいれてね |
| `ValueError` | `could not convert string to float` | `float()` のなかみがすうじじゃないよ。すうじだけいれてね |
| `AttributeError` | `'(.+)' .* has no attribute '(.+)'` | `$1` に `$2` っていうきのうはないよ。なまえをたしかめてね |
| `KeyError` | `.+` | じしょにそのなまえはないよ。`print()` でなかみをたしかめてね |

## 出力フォーマット（変更）

```
3ぎょうめをみてね: とじカッコ ) がたりないよ。ひらいたカッコをとじてね

（もとのエラー: SyntaxError: unexpected EOF while parsing）
```

- 行番号がない場合は「ここをみてね:」にする
- 元のエラーは薄い文字で常に表示（details折りたたみ廃止、小さく添えるだけ）
