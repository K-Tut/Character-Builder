"use strict";
/* ============ PRINT / PDF VIEW (540 x 780 pt pages, like the original sheets) ============ */

function pTxt(t, short) {
  if (!t) return "";
  let s = t; if (short && s.length > short) s = s.slice(0, short).replace(/\s+\S*$/, "") + " …";
  return s.split("\n").map(l => l.trim()).filter(Boolean).map(l => l.startsWith("• ") ? `<div class="pli">• ${esc(l.slice(2))}</div>` : `<p>${esc(l)}</p>`).join("");
}

function renderPrint() {
  const c = S.char, D = derive(c);
  const o = S.ui.print ||= { spellDesc: "full", page2: true, featDesc: "full" };
  const bar = `<div class="card no-print printbar"><div class="row"><b>Print / Save as PDF</b>
    <label>Feature text ${popSel("featDesc", o.featDesc, [["full", "full"], ["short", "short"]])}</label>
    <label>Spell text ${popSel("spellDesc", o.spellDesc, [["full", "full"], ["short", "short"], ["none", "names only"]])}</label>
    <label><input type="checkbox" data-act="popt" data-k="page2" ${o.page2 ? "checked" : ""}> Backstory & notes page</label>
    <button class="right" data-act="printNow">⎙ Print / Save as PDF</button><button class="ghost" data-act="exportJson">⤓ Export character file</button></div>
    <p class="small muted" style="margin:6px 0 0">In the print dialog choose <b>Save as PDF</b>, set <b>Margins: None</b> and enable <b>Background graphics</b>. Page size is set automatically (7.5 × 10.83 in, like your old sheets).</p></div>`;
  return bar + `<div class="pages">${pPage1(c, D)}${o.page2 ? pPage2(c, D) : ""}${pPowers(c, D, o)}</div>`;
}

function popSel(k, v, opts) { return `<select data-act="popt" data-k="${k}">${opts.map(([a, b]) => `<option value="${a}" ${a === v ? "selected" : ""}>${b}</option>`).join("")}</select>`; }
function pBox(label, inner, cls = "", style = "") { return `<div class="pbox ${cls}" style="${style}"><div class="plabel">${label}</div>${inner}</div>`; }

