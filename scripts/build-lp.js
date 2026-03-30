#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const LOCALES_DIR = path.join(ROOT, "locales");
const BASE_URL = "https://online-python.exe.xyz";
const RTL_LANGUAGES = ["ar", "fa", "ur", "he"];
// Auto-detect languages that have screenshots (assets/screenshots/{lang}/ exists)
const SCREENSHOTS_DIR = path.join(ROOT, "assets", "screenshots");
const SCREENSHOT_LANGUAGES = fs.existsSync(SCREENSHOTS_DIR)
  ? fs.readdirSync(SCREENSHOTS_DIR).filter(f =>
      fs.statSync(path.join(SCREENSHOTS_DIR, f)).isDirectory() &&
      fs.existsSync(path.join(SCREENSHOTS_DIR, f, "step-run.png"))
    )
  : ["en"];

// Load templates
const lpTemplate = fs.readFileSync(path.join(ROOT, "index.html.tpl"), "utf-8");
const privacyTemplate = fs.readFileSync(path.join(ROOT, "privacy.html.tpl"), "utf-8");

// Discover all languages
const langs = fs.readdirSync(LOCALES_DIR).filter(f =>
  fs.statSync(path.join(LOCALES_DIR, f)).isDirectory()
);

// Load all translations
const translations = {};
for (const lang of langs) {
  const transPath = path.join(LOCALES_DIR, lang, "translation.json");
  if (fs.existsSync(transPath)) {
    translations[lang] = JSON.parse(fs.readFileSync(transPath, "utf-8"));
  }
}

// Flatten nested object: { lp: { title: "x" } } → { "lp.title": "x" }
function flatten(obj, prefix = "") {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      Object.assign(result, flatten(value, fullKey));
    } else {
      result[fullKey] = String(value);
    }
  }
  return result;
}

// Generate hreflang links
function generateHreflangLinks() {
  const links = [];
  links.push(`  <link rel="alternate" hreflang="x-default" href="${BASE_URL}/">`);
  for (const lang of langs) {
    if (!translations[lang]?.lp) continue;
    const url = lang === "ja" ? `${BASE_URL}/` : `${BASE_URL}/${lang}/`;
    links.push(`  <link rel="alternate" hreflang="${lang}" href="${url}">`);
  }
  return links.join("\n");
}

// Generate JSON-LD for a language
function generateJsonLd(lang, flat) {
  const name = flat["lp.ogTitle"] || flat["lp.heroTitle"] || "Python Notebook";
  const description = flat["lp.description"] || "";
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": name,
    "description": description,
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Any (Web Browser)",
    "inLanguage": lang,
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "audience": {
      "@type": "EducationalAudience",
      "educationalRole": "student",
      "typicalAgeRange": "6-12"
    }
  }, null, 4);
}

// Replace placeholders in template
function render(template, vars) {
  let result = template;
  let unreplaced = [];
  result = result.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, key) => {
    if (key in vars) return vars[key];
    unreplaced.push(key);
    return match;
  });
  return { html: result, unreplaced };
}

const hreflangLinks = generateHreflangLinks();
let totalFiles = 0;
let totalWarnings = 0;

for (const lang of langs) {
  const trans = translations[lang];
  if (!trans?.lp) {
    // Skip languages without LP keys
    continue;
  }

  const flat = flatten(trans);
  const dir = RTL_LANGUAGES.includes(lang) ? "rtl" : "ltr";
  const isJa = lang === "ja";
  const langPrefix = isJa ? "" : `/${lang}`;
  const screenshotLang = SCREENSHOT_LANGUAGES.includes(lang) ? lang : "en";

  // Compute paths (relative for ja at root, relative for others in subdir)
  const cssPath = isJa ? "lp.css" : "../lp.css";
  const assetsPath = isJa ? "assets" : "../assets";
  const screenshotPath = `${assetsPath}/screenshots/${screenshotLang}`;

  const vars = {
    ...flat,
    lang,
    dir,
    langCode: lang,
    hreflangLinks,
    jsonLd: generateJsonLd(lang, flat),
    canonicalUrl: isJa ? `${BASE_URL}/` : `${BASE_URL}/${lang}/`,
    appUrl: isJa ? "/app/" : `/app/?lang=${lang}`,
    privacyUrl: isJa ? "/privacy.html" : `/${lang}/privacy.html`,
    homeUrl: isJa ? "/" : `/${lang}/`,
    cssPath,
    assetsPath,
    screenshotPath,
    ogpImageUrl: `${BASE_URL}/assets/ogp-${screenshotLang}.png`,
  };

  // Render LP
  const lpResult = render(lpTemplate, vars);
  if (lpResult.unreplaced.length > 0) {
    console.warn(`WARN [${lang}] index.html: unreplaced keys: ${lpResult.unreplaced.join(", ")}`);
    totalWarnings++;
  }

  // Render privacy
  const privacyResult = render(privacyTemplate, vars);
  if (privacyResult.unreplaced.length > 0) {
    console.warn(`WARN [${lang}] privacy.html: unreplaced keys: ${privacyResult.unreplaced.join(", ")}`);
    totalWarnings++;
  }

  // Output directory
  const outDir = isJa ? ROOT : path.join(ROOT, lang);
  if (!isJa) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(path.join(outDir, "index.html"), lpResult.html, "utf-8");
  fs.writeFileSync(path.join(outDir, "privacy.html"), privacyResult.html, "utf-8");
  totalFiles += 2;

  console.log(`  OK  [${lang}]: index.html + privacy.html`);
}

console.log(`\n--- Summary ---`);
console.log(`Languages with LP keys: ${totalFiles / 2}`);
console.log(`Files generated: ${totalFiles}`);
console.log(`Warnings: ${totalWarnings}`);
