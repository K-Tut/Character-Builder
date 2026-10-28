// Offline cache for the app shell. Bump VERSION when files change.
const VERSION = "v10";
const FILES = ["./", "index.html", "style.css", "print.css", "rules.js", "config.js", "app.js", "store.js", "ui.js", "print.js", "sheet.js", "dice.js", "shop.js", "manifest.json", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => {
  // always fetch fresh copies (bypass the browser's HTTP cache) when installing a new version
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(FILES.map(f => fetch(f, { cache: "no-cache" }).then(r => r.ok && c.put(f, r)).catch(() => { })))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION && !k.startsWith("dm-")).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("message", e => { if (e.data === "skipWaiting") self.skipWaiting(); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin || u.pathname.includes("/api/")) return;
  // network first, revalidating with the server (so updates arrive immediately); cached copy when offline
  e.respondWith(fetch(e.request, { cache: "no-cache" }).then(r => { const copy = r.clone(); if (r.ok) caches.open(VERSION).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});
