import { createEditor, highlightErrorLine, clearErrorHighlight } from "./editor.js";
import { loadPyodide, runCode } from "./runner.js";
import { translateError } from "./errors.js";
import { detectSharedCode, setSharedCode, encodeShareURL, getShareIntentURLs } from "./storage.js";
import { samples } from "./samples.js";

// 共有URL検出（エディタ生成前に実行）
const shared = detectSharedCode();
if (shared !== null) {
  if (confirm("おともだちのコードをひらく？")) {
    setSharedCode(shared);
  }
}

const editorContainer = document.getElementById("editor");
const outputEl = document.getElementById("output");
const runBtn = document.getElementById("run-btn");
const shareBtn = document.getElementById("share-btn");
const statusEl = document.getElementById("status");

const editor = createEditor(editorContainer);

function setStatus(msg) {
  if (msg) {
    statusEl.textContent = msg;
    statusEl.hidden = false;
    runBtn.disabled = true;
  } else {
    statusEl.hidden = true;
    runBtn.disabled = false;
  }
}

function appendOutput(text, type = "stdout") {
  const span = document.createElement("span");
  span.textContent = text + "\n";
  if (type === "stderr") span.className = "error";
  outputEl.appendChild(span);
}

function appendError(errorText) {
  const { japanese, original, lineNumber } = translateError(errorText);

  const wrapper = document.createElement("div");
  wrapper.className = "error-block";

  const line = lineNumber ? `${lineNumber}ぎょうめをみてね: ` : "";
  const msg = document.createElement("div");
  msg.className = "error-message";
  msg.textContent = `${line}${japanese}`;
  wrapper.appendChild(msg);

  const details = document.createElement("details");
  const summary = document.createElement("summary");
  summary.textContent = "くわしくみる";
  details.appendChild(summary);
  const pre = document.createElement("pre");
  pre.className = "error-original";
  pre.textContent = original;
  details.appendChild(pre);
  wrapper.appendChild(details);

  outputEl.appendChild(wrapper);

  if (lineNumber) {
    highlightErrorLine(editor, lineNumber);
  }
}

loadPyodide(setStatus);

// ブックマーク促進バナー（初回のみ表示）
const BOOKMARK_KEY = "bookmark-banner-dismissed";
if (!localStorage.getItem(BOOKMARK_KEY)) {
  const banner = document.getElementById("bookmark-banner");
  banner.hidden = false;
  document.getElementById("bookmark-close").addEventListener("click", () => {
    banner.hidden = true;
    localStorage.setItem(BOOKMARK_KEY, "1");
  });
}

runBtn.addEventListener("click", async () => {
  outputEl.textContent = "";
  clearErrorHighlight(editor);
  const code = editor.state.doc.toString();
  runBtn.disabled = true;
  runBtn.textContent = "じっこうちゅう...";
  try {
    await runCode(code, (t) => appendOutput(t), (t) => appendOutput(t, "stderr"));
  } catch (e) {
    console.log("--- raw error ---");
    console.log("e.message:", JSON.stringify(e.message));
    console.log("e.type:", e.type);
    console.log("e:", e);
    appendError(e.message);
  } finally {
    runBtn.disabled = false;
    runBtn.textContent = "じっこう";
  }
});

shareBtn.addEventListener("click", async () => {
  const code = editor.state.doc.toString();
  const url = encodeShareURL(code);
  outputEl.textContent = "";
  try {
    await navigator.clipboard.writeText(url);
    appendOutput("URLをコピーしたよ！おともだちにおしえてあげよう");
  } catch {
    appendOutput("このURLをコピーしてね:");
    appendOutput(url);
  }

  const intents = getShareIntentURLs(url);
  const div = document.createElement("div");
  div.className = "share-buttons";
  div.innerHTML = `
    SNSでもシェアできるよ
    <div class="share-links">
      <a class="share-btn share-line" href="${intents.line}" target="_blank" rel="noopener">LINE</a>
      <a class="share-btn share-x" href="${intents.x}" target="_blank" rel="noopener">X</a>
      <a class="share-btn share-fb" href="${intents.facebook}" target="_blank" rel="noopener">Facebook</a>
    </div>
  `;
  outputEl.appendChild(div);
});

// おてほんサンプル
const samplesSelect = document.getElementById("samples");
samples.forEach((s, i) => {
  const opt = document.createElement("option");
  opt.value = i;
  opt.textContent = s.title;
  samplesSelect.appendChild(opt);
});

samplesSelect.addEventListener("change", () => {
  const idx = samplesSelect.value;
  if (idx === "") return;
  const sample = samples[idx];
  if (confirm("いまのコードがきえるよ。いい？")) {
    editor.dispatch({
      changes: { from: 0, to: editor.state.doc.length, insert: sample.code },
    });
  }
  samplesSelect.value = "";
});