function pPage1(c, D) {
  const bg = bgData(c);
  const P = c.play;
  const abil = `<table class="ptab"><tr class="phead"><th>Abilities:</th><th>Score:</th><th>Modifier:</th><th>Save</th></tr>${ABILITIES.map(a => `<tr class="pa-${a}"><td>${ABILITY_NAMES[a]}</td><td class="c">${D.score[a]}</td><td class="c b">${sgn(D.mod[a])}</td><td class="c">${sgn(D.save[a])}${D.saveProf.has(a) ? " ●" : ""}</td></tr>`).join("")}</table>`;
  const skills = `<table class="ptab"><tr class="phead"><th>Skills</th><th>Modifier</th></tr>${SKILLS_BY_ABILITY.map(s => { const k = D.skill[s]; return `<tr class="pa-${k.a}"><td><span class="pdot ${k.e ? "e" : k.p ? "p" : ""}"></span>${s}</td><td class="c">${sgn(k.v)}${k.e ? " (E)" : ""}</td></tr>`; }).join("")}</table>
    <div class="psmall">Passive Perception <b>${D.passive.perception}</b> · Insight <b>${D.passive.insight}</b></div>`;
  const items = c.items.filter(i => i.name).map(i => `${esc(i.name)}${+i.qty > 1 ? " ×" + i.qty : ""}${i.note ? ` <span class="pmuted">(${esc(i.note)})</span>` : ""}`).join(", ");
  const coins = ["pp", "gp", "ep", "sp", "cp"].filter(k => +c.coins[k]).map(k => `${c.coins[k]} ${k}`).join(", ");
  const weaponsList = c.weapons.map(w => esc(w.name || w.base)).join(", ");
  const ph = c.phys;
  const hd = D.hitDice.map(x => `${x.n}${x.die}`).join(" + ");
  return `<section class="page p1">
  <div class="p1top">
    <div class="portrait">${c.portrait ? `<img src="${c.portrait}">` : ""}</div>
    <div class="p1head">
      <div class="prow">${pBox("Name", `<div class="pval big">${esc(c.name)}</div>`, "grow2")}${pBox("Class (Subclass)", `<div class="pval">${esc(classLine(D))}</div>`, "grow2")}${pBox("Species", `<div class="pval">${esc((D.species?.name || "") + (c.species.choice ? " (" + c.species.choice + ")" : ""))}</div>`, "grow1")}</div>
      <div class="prow">
        <div class="pbadge"><b>${sgn(D.pb)}</b><span>Proficiency<br>Bonus</span></div>
        ${pBox("Character Level", `<div class="pval big c">${D.level}</div>`, "", "width:62pt")}
        ${pBox("Background", `<div class="pval">${esc(bg?.name || "")}</div>`, "grow1")}
        <div class="pshield"><b>${D.ac}</b><span>Armor<br>Class</span></div>
        <div class="pstat"><b>${sgn(D.init)}</b><span>Initiative</span></div>
        <div class="pstat"><b>${D.speed}</b><span>Speed</span></div>
      </div>
      <div class="prow">
        ${pBox("Hit Points", `<div class="hprow"><div><span class="pmuted">Max</span><b>${D.hpMax}</b></div><div class="hpcur"><span class="pmuted">Current</span></div><div class="hpcur"><span class="pmuted">Temporary</span></div></div>`, "grow2")}
        ${pBox("Hit Dice", `<div class="pval c">${hd}</div><div class="pmuted c" style="font-size:6pt">used: ______</div>`, "", "width:70pt")}
        ${pBox("Death Saves", `<div class="psmall">Success ○ ○ ○</div><div class="psmall">Failure ○ ○ ○</div>`, "", "width:74pt")}
      </div>
    </div>
  </div>
  <div class="p1mid">
    <div class="p1left">${abil}${skills}</div>
    <div class="p1right">
      ${pBox("Proficiencies &amp; Languages", `<div class="ptext"><p><b>Armor:</b> ${esc(D.armorTraining.join(", ") || "None")}</p><p><b>Weapons:</b> ${esc(D.weaponText || "None")}</p><p><b>Tools:</b> ${esc(D.tools.join(", ") || "None")}</p><p><b>Languages:</b> ${esc(D.languages.join(", "))}</p>${c.otherProfs ? `<p>${esc(c.otherProfs)}</p>` : ""}${(c.pools.mastery || []).length ? `<p><b>Weapon Mastery:</b> ${esc((c.pools.mastery || []).slice(0, D.pools.mastery?.max || 0).join(", "))}</p>` : ""}</div>`, "", "min-height:95pt")}
      <div class="prow" style="align-items:stretch">
        ${pBox("Equipment", `<div class="ptext"><p><b>Armor:</b> ${esc(D.armor.name)}${c.shield ? ", Shield (+2 AC)" : ""}</p>${weaponsList ? `<p><b>Weapons:</b> ${weaponsList}</p>` : ""}${items ? `<p>${items}</p>` : ""}${coins ? `<p><b>Coins:</b> ${coins}</p>` : ""}</div>`, "grow2", "min-height:150pt")}
        ${pBox("Physical", `<div class="ptext">${[["Age", ph.age], ["Height", ph.height], ["Weight", ph.weight], ["Eyes", ph.eyes], ["Hair", ph.hair], ["Skin", ph.skin], ["Alignment", ph.alignment]].filter(x => x[1]).map(([k, v]) => `<p>${k}: ${esc(v)}</p>`).join("")}<p>Size: ${esc(D.size)}</p>${D.darkvision ? `<p>Darkvision: ${D.darkvision} ft</p>` : ""}${D.resist.length ? `<p>Resistances: ${esc(D.resist.join(", "))}</p>` : ""}</div>`, "grow1")}
      </div>
      ${pBox("Combat", `<table class="ptab pcombat"><tr class="phead"><th>Weapon</th><th>Properties</th><th>To hit</th><th>Damage</th></tr>${D.attacks.map(a => `<tr><td><b>${esc(a.name)}</b></td><td>${esc(a.props)}</td><td class="c"><b>${sgn(a.hit)}</b><div class="pmuted">${esc(a.formula)}</div></td><td>${esc(a.dmg)}${a.notes ? `<div class="pmuted">${esc(a.notes)}</div>` : ""}</td></tr>`).join("") || `<tr><td colspan="4" class="pmuted">—</td></tr>`}</table>
        ${D.cls.rogue ? `<div class="psmall">Sneak Attack: ${Math.ceil(D.cls.rogue / 2)}d6</div>` : ""}${D.cls.barbarian ? `<div class="psmall">Rage Damage: +${at(step({ 1: 2, 9: 3, 16: 4 }), D.cls.barbarian)}</div>` : ""}`, "", "flex:1")}
    </div>
  </div></section>`;
}

function pPage2(c) {
  return `<section class="page p2">
    ${pBox("Backstory:", `<div class="ptext story">${c.storyImage ? `<img class="storyimg" src="${c.storyImage}">` : ""}${pTxt(c.backstory)}</div>`, "", "height:420pt;overflow:hidden")}
    ${pBox("Notes:", `<div class="ptext notes">${pTxt(c.notes)}</div>`, "lined", "flex:1")}
  </section>`;
}

