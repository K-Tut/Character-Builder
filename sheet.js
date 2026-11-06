"use strict";
/* ============ PLAY SHEET + MODALS + EVENTS ============ */

function pips(key, max, used, label) {
  const rem = Math.max(0, max - (used || 0));
  if (max > 12) return `<span class="row" style="gap:4px"><button class="small ghost" data-act="resStep" data-k="${key}" data-d="1">−</button><b>${rem}</b><span class="muted">/ ${max}</span><button class="small ghost" data-act="resStep" data-k="${key}" data-d="-1">+</button></span>`;
  return `<span class="pips" title="${esc(label || "")}">${Array.from({ length: max }, (_, i) => `<span class="pip ${i < rem ? "" : "used"}" data-act="pip" data-k="${key}" data-i="${i}" data-m="${max}"></span>`).join("")}</span>`;
}

const R = (title, mod) => `data-act="roll" data-k="d20" data-m="${mod}" data-t="${esc(title)}" title="Roll ${esc(title)}"`;
const RD = (title, f) => `data-act="roll" data-k="dmg" data-f="${esc(f)}" data-t="${esc(title)}" title="Roll ${esc(title)}"`;
const ATK = (id, k) => `data-act="atkRoll" data-at="${id}" data-k="${k}" title="${k === "hit" ? "Roll to hit" : "Roll damage"}"`;
function slotRows(D, P) {
  return D.slots.map((n, i) => `<div class="res"><span class="n">Level ${i + 1}</span>${pips("slot_" + (i + 1), n, P.slots[i + 1])}</div>`).join("")
    + (D.pact ? `<div class="res"><span class="n">Pact slots (level ${D.pact.lvl}) <span class="small muted">short rest</span></span>${pips("pact", D.pact.n, P.pact)}</div>` : "");
}
// Portent: the rolled d20s, tap one to use it
function portentDice(r, P) {
  const d = (P.portent || []).slice(0, r.max);
  return `<span class="portent">${d.length ? d.map((x, i) => `<span class="pdie ${x.u ? "pused" : ""}" data-act="portentUse" data-i="${i}" title="${x.u ? "used — tap to undo" : "tap when you use this roll"}">${Dice.svg(20, x.v, "", x.u ? "#888" : null)}</span>`).join("") : '<span class="small muted">rolled on a long rest</span>'}
    <button class="small ghost" data-act="portentRoll" title="Roll the Portent dice now">🎲</button></span>`;
}
function hasSpell(c, D, name) { const n = norm(name); return D.alwaysSpells.some(s => norm(s.name) === n) || c.spells.some(s => norm(s.name) === n); }
function attackById(D, id) { return id[0] === "w" ? D.attacks[+id.slice(1)] : D.spellAttacks[+id.slice(1)]; }
// [name, spell level, dice, die, +dice per slot level, type]
const SMITES = [["Divine Smite", 1, 2, 8, 1, "radiant"], ["Searing Smite", 1, 1, 6, 1, "fire"], ["Thunderous Smite", 1, 2, 6, 1, "thunder"], ["Wrathful Smite", 1, 1, 6, 1, "necrotic"],
  ["Shining Smite", 2, 2, 6, 1, "radiant"], ["Blinding Smite", 3, 3, 8, 1, "radiant"], ["Staggering Smite", 4, 4, 6, 1, "psychic"], ["Banishing Smite", 5, 5, 10, 0, "force"]];
