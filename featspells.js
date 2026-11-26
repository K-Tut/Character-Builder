"use strict";
/* ============ Spells that come with feats (Magic Initiate, Fey Touched, Shadow Touched …) ============
   fixed: spells the feat always gives · slots: spells you choose in the feat itself
   free: castable once per Long Rest without a slot. Chosen spells are stored in feat.picks.spells[slot.key]. */
const FEAT_SPELLS = {
  "Magic Initiate": { slots: [{ key: "c1", lvl: 0, list: "$list", label: "Cantrip" }, { key: "c2", lvl: 0, list: "$list", label: "Cantrip" }, { key: "s1", lvl: 1, list: "$list", label: "Level 1 spell", free: true }] },
  "Fey Touched": { fixed: ["Misty Step"], freeFixed: true, slots: [{ key: "s1", lvl: 1, schools: ["Divination", "Enchantment"], label: "Level 1 Divination or Enchantment spell", free: true }] },
  "Shadow Touched": { fixed: ["Invisibility"], freeFixed: true, slots: [{ key: "s1", lvl: 1, schools: ["Illusion", "Necromancy"], label: "Level 1 Illusion or Necromancy spell", free: true }] },
  "Telepathic": { fixed: ["Detect Thoughts"], freeFixed: true },
  "Telekinetic": { fixed: ["Mage Hand"] },
  "Ritual Caster": { slots: D => Array.from({ length: Math.max(1, D.pb) }, (_, i) => ({ key: "r" + i, lvl: 1, ritual: true, label: "Level 1 Ritual spell" })) },
  "Artificer Initiate": { slots: [{ key: "c1", lvl: 0, list: "artificer", label: "Artificer cantrip" }, { key: "s1", lvl: 1, list: "artificer", label: "Level 1 Artificer spell", free: true }] }
};
function featSpellSlots(spec, D) { return typeof spec.slots === "function" ? spec.slots(D) : (spec.slots || []); }
function featSpellList(f, path) {
  const l = f?.picks?.list || (path === "bgFeat" ? ((bgData(target())?.feat || "").match(/\((.*)\)/) || [])[1] : "");
  return l ? l.toLowerCase() : "";
}
// spells a slot may take
function featSpellOptions(slot, list) {
  const L = slot.list === "$list" ? list : slot.list;
  return (S.idx.spellList || []).filter(s => s.level === slot.lvl && (!L || (s.classes || []).includes(L)) && (!slot.schools || slot.schools.includes(s.school)) && (!slot.ritual || s.ritual));
}
// what derive() adds: always-prepared spells and free casts
function featSpellsFor(f, D) {
  const spec = FEAT_SPELLS[f.name]; if (!spec) return [];
  const out = (spec.fixed || []).map(n => ({ name: n, free: !!spec.freeFixed }));
  const ch = f.picks?.spells || {};
  featSpellSlots(spec, D).forEach(sl => { if (ch[sl.key]) out.push({ name: ch[sl.key], free: !!sl.free }); });
  return out;
}
// the picker inside a feat (Build → Background / Level-up / Extra feats …)
function featSpellUI(path, f, D) {
  const spec = FEAT_SPELLS[f?.name]; if (!spec) return "";
  const list = featSpellList(f, path), ch = f.picks?.spells || {}, open = S.ui.fsOpen;
  const needList = featSpellSlots(spec, D).some(s => s.list === "$list");
  let h = `<div class="featspells"><b class="small">Spells from this feat</b>`;
  if (spec.fixed) h += `<div class="small" style="margin:4px 0">Always prepared: ${spec.fixed.map(n => `<span class="chip">${esc(n)}</span>`).join("")}${spec.freeFixed ? ' <span class="muted">· free cast 1× per Long Rest</span>' : ""}</div>`;
  if (needList && !list) return h + `<p class="small muted">Choose the spell list above first.</p></div>`;
  featSpellSlots(spec, D).forEach(sl => {
    const id = path + "|" + sl.key, v = ch[sl.key] || "", isOpen = open === id;
    const lbl = sl.label + (sl.list === "$list" ? ` (${cap(list)})` : "");
    h += `<div class="fsrow"><span class="small">${esc(lbl)}${sl.free ? ' <span class="muted">· free 1×/Long Rest</span>' : ""}</span>
      <button class="small ${v ? "" : "ghost"}" data-act="fsOpen" data-k="${esc(id)}">${v ? "✓ " + esc(v) : "choose…"} ${isOpen ? "▴" : "▾"}</button></div>`;
    if (isOpen) {
      const opts = featSpellOptions(sl, list), taken = new Set(Object.entries(ch).filter(([k]) => k !== sl.key).map(([, x]) => x));
      h += `<div class="fslist">` + (opts.length ? opts.filter(s => !taken.has(s.name)).map(s => { const dk = "fsd|" + s.name, d = S.ui.fsDesc === dk;
        return `<div class="fsopt ${s.name === v ? "on" : ""}"><label><input type="radio" name="fs_${esc(id)}" data-act="featSpell" data-p="${esc(path)}" data-k="${sl.key}" value="${esc(s.name)}" ${s.name === v ? "checked" : ""}> <b>${esc(s.name)}</b> <span class="small muted">${esc(s.school || "")}${s.ritual ? " · Ritual" : ""}${s.conc ? " · Conc." : ""}</span></label>
          <a href="#" class="small" data-act="fsDesc" data-k="${esc(dk)}">${d ? "▾ hide" : "▸ details"}</a>${d ? `<div class="desc small">${esc([s.time, s.range, s.dur].filter(Boolean).join(" · "))}${para(s.text)}</div>` : ""}</div>`; }).join("")
        : `<p class="small muted">No spell data imported — type the name:</p><input data-act="featSpellTxt" data-p="${esc(path)}" data-k="${sl.key}" value="${esc(v)}" placeholder="Spell name">`) + `</div>`;
    }
  });
  return h + `</div>`;
}
const FS_ACT = {
  fsOpen: el => { S.ui.fsOpen = S.ui.fsOpen === el.dataset.k ? null : el.dataset.k; S.modal ? renderModal() : render(); },
  fsDesc: el => { S.ui.fsDesc = S.ui.fsDesc === el.dataset.k ? null : el.dataset.k; S.modal ? renderModal() : render(); }
};
const FS_CHG = {
  featSpell: el => { setPath(target(), el.dataset.p + ".picks.spells." + el.dataset.k, el.value); S.ui.fsOpen = null; },
  featSpellTxt: el => { setPath(target(), el.dataset.p + ".picks.spells." + el.dataset.k, el.value.trim()); }
};
