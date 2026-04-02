import { t } from "./i18n.js";

const ERROR_MESSAGES = [
  // SyntaxError: ぐたいてきなパターンを先に
  { type: "SyntaxError", pattern: /'\(' was never closed/, key: "error.parenOpen" },
  { type: "SyntaxError", pattern: /'\[' was never closed/, key: "error.bracketOpen" },
  { type: "SyntaxError", pattern: /'\{' was never closed/, key: "error.braceOpen" },
  { type: "SyntaxError", pattern: /unexpected EOF while parsing/, key: "error.eofParsing" },
  { type: "SyntaxError", pattern: /unterminated string literal/, key: "error.unterminatedString" },
  { type: "SyntaxError", pattern: /EOL while scanning string literal/, key: "error.eolString" },
  { type: "SyntaxError", pattern: /invalid character.*\(U\+FF/, key: "error.fullwidthChar" },
  { type: "SyntaxError", pattern: /invalid character/, key: "error.invalidChar" },
  { type: "SyntaxError", pattern: /expected ':'/, key: "error.expectedColon" },
  { type: "SyntaxError", pattern: /unmatched '\)'/, key: "error.unmatchedParen" },
  { type: "SyntaxError", pattern: /invalid syntax/, key: "error.invalidSyntax" },

  // NameError
  { type: "NameError", pattern: /name '(.+)' is not defined/, key: "error.nameNotDefined", captures: ["name"] },

  // TypeError
  { type: "TypeError", pattern: /can only concatenate str/, key: "error.strConcat" },
  { type: "TypeError", pattern: /unsupported operand type/, key: "error.unsupportedOperand" },
  { type: "TypeError", pattern: /(.+)\(\) takes (\d+) positional argument.* (\d+) .* given/, key: "error.takesArgs", captures: ["fn", "expected", "given"] },
  { type: "TypeError", pattern: /missing (\d+) required positional argument/, key: "error.missingArgs", captures: ["count"] },

  // IndentationError
  { type: "IndentationError", pattern: /unexpected indent/, key: "error.unexpectedIndent" },
  { type: "IndentationError", pattern: /expected an indented block/, key: "error.expectedIndent" },

  // IndexError
  { type: "IndexError", pattern: /list index out of range/, key: "error.indexOutOfRange" },

  // ZeroDivisionError
  { type: "ZeroDivisionError", pattern: /division by zero/, key: "error.divisionByZero" },

  // ValueError
  { type: "ValueError", pattern: /invalid literal for int\(\) with base \d+: '(.+)'/, key: "error.invalidInt", captures: ["value"] },
  { type: "ValueError", pattern: /could not convert string to float: '(.+)'/, key: "error.invalidFloat", captures: ["value"] },

  // AttributeError
  { type: "AttributeError", pattern: /'(.+)' .* has no attribute '(.+)'/, key: "error.noAttribute", captures: ["type", "attr"] },

  // KeyError
  { type: "KeyError", pattern: /.+/, key: "error.keyError" },
];

export function parseError(errorText) {
  const lines = errorText.trim().split("\n");

  let lineNumber = null;
  for (const line of lines) {
    const lineMatch = line.match(/line (\d+)/);
    if (lineMatch) {
      lineNumber = parseInt(lineMatch[1], 10);
    }
  }

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
    return { japanese: t("app.errorUnknown"), original: errorText, lineNumber: null };
  }

  const { lineNumber, errorType, errorMessage, original } = parsed;

  for (const entry of ERROR_MESSAGES) {
    if (entry.type === errorType) {
      const match = errorMessage.match(entry.pattern);
      if (match) {
        const params = {};
        if (entry.captures) {
          entry.captures.forEach((name, i) => {
            params[name] = match[i + 1];
          });
        }
        return { japanese: t(entry.key, params), original, lineNumber };
      }
    }
  }

  return { japanese: t("app.errorUnknown"), original, lineNumber };
}
