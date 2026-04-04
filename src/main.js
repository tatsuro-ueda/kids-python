import { initI18n, t, setLocale, getLocale, LANGUAGES } from "./i18n.js";
import { createEditor, highlightErrorLine, clearErrorHighlight } from "./editor.js";
import { loadPyodide, runCode } from "./runner.js";
import { translateError } from "./errors.js";
import {
  migrateIfNeeded, getPages, getActivePage, setActivePage,
  createPage, deletePage, renamePage,
  loadPageCode, savePageCode, loadPageOutput, savePageOutput,
  getMaxPages, detectSharedCode, encodeShareURL, getShareIntentURLs, resetCode,
} from "./storage.js";
import { getSamples, getDefaultCode } from "./samples.js";

async function main() {
  // 1. i18n初期化（言語検出 → JSONロード → DOM翻訳）
  await initI18n();

  // 2. データ移行（旧形式 → ページ形式）
  migrateIfNeeded();

  // 3. 共有URL検出（t()を使うため initI18n() の後）
  const shared = detectSharedCode();
  if (shared !== null) {
    if (confirm(t("app.confirmShared"))) {
      const pages = getPages();
      if (pages.length < getMaxPages()) {
        const name = t("app.sharedPageName") || "きょうゆうされたコード";
        const id = createPage(name, shared);
        setActivePage(id);
      } else {
        // 上限時は現在のページに上書き
        if (confirm(t("app.sampleCurrentPage"))) {
          savePageCode(getActivePage(), shared);
        }
      }
    }
    history.replaceState(null, "", location.pathname);
  }

  const editorContainer = document.getElementById("editor");
  const outputEl = document.getElementById("output");
  const runBtn = document.getElementById("run-btn");
  const shareBtn = document.getElementById("share-btn");
  const saveBtn = document.getElementById("save-btn");
  const statusEl = document.getElementById("status");
  const tabsContainer = document.getElementById("page-tabs");

  const editor = createEditor(editorContainer);

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Undo state ---
  let undoData = null;
  let undoTimer = null;

  function clearUndo() {
    undoData = null;
    if (undoTimer) { clearTimeout(undoTimer); undoTimer = null; }
  }

  // --- Tab bar rendering ---

  function renderTabs() {
    tabsContainer.innerHTML = "";
    const pages = getPages();
    const activeId = getActivePage();

    // Determine compact mode
    tabsContainer.classList.remove("tabs-compact", "tabs-icon");
    if (pages.length >= 13) {
      tabsContainer.classList.add("tabs-icon");
    } else if (pages.length >= 6) {
      tabsContainer.classList.add("tabs-compact");
    }

    pages.forEach((page, index) => {
      const tab = document.createElement("div");
      tab.className = "page-tab" + (page.id === activeId ? " active" : "");
      tab.dataset.id = page.id;

      const nameSpan = document.createElement("span");
      nameSpan.className = "tab-name";
      nameSpan.textContent = page.name;
      tab.appendChild(nameSpan);

      const numSpan = document.createElement("span");
      numSpan.className = "tab-num";
      numSpan.textContent = index + 1;
      tab.appendChild(numSpan);

      if (pages.length >= 13) {
        tab.title = page.name;
      }

      const closeBtn = document.createElement("button");
      closeBtn.className = "tab-close";
      closeBtn.textContent = "×";
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        handleDeletePage(page.id);
      });
      tab.appendChild(closeBtn);

      // Click to switch
      tab.addEventListener("click", () => switchToPage(page.id));

      // Double-click to rename
      tab.addEventListener("dblclick", (e) => {
        e.preventDefault();
        startRename(tab, page.id, nameSpan);
      });

      tabsContainer.appendChild(tab);
    });

    // Add button
    const addBtn = document.createElement("button");
    addBtn.className = "page-tab-add";
    addBtn.textContent = "＋";
    addBtn.addEventListener("click", handleAddPage);
    tabsContainer.appendChild(addBtn);
  }

  function switchToPage(id) {
    const currentId = getActivePage();
    if (id === currentId) return;

    // Save current page
    savePageCode(currentId, editor.state.doc.toString());
    savePageOutput(currentId, outputEl.innerHTML);

    // Switch
    setActivePage(id);
    const code = loadPageCode(id);
    editor.dispatch({
      changes: { from: 0, to: editor.state.doc.length, insert: code },
    });
    outputEl.innerHTML = loadPageOutput(id);
    clearErrorHighlight(editor);
    clearUndo();
    renderTabs();
  }

  function handleAddPage() {
    const pages = getPages();
    if (pages.length >= getMaxPages()) {
      alert(t("app.maxPages", { max: getMaxPages() }));
      return;
    }

    // Save current page first
    const currentId = getActivePage();
    savePageCode(currentId, editor.state.doc.toString());
    savePageOutput(currentId, outputEl.innerHTML);

    const n = pages.length + 1;
    const name = t("app.defaultPageName", { n }) || `ページ${n}`;
    const defaultCode = 'print("Hello, Python!")';
    const id = createPage(name, defaultCode);
    setActivePage(id);

    editor.dispatch({
      changes: { from: 0, to: editor.state.doc.length, insert: defaultCode },
    });
    outputEl.innerHTML = "";
    clearUndo();
    renderTabs();
    checkExportHint();
  }

  function handleDeletePage(id) {
    const pages = getPages();
    if (pages.length <= 1) {
      alert(t("app.deletePageLast") || "さいごの1ページはけせないよ");
      return;
    }
    if (!confirm(t("app.deletePage") || "このページをけす？")) return;

    // Save undo data
    const pageIndex = pages.findIndex(p => p.id === id);
    const pageMeta = pages[pageIndex];
    undoData = {
      meta: pageMeta,
      code: loadPageCode(id),
      output: loadPageOutput(id),
      index: pageIndex,
    };

    deletePage(id);

    // If deleted page was active, switch to neighbor
    if (getActivePage() === id) {
      const remaining = getPages();
      const newActive = remaining[Math.min(pageIndex, remaining.length - 1)];
      setActivePage(newActive.id);
      editor.dispatch({
        changes: { from: 0, to: editor.state.doc.length, insert: loadPageCode(newActive.id) },
      });
      outputEl.innerHTML = loadPageOutput(newActive.id);
      clearErrorHighlight(editor);
    }

    renderTabs();
    showUndoLink();
  }

  function showUndoLink() {
    const undoDiv = document.createElement("div");
    undoDiv.className = "undo-bar";
    undoDiv.innerHTML = `<a href="#" class="undo-link">${t("app.undoDelete") || "もとにもどす"}</a>`;
    outputEl.prepend(undoDiv);

    undoDiv.querySelector(".undo-link").addEventListener("click", (e) => {
      e.preventDefault();
      if (!undoData) return;

      // Restore page
      const pages = getPages();
      const idx = Math.min(undoData.index, pages.length);
      pages.splice(idx, 0, undoData.meta);
      localStorage.setItem("python-editor-pages", JSON.stringify(pages));
      savePageCode(undoData.meta.id, undoData.code);
      savePageOutput(undoData.meta.id, undoData.output);

      switchToPage(undoData.meta.id);
      clearUndo();
    });

    if (undoTimer) clearTimeout(undoTimer);
    undoTimer = setTimeout(() => {
      if (undoDiv.parentNode) undoDiv.remove();
      undoData = null;
    }, 5000);
  }

  function startRename(tabEl, id, nameSpan) {
    const currentName = nameSpan.textContent;
    const input = document.createElement("input");
    input.type = "text";
    input.className = "tab-rename-input";
    input.value = currentName;
    input.maxLength = 20;

    nameSpan.replaceWith(input);
    input.focus();
    input.select();

    function finish() {
      const newName = input.value.trim() || currentName;
      renamePage(id, newName);
      renderTabs();
    }

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); finish(); }
      if (e.key === "Escape") { e.preventDefault(); renderTabs(); }
    });
    input.addEventListener("blur", finish);
  }

  // --- Export hint ---
  const EXPORT_HINT_KEY = "export-hint-dismissed";

  function checkExportHint() {
    if (localStorage.getItem(EXPORT_HINT_KEY)) return;
    const pages = getPages();
    if (pages.length >= 3) {
      showExportHint();
    }
  }

  function showExportHint() {
    if (document.getElementById("export-hint-banner")) return;
    const banner = document.createElement("div");
    banner.id = "export-hint-banner";
    banner.className = "export-hint-banner";
    banner.innerHTML = `
      <p>${t("app.exportHint") || "だいじなコードは「きょうゆう」でURLをのこしておくと、べつのたんまつでもひらけるよ"}</p>
      <button class="export-hint-close">${t("app.bookmarkClose") || "とじる"}</button>
    `;
    outputEl.parentNode.insertBefore(banner, outputEl.nextSibling);
    banner.querySelector(".export-hint-close").addEventListener("click", () => {
      banner.remove();
      localStorage.setItem(EXPORT_HINT_KEY, "1");
    });
  }

  // --- Status helpers ---

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
    appendToTarget(outputEl, text, type);
  }

  function appendError(errorText) {
    appendErrorToTarget(outputEl, errorText);
  }

  // --- Pyodide load ---

  let slowTimer = null;

  function startLoadPyodide() {
    slowTimer = setTimeout(() => {
      statusEl.innerHTML = t("app.loadSlow").split("").map((ch, i) =>
        `<span style="--i:${i}">${ch}</span>`
      ).join("");
      statusEl.classList.add("loading");
    }, 10000);

    loadPyodide(
      (msg) => {
        if (!msg) clearTimeout(slowTimer);
        setStatus(msg);
      },
      () => {
        clearTimeout(slowTimer);
        statusEl.classList.remove("loading", "fade-out");
        statusEl.hidden = false;
        statusEl.innerHTML = "";
        runBtn.disabled = true;

        const msg = document.createElement("span");
        msg.textContent = t("app.loadFailed") + " ";
        statusEl.appendChild(msg);

        const retryBtn = document.createElement("button");
        retryBtn.textContent = t("app.loadRetry");
        retryBtn.className = "retry-btn";
        retryBtn.addEventListener("click", () => startLoadPyodide());
        statusEl.appendChild(retryBtn);
      }
    );
  }

  startLoadPyodide();

  // --- Bookmark banner (unchanged) ---

  const BOOKMARK_KEY = "bookmark-banner-dismissed";
  if (!localStorage.getItem(BOOKMARK_KEY)) {
    const banner = document.getElementById("bookmark-banner");
    banner.hidden = false;
    document.getElementById("bookmark-close").addEventListener("click", () => {
      banner.hidden = true;
      localStorage.setItem(BOOKMARK_KEY, "1");
    });
  }

  // --- Initial tab render ---
  renderTabs();

  // Restore output for active page
  const initialOutput = loadPageOutput(getActivePage());
  if (initialOutput) outputEl.innerHTML = initialOutput;

  // --- Run button ---

  // --- Fullscreen mode ---

  const expandBtn = document.getElementById("expand-btn");
  const fullscreenCloseBtn = document.getElementById("fullscreen-close");
  const fullscreenRunBtn = document.getElementById("fullscreen-run");
  const fullscreenOutputEl = document.getElementById("fullscreen-output");
  const fullscreenOutputContent = document.getElementById("fullscreen-output-content");
  const fullscreenOutputCloseBtn = document.getElementById("fullscreen-output-close");

  let isFullscreen = false;

  function enterFullscreen() {
    isFullscreen = true;
    document.body.classList.add("fullscreen-mode");
    // Recalculate CM editor height
    editor.requestMeasure();
  }

  function exitFullscreen() {
    isFullscreen = false;
    document.body.classList.remove("fullscreen-mode");
    fullscreenOutputEl.hidden = true;
    editor.requestMeasure();
  }

  expandBtn.addEventListener("click", enterFullscreen);
  fullscreenCloseBtn.addEventListener("click", exitFullscreen);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isFullscreen) {
      exitFullscreen();
    }
  });

  // --- Execute code (shared by normal & fullscreen) ---

  function appendToTarget(targetEl, text, type = "stdout") {
    const span = document.createElement("span");
    span.textContent = text + "\n";
    if (type === "stderr") span.className = "error";
    targetEl.appendChild(span);
  }

  function appendErrorToTarget(targetEl, errorText) {
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

    targetEl.appendChild(wrapper);

    if (lineNumber) {
      highlightErrorLine(editor, lineNumber);
    }
  }

  async function executeCode(targetEl, runBtnEl) {
    targetEl.textContent = "";
    clearErrorHighlight(editor);
    clearUndo();
    const code = editor.state.doc.toString();
    if (runBtnEl) {
      runBtnEl.disabled = true;
      runBtnEl.textContent = t("app.running");
    }
    try {
      await runCode(
        code,
        (text) => appendToTarget(targetEl, text),
        (text) => appendToTarget(targetEl, text, "stderr")
      );
    } catch (e) {
      console.log("--- raw error ---");
      console.log("e.message:", JSON.stringify(e.message));
      console.log("e.type:", e.type);
      console.log("e:", e);
      appendErrorToTarget(targetEl, e.message);
    } finally {
      if (runBtnEl) {
        runBtnEl.disabled = false;
        runBtnEl.textContent = t("app.run");
      }
      // Save output for this page (from normal output)
      savePageOutput(getActivePage(), outputEl.innerHTML);
    }
  }

  // --- Run button (normal mode) ---

  runBtn.addEventListener("click", () => executeCode(outputEl, runBtn));

  // --- Fullscreen run ---

  async function fullscreenExecute() {
    fullscreenOutputEl.hidden = false;
    fullscreenOutputContent.textContent = "";
    clearErrorHighlight(editor);
    const code = editor.state.doc.toString();
    fullscreenRunBtn.disabled = true;
    fullscreenRunBtn.textContent = t("app.running");
    try {
      await runCode(
        code,
        (text) => appendToTarget(fullscreenOutputContent, text),
        (text) => appendToTarget(fullscreenOutputContent, text, "stderr")
      );
    } catch (e) {
      appendErrorToTarget(fullscreenOutputContent, e.message);
    } finally {
      fullscreenRunBtn.disabled = false;
      fullscreenRunBtn.textContent = t("app.fullscreenRun") || t("app.run");
      // Also update normal output for persistence
      outputEl.textContent = fullscreenOutputContent.textContent;
      savePageOutput(getActivePage(), outputEl.innerHTML);
    }
    // Recalculate editor height after panel appears
    editor.requestMeasure();
  }

  fullscreenRunBtn.addEventListener("click", fullscreenExecute);

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && isFullscreen) {
      e.preventDefault();
      fullscreenExecute();
    }
  });

  fullscreenOutputCloseBtn.addEventListener("click", () => {
    fullscreenOutputEl.hidden = true;
    editor.requestMeasure();
  });

  // --- Save button ---

  saveBtn.addEventListener("click", () => {
    const code = editor.state.doc.toString();
    savePageCode(getActivePage(), code);

    saveBtn.textContent = t("app.saved") || "✓ ほぞんしたよ！";
    saveBtn.classList.add("saved");
    setTimeout(() => {
      saveBtn.textContent = t("app.save") || "ほぞん";
      saveBtn.classList.remove("saved");
    }, 1500);
  });

  // --- Share button ---

  shareBtn.addEventListener("click", async () => {
    const code = editor.state.doc.toString();
    const url = encodeShareURL(code);
    outputEl.textContent = "";
    clearUndo();
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
    savePageOutput(getActivePage(), outputEl.innerHTML);
  });

  // --- Samples ---

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
    if (!sample) return;

    const pages = getPages();
    const canAddPage = pages.length < getMaxPages();

    if (canAddPage) {
      // Two-choice: current page or new page
      const useNewPage = confirm(
        (t("app.sampleNewPage") || "あたらしいページにする") + "?\n\n" +
        "OK = " + (t("app.sampleNewPage") || "あたらしいページにする") + "\n" +
        (t("app.sampleCurrentPage") || "いまのページにいれる") + " → キャンセル"
      );
      if (useNewPage) {
        // Save current page first
        savePageCode(getActivePage(), editor.state.doc.toString());
        savePageOutput(getActivePage(), outputEl.innerHTML);

        const id = createPage(sample.title, sample.code);
        setActivePage(id);
        editor.dispatch({
          changes: { from: 0, to: editor.state.doc.length, insert: sample.code },
        });
        outputEl.innerHTML = "";
        renderTabs();
        checkExportHint();
      } else {
        // Replace current page
        editor.dispatch({
          changes: { from: 0, to: editor.state.doc.length, insert: sample.code },
        });
      }
    } else {
      // Max pages: replace current only
      if (confirm(t("app.confirmReplace"))) {
        editor.dispatch({
          changes: { from: 0, to: editor.state.doc.length, insert: sample.code },
        });
      }
    }
    samplesSelect.value = "";
  });

  // --- Language selector ---

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

  // --- Help button ---

  const helpBtn = document.getElementById("help-btn");
  const helpForm = document.getElementById("help-form");
  const helpMsg = document.getElementById("help-msg");
  const helpSend = document.getElementById("help-send");
  const helpCancel = document.getElementById("help-cancel");

  if (helpBtn && helpForm) {
    helpBtn.addEventListener("click", () => {
      helpForm.hidden = !helpForm.hidden;
      if (!helpForm.hidden) helpMsg.focus();
    });

    helpCancel.addEventListener("click", () => {
      helpForm.hidden = true;
      helpMsg.value = "";
    });

    helpSend.addEventListener("click", async () => {
      helpSend.disabled = true;
      try {
        const res = await fetch("/api/help", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: editor.state.doc.toString(),
            output: outputEl.textContent,
            lang: getLocale(),
            message: helpMsg.value,
          }),
        });
        if (res.ok) {
          helpForm.hidden = true;
          helpMsg.value = "";
          outputEl.textContent = "";
          appendOutput(t("app.helpSent"));
        } else {
          appendOutput(t("app.helpFailed"));
        }
      } catch {
        appendOutput(t("app.helpFailed"));
      } finally {
        helpSend.disabled = false;
      }
    });
  }

  // --- Send Issue button ---

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
