"use strict";
/* ============ Local storage (IndexedDB) + Google Drive sync ============
   Characters live in the browser (IndexedDB) on each device.
   Sync uses the hidden "app data" folder of your Google Drive (scope drive.appdata):
   only this app can see those files; your normal Drive files are never touched.
*/
const DB = {
  db: null,
  open() {
    if (this.db) return Promise.resolve(this.db);
    return new Promise((res, rej) => {
      const r = indexedDB.open("dnd-builder", 1);
      r.onupgradeneeded = () => { const d = r.result; d.createObjectStore("chars", { keyPath: "id" }); d.createObjectStore("kv"); };
      r.onsuccess = () => { this.db = r.result; res(this.db); };
      r.onerror = () => rej(r.error);
    });
  },
  async tx(store, mode, fn) {
    const d = await this.open();
    return new Promise((res, rej) => { const t = d.transaction(store, mode); const s = t.objectStore(store); const out = fn(s); t.oncomplete = () => res(out instanceof IDBRequest ? out.result : out); t.onerror = () => rej(t.error); });
  },
  allChars() { return this.tx("chars", "readonly", s => s.getAll()); },
  getChar(id) { return this.tx("chars", "readonly", s => s.get(id)); },
  putChar(c) { return this.tx("chars", "readwrite", s => s.put(c)); },
  delChar(id) { return this.tx("chars", "readwrite", s => s.delete(id)); },
  get(k) { return this.tx("kv", "readonly", s => s.get(k)); },
  set(k, v) { return this.tx("kv", "readwrite", s => s.put(v, k)); }
};

// ---------- local character API (replaces the old server calls) ----------
async function storeSaveChar(c, touch = true) {
  if (touch) c._updated = Date.now();
  await DB.putChar(JSON.parse(JSON.stringify(c)));
  if (touch) Folder.push(c);
  if (touch) Sync.soon();
}
async function storeListChars() {
  const all = await DB.allChars();
  return all.sort((a, b) => (b._updated || 0) - (a._updated || 0)).map(c => ({ id: c.id, name: c.name, summary: c._summary || "", thumb: c.thumb || "" }));
}
async function storeDeleteChar(id) {
  await DB.delChar(id);
  await Folder.remove(id);
  const tomb = (await DB.get("tombstones")) || {}; tomb[id] = Date.now(); await DB.set("tombstones", tomb);
  Sync.soon();
}
// ---------- password-protected rules text (wiki.enc in the GitHub repo) ----------
const WikiLock = {
  b64(buf) { const b = new Uint8Array(buf); let s = ""; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(s); },
  unb64(s) { const bin = atob(s); const b = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i); return b; },
  async key(pw, salt, iter) {
    const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: iter, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  },
  async encrypt(obj, pw) {
    const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12)), iter = 250000;
    const plain = { ...obj }; delete plain._updated; delete plain._encTag;
    const gz = await new Response(new Blob([JSON.stringify(plain)]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer();
    const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await this.key(pw, salt, iter), gz);
    return JSON.stringify({ format: "dnd-builder-wiki-v1", imported: obj.imported || "", iter, salt: this.b64(salt), iv: this.b64(iv), data: this.b64(data) });
  },
  async decrypt(enc, pw) {
    const key = await this.key(pw, this.unb64(enc.salt), enc.iter);
    let gz;
    try { gz = await crypto.subtle.decrypt({ name: "AES-GCM", iv: this.unb64(enc.iv) }, key, this.unb64(enc.data)); }
    catch (e) { throw new Error("Wrong password"); }
    return JSON.parse(await new Response(new Blob([gz]).stream().pipeThrough(new DecompressionStream("gzip"))).text());
  },
  // look for wiki.enc next to the app; unlock silently if the password is remembered
  async check() {
    let enc;
    try { const r = await fetch("wiki.enc", { cache: "no-store" }); if (!r.ok) return; enc = await r.json(); if (enc.format !== "dnd-builder-wiki-v1") return; } catch (e) { return; }
    S.ui.wikiEnc = enc;
    if (S.wiki && S.wiki._encTag === enc.iv) { S.ui.wikiEncState = "current"; return; }
    S.ui.wikiEncState = "locked";
    let pw = null; try { pw = localStorage.getItem("wikiPw"); } catch (e) { }
    if (pw) { try { await this.unlock(pw, true); } catch (e) { } }
  },
  async unlock(pw, remember) {
    const enc = S.ui.wikiEnc; const w = await this.decrypt(enc, pw);
    w._encTag = enc.iv; await storeSetWiki(w, true);
    try { remember ? localStorage.setItem("wikiPw", pw) : localStorage.removeItem("wikiPw"); } catch (e) { }
    S.ui.wikiEncState = "current";
  }
};

