const APP_VERSION = "2026-10-24";
"use strict";
/* ============ UI: state, binding, home, builder ============ */

function target() { return S.draft || S.char; }
function getPath(o, p) { return p.split(".").reduce((a, k) => a == null ? a : a[k], o); }
function setPath(o, p, v) {
  const ks = p.split("."); let cur = o;
  for (let i = 0; i < ks.length - 1; i++) { if (cur[ks[i]] == null || typeof cur[ks[i]] !== "object") cur[ks[i]] = /^\d+$/.test(ks[i + 1]) ? [] : {}; cur = cur[ks[i]]; }
  cur[ks[ks.length - 1]] = v;
}
function readVal(el) {
  if (el.type === "checkbox") return el.checked;
  if (el.dataset.num !== undefined || el.type === "number") { const n = parseFloat(el.value); return isNaN(n) ? 0 : n; }
  if (el.dataset.nullable !== undefined && el.value === "") return null;
  return el.value;
}
// attribute helpers
const bindA = (path, num) => `data-path="${path}"${num ? " data-num" : ""}`;
function inp(path, v, opts = {}) {
  const t = opts.type || (typeof v === "number" ? "number" : "text");
  return `<input type="${t}" ${bindA(path, t === "number")} value="${esc(v ?? "")}" ${opts.ph ? `placeholder="${esc(opts.ph)}"` : ""} ${opts.attr || ""} style="${opts.style || ""}">`;
}
function sel(path, v, options, opts = {}) {
  const o = options.map(x => Array.isArray(x) ? x : [x, x]);
  return `<select ${bindA(path, opts.num)} ${opts.attr || ""}>${opts.blank !== undefined ? `<option value="">${esc(opts.blank)}</option>` : ""}${o.map(([k, l]) => `<option value="${esc(k)}" ${String(k) === String(v ?? "") ? "selected" : ""}>${esc(l)}</option>`).join("")}</select>`;
}
function para(t) {
  if (!t) return "";
  return t.split("\n").map(l => l.trim()).filter(Boolean).map(l => l.startsWith("• ") ? `<div style="padding-left:12px">• ${esc(l.slice(2))}</div>` : `<p style="margin:0 0 5px">${esc(l)}</p>`).join("");
}

// ---------- persistence ----------
let saveTimer = null;
function save(now) {
  if (!S.char) return;
  const c = S.char;
  c._updated = Date.now();
  const p = DB.putChar(JSON.parse(JSON.stringify(c)));   // write immediately (phone apps can be closed any moment)
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => { if (S.char === c) { c._summary = derive(c).summary; await DB.putChar(JSON.parse(JSON.stringify(c))); Folder.push(c); } }, 600);
  Sync.soon();
  return now ? p : undefined;
}
async function loadChars() { S.chars = await storeListChars(); }
async function openChar(id, view) {
  S.char = await DB.getChar(id);
  if (!S.char) return toast("Character not found");
  migrate(S.char);
  S.view = view || (S.char.levels.length ? "sheet" : "builder"); S.tab = "basics"; S.mtab = "combat"; render();
}
function migrate(c) { const d = newChar(); for (const k in d) if (c[k] === undefined) c[k] = d[k]; for (const k in d.play) if (c.play[k] === undefined) c.play[k] = d.play[k]; }

// ---------- images ----------
function pickImage(cb, maxSize = 900) {
  const f = document.createElement("input"); f.type = "file"; f.accept = "image/*";
  f.onchange = () => {
    const file = f.files[0]; if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const mk = (m, q) => { const s = Math.min(1, m / Math.max(img.width, img.height)); const cv = document.createElement("canvas"); cv.width = Math.round(img.width * s); cv.height = Math.round(img.height * s); cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height); return cv.toDataURL("image/jpeg", q); };
        cb(mk(maxSize, .87), mk(96, .8));
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  };
  f.click();
}

// ---------- render dispatch ----------
function render() {
  const nav = $("#topnav");
  if (S.char && S.view !== "home") {
    nav.innerHTML = [["builder", "✎ Build"], ["sheet", "▶ Play"], ["print", "⎙ Print/PDF"]].map(([v, l]) => `<button class="${S.view === v ? "on" : ""}" data-act="view" data-v="${v}">${l}</button>`).join("") + `<span class="muted small navname" style="align-self:center;margin-left:8px">${esc(S.char.name)}</span>`;
  } else nav.innerHTML = "";
  document.body.classList.toggle("printmode", S.view === "print");
  const m = $("#main");
  const y = window.scrollY;
  if (S.view === "home") m.innerHTML = renderHome();
  else if (S.view === "builder") m.innerHTML = renderBuilder();
  else if (S.view === "sheet") m.innerHTML = renderSheet();
  else if (S.view === "print") m.innerHTML = renderPrint();
  window.scrollTo(0, y);
  renderModal();
  if (typeof Dice !== "undefined") Dice.sync();
}

