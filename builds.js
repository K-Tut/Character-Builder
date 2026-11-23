"use strict";
/* ============ Alternative build (max. 2 builds per character) ============
   The character keeps one active build in its normal fields; the other one waits in c.alt = {name, data}.
   Switching swaps the build fields. Name, picture, story, notes, items and coins are shared by both builds. */
const BUILD_KEYS = ["species", "speciesFeat", "background", "bgFeat", "abilMethod", "base", "levels", "subclasses", "pools", "spells", "skillAbil", "optChoices",
  "languages", "langExtra", "otherProfs", "armor", "shield", "armorSrc", "shieldSrc", "acBonus", "initBonus", "speedBonus", "hpBonus", "hitBonus", "weapons",
  "custom", "featureMeta", "featRes", "resMax", "freeCasts", "extraFeats", "spellPoints", "comps", "ownComps", "spellAttacks", "homebrewSpells", "resist",
  "resistFrom", "fightingStyleExtra", "bonusFeats", "startGold", "startEquip", "play"];
function buildPick(c) { const o = {}; BUILD_KEYS.forEach(k => { if (k in c) o[k] = JSON.parse(JSON.stringify(c[k])); }); return o; }
function buildNames(c) { return [c.buildName || "Build A", c.alt?.name || "Build B"]; }
function altCreate(c) {
  const data = buildPick(c);
  data.play = { hp: null, temp: 0, used: {}, slots: {}, pact: 0, hd: {}, ds: { s: 0, f: 0 }, exhaustion: 0, inspiration: false, conditions: [] };
  c.buildName = c.buildName || "Build A"; c.alt = { name: "Build B", data };
}
function altSwap(c) {
  if (!c.alt) return;
  const mine = buildPick(c), other = c.alt.data || {};
  BUILD_KEYS.forEach(k => { if (k in other) c[k] = other[k]; else delete c[k]; });
  const nm = c.buildName || "Build A";
  c.buildName = c.alt.name || "Build B"; c.alt = { name: nm, data: mine };
}
// two buttons [Build A][Build B]; the active one is highlighted
function buildSwitch(c, big) {
  if (!c.alt) return "";
  const [a, b] = buildNames(c);
  return `<div class="buildsw ${big ? "big" : ""}"><button class="on" title="Active build">${esc(a)}</button><button class="ghost" data-act="buildSwap" title="Switch to this build">⇄ ${esc(b)}</button></div>`;
}
function bBuildsCard(c) {
  if (!c.alt) return `<div class="card"><h3>Builds</h3><p class="small muted">Try a second version of this character — e.g. another subclass, multiclass or feat path. Name, picture, story, notes, items and coins stay shared; everything you build (species, background, abilities, levels, spells, equipment setup) and the play state are separate.</p>
    <button data-act="buildAdd">＋ Add an alternative build to this character</button></div>`;
  const [a, b] = buildNames(c);
  return `<div class="card"><h3>Builds</h3><p class="small muted">You are editing <b>${esc(a)}</b>. Switch here or on the play sheet by tapping the portrait.</p>
    ${buildSwitch(c, true)}
    <div class="grid g2" style="margin-top:10px"><label>Name of this build<br>${inp("buildName", a, { style: "width:100%" })}</label><label>Name of the other build<br>${inp("alt.name", b, { style: "width:100%" })}</label></div>
    <div class="row" style="margin-top:10px">${S.ui.buildDel ? `<span class="small warn">Delete “${esc(b)}” for good?</span><button class="small" data-act="buildDel" data-ok="1">Yes, delete</button><button class="small ghost" data-act="buildDel">Cancel</button>`
      : `<button class="small ghost" data-act="buildDel">🗑 Delete “${esc(b)}”</button>`}</div></div>`;
}
const BUILD_ACT = {
  buildAdd: () => { altCreate(S.char); save(); render(); toast("Alternative build added — it starts as a copy"); },
  buildSwap: () => { altSwap(S.char); S.ui.buildDel = false; save(); render(); if (S.modal?.type === "image") renderModal(); toast("Now playing: " + (S.char.buildName || "Build A")); },
  buildDel: el => { if (!el.dataset.ok) { S.ui.buildDel = !S.ui.buildDel; return render(); } delete S.char.alt; S.ui.buildDel = false; save(); render(); toast("Alternative build deleted"); }
};
