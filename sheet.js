"use strict";
/* ============ PLAY SHEET + MODALS + EVENTS ============ */

function pips(key, max, used, label) {
  const rem = Math.max(0, max - (used || 0));
  if (max > 12) return `<span class="row" style="gap:4px"><button class="small ghost" data-act="resStep" data-k="${key}" data-d="1">−</button><b>${rem}</b><span class="muted">/ ${max}</span><button class="small ghost" data-act="resStep" data-k="${key}" data-d="-1">+</button></span>`;
  return `<span class="pips" title="${esc(label || "")}">${Array.from({ length: max }, (_, i) => `<span class="pip ${i < rem ? "" : "used"}" data-act="pip" data-k="${key}" data-i="${i}" data-m="${max}"></span>`).join("")}</span>`;
}

function renderSheet() {
  const c = S.char, D = derive(c), P = c.play;
  if (!D.level) return `<div class="card"><h2>${esc(c.name)}</h2><p>This character has no class levels yet.</p><button data-act="levelup">Choose first class</button> <button class="ghost" data-act="view" data-v="builder">Open builder</button></div>`;
  const hp = Math.min(P.hp ?? D.hpMax, D.hpMax);
  const pct = Math.max(0, Math.min(100, 100 * hp / D.hpMax));
  const bg = BACKGROUNDS[c.background.id];
  let h = `<div class="card"><div class="hero">${c.portrait ? `<img src="${c.portrait}">` : ""}<div class="grow"><h2>${esc(c.name)}</h2>
    <div>${esc(classLine(D))}</div><div class="muted small">${esc([D.species?.name + (c.species.choice ? " (" + c.species.choice + ")" : ""), bg?.name, "Level " + D.level].filter(Boolean).join(" · "))}</div></div>
    <div class="row"><button data-act="levelup">⬆ Level up</button><button class="ghost" data-act="shortRest">☕ Short rest</button><button class="ghost" data-act="longRest">🌙 Long rest</button>
    <button class="ghost" data-act="exportJson" title="Export this character as a file">⤓ Export</button>
    <button class="ghost ${P.inspiration ? "on" : ""}" data-act="insp" style="${P.inspiration ? "background:var(--accent-soft);border-color:var(--accent)" : ""}">${P.inspiration ? "★" : "☆"} Heroic Inspiration</button></div></div></div>`;

  // column 1: abilities & skills
  let c1 = `<div class="card"><h3>Abilities</h3><div class="abil small muted"><span></span><span class="num">Score</span><span class="num">Mod</span><span class="num">Save</span></div>
    ${ABILITIES.map(a => `<div class="abil" style="background:var(--${a})"><b>${ABILITY_NAMES[a]}</b><span class="num">${D.score[a]}</span><span class="m">${sgn(D.mod[a])}</span><span class="num">${D.saveProf.has(a) ? "●" : "○"} ${sgn(D.save[a])}</span></div>`).join("")}</div>
    <div class="card"><h3>Skills</h3>${ALL_SKILLS.map(s => { const k = D.skill[s]; return `<div class="skill" style="background:var(--${k.a})"><span><span class="dot ${k.e ? "e" : k.p ? "p" : ""}"></span>${s} <span class="muted small">${ABBR[k.a]}</span></span><b>${sgn(k.v)}</b></div>`; }).join("")}
    <p class="small" style="margin:8px 0 0">Passive Perception <b>${D.passive.perception}</b> · Insight <b>${D.passive.insight}</b> · Investigation <b>${D.passive.investigation}</b></p></div>
    <div class="card"><h3>Proficiencies</h3><p class="small"><b>Armor:</b> ${esc(D.armorTraining.join(", ") || "none")}<br><b>Weapons:</b> ${esc(D.weaponText || "none")}<br><b>Tools:</b> ${esc(D.tools.join(", ") || "none")}<br><b>Languages:</b> ${esc(c.languages)}${c.otherProfs ? "<br>" + esc(c.otherProfs) : ""}</p></div>`;

  // column 2: combat
  const exh = +P.exhaustion || 0;
  let c2 = `<div class="card"><div class="stats">
    <div class="stat"><div class="v">${D.ac}</div><div class="k">Armor Class</div></div><div class="stat"><div class="v">${sgn(D.init)}</div><div class="k">Initiative</div></div>
    <div class="stat"><div class="v">${D.speed}</div><div class="k">Speed ft</div></div><div class="stat"><div class="v">${sgn(D.pb)}</div><div class="k">Prof. Bonus</div></div></div>
    <p class="small muted" style="margin:8px 0 0">${D.size}${D.darkvision ? " · Darkvision " + D.darkvision + " ft" : ""}${D.resist.length ? " · Resistances: " + esc(D.resist.join(", ")) : ""}</p></div>
  <div class="card"><h3>Hit Points</h3>
    <div class="hpbox"><div><div class="small muted">Current</div><input type="number" data-path="play.hp" data-num value="${hp}"></div>
    <div><div class="small muted">Max</div><div class="big" style="font-size:26px;padding-top:4px">${D.hpMax}</div></div>
    <div><div class="small muted">Temp</div><input type="number" data-path="play.temp" data-num value="${+P.temp || 0}"></div></div>
    <div class="hpbar"><div style="width:${pct}%;background:${pct < 30 ? "#b33" : pct < 60 ? "var(--warn)" : "var(--good)"}"></div></div>
    <div class="row"><input id="hpAmt" type="number" min="0" placeholder="amount" style="width:90px"><button class="danger" data-act="hp" data-m="dmg">Damage</button><button style="background:var(--good)" data-act="hp" data-m="heal">Heal</button><button class="ghost" data-act="hp" data-m="temp">Set temp</button></div>
    <div class="row small" style="margin-top:10px"><b>Hit Dice:</b>${D.hitDice.map(x => `<span>${x.die}: ${pips("hd_" + x.die, x.n, P.hd[x.die])}</span>`).join("")}</div>
    ${hp <= 0 ? `<div class="row" style="margin-top:8px"><b>Death saves</b> ✔ ${[0, 1, 2].map(i => `<input type="checkbox" data-act="ds" data-k="s" data-i="${i}" ${P.ds.s > i ? "checked" : ""}>`).join("")} ✖ ${[0, 1, 2].map(i => `<input type="checkbox" data-act="ds" data-k="f" data-i="${i}" ${P.ds.f > i ? "checked" : ""}>`).join("")}</div>` : ""}
  </div>
  <div class="card"><h3>Conditions</h3><div>${CONDITIONS.map(x => `<span class="chip ${P.conditions.includes(x) ? "acc" : ""}" style="cursor:pointer" data-act="cond" data-v="${x}">${x}</span>`).join("")}</div>
    <div class="row" style="margin-top:8px"><label>Exhaustion ${sel("play.exhaustion", exh, [0, 1, 2, 3, 4, 5, 6], { num: true })}</label>${exh ? `<span class="small warn">−${2 * exh} to d20 tests, −${5 * exh} ft speed${exh >= 6 ? " — DEAD" : ""}</span>` : ""}</div></div>
  <div class="card"><h3>Attacks</h3>${D.attacks.length ? `<table class="t"><tr><th>Weapon</th><th class="num">Hit</th><th>Damage</th></tr>${D.attacks.map(a => `<tr><td><b>${esc(a.name)}</b><div class="small muted">${esc(a.props)}</div></td><td class="num big" style="font-size:17px">${sgn(a.hit)}</td><td>${esc(a.dmg)}</td></tr>`).join("")}</table>` : '<p class="muted small">Add weapons in Build → Equipment.</p>'}
    ${D.cls.rogue ? `<p class="small">Sneak Attack: <b>${Math.ceil(D.cls.rogue / 2)}d6</b></p>` : ""}${D.cls.barbarian ? `<p class="small">Rage damage: <b>+${at(step({ 1: 2, 9: 3, 16: 4 }), D.cls.barbarian)}</b></p>` : ""}</div>`;
  if (D.resources.length) c2 += `<div class="card"><h3>Resources</h3>${D.resources.map(r => `<div class="res"><span class="n"><b>${esc(r.name)}</b>${r.die ? ` <span class="chip">${esc(r.die)}</span>` : ""}<div class="small muted">${r.reset === "SR" ? "Short rest" : r.reset === "LR" ? "Long rest" : ""}${r.note ? " · " + esc(r.note) : ""}</div></span>${pips(r.key, r.max, P.used[r.key])}</div>`).join("")}</div>`;
  if (D.slots.length || D.pact) c2 += `<div class="card"><h3>Spell slots</h3>${D.slots.map((n, i) => `<div class="res"><span class="n">Level ${i + 1}</span>${pips("slot_" + (i + 1), n, P.slots[i + 1])}</div>`).join("")}
    ${D.pact ? `<div class="res"><span class="n">Pact slots (level ${D.pact.lvl}) <span class="small muted">short rest</span></span>${pips("pact", D.pact.n, P.pact)}</div>` : ""}</div>`;

  // column 3: tabs
  const t = S.sheetTab;
  let c3 = `<div class="card"><div class="subtabs">${[["features", "Features"], ["spells", "Spells"], ["inventory", "Inventory"], ["notes", "Notes"], ["story", "Backstory"]].map(([k, l]) => `<button class="${t === k ? "on" : ""}" data-act="sheetTab" data-k="${k}">${l}</button>`).join("")}</div>`;
  if (t === "features") c3 += sheetFeatures(c, D);
  else if (t === "spells") c3 += sheetSpells(c, D);
  else if (t === "inventory") c3 += `<div class="row">${["cp", "sp", "ep", "gp", "pp"].map(k => `<label class="small">${k.toUpperCase()} ${inp("coins." + k, +c.coins[k] || 0, { type: "number", style: "width:64px" })}</label>`).join("")}</div>
    <table class="t" style="margin-top:8px"><tr><th>Item</th><th class="num">Qty</th><th>Notes</th><th></th></tr>${c.items.map((it, i) => `<tr><td>${inp(`items.${i}.name`, it.name, { style: "width:100%" })}</td><td class="num">${inp(`items.${i}.qty`, +it.qty || 1, { type: "number", style: "width:56px" })}</td><td>${inp(`items.${i}.note`, it.note || "", { style: "width:100%" })}</td><td><button class="small ghost" data-act="del" data-p="items" data-i="${i}">✕</button></td></tr>`).join("")}</table>
    <button class="small" style="margin-top:8px" data-act="addItem">+ Add item</button><p class="small muted">Armor: ${esc(D.armor.name)}${c.shield ? " + Shield" : ""} (change in Build → Equipment)</p>`;
  else if (t === "notes") c3 += `<textarea data-live="notes" style="min-height:420px">${esc(c.notes)}</textarea>`;
  else if (t === "story") c3 += `${c.storyImage ? `<img src="${c.storyImage}" style="float:right;max-width:40%;border-radius:8px;margin:0 0 8px 10px">` : ""}<div class="desc">${para(c.backstory) || '<span class="muted">Write the backstory in Build → Story.</span>'}</div>`;
  c3 += `</div>`;
  const mt = S.mtab || "combat";
  const mnav = `<nav class="mnav">${[["combat", "❤", "Combat"], ["stats", "◆", "Stats"], ["features", "★", "Features"], ["spells", "✦", "Spells"], ["inventory", "▣", "Items"], ["notes", "✎", "Notes"]].map(([k, i, l]) => `<button class="${mt === k ? "on" : ""}" data-act="mtab" data-k="${k}"><span>${i}</span>${l}</button>`).join("")}</nav>`;
  return h + `<div class="sheet m-${["combat", "stats"].includes(mt) ? mt : "col3"}"><div class="col1">${c1}</div><div class="col2">${c2}</div><div class="col3">${c3}</div></div>${mnav}`;
}

