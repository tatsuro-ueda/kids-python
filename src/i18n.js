import i18next from "i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

const RTL_LANGUAGES = ["ar", "fa", "ur", "he"];

export const LANGUAGES = [
  // Phase 0
  { code: "ja", name: "にほんご", dir: "ltr" },
  // Phase 1
  { code: "en", name: "English", dir: "ltr" },
  { code: "hi", name: "हिन्दी", dir: "ltr" },
  { code: "es", name: "Español", dir: "ltr" },
  { code: "ar", name: "العربية", dir: "rtl" },
  // Phase 2
  { code: "pt", name: "Português", dir: "ltr" },
  { code: "id", name: "Bahasa Indonesia", dir: "ltr" },
  { code: "vi", name: "Tiếng Việt", dir: "ltr" },
  { code: "tr", name: "Türkçe", dir: "ltr" },
  { code: "bn", name: "বাংলা", dir: "ltr" },
  // Phase 3
  { code: "ko", name: "한국어", dir: "ltr" },
  { code: "zh-TW", name: "繁體中文", dir: "ltr" },
  { code: "fa", name: "فارسی", dir: "rtl" },
  { code: "th", name: "ภาษาไทย", dir: "ltr" },
  { code: "fr", name: "Français", dir: "ltr" },
  { code: "ur", name: "اردو", dir: "rtl" },
  { code: "ru", name: "Русский", dir: "ltr" },
  // Phase 4 — 50言語拡大
  { code: "de", name: "Deutsch", dir: "ltr" },
  { code: "it", name: "Italiano", dir: "ltr" },
  { code: "nl", name: "Nederlands", dir: "ltr" },
  { code: "pl", name: "Polski", dir: "ltr" },
  { code: "uk", name: "Українська", dir: "ltr" },
  { code: "ro", name: "Română", dir: "ltr" },
  { code: "el", name: "Ελληνικά", dir: "ltr" },
  { code: "hu", name: "Magyar", dir: "ltr" },
  { code: "cs", name: "Čeština", dir: "ltr" },
  { code: "sv", name: "Svenska", dir: "ltr" },
  { code: "da", name: "Dansk", dir: "ltr" },
  { code: "fi", name: "Suomi", dir: "ltr" },
  { code: "no", name: "Norsk", dir: "ltr" },
  { code: "zh-CN", name: "简体中文", dir: "ltr" },
  { code: "ms", name: "Bahasa Melayu", dir: "ltr" },
  { code: "tl", name: "Filipino", dir: "ltr" },
  { code: "sw", name: "Kiswahili", dir: "ltr" },
  { code: "am", name: "አማርኛ", dir: "ltr" },
  { code: "ta", name: "தமிழ்", dir: "ltr" },
  { code: "te", name: "తెలుగు", dir: "ltr" },
  { code: "mr", name: "मराठी", dir: "ltr" },
  { code: "gu", name: "ગુજરાતી", dir: "ltr" },
  { code: "ne", name: "नेपाली", dir: "ltr" },
  { code: "si", name: "සිංහල", dir: "ltr" },
  { code: "km", name: "ភាសាខ្មែរ", dir: "ltr" },
  { code: "my", name: "မြန်မာ", dir: "ltr" },
  { code: "ka", name: "ქართული", dir: "ltr" },
  { code: "he", name: "עברית", dir: "rtl" },
  { code: "uz", name: "Oʻzbek", dir: "ltr" },
  { code: "kk", name: "Қазақ", dir: "ltr" },
  { code: "az", name: "Azərbaycan", dir: "ltr" },
  { code: "sr", name: "Srpski", dir: "ltr" },
  { code: "hr", name: "Hrvatski", dir: "ltr" },
];

export async function initI18n() {
  await i18next
    .use(HttpBackend)
    .use(LanguageDetector)
    .init({
      fallbackLng: "ja",
      supportedLngs: LANGUAGES.map(l => l.code),
      ns: ["translation", "samples"],
      defaultNS: "translation",
      backend: {
        loadPath: "/locales/{{lng}}/{{ns}}.json",
      },
      detection: {
        order: ["querystring", "localStorage", "navigator"],
        lookupQuerystring: "lang",
        lookupLocalStorage: "preferred-lang",
        caches: ["localStorage"],
      },
      interpolation: {
        escapeValue: false,
      },
    });

  const lang = i18next.language;
  document.documentElement.lang = lang;
  document.documentElement.dir = RTL_LANGUAGES.includes(lang) ? "rtl" : "ltr";

  applyDOM();
}

function applyDOM() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = i18next.t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-alt]").forEach(el => {
    el.alt = i18next.t(el.dataset.i18nAlt);
  });
}

export const t = (...args) => i18next.t(...args);
export const getLocale = () => i18next.language;

export async function setLocale(code) {
  await i18next.changeLanguage(code);
  localStorage.setItem("preferred-lang", code);
  document.documentElement.lang = code;
  document.documentElement.dir = RTL_LANGUAGES.includes(code) ? "rtl" : "ltr";
  applyDOM();
}
