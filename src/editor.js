import { basicSetup } from "codemirror";
import { EditorView } from "@codemirror/view";
import { EditorState, StateEffect, StateField } from "@codemirror/state";
import { Decoration } from "@codemirror/view";
import { python } from "@codemirror/lang-python";
import { loadCode, saveCode } from "./storage.js";

const setErrorLine = StateEffect.define();
const clearErrorLine = StateEffect.define();

const errorLineDeco = Decoration.line({ class: "cm-error-line" });

const selectionTheme = EditorView.theme({
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
    backgroundColor: "#a88cd8 !important"
  }
});

const errorLineField = StateField.define({
  create() { return Decoration.none; },
  update(decos, tr) {
    for (const e of tr.effects) {
      if (e.is(setErrorLine)) {
        const lineCount = tr.state.doc.lines;
        const lineNum = Math.min(e.value, lineCount);
        const line = tr.state.doc.line(lineNum);
        return Decoration.set([errorLineDeco.range(line.from)]);
      }
      if (e.is(clearErrorLine)) {
        return Decoration.none;
      }
    }
    return decos;
  },
  provide: f => EditorView.decorations.from(f),
});

export function createEditor(parent) {
  const state = EditorState.create({
    doc: loadCode(),
    extensions: [
      basicSetup,
      python(),
      selectionTheme,
      errorLineField,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          saveCode(update.state.doc.toString());
        }
      }),
    ],
  });

  return new EditorView({ state, parent });
}

export function highlightErrorLine(view, lineNumber) {
  view.dispatch({ effects: setErrorLine.of(lineNumber) });
}

export function clearErrorHighlight(view) {
  view.dispatch({ effects: clearErrorLine.of(null) });
}