function featRow(f) {
  return `<div class="feat"><div class="h" data-act="toggleOpen"><b>${esc(f.name)}</b>${f.note ? `<span class="chip">${esc(f.note)}</span>` : ""}<span class="src">${esc(f.src)}</span>
    <button class="small ghost" data-act="featEdit" data-k="${esc(f.key)}" title="Edit">✎</button></div>
    <div class="body hidden"><div class="desc">${para(f.text) || '<span class="muted">No description — click ✎ to add one.</span>'}</div></div></div>`;
}
function sheetFeatures(c, D) {
  const vis = D.features.filter(f => S.ui.showHidden || !f.hidden);
  const act = vis.filter(f => f.active), pas = vis.filter(f => !f.active);
  const nh = D.features.filter(f => f.hidden).length;
  return `<div class="row small"><span class="muted">Click a feature to expand.</span><label class="right"><input type="checkbox" data-act="showHidden" ${S.ui.showHidden ? "checked" : ""}> show hidden (${nh})</label></div>
    <h3 style="margin-top:10px">Active</h3>${act.map(featRow).join("") || '<p class="muted small">—</p>'}<h3 style="margin-top:14px">Passive</h3>${pas.map(featRow).join("") || '<p class="muted small">—</p>'}`;
}
function sheetSpells(c, D) {
  const groups = {};
  const add = (name, src, always, lvlHint) => { const si = spellInfo(name); const l = si?.level ?? lvlHint ?? "?"; (groups[l] ||= []).push({ name, src, always, si }); };
  D.alwaysSpells.forEach(s => add(s.name, s.src, true));
  c.spells.forEach(s => add(s.name, s.cls === "other" ? "Other" : CLASSES[s.cls]?.name || s.cls, false, s.level));
  let h = D.casters.map(cs => `<span class="chip acc">${cs.name}: DC ${cs.dc} · Atk ${sgn(cs.atk)}</span>`).join("") + `<button class="small ghost" data-act="goSpells" style="margin-left:6px">Change spells</button>`;
  if (!Object.keys(groups).length) return h + `<p class="muted">No spells.</p>`;
  for (const l of Object.keys(groups).sort((a, b) => (a === "?" ? 99 : a) - (b === "?" ? 99 : b))) {
    const slotN = +l ? (D.slots[l - 1] || 0) : 0;
    h += `<h3 style="margin-top:12px">${l === "?" ? "Other spells" : +l ? "Level " + l : "Cantrips"} ${+l && slotN ? pips("slot_" + l, slotN, c.play.slots[l]) : ""}</h3>`;
    h += groups[l].sort((a, b) => a.name.localeCompare(b.name)).map(s => `<div class="spell"><div class="h" data-act="toggleOpen"><b style="flex:1">${esc(s.name)}</b>${s.si?.conc ? '<span class="tag">C</span>' : ""}${s.si?.ritual ? '<span class="tag">R</span>' : ""}<span class="muted small">${esc(s.si?.time || "")}${s.si?.range ? " · " + esc(s.si.range) : ""}</span><span class="tag">${esc(s.src)}${s.always ? " ★" : ""}</span></div>
      <div class="body hidden">${s.si ? `<div class="meta">${esc([s.si.time && "Casting time: " + s.si.time, s.si.range && "Range: " + s.si.range, s.si.comp && "Components: " + s.si.comp, s.si.dur && "Duration: " + s.si.dur].filter(Boolean).join(" · "))}</div><div class="desc">${para(s.si.text)}</div>` : '<span class="muted small">No description imported.</span>'}</div></div>`).join("");
  }
  return h;
}