// ---------- HOME ----------
function renderHome() {
  const W = S.wiki; const np = Object.keys(W.pages || {}).length, ns = Object.keys(W.spells || {}).length;
  const imp = S.ui.import || {}; const st = S.settings || {};
  const syncOn = Sync.enabled();
  return `
  <div class="card"><div class="row"><h2 style="margin:0">Your characters</h2><button class="right" data-act="new">+ New</button><button class="ghost" data-act="importJson">⤒ Import</button></div></div>
  <div class="chars">${S.chars.map(c => `
    <div class="card charcard" data-act="open" data-id="${esc(c.id)}">
      ${c.thumb ? `<img src="${c.thumb}">` : `<div class="ph">🛡</div>`}
      <div class="grow"><b>${esc(c.name)}</b><div class="muted small">${esc(c.summary || "")}</div></div>
    </div>`).join("") || `<p class="muted">No characters yet — create one!</p>`}</div>
  <p class="small muted" style="margin:4px 2px 14px">${S.server ? "Characters are also saved as files in the <b>characters</b> folder on this PC." : "Characters are saved in this app on this device."} To move one to another device: open it → <b>⤓ Export</b>, send the file, then <b>Import</b> it there.</p>

  <div class="card" style="margin-top:20px">
    <h3>Google Drive sync <span class="chip">optional</span></h3>
    ${syncOn ? `<p>Sync is <b>on</b>: ${esc(Sync.msg || Sync.status)}</p>
      <div class="row"><button data-act="syncNow">Sync now</button>${Sync.status === "signin" || Sync.status === "error" ? `<button data-act="syncConnect">Reconnect Google</button>` : ""}<button class="ghost" data-act="syncOff">Turn off</button></div>` :
      `<p class="small">Keeps characters (and the rules text) in sync between your laptop and phone, using a hidden app folder in your Google Drive. Needs a one-time Google Client ID — see <b>SETUP-PHONE.md</b>.</p>
      <div class="row"><input id="clientId" placeholder="Google OAuth Client ID (…apps.googleusercontent.com)" value="${esc(st.clientId || window.GOOGLE_CLIENT_ID || "")}" style="flex:1;min-width:240px"><button data-act="syncConnect">Connect Google Drive</button></div>
      ${Sync.status === "error" ? `<p class="warn small">${esc(Sync.msg)}</p>` : ""}`}
  </div>

  <div class="card">
    <h3>Rules text (wiki data)</h3>
    <p>${np ? `<b>${np}</b> pages and <b>${ns}</b> spells from ${esc(W.source || "the wiki")} (imported ${esc(W.imported || "?")}).` : `No rules text loaded yet. Everything works without it (all rules and numbers are built in), but feature, feat and spell <b>descriptions</b> come from the wiki.`}
    ${syncOn ? " It syncs to your other devices automatically." : ""}</p>
    ${S.server ? (imp.running ? `<div class="progress"><div style="width:${imp.total ? Math.round(100 * imp.done / imp.total) : 3}%"></div></div><p class="small muted">${esc(imp.msg)} (${imp.done}/${imp.total})</p>` :
      `<div class="row"><button data-act="runImport">${np ? "Update" : "Import"} from dnd2024.wikidot.com</button>${np ? `<button class="ghost" data-act="runImport" data-refresh="1">Re-download everything</button>` : ""}</div>`)
      : `<p class="small muted">Downloading from the wiki needs the Python program on your laptop (run.py). On the phone, the rules text arrives through Drive sync — or load a <code>wiki.json</code> file:</p>`}
    ${S.ui.wikiEnc && S.ui.wikiEncState === "locked" ? `<div class="lvl" style="margin:8px 0"><b>${np ? "Newer rules text available" : "Rules text available"}</b> <span class="small muted">(password protected${S.ui.wikiEnc.imported ? ", from " + esc(S.ui.wikiEnc.imported) : ""})</span>
      <div class="row" style="margin-top:6px"><input id="wikiPw" type="password" placeholder="Password" autocomplete="current-password"><label class="small"><input type="checkbox" id="wikiPwRem" checked> remember on this device</label><button data-act="wikiUnlock">Unlock</button></div></div>` : ""}
    <div class="row" style="margin-top:6px"><button class="ghost small" data-act="loadWikiFile">Load wiki.json file…</button>
      ${np ? `<button class="ghost small" data-act="wikiEncExport" title="Encrypted copy of the rules text to upload to your GitHub repo">🔒 Create wiki.enc for GitHub…</button>` : ""}</div>
    ${imp.error ? `<p class="warn">${esc(imp.error)}</p>` : ""}
  </div>
  <p class="small muted" style="text-align:center;margin:18px 0 30px">App version ${APP_VERSION} · <a href="#" data-act="updateApp">Check for updates</a></p>`;
}
async function pollImport() {
  const st = await (await fetch("api/import", { cache: "no-store" })).json(); S.ui.import = st;
  if (S.view === "home") render();
  if (st.running) setTimeout(pollImport, 800);
  else if (!st.error) { const w = await (await fetch("api/wiki", { cache: "no-store" })).json(); await storeSetWiki(w); if (S.view === "home") render(); toast("Rules text ready"); }
}

// ---------- BUILDER ----------
const TABS = [["basics", "1 · Basics"], ["species", "2 · Species"], ["background", "3 · Background"], ["abilities", "4 · Abilities"], ["levels", "5 · Class & Levels"], ["spells", "6 · Spells"], ["equipment", "7 · Equipment"], ["story", "8 · Story & Notes"]];
function renderBuilder() {
  const c = S.char, D = derive(c);
  const body = { basics: bBasics, species: bSpecies, background: bBackground, abilities: bAbilities, levels: bLevels, spells: bSpells, equipment: bEquipment, story: bStory }[S.tab](c, D);
  const i = TABS.findIndex(t => t[0] === S.tab);
  return `<div class="card"><div class="row"><div class="grow"><h2 style="margin:0">${esc(c.name)}</h2><div class="muted">${esc(D.summary)}</div></div>
    <button class="ghost" data-act="levelup">⬆ Level up</button><button data-act="view" data-v="sheet">Open play sheet ▶</button></div></div>
  <div class="tabs">${TABS.map(([k, l]) => `<button class="${S.tab === k ? "on" : ""}" data-act="tab" data-t="${k}">${l}</button>`).join("")}</div>
  ${D.warnings.length ? `<div class="card warn">${D.warnings.map(esc).join("<br>")}</div>` : ""}
  ${body}
  <div class="row" style="margin:14px 0 30px">${i > 0 ? `<button class="ghost" data-act="tab" data-t="${TABS[i - 1][0]}">← ${TABS[i - 1][1]}</button>` : ""}
  ${i < TABS.length - 1 ? `<button class="right" data-act="tab" data-t="${TABS[i + 1][0]}">${TABS[i + 1][1]} →</button>` : `<button class="right" data-act="view" data-v="sheet">Done → Play sheet</button>`}</div>`;
}

function bBasics(c) {
  const ph = c.phys;
  return `<div class="grid g2">
  <div class="card"><h3>Identity</h3>
    <div class="grid g2"><label>Character name<br>${inp("name", c.name, { style: "width:100%" })}</label><label>Player<br>${inp("player", c.player, { style: "width:100%" })}</label></div>
    <h3 style="margin-top:14px">Physical</h3>
    <div class="grid g3">${[["age", "Age"], ["height", "Height"], ["weight", "Weight"], ["eyes", "Eyes"], ["hair", "Hair"], ["skin", "Skin"], ["alignment", "Alignment"]].map(([k, l]) => `<label>${l}<br>${inp("phys." + k, ph[k], { style: "width:100%" })}</label>`).join("")}</div>
    <h3 style="margin-top:14px">Languages</h3>
    ${inp("languages", c.languages, { style: "width:100%", ph: "Common, Elvish, ..." })}
    <p class="small muted">2024: Common + two standard languages (${LANGUAGES.slice(1, 10).join(", ")}).</p>
    <label>Other proficiencies / notes<br>${inp("otherProfs", c.otherProfs, { style: "width:100%" })}</label>
  </div>
  <div class="card"><h3>Character image</h3>
    ${c.portrait ? `<img src="${c.portrait}" style="max-width:100%;max-height:380px;border-radius:8px;display:block;margin-bottom:8px">` : `<p class="muted">No image yet.</p>`}
    <div class="row"><button data-act="img" data-k="portrait">Upload portrait</button>${c.portrait ? `<button class="ghost" data-act="imgdel" data-k="portrait">Remove</button>` : ""}</div>
    <p class="small muted">Shown on the sheet and on page 1 of the PDF. A tall image (2:3) fits best.</p>
  </div></div>
  <div class="card"><h3>Delete character</h3><div class="row"><span class="small muted">Removes this character on all synced devices. Tip: use Export .json on the Print/PDF page first if you want a backup.</span><button class="danger right" data-act="deleteChar">🗑 Delete ${esc(c.name)}</button></div></div>`;
}