// what can be added to the damage of this attack once it hits
// what it costs to use: "A" action, "BA" bonus action, "R" reaction (from a spell's casting time or the rules text)
const ACT_TAG = { A: ["Action", "ta-a"], BA: ["Bonus", "ta-b"], R: ["Reaction", "ta-r"] };
function actKind(text, time) {
  const t = String(time || "").toLowerCase();
  if (t) return /bonus/.test(t) ? "BA" : /reaction/.test(t) ? "R" : /\baction\b/.test(t) ? "A" : "";
  const s = String(text || ""), hits = [["BA", /\bbonus action\b/i], ["R", /\b(?:your |a |use (?:your|its) )?reaction\b/i], ["A", /\b(?:magic action|as an action|take an action|an action to|utilize action)\b/i]]
    .map(([k, rx]) => { const m = s.match(rx); return m ? [k, m.index] : null; }).filter(Boolean).sort((a, b) => a[1] - b[1]);
  return hits.length ? hits[0][0] : "";
}
function actTag(k) { return k && ACT_TAG[k] ? `<span class="acttag ${ACT_TAG[k][1]}">${ACT_TAG[k][0]}</span>` : ""; }
function resKind(r, feats) {
  if (r.spell) return actKind("", spellInfo(r.spell)?.time);
  const f = feats.find(x => x.res === r) || feats.find(x => r.feature && norm(x.name) === norm(r.feature));
  return actKind(f?.text || lookup(r.feature || r.name));
}
const ICON_HEART = `<svg viewBox="0 0 24 24"><path d="M12 21s-7.6-4.6-9.8-9.4C.6 8 2.6 3.8 6.6 3.8c2.3 0 4 1.3 5.4 3.2 1.4-1.9 3.1-3.2 5.4-3.2 4 0 6 4.2 4.4 7.8C19.6 16.4 12 21 12 21z"/></svg>`;
const ICON_SKULL = `<svg viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12 2.2c-5 0-8.8 3.6-8.8 8.4 0 2.8 1.3 4.9 3.3 6.2v2.4c0 1 .8 1.8 1.8 1.8h7.4c1 0 1.8-.8 1.8-1.8v-2.4c2-1.3 3.3-3.4 3.3-6.2 0-4.8-3.8-8.4-8.8-8.4zM8.4 9.4a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4zm7.2 0a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4zM12 14.2l1.3 2.4h-2.6zM9.6 18.4h1v2h-1zm3.8 0h1v2h-1z"/></svg>`;
function isBloodied(c, D) { const hp = c.play?.hp ?? D.hpMax; return hp > 0 && hp <= Math.floor(D.hpMax / 2); }
// reasons the character has Advantage on attack rolls right now
function advantageHints(c, D) {
  const out = [];
  if (isBloodied(c, D) && D.feats.some(f => f.name === "Purple Dragon Commandant")) out.push("Last Stand (Purple Dragon Commandant)");
  return out;
}
function damageRiders(c, D, a) {
  const out = [], W = a.kind === "weapon", melee = W && !a.ranged, T = a.dtype || (a.parts[0] || {}).type || "";
  const inv = (c.pools || {}).invocations || [];
  if (melee) SMITES.forEach(([name, lvl, n, s, per, type]) => { if (hasSpell(c, D, name) || (name === "Divine Smite" && (D.cls.paladin || 0) >= 2)) out.push({ name, spell: true, lvl, n, s, per, type, freeKey: D.freeCast[norm(name)] }); });
  if (melee && inv.includes("Eldritch Smite") && D.pact) out.push({ name: "Eldritch Smite", spell: true, pactOnly: true, lvl: 1, n: 2, s: 8, per: 1, type: "force", note: "target can be knocked Prone" });
  if (melee && (D.cls.paladin || 0) >= 11) out.push({ name: "Radiant Strikes", n: 1, s: 8, type: "radiant", auto: true });
  if (W && hasSpell(c, D, "Divine Favor")) out.push({ name: "Divine Favor", n: 1, s: 4, type: "radiant", note: "while the spell lasts" });
  if (hasSpell(c, D, "Hex")) out.push({ name: "Hex", n: 1, s: 6, type: "necrotic", note: "hexed target" });
  if (hasSpell(c, D, "Hunter's Mark") || D.cls.ranger) out.push({ name: "Hunter's Mark", n: 1, s: 6, type: "force", note: "marked target" });
  if (W && D.cls.rogue && (a.ranged || /finesse/i.test(a.baseProps || ""))) out.push({ name: "Sneak Attack", n: Math.ceil(D.cls.rogue / 2), s: 6, type: T, note: "once per turn" });
  if (W && D.cls.barbarian && a.ab === "str") out.push({ name: "Rage", flat: at(step({ 1: 2, 9: 3, 16: 4 }), D.cls.barbarian), type: T, note: "while raging", auto: (c.play.conditions || []).includes("Raging") });
  if (W && D.subs.ranger && /hunter/i.test(D.subs.ranger.name)) out.push({ name: "Colossus Slayer", n: 1, s: 8, type: T, note: "target below max HP, once per turn" });
  if (W && D.subs.barbarian && /zealot/i.test(D.subs.barbarian.name)) out.push({ name: "Divine Fury", n: 1, s: 6, plus: Math.floor(D.cls.barbarian / 2), type: "radiant", note: "first hit each turn while raging" });
  if (W && (D.cls.cleric || 0) >= 7) out.push({ name: "Divine Strike", n: 1, s: 8, type: "radiant", note: "Blessed Strikes, once per turn" });
  if (W && a.heavy && D.feats.some(f => f.name === "Great Weapon Master")) out.push({ name: "Great Weapon Master", flat: D.pb, type: T });
  if (D.subs.warlock && /hexblade/i.test(D.subs.warlock.name)) out.push({ name: "Hexblade's Curse", flat: D.pb, type: T, note: "cursed target" });
  return out;
}
function spellAttackPrefill(name, D) {
  const c = S.char, si = spellInfo(name), txt = si?.text || "";
  const own = c.spells.find(s => s.name === name) || D.alwaysSpells.find(s => s.name === name);
  const caster = own ? (own.cls === "species" ? "species" : own.cls) : (D.casters[0]?.cls || "species");
  const ab = { strength: "str", dexterity: "dex", constitution: "con", intelligence: "int", wisdom: "wis", charisma: "cha" };
  const sv = txt.match(/(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma) saving throw/i);
  const mode = /spell attack/i.test(txt) ? "atk" : sv ? "save" : "atk";
  const m = txt.match(new RegExp("(\\d+)d(\\d+)(?:\\s*\\+\\s*(\\d+))?\\s+(" + DMG_TYPES.join("|") + ")\\s+damage", "i"));
  const lvl = si?.level ?? own?.level;
  return { spell: name, name, caster: D.casters.some(x => x.cls === caster) || caster === "species" ? caster : (D.casters[0]?.cls || "species"), mode, save: sv ? ab[sv[1].toLowerCase()] : "dex",
    hitBonus: 0, parts: [{ f: m ? `${m[1]}d${m[2]}${m[3] ? "+" + m[3] : ""}` : "", type: m ? m[4].toLowerCase() : "" }], cantrip: lvl === 0,
    addMod: /eldritch blast/i.test(name) && ((c.pools || {}).invocations || []).includes("Agonizing Blast"), note: mode === "save" && /half as much/i.test(txt) ? "half damage on a successful save" : "" };
}
function mSpellAtk() {
  const c = S.char, D = derive(c), d = S.modal.d;
  const names = [...new Set([...D.alwaysSpells.map(s => s.name), ...c.spells.map(s => s.name)])].sort();
  const casters = [...D.casters.map(x => [x.cls, `${x.name} (${ABBR[x.ability]}) · atk ${sgn(x.atk)} · DC ${x.dc}`]), ...(D.speciesCast ? [["species", `${D.speciesCast.name} (${ABBR[D.speciesCast.ability]}) · atk ${sgn(D.speciesCast.atk)} · DC ${D.speciesCast.dc}`]] : [])];
  const cs = D.casters.find(x => x.cls === d.caster) || (d.caster === "species" && D.speciesCast) || D.casters[0] || D.speciesCast || { atk: D.pb, dc: 8 + D.pb };
  return `<h2>${S.modal.i >= 0 ? "Edit" : "Add"} spell attack</h2>
    <div class="grid g2"><label>Spell<select id="sa_spell" data-act="spAtkSpell"><option value="">— choose —</option>${names.map(n => `<option ${n === d.spell ? "selected" : ""}>${esc(n)}</option>`).join("")}</select></label>
      <label>Name on the sheet<input id="sa_name" value="${esc(d.name || "")}"></label>
      <label>Casting ability<select id="sa_caster" data-act="spAtkMode">${casters.map(([k, l]) => `<option value="${k}" ${k === d.caster ? "selected" : ""}>${esc(l)}</option>`).join("")}</select></label>
      <label>Roll<select id="sa_mode" data-act="spAtkMode"><option value="atk" ${d.mode === "atk" ? "selected" : ""}>Spell attack (to hit ${sgn(cs.atk + (+d.hitBonus || 0))})</option><option value="save" ${d.mode === "save" ? "selected" : ""}>Saving throw (DC ${cs.dc + (+d.hitBonus || 0)})</option></select></label>
      ${d.mode === "save" ? `<label>Save<select id="sa_save">${ABILITIES.map(a => `<option value="${a}" ${a === d.save ? "selected" : ""}>${ABILITY_NAMES[a]}</option>`).join("")}</select></label>` : ""}
      <label>Extra ${d.mode === "save" ? "DC" : "to hit"} <input id="sa_hit" type="number" value="${+d.hitBonus || 0}" style="width:80px"></label></div>
    <h3 style="margin-top:12px">Damage</h3>
    ${d.parts.map((p, i) => `<div class="row" style="margin-bottom:4px"><input class="sa_f" value="${esc(p.f)}" placeholder="${i ? "+1d4 or +3" : "e.g. 1d10"}" style="width:120px">${dtSelect("sa_t" + i, p.type)}${i ? `<button class="small ghost" data-act="spAtkPartDel" data-i="${i}">✕</button>` : `<span class="small muted">${d.cantrip ? "cantrip — grows at levels 5, 11, 17" : ""}</span>`}</div>`).join("")}
    <div class="row"><button class="small ghost" data-act="spAtkPart">＋ add damage (dice or a flat +X, any type)</button><label class="small"><input type="checkbox" id="sa_mod" ${d.addMod ? "checked" : ""}> add ${ABBR[cs.ability || "int"]} modifier to the damage</label></div>
    <label style="display:block;margin-top:10px">Note<input id="sa_note" value="${esc(d.note || "")}" placeholder="e.g. +3 to damage once per round"></label>
    <div class="foot">${S.modal.i >= 0 ? `<button class="danger" data-act="spAtkDel" style="margin-right:auto">Delete</button>` : ""}<button class="ghost" data-act="modalClose">Cancel</button><button data-act="spAtkSave">Save</button></div>`;
}
function readSpAtk() {
  const d = S.modal.d, v = id => document.getElementById(id);
  d.name = v("sa_name").value.trim(); d.caster = v("sa_caster").value; d.mode = v("sa_mode").value; if (v("sa_save")) d.save = v("sa_save").value;
  d.hitBonus = +v("sa_hit").value || 0; d.addMod = v("sa_mod").checked; d.note = v("sa_note").value;
  d.parts = [...document.querySelectorAll(".sa_f")].map((el, i) => ({ f: el.value.trim().replace(/^\+/, ""), type: v("sa_t" + i).value }));
}
function renderSheet() {
  const c = S.char, D = derive(c), P = c.play;
  if (!D.level) return `<div class="card"><h2>${esc(c.name)}</h2><p>This character has no class levels yet.</p><button data-act="levelup">Choose first class</button> <button class="ghost" data-act="view" data-v="builder">Open builder</button></div>`;
  const hp = Math.min(P.hp ?? D.hpMax, D.hpMax);
  const pct = Math.max(0, Math.min(100, 100 * hp / D.hpMax));
  const bg = bgData(c);
  const bloodied = isBloodied(c, D);
  let h = `<div class="card"><div class="hero">${c.portrait || c.thumb ? `<div class="heroimg ${hp <= 0 ? "down" : bloodied ? "bloodied" : ""}"><img src="${c.portrait || c.thumb}" data-act="viewPortrait" title="Show the whole image"></div>` : ""}
    <div class="grow herobody"><h2>${esc(c.name)}</h2>
    <div>${esc(classLine(D))}</div><div class="muted small">${esc([D.species ? D.species.name + (c.species.choice ? " (" + c.species.choice + ")" : "") : "", bg?.name, "Level " + D.level].filter(Boolean).join(" · "))}</div>
    <div class="heroact"><div class="herorow"><button data-act="levelup">⬆ Level up</button><button class="ghost inspbtn2 ${P.inspiration ? "on" : ""}" data-act="insp" title="Heroic Inspiration">${P.inspiration ? "★" : "☆"} Inspiration</button><button class="ghost heroexp" data-act="exportJson" title="Export this character as a file">⤓</button></div>
      <div class="herorow"><button class="ghost" data-act="shortRest">☕ Short rest</button><button class="ghost" data-act="longRest">🌙 Long rest</button></div></div></div></div></div>`;

  // column 1: abilities & skills
  let c1 = `<div class="card"><h3>Abilities</h3><div class="abil small muted"><span></span><span class="num">Score</span><span class="num">Mod</span><span class="num">Save</span></div>
    ${ABILITIES.map(a => `<div class="abil" style="background:var(--${a})"><b>${ABILITY_NAMES[a]}</b><span class="num">${D.score[a]}</span><span class="m roll" ${R(ABILITY_NAMES[a] + " check", D.mod[a])}>${sgn(D.mod[a])}</span><span class="num roll" ${R(ABILITY_NAMES[a] + " saving throw", D.save[a])}>${D.saveProf.has(a) ? "●" : "○"} ${sgn(D.save[a])}</span></div>`).join("")}
    <p class="small muted" style="margin:6px 0 0">🎲 Tap a modifier, save or skill to roll.</p></div>
    <div class="card"><h3>Skills</h3>${SKILLS_BY_ABILITY.map(s => { const k = D.skill[s]; return `<div class="skill roll" style="background:var(--${k.a})" ${R(s + " check", k.v)}><span><span class="dot ${k.e ? "e" : k.p ? "p" : ""}"></span>${s} <span class="muted small">${ABBR[k.a]}</span></span><b>${sgn(k.v)}</b></div>`; }).join("")}
    <p class="small" style="margin:8px 0 0">Passive Perception <b>${D.passive.perception}</b> · Insight <b>${D.passive.insight}</b> · Investigation <b>${D.passive.investigation}</b></p></div>
    <div class="card"><h3>Proficiencies</h3><p class="small"><b>Armor:</b> ${esc(D.armorTraining.join(", ") || "none")}<br><b>Weapons:</b> ${esc(D.weaponText || "none")}<br><b>Tools:</b> ${esc(D.tools.join(", ") || "none")}<br><b>Languages:</b> ${esc(D.languages.join(", "))}${c.otherProfs ? "<br>" + esc(c.otherProfs) : ""}</p></div>`;

  // column 2: combat
  const exh = +P.exhaustion || 0;
  let c2 = `<div class="card"><div class="stats">
    <div class="stat"><div class="v">${D.ac}</div><div class="k">Armor Class</div></div><div class="stat roll" ${R("Initiative", D.init)}><div class="v">${sgn(D.init)}</div><div class="k">Initiative 🎲</div></div>
    <div class="stat"><div class="v">${D.speed}</div><div class="k">Speed ft</div></div><div class="stat"><div class="v">${sgn(D.pb)}</div><div class="k">Prof. Bonus</div></div></div>
    <p class="small muted" style="margin:8px 0 0">${D.size}${D.darkvision ? " · Darkvision " + D.darkvision + " ft" : ""}${D.resist.length ? " · Resistances: " + esc(D.resist.join(", ")) : ""}</p></div>
  <div class="card"><h3>Hit Points</h3>
    <div class="hpbox"><div><div class="small muted">Current</div><input type="number" data-path="play.hp" data-num value="${hp}"></div>
    <div><div class="small muted">Max</div><div class="big" style="font-size:26px;padding-top:4px">${D.hpMax}</div></div>
    <div><div class="small muted">Temp</div><input type="number" data-path="play.temp" data-num value="${+P.temp || 0}"></div></div>
    <div class="hpbar"><div style="width:${pct}%;background:${pct < 30 ? "#b33" : pct < 60 ? "var(--warn)" : "var(--good)"}"></div></div>
    <div class="row"><input id="hpAmt" type="number" min="0" placeholder="amount" style="width:90px"><button class="danger" data-act="hp" data-m="dmg">Damage</button><button style="background:var(--good)" data-act="hp" data-m="heal">Heal</button><button class="ghost" data-act="hp" data-m="temp">Set temp</button></div>
    <div class="row small" style="margin-top:10px"><b>Hit Dice:</b>${D.hitDice.map(x => `<span>${x.die}: ${pips("hd_" + x.die, x.n, P.hd[x.die])}</span>`).join("")}</div>
    ${hp <= 0 ? `<div class="dsaves"><div class="row"><b>Death saves</b><button class="small right" ${R("Death saving throw", 0)}>🎲 Roll</button></div>
      <div class="dsrow"><span class="dslbl">Successes</span>${[0, 1, 2].map(i => `<button class="dspip ok ${P.ds.s > i ? "on" : ""}" data-act="dsTap" data-k="s" data-i="${i}" title="Success ${i + 1}">${ICON_HEART}</button>`).join("")}${P.ds.s >= 3 ? '<span class="chip">stable</span>' : ""}</div>
      <div class="dsrow"><span class="dslbl">Failures</span>${[0, 1, 2].map(i => `<button class="dspip bad ${P.ds.f > i ? "on" : ""}" data-act="dsTap" data-k="f" data-i="${i}" title="Failure ${i + 1}">${ICON_SKULL}</button>`).join("")}${P.ds.f >= 3 ? '<span class="chip">dead</span>' : ""}</div></div>` : ""}
  </div>
  <div class="card"><div class="row"><h3 style="margin:0">Attacks</h3><span class="right row" style="gap:6px"><button class="small ghost" data-act="wpnNew" title="Add a weapon (also goes into your equipment)">＋ Weapon</button><button class="small ghost" data-act="spAtkNew" title="Add an attack from one of your spells">＋ Spell attack</button></span></div>
    ${S.ui.wpnAdd ? `<div class="row small addwpn"><select id="addw2">${WEAPONS.map(w => `<option>${w.name}</option>`).join("")}</select><label>Magic +<select id="addw2m">${[0, 1, 2, 3].map(n => `<option>${n}</option>`).join("")}</select></label><button class="small" data-act="wpnAdd">Add</button><a href="#" data-act="wpnNew">cancel</a></div>` : ""}
    ${D.attacks.length || D.spellAttacks.length ? `<table class="t"><tr><th>Attack</th><th class="num">Hit / DC</th><th>Damage</th></tr>${D.attacks.map((a, i) => `<tr><td><b>${esc(a.name)}</b><div class="small muted">${esc(a.baseProps)}${a.mastery ? ` <span class="chip acc mastchip" data-act="mastInfo" data-i="${i}" title="What does ${esc(a.mastery)} do?">Mastery: ${esc(a.mastery)} ${(S.ui.mastOpen || {})[i] ? "▾" : "ⓘ"}</span>` : ""}${a.notes ? " · " + esc(a.notes) : ""}</div></td><td class="num big roll" style="font-size:17px" ${ATK("w" + i, "hit")}>${sgn(a.hit)}</td><td class="roll" ${ATK("w" + i, "dmg")}>${a.parts.map(partText).join(" + ")}</td></tr>
      ${a.mastery && (S.ui.mastOpen || {})[i] ? `<tr class="mastrow"><td colspan="3"><div class="desc small">${masteryText(a, D)}</div></td></tr>` : ""}`).join("")}
      ${D.spellAttacks.map((a, i) => `<tr><td><b>${esc(a.name)}</b> <a href="#" class="small" data-act="spAtkEdit" data-i="${i}" title="Edit">✎</a><div class="small muted">Spell${a.mode === "save" ? " · " + ABILITY_NAMES[a.save] + " save" : ""}${a.note ? " · 📝 " + esc(a.note) : ""}</div></td>
        ${a.mode === "save" ? `<td class="num" style="font-size:15px"><b>DC ${a.dc}</b><div class="small muted">${ABBR[a.save]}</div></td>` : `<td class="num big roll" style="font-size:17px" ${ATK("s" + i, "hit")}>${sgn(a.hit)}</td>`}
        <td class="roll" ${ATK("s" + i, "dmg")}>${a.parts.map(partText).join(" + ") || '<span class="muted">—</span>'}</td></tr>`).join("")}</table>
      <p class="small muted" style="margin:6px 0 0">🎲 Tap the hit bonus to attack — on a hit tap “Hit” to roll damage (with smites, Hex …).</p>` : '<p class="muted small">Add weapons in Build → Equipment, or ＋ a spell attack.</p>'}
    ${D.cls.rogue ? `<p class="small">Sneak Attack: <b class="roll" ${RD("Sneak Attack", Math.ceil(D.cls.rogue / 2) + "d6")}>🎲 ${Math.ceil(D.cls.rogue / 2)}d6</b></p>` : ""}${D.cls.barbarian ? `<p class="small">Rage damage: <b>+${at(step({ 1: 2, 9: 3, 16: 4 }), D.cls.barbarian)}</b></p>` : ""}</div>`;
  const featsAll = D.resources.length ? collectFeatures(c, D) : [];
  if (D.resources.length) c2 += `<div class="card"><h3>Resources</h3>${D.resources.map(r => `<div class="res"><span class="n"><b class="resname" data-act="resInfo" data-k="${esc(r.key)}" title="Show description">${esc(r.name)} <span class="small muted">ⓘ</span></b>${actTag(resKind(r, featsAll))}${r.die ? ` <span class="chip">${esc(r.die)}</span>` : ""}<div class="small muted">${r.reset === "SR" ? "Short rest" : r.reset === "LR" ? "Long rest" : ""}${r.note ? " · " + esc(r.note) : ""}</div></span>${r.key === "portent" ? portentDice(r, P) : pips(r.key, r.max, P.used[r.key])}</div>
    ${r.forms ? `<div class="row small formrow">${(P.active || {})[r.key] ? `<span class="chip acc">Active: ${esc(P.active[r.key])}</span><a href="#" data-act="endForm" data-k="${r.key}">end</a>` : `<span class="muted">Use as:</span>${r.forms.map(f => `<button class="small ghost" data-act="useForm" data-k="${r.key}" data-f="${esc(f)}">${esc(f)}</button>`).join("")}`}</div>` : ""}`).join("")}</div>`;
  if (D.slots.length || D.pact) c2 += `<div class="card"><h3>Spell slots</h3>${slotRows(D, P)}</div>`;
  c2 += `<div class="card"><h3>Conditions</h3><div>${CONDITIONS.map(x => `<span class="chip ${P.conditions.includes(x) ? "acc" : ""}" style="cursor:pointer" data-act="cond" data-v="${x}">${x}</span>`).join("")}</div>
    <div class="row" style="margin-top:8px"><label>Exhaustion ${sel("play.exhaustion", exh, [0, 1, 2, 3, 4, 5, 6], { num: true })}</label>${exh ? `<span class="small warn">−${2 * exh} to d20 tests, −${5 * exh} ft speed${exh >= 6 ? " — DEAD" : ""}</span>` : ""}</div></div>`;

  // column 3: tabs
  const t = S.sheetTab;
  let c3 = `<div class="card"><div class="subtabs">${[["features", "Features"], ["spells", "Spells"], ["inventory", "Inventory"], ["notes", "Notes"], ["story", "Backstory"]].map(([k, l]) => `<button class="${t === k ? "on" : ""}" data-act="sheetTab" data-k="${k}">${l}</button>`).join("")}</div>`;
  if (t === "features") c3 += sheetFeatures(c, D);
  else if (t === "spells") c3 += sheetSpells(c, D);
  else if (t === "inventory") c3 += `<div class="row">${["cp", "sp", "ep", "gp", "pp"].map(k => `<label class="small">${k.toUpperCase()} ${inp("coins." + k, +c.coins[k] || 0, { type: "number", style: "width:64px" })}</label>`).join("")}</div>
    <table class="t" style="margin-top:8px"><tr><th>Item</th><th class="num">Qty</th><th>Notes</th><th></th></tr>${c.items.map((it, i) => `<tr><td>${inp(`items.${i}.name`, it.name, { style: "width:100%" })}</td><td class="num">${inp(`items.${i}.qty`, +it.qty || 1, { type: "number", style: "width:56px" })}</td><td>${inp(`items.${i}.note`, it.note || "", { style: "width:100%" })}</td><td style="white-space:nowrap">${it.desc || it.img ? `<button class="small ghost" data-act="itemInfo" data-i="${i}" title="Description">${it.img ? `<img src="${it.img}" style="width:22px;height:22px;object-fit:cover;border-radius:4px;vertical-align:middle">` : "ⓘ"}</button>` : ""}<button class="small ghost" data-act="del" data-p="items" data-i="${i}">✕</button></td></tr>`).join("")}</table>
    <div class="row" style="margin-top:8px"><button data-act="shopOpen">🛒 Shop</button><button class="small ghost" data-act="addItem">+ Add item by hand</button></div><p class="small muted">Armor: ${esc(D.armor.name)}${c.shield ? " + Shield" : ""} (change in Build → Equipment)</p>`;
  else if (t === "notes") c3 += `<textarea data-live="notes" style="min-height:420px">${esc(c.notes)}</textarea>`;
  else if (t === "story") c3 += `${c.storyImage ? `<img src="${c.storyImage}" style="float:right;max-width:40%;border-radius:8px;margin:0 0 8px 10px">` : ""}<div class="desc">${para(c.backstory) || '<span class="muted">Write the backstory in Build → Story.</span>'}</div>`;
  c3 += `</div>`;
  const mt = S.mtab || "combat";
  const mnav = `<nav class="mnav">${[["combat", "❤", "Combat"], ["stats", "◆", "Stats"], ["features", "★", "Features"], ["spells", "✦", "Spells"], ["inventory", "▣", "Items"], ["notes", "✎", "Notes"]].map(([k, i, l]) => `<button class="${mt === k ? "on" : ""}" data-act="mtab" data-k="${k}"><span>${i}</span>${l}</button>`).join("")}</nav>`;
  return h + `<div class="sheet m-${["combat", "stats"].includes(mt) ? mt : "col3"}"><div class="col1">${c1}</div><div class="col2">${c2}</div><div class="col3">${c3}</div></div>${mnav}`;
}