// ---------- MODALS ----------
function openModal(m) { S.modal = m; renderModal(); }
function closeModal() { S.modal = null; S.draft = null; renderModal(); }
function renderModal() {
  const bg = $("#modal"), box = $("#modal-box");
  if (!S.modal) { bg.classList.add("hidden"); return; }
  bg.classList.remove("hidden");
  const st = box.scrollTop;
  box.innerHTML = { levelup: mLevelUp, feature: mFeature, shortRest: mShortRest }[S.modal.type]();
  box.scrollTop = st;
}

function startLevelUp() {
  const c = S.char;
  if (c.levels.length >= 20) return toast("Already level 20");
  S.draft = clone(c);
  const last = c.levels[c.levels.length - 1]?.cls || "";
  S.draft.levels.push({ cls: last, hp: null, asi: null });
  openModal({ type: "levelup", oldD: derive(c) });
}
function mLevelUp() {
  const d = S.draft, i = d.levels.length - 1, lv = d.levels[i];
  const old = S.modal.oldD;
  let h = `<h2>${i === 0 ? "Choose your first class" : `Level up → character level ${i + 1}`}</h2>`;
  // class choice
  const curClasses = Object.keys(old.cls);
  h += `<div class="grid gauto">${Object.entries(CLASSES).sort((a, b) => (curClasses.includes(b[0]) ? 1 : 0) - (curClasses.includes(a[0]) ? 1 : 0)).map(([k, C]) => {
    const has = curClasses.includes(k);
    const meets = C.primary.some(a => old.score[a] >= 13);
    const warn = i > 0 && !has && (!meets || curClasses.some(x => !CLASSES[x].primary.some(a => old.score[a] >= 13)));
    return `<div class="pick ${lv.cls === k ? "on" : ""}" data-act="luClass" data-k="${k}"><b>${C.name}${has ? ` ${old.cls[k]} → ${old.cls[k] + 1}` : ""}</b><span class="small muted">d${C.hd} · ${C.primary.map(a => ABBR[a]).join("/")}${warn ? ' · <span class="warn">multiclass prereq 13</span>' : ""}</span></div>`;
  }).join("")}</div>`;
  if (!lv.cls) return h + `<div class="foot"><button class="ghost" data-act="modalClose">Cancel</button></div>`;
  const D = derive(d), C = CLASSES[lv.cls], cl = D.cls[lv.cls];
  if (i > 0 && !curClasses.includes(lv.cls)) h += `<p class="small warn">${MC_PREREQ_NOTE} You gain only some proficiencies when multiclassing.</p>`;
  h += `<h3 style="margin-top:14px">${C.name} level ${cl}</h3>`;
  const feats = C.features[cl] || [];
  // subclass
  if (feats.includes("@sub") && !d.subclasses[lv.cls]) {
    h += `<div class="lvl"><b>Choose your subclass:</b><div class="grid gauto" style="margin-top:6px">${Object.entries(C.subclasses).map(([k, s]) => `<div class="pick" data-act="luSub" data-k="${k}"><b>${s.name}</b><span class="small muted">${(s.features[cl] || []).join(", ")}</span></div>`).join("")}</div></div>`;
  } else if (feats.includes("@sub") && d.subclasses[lv.cls] && !old.subs[lv.cls]) {
    h += `<p>Subclass: <b>${C.subclasses[d.subclasses[lv.cls]].name}</b> <a href="#" data-act="luSub" data-k="">change</a></p>`;
  }
  // features gained
  const newF = [];
  feats.forEach(n => { if (n === "@sub") { const s = D.subs[lv.cls]; if (s) (s.features[cl] || []).forEach(x => newF.push([x, s.name])); } else if (n !== "@asi" && n !== "@boon") newF.push([n, C.name]); });
  if (i > 0 || true) {
    const slug = classSlug(lv.cls), ss = d.subclasses[lv.cls] ? subclassSlug(lv.cls, d.subclasses[lv.cls]) : null;
    h += newF.map(([n, src]) => `<details class="lvl"><summary><b>${esc(n)}</b> <span class="muted small">${esc(src)}</span>${C.notes?.[n] ? ` <span class="chip">${esc(C.notes[n](cl, D))}</span>` : ""}</summary><div class="desc">${para(lookup(n, [ss, slug].filter(Boolean))) || '<span class="muted">No description imported.</span>'}</div></details>`).join("");
  }
  // HP
  if (i > 0) {
    const avg = C.hd / 2 + 1, cur = lv.hp ?? avg;
    h += `<div class="lvl"><b>Hit points:</b> <div class="row" style="margin-top:4px"><label><input type="radio" name="hpm" data-act="luHp" value="avg" ${lv.hp == null || lv.hp === avg ? "checked" : ""}> Average (${avg})</label>
      <button class="small ghost" data-act="rollHp">🎲 Roll d${C.hd}</button><label>Value ${inp(`levels.${i}.hp`, cur, { type: "number", attr: `min="1" max="${C.hd}"` })}</label>
      <span>+ Con ${sgn(D.mod.con)} → <b>+${Math.max(1, cur + D.mod.con) + (D.hpMax - old.hpMax - Math.max(1, cur + D.mod.con))}</b> max HP (${old.hpMax} → ${D.hpMax})</span></div></div>`;
  } else h += `<p>Starting hit points: <b>${D.hpMax}</b> (d${C.hd} max + Con)</p>`;
  if (feats.includes("@asi") || feats.includes("@boon")) h += `<div class="lvl">${asiEditor(`levels.${i}.asi`, lv.asi, D, feats.includes("@boon"))}</div>`;
  // pools that grew
  const grown = Object.keys(D.pools).filter(k => D.pools[k].max > (old.pools[k]?.max || 0) || (d.pools[k] || []).length < D.pools[k].max);
  if (grown.length) h += `<div class="lvl"><b>Choices</b>${grown.map(k => poolPicker(k, D, d, old.pools[k]?.max || 0)).join("")}</div>`;
  // spells
  const cs = D.casters.find(x => x.cls === lv.cls), ocs = old.casters.find(x => x.cls === lv.cls);
  if (cs) h += `<div class="lvl"><b>Spellcasting:</b> cantrips ${ocs ? ocs.cantrips + " → " : ""}${cs.cantrips}, prepared spells ${ocs ? ocs.prepared + " → " : ""}${cs.prepared}, max spell level ${cs.maxLvl}. <span class="muted small">Pick spells afterwards in Build → Spells.</span></div>`;
  if (D.slots.join() !== old.slots.join()) h += `<p class="small">Spell slots: ${D.slots.map((n, j) => `L${j + 1}×${n}`).join(", ")}</p>`;
  const missing = [];
  if (feats.includes("@sub") && !d.subclasses[lv.cls]) missing.push("subclass");
  if ((feats.includes("@asi") || feats.includes("@boon")) && !(lv.asi && (lv.asi.mode === "asi" ? lv.asi.a1 : lv.asi.feat?.name))) missing.push("ability score improvement / feat");
  return h + `<div class="foot">${missing.length ? `<span class="warn small" style="margin-right:auto">Still to choose: ${missing.join(", ")}</span>` : ""}<button class="ghost" data-act="modalClose">Cancel</button><button data-act="luConfirm">Confirm level ${i + 1}</button></div>`;
}

