#!/usr/bin/env node
/**
 * 全言語LPにリダイレクトスクリプトと言語切替UIを一括適用する。
 * 冪等: 既に挿入済みなら何もしない。
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

const REDIRECT_SCRIPT = `  <script>
  (function() {
    var browserLang = (navigator.language || "").replace("_", "-");
    if (!browserLang) return;
    var pathMatch = location.pathname.match(/^\\/([a-z]{2}(?:-[A-Z]{2})?)\\//);
    var currentLang = pathMatch ? pathMatch[1] : "ja";
    var supported = {};
    document.querySelectorAll('link[hreflang]').forEach(function(el) {
      var hl = el.getAttribute("hreflang");
      if (hl && hl !== "x-default") {
        var href = el.getAttribute("href");
        var p = href.replace(/https?:\\/\\/[^/]+/, "");
        supported[hl] = p;
      }
    });
    function findMatch(lang) {
      if (supported[lang]) return supported[lang];
      var base = lang.split("-")[0];
      if (base === "zh") base = "zh-CN";
      if (supported[base]) return supported[base];
      return supported["en"] || "/en/";
    }
    var target = findMatch(browserLang);
    var targetLang = target.replace(/^\\/|\\/$/g, "") || "ja";
    if (targetLang !== currentLang) {
      location.replace(target);
    }
  })();
  </script>`;

const LANG_SELECTOR_HTML = `  <div id="lp-lang-selector">
    <button id="lp-lang-btn" aria-label="Language">🌐</button>
    <ul id="lp-lang-list" hidden></ul>
  </div>`;

const LANG_SELECTOR_SCRIPT = `  <script>
    (function() {
      var LANG_NAMES = {
        ja:"にほんご",en:"English",hi:"हिन्दी",es:"Español",ar:"العربية",
        pt:"Português",id:"Bahasa Indonesia",vi:"Tiếng Việt",tr:"Türkçe",
        bn:"বাংলা",ko:"한국어","zh-TW":"繁體中文",fa:"فارسی",th:"ภาษาไทย",
        fr:"Français",ur:"اردو",ru:"Русский",de:"Deutsch",it:"Italiano",
        nl:"Nederlands",pl:"Polski",uk:"Українська",ro:"Română",el:"Ελληνικά",
        hu:"Magyar",cs:"Čeština",sv:"Svenska",da:"Dansk",fi:"Suomi",no:"Norsk",
        "zh-CN":"简体中文",ms:"Bahasa Melayu",tl:"Filipino",sw:"Kiswahili",
        am:"አማርኛ",ta:"தமிழ்",te:"తెలుగు",mr:"मराठी",gu:"ગુજરાતી",
        ne:"नेपाली",si:"සිංහල",km:"ភាសាខ្មែរ",my:"မြန်မာ",ka:"ქართული",
        he:"עברית",uz:"Oʻzbek",kk:"Қазақ",az:"Azərbaycan",sr:"Srpski",hr:"Hrvatski"
      };
      var btn = document.getElementById("lp-lang-btn");
      var list = document.getElementById("lp-lang-list");
      if (!btn || !list) return;
      document.querySelectorAll('link[hreflang]').forEach(function(el) {
        var code = el.getAttribute("hreflang");
        if (!code || code === "x-default") return;
        var href = el.getAttribute("href").replace(/https?:\\/\\/[^/]+/, "");
        if (code === "ja") href = "/";
        var li = document.createElement("li");
        li.textContent = LANG_NAMES[code] || code;
        li.onclick = function() { location.href = href; };
        list.appendChild(li);
      });
      btn.onclick = function(e) {
        e.stopPropagation();
        list.hidden = !list.hidden;
      };
      document.addEventListener("click", function() { list.hidden = true; });
    })();
  </script>`;

// Get all language directories
const dirs = fs.readdirSync(ROOT).filter(d => {
  const stat = fs.statSync(path.join(ROOT, d));
  if (!stat.isDirectory()) return false;
  const indexPath = path.join(ROOT, d, "index.html");
  return fs.existsSync(indexPath) && /^[a-z]{2}(-[A-Z]{2})?$/.test(d);
});

let updated = 0;
let skipped = 0;

for (const dir of dirs) {
  const filePath = path.join(ROOT, dir, "index.html");
  let html = fs.readFileSync(filePath, "utf8");

  // Check if already applied (idempotent)
  if (html.includes("lp-lang-selector") && html.includes("findMatch")) {
    console.log(`  SKIP ${dir}/index.html (already applied)`);
    skipped++;
    continue;
  }

  // Insert redirect script before </head>
  if (!html.includes("findMatch")) {
    html = html.replace("</head>", REDIRECT_SCRIPT + "\n</head>");
  }

  // Insert language selector before <section class="hero">
  if (!html.includes("lp-lang-selector")) {
    html = html.replace('<section class="hero">', LANG_SELECTOR_HTML + "\n  <section class=\"hero\">");
  }

  // Insert language selector script before </body>
  if (!html.includes("lp-lang-btn")) {
    // Find the last </script> before </body> and insert after it
    html = html.replace("</footer>\n</body>", "</footer>\n" + LANG_SELECTOR_SCRIPT + "\n</body>");
  }

  fs.writeFileSync(filePath, html, "utf8");
  console.log(`  UPDATED ${dir}/index.html`);
  updated++;
}

console.log(`\nDone: ${updated} updated, ${skipped} skipped`);
