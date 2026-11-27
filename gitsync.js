"use strict";
/* ============ GitHub sync: characters live as JSON files in a (private) GitHub repo ============
   Every device with the same repo + token sees the same characters. Newest change wins per character.
   Repo layout:  <folder>/index.json  = { chars: { id: { u: updated, path, name, sha } }, deleted: { id: time } }
                 <folder>/<name>_<id>.json = the character (pictures included as data URLs)
   The token is stored only on this device (localStorage), never in the app's own repo. */
const GitSync = {
  status: "off", msg: "", busy: false, timer: null, last: 0,
  cfg() { try { return JSON.parse(localStorage.getItem("gitsync") || "null") || {}; } catch (e) { return {}; } },
  saveCfg(c) { try { localStorage.setItem("gitsync", JSON.stringify(c)); } catch (e) { } },
  enabled() { const c = this.cfg(); return !!(c.on && c.repo && c.token); },
  setStatus(st, msg) { this.status = st; this.msg = msg || ""; if (typeof renderSyncChip === "function") renderSyncChip(); const el = document.getElementById("gitstatus"); if (el) el.textContent = this.msg || st; },
  soon(ms = 2500) { if (!this.enabled()) return; clearTimeout(this.timer); this.timer = setTimeout(() => this.run(), ms); },
  base() { const c = this.cfg(); return `https://api.github.com/repos/${c.repo.trim().replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "").replace(/\/$/, "")}/contents/`; },
  folder() { return (this.cfg().folder || "characters").replace(/^\/+|\/+$/g, ""); },
  branch() { return this.cfg().branch || "main"; },
  async api(method, path, body, raw) {
    const c = this.cfg();
    const url = this.base() + path.split("/").map(encodeURIComponent).join("/") + (method === "GET" ? `?ref=${encodeURIComponent(this.branch())}&t=${Date.now()}` : "");
    const r = await fetch(url, { method, cache: "no-store", headers: { Authorization: "Bearer " + c.token.trim(), Accept: raw ? "application/vnd.github.raw+json" : "application/vnd.github+json", ...(body ? { "Content-Type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined });
    if (r.status === 404 && method === "GET") return null;
    if (r.status === 401) throw new Error("The token was refused — check it (and that it hasn't expired).");
    if (r.status === 403) throw new Error("No permission — the token needs Contents: Read and write for this repo.");
    if (r.status === 409 || r.status === 422) { const e = new Error("conflict"); e.conflict = true; throw e; }
    if (!r.ok) throw new Error(method + " " + r.status + ": " + (await r.text()).slice(0, 160));
    return raw ? r.json() : r.json();
  },
  b64(str) { const b = new TextEncoder().encode(str); let s = ""; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(s); },
  unb64(s) { const bin = atob(String(s).replace(/\s/g, "")); const b = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i); return new TextDecoder().decode(b); },
  slug(n) { return String(n || "character").normalize("NFKD").replace(/[^\w\- ]+/g, "").trim().replace(/ +/g, "_").slice(0, 40) || "character"; },
  async put(path, text, sha, msg) { return this.api("PUT", path, { message: msg, content: this.b64(text), branch: this.branch(), ...(sha ? { sha } : {}) }); },
  async del(path, sha, msg) { if (sha) return this.api("DELETE", path, { message: msg, sha, branch: this.branch() }); },
  clean(c) { const x = JSON.parse(JSON.stringify(c)); delete x._driveId; delete x._syncedAt; return x; },

  async run(retry = 0) {
    if (!this.enabled() || this.busy) return;
    if (!navigator.onLine) { this.setStatus("offline", "Offline — will sync later"); return; }
    this.busy = true; this.setStatus("syncing", "Syncing…");
    let changes = 0, changedOpen = false;
    try {
      if (S.char) await DB.putChar(JSON.parse(JSON.stringify(S.char)));
      const F = this.folder(), ipath = F + "/index.json";
      const ifile = await this.api("GET", ipath);
      const idx = ifile ? JSON.parse(this.unb64(ifile.content)) : { chars: {}, deleted: {} };
      idx.chars ||= {}; idx.deleted ||= {};
      let dirty = !ifile;
      const tomb = (await DB.get("tombstones")) || {};
      const local = await DB.allChars(), have = new Set(local.map(c => c.id));
      // deleted on this device → delete in the repo
      for (const id in tomb) { const e = idx.chars[id]; if (e && !have.has(id)) { await this.del(e.path, e.sha, "Delete " + (e.name || id)); delete idx.chars[id]; idx.deleted[id] = tomb[id]; dirty = true; } }
      for (const c of local) {
        const e = idx.chars[c.id], lu = c._updated || 0;
        if (!e && idx.deleted[c.id]) {
          if (lu <= idx.deleted[c.id]) { await DB.delChar(c.id); changes++; if (S.char?.id === c.id) { S.char = null; S.view = "home"; } continue; }   // deleted on another device
          delete idx.deleted[c.id];   // edited here after the deletion → keep it
        }
        if (!e || lu > e.u) {   // upload
          this.setStatus("syncing", "Uploading " + (c.name || "character") + "…");
          const path = F + "/" + this.slug(c.name) + "_" + c.id + ".json";
          if (e && e.path !== path) await this.del(e.path, e.sha, "Rename " + (c.name || c.id));
          const r = await this.put(path, JSON.stringify(this.clean(c), null, 1), e && e.path === path ? e.sha : undefined, (e ? "Update " : "Add ") + (c.name || c.id));
          idx.chars[c.id] = { u: lu, path, name: c.name || "", sha: r.content.sha }; dirty = true;
        } else if (e.u > lu) {   // download
          this.setStatus("syncing", "Downloading " + (e.name || "character") + "…");
          const rc = await this.api("GET", e.path, null, true); if (!rc) continue;
          migrate(rc); rc._updated = e.u; if (c._driveId) { rc._driveId = c._driveId; rc._syncedAt = c._syncedAt; }
          await DB.putChar(rc); await this.merge(rc); changes++;
          if (S.char?.id === c.id) { S.char = rc; changedOpen = true; }
        }
      }
      // characters only in the repo → download
      for (const id in idx.chars) {
        if (have.has(id)) continue;
        if (tomb[id]) continue;   // handled above
        const e = idx.chars[id]; this.setStatus("syncing", "Downloading " + (e.name || "character") + "…");
        const rc = await this.api("GET", e.path, null, true); if (!rc) continue;
        if (!rc.id) rc.id = id; migrate(rc); rc._updated = e.u; await DB.putChar(rc); await this.merge(rc); changes++;
      }
      if (dirty) await this.put(ipath, JSON.stringify(idx, null, 1), ifile?.sha, "Sync characters (" + (navigator.userAgent.match(/iPad|iPhone|Android|Windows|Mac/)?.[0] || "device") + ")");
      this.last = Date.now();
      this.setStatus("ok", "Synced with GitHub " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      if (changes) {
        S.chars = await storeListChars();
        const typing = document.activeElement && ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName);
        if ((S.view === "home" || changedOpen) && !S.modal && !typing) render();
      }
    } catch (e) {
      if (e.conflict && retry < 2) { this.busy = false; return this.run(retry + 1); }   // another device wrote at the same moment
      this.setStatus("error", e.conflict ? "Another device was syncing — try again" : e.message);
    } finally { this.busy = false; }
  },
  async merge(c) { try { if (typeof mergeCustomItems === "function") await mergeCustomItems(c); if (typeof mergeCustomSpells === "function") await mergeCustomSpells(c); } catch (e) { } }
};

// hook into every save / delete (they already call Sync.soon), plus on focus and every few minutes
(function () {
  const soon = Sync.soon.bind(Sync);
  Sync.soon = ms => { soon(ms); GitSync.soon(ms); };
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") GitSync.soon(400); });
  window.addEventListener("online", () => GitSync.soon(500));
  setInterval(() => { if (document.visibilityState === "visible" && Date.now() - GitSync.last > 90000) GitSync.run(); }, 20000);
  setTimeout(() => GitSync.soon(800), 1500);
  // a locked sync setup next to the app (gitsync.enc) → offer "connect with a password"
  // (phones sometimes save it as gitsync.enc.json — both names work)
  fetch("gitsync.enc", { cache: "no-store" }).then(r => r.ok ? r : fetch("gitsync.enc.json", { cache: "no-store" })).then(r => r.ok ? r.json() : null).then(e => { if (e && e.format === "dnd-builder-gitsync-v1") { S.ui.gitEnc = e; if (S.view === "home" && !GitSync.enabled()) render(); } }).catch(() => { });
})();

function gitSyncCard() {
  const c = GitSync.cfg(), on = GitSync.enabled();
  return `<div class="card">
    <h3>GitHub sync <span class="chip">optional</span></h3>
    <p class="small">Keeps your characters (with their pictures) in a GitHub repo, so your phone, iPad and anyone you give access see the same characters. Use a <b>private</b> repo and a token that can only reach that repo.</p>
    ${on ? `<p>Sync is <b>on</b> → <b>${esc(c.repo)}</b> <span class="small muted">(${esc(GitSync.folder())}/, branch ${esc(GitSync.branch())})</span><br><span class="small" id="gitstatus">${esc(GitSync.msg || GitSync.status)}</span></p>
      <div class="row"><button data-act="gitNow">Sync now</button><button class="ghost" data-act="gitEdit">Change settings</button><button class="ghost" data-act="gitOff">Turn off</button></div>
      <details class="small" style="margin-top:10px"><summary><b>🔒 Other devices: connect with just a password</b></summary>
        <p>Makes <code>gitsync.enc</code> — the repo name and token, locked with a password. Put it into the app's own GitHub repo (next to <code>wiki.enc</code>, or send it to Claude to upload). Then on any other device you only type the password in this card. Choose a strong password: the file is public, only the password protects the token.</p>
        <div class="row"><input id="git_pw" type="password" placeholder="Password" autocomplete="new-password"><button class="small" data-act="gitMakeEnc">Create gitsync.enc</button></div></details>`
    : `${S.ui.gitEnc ? `<div class="lvl" style="margin-bottom:10px"><b>Quick connect</b> <span class="small muted">— this app has a locked sync setup; type its password</span>
        <div class="row" style="margin-top:6px"><input id="git_unlock" type="password" placeholder="Password" autocomplete="current-password"><button data-act="gitUnlock">Unlock &amp; sync</button></div></div>
        <p class="small muted">…or enter the details yourself:</p>` : ""}
      <div class="grid g2">
        <label>Repository (owner/name)<br><input id="git_repo" value="${esc(c.repo || "")}" placeholder="K-Tut/dnd-characters" style="width:100%"></label>
        <label>Access token<br><input id="git_token" type="password" value="${esc(c.token || "")}" placeholder="github_pat_…" style="width:100%" autocomplete="off"></label>
        <label>Branch<br><input id="git_branch" value="${esc(c.branch || "main")}" style="width:100%"></label>
        <label>Folder in the repo<br><input id="git_folder" value="${esc(c.folder || "characters")}" style="width:100%"></label></div>
      <div class="row" style="margin-top:8px"><button data-act="gitOn">Connect &amp; sync</button></div>
      ${GitSync.status === "error" ? `<p class="warn small">${esc(GitSync.msg)}</p>` : ""}
      <details class="small" style="margin-top:8px"><summary>How do I get a token?</summary>
        <ol><li>On github.com create a new <b>private</b> repository, e.g. <i>dnd-characters</i> (tick “Add a README” so it isn't empty).</li>
        <li>Open <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener"><b>github.com/settings/personal-access-tokens/new</b></a> (signed in). On a phone it's easier on a laptop or in “desktop site” mode. (Same place by hand: your profile picture → Settings → at the very bottom of the left menu “Developer settings” → Personal access tokens → Fine-grained tokens.)</li>
        <li>Repository access: <b>Only select repositories</b> → your characters repo. Permissions → Repository → <b>Contents: Read and write</b>. Pick an expiry date.</li>
        <li>Copy the token and paste it here — on each of your devices. It stays on the device and is never put into the app's code.</li></ol>
        <p>Anyone you give the token to can read and change the characters in that repo.</p></details>`}
  </div>`;
}
const GIT_ACT = {
  gitOn: async () => {
    const v = id => (document.getElementById(id)?.value || "").trim();
    const cfg = { repo: v("git_repo"), token: v("git_token"), branch: v("git_branch") || "main", folder: v("git_folder") || "characters", on: true };
    if (!/^[\w.-]+\/[\w.-]+$/.test(cfg.repo.replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "").replace(/\/$/, ""))) return toast("Repository must look like owner/name");
    if (!cfg.token) return toast("Paste your access token");
    GitSync.saveCfg(cfg); render(); await GitSync.run(); if (GitSync.status === "error") { GitSync.saveCfg({ ...cfg, on: false }); } render();
  },
  gitMakeEnc: async () => {
    const pw = (document.getElementById("git_pw")?.value || ""); if (pw.length < 8) return toast("Use a password with at least 8 characters");
    const c = GitSync.cfg(); const txt = (await WikiLock.encrypt({ repo: c.repo, token: c.token, branch: c.branch, folder: c.folder }, pw)).replace("dnd-builder-wiki-v1", "dnd-builder-gitsync-v1");
    if (typeof shareFile === "function") await shareFile("gitsync.enc", txt, "gitsync.enc", "application/octet-stream");
    else { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([txt])); a.download = "gitsync.enc"; a.click(); }
    toast("Saved gitsync.enc — upload it to the app's GitHub repo");
  },
  gitUnlock: async () => {
    const pw = document.getElementById("git_unlock")?.value || ""; if (!pw) return;
    let cfg; try { cfg = await WikiLock.decrypt(S.ui.gitEnc, pw); } catch (e) { return toast("Wrong password"); }
    GitSync.saveCfg({ ...cfg, on: true }); render(); toast("Connected — syncing…"); await GitSync.run(); render();
  },
  gitNow: async () => { await GitSync.run(); render(); },
  gitEdit: () => { GitSync.saveCfg({ ...GitSync.cfg(), on: false }); GitSync.setStatus("off"); render(); },
  gitOff: () => { const c = GitSync.cfg(); GitSync.saveCfg({ repo: c.repo, branch: c.branch, folder: c.folder, on: false }); GitSync.setStatus("off"); render(); toast("GitHub sync turned off on this device"); }
};
