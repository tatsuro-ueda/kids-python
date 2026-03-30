const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE = "http://localhost:3000";
const ROOT = path.join(__dirname, "..");
const LOCALES_DIR = path.join(ROOT, "locales");

// All languages with samples.json get screenshots.
// The first sample's print("...") is used as the code example.
function discoverLanguages() {
  const langs = fs.readdirSync(LOCALES_DIR).filter(f =>
    fs.statSync(path.join(LOCALES_DIR, f)).isDirectory()
  );
  const result = [];
  for (const lang of langs) {
    const samplesPath = path.join(LOCALES_DIR, lang, "samples.json");
    if (!fs.existsSync(samplesPath)) continue;
    const samples = JSON.parse(fs.readFileSync(samplesPath, "utf-8"));
    const first = samples.list?.[0];
    if (!first?.code) continue;
    // Extract print("...") from the first sample
    const match = first.code.match(/print\("([^"]+)"\)/);
    if (!match) continue;
    result.push({ lang, code: `print("${match[1]}")`, output: match[1] });
  }
  return result;
}

function loadTranslation(lang) {
  const p = path.join(LOCALES_DIR, lang, "translation.json");
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

(async () => {
  const languages = discoverLanguages();
  console.log(`Found ${languages.length} languages with samples.\n`);

  const browser = await chromium.launch({ channel: "chromium" });

  // --- App screenshots for each language ---
  for (const { lang, code, output } of languages) {
    const outDir = path.join(ROOT, "assets", "screenshots", lang);
    fs.mkdirSync(outDir, { recursive: true });

    console.log(`[${lang}] Taking screenshots... (${code})`);
    const page = await browser.newPage({ viewport: { width: 400, height: 700 } });
    await page.goto(`${BASE}/app/?lang=${lang}`);
    await page.waitForSelector(".cm-editor", { timeout: 60000 });

    // Step 1: Open (initial state)
    await page.screenshot({ path: path.join(outDir, "step-open.png") });

    // Wait for Pyodide to load (run button becomes enabled)
    await page.waitForFunction(
      () => !document.getElementById("run-btn").disabled,
      { timeout: 60000 }
    );

    // Step 2: Write (type code)
    const cmContent = page.locator(".cm-content");
    await cmContent.click();
    await page.keyboard.press("Control+a");
    await page.keyboard.type(code);
    await page.screenshot({ path: path.join(outDir, "step-write.png") });

    // Step 3: Run (execute and wait for output)
    await page.click("#run-btn");
    await page.waitForFunction(
      (expected) => document.getElementById("output").textContent.includes(expected),
      output,
      { timeout: 60000 }
    );
    await page.screenshot({ path: path.join(outDir, "step-run.png") });

    await page.close();
    console.log(`[${lang}] Done`);
  }

  // --- OGP images for each language ---
  for (const { lang } of languages) {
    const trans = loadTranslation(lang);
    const lp = trans.lp || {};
    const title = lp.ogTitle || lp.heroTitle || "Python Notebook";
    const desc = lp.ogDescription || "";
    const dir = ["ar", "fa", "ur", "he"].includes(lang) ? "rtl" : "ltr";

    console.log(`[${lang}] Generating OGP image...`);
    const ogpPage = await browser.newPage({ viewport: { width: 1200, height: 630 } });
    await ogpPage.setContent(`
      <div dir="${dir}" style="
        width: 1200px; height: 630px;
        background: #e8f4fc;
        background-image: radial-gradient(#d0e8f5 10%, transparent 10%);
        background-size: 30px 30px;
        display: flex; align-items: center; justify-content: center;
        flex-direction: column; gap: 20px;
        font-family: sans-serif;
      ">
        <img src="${BASE}/assets/snake.png" style="width: 120px;">
        <h1 style="color: #4a90c4; font-size: 48px; margin: 0; text-align: center; padding: 0 40px;">
          ${title}
        </h1>
        <p style="color: #666; font-size: 24px; margin: 0; text-align: center; padding: 0 40px;">
          ${desc}
        </p>
      </div>
    `);
    await ogpPage.screenshot({ path: path.join(ROOT, "assets", `ogp-${lang}.png`) });
    await ogpPage.close();
    console.log(`[${lang}] OGP done`);
  }

  await browser.close();
  console.log(`\nAll done: ${languages.length} languages × 3 screenshots + OGP`);
})();