function mFeature() {
  const D = derive(S.char); const f = D.features.find(x => x.key === S.modal.key); if (!f) return "";
  return `<h2>${esc(f.name)}</h2><p class="muted small">${esc(f.src)}${f.edited ? " · edited by you" : ""}</p>
   <textarea id="fetext" style="min-height:280px">${esc(f.text)}</textarea>
   <div class="row" style="margin-top:8px"><label><input type="checkbox" id="feact" ${f.active ? "checked" : ""}> Active (has uses / action) — otherwise Passive</label><label><input type="checkbox" id="fehid" ${f.hidden ? "checked" : ""}> Hide from sheet & PDF</label></div>
   <div class="foot">${f.edited ? `<button class="ghost" data-act="featReset" style="margin-right:auto">Reset to wiki text</button>` : ""}<button class="ghost" data-act="modalClose">Cancel</button><button data-act="featSave">Save</button></div>`;
}

function mShortRest() {
  const c = S.char, D = derive(c), con = D.mod.con;
  return `<h2>Short rest</h2><p>Spend Hit Dice to heal (each: roll + Con ${sgn(con)}).</p>
   ${D.hitDice.map(x => { const rem = x.n - (c.play.hd[x.die] || 0); return `<div class="res"><span class="n"><b>${x.die}</b> — ${rem} of ${x.n} left</span><button class="small" data-act="hdRoll" data-d="${x.die}" ${rem <= 0 ? "disabled" : ""}>🎲 Spend 1 ${x.die}</button></div>`; }).join("")}
   <p>HP: <b>${Math.min(c.play.hp ?? D.hpMax, D.hpMax)}</b> / ${D.hpMax}</p>${S.modal.log ? `<p class="small muted">${S.modal.log}</p>` : ""}
   <p class="small muted">Finishing restores: ${D.resources.filter(r => r.reset === "SR" || r.note.startsWith("regain 1")).map(r => r.name).join(", ") || "—"}${D.pact ? ", Pact slots" : ""}.</p>
   <div class="foot"><button class="ghost" data-act="modalClose">Cancel</button><button data-act="srFinish">Finish short rest</button></div>`;
}

