const { chromium } = require("playwright");

const BASE = "http://localhost:3000";

(async () => {
  const browser = await chromium.launch({ channel: "chromium" });

  // --- App screenshots ---
  const page = await browser.newPage({ viewport: { width: 400, height: 700 } });
  await page.goto(`${BASE}/app/`);
  await page.waitForSelector(".cm-editor", { timeout: 60000 });

  // Step 1: 開く（初期状態）
  await page.screenshot({ path: "assets/screenshots/step-open.png" });

  // Step 2: 書く（コード入力）
  // Pyodideのロードを待つ（ボタンがenabledになるまで）
  await page.waitForFunction(
    () => !document.getElementById("run-btn").disabled,
    { timeout: 60000 }
  );
  const cmContent = page.locator(".cm-content");
  await cmContent.click();
  await page.keyboard.press("Control+a");
  await page.keyboard.type('print("こんにちは！")');
  await page.screenshot({ path: "assets/screenshots/step-write.png" });

  // Step 3: 実行（出力表示）
  await page.click("#run-btn");
  await page.waitForFunction(
    () => document.getElementById("output").textContent.includes("こんにちは"),
    { timeout: 60000 }
  );
  await page.screenshot({ path: "assets/screenshots/step-run.png" });

  // --- OGP image ---
  const ogpPage = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await ogpPage.setContent(`
    <div style="
      width: 1200px; height: 630px;
      background: #e8f4fc;
      background-image: radial-gradient(#d0e8f5 10%, transparent 10%);
      background-size: 30px 30px;
      display: flex; align-items: center; justify-content: center;
      flex-direction: column; gap: 20px;
      font-family: sans-serif;
    ">
      <img src="${BASE}/assets/snake.png" style="width: 120px;">
      <h1 style="color: #4a90c4; font-size: 48px; margin: 0;">
        Pythonれんしゅうちょう
      </h1>
      <p style="color: #666; font-size: 24px; margin: 0;">
        ブラウザだけでPythonが動く。小学生のためのプログラミング練習帳
      </p>
    </div>
  `);
  await ogpPage.screenshot({ path: "assets/ogp.png" });

  await browser.close();
  console.log("Screenshots and OGP image generated.");
})();
