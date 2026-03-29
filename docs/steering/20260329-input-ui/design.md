# input() UI改善 - 設計書

## がいよう

`input("ねんれいをすうじでにゅうりょくしてください: ")` のプロンプトもじれつを
`prompt()` ダイアログにそのまま表示する。

## げんじょうのもんだい

`runner.js` で `setStdin` を使っているが、`stdin` コールバックには
Pythonの `input()` に渡されたプロンプトもじれつが来ない。
そのためこていの「入力してください:」が表示される。

## かいけつさく

Pythonの `builtins.input` をJSの `prompt()` を呼ぶ関数で上書きする。
これにより、Pythonの `input()` に渡されたもじれつがそのまま `prompt()` に表示される。

## へんこうたいしょうファイル

| ファイル | へんこうないよう |
|---------|----------------|
| `src/runner.js` | `setStdin` をやめて、`builtins.input` を上書きするPythonコードをじっこう |
| `dist/bundle.js` | 再ビルド |

## じっそう

### runner.js

`runCode` の中で、ユーザーコードを実行するまえに以下のPythonコードを実行する:

```python
import builtins
from js import prompt as _js_prompt

def _custom_input(p=""):
    result = _js_prompt(p)
    if result is None:
        raise EOFError()
    return result

builtins.input = _custom_input
```

- `prompt()` にPythonの `input()` のもじれつがそのまま渡る
- ユーザーが「キャンセル」をおしたら `EOFError` を出す（Pythonの `input()` と同じ動作）
- `setStdin` は削除する（不要になるため）
