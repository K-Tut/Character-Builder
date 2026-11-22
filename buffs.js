"use strict";
/* ============ SPELL EFFECTS: cast a spell on yourself or a companion and see it on the sheet ============
   c.play.buffs = [{ id, spell, target: "self" | companion key, mode, lvl, at }]
   BUFFS describes what each spell changes. min = duration in minutes (for the label and rests), conc = Concentration.
   fx: ac (+n), acMin (AC at least), mageArmor, speed (+ft), speedMul, hpMax(L) (+max HP), temp(L, D) (temp HP once),
       hit (+to weapon attacks), dmg {n, s, type, sign} (weapon damage dice), attackDie / saveDie / checkDie (d4 added to those d20 rolls),
       cond (a condition while it lasts), note (shown in the banner).
*/
const BUFFS = {
  "Shield of Faith": { min: 10, conc: true, fx: { ac: 2 }, note: "+2 AC" },
  "Divine Favor": { min: 1, fx: { dmg: { n: 1, s: 4, type: "radiant" } }, note: "weapon hits deal +1d4 Radiant" },
  "Enlarge/Reduce": { min: 1, conc: true, modes: {
    Enlarge: { fx: { dmg: { n: 1, s: 4, type: "", sign: 1 } }, note: "one size larger · Advantage on Strength checks and saves · weapon hits +1d4" },
    Reduce: { fx: { dmg: { n: 1, s: 4, type: "", sign: -1 } }, note: "one size smaller · Disadvantage on Strength checks and saves · weapon hits −1d4" } } },
  "Bless": { min: 1, conc: true, fx: { attackDie: 4, saveDie: 4 }, note: "+1d4 to attack rolls and saving throws" },
  "Bane": { min: 1, conc: true, fx: { attackDie: -4, saveDie: -4 }, note: "−1d4 to attack rolls and saving throws" },
  "Guidance": { min: 1, conc: true, fx: { checkDie: 4 }, note: "+1d4 to ability checks (the chosen skill)" },
  "Haste": { min: 1, conc: true, fx: { ac: 2, speedMul: 2 }, note: "+2 AC · Speed doubled · Advantage on Dexterity saves · one extra action each turn. When it ends: Incapacitated until the end of the next turn" },
  "Mage Armor": { min: 480, fx: { mageArmor: true }, note: "base AC 13 + Dex while not wearing armor" },
  "Barkskin": { min: 60, fx: { acMin: 17 }, note: "AC can't be lower than 17" },
  "Longstrider": { min: 60, fx: { speed: 10 }, note: "+10 ft Speed" },
  "Aid": { min: 480, fx: { hpMax: L => 5 * Math.max(1, L - 1) }, note: "Hit Point maximum and current HP increased" },
  "Heroism": { min: 1, conc: true, note: "immune to Frightened · Temporary HP equal to the caster's spellcasting modifier at the start of each turn" },
  "Stoneskin": { min: 60, conc: true, note: "Resistance to Bludgeoning, Piercing and Slashing damage" },
  "Fly": { min: 10, conc: true, note: "Fly Speed 60 ft" },
  "Invisibility": { min: 60, conc: true, fx: { cond: "Invisible" }, note: "Invisible until it attacks, deals damage or casts a spell" },
  "Greater Invisibility": { min: 1, conc: true, fx: { cond: "Invisible" }, note: "Invisible" },
  "Blur": { min: 1, conc: true, note: "attackers have Disadvantage (unless they don't rely on sight)" },
  "Mirror Image": { min: 1, note: "three illusory duplicates" },
  "Shield": { min: 0, label: "until the start of your next turn", fx: { ac: 5 }, note: "+5 AC, no damage from Magic Missile" },
  "Magic Weapon": { min: 60, fx: { hit: L => L >= 6 ? 3 : L >= 4 ? 2 : 1, dmgFlat: L => L >= 6 ? 3 : L >= 4 ? 2 : 1 }, note: "the weapon is magical: bonus to attack and damage rolls" },
  "Elemental Weapon": { min: 60, conc: true, modes: { Acid: {}, Cold: {}, Fire: {}, Lightning: {}, Thunder: {} }, fx: { hit: L => L >= 7 ? 3 : L >= 5 ? 2 : 1, dmg: { n: 1, s: 4, type: "mode" } }, note: "the weapon deals extra elemental damage" },
  "Crusader's Mantle": { min: 1, conc: true, fx: { dmg: { n: 1, s: 4, type: "radiant" } }, note: "weapon hits +1d4 Radiant (you and allies in 30 ft)" },
  "Spirit Shroud": { min: 1, conc: true, modes: { Radiant: {}, Necrotic: {}, Cold: {} }, fx: { dmg: { n: 1, s: 8, type: "mode", any: true } }, note: "hits within 10 ft +1d8 · targets can't regain HP" },
  "Protection from Evil and Good": { min: 10, conc: true, note: "Aberrations, Celestials, Elementals, Fey, Fiends and Undead have Disadvantage on attacks against the target" },
  "Death Ward": { min: 480, note: "the first time it would drop to 0 HP, it drops to 1 HP instead" },
  "Freedom of Movement": { min: 60, note: "not slowed by Difficult Terrain; can't be Paralyzed or Restrained by magic" },
  "Armor of Agathys": { min: 60, fx: { temp: L => 5 * L }, note: "Temporary HP; a creature that hits it in melee takes Cold damage" },
  "False Life": { min: 0, label: "instant", fx: { temp: L => 2 * 4 + 4 + 5 * (L - 1) }, note: "Temporary HP (average shown — roll 2d4 + 4)" },
  "Resistance": { min: 1, conc: true, note: "when it takes damage of the chosen type, reduce it by 1d4" },
  "Jump": { min: 1, note: "jump distance up to 30 ft" },
  "See Invisibility": { min: 60, note: "sees invisible creatures and objects" },
  "Darkvision": { min: 480, note: "Darkvision 150 ft" },
  "Water Breathing": { min: 1440, note: "breathes underwater" },
  "Pass without Trace": { min: 60, conc: true, note: "+10 to Dexterity (Stealth) checks" },
  "Protection from Energy": { min: 60, conc: true, modes: { Acid: {}, Cold: {}, Fire: {}, Lightning: {}, Thunder: {} }, note: "Resistance to the chosen damage type" }
};
const buffInfo = name => BUFFS[name] || BUFFS[Object.keys(BUFFS).find(k => norm(k) === norm(name))];
function buffFx(b) { const B = buffInfo(b.spell); if (!B) return {}; const m = B.modes?.[b.mode] || {}; return { ...(B.fx || {}), ...(m.fx || {}) }; }
function buffNote(b) { const B = buffInfo(b.spell); return (B?.modes?.[b.mode]?.note) || B?.note || ""; }
function buffDur(B) { if (B.label) return B.label; const m = B.min; return m >= 1440 ? m / 1440 + " day" + (m > 1440 ? "s" : "") : m >= 60 ? m / 60 + " hour" + (m > 60 ? "s" : "") : m + " minute" + (m > 1 ? "s" : ""); }
const buffsOn = (c, target) => (c.play?.buffs || []).filter(b => b.target === target && buffInfo(b.spell));

