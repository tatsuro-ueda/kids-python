import { basicSetup } from "codemirror";
import { EditorView } from "@codemirror/view";
import { EditorState, StateEffect, StateField, EditorSelection } from "@codemirror/state";
import { Decoration } from "@codemirror/view";
import { python } from "@codemirror/lang-python";
import { loadCode, saveCode } from "./storage.js";

const setErrorLine = StateEffect.define();
const clearErrorLine = StateEffect.define();

const errorLineDeco = Decoration.line({ class: "cm-error-line" });

const selectionTheme = EditorView.theme({
  "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground": {
    background: "#d7d4f0 !important"
  },
  ".cm-selectionBackground": {
    background: "#d7d4f080 !important"
  }
});

let isPasting = false;

const pasteSelectExtension = [
  EditorView.domEventHandlers({
    paste() { isPasting = true; }
  }),
  EditorView.updateListener.of((update) => {
    if (isPasting && update.docChanged) {
      isPasting = false;
      let from, to;
      update.changes.iterChanges((_fromA, _toA, fromB, toB) => {
        from = fromB;
        to = toB;
      });
      if (from !== undefined && from !== to) {
        update.view.dispatch({
          selection: EditorSelection.range(from, to)
        });
      }
    }
  })
];

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
      pasteSelectExtension,
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