function bSpecies(c, D) {
  const sp = SPECIES[c.species.id];
  let h = `<div class="card"><h3>Choose a species</h3><div class="grid gauto">${Object.entries(SPECIES).map(([k, s]) => `
    <div class="pick ${c.species.id === k ? "on" : ""}" data-act="setSpecies" data-id="${k}"><b>${s.name}</b><span class="small muted">${s.size} · Speed ${s.speed}${s.darkvision ? " · Darkvision " + s.darkvision : ""}</span>
    <div class="small">${Object.values(s.traits).flat().join(", ")}</div></div>`).join("")}</div></div>`;
  if (!sp) return h;
  const slug = findPage("species", sp.name);
  h += `<div class="card"><h3>${sp.name} options</h3>`;
  if (sp.choice) h += lineageTable(c, sp, slug);
  h += `<div class="row" style="margin-top:8px">`;
  if (sp.size.includes(" or ")) h += `<label>Size: ${sel("species.size", c.species.size || "Medium", sp.size.split(" or "))}</label>`;
  h += `</div>`;
  if (sp.pools) for (const pk in sp.pools) h += poolPicker(pk, D, c);
  if (sp.extraOriginFeat) h += `<div style="margin-top:10px"><b>Versatile:</b> choose an origin feat ${featSelect("speciesFeat", c.speciesFeat, ["origin"])}${featPicks("speciesFeat", c.speciesFeat, D)}</div>`;
  if (sp.spellAbility) h += `<p><label><b>Spellcasting ability for these spells:</b> ${sel("species.spellAbil", c.species.spellAbil || "", [["int", "Intelligence"], ["wis", "Wisdom"], ["cha", "Charisma"]], { blank: "— choose —" })}</label>${D.speciesCast ? ` <span class="chip">Save DC ${D.speciesCast.dc} · Attack ${sgn(D.speciesCast.atk)}</span>` : ""}</p>`;
  if (sp.spells) h += `<p class="small"><b>Always known:</b> ${Object.entries(sp.spells).map(([lv, l]) => l.map(n => spellLink(n) + (+lv > 1 ? ` (level ${lv}+)` : "")).join(", ")).join(", ")}</p>`;
  if (S.ui.spellPeek) { const si = spellInfo(S.ui.spellPeek); h += `<div class="infobox"><div class="row"><b>${esc(S.ui.spellPeek)}</b>${si ? ` <span class="small muted">${si.level ? "Level " + si.level : "Cantrip"} ${esc(si.school)}</span>` : ""}<a href="#" class="right" data-act="spellPeek" data-v="">✕</a></div>${si ? `<div class="meta small">${esc([si.time && "Casting time: " + si.time, si.range && "Range: " + si.range, si.comp && "Components: " + si.comp, si.dur && "Duration: " + si.dur].filter(Boolean).join(" · "))}</div><div class="desc">${para(si.text)}</div>` : '<span class="muted small">Spell not in the imported rules text.</span>'}</div>`; }
  h += `</div><div class="card"><h3>Traits</h3>${Object.entries(sp.traits).map(([lv, ts]) => ts.map(t => `<details><summary><b>${t}</b>${+lv > 1 ? ` <span class="muted small">(level ${lv})</span>` : ""}</summary><div class="desc">${para(lookup(t, slug ? [slug] : [])) || '<span class="muted">No description imported.</span>'}</div></details>`).join("")).join("")}</div>`;
  return h;
}