// changes on the character (called at the end of derive)
function applyBuffsSelf(c, D) {
  D.buffed = {}; const mark = (k, n) => (D.buffed[k] ||= []).push(n);
  for (const b of buffsOn(c, "self")) {
    const f = buffFx(b), L = b.lvl || 1;
    if (f.mageArmor && D.armor?.kind === "none") { const v = 13 + D.mod.dex + (c.shield ? 2 : 0); if (v > D.ac) { D.ac = v; mark("ac", b.spell); } }
    if (f.ac) { D.ac += f.ac; mark("ac", b.spell); }
    if (f.acMin && D.ac < f.acMin) { D.ac = f.acMin; mark("ac", b.spell); }
    if (f.speed) { D.speed += f.speed; mark("speed", b.spell); }
    if (f.speedMul) { D.speed *= f.speedMul; mark("speed", b.spell); }
    if (f.hpMax) { D.hpMax += f.hpMax(L); mark("hp", b.spell); }
    if (f.hit) { const h = typeof f.hit === "function" ? f.hit(L) : f.hit; D.attacks.forEach(a => { a.hit += h; a.buffHit = (a.buffHit || []).concat(b.spell); }); mark("hit", b.spell); }
    if (f.dmg || f.dmgFlat) mark("dmg", b.spell);
  }
}
// changes on a companion's stat block
function applyBuffsComp(c, key, s) {
  const out = { ...s, buffed: {} }, mark = (k, n) => (out.buffed[k] ||= []).push(n);
  for (const b of buffsOn(c, key)) {
    const f = buffFx(b), L = b.lvl || 1;
    if (f.mageArmor) { const v = 13 + Math.floor(((+s.ab?.dex || 10) - 10) / 2); if (v > out.ac) { out.ac = v; mark("ac", b.spell); } }
    if (f.ac) { out.ac = (+out.ac || 10) + f.ac; mark("ac", b.spell); }
    if (f.acMin && out.ac < f.acMin) { out.ac = f.acMin; mark("ac", b.spell); }
    if (f.speed || f.speedMul) { out.speed = (out.speed || "") + " (" + (f.speed ? "+" + f.speed + " ft" : "×" + f.speedMul) + ")"; mark("speed", b.spell); }
    if (f.hpMax) { out.hpMax = (+out.hpMax || 1) + f.hpMax(L); mark("hp", b.spell); }
    if (f.hit || f.dmg || f.dmgFlat) {
      out.actions = (out.actions || []).map(a => { const h = f.hit ? (typeof f.hit === "function" ? f.hit(L) : f.hit) : 0, fl = f.dmgFlat ? f.dmgFlat(L) : 0, d = f.dmg;
        const parts = (a.parts || []).slice(); if (fl) parts[0] = { ...parts[0], f: parts[0].f + "+" + fl };
        if (d) parts.push({ f: (d.sign < 0 ? "-" : "") + d.n + "d" + d.s, type: d.type === "mode" ? norm(b.mode) : d.type || parts[0]?.type || "" });
        return { ...a, hit: (+a.hit || 0) + h, parts, buffed: (a.buffed || []).concat(b.spell) }; });
      mark("hit", b.spell);
    }
  }
  return out;
}
// damage riders from your own active spells (added to weapon damage rolls, pre-selected)
function buffRiders(c, D, a, out) {
  for (const b of buffsOn(c, "self")) {
    const f = buffFx(b), d = f.dmg; if (!d && !f.dmgFlat) continue;
    if (a.kind !== "weapon" && !d?.any) continue;
    const ex = out.find(r => norm(r.name) === norm(b.spell)); if (ex) { ex.auto = true; ex.spell = false; continue; }
    if (d) out.push({ name: b.spell, n: d.n, s: d.s, sign: d.sign || 1, type: d.type === "mode" ? norm(b.mode) : d.type || a.dtype || "", note: "active spell", auto: true });
    if (f.dmgFlat) out.push({ name: b.spell + " (bonus)", flat: f.dmgFlat(b.lvl || 1), type: a.dtype || "", auto: true });
  }
}
// d4s on d20 rolls: Bless / Bane (attacks, saves), Guidance (checks). Companion rolls start with "Name: ".
function buffD20(c, title) {
  const t = String(title || ""), comp = (typeof companionList === "function" ? companionList(c, derive(c)) : []).find(x => t.startsWith(x.name + ": "));
  const target = comp ? comp.key : "self", out = [];
  const isSave = / save$/i.test(t), isCheck = / check$/i.test(t) && !isSave, isAtk = !isSave && !isCheck && !/initiative|damage/i.test(t);
  for (const b of buffsOn(c, target)) { const f = buffFx(b);
    if (isAtk && f.attackDie) out.push({ n: 1, s: Math.abs(f.attackDie), sign: Math.sign(f.attackDie), label: b.spell });
    if (isSave && f.saveDie) out.push({ n: 1, s: Math.abs(f.saveDie), sign: Math.sign(f.saveDie), label: b.spell });
    if (isCheck && f.checkDie) out.push({ n: 1, s: f.checkDie, sign: 1, label: b.spell }); }
  return out;
}
// banner under the name / picture
function buffBanner(c, target) {
  const list = buffsOn(c, target); if (!list.length) return "";
  return `<div class="buffbar">${list.map(b => { const B = buffInfo(b.spell);
    return `<div class="buff"><span class="bicon">✨</span><div class="grow"><b>${esc(b.spell)}${b.mode ? " (" + esc(b.mode) + ")" : ""}</b>${b.lvl > 1 ? ` <span class="small muted">level ${b.lvl}</span>` : ""}
      <div class="small">${esc(buffNote(b))}</div><div class="small muted">lasts ${esc(buffDur(B))}${B.conc ? " · Concentration" : ""}${b.at ? " · cast " + new Date(b.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</div></div>
      <button class="small ghost" data-act="buffEnd" data-id="${b.id}" title="End the spell">✕ End</button></div>`; }).join("")}</div>`;
}
const glowIf = (arr) => arr && arr.length ? ` buffed" title="${esc(arr.join(", "))}` : "";

// ---------- casting ----------
function mCast() {
  const M = S.modal, c = S.char, D = derive(c), B = buffInfo(M.spell), si = spellInfo(M.spell), base = si?.level ?? M.level ?? 1, P = c.play;
  const comps = typeof companionList === "function" ? companionList(c, D) : [];
  const opts = [];
  if (base > 0) {
    const fr = D.freeCast?.[norm(M.spell)], res = fr && D.allResources?.find(r => r.key === fr); if (res) { const left = res.max - (P.used[fr] || 0); opts.push([`res:${fr}`, `free cast (${left} left)`, left > 0]); }
    D.slots.forEach((n, j) => { const L = j + 1; if (L < base) return; const left = n - (P.slots[L] || 0); opts.push([`slot:${L}`, `level ${L} slot (${left} left)`, left > 0]); });
    if (D.pact && D.pact.lvl >= base) { const left = D.pact.n - (+P.pact || 0); opts.push(["pact", `pact slot, level ${D.pact.lvl} (${left} left)`, left > 0]); }
    if (D.spellPoints) { const left = D.spellPoints.max - (+P.used.spellpoints || 0); for (let L = base; L <= D.spellPoints.maxLvl; L++) opts.push([`pts:${L}`, `level ${L} — ${SPELL_POINT_COST[L]} spell points (${left} left)`, left >= SPELL_POINT_COST[L] && !(L >= 6 && P.used["splvl" + L])]); }
    opts.push(["none", "don't use a slot (already paid / item)", true]);
  }
  const first = opts.find(o => o[2]);
  return `<h2>✨ Cast ${esc(M.spell)}</h2><p class="small muted">${esc(B.note || "")} · lasts ${esc(buffDur(B))}${B.conc ? " · Concentration" : ""}</p>
    <p style="margin:10px 0 4px"><b>On whom?</b></p><div class="row">
      <label class="eqopt ${M.target === "self" ? "on" : ""}"><input type="radio" name="ct" data-act="castTarget" value="self" ${M.target === "self" ? "checked" : ""}> ${esc(c.name)} (yourself)</label>
      ${comps.map(x => `<label class="eqopt ${M.target === x.key ? "on" : ""}"><input type="radio" name="ct" data-act="castTarget" value="${esc(x.key)}" ${M.target === x.key ? "checked" : ""}> ${esc(x.name)}</label>`).join("")}</div>
    ${B.modes ? `<p style="margin:10px 0 4px"><b>Option</b></p><select id="cast_mode">${Object.keys(B.modes).map(m => `<option ${m === M.mode ? "selected" : ""}>${esc(m)}</option>`).join("")}</select>` : ""}
    ${opts.length ? `<p style="margin:10px 0 4px"><b>Spell slot</b></p><select id="cast_slot">${opts.map(o => `<option value="${o[0]}" ${o[2] ? "" : "disabled"} ${o === first ? "selected" : ""}>${esc(o[1])}</option>`).join("")}</select>` : ""}
    ${B.conc && (P.buffs || []).some(b => buffInfo(b.spell)?.conc) ? `<p class="small warn" style="margin-top:8px">You are already concentrating on ${esc((P.buffs || []).filter(b => buffInfo(b.spell)?.conc).map(b => b.spell).join(", "))} — casting this ends it.</p>` : ""}
    <div class="foot"><button class="ghost" data-act="modalClose">Cancel</button><button data-act="castGo">✨ Cast</button></div>`;
}
const BUFF_ACT = {
  castOpen: (el, e) => { e?.stopPropagation(); openModal({ type: "cast", spell: el.dataset.n, level: +el.dataset.l || 1, target: el.dataset.t || "self", mode: "" }); },
  castGo: () => {
    const c = S.char, D = derive(c), M = S.modal, P = c.play, B = buffInfo(M.spell), si = spellInfo(M.spell), base = si?.level ?? M.level ?? 1;
    const v = document.getElementById("cast_slot")?.value || "none"; let lvl = base;
    if (v.startsWith("slot:")) { lvl = +v.slice(5); P.slots[lvl] = (P.slots[lvl] || 0) + 1; }
    else if (v === "pact") { lvl = D.pact.lvl; P.pact = (+P.pact || 0) + 1; }
    else if (v.startsWith("pts:")) { lvl = +v.slice(4); P.used.spellpoints = (+P.used.spellpoints || 0) + SPELL_POINT_COST[lvl]; if (lvl >= 6) P.used["splvl" + lvl] = 1; }
    else if (v.startsWith("res:")) { const k = v.slice(4); P.used[k] = (P.used[k] || 0) + 1; }
    const mode = document.getElementById("cast_mode")?.value || "";
    P.buffs ||= [];
    if (B.conc) { const ended = P.buffs.filter(b => buffInfo(b.spell)?.conc).map(b => b.spell); P.buffs = P.buffs.filter(b => !buffInfo(b.spell)?.conc); if (ended.length) toast("Concentration on " + ended.join(", ") + " ended");
      if (!P.conditions.includes("Concentrating")) P.conditions.push("Concentrating"); }
    P.buffs = P.buffs.filter(b => !(b.spell === M.spell && b.target === M.target));
    const fx = { ...(B.fx || {}), ...(B.modes?.[mode]?.fx || {}) };
    if (B.min > 0 || B.label !== "instant") P.buffs.push({ id: Date.now().toString(36), spell: M.spell, target: M.target, mode, lvl, at: Date.now() });
    // one-off effects on hit points
    const st = M.target === "self" ? null : companionList(c, D).find(x => x.key === M.target)?.st;
    if (fx.hpMax) { const n = fx.hpMax(lvl); if (st) { if (st.hp !== undefined) st.hp += n; } else if (P.hp !== null && P.hp !== undefined) P.hp += n; }
    if (fx.temp) { const n = fx.temp(lvl); if (st) st.temp = Math.max(+st.temp || 0, n); else P.temp = Math.max(+P.temp || 0, n); }
    if (fx.cond) { const arr = st ? (st.cond ||= []) : P.conditions; if (!arr.includes(fx.cond)) arr.push(fx.cond); }
    closeModal(); save(); render(); toast(`${M.spell} cast on ${M.target === "self" ? "yourself" : companionList(c, D).find(x => x.key === M.target)?.name || "companion"}`);
  },
  buffEnd: el => { const c = S.char, P = c.play, b = (P.buffs || []).find(x => x.id === el.dataset.id); if (!b) return;
    P.buffs = P.buffs.filter(x => x !== b); const B = buffInfo(b.spell), fx = buffFx(b);
    if (B?.conc && !P.buffs.some(x => buffInfo(x.spell)?.conc)) P.conditions = P.conditions.filter(x => x !== "Concentrating");
    if (fx.cond) { if (b.target === "self") P.conditions = P.conditions.filter(x => x !== fx.cond); else { const st = c.comps?.[b.target] || (c.ownComps || []).find(o => "own:" + o.id === b.target); if (st?.cond) st.cond = st.cond.filter(x => x !== fx.cond); } }
    if (fx.hpMax && b.target === "self") { const D = derive(c); P.hp = Math.min(P.hp ?? D.hpMax, D.hpMax); }
    save(); render(); toast(b.spell + " ended"); }
};
const BUFF_CHG = { castTarget: el => { S.modal.target = el.value; } };
// rests: a long rest ends everything; a short rest (1 hour) ends spells of 1 hour or less
function restBuffs(c, long) { const P = c.play; if (!P.buffs) return; P.buffs = long ? [] : P.buffs.filter(b => (buffInfo(b.spell)?.min || 0) > 60); if (!P.buffs.some(b => buffInfo(b.spell)?.conc)) P.conditions = (P.conditions || []).filter(x => x !== "Concentrating"); }