function featRow(f) {
  return `<div class="feat"><div class="h" data-act="toggleOpen"><b>${esc(f.name)}</b>${f.active ? actTag(actKind(f.text)) : ""}${f.note ? `<span class="chip">${esc(f.note)}</span>` : ""}<span class="src">${esc(f.src)}</span>
    <button class="small ghost" data-act="featEdit" data-k="${esc(f.key)}" title="Edit">✎</button></div>
    <div class="body hidden"><div class="desc">${diceLinks(para(f.text), f.name) || '<span class="muted">No description — click ✎ to add one.</span>'}</div></div></div>`;
}
function sheetFeatures(c, D) {
  const vis = D.features.filter(f => S.ui.showHidden || !f.hidden);
  const act = vis.filter(f => f.active), pas = vis.filter(f => !f.active);
  const nh = D.features.filter(f => f.hidden).length;
  return `<div class="row small"><span class="muted">Click a feature to expand.</span><label class="right"><input type="checkbox" data-act="showHidden" ${S.ui.showHidden ? "checked" : ""}> show hidden (${nh})</label></div>
    <h3 style="margin-top:10px">Active</h3>${act.map(featRow).join("") || '<p class="muted small">—</p>'}<h3 style="margin-top:14px">Passive</h3>${pas.map(featRow).join("") || '<p class="muted small">—</p>'}`;
}
function freeRes(name, D) { const k = D.freeCast[norm(name)]; return k ? D.allResources.find(r => r.key === k) : null; }
function freePips(name, D, c) { const r = freeRes(name, D); return r && r.max > 0 ? `<span class="freecast" title="Cast without a spell slot (${esc(r.name)})"><span class="small muted">free</span>${pips(r.key, r.max, c.play.used[r.key])}</span>` : ""; }
function freeToggle(name, D, c) {
  const mine = (c.freeCasts || []).includes(name), r = freeRes(name, D);
  if (r && !mine) return `<div class="small muted" style="margin-bottom:6px">Free cast without a slot: ${esc(r.src || r.name)} (${r.reset === "SR" ? "short rest" : "long rest"})</div>`;
  return `<label class="small" style="display:block;margin-bottom:6px"><input type="checkbox" data-act="freeToggle" data-n="${esc(name)}" ${mine ? "checked" : ""}> I can cast this once per long rest without a spell slot (feat, item …)</label>`;
}
function sheetSpells(c, D) {
  const groups = {};
  const add = (name, src, always, lvlHint) => { const si = spellInfo(name); const l = si?.level ?? lvlHint ?? "?"; (groups[l] ||= []).push({ name, src, always, si }); };
  D.alwaysSpells.forEach(s => add(s.name, s.src, true));
  c.spells.forEach(s => add(s.name, s.cls === "other" ? "Other" : CLASSES[s.cls]?.name || s.cls, false, s.level));
  let h = D.casters.map(cs => `<span class="chip acc roll" ${R(cs.name + " spell attack", cs.atk)}>${cs.name}: DC ${cs.dc} · Atk ${sgn(cs.atk)} 🎲</span>`).join("")
    + (D.speciesCast && D.alwaysSpells.some(s => s.cls === "species") ? `<span class="chip acc roll" ${R(D.speciesCast.name + " spell attack", D.speciesCast.atk)}>${esc(D.speciesCast.name)} spells: DC ${D.speciesCast.dc} · Atk ${sgn(D.speciesCast.atk)} (${ABBR[D.speciesCast.ability]}) 🎲</span>` : "") + `<button class="small ghost" data-act="goSpells" style="margin-left:6px">Change spells</button>`;
  if (D.slots.length || D.pact) h += `<div class="spslots"><h3 style="margin:10px 0 4px">Spell slots</h3>${slotRows(D, c.play)}</div>`;
  if (!Object.keys(groups).length) return h + `<p class="muted">No spells.</p>`;
  const F = S.ui.spf || "", FILT = [["", "All"], ["A", "Action"], ["BA", "Bonus action"], ["R", "Reaction"], ["rit", "Ritual"], ["conc", "Concentration"]];
  const pass = s => !F || (F === "rit" ? s.si?.ritual : F === "conc" ? s.si?.conc : actKind("", s.si?.time) === F);
  h += `<div class="spfilter">${FILT.map(([k, l]) => `<button class="small ${F === k ? "" : "ghost"}" data-act="spFilter" data-f="${k}">${l}</button>`).join("")}</div>`;
  for (const k in groups) groups[k] = groups[k].filter(pass);
  for (const k in groups) if (!groups[k].length) delete groups[k];
  if (!Object.keys(groups).length) h += `<p class="muted small">No spells match this filter.</p>`;
  for (const l of Object.keys(groups).sort((a, b) => (a === "?" ? 99 : a) - (b === "?" ? 99 : b))) {
    h += `<h3 style="margin-top:12px">${l === "?" ? "Other spells" : +l ? "Level " + l : "Cantrips"}</h3>`;
    h += groups[l].sort((a, b) => a.name.localeCompare(b.name)).map(s => `<div class="spell"><div class="h" data-act="toggleOpen"><b style="flex:1">${esc(s.name)}</b>${s.si?.school ? `<span class="tag school">${esc(s.si.school)}</span>` : ""}${s.si?.conc ? '<span class="tag">C</span>' : ""}${s.si?.ritual ? '<span class="tag">R</span>' : ""}${actTag(actKind("", s.si?.time))}<span class="muted small">${esc(s.si?.time || "")}${s.si?.range ? " · " + esc(s.si.range) : ""}</span><span class="tag">${esc(s.src)}${s.always ? " ★" : ""}</span>${freePips(s.name, D, c)}</div>
      <div class="body hidden">${+l ? freeToggle(s.name, D, c) : ""}${s.si ? `<div class="meta">${esc([s.si.time && "Casting time: " + s.si.time, s.si.range && "Range: " + s.si.range, s.si.comp && "Components: " + s.si.comp, s.si.dur && "Duration: " + s.si.dur].filter(Boolean).join(" · "))}</div><div class="desc">${diceLinks(para(s.si.text), s.name)}</div>` : '<span class="muted small">No description imported.</span>'}</div></div>`).join("");
  }
  return h;
}