function pPowers(c, D, o) {
  const feats = D.features.filter(f => !f.hidden);
  const short = o.featDesc === "short" ? 380 : 0;
  const nameLine = f => `<b>${esc(f.name)}</b> <span class="pmuted">(${esc(f.src)})</span>${f.note ? ` — <i>${esc(f.note)}</i>` : ""}`;
  const passive = feats.filter(f => !f.active).map(f => `<tr><td colspan="3">${nameLine(f)}${pTxt(f.text, short)}</td></tr>`).join("");
  const active = feats.filter(f => f.active).map(f => {
    const r = f.res;
    return `<tr><td>${nameLine(f)}${pTxt(f.text, short)}</td><td class="c">${r ? `${r.die ? esc(r.die) + "<br>" : ""}/${r.max}` : ""}</td><td class="c">${r ? (r.reset === "SR" ? "Short<br>Rest" : r.reset === "LR" ? "Long<br>Rest" : "") : ""}</td></tr>`;
  }).join("");
  // resources not attached to a visible feature
  const shownRes = new Set(feats.filter(f => f.res).map(f => f.res.key));
  const extraRes = D.resources.filter(r => !shownRes.has(r.key)).map(r => `<tr><td><b>${esc(r.name)}</b> <span class="pmuted">(${esc(r.src)})</span>${r.note ? " — " + esc(r.note) : ""}</td><td class="c">${r.die ? esc(r.die) + "<br>" : ""}/${r.max}</td><td class="c">${r.reset === "SR" ? "Short<br>Rest" : "Long<br>Rest"}</td></tr>`).join("");

  // spells
  const groups = {};
  const addS = (name, src, always, lvl) => { const si = spellInfo(name); const l = si?.level ?? lvl ?? "?"; (groups[l] ||= []).push({ name, src, always, si }); };
  D.alwaysSpells.forEach(s => addS(s.name, s.src, true));
  c.spells.forEach(s => addS(s.name, s.cls === "other" ? "" : CLASSES[s.cls]?.name, false, s.level));
  let spells = "";
  if (Object.keys(groups).length) {
    const casters = D.casters.map(cs => `${cs.name}: Spell DC <b>${cs.dc}</b> (8+${ABBR[cs.ability]}+Prof) · Spell Attack <b>${sgn(cs.atk)}</b>`)
      .concat(D.speciesCast && D.alwaysSpells.some(s => s.cls === "species") ? [`${esc(D.speciesCast.name)} spells: DC <b>${D.speciesCast.dc}</b> (8+${ABBR[D.speciesCast.ability]}+Prof) · Attack <b>${sgn(D.speciesCast.atk)}</b>`] : []).join(" &nbsp;|&nbsp; ");
    const slots = D.slots.map((n, i) => `L${i + 1}: ${"○".repeat(n)}`).join("&nbsp;&nbsp; ") + (D.pact ? `&nbsp;&nbsp; Pact (L${D.pact.lvl}): ${"○".repeat(D.pact.n)}` : "");
    spells += `<tr class="psec"><td colspan="3">Spells${casters ? `<div class="pcast">${casters}</div>` : ""}${slots ? `<div class="pcast">Slots — ${slots}</div>` : ""}</td></tr>`;
    for (const l of Object.keys(groups).sort((a, b) => (a === "?" ? 99 : a) - (b === "?" ? 99 : b))) {
      spells += `<tr class="psub"><td colspan="3">${l === "?" ? "Other spells" : +l ? "Level " + l + " spells" : "Cantrips <span class='pmuted'>(Spells of lvl 0 which you can cast as an action without using a spellslot)</span>"}</td></tr>`;
      spells += groups[l].sort((a, b) => a.name.localeCompare(b.name)).map(s => {
        const si = s.si;
        const meta = si ? [si.time && "Casting time: " + si.time, si.range && "Range: " + si.range, si.comp && "Components: " + si.comp, si.dur && "Duration: " + si.dur].filter(Boolean).join(", ") : "";
        const txt = o.spellDesc === "none" || !si ? "" : pTxt(si.text, o.spellDesc === "short" ? 320 : 0);
        return `<tr><td><b>${esc(s.name)}</b>${s.src ? ` <span class="pmuted">(${esc(s.src)}${s.always ? ", always prepared" : ""})</span>` : ""}${meta ? `<div class="pmeta">${esc(meta)}</div>` : ""}${txt}</td><td class="c">${l === "?" ? "" : +l ? "L" + l : "∞"}</td><td class="c">${si?.conc ? "Conc." : ""}${si?.ritual ? "<br>Ritual" : ""}</td></tr>`;
      }).join("");
    }
  }
  return `<section class="flow"><table class="powers">
    <thead><tr><th colspan="3" class="ptitle">Powers <span class="pmuted">— ${esc(c.name)}</span></th></tr></thead>
    <tbody>
      ${passive ? `<tr class="psec"><td colspan="3">PASSIVE</td></tr>${passive}` : ""}
      ${active || extraRes ? `<tr class="psec"><td>ACTIVE</td><td class="c">Usages</td><td class="c">Reset on</td></tr>${active}${extraRes}` : ""}
      ${spells}
    </tbody></table></section>`;
}

