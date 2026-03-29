const STORAGE_KEY = "python-editor-code";
const DEFAULT_CODE = 'print("Hello, Python!")';

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
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_CODE;
}

export function saveCode(code) {
  localStorage.setItem(STORAGE_KEY, code);
}

const SHARE_TEXT = "ブラウザだけでPythonが動く！小学生向けプログラミング練習帳";

export function getShareIntentURLs(url) {
  const encoded = encodeURIComponent(url);
  const text = encodeURIComponent(SHARE_TEXT);
  return {
    line: `https://social-plugins.line.me/lineit/share?url=${encoded}`,
    x: `https://twitter.com/intent/tweet?url=${encoded}&text=${text}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
  };
}
