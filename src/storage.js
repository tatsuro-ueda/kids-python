const STORAGE_KEY = "python-editor-code";
const DEFAULT_CODE = 'print("Hello, Python!")';

export function loadCode() {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_CODE;
}

export function saveCode(code) {
  localStorage.setItem(STORAGE_KEY, code);
}