// ---------- EVENTS ----------
const ACT = {
  home: async () => { save(true); S.view = "home"; S.char = null; await loadChars(); render(); },
  theme: () => { const r = document.documentElement; const d = r.dataset.theme === "dark" ? "light" : "dark"; r.dataset.theme = d; try { localStorage.setItem("theme", d); } catch (e) { } },
  new: async () => { S.char = newChar(); await save(true); S.view = "builder"; S.tab = "basics"; render(); },
  open: el => openChar(el.dataset.id),
  view: el => { S.view = el.dataset.v; render(); window.scrollTo(0, 0); },
  tab: el => { S.tab = el.dataset.t; render(); window.scrollTo(0, 0); },
  sheetTab: el => { S.sheetTab = el.dataset.k; render(); },
  spTab: el => { S.ui.spTab = el.dataset.k; render(); },
  goSpells: () => { S.view = "builder"; S.tab = "spells"; render(); },
  runImport: async el => { await api("api/import", { method: "POST", body: { refresh: !!el.dataset.refresh } }); S.ui.import = { running: true, done: 0, total: 0, msg: "Starting…" }; render(); pollImport(); },
  importJson: () => {
    const f = document.createElement("input"); f.type = "file"; f.accept = ".json,application/json"; f.multiple = true;
    f.onchange = async () => {
      let n = 0, last = null;
      for (const file of f.files) {
        let c; try { c = JSON.parse(await file.text()); } catch (e) { toast("Not a character file: " + file.name); continue; }
        if (!c || !c.levels || !c.play) { toast("Not a character file: " + file.name); continue; }
        if (!c.id) c.id = "c" + Date.now().toString(36) + n;
        delete c._driveId; delete c._syncedAt;
        const ex = await DB.getChar(c.id);
        if (ex && (ex._updated || 0) > (c._updated || 0) && !confirm(`The ${c.name} on this device is newer than the file. Replace it with the file anyway?`)) continue;
        if (ex) { c._driveId = ex._driveId; c._syncedAt = ex._syncedAt; }
        migrate(c); await storeSaveChar(c); n++; last = c;
      }
      await loadChars();
      if (n === 1) { S.char = last; S.view = "sheet"; }
      render(); if (n) toast(`Imported ${n} character${n > 1 ? "s" : ""}`);
    };
    f.click();
  },
  exportJson: async () => {
    const c = JSON.parse(JSON.stringify(S.char)); delete c._driveId; delete c._syncedAt;
    const name = (c.name || "character").replace(/[^\w\- ]+/g, "").trim().replace(/ +/g, "_") + ".json";
    const file = new File([JSON.stringify(c, null, 1)], name, { type: "application/json" });
    if (navigator.canShare && /Android|iPhone|iPad/i.test(navigator.userAgent) && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: c.name }); return; } catch (e) { if (e.name === "AbortError") return; }
    }
    const a = document.createElement("a"); a.href = URL.createObjectURL(file); a.download = name; a.click();
    toast("Saved " + name + " to your Downloads");
  },
  deleteChar: async () => { if (!confirm("Delete " + S.char.name + " on all devices?")) return; await storeDeleteChar(S.char.id); S.char = null; S.view = "home"; await loadChars(); render(); },
  setSpecies: el => { const c = S.char; if (c.species.id !== el.dataset.id) { c.species = { id: el.dataset.id, choice: "", size: "" }; delete c.pools.keenSenses; delete c.pools.skillful; } save(); render(); },
  setBg: el => { const c = S.char; if (c.background.id !== el.dataset.id) { c.background = { id: el.dataset.id, mode: "21", plus2: "", plus1: "", tool: "" }; c.bgFeat = { picks: {} }; } save(); render(); },
  pbm: el => { const a = el.dataset.a; S.char.base[a] = Math.max(8, Math.min(15, S.char.base[a] + +el.dataset.d)); save(); render(); },
  stdArray: () => { const D = derive(S.char); const order = [...ABILITIES].sort((a, b) => (D.startCls && CLASSES[D.startCls].primary.includes(b) ? 1 : 0) - (D.startCls && CLASSES[D.startCls].primary.includes(a) ? 1 : 0)); [15, 14, 13, 12, 10, 8].forEach((v, i) => S.char.base[order[i]] = v); save(); render(); },
  levelup: () => startLevelUp(),
  poplevel: () => { const c = S.char; const lv = c.levels.pop(); if (lv && !c.levels.some(l => l.cls === lv.cls)) delete c.subclasses[lv.cls]; else if (lv) { const D = derive(c); const C = CLASSES[lv.cls]; const subLvl = +Object.keys(C.features).find(k => C.features[k].includes("@sub")); if (D.cls[lv.cls] < subLvl) delete c.subclasses[lv.cls]; } save(); render(); },
  img: el => pickImage((big, small) => { S.char[el.dataset.k] = big; if (el.dataset.k === "portrait") S.char.thumb = small; save(); render(); }),
  imgdel: el => { S.char[el.dataset.k] = ""; if (el.dataset.k === "portrait") S.char.thumb = ""; save(); render(); },
  addWeapon: () => { const n = $("#addw").value; S.char.weapons.push({ name: n, base: n, magic: 0 }); save(); render(); },
  addItem: () => { S.char.items.push({ name: "", qty: 1, note: "" }); save(); render(); },
  addCustom: () => { (S.char.custom ||= []).push({ name: "", text: "", uses: 0, reset: "LR" }); save(); render(); },
  del: el => { const arr = getPath(target(), el.dataset.p); arr.splice(+el.dataset.i, 1); if (el.dataset.p === "custom") { S.char.featureMeta = Object.fromEntries(Object.entries(S.char.featureMeta).filter(([k]) => !k.startsWith("custom:"))); } save(); render(); },
  spellDel: (el, e) => { e.preventDefault(); S.char.spells = S.char.spells.filter(s => !(s.name === el.dataset.n && s.cls === el.dataset.c)); save(); render(); },
  spellAddMan: el => { const n = $("#spman").value.trim(); if (!n) return; S.char.spells.push({ name: n, cls: el.dataset.c, level: +$("#spmanl").value }); save(); render(); },
  toggleOpen: (el, e) => { if (e.target.closest("button, input, a")) return; const b = el.closest(".feat, .spell")?.querySelector(".body"); if (b) b.classList.toggle("hidden"); },
  hp: el => {
    const c = S.char, D = derive(c), P = c.play; const amt = Math.abs(parseInt($("#hpAmt").value) || 0); if (!amt) return;
    let hp = Math.min(P.hp ?? D.hpMax, D.hpMax);
    if (el.dataset.m === "dmg") { let rest = amt; const t = Math.min(+P.temp || 0, rest); P.temp = (+P.temp || 0) - t; rest -= t; hp = Math.max(0, hp - rest); }
    else if (el.dataset.m === "heal") { if (hp <= 0) P.ds = { s: 0, f: 0 }; hp = Math.min(D.hpMax, hp + amt); }
    else P.temp = Math.max(+P.temp || 0, amt);
    P.hp = hp; save(); render();
  },
  pip: el => {
    const k = el.dataset.k, i = +el.dataset.i, m = +el.dataset.m, P = S.char.play;
    const store = k.startsWith("slot_") ? [P.slots, k.slice(5)] : k === "pact" ? [P, "pact"] : k.startsWith("hd_") ? [P.hd, k.slice(3)] : [P.used, k];
    const rem = m - (store[0][store[1]] || 0); const nrem = i < rem ? rem - 1 : rem + 1;
    store[0][store[1]] = m - nrem; save(); render();
  },
  resStep: el => { const k = el.dataset.k; S.char.play.used[k] = Math.max(0, (S.char.play.used[k] || 0) + +el.dataset.d); save(); render(); },
  cond: el => { const a = S.char.play.conditions; const v = el.dataset.v; const i = a.indexOf(v); i >= 0 ? a.splice(i, 1) : a.push(v); save(); render(); },
  insp: () => { S.char.play.inspiration = !S.char.play.inspiration; save(); render(); },
  showHidden: () => { S.ui.showHidden = !S.ui.showHidden; render(); },
  longRest: () => {
    if (!confirm("Take a long rest? Restores HP, hit dice, spell slots and all uses.")) return;
    const P = S.char.play, D = derive(S.char);
    Object.assign(P, { hp: D.hpMax, temp: 0, used: {}, slots: {}, pact: 0, hd: {}, ds: { s: 0, f: 0 }, exhaustion: Math.max(0, (+P.exhaustion || 0) - 1) });
    P.conditions = P.conditions.filter(x => x !== "Raging" && x !== "Concentrating");
    save(); render(); toast("Long rest complete");
  },
  shortRest: () => openModal({ type: "shortRest" }),
  hdRoll: el => {
    const c = S.char, D = derive(c), die = el.dataset.d, sides = +die.slice(1);
    const roll = 1 + Math.floor(Math.random() * sides), heal = Math.max(0, roll + D.mod.con);
    c.play.hd[die] = (c.play.hd[die] || 0) + 1; c.play.hp = Math.min(D.hpMax, Math.min(c.play.hp ?? D.hpMax, D.hpMax) + heal);
    S.modal.log = (S.modal.log ? S.modal.log + " · " : "") + `${die}: rolled ${roll} ${sgn(D.mod.con)} = +${heal} HP`;
    save(); render();
  },
  srFinish: () => {
    const c = S.char, D = derive(c);
    D.resources.forEach(r => { if (r.reset === "SR") c.play.used[r.key] = 0; else if (r.note.startsWith("regain 1")) c.play.used[r.key] = Math.max(0, (c.play.used[r.key] || 0) - 1); });
    c.play.pact = 0; closeModal(); save(); render(); toast("Short rest complete");
  },
  modalClose: () => { closeModal(); render(); },
  luClass: el => { const lv = S.draft.levels[S.draft.levels.length - 1]; if (lv.cls !== el.dataset.k) { lv.cls = el.dataset.k; lv.hp = null; lv.asi = null; S.draft.subclasses = clone(S.char.subclasses); S.draft.pools = clone(S.char.pools); } renderModal(); },
  luSub: (el, e) => { e.preventDefault(); const lv = S.draft.levels[S.draft.levels.length - 1]; if (el.dataset.k) S.draft.subclasses[lv.cls] = el.dataset.k; else delete S.draft.subclasses[lv.cls]; renderModal(); },
  rollHp: () => { const lv = S.draft.levels[S.draft.levels.length - 1]; lv.hp = 1 + Math.floor(Math.random() * CLASSES[lv.cls].hd); renderModal(); },
  luConfirm: () => {
    const old = S.modal.oldD; const D = derive(S.draft);
    const P = S.draft.play; P.hp = Math.min(D.hpMax, (P.hp ?? old.hpMax) + (D.hpMax - old.hpMax));
    S.char = S.draft; closeModal(); save(true); render(); toast(`Level ${D.level}! Max HP ${D.hpMax}`);
  },
  featEdit: (el, e) => { e.stopPropagation(); openModal({ type: "feature", key: el.dataset.k }); },
  featSave: () => {
    const D = derive(S.char); const f = D.features.find(x => x.key === S.modal.key);
    const m = S.char.featureMeta[f.key] ||= {}; const t = $("#fetext").value;
    const orig = collectFeatures({ ...S.char, featureMeta: {} }, D).find(x => x.key === f.key);
    if (t !== (orig?.text || "")) m.text = t; else delete m.text;
    m.active = $("#feact").checked; m.hidden = $("#fehid").checked;
    if (f.customIdx !== undefined) { S.char.custom[f.customIdx].text = t; delete m.text; }
    closeModal(); save(); render();
  },
  featReset: () => { const m = S.char.featureMeta[S.modal.key]; if (m) delete m.text; closeModal(); save(); render(); },
  printNow: () => window.print(),
  mtab: el => { const k = el.dataset.k; S.mtab = k; if (!["combat", "stats"].includes(k)) S.sheetTab = k; render(); window.scrollTo(0, 0); },
  syncConnect: async () => { const i = $("#clientId"); if (i && i.value.trim()) { S.settings.clientId = i.value.trim(); await DB.set("settings", S.settings); } await Sync.connect(); render(); },
  syncNow: async () => { await Sync.run(); render(); },
  syncOff: () => { Sync.disconnect(); render(); },
  syncTap: async () => { if (Sync.status === "signin" || (Sync.status === "error" && !Sync.hasToken())) await Sync.connect(); else await Sync.run(); if (S.view === "home") render(); },
  loadWikiFile: () => { const f = document.createElement("input"); f.type = "file"; f.accept = ".json,application/json"; f.onchange = async () => { try { const w = JSON.parse(await f.files[0].text()); if (!w.pages) throw new Error("not a wiki.json"); await storeSetWiki(w); toast("Rules text loaded"); render(); } catch (e) { toast("Could not read file: " + e.message); } }; f.click(); },
  migrateServer: async () => {
    const list = await (await fetch("api/characters", { cache: "no-store" })).json(); let n = 0;
    for (const it of list) { const c = await (await fetch("api/characters/" + encodeURIComponent(it.id), { cache: "no-store" })).json(); if (!(await DB.getChar(c.id))) { migrate(c); await storeSaveChar(c); n++; } }
    S.ui.serverChars = 0; await DB.set("migrated", true); await loadChars(); render(); toast(`Brought in ${n} character(s)`);
  }
};
// change-type actions (inputs/selects/checkboxes)
const CHG = {
  setFeat: el => { const t = target(); setPath(t, el.dataset.p, el.value ? { name: el.value, picks: {} } : null); },
  featMulti: el => { const t = target(); const p = el.dataset.p + ".picks." + el.dataset.k; const a = getPath(t, p) || []; const v = el.dataset.v; const i = a.indexOf(v); if (i >= 0) a.splice(i, 1); else if (a.length < +el.dataset.n) a.push(v); setPath(t, p, a); },
  pool: el => { const t = target(); const a = t.pools[el.dataset.k] ||= []; const v = el.dataset.v; const i = a.indexOf(v); i >= 0 ? a.splice(i, 1) : a.push(v); },
  bgMode: el => { S.char.background.mode = el.value; },
  abilMethod: el => { S.char.abilMethod = el.value; if (el.value === "pointbuy") ABILITIES.forEach(a => S.char.base[a] = Math.max(8, Math.min(15, S.char.base[a]))); },
  asiMode: el => { const t = target(); setPath(t, el.dataset.p, el.value === "asi" ? { mode: "asi", t: "2", a1: "" } : { mode: "feat", feat: null }); },
  spellToggle: el => { const c = S.char; const n = el.dataset.n, k = el.dataset.c; const i = c.spells.findIndex(s => s.name === n && s.cls === k); if (i >= 0) c.spells.splice(i, 1); else c.spells.push({ name: n, cls: k, level: +el.dataset.l }); },
  spAll: el => { S.ui.spAll = el.checked; },
  luHp: () => { const lv = S.draft.levels[S.draft.levels.length - 1]; lv.hp = null; },
  ds: el => { const P = S.char.play; const k = el.dataset.k, i = +el.dataset.i; P.ds[k] = el.checked ? i + 1 : i; },
  showHidden: el => { S.ui.showHidden = el.checked; },
  popt: el => { const o = S.ui.print; o[el.dataset.k] = el.type === "checkbox" ? el.checked : el.value; }
};