// ---------- MODALS ----------
function openModal(m) { S.modal = m; renderModal(); }
function closeModal() { S.modal = null; S.draft = null; renderModal(); }
function renderModal() { keepScroll(renderModalInner); }
function renderModalInner() {
  const bg = $("#modal"), box = $("#modal-box");
  if (!S.modal) { bg.classList.add("hidden"); return; }
  bg.classList.remove("hidden");
  const st = box.scrollTop;
  box.innerHTML = { levelup: mLevelUp, feature: mFeature, shortRest: mShortRest, longRest: mLongRest, shop: () => mShop(), info: mInfo, image: mImage, crop: mCrop, spellAtk: mSpellAtk, dmloot: mDmLoot, party: mParty, join: mJoin, group: mGroup }[S.modal.type]();
  box.scrollTop = st;
}

function mGroup() {
  const m = S.modal, others = [...new Set(S.chars.map(c => c.group).filter(g => g && g !== m.orig))];
  return `<h2>${m.orig ? "Edit group" : "New group"}</h2>
    <label>Group name<br><input id="grpname" value="${esc(m.name)}" placeholder="e.g. Red Knights" style="width:100%"></label>
    <p class="small muted" style="margin:10px 0 4px">Characters in this group:</p>
    <div class="grppick">${S.chars.map(c => `<label class="grprow"><input type="checkbox" data-act="grpToggle" data-id="${esc(c.id)}" ${m.ids.includes(c.id) ? "checked" : ""}>
      ${c.thumb ? `<img src="${c.thumb}">` : `<span class="ph">🛡</span>`}<span class="grow"><b>${esc(c.name)}</b>${c.group && c.group !== m.orig ? `<span class="small muted"> · now in ${esc(c.group)}</span>` : ""}</span></label>`).join("")}</div>
    ${others.length ? `<p class="small muted">A character can be in one group; ticking it here moves it.</p>` : ""}
    <div class="foot">${m.orig ? `<button class="ghost" data-act="grpDelete">Ungroup all</button>` : ""}<button class="ghost" data-act="modalClose">Cancel</button><button data-act="grpSave">Save group</button></div>`;
}
async function setCharGroup(ids, name) {
  for (const id of ids) {
    const c = S.char && S.char.id === id ? S.char : await DB.getChar(id); if (!c) continue;
    c.group = name; c._updated = Date.now(); await DB.putChar(JSON.parse(JSON.stringify(c))); if (typeof Folder !== "undefined") Folder.push(c);
  }
  Sync.soon(); await loadChars();
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
    const subCard = ([k, s]) => `<div class="pick ${S.ui.subPeek === k ? "peek" : ""}" data-act="luSub" data-k="${k}"><b>${s.name}</b><span class="small muted">${(s.features[cl] || []).join(", ")}</span>${s.src ? `<div class="small muted" style="font-style:italic;margin-top:2px">${esc(s.src)}</div>` : ""}
      <a href="#" class="small subpeek" data-act="subPeek" data-k="${k}">${S.ui.subPeek === k ? "▾ hide features" : "▸ all features (levels 3–20)"}</a></div>`;
    const subs = Object.entries(C.subclasses), old = subs.filter(([, s]) => s.legacy);
    h += `<div class="lvl"><b>Choose your subclass:</b><div class="grid gauto" style="margin-top:6px">${subs.filter(([, s]) => !s.legacy).map(subCard).join("")}</div>
      ${old.length ? `<details style="margin-top:8px" ${S.ui.oldSubs ? "open" : ""}><summary data-act="toggleOldSubs"><b>Older subclasses</b> <span class="small muted">(${old.length}, from 2014-era books — adapted: everything they gave at level 1 or 2 comes at level 3)</span></summary>
        <div class="grid gauto" style="margin-top:6px">${old.sort((a, b) => a[1].name.localeCompare(b[1].name)).map(subCard).join("")}</div></details>` : ""}
      ${S.ui.subPeek && C.subclasses[S.ui.subPeek] ? `<div class="subpeekbox" id="subpeekbox">${subOverview(lv.cls, S.ui.subPeek, 0)}<div class="row" style="margin-top:8px"><button data-act="luSub" data-k="${S.ui.subPeek}">Choose ${esc(C.subclasses[S.ui.subPeek].name)}</button><a href="#" class="small" data-act="subPeek" data-k="${S.ui.subPeek}">close</a></div></div>` : ""}</div>`;
  } else if (feats.includes("@sub") && d.subclasses[lv.cls] && !old.subs[lv.cls]) {
    h += `<p>Subclass: <b>${C.subclasses[d.subclasses[lv.cls]].name}</b> <a href="#" data-act="luSub" data-k="">change</a></p>
      <details class="subdet"><summary class="small"><b>📖 Everything ${esc(C.subclasses[d.subclasses[lv.cls]].name)} gives</b> (now and at later levels)</summary>${subOverview(lv.cls, d.subclasses[lv.cls], cl)}</details>`;
  }
  // features gained
  const newF = [];
  feats.forEach(n => { if (n === "@sub") { const s = D.subs[lv.cls]; if (s) (s.features[cl] || []).forEach(x => newF.push([x, s.name])); } else if (n !== "@asi" && n !== "@boon") newF.push([n, C.name]); });
  if (i > 0 || true) {
    const slug = classSlug(lv.cls), ss = d.subclasses[lv.cls] ? subclassSlug(lv.cls, d.subclasses[lv.cls]) : null;
    h += newF.map(([n, src]) => `<details class="lvl"><summary><b>${esc(n)}</b> <span class="muted small">${esc(src)}</span>${C.notes?.[n] ? ` <span class="chip">${esc(C.notes[n](cl, D))}</span>` : ""}</summary><div class="desc">${para(lookup(n, [ss, slug].filter(Boolean), D.subs[lv.cls] && src === D.subs[lv.cls].name ? subDesc(lv.cls, d.subclasses[lv.cls], n) : "")) || '<span class="muted">No description imported.</span>'}</div></details>`).join("");
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

function rollPortent(D) { const r = D.resources.find(x => x.key === "portent"); if (!r) return ""; const P = S.char.play; P.portent = Array.from({ length: r.max }, () => ({ v: rollDie(20), u: false })); P.used.portent = 0; return P.portent.map(x => x.v).join(", "); }
function featResources(D, f) {
  const n = norm(f.name);
  return D.allResources.filter(r => r.featKey === f.key || (!r.manual && r.feature && (norm(r.feature) === n || n.startsWith(norm(r.feature) + " "))));
}
function mFeature() {
  const c = S.char, D = derive(c); const f = D.features.find(x => x.key === S.modal.key); if (!f) return "";
  const rs = featResources(D, f), RS = { LR: "Long rest", SR: "Short rest", "": "never" };
  const resetSel = (cls, i, v) => `<select class="${cls}" data-i="${i}">${Object.entries(RS).map(([k, l]) => `<option value="${k}" ${k === (v ?? "LR") ? "selected" : ""}>${l}</option>`).join("")}</select>`;
  return `<h2>${esc(f.name)}</h2><p class="muted small">${esc(f.src)}${f.edited ? " · edited by you" : ""}</p>
   <textarea id="fetext" style="min-height:240px">${esc(S.modal.text ?? f.text)}</textarea>
   <div class="row" style="margin-top:8px"><label><input type="checkbox" id="feact" ${(S.modal.act ?? f.active) ? "checked" : ""}> Active (has uses / action) — otherwise Passive</label><label><input type="checkbox" id="fehid" ${(S.modal.hid ?? f.hidden) ? "checked" : ""}> Hide from sheet & PDF</label></div>
   <h3 style="margin-top:14px">Uses (red dots on the sheet)</h3>
   ${rs.length ? `<table class="t small"><tr><th>Resource</th><th class="num">Uses</th><th>Recharge</th><th></th></tr>${rs.map(r => r.manual
      ? `<tr><td><input class="frn" data-i="${r.idx}" value="${esc(r.name)}"></td><td class="num"><input class="fru" data-i="${r.idx}" type="number" min="0" value="${r.max}" style="width:64px"></td><td>${resetSel("frr", r.idx, r.reset)}</td><td><button class="small ghost" data-act="featResDel" data-i="${r.idx}">✕</button></td></tr>`
      : `<tr><td>${esc(r.name)}${r.overridden ? ' <span class="chip warn">changed</span>' : ""}</td><td class="num"><input class="rmx" data-k="${esc(r.key)}" data-def="${r.baseMax}" type="number" min="0" value="${r.max}" style="width:64px"></td><td>${RS[r.reset] || esc(r.reset || "")}</td><td class="small muted">rules: ${r.baseMax}</td></tr>`).join("")}</table>
      <p class="small muted">Set uses to 0 to hide a resource. Put the rules number back to undo a change.</p>` : '<p class="small muted">This feature has no uses tracked yet.</p>'}
   <button class="small ghost" data-act="featResAdd">＋ Add a resource for this feature</button>
   <div class="foot">${f.edited ? `<button class="ghost" data-act="featReset" style="margin-right:auto">Reset to wiki text</button>` : ""}<button class="ghost" data-act="modalClose">Cancel</button><button data-act="featSave">Save</button></div>`;
}
// keep typed text when the feature dialog re-renders
function keepFeatForm() { const m = S.modal; m.text = $("#fetext").value; m.act = $("#feact").checked; m.hid = $("#fehid").checked; readFeatRes(); }
function readFeatRes() {
  const c = S.char, k = S.modal.key, arr = (c.featRes || {})[k] || [];
  document.querySelectorAll(".frn").forEach(el => { const r = arr[+el.dataset.i]; if (r) r.name = el.value; });
  document.querySelectorAll(".fru").forEach(el => { const r = arr[+el.dataset.i]; if (r) r.uses = +el.value || 0; });
  document.querySelectorAll(".frr").forEach(el => { const r = arr[+el.dataset.i]; if (r) r.reset = el.value; });
  document.querySelectorAll(".rmx").forEach(el => { const m = c.resMax ||= {}; if (el.value === "" || +el.value === +el.dataset.def) delete m[el.dataset.k]; else m[el.dataset.k] = +el.value; });
}
function mInfo() { return `<h2>${esc(S.modal.title)}</h2>${S.modal.sub ? `<p class="muted small">${esc(S.modal.sub)}</p>` : ""}<div class="desc">${S.modal.html}</div><div class="foot"><button data-act="modalClose">Close</button></div>`; }
function mImage() { return `<div style="text-align:center"><img src="${S.char.portrait}" style="max-width:100%;max-height:78vh;border-radius:10px"></div><div class="foot"><button class="ghost" data-act="cropThumb">✂ Adjust thumbnail</button><button data-act="modalClose">Close</button></div>`; }
// thumbnail crop: drag the picture inside the square, zoom with the slider
function mCrop() {
  const m = S.modal;
  return `<h2>Thumbnail</h2><p class="small muted">Drag the picture to choose what shows in the square thumbnail (home screen and sheet). Zoom with the slider.</p>
    <div id="cropbox" class="cropbox" style="width:${CROP_V}px;height:${CROP_V}px"><img id="cropimg" src="${m.src}" draggable="false" style="${cropStyle(m)}"></div>
    <div class="row" style="justify-content:center;margin-top:8px"><span class="small">Zoom</span><input type="range" min="1" max="4" step="0.05" value="${m.z}" data-act-input="cropZoom" style="width:200px"></div>
    <div class="foot"><button class="ghost" data-act="modalClose">${m.isNew ? "Use centre" : "Cancel"}</button><button data-act="cropSave">Save thumbnail</button></div>`;
}
const CROP_V = 260;
function cropGeom(m) { const s0 = CROP_V / Math.min(m.w, m.h), s = s0 * m.z, dw = m.w * s, dh = m.h * s;
  let ox = CROP_V / 2 - m.cx * dw, oy = CROP_V / 2 - m.cy * dh; ox = Math.min(0, Math.max(CROP_V - dw, ox)); oy = Math.min(0, Math.max(CROP_V - dh, oy));
  return { s, dw, dh, ox, oy }; }
function cropStyle(m) { const g = cropGeom(m); return `position:absolute;left:${g.ox}px;top:${g.oy}px;width:${g.dw}px;height:${g.dh}px;max-width:none;user-select:none;touch-action:none`; }
function cropApply() { const img = $("#cropimg"); if (img) img.setAttribute("style", cropStyle(S.modal)); }
function makeThumb(src, crop) {
  return new Promise(res => { const img = new Image(); img.onload = () => {
    const m = { w: img.width, h: img.height, ...crop }, g = cropGeom(m), cv = document.createElement("canvas"); cv.width = cv.height = 192;
    cv.getContext("2d").drawImage(img, -g.ox / g.s, -g.oy / g.s, CROP_V / g.s, CROP_V / g.s, 0, 0, 192, 192); res(cv.toDataURL("image/jpeg", 0.85)); }; img.src = src; });
}
function openCrop(isNew) {
  const c = S.char, cr = c.thumbCrop || { cx: 0.5, cy: 0.3, z: 1 }, img = new Image();
  img.onload = () => openModal({ type: "crop", src: c.portrait, w: img.width, h: img.height, cx: cr.cx, cy: cr.cy, z: cr.z, isNew });
  img.src = c.portrait;
}
// drag inside the crop box
let cropDrag = null;
document.addEventListener("pointerdown", e => { if (!e.target.closest("#cropbox") || !S.modal || S.modal.type !== "crop") return; e.preventDefault(); const g = cropGeom(S.modal); cropDrag = { x: e.clientX, y: e.clientY, cx: S.modal.cx, cy: S.modal.cy, dw: g.dw, dh: g.dh }; });
document.addEventListener("pointermove", e => { if (!cropDrag) return; const m = S.modal; m.cx = Math.min(1, Math.max(0, cropDrag.cx - (e.clientX - cropDrag.x) / cropDrag.dw)); m.cy = Math.min(1, Math.max(0, cropDrag.cy - (e.clientY - cropDrag.y) / cropDrag.dh)); cropApply(); });
document.addEventListener("pointerup", () => { if (!cropDrag) return; cropDrag = null; const m = S.modal, g = cropGeom(m); m.cx = (CROP_V / 2 - g.ox) / g.dw; m.cy = (CROP_V / 2 - g.oy) / g.dh; });   // keep the centre inside the picture
// weapon masteries (2024 rules, SRD 5.2 wording shortened); the wiki text is used when imported
const MASTERY_TEXT = {
  Cleave: "If you hit a creature with a melee attack roll using this weapon, you can make a melee attack roll with the weapon against a second creature within 5 feet of the first that is also within your reach. On a hit, the second creature takes the weapon's damage, but don't add your ability modifier to that damage unless that modifier is negative. You can make this extra attack only once per turn.",
  Graze: "If your attack roll with this weapon misses a creature, you can deal damage to that creature equal to the ability modifier you used to make the attack roll. This damage is the same type dealt by the weapon, and the damage can be increased only by increasing the ability modifier.",
  Nick: "When you make the extra attack of the Light property, you can make it as part of the Attack action instead of as a Bonus Action. You can make this extra attack only once per turn.",
  Push: "If you hit a creature with this weapon, you can push the creature up to 10 feet straight away from yourself if it is Large or smaller.",
  Sap: "If you hit a creature with this weapon, that creature has Disadvantage on its next attack roll before the start of your next turn.",
  Slow: "If you hit a creature with this weapon and deal damage to it, you can reduce its Speed by 10 feet until the start of your next turn. If the creature is hit more than once by weapons that have this property, the Speed reduction doesn't exceed 10 feet.",
  Topple: "If you hit a creature with this weapon, you can force the creature to make a Constitution saving throw (DC 8 plus the ability modifier used to make the attack roll and your Proficiency Bonus). On a failed save, the creature has the Prone condition.",
  Vex: "If you hit a creature with this weapon and deal damage to the creature, you have Advantage on your next attack roll against that creature before the end of your next turn."
};
function masteryText(a, D) {
  const wiki = lookup(a.mastery), txt = wiki && wiki.length > 40 ? wiki : MASTERY_TEXT[a.mastery] || "";
  const extra = a.mastery === "Topple" ? `<b>Your DC: ${8 + a.abMod + D.pb}</b> (8 + ${ABBR[a.ab]} ${sgn(a.abMod)} + Prof ${sgn(D.pb)})` : a.mastery === "Graze" ? `<b>Your graze damage: ${Math.max(0, a.abMod)}</b> (${ABBR[a.ab]} modifier)` : "";
  return `<b>${esc(a.mastery)}</b> — ${para(txt) || "No description."}${extra ? `<p style="margin:4px 0 0">${extra}</p>` : ""}`;
}
function mShortRest() {
  const c = S.char, D = derive(c), con = D.mod.con;
  return `<h2>Short rest</h2><p>Spend Hit Dice to heal (each: roll + Con ${sgn(con)}).</p>
   ${D.hitDice.map(x => { const rem = x.n - (c.play.hd[x.die] || 0); return `<div class="res"><span class="n"><b>${x.die}</b> — ${rem} of ${x.n} left</span><button class="small" data-act="hdRoll" data-d="${x.die}" ${rem <= 0 ? "disabled" : ""}>🎲 Spend 1 ${x.die}</button></div>`; }).join("")}
   <p>HP: <b>${Math.min(c.play.hp ?? D.hpMax, D.hpMax)}</b> / ${D.hpMax}</p>${S.modal.log ? `<p class="small muted">${S.modal.log}</p>` : ""}
   <p class="small muted">Finishing restores: ${D.resources.filter(r => r.reset === "SR" || r.note.startsWith("regain 1")).map(r => r.name).join(", ") || "—"}${D.pact ? ", Pact slots" : ""}.</p>
   ${restChoiceUI(D, "SR")}
   <div class="foot"><button class="ghost" data-act="modalClose">Cancel</button><button data-act="srFinish">Finish short rest</button></div>`;
}
// subclass choices you make on a rest (Ebon Blade rune, Land type, Dread Allegiance, Mystic Brew...)
function restChoiceList(D, rest) { return (D.restChoices || []).filter(r => r.ch.reset === "SR" || (rest === "LR" && r.ch.reset === "LR")); }
function restChoiceUI(D, rest) {
  const list = restChoiceList(D, rest); if (!list.length) return "";
  return `<div class="card" style="margin:10px 0"><h3 style="margin-top:0">${rest === "LR" ? "Choices for the next day" : "Choices on this rest"}</h3>` + list.map(r => `
    <label style="display:block;margin:6px 0"><b>${esc(r.ch.label)}</b> <span class="small muted">(${esc(r.sub.name)})</span><br>
      <select data-act="restChoice" data-k="${r.ch.key}">${r.pick ? "" : '<option value="">— choose —</option>'}${r.ch.options.map(o => `<option ${o === r.pick ? "selected" : ""}>${esc(o)}</option>`).join("")}</select></label>
    ${r.pick ? `<div class="small desc" style="margin:2px 0 8px">${para(choiceText(r.ch, r.pick))}</div>` : ""}`).join("") + `</div>`;
}
function mLongRest() {
  const D = derive(S.char);
  return `<h2>Long rest</h2><p>Restores HP, Hit Dice, spell slots and all uses.</p>${restChoiceUI(D, "LR")}
   <div class="foot"><button class="ghost" data-act="modalClose">Cancel</button><button data-act="lrFinish">Finish long rest</button></div>`;
}

function applyFeatPick(p, v) {
  if (p === "__bg") { S.char.background.featOverride = v; S.char.bgFeat = { picks: {} }; return; }
  setPath(target(), p, v ? { name: v, picks: {} } : null);
}
// ---------- EVENTS ----------
// save a file: share sheet on phones, download on computers
async function shareFile(name, text, title) {
  const file = new File([text], name, { type: "application/json" });
  if (navigator.canShare && /Android|iPhone|iPad/i.test(navigator.userAgent) && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title }); return; } catch (e) { if (e.name === "AbortError") return; }
  }
  const a = document.createElement("a"); a.href = URL.createObjectURL(file); a.download = name; a.click();
  toast("Saved " + name + " to your Downloads");
}
const ACT = {
  home: async () => { save(true); S.view = "home"; S.char = null; await loadChars(); render(); },
  theme: () => { const r = document.documentElement; const d = r.dataset.theme === "dark" ? "light" : "dark"; r.dataset.theme = d; try { localStorage.setItem("theme", d); } catch (e) { } },
  new: async () => { S.char = newChar(); await save(true); S.view = "builder"; S.tab = "basics"; render(); },
  open: el => openChar(el.dataset.id),
  dsTap: el => { const P = S.char.play, k = el.dataset.k, i = +el.dataset.i; P.ds[k] = P.ds[k] > i ? i : i + 1; save(); render(); },
  spFilter: el => { S.ui.spf = el.dataset.f; render(); },
  groupToggle: (el, e) => { if (e.target.closest("[data-act=groupEdit]")) return; const g = el.dataset.g, o = openGroups(); const i = o.indexOf(g); i >= 0 ? o.splice(i, 1) : o.push(g); try { localStorage.setItem("openGroups", JSON.stringify(o)); } catch (x) { } render(); },
  groupEdit: (el, e) => { e?.stopPropagation(); const g = el.dataset.g || ""; openModal({ type: "group", orig: g, name: g, ids: S.chars.filter(c => g && c.group === g).map(c => c.id) }); },
  grpToggle: el => { const m = S.modal, id = el.dataset.id; m.name = $("#grpname").value; m.ids = el.checked ? [...new Set([...m.ids, id])] : m.ids.filter(x => x !== id); renderModal(); },
  grpSave: async () => {
    const m = S.modal, name = $("#grpname").value.trim();
    if (!name) return toast("Give the group a name");
    if (!m.ids.length) return toast("Tick at least one character");
    const before = S.chars.filter(c => m.orig && c.group === m.orig && !m.ids.includes(c.id)).map(c => c.id);
    await setCharGroup(before, ""); await setCharGroup(m.ids, name);
    const o = openGroups().filter(g => g !== m.orig); o.push(name); try { localStorage.setItem("openGroups", JSON.stringify(o)); } catch (x) { }
    closeModal(); render(); toast("Group saved");
  },
  grpDelete: async () => { const m = S.modal; if (!confirm(`Remove the group "${m.orig}"? The characters stay, they just aren't grouped any more.`)) return;
    await setCharGroup(S.chars.filter(c => c.group === m.orig).map(c => c.id), ""); closeModal(); render(); },
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
        let data; try { data = JSON.parse(await file.text()); } catch (e) { toast("Not a character file: " + file.name); continue; }
        for (const c of Array.isArray(data) ? data : [data]) {
        if (!c || !c.levels || !c.play) { toast("Not a character file: " + file.name); continue; }
        if (!c.id) c.id = "c" + Date.now().toString(36) + n;
        delete c._driveId; delete c._syncedAt;
        const ex = await DB.getChar(c.id);
        if (ex && (ex._updated || 0) > (c._updated || 0) && !confirm(`The ${c.name} on this device is newer than the file. Replace it with the file anyway?`)) continue;
        if (ex) { c._driveId = ex._driveId; c._syncedAt = ex._syncedAt; }
        migrate(c); await storeSaveChar(c); n++; last = c;
        }
      }
      await loadChars();
      if (n === 1) { S.char = last; S.view = "sheet"; }
      render(); if (n) toast(`Imported ${n} character${n > 1 ? "s" : ""}`);
    };
    f.click();
  },
  exportJson: async () => {
    const c = JSON.parse(JSON.stringify(S.char)); delete c._driveId; delete c._syncedAt;
    await shareFile((c.name || "character").replace(/[^\w\- ]+/g, "").trim().replace(/ +/g, "_") + ".json", JSON.stringify(c, null, 1), c.name);
  },
  exportAll: async () => {
    if (!S.chars.length) return toast("No characters yet");
    const all = [];
    for (const x of S.chars) { const c = JSON.parse(JSON.stringify((await DB.getChar(x.id)) || x)); delete c._driveId; delete c._syncedAt; all.push(c); }
    await shareFile("all-characters-" + new Date().toISOString().slice(0, 10) + ".json", JSON.stringify(all, null, 1), "All characters");
  },
  deleteChar: async () => { if (!confirm("Delete " + S.char.name + " on all devices?")) return; await storeDeleteChar(S.char.id); S.char = null; S.view = "home"; await loadChars(); render(); },
  setSpecies: el => { const c = S.char; if (c.species.id !== el.dataset.id) { c.species = { id: el.dataset.id, choice: "", size: "" }; delete c.pools.keenSenses; delete c.pools.skillful; delete c.pools.spSkills; } save(); render(); },
  toggleOldSpecies: () => { S.ui.oldSpecies = !S.ui.oldSpecies; render(); },
  toggleOldSubs: (el, e) => { e.preventDefault(); S.ui.oldSubs = !S.ui.oldSubs; renderModal(); },
  useForm: el => { const c = S.char, r = derive(c).resources.find(x => x.key === el.dataset.k); if (!r) return; const used = c.play.used[r.key] || 0;
    if (used >= r.max) return toast("No uses left — finish a Long Rest"); c.play.used[r.key] = used + 1; (c.play.active ||= {})[r.key] = el.dataset.f; save(); render(); toast(el.dataset.f + " — active for 1 minute"); },
  endForm: el => { const c = S.char; if (c.play.active) delete c.play.active[el.dataset.k]; save(); render(); },
  setBg: el => { const c = S.char; if (c.background.id !== el.dataset.id) { applyStartEquip(c, [], "bg"); (c.startEquip ||= {}).bg = ""; c.background = { id: el.dataset.id, mode: "21", plus2: "", plus1: "", tool: "", skills: [], p111: [] }; c.bgFeat = { picks: {} }; } save(); render(); },
  pbm: el => { const a = el.dataset.a; S.char.base[a] = Math.max(8, Math.min(15, S.char.base[a] + +el.dataset.d)); save(); render(); },
  stdArray: () => { const D = derive(S.char); const order = [...ABILITIES].sort((a, b) => (D.startCls && CLASSES[D.startCls].primary.includes(b) ? 1 : 0) - (D.startCls && CLASSES[D.startCls].primary.includes(a) ? 1 : 0)); [15, 14, 13, 12, 10, 8].forEach((v, i) => S.char.base[order[i]] = v); save(); render(); },
  levelup: () => startLevelUp(),
  poplevel: () => { const c = S.char; const lv = c.levels.pop(); if (lv && !c.levels.some(l => l.cls === lv.cls)) delete c.subclasses[lv.cls]; else if (lv) { const D = derive(c); const C = CLASSES[lv.cls]; const subLvl = +Object.keys(C.features).find(k => C.features[k].includes("@sub")); if (D.cls[lv.cls] < subLvl) delete c.subclasses[lv.cls]; } save(); render(); },
  img: el => pickImage(async (big, small) => { S.char[el.dataset.k] = big;
    if (el.dataset.k === "portrait") { S.char.thumbCrop = { cx: 0.5, cy: 0.3, z: 1 }; S.char.thumb = await makeThumb(big, S.char.thumbCrop); save(); render(); openCrop(true); return; }
    save(); render(); }),
  imgdel: el => { S.char[el.dataset.k] = ""; if (el.dataset.k === "portrait") { S.char.thumb = ""; delete S.char.thumbCrop; } save(); render(); },
  cropThumb: () => { if (S.char.portrait) openCrop(false); },
  cropSave: async () => { const m = S.modal, g = cropGeom(m); const crop = { cx: (CROP_V / 2 - g.ox) / g.dw, cy: (CROP_V / 2 - g.oy) / g.dh, z: m.z };
    S.char.thumbCrop = crop; S.char.thumb = await makeThumb(S.char.portrait, crop); S.modal = null; save(); render(); renderModal(); toast("Thumbnail saved"); },
  viewPortrait: () => openModal({ type: "image" }),
  resInfo: el => { const D = derive(S.char), r = D.resources.find(x => x.key === el.dataset.k); if (!r) return;
    const f = D.features.find(x => norm(x.name) === norm(r.feature) || norm(x.name).startsWith(norm(r.feature) + " ") || norm(x.name).startsWith(norm(r.feature) + ":"));
    const txt = f?.text || lookup(r.feature || r.name);
    openModal({ type: "info", title: r.name, sub: [f?.src || r.src, r.reset === "SR" ? "recharges on a Short rest" : r.reset === "LR" ? "recharges on a Long rest" : "", r.die ? "die: " + r.die : ""].filter(Boolean).join(" · "), html: txt ? diceLinks(para(txt), r.name) : '<span class="muted">No description imported.</span>' }); },
  mastInfo: el => { const o = S.ui.mastOpen ||= {}; o[el.dataset.i] = !o[el.dataset.i]; render(); },
  spSchool: el => { const v = el.dataset.v, a = S.ui.spSchools || []; S.ui.spSchools = !v ? [] : a.includes(v) ? a.filter(x => x !== v) : [...a, v]; render(); },
  subPeek: (el, e) => { e.stopPropagation(); e.preventDefault(); S.ui.subPeek = S.ui.subPeek === el.dataset.k ? null : el.dataset.k; renderModal(); },
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
    if (restChoiceList(derive(S.char), "LR").length) return openModal({ type: "longRest" });
    if (!confirm("Take a long rest? Restores HP, hit dice, spell slots and all uses.")) return;
    ACT.lrFinish();
  },
  lrFinish: () => {
    if (S.modal) closeModal();
    const P = S.char.play, D = derive(S.char);
    Object.assign(P, { hp: D.hpMax, temp: 0, used: {}, slots: {}, pact: 0, hd: {}, ds: { s: 0, f: 0 }, active: {}, exhaustion: Math.max(0, (+P.exhaustion || 0) - 1) });
    P.conditions = P.conditions.filter(x => x !== "Raging" && x !== "Concentrating");
    const tmp = Math.max(0, ...(D.restChoices || []).map(r => r.pick && r.ch.lrTemp?.[r.pick] ? r.ch.lrTemp[r.pick](D.cls[r.cls], D) : 0)); if (tmp) P.temp = tmp;
    const pr = rollPortent(D);
    save(); render(); toast("Long rest complete" + (pr ? " · Portent: " + pr : ""));
  },
  shortRest: () => openModal({ type: "shortRest" }),
  hdRoll: el => {
    const c = S.char, D = derive(c), die = el.dataset.d, sides = +die.slice(1);
    const roll = rollDie(sides), heal = Math.max(0, roll + D.mod.con);
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
  luSub: (el, e) => { e.preventDefault(); if (e.target.closest(".subpeek")) return; S.ui.subPeek = null; const lv = S.draft.levels[S.draft.levels.length - 1]; if (el.dataset.k) S.draft.subclasses[lv.cls] = el.dataset.k; else delete S.draft.subclasses[lv.cls]; renderModal(); },
  rollHp: () => { const lv = S.draft.levels[S.draft.levels.length - 1]; lv.hp = rollDie(CLASSES[lv.cls].hd); renderModal(); },
  luConfirm: () => {
    const old = S.modal.oldD; const D = derive(S.draft);
    const P = S.draft.play; P.hp = Math.min(D.hpMax, (P.hp ?? old.hpMax) + (D.hpMax - old.hpMax));
    S.char = S.draft; closeModal(); save(true); render(); toast(`Level ${D.level}! Max HP ${D.hpMax}`);
  },
  atkRoll: (el, e) => { e.stopPropagation(); const c = S.char, D = derive(c), a = attackById(D, el.dataset.at); if (!a) return;
    const dmg = { title: a.name + " damage", parts: a.parts, riders: damageRiders(c, D, a), note: a.note || "", minDie: a.gwf ? { v: 3, label: "Great Weapon Fighting" } : null };
    const adv = advantageHints(c, D);
    if (el.dataset.k === "hit") Dice.ask({ kind: "d20", title: a.name + " attack", mod: a.hit, then: dmg, suggest: adv.length ? "adv" : "", why: adv.join(" · ") });
    else Dice.ask({ kind: "dmg", ...dmg }); },
  wpnNew: () => { S.ui.wpnAdd = !S.ui.wpnAdd; render(); },
  wpnAdd: () => { const n = $("#addw2").value; S.char.weapons.push({ name: n, base: n, magic: +$("#addw2m").value || 0 }); S.ui.wpnAdd = false; save(); render(); toast(n + " added to your equipment"); },
  spAtkNew: () => openModal({ type: "spellAtk", i: -1, d: { spell: "", name: "", caster: derive(S.char).casters[0]?.cls || "species", mode: "atk", save: "dex", hitBonus: 0, parts: [{ f: "", type: "" }], note: "" } }),
  spAtkEdit: (el, e) => { e.preventDefault(); const i = +el.dataset.i; openModal({ type: "spellAtk", i, d: clone(S.char.spellAttacks[i]) }); },
  spAtkPart: () => { readSpAtk(); S.modal.d.parts.push({ f: "", type: S.modal.d.parts[0]?.type || "" }); renderModal(); },
  spAtkPartDel: el => { readSpAtk(); S.modal.d.parts.splice(+el.dataset.i, 1); renderModal(); },
  spAtkSave: () => { readSpAtk(); const d = S.modal.d; if (!d.spell && !d.name) return toast("Choose a spell first");
    const arr = S.char.spellAttacks ||= []; if (S.modal.i >= 0) arr[S.modal.i] = d; else arr.push(d); closeModal(); save(); render(); },
  spAtkDel: () => { S.char.spellAttacks.splice(S.modal.i, 1); closeModal(); save(); render(); },
  portentUse: el => { const P = S.char.play, x = (P.portent || [])[+el.dataset.i]; if (!x) return; x.u = !x.u; P.used.portent = P.portent.filter(y => y.u).length; save(); render(); },
  portentRoll: () => { if ((S.char.play.portent || []).some(x => !x.u) && !confirm("Re-roll your Portent dice?")) return; const r = rollPortent(derive(S.char)); save(); render(); toast("Portent: " + r); },
  featResAdd: () => { keepFeatForm(); const c = S.char, D = derive(c), f = D.features.find(x => x.key === S.modal.key); ((c.featRes ||= {})[S.modal.key] ||= []).push({ name: f ? f.name : "Uses", uses: 1, reset: "LR", feature: f?.name }); save(); render(); renderModal(); },
  featResDel: el => { keepFeatForm(); const arr = S.char.featRes[S.modal.key]; arr.splice(+el.dataset.i, 1); if (!arr.length) delete S.char.featRes[S.modal.key]; save(); render(); renderModal(); },
  featEdit: (el, e) => { e.stopPropagation(); openModal({ type: "feature", key: el.dataset.k }); },
  featSave: () => {
    const D = derive(S.char); const f = D.features.find(x => x.key === S.modal.key);
    const m = S.char.featureMeta[f.key] ||= {}; const t = $("#fetext").value;
    const orig = collectFeatures({ ...S.char, featureMeta: {} }, D).find(x => x.key === f.key);
    if (t !== (orig?.text || "")) m.text = t; else delete m.text;
    m.active = $("#feact").checked; m.hidden = $("#fehid").checked; readFeatRes();
    if (f.customIdx !== undefined) { S.char.custom[f.customIdx].text = t; delete m.text; }
    closeModal(); save(); render();
  },
  featReset: () => { const m = S.char.featureMeta[S.modal.key]; if (m) delete m.text; closeModal(); save(); render(); },
  printNow: () => window.print(),
  optToggle: el => { const o = S.ui.optOpen ||= {}; o[el.dataset.k] = !o[el.dataset.k]; S.modal ? renderModal() : render(); },
  spellPeek: el => { S.ui.spellPeek = el.dataset.v && S.ui.spellPeek !== el.dataset.v ? el.dataset.v : null; render(); },
  setLineageRow: el => { S.char.species.choice = el.dataset.v; save(); render(); },
  linInfo: el => { S.ui.linInfo = S.ui.linInfo === el.dataset.v ? null : el.dataset.v; render(); },
  pickFeat: el => { applyFeatPick(el.dataset.p, el.dataset.v); if (!S.draft) save(); S.modal ? renderModal() : render(); },
  featFilterChip: el => { S.ui.featFilter = el.dataset.a; S.modal ? renderModal() : render(); },
  featInfoTog: el => { const same = S.ui.featInfo === el.dataset.id && S.ui.featInfoName === el.dataset.v; S.ui.featInfo = same ? null : el.dataset.id; S.ui.featInfoName = same ? null : el.dataset.v; S.modal ? renderModal() : render(); },
  updateApp: async () => {
    toast("Checking for updates…");
    try { if (S.swReg) await S.swReg.update(); } catch (e) { }
    // fetch fresh copies of all files into the browser cache, then reload
    try { await Promise.all(["index.html", "rules.js", "app.js", "store.js", "ui.js", "print.js", "sheet.js", "dice.js", "style.css", "print.css", "config.js", "sw.js"].map(f => fetch(f, { cache: "reload" }))); } catch (e) { }
    location.reload();
  },
  bgFilter: el => { S.ui.bgFilter = el.dataset.a; render(); },
  optInfo: el => { const o = el.dataset.v; S.ui.optInfo = o && !(S.ui.optInfo && S.ui.optInfo.pk === el.dataset.k && S.ui.optInfo.o === o) ? { pk: el.dataset.k, o } : null; S.modal ? renderModal() : render(); },

  wikiUnlock: async () => {
    const pw = $("#wikiPw").value; if (!pw) return toast("Enter the password");
    try { toast("Unlocking…"); await WikiLock.unlock(pw, $("#wikiPwRem").checked); render(); toast("Rules text unlocked"); }
    catch (e) { toast(e.message === "Wrong password" ? "Wrong password" : "Could not unlock: " + e.message); }
  },
  wikiEncExport: async () => {
    const pw = prompt("Choose a password for the rules text (share it only with your group):"); if (!pw) return;
    if (prompt("Type the password again:") !== pw) return toast("Passwords did not match");
    toast("Encrypting…");
    const txt = await WikiLock.encrypt(S.wiki, pw);
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([txt], { type: "application/octet-stream" })); a.download = "wiki.enc"; a.click();
    toast("Saved wiki.enc — upload it to your GitHub repo");
  },
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
  restChoice: el => { S.char.pools[el.dataset.k] = el.value ? [el.value] : []; },
  freeToggle: el => { const n = el.dataset.n, a = S.char.freeCasts ||= []; const i = a.indexOf(n); i >= 0 ? a.splice(i, 1) : a.push(n); },
  spAtkSpell: el => { readSpAtk(); const old = S.modal.d; S.modal.d = el.value ? spellAttackPrefill(el.value, derive(S.char)) : { ...old, spell: "" }; },
  spAtkMode: () => readSpAtk(),
  setFeat: el => { const t = target(); setPath(t, el.dataset.p, el.value ? { name: el.value, picks: {} } : null); },
  featMulti: el => { const t = target(); const p = el.dataset.p + ".picks." + el.dataset.k; const a = getPath(t, p) || []; const v = el.dataset.v; const i = a.indexOf(v); if (i >= 0) a.splice(i, 1); else if (a.length < +el.dataset.n) a.push(v); setPath(t, p, a); },
  pool: el => { const t = target(); const a = t.pools[el.dataset.k] ||= []; const v = el.dataset.v; const i = a.indexOf(v); i >= 0 ? a.splice(i, 1) : a.push(v); },
  bgMode: el => { S.char.background.mode = el.value; },
  abilMethod: el => { S.char.abilMethod = el.value; if (el.value === "pointbuy") ABILITIES.forEach(a => S.char.base[a] = Math.max(8, Math.min(15, S.char.base[a]))); },
  asiMode: el => { const t = target(); setPath(t, el.dataset.p, el.value === "asi" ? { mode: "asi", t: "2", a1: "" } : { mode: "feat", feat: null }); },
  spellToggle: el => { const c = S.char; const n = el.dataset.n, k = el.dataset.c; const i = c.spells.findIndex(s => s.name === n && s.cls === k); if (i >= 0) c.spells.splice(i, 1); else c.spells.push({ name: n, cls: k, level: +el.dataset.l }); },
  spAll: el => { S.ui.spAll = el.checked; },
  spClass: el => { S.ui.spClass = el.value; },
  luHp: () => { const lv = S.draft.levels[S.draft.levels.length - 1]; lv.hp = null; },
  ds: el => { const P = S.char.play; const k = el.dataset.k, i = +el.dataset.i; P.ds[k] = el.checked ? i + 1 : i; },
  showHidden: el => { S.ui.showHidden = el.checked; },
  pickFeat: el => applyFeatPick(el.dataset.p, el.dataset.v),
  setLineage: el => { S.char.species.choice = el.value; },
  bgSkill: el => { const b = S.char.background; const a = b.skills ||= []; const v = el.dataset.v; const i = a.indexOf(v); if (i >= 0) a.splice(i, 1); else if (a.length < 2) a.push(v); },
  bgFeatSwap: el => { const b = S.char.background; b.swapFeat = el.checked; b.featOverride = ""; S.char.bgFeat = { picks: {} }; },
  setBgFeat: el => { S.char.background.featOverride = el.value; S.char.bgFeat = { picks: {} }; },
  featFilter: el => { S.ui.featFilter = el.value; },
  seOpt: el => {
    const c = S.char, D = derive(c), w = el.dataset.w, k = el.value;
    const list = !k ? [] : w === "class" ? (START_EQUIP.class[D.startCls] || {})[k] : k === "B" ? [START_EQUIP.backgroundGold + " GP"] : START_EQUIP.background[c.background.id];
    applyStartEquip(c, list, w); (c.startEquip ||= {})[w] = k;
    toast(k ? "Equipment option " + k + " added" : "Starting equipment removed");
  },
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
  if (el.dataset.actInput === "cropZoom" && S.modal?.type === "crop") { S.modal.z = +el.value; cropApply(); }
  if (el.dataset.actInput === "spq") { S.ui.spq = el.value; const D = derive(S.char); $("#splist").innerHTML = spellList(S.char, D, S.ui.spTab, D.casters.find(x => x.cls === S.ui.spTab)); }
});
$("#modal").addEventListener("mousedown", e => { if (e.target.id === "modal" && S.modal?.type !== "levelup") { closeModal(); render(); } });

