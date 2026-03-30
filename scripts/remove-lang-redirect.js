#!/usr/bin/env node
/**
 * 全言語LPからリダイレクトスクリプトと言語切替UIを削除する。
 * apply-lang-redirect.js で再適用する前のクリーンアップ用。
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

const dirs = fs.readdirSync(ROOT).filter(d => {
  const stat = fs.statSync(path.join(ROOT, d));
  if (!stat.isDirectory()) return false;
  const indexPath = path.join(ROOT, d, "index.html");
  return fs.existsSync(indexPath) && /^[a-z]{2}(-[A-Z]{2})?$/.test(d);
});

let cleaned = 0;

for (const dir of dirs) {
  const filePath = path.join(ROOT, dir, "index.html");
  let html = fs.readFileSync(filePath, "utf8");
  const before = html.length;

  // Remove redirect script block
  html = html.replace(/  <script>\n  \(function\(\) \{\n    var browserLang[\s\S]*?\}\)\(\);\n  <\/script>\n/g, "");

  // Remove lang selector HTML
  html = html.replace(/  <div id="lp-lang-selector">[\s\S]*?<\/div>\n/g, "");

  // Remove lang selector script
  html = html.replace(/  <script>\n    \(function\(\) \{\n      var LANG_NAMES[\s\S]*?\}\)\(\);\n  <\/script>\n/g, "");

  if (html.length !== before) {
    fs.writeFileSync(filePath, html, "utf8");
    console.log(`  CLEANED ${dir}/index.html`);
    cleaned++;
  } else {
    console.log(`  SKIP ${dir}/index.html (nothing to clean)`);
  }
}

console.log(`\nDone: ${cleaned} cleaned`);
