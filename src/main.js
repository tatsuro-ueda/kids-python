import { initI18n, t, setLocale, getLocale, LANGUAGES } from "./i18n.js";
import { createEditor, highlightErrorLine, clearErrorHighlight } from "./editor.js";
import { loadPyodide, runCode } from "./runner.js";
import { translateError } from "./errors.js";
import { detectSharedCode, setSharedCode, encodeShareURL, getShareIntentURLs, resetCode } from "./storage.js";
import { getSamples, getDefaultCode } from "./samples.js";

async function main() {
  // 1. i18n初期化（言語検出 → JSONロード → DOM翻訳）
  await initI18n();

  // 2. 共有URL検出（t()を使うため initI18n() の後）
  const shared = detectSharedCode();
  if (shared !== null) {
    if (confirm(t("app.confirmShared"))) {
      setSharedCode(shared);
    }
  }

  const editorContainer = document.getElementById("editor");
  const outputEl = document.getElementById("output");
  const runBtn = document.getElementById("run-btn");
  const shareBtn = document.getElementById("share-btn");
  const statusEl = document.getElementById("status");

  const editor = createEditor(editorContainer);

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setStatus(msg) {
    if (msg) {
      statusEl.innerHTML = msg.split("").map((ch, i) =>
        `<span style="--i:${i}">${ch}</span>`
      ).join("");
      statusEl.classList.add("loading");
      statusEl.hidden = false;
      runBtn.disabled = true;
    } else {
      runBtn.disabled = false;
      if (reducedMotion) {
        statusEl.hidden = true;
        statusEl.classList.remove("loading", "fade-out");
      } else {
        statusEl.classList.remove("loading");
        statusEl.classList.add("fade-out");
        statusEl.addEventListener("animationend", () => {
          statusEl.hidden = true;
          statusEl.classList.remove("fade-out");
        }, { once: true });
      }
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

    const line = lineNumber ? t("app.errorLine", { line: lineNumber }) : "";
    const msg = document.createElement("div");
    msg.className = "error-message";
    msg.textContent = `${line}${japanese}`;
    wrapper.appendChild(msg);

    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = t("app.errorDetails");
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
    runBtn.textContent = t("app.running");
    try {
      await runCode(code, (text) => appendOutput(text), (text) => appendOutput(text, "stderr"));
    } catch (e) {
      console.log("--- raw error ---");
      console.log("e.message:", JSON.stringify(e.message));
      console.log("e.type:", e.type);
      console.log("e:", e);
      appendError(e.message);
    } finally {
      runBtn.disabled = false;
      runBtn.textContent = t("app.run");
    }
  });

  shareBtn.addEventListener("click", async () => {
    const code = editor.state.doc.toString();
    const url = encodeShareURL(code);
    outputEl.textContent = "";
    try {
      await navigator.clipboard.writeText(url);
      appendOutput(t("app.shareCopied"));
    } catch {
      appendOutput(t("app.shareFallback"));
      appendOutput(url);
    }

    const intents = getShareIntentURLs(url);
    const div = document.createElement("div");
    div.className = "share-buttons";
    div.innerHTML = `
      ${t("app.shareSns")}
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
  let currentSamples = [];

  async function refreshSamples() {
    currentSamples = await getSamples();
    while (samplesSelect.options.length > 1) samplesSelect.remove(1);
    currentSamples.forEach((s, i) => {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = s.title;
      samplesSelect.appendChild(opt);
    });
  }

  samplesSelect.addEventListener("focus", refreshSamples);

  samplesSelect.addEventListener("change", () => {
    const idx = samplesSelect.value;
    if (idx === "") return;
    const sample = currentSamples[idx];
    if (sample && confirm(t("app.confirmReplace"))) {
      editor.dispatch({
        changes: { from: 0, to: editor.state.doc.length, insert: sample.code },
      });
    }
    samplesSelect.value = "";
  });

  // 言語セレクタ
  const langBtn = document.getElementById("lang-btn");
  const langList = document.getElementById("lang-list");

  if (langBtn && langList) {
    LANGUAGES.forEach(lang => {
      const li = document.createElement("li");
      li.textContent = lang.name;
      li.dataset.code = lang.code;
      li.addEventListener("click", async () => {
        await setLocale(lang.code);
        const defaultCode = await getDefaultCode();
        resetCode();
        editor.dispatch({
          changes: { from: 0, to: editor.state.doc.length, insert: defaultCode },
        });
        outputEl.textContent = "";
        langList.hidden = true;
      });
      langList.appendChild(li);
    });

    langBtn.addEventListener("click", () => {
      langList.hidden = !langList.hidden;
    });

    document.addEventListener("click", (e) => {
      if (!langBtn.contains(e.target) && !langList.contains(e.target)) {
        langList.hidden = true;
      }
    });
  }
  // Send Issue ボタン
  const issueBtn = document.getElementById("issue-btn");
  if (issueBtn) {
    issueBtn.addEventListener("click", () => {
      const code = editor.state.doc.toString();
      const output = outputEl.textContent;
      const lang = getLocale();
      const body = [
        "## Language",
        lang,
        "",
        "## Code",
        "```python",
        code,
        "```",
        "",
        "## Output",
        "```",
        output,
        "```",
      ].join("\n");
      const url = `https://github.com/tatsuro-ueda/kids-python/issues/new?body=${encodeURIComponent(body)}`;
      window.open(url, "_blank", "noopener");
    });
  }
}

main();
