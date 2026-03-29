const ERROR_MESSAGES = [
  // SyntaxError: ぐたいてきなパターンを先に
  { type: "SyntaxError", pattern: /'\(' was never closed/, message: "カッコ `(` がとじられていないよ。`)` をつけてね" },
  { type: "SyntaxError", pattern: /'\[' was never closed/, message: "カッコ `[` がとじられていないよ。`]` をつけてね" },
  { type: "SyntaxError", pattern: /'\{' was never closed/, message: "カッコ `{` がとじられていないよ。`}` をつけてね" },
  { type: "SyntaxError", pattern: /unexpected EOF while parsing/, message: "とじカッコ `)` や `]` がたりないよ。ひらいたカッコをとじてね" },
  { type: "SyntaxError", pattern: /unterminated string literal/, message: "`'` や `\"` のしるしがとじられていないよ。もじのおわりにもつけてね" },
  { type: "SyntaxError", pattern: /EOL while scanning string literal/, message: "`'` や `\"` のしるしがとじられていないよ。もじのおわりにもつけてね" },
  { type: "SyntaxError", pattern: /invalid character.*\(U\+FF/, message: "にほんごモードのもじがまざっているよ。キーボードをえいすうにきりかえてね" },
  { type: "SyntaxError", pattern: /invalid character/, message: "つかえないもじがはいっているよ。けしてかきなおしてね" },
  { type: "SyntaxError", pattern: /expected ':'/, message: "`:` がないよ。`if` や `for` のおわりには `:` をつけてね" },
  { type: "SyntaxError", pattern: /unmatched '\)'/, message: "とじカッコ `)` がおおいよ。カッコのかずをたしかめてね" },
  { type: "SyntaxError", pattern: /invalid syntax/, message: "かきかたがまちがっているよ。スペルやきごうをたしかめてね" },

  // NameError
  { type: "NameError", pattern: /name '(.+)' is not defined/, message: "`$1` ってなに？ まだつくってないか、なまえをまちがえているよ" },

  // TypeError
  { type: "TypeError", pattern: /can only concatenate str/, message: "もじとすうじはそのままくっつけられないよ。`str()` でかこんでみてね" },
  { type: "TypeError", pattern: /unsupported operand type/, message: "もじとすうじをまぜてけいさんしようとしているよ。`int()` や `str()` でそろえてね" },
  { type: "TypeError", pattern: /(.+)\(\) takes (\d+) positional argument.* (\d+) .* given/, message: "`$1()` にいれるものは $2こなのに、$3こいれているよ" },
  { type: "TypeError", pattern: /missing (\d+) required positional argument/, message: "たりないよ！ あと $1こ いれてね" },

  // IndentationError
  { type: "IndentationError", pattern: /unexpected indent/, message: "スペースがおおいよ。まえのぎょうとそろえてね" },
  { type: "IndentationError", pattern: /expected an indented block/, message: "スペースがたりないよ。`if` や `for` のつぎのぎょうは スペース4つ いれてね" },

  // IndexError
  { type: "IndexError", pattern: /list index out of range/, message: "リストのばんごうがおおきすぎるよ。`len()` でながさをたしかめてね" },

  // ZeroDivisionError
  { type: "ZeroDivisionError", pattern: /division by zero/, message: "0でわることはできないよ。わるすうじをたしかめてね" },

  // ValueError
  { type: "ValueError", pattern: /invalid literal for int/, message: "`int()` のなかみがすうじじゃないよ。すうじだけいれてね" },
  { type: "ValueError", pattern: /could not convert string to float/, message: "`float()` のなかみがすうじじゃないよ。すうじだけいれてね" },

  // AttributeError
  { type: "AttributeError", pattern: /'(.+)' .* has no attribute '(.+)'/, message: "`$1` に `$2` っていうきのうはないよ。なまえをたしかめてね" },

  // KeyError
  { type: "KeyError", pattern: /.+/, message: "じしょにそのなまえはないよ。`print()` でなかみをたしかめてね" },
];

export function parseError(errorText) {
  const lines = errorText.trim().split("\n");

  // 行番号を抽出: "line 3" のようなパターン
  let lineNumber = null;
  for (const line of lines) {
    const lineMatch = line.match(/line (\d+)/);
    if (lineMatch) {
      lineNumber = parseInt(lineMatch[1], 10);
    }
  }

  // 最終行からエラー種別とメッセージを抽出
  const lastLine = lines[lines.length - 1];
  const errorMatch = lastLine.match(/^(\w+Error):\s*(.+)$/);
  if (!errorMatch) {
    return null;
  }

  const errorType = errorMatch[1];
  const errorMessage = errorMatch[2];

  return { lineNumber, errorType, errorMessage, original: lastLine };
}

export function translateError(errorText) {
  const parsed = parseError(errorText);
  if (!parsed) {
    return { japanese: "エラーがおきたよ", original: errorText, lineNumber: null };
  }

  const { lineNumber, errorType, errorMessage, original } = parsed;

  for (const entry of ERROR_MESSAGES) {
    if (entry.type === errorType) {
      const match = errorMessage.match(entry.pattern);
      if (match) {
        // $1, $2 等をキャプチャグループで置換
        let japanese = entry.message;
        for (let i = 1; i < match.length; i++) {
          japanese = japanese.replace(`$${i}`, match[i]);
        }
        return { japanese, original, lineNumber };
      }
    }
  }

  // 未知のエラー
  return { japanese: "エラーがおきたよ", original, lineNumber };
}
