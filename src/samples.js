import { getLocale } from "./i18n.js";

let cache = {};

export async function getSamples() {
  const lang = getLocale();
  if (cache[lang]) return cache[lang];
  try {
    const res = await fetch(`/locales/${lang}/samples.json`);
    const data = await res.json();
    cache[lang] = data.list || [];
    return cache[lang];
  } catch {
    return [];
  }
}