async function storeSetWiki(w, fromRemote) {
  w._updated = fromRemote ? (w._updated || Date.now()) : Date.now();
  await DB.set("wiki", w);
  S.wiki = w; buildIndex();
  if (!fromRemote) Sync.soon();
}

// ---------- characters folder on the laptop (when started with run.py) ----------
const Folder = {
  timers: {},
  push(c) {
    if (!S.server || !c) return;
    clearTimeout(this.timers[c.id]);
    const data = JSON.parse(JSON.stringify(c));
    this.timers[c.id] = setTimeout(() => fetch("api/characters/" + encodeURIComponent(c.id), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).catch(() => { }), 400);
  },
  async remove(id) { if (S.server) await fetch("api/characters/" + encodeURIComponent(id), { method: "DELETE" }).catch(() => { }); },
  // two-way: newer version wins; files only on disk come in, characters only in the app go out
  async pull() {
    if (!S.server) return 0;
    let n = 0;
    try {
      const list = await (await fetch("api/characters", { cache: "no-store" })).json();
      const tomb = (await DB.get("tombstones")) || {};
      const onDisk = new Set();
      for (const it of list) {
        onDisk.add(it.id);
        if (tomb[it.id]) { await this.remove(it.id); continue; }
        const local = await DB.getChar(it.id);
        if (!local || (it.updated || 0) > (local._updated || 0)) {
          const c = await (await fetch("api/characters/" + encodeURIComponent(it.id), { cache: "no-store" })).json();
          if (!c.id) c.id = it.id;
          migrate(c); if (!c._updated) c._updated = Date.now();
          if (local) { c._driveId = local._driveId; c._syncedAt = local._syncedAt; }
          await DB.putChar(c); n++;
          if (S.char?.id === c.id) S.char = c;
          if (!local || (it.updated || 0) === 0) this.push(c);   // rewrite old-format files with a proper name
        } else if ((local._updated || 0) > (it.updated || 0)) this.push(local);
      }
      for (const c of await DB.allChars()) if (!onDisk.has(c.id)) this.push(c);
    } catch (e) { }
    return n;
  }
};

// ---------- local Python server (laptop) detection ----------
async function detectServer() {
  try { const r = await fetch("api/import", { cache: "no-store" }); if (!r.ok) return false; const j = await r.json(); return typeof j.running === "boolean"; } catch (e) { return false; }
}

