import { t } from "./i18n.js";

// --- Legacy keys (for migration) ---
const LEGACY_CODE_KEY = "python-editor-code";

// --- Page management keys ---
const PAGES_KEY = "python-editor-pages";
const PAGE_PREFIX = "python-editor-page-";
const OUTPUT_PREFIX = "python-editor-output-";
const ACTIVE_KEY = "python-editor-active";
const MAX_PAGES = 32;
const DEFAULT_CODE = 'print("Hello, Python!")';

function generateId() {
  return "p" + Date.now() + Math.random().toString(36).slice(2, 6);
}

// --- Page list CRUD ---

export function getPages() {
  try {
    return JSON.parse(localStorage.getItem(PAGES_KEY)) || [];
  } catch {
    return [];
  }
}

function savePages(pages) {
  localStorage.setItem(PAGES_KEY, JSON.stringify(pages));
}

export function getActivePage() {
  return localStorage.getItem(ACTIVE_KEY);
}

export function setActivePage(id) {
  localStorage.setItem(ACTIVE_KEY, id);
}

export function createPage(name, code) {
  const pages = getPages();
  if (pages.length >= MAX_PAGES) return null;
  const id = generateId();
  pages.push({ id, name, createdAt: Date.now() });
  savePages(pages);
  localStorage.setItem(PAGE_PREFIX + id, code || DEFAULT_CODE);
  return id;
}

export function deletePage(id) {
  const pages = getPages().filter(p => p.id !== id);
  savePages(pages);
  localStorage.removeItem(PAGE_PREFIX + id);
  localStorage.removeItem(OUTPUT_PREFIX + id);
}

export function renamePage(id, name) {
  const pages = getPages();
  const page = pages.find(p => p.id === id);
  if (page) {
    page.name = name.slice(0, 20);
    savePages(pages);
  }
}

export function loadPageCode(id) {
  return localStorage.getItem(PAGE_PREFIX + id) || DEFAULT_CODE;
}

export function savePageCode(id, code) {
  localStorage.setItem(PAGE_PREFIX + id, code);
}

export function loadPageOutput(id) {
  return localStorage.getItem(OUTPUT_PREFIX + id) || "";
}

export function savePageOutput(id, output) {
  localStorage.setItem(OUTPUT_PREFIX + id, output);
}

export function getMaxPages() {
  return MAX_PAGES;
}

// --- Migration from legacy single-code format ---

export function migrateIfNeeded() {
  if (localStorage.getItem(PAGES_KEY)) return; // already migrated

  const legacyCode = localStorage.getItem(LEGACY_CODE_KEY);
  const code = legacyCode || DEFAULT_CODE;
  const id = generateId();
  const name = t("app.defaultPageName", { n: 1 }) || "ページ1";

  savePages([{ id, name, createdAt: Date.now() }]);
  localStorage.setItem(PAGE_PREFIX + id, code);
  setActivePage(id);

  if (legacyCode !== null) {
    localStorage.removeItem(LEGACY_CODE_KEY);
  }
}

// --- Shared code (unchanged) ---

let sharedCode = null;

export function encodeShareURL(code) {
  const encoded = btoa(encodeURIComponent(code));
  const url = `${location.origin}${location.pathname}#code=${encoded}`;
  return url;
}

export function detectSharedCode() {
  const hash = location.hash;
  if (!hash.startsWith("#code=")) return null;
  try {
    return decodeURIComponent(atob(hash.slice(6)));
  } catch {
    return null;
  }
}

export function setSharedCode(code) {
  sharedCode = code;
}

export function loadCode() {
  if (sharedCode !== null) return sharedCode;
  const activeId = getActivePage();
  if (activeId) return loadPageCode(activeId);
  return DEFAULT_CODE;
}

export function saveCode(code) {
  const activeId = getActivePage();
  if (activeId) {
    savePageCode(activeId, code);
  }
}

export function resetCode() {
  const activeId = getActivePage();
  if (activeId) {
    localStorage.setItem(PAGE_PREFIX + activeId, DEFAULT_CODE);
  }
  return DEFAULT_CODE;
}

export function getShareIntentURLs(url) {
  const encoded = encodeURIComponent(url);
  const text = encodeURIComponent(t("app.shareText"));
  return {
    line: `https://social-plugins.line.me/lineit/share?url=${encoded}`,
    x: `https://twitter.com/intent/tweet?url=${encoded}&text=${text}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
  };
}
