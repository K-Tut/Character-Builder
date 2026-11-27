"use strict";
/* ============ Proficiencies a feat gives (any feat, also from other books) ============
   Stored in feat.picks.gen = { skills, expertise, tools, saves, lr }. lr = may be changed on a Long Rest → shown in the Long Rest window. */
const GEN_KINDS = [["skills", "Skill proficiency", () => ALL_SKILLS], ["expertise", "Expertise", () => ALL_SKILLS], ["tools", "Tool / instrument", () => TOOLS.concat(["Bagpipes", "Drum", "Dulcimer", "Flute", "Horn", "Lute", "Lyre", "Pan Flute", "Shawm", "Viol"])], ["saves", "Saving throw", () => ABILITIES]];
function genLabel(k, v) { return k === "saves" ? ABILITY_NAMES[v] || v : v; }
// the editor; compact = only the chips + adders (Long Rest window)
function featProfUI(path, f, D, compact) {
  if (!f?.name || path === "__bg") return "";
  const g = f.picks?.gen || {}, any = GEN_KINDS.some(([k]) => (g[k] || []).length);
  const id = "gp|" + path, open = compact || any || S.ui.genOpen === id;
  const known = FEATS[f.name]?.picks?.length || (typeof FEAT_SPELLS !== "undefined" && FEAT_SPELLS[f.name]);
  if (!open) return `<div class="small" style="margin-top:6px"><a href="#" data-act="genOpen" data-k="${esc(id)}">＋ This feat gives a proficiency, Expertise or saving throw${known ? " (beyond the choices above)" : ""}</a></div>`;
  let h = `<div class="featgen">${compact ? "" : `<b class="small">Proficiencies from this feat</b> <span class="small muted">— they count everywhere on the sheet</span>`}`;
  for (const [k, label, opts] of GEN_KINDS) {
    const cur = g[k] || [];
    h += `<div class="row genrow"><span class="small genlbl">${label}:</span>${cur.map((v, i) => `<span class="chip acc">${esc(genLabel(k, v))} <a href="#" data-act="genDel" data-p="${esc(path)}" data-k="${k}" data-i="${i}">✕</a></span>`).join("")}
      <select data-act="genAdd" data-p="${esc(path)}" data-k="${k}" class="gensel"><option value="">＋ add…</option>${opts().filter(o => !cur.includes(o)).map(o => `<option value="${esc(o)}">${esc(genLabel(k, o))}</option>`).join("")}</select></div>`;
  }
  if (!compact) h += `<label class="small" style="display:block;margin-top:6px"><input type="checkbox" data-act="genLr" data-p="${esc(path)}" ${g.lr ? "checked" : ""}> I can change these when I finish a Long Rest (then they're offered in the 🌙 Long Rest window)</label>`;
  return h + `</div>`;
}
function genGet(path) { const t = target(); let o = t; for (const k of path.split(".")) { if (o == null) return null; o = o[k]; } return o; }
function genObj(path) { const f = genGet(path); if (!f) return null; f.picks ||= {}; return (f.picks.gen ||= {}); }
// feats whose proficiencies change on a Long Rest
function lrPicks(f) { return (FEATS[f.name]?.picks || []).filter(p => p.lr); }
function lrFeats(D) { return (D.feats || []).filter(f => f.path && (f.picks?.gen?.lr || lrPicks(f).length)); }
function lrFeatUI(D) {
  const list = lrFeats(D); if (!list.length) return "";
  return `<div class="card" style="margin:10px 0"><h3 style="margin-top:0">Feat proficiencies for the next day</h3>` + list.map(f => `<div style="margin:6px 0 12px"><b>${esc(f.name)}</b> <span class="small muted">(${esc(f.src)})</span>
    ${S.ui.featInfo === "lr" + f.path ? `<div class="desc small">${para(featDesc(f.name)) || '<span class="muted">No description imported.</span>'}</div>` : ""}
    <a href="#" class="small" data-act="featInfoTog" data-id="lr${esc(f.path)}" data-v="${esc(f.name)}">${S.ui.featInfo === "lr" + f.path ? "▾ hide feat text" : "▸ what does this feat say?"}</a>
    ${lrPicks(f).map(p => `<div class="row" style="margin-top:6px"><label class="small">${esc(p.label)}: ${sel(f.path + ".picks." + p.key, f.picks?.[p.key] || "", pickOpts(p.opts, D).map(o => [o, ABILITY_NAMES[o] || o]), { blank: "— choose —" })}</label></div>`).join("")}
    ${f.picks?.gen?.lr ? featProfUI(f.path, f, D, true) : ""}</div>`).join("") + `</div>`;
}
const GEN_ACT = {
  genOpen: el => { S.ui.genOpen = el.dataset.k; S.modal ? renderModal() : render(); },
  genDel: el => { const g = genObj(el.dataset.p); if (!g) return; (g[el.dataset.k] || []).splice(+el.dataset.i, 1); if (!S.draft) save(); S.modal ? renderModal() : render(); }
};
const GEN_CHG = {
  genAdd: el => { if (!el.value) return; const g = genObj(el.dataset.p); if (!g) return; const a = g[el.dataset.k] ||= []; if (!a.includes(el.value)) a.push(el.value); },
  genLr: el => { const g = genObj(el.dataset.p); if (g) g.lr = el.checked; }
};
