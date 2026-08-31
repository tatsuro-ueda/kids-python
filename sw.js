/* ホーム画面から起動できるようにするための最小の Service Worker。
 *
 * やることは1つだけ。ページを開こうとしてネットワークに届かなかったときに、
 * 真っ白なエラー画面ではなく offline.html を返す。
 *
 * 静的資産（CSS / JS）は「あとから貯める」方式をとらない。このサイトの
 * lp.css や app/dist/bundle.js は ?v=... の付かない固定URLで配られるので、
 * cache-first にすると「直したのに古い画面が出る」という分かりにくい壊れ方をする。
 *
 * Pyodide（vendor/pyodide/）は数十MBあるので絶対に触らない。
 */

const CACHE = "op-offline-v1";
const OFFLINE_URL = "/offline.html";
const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(names.filter((name) => name !== CACHE).map((name) => caches.delete(name)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  // ページ遷移だけ面倒を見る。API・CSS・JS・Pyodide は素通し。
  if (request.mode !== "navigate") return;

  event.respondWith(
    fetch(request).catch(() => caches.match(OFFLINE_URL))
  );
});
