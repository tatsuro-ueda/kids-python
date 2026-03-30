#!/usr/bin/env node

/**
 * i18n バリデーションスクリプト
 * - 全言語のJSONが有効な構文であることを確認
 * - ソース言語(ja)と同じプレースホルダーが全言語に存在することを確認
 * - ソース言語のキーが全言語に存在することを確認(警告)
 */

const fs = require("fs");
const path = require("path");

const LOCALES_DIR = path.join(__dirname, "..", "locales");
const SOURCE_LANG = "ja";

let errors = 0;
let warnings = 0;

function extractPlaceholders(str) {
  const matches = str.match(/\{\{(\w+)\}\}/g) || [];
  return matches.sort();
}

function flattenObject(obj, prefix = "") {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, fullKey));
    } else if (typeof value === "string") {
      result[fullKey] = value;
    }
  }
  return result;
}

// Get all language directories
const langs = fs.readdirSync(LOCALES_DIR).filter(f => {
  return fs.statSync(path.join(LOCALES_DIR, f)).isDirectory();
});

console.log(`Found ${langs.length} languages: ${langs.join(", ")}\n`);

// Load source language
const sourceTransPath = path.join(LOCALES_DIR, SOURCE_LANG, "translation.json");
let sourceData;
try {
  sourceData = JSON.parse(fs.readFileSync(sourceTransPath, "utf-8"));
} catch (e) {
  console.error(`FATAL: Cannot parse source ${sourceTransPath}: ${e.message}`);
  process.exit(1);
}

const sourceFlat = flattenObject(sourceData);
const sourceKeys = Object.keys(sourceFlat);
console.log(`Source (${SOURCE_LANG}): ${sourceKeys.length} keys\n`);

// Validate each language
for (const lang of langs) {
  if (lang === SOURCE_LANG) continue;

  const transPath = path.join(LOCALES_DIR, lang, "translation.json");
  const samplesPath = path.join(LOCALES_DIR, lang, "samples.json");

  // Check translation.json exists and is valid JSON
  if (!fs.existsSync(transPath)) {
    console.error(`ERROR [${lang}]: translation.json not found`);
    errors++;
    continue;
  }

  let transData;
  try {
    transData = JSON.parse(fs.readFileSync(transPath, "utf-8"));
  } catch (e) {
    console.error(`ERROR [${lang}]: translation.json parse error: ${e.message}`);
    errors++;
    continue;
  }

  const transFlat = flattenObject(transData);
  const transKeys = Object.keys(transFlat);

  // Check key coverage
  const missingKeys = sourceKeys.filter(k => !(k in transFlat));
  if (missingKeys.length > 0) {
    console.warn(`WARN  [${lang}]: ${missingKeys.length} missing keys: ${missingKeys.slice(0, 5).join(", ")}${missingKeys.length > 5 ? "..." : ""}`);
    warnings++;
  }

  // Check placeholder consistency
  for (const key of sourceKeys) {
    if (!(key in transFlat)) continue;
    const sourcePH = extractPlaceholders(sourceFlat[key]);
    const transPH = extractPlaceholders(transFlat[key]);
    if (JSON.stringify(sourcePH) !== JSON.stringify(transPH)) {
      console.error(`ERROR [${lang}]: Placeholder mismatch in "${key}": source=${sourcePH.join(",")} target=${transPH.join(",")}`);
      errors++;
    }
  }

  // Check samples.json exists and is valid JSON
  if (fs.existsSync(samplesPath)) {
    try {
      const samplesData = JSON.parse(fs.readFileSync(samplesPath, "utf-8"));
      if (!samplesData.list || !Array.isArray(samplesData.list)) {
        console.error(`ERROR [${lang}]: samples.json missing "list" array`);
        errors++;
      } else {
        const count = samplesData.list.length;
        if (count !== 11) {
          console.warn(`WARN  [${lang}]: samples.json has ${count} samples (expected 11)`);
          warnings++;
        }
      }
    } catch (e) {
      console.error(`ERROR [${lang}]: samples.json parse error: ${e.message}`);
      errors++;
    }
  } else {
    console.warn(`WARN  [${lang}]: samples.json not found`);
    warnings++;
  }

  // Summary for this lang
  const keyCount = transKeys.length;
  console.log(`  OK  [${lang}]: ${keyCount} keys, ${missingKeys.length} missing`);
}

console.log(`\n--- Summary ---`);
console.log(`Languages: ${langs.length}`);
console.log(`Errors: ${errors}`);
console.log(`Warnings: ${warnings}`);

if (errors > 0) {
  console.log("\nValidation FAILED");
  process.exit(1);
} else {
  console.log("\nValidation PASSED");
}
