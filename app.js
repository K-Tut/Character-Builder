"use strict";
/* ============================================================
   D&D 2024 Character Builder — app logic
   ============================================================ */
const S = { wiki: { pages: {}, spells: {} }, idx: null, chars: [], char: null, draft: null, view: "home", tab: "basics", sheetTab: "features", modal: null, ui: {} };

// ---------- helpers ----------
// fair die roll from the device's cryptographic random generator (rejection sampling avoids any bias)
function rollDie(sides) {
  const a = new Uint32Array(1), lim = Math.floor(0x100000000 / sides) * sides; let x;
  do { crypto.getRandomValues(a); x = a[0]; } while (x >= lim);
  return 1 + (x % sides);
}
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
const norm = s => String(s || "").toLowerCase().replace(/[’'`]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const sgn = n => (n >= 0 ? "+" : "") + n;
const modOf = s => Math.floor((s - 10) / 2);
const clone = o => JSON.parse(JSON.stringify(o));
const at = (arr, l) => Array.isArray(arr) ? (arr[Math.min(Math.max(l, 1), 20) - 1] || 0) : 0;
const val = (spec, l, D) => typeof spec === "function" ? spec(l, D) : Array.isArray(spec) ? at(spec, l) : (spec || 0);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const ABBR = { str: "Str", dex: "Dex", con: "Con", int: "Int", wis: "Wis", cha: "Cha" };

function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.remove("hidden"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.add("hidden"), 2200); }

async function api(path, opts = {}) {
  const r = await fetch(path.replace(/^\//, ""), { headers: { "Content-Type": "application/json" }, ...opts, body: opts.body ? JSON.stringify(opts.body) : undefined });
  return r.json();
}

// ---------- wiki index ----------
function stripSource(t) { return String(t || "").split("\n").filter(l => !/^source\s*:/i.test(l.trim())).join("\n").trim(); }
function headingKeys(t) {
  let base = t.replace(/^level\s*\d+\s*[:.\-–]\s*/i, "");
  const keys = new Set([norm(base), norm(base.replace(/\(.*?\)/g, ""))]);
  if (base.includes(":")) keys.add(norm(base.split(":").pop()));
  return [...keys].filter(Boolean);
}
function buildIndex() {
  const idx = { sec: {}, pages: {}, spell: {}, spellList: [] };
  const fromSlug = slug => slug.split(":").pop().split("-").map((w, i) => i && ["of", "the", "and", "or", "in", "to", "a", "with", "from"].includes(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  for (const [slug, p] of Object.entries(S.wiki.pages || {})) {
    if (!p.title) p.title = fromSlug(slug);
    (idx.pages[p.cat] ||= []).push({ slug, title: p.title, n: norm(p.title) });
    for (const [t, txt] of p.sections || []) {
      if (!t || !txt) continue;
      for (const k of headingKeys(t)) (idx.sec[k] ||= []).push({ slug, text: txt, cat: p.cat });
    }
  }
  for (const [slug, s] of Object.entries(S.wiki.spells || {})) {
    if (s.level === null || s.level === undefined) continue;
    if (!s.name) s.name = fromSlug(slug);
    idx.spell[norm(s.name)] = s; idx.spellList.push(s);
  }
  idx.spellList.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
  S.idx = idx; idx.feats = null;
}
function findPage(cat, name, exclude, fuzzy) {
  const list = (S.idx.pages[cat] || []).filter(p => !exclude || !exclude(p));
  const n = norm(name); if (!n) return null;
  let hit = list.find(p => p.n === n) || list.find(p => p.n.endsWith(" " + n) || p.n.startsWith(n + " ")) || list.find(p => p.n.includes(n));
  if (!hit && fuzzy) {
    const stop = new Set(["of", "the", "path", "college", "domain", "circle", "oath", "warrior", "patron", "sorcery", "and"]);
    const toks = n.split(" ").filter(t => !stop.has(t));
    let best = 0;
    for (const p of list) { const sc = toks.filter(t => p.n.split(" ").includes(t)).length; if (sc > best) { best = sc; hit = p; } }
  }
  return hit ? hit.slug : null;
}
function pageText(slug) { const p = S.wiki.pages[slug]; return p ? stripSource(p.text.replace(/^##\s*/gm, "")) : ""; }
function lookup(name, slugs = []) {
  const keys = headingKeys(name);
  for (const k of keys) {
    const arr = S.idx.sec[k]; if (!arr) continue;
    for (const s of slugs) { const h = arr.find(a => a.slug === s); if (h) return stripSource(h.text); }
  }
  for (const k of keys) {
    const arr = S.idx.sec[k]; if (!arr) continue;
    const h = arr.find(a => a.cat !== "spell") || arr[0]; if (h) return stripSource(h.text);
  }
  return "";
}
function spellInfo(name) { return S.idx.spell[norm(name)] || null; }
function classSlug(cls) { return S.wiki.pages[cls + ":main"] ? cls + ":main" : findPage(cls, CLASSES[cls].name); }
function subclassSlug(cls, sub) { const sc = CLASSES[cls].subclasses[sub]; return sc ? findPage(cls, sc.name, p => p.slug.endsWith(":main"), true) : null; }

// ---------- feat catalog: built-in feats + every feat page from the wiki ----------
const FEAT_CATS = { origin: "Origin feats", general: "General feats", style: "Fighting Style feats", boon: "Epic Boon feats", other: "Other feats" };
function parseFeatAbil(t) {
  const m = String(t).match(/[^.\n]*(?:score[s]? by 1|by 1, to a maximum of)[^.\n]*/i); if (!m) return null;
  const s = m[0].toLowerCase();
  if (/one ability score of your choice|any ability|one of your ability scores/.test(s)) return ABILITIES.slice();
  const out = ABILITIES.filter(a => s.includes(ABILITY_NAMES[a].toLowerCase()));
  return out.length ? out : null;
}
function normSource(x) {
  x = String(x).trim().replace(/\s*\(.*$/, "").replace(/[,;].*$/, "");
  if (/^(phb|player'?s handbook|player’s handbook)( 2024)?$/i.test(x) || /player'?s handbook/i.test(x)) return "Player's Handbook";
  if (/faer[uû]n|forgotten realms/i.test(x)) return "Heroes of Faerûn";
  if (/eberron|artificer/i.test(x)) return "Eberron: Forge of the Artificer";
  return x;
}
function featCatalog() {
  if (S.idx.feats) return S.idx.feats;
  const map = {};
  for (const [n, fd] of Object.entries(FEATS)) map[norm(n)] = { name: n, cat: fd.cat, abil: fd.abil || null, source: "Player's Handbook", builtin: true };
  for (const p of S.idx.pages.feat || []) {
    if (/:all$/.test(p.slug) || /\ball\b/i.test(p.title)) continue;
    const page = S.wiki.pages[p.slug]; const t = page.text || "";
    const e = map[p.n] || (map[p.n] = { name: p.title, builtin: false });
    e.slug = p.slug;
    const catM = t.match(/\b(Origin|General|Fighting Style|Epic Boon)\s+Feat/i);
    if (!e.builtin && catM) e.cat = { "origin": "origin", "general": "general", "fighting style": "style", "epic boon": "boon" }[catM[1].toLowerCase()];
    if (!e.cat) e.cat = "other";
    const srcM = t.match(/Source:\s*([^\n]+)/i); if (srcM) e.source = normSource(srcM[1]);
    if (!e.abil) e.abil = parseFeatAbil(t);
    const pre = t.match(/Prerequisite[s]?:\s*([^\n)]+)/i); if (pre) e.prereq = pre[1].trim();
  }
  for (const e of Object.values(map)) e.source = e.source || "Player's Handbook";
  return S.idx.feats = map;
}
function featInfo(name) { return featCatalog()[norm(name)] || null; }
function featDesc(name) { const fi = featInfo(name); return fi && fi.slug ? pageText(fi.slug) : lookup(name); }

// ---------- character model ----------
function newChar() {
  return {
    v: 1, id: "c" + Date.now().toString(36), name: "New Hero", player: "",
    species: { id: "", choice: "", size: "" }, speciesFeat: null,
    background: { id: "", mode: "21", plus2: "", plus1: "", tool: "" }, bgFeat: { picks: {} },
    abilMethod: "pointbuy", base: { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 },
    levels: [], subclasses: {}, pools: {}, spells: [],
    armor: "", shield: false, acBonus: 0, initBonus: 0, speedBonus: 0, hpBonus: 0,
    weapons: [], items: [], coins: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    languages: "Common", langExtra: "", optChoices: {}, otherProfs: "", phys: { age: "", height: "", weight: "", eyes: "", hair: "", skin: "", alignment: "" },
    backstory: "", notes: "", portrait: "", storyImage: "", thumb: "",
    custom: [], featureMeta: {},
    play: { hp: null, temp: 0, used: {}, slots: {}, pact: 0, hd: {}, ds: { s: 0, f: 0 }, exhaustion: 0, inspiration: false, conditions: [] }
  };
}

// effective background (normal, with swapped origin feat, or fully custom)
function bgData(c) {
  const b = c.background || {};
  if (b.id === "custom") return { id: "custom", name: b.customName || "Custom background", abil: ABILITIES, feat: b.featOverride || "", skills: (b.skills || []).slice(0, 2), tool: b.tool || "", custom: true };
  const base = BACKGROUNDS[b.id]; if (!base) return null;
  return { ...base, id: b.id, origFeat: base.feat, feat: b.swapFeat ? (b.featOverride || "") : base.feat, featChanged: !!b.swapFeat, tool: base.tool.startsWith("One") ? (b.tool || base.tool) : base.tool };
}

// collect all feats (with ability choices) the character has
function allFeats(c) {
  const out = [];
  const bg = bgData(c);
  if (bg && bg.feat) {
    const m = bg.feat.match(/^(.*?)\s*\((.*)\)$/);
    const name = m ? m[1] : bg.feat;
    const picks = { ...(c.bgFeat.picks || {}) }; if (m) picks.list = m[2];
    out.push({ name, picks, src: "Background (" + bg.name + ")", origin: true });
  }
  return out.concat(restFeats(c));
}
function restFeats(c) {
  const out = [];
  for (const key in c.optChoices || {}) {
    const [pk, opt] = key.split("|"); const ch = c.optChoices[key];
    if (ch && ch.feat && ch.feat.name && (c.pools[pk] || []).includes(opt)) out.push({ ...ch.feat, src: opt });
  }
  if (SPECIES[c.species.id]?.extraOriginFeat && c.speciesFeat?.name) out.push({ ...c.speciesFeat, src: "Species (Versatile)", origin: true });
  c.levels.forEach((lv, i) => {
    if (lv.asi?.mode === "feat" && lv.asi.feat?.name) out.push({ ...lv.asi.feat, src: CLASSES[lv.cls].name + " lvl " + classLevelAt(c, i) });
  });
  return out;
}
function classLevelAt(c, i) { let n = 0; for (let j = 0; j <= i; j++) if (c.levels[j].cls === c.levels[i].cls) n++; return n; }

// ---------- DERIVE: everything computed ----------
function derive(c) {
  const D = { c, warnings: [] };
  D.level = c.levels.length;
  D.pb = 2 + Math.floor((Math.max(D.level, 1) - 1) / 4);
  D.cls = {}; c.levels.forEach(l => D.cls[l.cls] = (D.cls[l.cls] || 0) + 1);
  D.startCls = c.levels[0]?.cls || null;
  const sp = SPECIES[c.species.id];
  const spc = sp?.byChoice?.[c.species.choice] || {};
  D.species = sp; D.speciesChoice = spc;
  D.feats = allFeats(c);

  // ability scores
  const bonus = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
  const bg = bgData(c);
  if (bg) {
    if (c.background.mode === "111") (bg.custom ? [...new Set(c.background.p111 || [])].slice(0, 3) : bg.abil).forEach(a => bonus[a] += 1);
    else { if (c.background.plus2) bonus[c.background.plus2] += 2; if (c.background.plus1 && c.background.plus1 !== c.background.plus2) bonus[c.background.plus1] += 1; }
  }
  let max30 = {};
  c.levels.forEach(lv => {
    const a = lv.asi; if (!a) return;
    if (a.mode === "asi") { if (a.t === "11") { if (a.a1) bonus[a.a1] += 1; if (a.a2) bonus[a.a2] += 1; } else if (a.a1) bonus[a.a1] += 2; }
  });
  D.feats.forEach(f => { const fi = featInfo(f.name); if (fi && fi.abil && f.abil) { bonus[f.abil] += 1; if (fi.cat === "boon") max30[f.abil] = 1; } });
  D.bonus = bonus; D.score = {}; D.mod = {};
  ABILITIES.forEach(a => { D.score[a] = Math.min((+c.base[a] || 8) + bonus[a], max30[a] ? 30 : 20); D.mod[a] = modOf(D.score[a]); });

  // subclass + per-class info
  D.subs = {};
  for (const k in D.cls) { const sk = c.subclasses[k]; if (sk && CLASSES[k].subclasses[sk]) D.subs[k] = CLASSES[k].subclasses[sk]; }

  // pools (max counts)
  D.pools = {};
  const addPool = (key, n, ctx) => { if (!n) return; const p = D.pools[key] ||= { max: 0, ctxs: [] }; if (key === "mastery") p.max = Math.max(p.max, n); else p.max += n; if (ctx) p.ctxs.push(ctx); };
  for (const k in D.cls) {
    const C = CLASSES[k], l = D.cls[k];
    const nSk = k === D.startCls ? C.skills.n : (C.mc.skills || 0);
    if (nSk) addPool("skills:" + k, nSk, C);
    for (const pk in C.pools || {}) addPool(pk, at(C.pools[pk], l), C);
    const sub = D.subs[k]; if (sub) for (const pk in sub.pools || {}) addPool(pk, at(sub.pools[pk], l), C);
  }
  if (sp) for (const pk in sp.pools || {}) addPool(pk, sp.pools[pk]);
  addPool("langOrigin", 2);
  const picked = k => (c.pools[k] || []);

  // option effects (Protector, Magician...)
  D.fx = { cantrips: 0, armor: [], wprof: [], acArmored: 0 };
  for (const k in c.pools) for (const o of c.pools[k]) { const fx = OPTION_FX[o]; if (fx && D.pools[k]) { for (const f in fx) Array.isArray(fx[f]) ? D.fx[f].push(...fx[f]) : D.fx[f] += fx[f]; } }

  // proficiencies: skills
  const prof = new Set(), exp = new Set(), tools = new Set();
  if (bg) { bg.skills.forEach(s => prof.add(s)); if (bg.tool) tools.add(bg.tool); }
  for (const k in D.pools) if (k.startsWith("skills:") || k === "skillsLore" || k === "keenSenses" || k === "skillful" || k === "primalKnowledge") picked(k).slice(0, D.pools[k].max).forEach(s => prof.add(s));
  D.feats.forEach(f => {
    if (f.name === "Skilled") (f.picks?.skills || []).forEach(s => SKILLS[s] ? prof.add(s) : tools.add(s));
    if (f.name === "Skill Expert" && f.picks?.skill) prof.add(f.picks.skill);
  });
  D.profSkills = ALL_SKILLS.filter(s => prof.has(s));
  picked("expertise").slice(0, D.pools.expertise?.max || 0).forEach(s => prof.has(s) && exp.add(s));
  D.feats.forEach(f => { if (f.name === "Skill Expert" && f.picks?.expert && prof.has(f.picks.expert)) exp.add(f.picks.expert); });
  // Pool context for expertise options
  if (D.pools.expertise) D.pools.expertise.ctxs = [{ profSkills: D.profSkills }];

  // saves
  D.saveProf = new Set(D.startCls ? CLASSES[D.startCls].saves : []);
  D.feats.forEach(f => { if (FEATS[f.name]?.saveFromAbil && f.abil) D.saveProf.add(f.abil); });
  D.save = {}; ABILITIES.forEach(a => D.save[a] = D.mod[a] + (D.saveProf.has(a) ? D.pb : 0));

  // jack of all trades
  const jack = (D.cls.bard || 0) >= 2 ? Math.floor(D.pb / 2) : 0;
  D.skill = {};
  ALL_SKILLS.forEach(s => { const a = SKILLS[s]; D.skill[s] = { v: D.mod[a] + (exp.has(s) ? 2 * D.pb : prof.has(s) ? D.pb : jack), p: prof.has(s), e: exp.has(s), a }; });
  // languages: Common + 2 standard + class languages + Deft Explorer + extras
  const langs = ["Common"];
  const addL = l => { l = String(l || "").trim(); if (l && !langs.some(x => x.toLowerCase() === l.toLowerCase())) langs.push(l); };
  picked("langOrigin").slice(0, 2).forEach(addL);
  for (const k in D.cls) if (CLASS_LANGS[k]) addL(CLASS_LANGS[k]);
  picked("langDeft").slice(0, D.pools.langDeft?.max || 0).forEach(addL);
  String(c.langExtra || "").split(/[,;]/).forEach(addL);
  D.languages = langs;
  D.passive = { perception: 10 + D.skill.Perception.v, insight: 10 + D.skill.Insight.v, investigation: 10 + D.skill.Investigation.v };

  // armor & weapon training
  const armorT = new Set(), wT = new Set();
  for (const k in D.cls) {
    const C = CLASSES[k], src = k === D.startCls ? C : C.mc;
    (src.armor || []).forEach(x => armorT.add(x)); (src.wprof || []).forEach(x => wT.add(x)); (src.tools || []).forEach(x => tools.add(x));
    if (k !== D.startCls) C.wprof.forEach(x => x === "simple" && wT.add(x));
    const sub = D.subs[k]; if (sub) { (sub.armor || []).forEach(x => armorT.add(x)); (sub.wprof || []).forEach(x => wT.add(x)); (sub.tools || []).forEach(x => tools.add(x)); }
  }
  D.fx.armor.forEach(x => armorT.add(x)); D.fx.wprof.forEach(x => wT.add(x));
  D.feats.forEach(f => { const fd = FEATS[f.name] || {}; (fd.armor || []).forEach(x => armorT.add(x)); (fd.wprof || []).forEach(x => wT.add(x)); });
  D.armorTraining = ["Light armor", "Medium armor", "Heavy armor", "Shields"].filter(x => armorT.has(x));
  D.wprof = wT;
  D.weaponText = wT.has("martial") ? "Simple and Martial weapons" : [wT.has("simple") && "Simple weapons", wT.has("martialFL") && "Martial weapons with Finesse or Light", wT.has("martialL") && "Martial weapons with Light", wT.has("martialRanged") && "Martial ranged weapons"].filter(Boolean).join(", ");
  D.tools = [...tools].filter(Boolean);

  // HP
  let hp = 0;
  c.levels.forEach((lv, i) => {
    const hd = CLASSES[lv.cls].hd;
    const g = i === 0 ? hd : (lv.hp ?? (hd / 2 + 1));
    hp += Math.max(1, g + D.mod.con);
  });
  if (sp?.hpPerLevel) hp += sp.hpPerLevel * D.level;
  D.feats.forEach(f => { const fd = FEATS[f.name] || {}; if (fd.hpPerLevel) hp += fd.hpPerLevel * D.level; if (fd.hpFlat) hp += fd.hpFlat; });
  for (const k in D.subs) if (D.subs[k].hpPerLevel) hp += D.subs[k].hpPerLevel * D.cls[k];
  D.hpMax = Math.max(hp + (+c.hpBonus || 0), D.level ? 1 : 0);
  D.hitDice = Object.keys(D.cls).map(k => ({ die: "d" + CLASSES[k].hd, n: D.cls[k], cls: k }));
  // merge dice of same size
  const hdm = {}; D.hitDice.forEach(h => hdm[h.die] = (hdm[h.die] || 0) + h.n); D.hitDice = Object.entries(hdm).map(([die, n]) => ({ die, n }));

  // AC
  const arm = ARMOR[c.armor] || ARMOR[""];
  const unarmoredAbils = [];
  for (const k in D.cls) { (CLASSES[k].unarmored || []).forEach(a => unarmoredAbils.push([k, a])); (D.subs[k]?.unarmored || []).forEach(a => unarmoredAbils.push([k, a])); }
  let ac;
  const styles = picked("fightingStyle");
  if (arm.kind === "none") {
    ac = 10 + D.mod.dex;
    for (const [k, a] of unarmoredAbils) { if (k === "monk" && c.shield) continue; ac = Math.max(ac, 10 + D.mod.dex + D.mod[a]); }
  } else if (arm.kind === "light") ac = arm.base + D.mod.dex;
  else if (arm.kind === "medium") ac = arm.base + Math.min(D.mod.dex, D.feats.some(f => f.name === "Medium Armor Master") ? 3 : 2);
  else ac = arm.base;
  if (c.shield) ac += 2;
  if (arm.kind !== "none" && styles.includes("Defense")) ac += 1;
  ac += +c.acBonus || 0;
  D.ac = ac; D.armor = arm;
  if (arm.kind !== "none" && arm.kind !== "light" && !armorT.has(cap(arm.kind) + " armor")) D.warnings.push(`Not trained in ${arm.kind} armor`);
  if (arm.kind === "light" && !armorT.has("Light armor")) D.warnings.push("Not trained in light armor");

  // initiative / speed / senses
  D.init = D.mod.dex + (D.feats.some(f => f.name === "Alert") ? D.pb : 0) + jack + (+c.initBonus || 0);
  let speed = (spc.speed || sp?.speed || 30);
  for (const k in D.cls) {
    const C = CLASSES[k];
    if (C.speedBonus && !(k === "monk" && (arm.kind !== "none" || c.shield))) speed += C.speedBonus(D.cls[k]);
    if (k === "barbarian" && D.cls[k] >= 5 && arm.kind !== "heavy") speed += 10;
  }
  D.feats.forEach(f => speed += FEATS[f.name]?.speed || 0);
  speed += +c.speedBonus || 0;
  if (arm.str && D.score.str < arm.str) { speed -= 10; D.warnings.push(`${arm.name} needs Strength ${arm.str} — speed −10 ft`); }
  if (c.play.exhaustion) speed = Math.max(0, speed - 5 * c.play.exhaustion);
  D.speed = speed;
  D.darkvision = spc.darkvision || sp?.darkvision || 0;
  D.size = c.species.size || (sp ? sp.size.split(" or ")[0] : "Medium");
  D.resist = [...(sp?.resist || []), ...(spc.resist || [])];
  if (sp?.resistFromChoice && c.species.choice) { const m = c.species.choice.match(/\((.*)\)/); if (m) D.resist.push(m[1]); }

  // spellcasting
  D.casters = []; let casterLevel = 0, nCasters = 0;
  for (const k in D.cls) {
    const cs = CLASSES[k].caster || D.subs[k]?.caster; if (!cs) continue;
    const l = D.cls[k];
    let maxLvl = 0;
    if (cs.type === "full") { maxLvl = SLOTS[l].length; casterLevel += l; nCasters++; }
    else if (cs.type === "half") { maxLvl = SLOTS[Math.ceil(l / 2)].length; casterLevel += Math.ceil(l / 2); nCasters++; }
    else if (cs.type === "third") { maxLvl = SLOTS[Math.floor(l / 3)]?.length || 0; casterLevel += Math.floor(l / 3); nCasters++; }
    else if (cs.type === "pact") maxLvl = at(CLASSES[k].pact.lvl, l);
    const ab = cs.ability;
    const extraC = (k === "cleric" && picked("divineOrder").includes("Thaumaturge")) || (k === "druid" && picked("primalOrder").includes("Magician")) ? 1 : 0;
    D.casters.push({ cls: k, name: CLASSES[k].name, list: cs.list || k, type: cs.type, ability: ab, level: l, maxLvl,
      cantrips: at(cs.cantrips, l) + extraC, prepared: at(cs.prepared, l), dc: 8 + D.pb + D.mod[ab], atk: D.pb + D.mod[ab] });
  }
  D.slots = casterLevel ? SLOTS[Math.min(casterLevel, 20)] : [];
  if (D.cls.warlock) { const l = D.cls.warlock; D.pact = { n: at(CLASSES.warlock.pact.n, l), lvl: at(CLASSES.warlock.pact.lvl, l) }; }

  if (sp && sp.spellAbility) {
    const ab = c.species.spellAbil || ["cha", "wis", "int"].sort((a, b) => D.mod[b] - D.mod[a])[0];
    D.speciesCast = { name: sp.name, ability: ab, dc: 8 + D.pb + D.mod[ab], atk: D.pb + D.mod[ab], chosen: !!c.species.spellAbil };
  }
  // always-prepared spells
  D.alwaysSpells = [];
  for (const k in D.subs) {
    const sub = D.subs[k]; if (!sub.spells) continue;
    for (const lv in sub.spells) if (D.cls[k] >= +lv) sub.spells[lv].forEach(n => D.alwaysSpells.push({ name: n, cls: k, src: sub.name }));
  }
  const spSpells = { ...(sp?.spells || {}) }; for (const lv in spc.spells || {}) spSpells[lv] = [...(spSpells[lv] || []), ...spc.spells[lv]];
  for (const lv in spSpells) if (D.level >= +lv || (D.level === 0 && +lv === 1)) spSpells[lv].forEach(n => D.alwaysSpells.push({ name: n, cls: "species", src: sp.name + (c.species.choice ? " (" + c.species.choice + ")" : "") }));

  // resources
  D.resources = [];
  const pushRes = (r, l, src) => {
    const n = val(r.n, l, D); if (!n) return;
    D.resources.push({ key: r.key, name: r.name, max: n, reset: typeof r.reset === "function" ? r.reset(l) : r.reset, note: r.note || "", die: r.die ? r.die(l, D) : "", feature: r.feature, src });
  };
  for (const k in D.cls) {
    (CLASSES[k].resources || []).forEach(r => pushRes(r, D.cls[k], CLASSES[k].name));
    (D.subs[k]?.resources || []).forEach(r => pushRes(r, D.cls[k], D.subs[k].name));
  }
  (sp?.resources || []).forEach(r => pushRes(r, D.level, sp.name));
  D.feats.forEach(f => { const fd = FEATS[f.name]; if (fd?.res) pushRes({ key: "feat_" + norm(f.name), feature: f.name, ...fd.res }, D.level, f.name); });
  if (sp && c.species.id === "human") D.resources.push({ key: "heroic", name: "Heroic Inspiration (Resourceful)", max: 1, reset: "LR", feature: "Resourceful", src: "Human" });
  (c.custom || []).forEach((cf, i) => { if (+cf.uses > 0) D.resources.push({ key: "custom" + i, name: cf.name, max: +cf.uses, reset: cf.reset || "LR", feature: cf.name, src: "Custom" }); });

  D.resources.forEach(r => { r.note = r.note || ""; r.die = r.die || ""; });

  // attacks
  D.attacks = c.weapons.map(w => {
    const base = WEAPONS.find(x => x.name === w.base) || { name: w.base || w.name, cat: "simple", dmg: w.dmg || "1d4", type: "", props: "", mastery: "" };
    const props = base.props.toLowerCase();
    const ranged = base.cat.endsWith("R");
    const monkWeapon = D.cls.monk && (base.cat === "unarmed" || base.cat.startsWith("simple") || (base.cat.startsWith("martial") && props.includes("light")));
    let ab = w.abil && w.abil !== "auto" ? w.abil : ranged ? "dex" : props.includes("finesse") || monkWeapon ? (D.mod.dex > D.mod.str ? "dex" : "str") : "str";
    if ((!w.abil || w.abil === "auto") && D.subs.artificer?.battleReady && (+w.magic || 0) > 0 && D.mod.int > D.mod[ab]) ab = "int";   // Battle Ready
    const isMartial = base.cat.startsWith("martial");
    let proficient = base.cat === "unarmed" || (base.cat.startsWith("simple") && wT.has("simple")) || (isMartial && (wT.has("martial") || (wT.has("martialFL") && /finesse|light/.test(props)) || (wT.has("martialL") && props.includes("light")) || (wT.has("martialRanged") && base.cat === "martialR")));
    if (w.prof === true) proficient = true; if (w.prof === false) proficient = false;
    const magic = +w.magic || 0;
    let hit = D.mod[ab] + (proficient ? D.pb : 0) + magic + (ranged && styles.includes("Archery") ? 2 : 0);
    let dice = base.dmg;
    if (base.cat === "unarmed" && D.cls.monk) dice = "1d" + at(step({ 1: 6, 5: 8, 11: 10, 17: 12 }), D.cls.monk);
    const dmod = D.mod[ab] + magic;
    const dmg = (dice === "1" && base.cat === "unarmed" && !D.cls.monk) ? `${Math.max(1, 1 + D.mod.str)} ${base.type}` : `${dice}${dmod ? sgn(dmod) : ""} ${base.type}`;
    const mastery = picked("mastery").some(m => m.startsWith(base.name + " (")) ? base.mastery : "";
    const exDice = (w.extra || "").match(/\d*d\d+(\s*[+-]\s*\d+)?/);
    const dmgFormula = ((dice === "1" && base.cat === "unarmed" && !D.cls.monk) ? String(Math.max(1, 1 + D.mod.str)) : `${dice}${dmod ? sgn(dmod) : ""}`) + (exDice ? "+" + exDice[0].replace(/\s+/g, "") : "");
    return { dmgFormula, name: w.name || base.name, props: [base.props, mastery && "Mastery: " + mastery].filter(Boolean).join("; "), hit, dmg: dmg + (w.extra ? " + " + w.extra : ""), formula: `d20+${ABBR[ab]}${proficient ? "+Prof" : ""}${magic ? "+" + magic : ""}`, dformula: `${dice}+${ABBR[ab]}`, notes: w.notes || "" };
  });

  D.features = collectFeatures(c, D);
  D.summary = summary(c, D);
  return D;
}

function summary(c, D) {
  const cls = Object.keys(D.cls).map(k => CLASSES[k].name + (D.subs[k] ? " (" + D.subs[k].name + ")" : "") + (Object.keys(D.cls).length > 1 ? " " + D.cls[k] : "")).join(" / ");
  return [D.species?.name, cls, D.level ? "Level " + D.level : "Level 0"].filter(Boolean).join(" · ");
}
function classLine(D) {
  return Object.keys(D.cls).map(k => CLASSES[k].name + (D.subs[k] ? " (" + D.subs[k].name + ")" : "") + (Object.keys(D.cls).length > 1 ? " " + D.cls[k] : "")).join(" / ") || "—";
}

// ---------- option descriptions (invocations, metamagic, maneuvers, fighting styles…) ----------
function optionText(pk, o) {
  const name = String(o).replace(/\s*\((Slow|Nick|Push|Sap|Topple|Vex|Graze|Cleave)\)$/, "");
  const prefer = { invocations: ["warlock:main", "warlock:eldritch-invocations", "warlock:invocations"], metamagic: ["sorcerer:main", "sorcerer:metamagic"],
    maneuvers: [subclassSlug("fighter", "battlemaster"), "fighter:battle-master", "fighter:maneuvers"], divineOrder: ["cleric:main"], primalOrder: ["druid:main"], armorModel: [subclassSlug("artificer", "armorer")], fightingStyle: [] }[pk] || [];
  if (pk === "fightingStyle") { const s = (S.idx.pages.feat || []).find(p => p.n === norm(name)); if (s) return pageText(s.slug); }
  if (pk === "mastery") { const s = (S.idx.pages.mastery || []).find(p => p.n === norm(name)); if (s) return pageText(s.slug); }
  for (const cat of ["invocation", "eldritch-invocation", "metamagic", "maneuver"]) { const s = (S.idx.pages[cat] || []).find(p => p.n === norm(name)); if (s) return pageText(s.slug); }
  // exact heading match only, preferring the right class pages
  const keys = headingKeys(name);
  for (const k of keys) { const arr = S.idx.sec[k]; if (!arr) continue; for (const sl of prefer) { const h = arr.find(a => a.slug === sl); if (h) return stripSource(h.text); } }
  for (const k of keys) { const arr = S.idx.sec[k]; if (!arr) continue; const h = arr.find(a => a.cat !== "spell" && a.cat !== "feat") || arr.find(a => a.cat !== "spell"); if (h) return stripSource(h.text); }
  return "";
}

// ---------- features ----------
const ACTIVE_RX = /\b(bonus action|reaction|magic action|as an action|take the [a-z]+ action|you can expend|expend|once per|uses? of this|regain all expended|short or long rest)\b/i;
const DEFAULT_HIDDEN = new Set(["Spellcasting", "Pact Magic", "Ability Score Improvement"]);
function collectFeatures(c, D) {
  const F = []; const seen = new Set();
  const add = (key, name, src, text, extra = {}) => {
    if (seen.has(key)) { const f = F.find(x => x.key === key); if (f && extra.note) f.note = extra.note; return; }
    seen.add(key);
    const meta = c.featureMeta[key] || {};
    const res = D.resources.find(r => r.feature && norm(r.feature) === norm(extra.base || name));
    const t = meta.text ?? text ?? "";
    const active = meta.active ?? (!!res || ACTIVE_RX.test(t));
    F.push({ key, name, src, text: t, edited: meta.text != null, active, hidden: meta.hidden ?? DEFAULT_HIDDEN.has(name), res, ...extra });
  };
  // species
  const sp = D.species;
  if (sp) {
    const slug = findPage("species", sp.name);
    for (const lv in sp.traits) for (const t of sp.traits[lv]) {
      if (D.level < +lv && D.level > 0) continue;
      let name = t; if (sp.choice && sp.choice.label === t && c.species.choice) name = t + ": " + c.species.choice;
      add("sp:" + t, name, sp.name, lookup(t, slug ? [slug] : []), { cat: "species", base: t });
    }
  }
  // feats
  D.feats.forEach((f, i) => {
    let nm = f.name; if (f.picks?.list) nm += " (" + f.picks.list + ")"; if (f.picks?.type) nm += " (" + f.picks.type + ")";
    add("feat:" + norm(f.name) + ":" + i, nm, f.src, featDesc(f.name), { cat: "feat" });
  });
  // classes
  for (const k in D.cls) {
    const C = CLASSES[k], l = D.cls[k], slug = classSlug(k);
    const sub = D.subs[k]; const sslug = sub ? subclassSlug(k, c.subclasses[k]) : null;
    for (let lv = 1; lv <= l; lv++) {
      for (const name of C.features[lv] || []) {
        if (name === "@asi" || name === "@boon" || name === "@sub") continue;
        let note = C.notes?.[name] ? C.notes[name](l, D) : "";
        if (name === "Weapon Mastery" && D.pools.mastery) note = (c.pools.mastery || []).slice(0, D.pools.mastery.max).join(", ");
        add(k + ":" + name, name, C.name + " " + lv, lookup(name, [slug].filter(Boolean)), { note, cat: "class" });
      }
      if (sub) for (const name of sub.features[lv] || []) {
        const note = sub.notes?.[name] ? sub.notes[name](l, D) : "";
        add(k + ":" + c.subclasses[k] + ":" + name, name, sub.name + " " + lv, lookup(name, [sslug, slug].filter(Boolean)), { note, cat: "subclass" });
      }
    }
  }
  // pool picks (fighting styles, invocations, metamagic, maneuvers, orders)
  const poolSlugs = { invocations: ["warlock:main"], metamagic: ["sorcerer:main"], maneuvers: [subclassSlug("fighter", "battlemaster")], divineOrder: ["cleric:main"], primalOrder: ["druid:main"] };
  for (const pk of ["fightingStyle", "invocations", "metamagic", "maneuvers", "divineOrder", "primalOrder", "armorModel"]) {
    const p = D.pools[pk]; if (!p) continue;
    (c.pools[pk] || []).slice(0, p.max).forEach((o, i) => {
      const text = optionText(pk, o);
      const ch = (c.optChoices || {})[pk + "|" + o] || {};
      const extra = ch.feat?.name || ch.cantrip || ch.text || "";
      add("pool:" + pk + ":" + o + ":" + i, o + (extra ? " → " + extra : ""), POOLS[pk].label, text, { cat: "option", base: o });
    });
  }
  // custom
  (c.custom || []).forEach((cf, i) => add("custom:" + i, cf.name || "Custom feature", "Custom", cf.text, { cat: "custom", customIdx: i }));
  return F;
}