// ---------- Google Drive sync ----------
const Sync = {
  token: null, exp: 0, status: "off", msg: "", timer: null, busy: false, client: null, last: 0,
  clientId() { return (S.settings && S.settings.clientId) || window.GOOGLE_CLIENT_ID || ""; },
  enabled() { return !!(S.settings && S.settings.sync && this.clientId()); },
  setStatus(st, msg) { this.status = st; this.msg = msg || ""; renderSyncChip(); },
  loadToken() { try { const t = JSON.parse(localStorage.getItem("gtoken") || "null"); if (t && t.exp > Date.now() + 60000) { this.token = t.token; this.exp = t.exp; } } catch (e) { } },
  hasToken() { return this.token && this.exp > Date.now() + 30000; },
  loadGis() {
    if (window.google?.accounts?.oauth2) return Promise.resolve();
    return new Promise((res, rej) => { const s = document.createElement("script"); s.src = "https://accounts.google.com/gsi/client"; s.onload = res; s.onerror = () => rej(new Error("Could not load Google sign-in (offline?)")); document.head.appendChild(s); });
  },
  // must be called from a click (opens Google popup)
  async connect() {
    if (!this.clientId()) { toast("Enter your Google Client ID first"); return; }
    try { await this.loadGis(); } catch (e) { this.setStatus("error", e.message); return; }
    return new Promise(res => {
      const tc = google.accounts.oauth2.initTokenClient({
        client_id: this.clientId(), scope: "https://www.googleapis.com/auth/drive.appdata",
        callback: async r => {
          if (r.error) { this.setStatus("error", r.error); return res(); }
          this.token = r.access_token; this.exp = Date.now() + (r.expires_in || 3600) * 1000;
          try { localStorage.setItem("gtoken", JSON.stringify({ token: this.token, exp: this.exp })); } catch (e) { }
          S.settings.sync = true; await DB.set("settings", S.settings);
          await this.run(); res();
        },
        error_callback: e => { this.setStatus("error", e.type === "popup_closed" ? "Sign-in cancelled" : (e.message || e.type)); res(); }
      });
      tc.requestAccessToken({ prompt: S.settings.connectedOnce ? "" : "consent" });
      S.settings.connectedOnce = true; DB.set("settings", S.settings);
    });
  },
  disconnect() { this.token = null; this.exp = 0; try { localStorage.removeItem("gtoken"); } catch (e) { } S.settings.sync = false; DB.set("settings", S.settings); this.setStatus("off"); },
  soon(ms = 2500) { if (!this.enabled()) return; clearTimeout(this.timer); this.timer = setTimeout(() => this.run(), ms); },
  async api(method, url, body, headers = {}) {
    const r = await fetch(url, { method, body, headers: { Authorization: "Bearer " + this.token, ...headers } });
    if (r.status === 401) { this.token = null; throw new Error("auth"); }
    if (!r.ok) throw new Error(method + " " + r.status + " " + (await r.text()).slice(0, 200));
    return r;
  },
  async list() {
    const files = []; let page = "";
    do {
      const r = await this.api("GET", "https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&pageSize=1000&fields=nextPageToken,files(id,name,modifiedTime,appProperties)" + (page ? "&pageToken=" + page : ""));
      const j = await r.json(); files.push(...j.files); page = j.nextPageToken || "";
    } while (page);
    return files;
  },
  async download(id) { return (await this.api("GET", `https://www.googleapis.com/drive/v3/files/${id}?alt=media`)).json(); },
  async upload(name, obj, updated, id) {
    const meta = { name, appProperties: { updated: String(updated) } };
    if (!id) meta.parents = ["appDataFolder"];
    const bnd = "b" + Math.random().toString(36).slice(2);
    const body = new Blob([`--${bnd}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${bnd}\r\nContent-Type: application/json\r\n\r\n`, JSON.stringify(obj), `\r\n--${bnd}--`]);
    const url = id ? `https://www.googleapis.com/upload/drive/v3/files/${id}?uploadType=multipart` : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
    return (await this.api(id ? "PATCH" : "POST", url, body, { "Content-Type": "multipart/related; boundary=" + bnd })).json();
  },
  async remove(id) { await this.api("DELETE", `https://www.googleapis.com/drive/v3/files/${id}`); },

  async run() {
    if (!this.enabled() || this.busy) return;
    if (!navigator.onLine) { this.setStatus("offline", "Offline — will sync later"); return; }
    if (!this.hasToken()) { this.setStatus("signin", "Tap to reconnect Google Drive"); return; }
    this.busy = true; this.setStatus("syncing");
    let changedOpen = false, changes = 0;
    try {
      if (S.char) await DB.putChar(JSON.parse(JSON.stringify(S.char)));   // make sure latest edits are stored
      const remote = await this.list();
      const rmap = {}; remote.forEach(f => rmap[f.name] = f);
      // --- wiki data ---
      const lw = await DB.get("wiki"); const rw = rmap["wiki.json"];
      const lwu = lw?._updated || 0, rwu = +(rw?.appProperties?.updated || 0);
      if (rw && rwu > lwu) { this.setStatus("syncing", "Downloading rules text…"); const w = await this.download(rw.id); w._updated = rwu; await storeSetWiki(w, true); changes++; }
      else if (lw && Object.keys(lw.pages || {}).length && lwu > rwu) { this.setStatus("syncing", "Uploading rules text…"); await this.upload("wiki.json", lw, lwu, rw?.id); }
      // --- characters ---
      const tomb = (await DB.get("tombstones")) || {};
      const local = await DB.allChars();
      const seen = new Set();
      for (const c of local) {
        const name = "char_" + c.id + ".json"; seen.add(name);
        const r = rmap[name]; const ru = +(r?.appProperties?.updated || 0); const lu = c._updated || 0;
        if (!r) {
          if (c._syncedAt && lu <= c._syncedAt) { await DB.delChar(c.id); changes++; if (S.char?.id === c.id) { S.char = null; S.view = "home"; } }  // deleted on other device
          else { const f = await this.upload(name, c, lu); c._syncedAt = lu; c._driveId = f.id; await DB.putChar(c); }
        } else if (ru > lu) {
          const rc = await this.download(r.id); rc._updated = ru; rc._syncedAt = ru; rc._driveId = r.id; await DB.putChar(rc); changes++;
          if (S.char?.id === c.id) { S.char = rc; migrate(S.char); changedOpen = true; }
        } else if (lu > ru) {
          await this.upload(name, c, lu, r.id); c._syncedAt = lu; c._driveId = r.id; await DB.putChar(c);
        } else if (c._syncedAt !== lu) { c._syncedAt = lu; await DB.putChar(c); }
      }
      for (const f of remote) {
        if (!f.name.startsWith("char_") || seen.has(f.name)) continue;
        const id = f.name.slice(5, -5);
        if (tomb[id]) { await this.remove(f.id); delete tomb[id]; continue; }
        const rc = await this.download(f.id); const ru = +(f.appProperties?.updated || 0);
        rc._updated = ru; rc._syncedAt = ru; rc._driveId = f.id; await DB.putChar(rc); changes++;
      }
      for (const id in tomb) if (!rmap["char_" + id + ".json"]) delete tomb[id];
      await DB.set("tombstones", tomb);
      this.last = Date.now();
      this.setStatus("ok", "Synced " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      if (changes) {
        S.chars = await storeListChars();
        const typing = document.activeElement && ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName);
        if ((S.view === "home" || changedOpen) && !S.modal && !typing) render();
      }
    } catch (e) {
      if (e.message === "auth") this.setStatus("signin", "Tap to reconnect Google Drive");
      else this.setStatus("error", e.message);
    } finally { this.busy = false; }
  }
};

function renderSyncChip() {
  const el = document.getElementById("syncchip"); if (!el) return;
  const st = Sync.status;
  if (!Sync.enabled() && st !== "error") { el.innerHTML = ""; return; }
  const icon = { ok: "☁✓", syncing: "☁…", signin: "☁!", offline: "☁✕", error: "☁!" }[st] || "☁";
  el.innerHTML = `<button class="ghost small ${st === "signin" || st === "error" ? "warnbtn" : ""}" data-act="syncTap" title="${esc(Sync.msg || st)}">${icon}<span class="synctxt"> ${esc(st === "ok" ? "Synced" : st === "syncing" ? "Syncing" : st === "signin" ? "Reconnect" : st === "offline" ? "Offline" : "Sync error")}</span></button>`;
}

// periodic + on focus
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") { Sync.soon(300); Folder.pull().then(n => { if (n && S.view === "home") loadChars().then(render); }); } else if (S.char) { DB.putChar(JSON.parse(JSON.stringify(S.char))); Sync.run(); } });
window.addEventListener("online", () => Sync.soon(500));
setInterval(() => { if (document.visibilityState === "visible" && Date.now() - Sync.last > 45000) Sync.run(); }, 15000);