function spellLink(n) { return `<a href="#" class="spl ${S.ui.spellPeek === n ? "on" : ""}" data-act="spellPeek" data-v="${esc(n)}">${esc(n)}</a>`; }
function lineageTable(c, sp, slug) {
  const ch = sp.choice, cur = c.species.choice;
  if (sp.byChoice) {
    const lv = [...new Set(Object.values(sp.byChoice).flatMap(o => Object.keys(o.spells || {})))].sort((a, b) => a - b);
    return `<p style="margin:4px 0"><b>${esc(ch.label)}</b> <span class="small muted">— tap a row to choose; tap a spell to read it</span></p>
      <div style="overflow-x:auto"><table class="lintable"><tr><th></th><th>${esc(ch.label.replace(/^(Elven|Gnomish|Fiendish) /, ""))}</th>${lv.map(l => `<th>Level ${l}</th>`).join("")}<th>Also</th></tr>
      ${ch.opts.map(o => { const x = sp.byChoice[o] || {}; const extra = [x.darkvision && `Darkvision ${x.darkvision} ft`, x.speed && `Speed ${x.speed} ft`, x.resist && `Resistance: ${x.resist.join(", ")}`].filter(Boolean).join("; ");
        return `<tr class="${cur === o ? "on" : ""}" data-act="setLineageRow" data-v="${esc(o)}" style="cursor:pointer"><td><input type="radio" name="lin" data-act="setLineage" value="${esc(o)}" ${cur === o ? "checked" : ""}></td><td><b>${esc(o)}</b></td>${lv.map(l => `<td>${((x.spells || {})[l] || []).map(spellLink).join(", ") || "—"}</td>`).join("")}<td class="small">${esc(extra) || "—"}</td></tr>`; }).join("")}
      </table></div>`;
  }
  const open = S.ui.linInfo;
  return `<p style="margin:4px 0"><b>${esc(ch.label)}</b></p>${ch.opts.map(o => `<div class="fprow ${cur === o ? "on" : ""}"><label><input type="radio" name="lin" data-act="setLineage" value="${esc(o)}" ${cur === o ? "checked" : ""}> <b>${esc(o)}</b></label>
    <a href="#" class="info ${open === o ? "on" : ""}" data-act="linInfo" data-v="${esc(o)}">ⓘ</a>${open === o ? `<div class="infobox" style="width:100%"><div class="desc">${para(lookup(o.replace(/\s*\(.*\)$/, ""), slug ? [slug] : [])) || '<span class="muted">No description imported.</span>'}</div></div>` : ""}</div>`).join("")}`;
}
function abilTag(abil) { return abil ? `+1 ${abil.length === 6 ? "any" : abil.map(a => ABBR[a]).join("/")}` : ""; }
function featLabel(n) { const fi = featInfo(n); return n + (fi && fi.abil ? `  (${abilTag(fi.abil)})` : ""); }
// clickable feat list (like the invocation picker): groups by category and source book, ⓘ for details
function featSelect(path, f, cats) {
  const flt = S.ui.featFilter || "";
  const cat = featCatalog();
  const canFilter = cats.some(x => x === "general" || x === "boon");
  const id = path.replace(/[^\w]/g, "_");
  const all = Object.values(cat).filter(e => cats.includes(e.cat)).filter(e => !canFilter || !flt || f?.name === e.name || (e.abil || []).includes(flt) || (FEATS[e.name]?.asi && flt));
  const open = S.ui.featInfo === id ? S.ui.featInfoName : null;
  let h = `<div class="featpick">`;
  if (f?.name) h += `<div class="row"><b>Chosen:</b> <span class="chip acc">${esc(f.name)}</span>${path !== "__bg" ? `<a href="#" class="small" data-act="pickFeat" data-p="${esc(path)}" data-v="">clear</a>` : ""}</div>`;
  if (canFilter) h += `<div class="row small" style="margin:6px 0"><span class="muted">Raises:</span>${["", ...ABILITIES].map(a => `<span class="chip ${flt === a ? "acc" : ""}" style="cursor:pointer" data-act="featFilterChip" data-a="${a}">${a ? ABBR[a] : "Any"}</span>`).join("")}</div>`;
  h += `<div class="featlist">`;
  for (const c of cats) {
    const inCat = all.filter(e => e.cat === c); if (!inCat.length) continue;
    const bySrc = {}; inCat.forEach(e => (bySrc[e.source] ||= []).push(e));
    const srcs = Object.keys(bySrc).sort((a, b) => (a === "Player's Handbook" ? -1 : b === "Player's Handbook" ? 1 : a.localeCompare(b)));
    for (const src of srcs) {
      h += `<div class="fphead">${esc(FEAT_CATS[c] || c)}${srcs.length > 1 || src !== "Player's Handbook" ? ` <span class="muted">· ${esc(src)}</span>` : ""}</div>`;
      h += bySrc[src].sort((a, b) => a.name.localeCompare(b.name)).map(e => `<div class="fprow ${f?.name === e.name ? "on" : ""}">
        <label><input type="radio" name="fp_${id}" data-act="pickFeat" data-p="${esc(path)}" data-v="${esc(e.name)}" ${f?.name === e.name ? "checked" : ""}> <b>${esc(e.name)}</b>${e.abil ? ` <span class="small muted">${abilTag(e.abil)}</span>` : ""}${e.prereq ? ` <span class="small muted">· ${esc(e.prereq)}</span>` : ""}</label>
        <a href="#" class="info ${open === e.name ? "on" : ""}" data-act="featInfoTog" data-id="${id}" data-v="${esc(e.name)}">ⓘ</a>
        ${open === e.name ? `<div class="infobox" style="width:100%"><div class="desc">${para(featDesc(e.name)) || '<span class="muted">No description imported.</span>'}</div></div>` : ""}</div>`).join("");
    }
  }
  return h + `</div></div>`;
}
function pickOpts(spec, D) {
  if (Array.isArray(spec)) return spec;
  if (spec === "skills") return ALL_SKILLS;
  if (spec === "profSkills") return D.profSkills;
  if (spec === "skillsOrTools") return ALL_SKILLS.concat(TOOLS);
  return [];
}
function featPicks(path, f, D) {
  if (!f || !f.name) return "";
  const fd = { ...(FEATS[f.name] || {}), abil: featInfo(f.name)?.abil || FEATS[f.name]?.abil }; let h = `<div class="row" style="margin-top:6px">`;
  if (fd.abil) h += `<label>+1 to ${sel(path + ".abil", f.abil, fd.abil.map(a => [a, ABILITY_NAMES[a]]), { blank: "— ability —" })}</label>`;
  for (const p of fd.picks || []) {
    if (path === "bgFeat" && p.key === "list" && f.presetList) continue;
    const opts = pickOpts(p.opts, D);
    if (p.count > 1) {
      const cur = f.picks?.[p.key] || [];
      h += `</div><div><b class="small">${p.label}</b> <span class="muted small">${cur.length}/${p.count}</span><div class="checks">${opts.map(o => `<label><input type="checkbox" data-act="featMulti" data-p="${path}" data-k="${p.key}" data-n="${p.count}" data-v="${esc(o)}" ${cur.includes(o) ? "checked" : ""} ${!cur.includes(o) && cur.length >= p.count ? "disabled" : ""}>${esc(o)}</label>`).join("")}</div></div><div class="row">`;
    } else h += `<label>${p.label}: ${sel(path + ".picks." + p.key, f.picks?.[p.key], opts.map(o => [o, ABILITY_NAMES[o] || o]), { blank: "—" })}</label>`;
  }
  if (fd.spellsNote) h += `<span class="small muted">Spells: ${fd.spellsNote} — add them in the Spells tab under "Other".</span>`;
  if (f.name === "Magic Initiate") h += `<span class="small muted">Add 2 cantrips + one level 1 spell in the Spells tab under "Other".</span>`;
  return h + `</div>`;
}

function poolOptions(pk, D) {
  if (pk.startsWith("skills:")) { const cl = CLASSES[pk.slice(7)]; return cl.skills.from; }
  const P = POOLS[pk]; if (!P) return [];
  const set = new Set(); (D.pools[pk]?.ctxs.length ? D.pools[pk].ctxs : [{}]).forEach(ctx => P.options(ctx).forEach(o => set.add(o)));
  return [...set];
}
function poolLabel(pk) { return pk.startsWith("skills:") ? CLASSES[pk.slice(7)].name + " skill proficiencies" : POOLS[pk]?.label || pk; }
const POOLS_WITH_INFO = new Set(["armorModel", "invocations", "metamagic", "maneuvers", "fightingStyle", "divineOrder", "primalOrder", "mastery"]);
function poolPicker(pk, D, c, oldMax) {
  const p = D.pools[pk]; if (!p) return "";
  const cur = (c.pools[pk] || []);
  const opts = poolOptions(pk, D);
  const taken = pk.startsWith("skills:") || pk === "skillful" || pk === "keenSenses" || pk === "skillsLore" || pk === "primalKnowledge" ? new Set(D.profSkills.filter(s => !cur.includes(s))) : new Set();
  const info = POOLS_WITH_INFO.has(pk);
  const open = S.ui.optInfo && S.ui.optInfo.pk === pk ? S.ui.optInfo.o : null;
  return `<div style="margin:10px 0"><b>${esc(poolLabel(pk))}</b> <span class="chip ${cur.length < p.max ? "acc" : ""}">${Math.min(cur.length, p.max)} / ${p.max}${oldMax !== undefined && p.max > oldMax ? ` (+${p.max - oldMax} new)` : ""}</span>${info ? ' <span class="small muted">tap ⓘ to read</span>' : ""}
  ${(() => {
    const pre = POOLS[pk]?.prereq;
    const box = (o, lock, hint) => `<label class="${taken.has(o) || lock ? "muted" : ""}"><input type="checkbox" data-act="pool" data-k="${esc(pk)}" data-v="${esc(o)}" ${cur.includes(o) ? "checked" : ""} ${!cur.includes(o) && (cur.length >= p.max || taken.has(o) || lock) ? "disabled" : ""}>${esc(o)}${taken.has(o) ? " ✓" : ""}${hint ? ` <span class="small muted">(${esc(hint)})</span>` : ""}${info ? ` <a href="#" class="info ${open === o ? "on" : ""}" data-act="optInfo" data-k="${esc(pk)}" data-v="${esc(o)}">ⓘ</a>` : ""}</label>`;
    if (!pre) return `<div class="checks">${opts.map(o => box(o)).join("")}</div>`;
    const lvl = D.cls.warlock || 0, groups = {};
    opts.forEach(o => { const l = (pre[o] || [1])[0]; (groups[l] ||= []).push(o); });
    return Object.keys(groups).sort((a, b) => a - b).map(l => `<div class="pgrp">${+l === 1 ? "No level prerequisite" : "Warlock level " + l + "+"}${lvl < +l ? ` <span class="muted" style="text-transform:none;font-weight:600">— unlocks at level ${l}</span>` : ""}</div>
      <div class="checks">${groups[l].map(o => box(o, lvl < +l && !cur.includes(o), (pre[o] || [])[1] ? "needs " + pre[o][1] : "")).join("")}</div>`).join("");
  })()}
  ${open ? `<div class="infobox"><div class="row"><b>${esc(open)}</b><a href="#" class="right" data-act="optInfo" data-k="${esc(pk)}" data-v="">✕</a></div><div class="desc">${para(optionText(pk, open)) || '<span class="muted">No description found in the imported rules text.</span>'}</div></div>` : ""}</div>`;
}

