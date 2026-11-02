"use strict";
/* ============ At the DM's table: join with one of your characters (QR code from the DM Tool) ============
   - the DM sees your character's name, picture and sheet, and your rolls in their dice log
   - ⚔ Battlemap tab: the map the DM shares (you can move tokens)
   - 🎁 loot from the DM: claim, split coins, everybody presses OK → the items go straight into your character
   The connection runs over the internet (PeerJS / WebRTC) to the DM Tool page that shows the QR code. */
const PEERJS_SRC = "https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js";
const PCOLORS = ["#c92a2a", "#1971c2", "#2f9e44", "#9c36b5", "#e8590c", "#0c8599", "#5c940d", "#495057"];
const Party = {
  joined: null, peer: null, conn: null, status: "", state: null, imgs: {}, lastMsg: 0, mapKey: "", seenOffers: new Set(), open: {}, z: null, fit: true,
  pid() { let d = ""; try { d = localStorage.getItem("partyDev") || ""; if (!d) { d = Math.random().toString(36).slice(2, 9); localStorage.setItem("partyDev", d); } } catch (e) { } return "pc-" + (this.joined?.charId || "x") + "-" + d; },
  color(name) { let h = 0; for (const ch of String(name)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return PCOLORS[h % PCOLORS.length]; },
  me() { const c = S.char && S.char.id === this.joined?.charId ? S.char : null; return { pid: this.pid(), name: c?.name || this.joined?.name || "Player", color: this.color(c?.name || this.joined?.name || ""), img: c?.thumb || this.joined?.img || "", charId: this.joined?.charId }; }
};
function loadPeer() { return window.Peer ? Promise.resolve() : new Promise((res, rej) => { const s = document.createElement("script"); s.src = PEERJS_SRC; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
// what the DM can look at: the character without the big pictures
function sheetSnap(c) { const x = JSON.parse(JSON.stringify(c)); delete x.portrait; delete x.storyImage; delete x._driveId; delete x._syncedAt; return x; }
function partySend(m) { try { if (Party.conn && Party.conn.open) { Party.conn.send(m); return true; } } catch (e) { } return false; }
function partyRetry(msg) { Party.status = msg || "reconnecting…"; renderPartyChip(); clearTimeout(Party._rt); Party._rt = setTimeout(partyConnect, 3000); }
async function partyConnect() {
  if (!Party.joined) return;
  Party.status = "connecting…"; renderPartyChip();
  try { await loadPeer(); } catch (e) { return partyRetry("no internet?"); }
  if (!Party.peer || Party.peer.destroyed) {
    Party.peer = new Peer({ debug: 1, ...(window.PEER_OPTS || {}) });
    Party.peer.on("error", e => partyRetry(e.type === "peer-unavailable" ? "the DM is not online" : "reconnecting…"));
    Party.peer.on("disconnected", () => { try { Party.peer.reconnect(); } catch (e) { } });
    await new Promise(res => { if (Party.peer.open) res(); else Party.peer.on("open", res); setTimeout(res, 8000); });
  }
  try { Party.conn && Party.conn.close(); } catch (e) { }
  const c = Party.conn = Party.peer.connect(Party.joined.peer, { reliable: true });
  c.on("open", () => { Party.status = "at the table"; renderPartyChip(); partySendJoin(); partySend({ t: "hello" }); });
  c.on("data", m => { if (m && m.t === "state") { Party.lastMsg = Date.now(); partyState(m.s); } });
  c.on("close", () => { if (Party.conn === c) partyRetry(); });
  c.on("error", () => { if (Party.conn === c) partyRetry(); });
}
async function partySendJoin() {
  const c = S.char && S.char.id === Party.joined.charId ? S.char : await DB.getChar(Party.joined.charId);
  if (c) { Party.joined.name = c.name; Party.joined.img = c.thumb || ""; }
  partySend({ t: "join", p: Party.me() });
  if (c) partySend({ t: "sheet", sheet: sheetSnap(c) });
}
setInterval(() => { if (Party.joined && Party.lastMsg && Date.now() - Party.lastMsg > 40000) { Party.lastMsg = Date.now(); partyRetry(); } }, 5000);

// ---------- what the DM sends ----------
function partyState(s) {
  const prev = Party.state; Party.state = { ...s, image: s.image !== undefined ? s.image : prev?.image || "" };
  if (s.imgs) Party.imgs = s.imgs;
  const key = s.active ? s.mapId + ":" + s.imageRev : "";
  if (key && key !== Party.mapKey) { if (S.view !== "table") { Party.mapNew = true; toast("🗺 The DM shared a battlemap — open ⚔ Battlemap"); if (!S.modal && !document.querySelector("input:focus, textarea:focus")) render(); } Party.fit = true; }
  Party.mapKey = key;
  // new loot → open the loot window; finished loot → straight into the character
  const mine = (s.offers || []).filter(o => o.kind !== "player" || o.to === Party.pid());
  if (mine.some(o => !Party.seenOffers.has(o.id) && !o.done)) { mine.forEach(o => Party.seenOffers.add(o.id)); if (S.modal?.type !== "party") openModal({ type: "party" }); }
  mine.forEach(o => Party.seenOffers.add(o.id));
  mine.filter(o => o.done || o.kind === "player").forEach(partyAutoAdd);
  if (S.view === "table" && !Party.dragging) drawPartyMap();
  if (S.modal?.type === "party") renderModal();
  renderPartyChip();
}
function partyAdded() { try { return JSON.parse(localStorage.getItem("partyAdded") || "[]"); } catch (e) { return []; } }
async function partyAutoAdd(o) {
  const done = partyAdded(); if (done.includes(o.id)) return;
  const pid = Party.pid(), items = (o.items || []).filter(it => o.claims[it.id] === pid), coins = o.shares ? o.shares[pid] : (o.kind === "player" ? o.coins : null);
  if (!items.length && !Object.values(coins || {}).some(v => +v)) { if (o.done) { done.push(o.id); try { localStorage.setItem("partyAdded", JSON.stringify(done)); } catch (e) { } } return; }
  done.push(o.id); try { localStorage.setItem("partyAdded", JSON.stringify(done)); } catch (e) { }
  const own = S.char && S.char.id === Party.joined.charId, c = own ? S.char : await DB.getChar(Party.joined.charId); if (!c) return;
  migrate(c); c.items ||= []; c.weapons ||= []; c.coins ||= {};
  items.forEach(it => {
    c.items.push({ name: it.name, qty: +it.qty || 1, note: [it.rarity, it.attune ? "requires attunement" : "", it.value ? it.value + " gp" : ""].filter(Boolean).join(", "), desc: [it.desc, it.identified && it.curse ? "Curse: " + it.curse : ""].filter(Boolean).join("\n\n"), img: it.img || "" });
    if (it.weapon && WEAPONS.some(w => w.name === it.weapon.base)) c.weapons.push({ name: it.name, base: it.weapon.base, magic: +it.weapon.magic || 0, extra: it.weapon.extra || "" });
  });
  for (const k in coins || {}) c.coins[k] = (+c.coins[k] || 0) + (+coins[k] || 0);
  if (own) save(true); else await storeSaveChar(c);
  render(); toast(`🎁 Added to ${c.name}: ${[items.map(i => i.name).join(", "), Object.entries(coins || {}).filter(([, v]) => +v).map(([k, v]) => v + " " + k).join(" ")].filter(Boolean).join(" + ")}`);
}

// ---------- your rolls go to the DM's dice log ----------
function rollSummary(h, l) {
  const kept = l.res.filter(r => !r.dropped), dropped = l.res.filter(r => r.dropped);
  let detail = kept.map((r, i) => (i ? (r.sign < 0 ? " − " : " + ") : r.sign < 0 ? "−" : "") + r.v).join("") + (l.flat ? ` ${l.flat < 0 ? "−" : "+"} ${Math.abs(l.flat)}` : "");
  const mode = /\(Advantage\)/.test(h.title) ? "advantage" : /\(Disadvantage\)/.test(h.title) ? "disadvantage" : /\(Critical\)/.test(h.title) ? "critical" : "";
  const note = [mode, dropped.length ? "dropped " + dropped.map(r => r.v).join(", ") : ""].filter(Boolean).join(", ");
  return { title: h.title, total: h.total, detail, note, crit: !!h.crit, fumble: !!h.fumble, split: h.split || null };
}
(function hookDice() {
  if (typeof Dice === "undefined") return setTimeout(hookDice, 50);
  const orig = Dice.roll;
  Dice.roll = function () { const r = orig.apply(this, arguments); if (Party.joined && this.history[0] && this.lastRoll) partySend({ t: "roll", r: rollSummary(this.history[0], this.lastRoll) }); return r; };
})();
// keep the DM's copy of your sheet up to date
const _partySave = save;
save = function (now) { const r = _partySave(now); if (Party.joined && S.char && S.char.id === Party.joined.charId) { clearTimeout(Party._st); Party._st = setTimeout(() => partySend({ t: "sheet", sheet: sheetSnap(S.char) }), 1500); } return r; };

// ---------- battlemap tab ----------
function renderPartyTable() {
  const s = Party.state;
  return `<div class="card ptcard"><div class="row"><h3 style="margin:0;flex:1">⚔ ${s?.active ? esc(s.name || "Battlemap") : "Battlemap"}</h3><span class="small muted">${esc(Party.status)}</span>
      <button class="small ghost" data-act="ptZoom" data-d="0.8">−</button><button class="small ghost" data-act="ptZoom" data-d="fit">Fit</button><button class="small ghost" data-act="ptZoom" data-d="1.25">+</button></div>
    ${s?.active ? `<div id="ptmap" class="mapbox ptmap"></div><p class="small muted" style="margin:6px 0 0">Drag your token to move it — everybody sees it.</p>` : `<p class="muted" style="padding:30px 0;text-align:center">No battlemap shared right now. You'll get a message when the DM shares one.</p>`}</div>`;
}
function drawPartyMap() {
  const host = document.getElementById("ptmap"), s = Party.state; if (!host || !s?.active || !s.image) return;
  if (Party.fit || Party.z == null) Party.z = MapView.fitZoom(host, s);
  const sl = host.scrollLeft, st = host.scrollTop;
  host.innerHTML = MapView.html(s, Party.z, { dm: false, img: t => t.ref ? Party.imgs[t.ref] || "" : "" });
  host.scrollLeft = sl; host.scrollTop = st;
}
let ptBound = false;
function bindPartyMap() {
  if (ptBound) return; ptBound = true;
  const proxy = { addEventListener: (type, fn) => document.addEventListener(type, ev => { if (type === "pointerdown" && !ev.target.closest("#ptmap")) return; if (type === "pointerdown") Party.dragging = true; fn(ev); }) };
  proxy.querySelector = s => document.getElementById("ptmap")?.querySelector(s);
  MapView.bind(proxy, () => ({ map: Party.state, z: Party.z }), (id, x, y) => { const t = Party.state.tokens.find(k => k.id === id); if (t) { t.x = x; t.y = y; } drawPartyMap(); partySend({ t: "move", id, x, y }); }, null);
  document.addEventListener("pointerup", () => setTimeout(() => { Party.dragging = false; }, 60));
}

// ---------- loot window ----------
const coinStr = c => ["pp", "gp", "ep", "sp", "cp"].filter(k => +(c || {})[k]).map(k => `${c[k]} ${k}`).join(", ");
function pAv(p) { return `<span class="pav" style="background:${esc(p.color || "#888")}" title="${esc(p.name || "")}">${p.img ? `<img src="${esc(p.img)}" alt="">` : esc((p.name || "?")[0])}</span>`; }
function mParty() {
  const s = Party.state || {}, pid = Party.pid(), pl = id => (s.players || []).find(p => p.pid === id) || { name: "?", color: "#888" };
  const list = (s.offers || []).filter(o => o.kind !== "player" || o.to === pid);
  const RC = { common: "#6b6b6b", uncommon: "#2f7d4a", rare: "#1f4e8e", "very rare": "#6b2f8e", legendary: "#b8641a", artifact: "#8e1f1f" };
  return `<h2>🎁 From the DM</h2>${list.map(o => {
    const items = o.items || [], share = o.shares ? o.shares[pid] : null, added = partyAdded().includes(o.id);
    return `<div class="card" style="margin:8px 0"><div class="row"><b style="flex:1">${o.kind === "player" ? "For you: " : ""}${esc(o.title || "Loot")}</b>${o.done || o.kind === "player" ? `<span class="chip acc">${added ? "✔ added to your character" : "✔ shared out"}</span>` : ""}</div>
      ${coinStr(o.coins) ? `<p class="small" style="margin:4px 0"><b>Coins:</b> ${coinStr(o.coins)}${o.shares ? ` · <b>your share:</b> ${coinStr(share) || "nothing"}${coinStr(o.leftover) ? ` (left over: ${coinStr(o.leftover)})` : ""}` : ""}${o.kind !== "player" && !o.done ? ` <button class="small ghost" data-act="ptAct" data-a="split" data-o="${o.id}">⚖ Split coins evenly</button>` : ""}</p>` : ""}
      ${items.map(it => { const who = o.claims[it.id], op = Party.open[o.id + it.id];
        return `<div class="feat"><div class="h" data-act="ptTog" data-k="${o.id + it.id}">${it.img ? `<img src="${it.img}" style="width:40px;height:40px;object-fit:cover;border-radius:6px">` : it.kind === "magic" ? "✨" : it.kind === "gem" ? "💎" : it.kind === "art" ? "🏺" : "🎒"}<b style="flex:1">${esc(it.name)}${+it.qty > 1 ? " ×" + it.qty : ""}</b>
          ${it.rarity ? `<span class="chip" style="background:${RC[it.rarity] || "#555"};color:#fff">${esc(it.rarity)}</span>` : ""}${who ? pAv(pl(who)) : ""}<span class="muted">${op ? "▾" : "▸"}</span></div>
          ${op ? `<div class="body"><div class="desc small">${para(it.desc || "No description.")}${it.cursed && it.identified ? `<p class="warn"><b>Cursed!</b> ${esc(it.curse || "")}</p>` : ""}</div>
            <div class="row" style="margin-top:6px">${o.kind !== "player" && !o.done ? `<button class="small ${who === pid ? "ghost" : ""}" data-act="ptAct" data-a="claim" data-o="${o.id}" data-i="${it.id}">${who === pid ? "Give it back" : who ? "Take it instead" : "I take this"}</button>` : ""}
              ${it.kind === "magic" && !it.identified ? `<button class="small ghost" data-act="ptAct" data-a="identify" data-o="${o.id}" data-i="${it.id}">🔍 Identify</button>` : ""}</div></div>` : ""}</div>`; }).join("")}
      ${o.kind !== "player" ? `<div class="row small" style="margin-top:6px">Everybody presses OK: ${(o.members || []).map(p => `<span class="chip ${o.oks[p] ? "acc" : ""}">${esc(pl(p).name)}${o.oks[p] ? " ✓" : ""}</span>`).join("")}</div>
        ${!o.done ? `<div class="row" style="justify-content:flex-end"><button data-act="ptAct" data-a="ok" data-o="${o.id}">${o.oks[pid] ? "Wait, not yet" : "✔ OK, fine with me"}</button></div>` : ""}` : ""}</div>`;
  }).join("") || '<p class="muted">Nothing from the DM right now.</p>'}<p class="small muted">${esc(Party.joined ? "Connection: " + Party.status : "")}</p><div class="foot"><button class="ghost" data-act="partyLeave" style="margin-right:auto">Leave the table</button><button data-act="modalClose">Close</button></div>`;
}

// ---------- joining ----------
function mJoin() {
  const chars = S.chars || [];
  return `<h2>⚔ Join the DM's table</h2><p>Which character do you play? The DM sees its name, picture and sheet, and your dice rolls.</p>
    ${chars.length ? `<div class="grid gauto">${chars.map(c => `<div class="pick ${S.modal.cid === c.id ? "on" : ""}" data-act="joinPick" data-id="${esc(c.id)}">${c.thumb ? `<img src="${c.thumb}" style="width:44px;height:44px;border-radius:50%;object-fit:cover">` : "🛡"} <b>${esc(c.name)}</b><span class="small muted">${esc(c.summary || "")}</span></div>`).join("")}</div>`
      : '<p class="warn">You have no characters on this device yet — make one first.</p>'}
    <div class="foot"><button class="ghost" data-act="joinCancel">Cancel</button>${chars.length ? `<button data-act="joinGo" ${S.modal.cid ? "" : "disabled"}>Join with this character</button>` : ""}</div>`;
}
function partyStart(j) { Party.joined = j; try { sessionStorage.setItem("partyJoin", JSON.stringify(j)); } catch (e) { } partyConnect(); render(); }
function partyLeave() { Party.joined = null; try { sessionStorage.removeItem("partyJoin"); } catch (e) { } try { Party.conn && Party.conn.close(); } catch (e) { } Party.conn = null; Party.state = null; if (S.view === "table") S.view = "sheet"; render(); }
function checkJoin() {
  const m = location.hash.match(/^#join=([\w-]+)/);
  if (m) { try { history.replaceState(null, "", location.pathname + location.search); } catch (e) { } openModal({ type: "join", peer: m[1], cid: Party.joined?.charId || "" }); return; }
  let j = null; try { j = JSON.parse(sessionStorage.getItem("partyJoin") || "null"); } catch (e) { }
  if (j && !Party.joined) partyStart(j);
}
function renderPartyChip() {
  const el = document.getElementById("partychip"); if (!el) return;
  if (!Party.joined) { el.innerHTML = ""; return; }
  const n = (Party.state?.offers || []).filter(o => (o.kind !== "player" || o.to === Party.pid()) && !o.done).length;
  el.innerHTML = `<button class="small ghost pchipbtn" data-act="partyLoot" title="At the DM's table (${esc(Party.status)}) — loot from the DM">🎁<i class="pdotst" style="background:${Party.status === "at the table" ? "#2f9e44" : "#f08c00"}"></i>${n ? `<span class="pbadge">${n}</span>` : ""}</button>`;
}
Object.assign(ACT, {
  joinPick: el => { S.modal.cid = el.dataset.id; renderModal(); },
  joinCancel: () => closeModal(),
  joinGo: async () => { const id = S.modal.cid, peer = S.modal.peer; closeModal(); partyStart({ peer, charId: id }); await openChar(id); S.view = "table"; render(); toast("Joining the DM's table…"); },
  partyLeave: (el, e) => { e.preventDefault(); if (confirm("Leave the DM's table?")) { closeModal(); partyLeave(); } },
  partyLoot: () => openModal({ type: "party" }),
  ptTog: el => { Party.open[el.dataset.k] = !Party.open[el.dataset.k]; renderModal(); },
  ptAct: el => partySend({ t: "act", oid: el.dataset.o, pid: Party.pid(), act: el.dataset.a, item: el.dataset.i }),
  ptZoom: el => { const s = Party.state, host = document.getElementById("ptmap"); if (!s || !host) return; if (el.dataset.d === "fit") Party.fit = true; else { Party.fit = false; Party.z *= +el.dataset.d; } drawPartyMap(); }
});
window.addEventListener("hashchange", () => { if (/^#join=/.test(location.hash)) checkJoin(); });
window.addEventListener("resize", () => { if (S.view === "table" && Party.fit) drawPartyMap(); });

// ---------- viewer mode: the DM Tool shows a player's sheet with ?viewer=1 (nothing is saved here) ----------
if (new URLSearchParams(location.search).get("viewer")) {
  S.viewer = true; document.documentElement.classList.add("viewer");
  save = function () { };
  const showChar = ch => { if (!S.wiki || !S.idx) return setTimeout(() => showChar(ch), 150); S.char = ch; migrate(S.char); S.view = "sheet"; render(); };   // wait until the app has started
  window.addEventListener("message", e => { const d = e.data; if (!d || d.type !== "dm-view-char" || !d.char) return; showChar(d.char); });
  window.addEventListener("load", () => { try { window.parent.postMessage({ type: "dm-viewer-ready" }, "*"); } catch (e) { } });
}