// ---------- init ----------
(async function init() {
  let t = "dark"; try { t = localStorage.getItem("theme") || "dark"; } catch (e) { }   // dark is the default
  document.documentElement.dataset.theme = t;
  S.settings = (await DB.get("settings")) || {};
  const w = await DB.get("wiki"); if (w) { S.wiki = w; } buildIndex();
  S.server = await detectServer();
  if (S.server) {
    // laptop with run.py: pick up wiki.json + old characters folder
    try { const sw = await (await fetch("api/wiki", { cache: "no-store" })).json(); const n = Object.keys(sw.pages || {}).length; if (n && (!w || n !== Object.keys(w.pages || {}).length || sw.imported !== w.imported)) await storeSetWiki(sw); } catch (e) { }
    try { const st = await (await fetch("api/import", { cache: "no-store" })).json(); if (st.running) { S.ui.import = st; pollImport(); } } catch (e) { }
    await Folder.pull();
  }
  await WikiLock.check();
  await loadChars();
  Sync.loadToken();
  render(); renderSyncChip();
  if (!S.viewer) { checkDmLoot(); checkJoin(); }
  if (Sync.enabled()) Sync.run();
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    // reload once when a new version of the app takes over, so the phone never keeps running old code
    let reloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => { if (!reloaded) { reloaded = true; location.reload(); } });
    navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then(reg => { S.swReg = reg; reg.update().catch(() => { }); }).catch(() => { });
  }
})();