function bBackground(c, D) {
  const b = c.background; const bg = bgData(c);
  const flt = S.ui.bgFilter || "";
  const list = Object.entries(BACKGROUNDS).filter(([k, x]) => !flt || x.abil.includes(flt));
  let h = `<div class="card"><h3>Choose a background</h3>
    <div class="row small" style="margin-bottom:8px"><span class="muted">Raises:</span>${["", ...ABILITIES].map(a => `<span class="chip ${flt === a ? "acc" : ""}" style="cursor:pointer" data-act="bgFilter" data-a="${a}">${a ? ABILITY_NAMES[a] : "Any"}</span>`).join("")}</div>
    <div class="grid gauto">${list.map(([k, x]) => `
    <div class="pick ${b.id === k ? "on" : ""}" data-act="setBg" data-id="${k}"><b>${x.name}</b>
    <span class="small muted">${x.abil.map(a => a === flt ? `<span style="color:var(--accent);font-weight:800">${ABBR[a]}</span>` : ABBR[a]).join(", ")} · ${x.feat}</span><div class="small">${x.skills.join(", ")} · ${x.tool}</div></div>`).join("")}
    <div class="pick ${b.id === "custom" ? "on" : ""}" data-act="setBg" data-id="custom"><b>✎ Custom background</b><span class="small muted">Any abilities · any origin feat</span><div class="small">2 skills · 1 tool of your choice</div></div></div></div>`;
  if (!bg) return h;
  const ab = bg.abil.map(a => [a, ABILITY_NAMES[a]]);
  const origins = Object.entries(FEATS).filter(([n, f]) => f.cat === "origin").map(([n]) => n);
  const featName = bg.feat.replace(/\s*\(.*\)$/, "");
  const presetList = !bg.custom && !bg.featChanged && /\(/.test(bg.feat);
  const p111 = b.p111 || [];
  h += `<div class="card"><h3>${esc(bg.name)}</h3>
   ${bg.custom ? `<p><label>Name ${inp("background.customName", b.customName || "", { ph: "e.g. Shipwright", style: "width:240px" })}</label></p>` : ""}
   <p><b>Ability scores</b> ${bg.custom ? "(any)" : `(choose among ${bg.abil.map(a => ABILITY_NAMES[a]).join(", ")})`}:</p>
   <div class="row"><label><input type="radio" name="bgm" data-act="bgMode" value="21" ${b.mode !== "111" ? "checked" : ""}> +2 to one, +1 to another</label>
   <label><input type="radio" name="bgm" data-act="bgMode" value="111" ${b.mode === "111" ? "checked" : ""}> +1 to three</label></div>
   ${b.mode !== "111" ? `<div class="row" style="margin-top:6px"><label>+2 ${sel("background.plus2", b.plus2, ab, { blank: "—" })}</label><label>+1 ${sel("background.plus1", b.plus1, ab.filter(x => x[0] !== b.plus2), { blank: "—" })}</label></div>`
      : bg.custom ? `<div class="row" style="margin-top:6px">${[0, 1, 2].map(i => `<label>+1 ${sel("background.p111." + i, p111[i], ab.filter(x => !p111.some((v, j) => j !== i && v === x[0])), { blank: "—" })}</label>`).join("")}</div>`
      : `<p class="small">+1 to ${bg.abil.map(a => ABILITY_NAMES[a]).join(", ")}</p>`}
   <p><b>Skills:</b> ${bg.custom ? `<span class="chip ${bg.skills.length < 2 ? "acc" : ""}">${bg.skills.length}/2</span>` : bg.skills.join(", ")}</p>
   ${bg.custom ? `<div class="checks">${ALL_SKILLS.map(s => `<label><input type="checkbox" data-act="bgSkill" data-v="${s}" ${bg.skills.includes(s) ? "checked" : ""} ${!bg.skills.includes(s) && bg.skills.length >= 2 ? "disabled" : ""}>${s}</label>`).join("")}</div>` : ""}
   <p><b>Tool proficiency:</b> ${bg.custom ? sel("background.tool", b.tool, TOOLS, { blank: "— choose a tool —" }) : BACKGROUNDS[b.id].tool.startsWith("One") ? inp("background.tool", b.tool, { ph: BACKGROUNDS[b.id].tool }) : bg.tool}</p>
   ${!bg.custom && START_EQUIP.background[b.id] ? `<p style="margin-bottom:4px"><b>Equipment</b> <span class="small muted">— pick one; it's added to your equipment</span></p>${equipOptions(c, D, "bg")}` : ""}
   <p><b>Origin feat:</b> ${bg.custom ? "" : `${esc(bg.origFeat)} <label class="small" style="margin-left:10px"><input type="checkbox" data-act="bgFeatSwap" ${bg.featChanged ? "checked" : ""}> choose a different origin feat</label>`}</p>
   ${bg.custom || bg.featChanged ? featSelect("__bg", { name: b.featOverride }, ["origin"]) : ""}
   ${featName ? featPicks("bgFeat", { name: featName, ...c.bgFeat, presetList }, D) : ""}
   ${featName ? `<details style="margin-top:8px"><summary>Feat description</summary><div class="desc">${para(featDesc(featName)) || '<span class="muted">Not imported.</span>'}</div></details>` : ""}
   ${bg.custom ? "" : `<details><summary>Background description</summary><div class="desc">${para(pageText(findPage("background", bg.name))) || '<span class="muted">Not imported.</span>'}</div></details>`}
  </div>`;
  return h;
}

function bAbilities(c, D) {
  const pb = c.abilMethod === "pointbuy";
  const spent = ABILITIES.reduce((s, a) => s + (POINT_BUY_COST[c.base[a]] ?? 99), 0);
  return `<div class="card"><h3>Ability scores</h3>
  <div class="row"><label><input type="radio" name="am" data-act="abilMethod" value="pointbuy" ${pb ? "checked" : ""}> Point buy (27)</label>
  <label><input type="radio" name="am" data-act="abilMethod" value="manual" ${!pb ? "checked" : ""}> Manual / rolled / standard array</label>
  ${pb ? `<span class="chip ${spent > 27 ? "acc" : ""}" style="font-size:14px">Points: ${27 - spent} left</span>` : `<button class="ghost small" data-act="stdArray">Fill standard array 15,14,13,12,10,8</button>`}</div>
  <table class="t" style="margin-top:10px;max-width:640px"><tr><th>Ability</th><th class="num">Base</th><th class="num">Bonus</th><th class="num">Total</th><th class="num">Mod</th></tr>
  ${ABILITIES.map(a => `<tr style="background:var(--${a})"><td><b>${ABILITY_NAMES[a]}</b>${D.startCls && CLASSES[D.startCls].primary.includes(a) ? ' <span class="chip">primary</span>' : ""}</td>
    <td class="num">${pb ? `<button class="small ghost" data-act="pbm" data-a="${a}" data-d="-1" ${c.base[a] <= 8 ? "disabled" : ""}>−</button> <b style="display:inline-block;width:24px">${c.base[a]}</b> <button class="small ghost" data-act="pbm" data-a="${a}" data-d="1" ${c.base[a] >= 15 || (POINT_BUY_COST[c.base[a] + 1] - POINT_BUY_COST[c.base[a]]) > 27 - spent ? "disabled" : ""}>+</button>` : inp("base." + a, c.base[a], { type: "number" })}</td>
    <td class="num">${D.bonus[a] ? sgn(D.bonus[a]) : ""}</td><td class="num big">${D.score[a]}</td><td class="num big">${sgn(D.mod[a])}</td></tr>`).join("")}</table>
  <p class="small muted">Bonuses come from your background and from Ability Score Improvements / feats chosen when levelling.</p></div>`;
}

function bLevels(c, D) {
  let h = `<div class="card"><div class="row"><h3 style="margin:0">Levels</h3><span class="chip acc">Character level ${D.level}</span>
    <button class="right" data-act="levelup">⬆ ${D.level ? "Level up" : "Choose first class"}</button>${D.level ? `<button class="ghost" data-act="poplevel">Remove last level</button>` : ""}</div></div>`;
  c.levels.forEach((lv, i) => {
    const C = CLASSES[lv.cls], cl = classLevelAt(c, i);
    const feats = (C.features[cl] || []);
    const sub = D.subs[lv.cls];
    const names = feats.map(n => n === "@sub" ? (sub ? sub.name + ": " + ((sub.features[cl] || []).join(", ") || "—") : "Subclass") : n === "@asi" ? "Ability Score Improvement" : n === "@boon" ? "Epic Boon" : n);
    h += `<div class="lvl"><div class="row"><b>Level ${i + 1}</b> — ${C.name} ${cl}<span class="muted small">${names.join(" · ")}</span>
      <span class="right small">HP: ${i === 0 ? `${C.hd} (max)` : `${inp(`levels.${i}.hp`, lv.hp ?? (C.hd / 2 + 1), { type: "number", attr: `min="1" max="${C.hd}"` })} / d${C.hd}`}</span></div>
      ${feats.includes("@sub") && cl === Object.keys(C.features).find(k => C.features[k].includes("@sub")) * 1 ? `<div class="row" style="margin-top:6px"><label>Subclass: ${sel("subclasses." + lv.cls, c.subclasses[lv.cls], Object.entries(C.subclasses).map(([k, s]) => [k, s.name]), { blank: "— choose —" })}</label></div>` : ""}
      ${feats.includes("@asi") || feats.includes("@boon") ? asiEditor(`levels.${i}.asi`, lv.asi, D, feats.includes("@boon")) : ""}
    </div>`;
  });
  const pk = Object.keys(D.pools);
  if (pk.length) h += `<div class="card"><h3>Class & species options</h3><p class="small muted">Skill choices, expertise, weapon masteries, fighting styles, invocations… You can change these any time (e.g. swapping a mastery after a long rest).</p>${pk.map(k => poolPicker(k, D, c)).join("")}</div>`;
  return h;
}
function asiEditor(path, a, D, boon) {
  a = a || {};
  const ab = ABILITIES.map(x => [x, ABILITY_NAMES[x]]);
  let h = `<div style="margin-top:6px"><div class="row"><b>${boon ? "Epic Boon" : "Ability Score Improvement"}:</b>
    <label><input type="radio" data-act="asiMode" data-p="${path}" value="asi" ${a.mode === "asi" ? "checked" : ""} name="${path}"> Ability scores</label>
    <label><input type="radio" data-act="asiMode" data-p="${path}" value="feat" ${a.mode === "feat" ? "checked" : ""} name="${path}"> Feat</label></div>`;
  if (a.mode === "asi") {
    h += `<div class="row" style="margin-top:4px">${sel(path + ".t", a.t || "2", [["2", "+2 to one"], ["11", "+1 to two"]])} ${sel(path + ".a1", a.a1, ab, { blank: "—" })} ${a.t === "11" ? sel(path + ".a2", a.a2, ab.filter(x => x[0] !== a.a1), { blank: "—" }) : ""}</div>`;
  } else if (a.mode === "feat") {
    const cats = boon ? ["boon", "general", "origin", "other"] : ["general", "origin", "other"];
    if (D.pools.fightingStyle) cats.push("style");
    h += `<div style="margin-top:4px">${featSelect(path + ".feat", a.feat, cats)}${featPicks(path + ".feat", a.feat, D)}</div>`;
  }
  return h + `</div>`;
}

// ---------- spells tab ----------
function bSpells(c, D) {
  const tabs = D.casters.map(x => [x.cls, x.name]).concat([["other", "Other (feats, items)"]]);
  if (!S.ui.spTab || !tabs.find(t => t[0] === S.ui.spTab)) S.ui.spTab = tabs[0][0];
  const cur = S.ui.spTab;
  let h = `<div class="card"><div class="subtabs">${tabs.map(([k, l]) => `<button class="${cur === k ? "on" : ""}" data-act="spTab" data-k="${k}">${l}</button>`).join("")}</div>`;
  const cs = D.casters.find(x => x.cls === cur);
  const mine = c.spells.filter(s => s.cls === cur);
  if (cs) {
    const nC = mine.filter(s => (spellInfo(s.name)?.level ?? s.level) === 0).length, nP = mine.length - nC;
    h += `<div class="row"><span class="chip ${nC > cs.cantrips ? "acc" : ""}">Cantrips ${nC} / ${cs.cantrips}</span><span class="chip ${nP > cs.prepared ? "acc" : ""}">Prepared spells ${nP} / ${cs.prepared}</span>
      <span class="chip">Max spell level ${cs.maxLvl}</span><span class="chip">Save DC ${cs.dc} · Attack ${sgn(cs.atk)} (${ABILITY_NAMES[cs.ability]})</span></div>`;
  } else h += `<p class="small muted">Spells from feats (Magic Initiate, Fey Touched…), items or other sources. Pick from any list.</p>`;
  const always = D.alwaysSpells.filter(s => s.cls === cur || (cur === "other" && s.cls === "species"));
  if (always.length) h += `<p><b>Always prepared:</b> ${always.map(s => `<span class="chip">${esc(s.name)}</span>`).join("")}</p>`;
  h += `<p><b>Chosen:</b> ${mine.map(s => `<span class="chip acc">${esc(s.name)} <a href="#" data-act="spellDel" data-n="${esc(s.name)}" data-c="${cur}">✕</a></span>`).join("") || '<span class="muted">none</span>'}</p>`;
  h += `<div class="row"><input id="spq" placeholder="Search spells…" value="${esc(S.ui.spq || "")}" data-act-input="spq" style="flex:1">
    ${cur === "other" ? "" : `<label class="small"><input type="checkbox" data-act="spAll" ${S.ui.spAll ? "checked" : ""}> show all lists</label>`}</div>
    ${cs && !S.idx.spellList.some(s => s.classes.includes(cs.list)) && S.idx.spellList.length ? `<p class="small warn">The imported rules text has no ${esc(cs.name)} spell list, so all spells up to level ${cs.maxLvl} are shown — pick the ones on your class list.</p>` : ""}
    <div id="splist">${spellList(c, D, cur, cs)}</div>
    <div class="row" style="margin-top:10px"><span class="small muted">Not in the list?</span><input id="spman" placeholder="Spell name"><select id="spmanl">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(l => `<option value="${l}">${l ? "Level " + l : "Cantrip"}</option>`).join("")}</select><button class="small" data-act="spellAddMan" data-c="${cur}">Add</button></div></div>`;
  return h;
}
function spellList(c, D, cur, cs) {
  const q = norm(S.ui.spq || "");
  let list = S.idx.spellList;
  if (!list.length) return `<p class="muted">No spell data imported — import the wiki on the home screen, or add spells by name below.</p>`;
  const hasList = cs && S.idx.spellList.some(s => s.classes.includes(cs.list));
  if (cs && !S.ui.spAll) list = list.filter(s => (!hasList || s.classes.includes(cs.list)) && s.level <= cs.maxLvl);
  if (q) list = list.filter(s => norm(s.name).includes(q));
  const chosen = new Set(c.spells.filter(s => s.cls === cur).map(s => s.name));
  const groups = {}; list.slice(0, 400).forEach(s => (groups[s.level] ||= []).push(s));
  return Object.entries(groups).map(([lv, ss]) => `<h4 style="margin:10px 0 4px">${+lv ? "Level " + lv : "Cantrips"}</h4>` + ss.map(s => `
    <div class="spell"><div class="h"><input type="checkbox" data-act="spellToggle" data-n="${esc(s.name)}" data-l="${s.level}" data-c="${cur}" ${chosen.has(s.name) ? "checked" : ""}>
    <b data-act="toggleOpen" style="flex:1">${esc(s.name)}</b><span class="tag">${esc(s.school)}</span>${s.conc ? '<span class="tag">C</span>' : ""}${s.ritual ? '<span class="tag">R</span>' : ""}<span class="muted small">${esc(s.time)}</span></div>
    <div class="body hidden"><div class="meta">${esc([s.time && "Casting time: " + s.time, s.range && "Range: " + s.range, s.comp && "Components: " + s.comp, s.dur && "Duration: " + s.dur].filter(Boolean).join(" · "))}</div><div class="desc">${para(s.text)}</div></div></div>`).join("")).join("");
}

// ---------- equipment ----------
function bEquipment(c, D) {
  return `<div class="grid g2"><div class="card"><h3>Armor</h3>
    <div class="row"><label>Armor ${armorSelect(c, D)}</label>
    <label><input type="checkbox" ${bindA("shield")} ${c.shield ? "checked" : ""}> Shield (+2)${D.armorTraining.includes("Shields") ? "" : ' <span class="warn small">untrained</span>'}</label>
    <label>Other AC bonus ${inp("acBonus", +c.acBonus || 0, { type: "number" })}</label></div>
    <p>AC: <span class="big">${D.ac}</span> <span class="muted small">Your training: ${D.armorTraining.join(", ") || "none"}</span></p>
    ${D.armor.kind !== "none" ? `<p class="small">${esc(armorInfo(D.armor, D))}</p>` : ""}
    <h3>Coins</h3><div class="row">${["cp", "sp", "ep", "gp", "pp"].map(k => `<label>${k.toUpperCase()} ${inp("coins." + k, +c.coins[k] || 0, { type: "number" })}</label>`).join("")}</div>
    <h3 style="margin-top:12px">Misc. bonuses</h3><div class="row"><label>Initiative ${inp("initBonus", +c.initBonus || 0, { type: "number" })}</label><label>Speed ${inp("speedBonus", +c.speedBonus || 0, { type: "number" })}</label><label>Max HP ${inp("hpBonus", +c.hpBonus || 0, { type: "number" })}</label></div>
  </div>
  <div class="card"><h3>Weapons & attacks</h3>
    <table class="t"><tr><th>Name</th><th>Weapon</th><th class="num">Magic</th><th class="num">Hit</th><th>Damage</th><th></th></tr>
    ${c.weapons.map((w, i) => `<tr><td>${inp(`weapons.${i}.name`, w.name, { style: "width:120px" })}</td><td>${sel(`weapons.${i}.base`, w.base, WEAPONS.map(x => x.name))}</td>
      <td class="num">${inp(`weapons.${i}.magic`, +w.magic || 0, { type: "number", style: "width:50px" })}</td><td class="num"><b>${sgn(D.attacks[i].hit)}</b></td><td class="small">${esc(D.attacks[i].dmg)}</td>
      <td><button class="small ghost" data-act="del" data-p="weapons" data-i="${i}">✕</button></td></tr>
      <tr><td colspan="6" class="small muted" style="border-bottom:2px solid var(--line)">${esc(D.attacks[i].props)} · ability ${sel(`weapons.${i}.abil`, w.abil || "auto", [["auto", "auto"], ...ABILITIES.map(a => [a, ABBR[a]])])} · proficient ${sel(`weapons.${i}.prof`, w.prof === true ? "y" : w.prof === false ? "n" : "", [["", "auto"], ["y", "yes"], ["n", "no"]], { attr: 'data-tri' })} · extra damage ${inp(`weapons.${i}.extra`, w.extra || "", { ph: "e.g. 1d6 fire", style: "width:110px" })}</td></tr>`).join("")}</table>
    <div class="row" style="margin-top:8px"><select id="addw">${WEAPONS.map(w => `<option>${w.name}</option>`).join("")}</select><button class="small" data-act="addWeapon">Add weapon</button></div>
  </div></div>
  ${startEquipCard(c, D)}
  <div class="card"><h3>Equipment & items</h3>
    <table class="t"><tr><th>Item</th><th class="num">Qty</th><th>Notes</th><th></th></tr>
    ${c.items.map((it, i) => `<tr><td>${inp(`items.${i}.name`, it.name, { style: "width:100%" })}</td><td class="num">${inp(`items.${i}.qty`, +it.qty || 1, { type: "number", style: "width:60px" })}</td><td>${inp(`items.${i}.note`, it.note || "", { style: "width:100%" })}</td><td><button class="small ghost" data-act="del" data-p="items" data-i="${i}">✕</button></td></tr>`).join("")}</table>
    <button class="small" style="margin-top:8px" data-act="addItem">+ Add item</button>
  </div>`;
}

function armorInfo(a, D) {
  const kind = { light: "Light", medium: "Medium", heavy: "Heavy" }[a.kind];
  const parts = [kind + " armor", "AC " + a.base + (a.kind === "light" ? " + Dex" : a.kind === "medium" ? " + Dex (max 2)" : "")];
  if (a.str) parts.push(`needs Str ${a.str}` + (D && D.score.str < a.str ? " ✗ (−10 ft speed)" : " ✓"));
  if (a.stealth) parts.push("Disadvantage on Stealth");
  if (D && !D.armorTraining.includes(kind + " armor")) parts.push("✗ NOT trained: Disadvantage on Str/Dex rolls and no spellcasting");
  return parts.join(" · ");
}
function armorSelect(c, D) {
  const groups = [["light", "Light armor"], ["medium", "Medium armor"], ["heavy", "Heavy armor"]];
  return `<select ${bindA("armor")}><option value="" ${!c.armor ? "selected" : ""}>No armor</option>${groups.map(([k, l]) => {
    const trained = D.armorTraining.includes(l);
    return `<optgroup label="${l}${trained ? "" : " — not trained"}">${Object.entries(ARMOR).filter(([id, a]) => a.kind === k).map(([id, a]) =>
      `<option value="${id}" ${c.armor === id ? "selected" : ""}>${a.name} — AC ${a.base}${k === "light" ? "+Dex" : k === "medium" ? "+Dex(2)" : ""}${a.str ? " · Str " + a.str : ""}${a.stealth ? " · Stealth dis." : ""}</option>`).join("")}</optgroup>`;
  }).join("")}</select>`;
}
function equipOptions(c, D, which) {
  // which: "class" | "bg"
  const line = l => l.map(esc).join(", ");
  const cur = (c.startEquip || {})[which] || "";
  const name = which === "class" ? "sec" : "seb";
  let opts;
  if (which === "class") { const ce = D.startCls ? START_EQUIP.class[D.startCls] : null; if (!ce) return ""; opts = Object.entries(ce); }
  else { const be = START_EQUIP.background[c.background.id]; if (!be) return ""; opts = [["A", be], ["B", [START_EQUIP.backgroundGold + " GP"]]]; }
  return opts.map(([k, l]) => `<label class="eqopt ${cur === k ? "on" : ""}"><input type="radio" name="${name}" data-act="seOpt" data-w="${which}" value="${k}" ${cur === k ? "checked" : ""}> <b>${k}:</b> ${line(l)}</label>`).join("")
    + `<label class="eqopt ${!cur ? "on" : ""}"><input type="radio" name="${name}" data-act="seOpt" data-w="${which}" value="" ${!cur ? "checked" : ""}> <span class="muted">None (I'll add equipment myself)</span></label>`;
}
function startEquipCard(c, D) {
  const ce = D.startCls ? START_EQUIP.class[D.startCls] : null, be = START_EQUIP.background[c.background.id];
  if (!ce && !be) return `<div class="card"><h3>Starting equipment</h3><p class="muted small">Choose a class and background first.</p></div>`;
  return `<div class="card"><h3>Starting equipment</h3><p class="small muted">Pick an option — its contents are added to your weapons, armor, items and coins right away. Switching swaps them out.</p>
    ${ce ? `<p><b>${CLASSES[D.startCls].name}</b></p>${equipOptions(c, D, "class")}` : ""}
    ${be ? `<p style="margin-top:8px"><b>${esc(BACKGROUNDS[c.background.id].name)}</b></p>${equipOptions(c, D, "bg")}` : ""}</div>`;
}
// add an equipment option; everything added is tagged with its source so switching options removes it again
function applyStartEquip(c, list, src) {
  c.startEquip ||= {}; c.startGold ||= {};
  if (src) {
    c.weapons = c.weapons.filter(w => w.src !== src);
    c.items = c.items.filter(it => it.src !== src);
    c.coins.gp = Math.max(0, (+c.coins.gp || 0) - (c.startGold[src] || 0)); c.startGold[src] = 0;
    if (c.armorSrc === src) { c.armor = ""; c.armorSrc = ""; }
    if (c.shieldSrc === src) { c.shield = false; c.shieldSrc = ""; }
  }
  for (const raw of list || []) {
    let m = raw.match(/^(\d+)\s*GP$/i); if (m) { c.coins.gp = (+c.coins.gp || 0) + +m[1]; if (src) c.startGold[src] += +m[1]; continue; }
    m = raw.match(/^(\d+)\s+(.*)$/); const qty = m ? +m[1] : 1; const name = m ? m[2] : raw;
    const w = WEAPONS.find(x => x.name.toLowerCase() === name.toLowerCase());
    if (w) { c.weapons.push({ name: w.name, base: w.name, magic: 0, notes: qty > 1 ? "×" + qty : "", src }); continue; }
    const ak = Object.keys(ARMOR).find(k => k && ARMOR[k].name.toLowerCase() === name.toLowerCase());
    if (ak) { c.armor = ak; c.armorSrc = src; continue; }
    if (/^shield$/i.test(name)) { c.shield = true; c.shieldSrc = src; continue; }
    c.items.push({ name, qty, note: "", src });
  }
}

function bStory(c) {
  return `<div class="grid g2"><div class="card"><h3>Backstory</h3><textarea data-live="backstory" style="min-height:300px">${esc(c.backstory)}</textarea>
    <h3 style="margin-top:12px">Notes</h3><textarea data-live="notes" style="min-height:160px">${esc(c.notes)}</textarea></div>
  <div class="card"><h3>Backstory image</h3>${c.storyImage ? `<img src="${c.storyImage}" style="max-width:100%;max-height:300px;border-radius:8px;display:block;margin-bottom:8px">` : '<p class="muted">Optional — shown next to the backstory on page 2.</p>'}
    <div class="row"><button data-act="img" data-k="storyImage">Upload</button>${c.storyImage ? `<button class="ghost" data-act="imgdel" data-k="storyImage">Remove</button>` : ""}</div>
    <h3 style="margin-top:16px">Custom features / items with uses</h3>
    <p class="small muted">Magic items, boons from the DM, companions… They show up on the sheet and in the PDF.</p>
    ${(c.custom || []).map((cf, i) => `<div class="lvl"><div class="row">${inp(`custom.${i}.name`, cf.name, { ph: "Name", style: "flex:1" })}<label>Uses ${inp(`custom.${i}.uses`, +cf.uses || 0, { type: "number" })}</label>${sel(`custom.${i}.reset`, cf.reset || "LR", [["LR", "Long rest"], ["SR", "Short rest"], ["-", "—"]])}<button class="small ghost" data-act="del" data-p="custom" data-i="${i}">✕</button></div>
      <textarea data-live="custom.${i}.text" style="min-height:60px;margin-top:6px" placeholder="Description">${esc(cf.text || "")}</textarea></div>`).join("")}
    <button class="small" data-act="addCustom">+ Add custom feature</button></div></div>`;
}