document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if (!el) return;
  if (["INPUT", "SELECT", "TEXTAREA", "OPTION"].includes(el.tagName)) return;
  const fn = ACT[el.dataset.act]; if (!fn) return;
  if (el.tagName === "A") e.preventDefault();
  fn(el, e);
});
document.addEventListener("change", e => {
  const el = e.target;
  if (el.dataset.path) {
    let v = readVal(el);
    if (el.dataset.tri !== undefined) v = v === "y" ? true : v === "n" ? false : null;
    setPath(target(), el.dataset.path, v);
  } else if (el.dataset.act && CHG[el.dataset.act]) CHG[el.dataset.act](el, e);
  else return;
  if (S.modal) renderModal();
  if (!S.modal || S.modal.type !== "levelup") { save(); render(); }
});
document.addEventListener("input", e => {
  const el = e.target;
  if (el.dataset.live) { setPath(S.char, el.dataset.live, el.value); save(); }
  if (el.dataset.actInput === "spq") { S.ui.spq = el.value; const D = derive(S.char); $("#splist").innerHTML = spellList(S.char, D, S.ui.spTab, D.casters.find(x => x.cls === S.ui.spTab)); }
});
$("#modal").addEventListener("mousedown", e => { if (e.target.id === "modal" && S.modal?.type !== "levelup") { closeModal(); render(); } });

// ---------- init ----------
(async function init() {
  try { const t = localStorage.getItem("theme"); if (t) document.documentElement.dataset.theme = t; } catch (e) { }
  S.settings = (await DB.get("settings")) || {};
  const w = await DB.get("wiki"); if (w) { S.wiki = w; } buildIndex();
  S.server = await detectServer();
  if (S.server) {
    // laptop with run.py: pick up wiki.json + old characters folder
    try { const sw = await (await fetch("api/wiki", { cache: "no-store" })).json(); const n = Object.keys(sw.pages || {}).length; if (n && (!w || n !== Object.keys(w.pages || {}).length || sw.imported !== w.imported)) await storeSetWiki(sw); } catch (e) { }
    try { const st = await (await fetch("api/import", { cache: "no-store" })).json(); if (st.running) { S.ui.import = st; pollImport(); } } catch (e) { }
    await Folder.pull();
  }
  await loadChars();
  Sync.loadToken();
  render(); renderSyncChip();
  if (Sync.enabled()) Sync.run();
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => { });
})();
