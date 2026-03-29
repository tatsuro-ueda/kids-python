let pyodide = null;

const INPUT_PATCH = `
import builtins
from js import prompt as _js_prompt

def _custom_input(p=""):
    result = _js_prompt(p)
    if result is None:
        raise EOFError()
    return result

builtins.input = _custom_input
`;

export async function loadPyodide(onStatus) {
  onStatus("Python環境を読み込み中...");
  const mod = await import("/vendor/pyodide/pyodide.mjs");
  pyodide = await mod.loadPyodide({
    indexURL: "/vendor/pyodide/",
  });
  await pyodide.runPythonAsync(INPUT_PATCH);
  onStatus(null);
}

export async function runCode(code, onStdout, onStderr) {
  if (!pyodide) throw new Error("Pyodide is not loaded");

  pyodide.setStdout({ batched: onStdout });
  pyodide.setStderr({ batched: onStderr });

  await pyodide.runPythonAsync(code);
}
