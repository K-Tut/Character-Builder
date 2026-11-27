"use strict";
/* ============ Feat themes (filter chips when choosing a feat) + feat shortlist ============ */
const FEAT_THEMES = [["spells", "✨ Spells"], ["allies", "🤝 Helps allies"], ["offense", "⚔ Better attacks"], ["defense", "🛡 Defense"], ["healing", "♥ Healing"], ["skills", "🎯 Skills & tools"], ["mobility", "🏃 Movement"], ["utility", "🔧 Utility"]];
const FEAT_TAGS = {
  "Alert": ["utility", "allies"], "Crafter": ["skills", "utility"], "Healer": ["healing", "allies"], "Lucky": ["defense", "utility"], "Magic Initiate": ["spells"],
  "Musician": ["skills", "allies"], "Savage Attacker": ["offense"], "Skilled": ["skills"], "Tavern Brawler": ["offense"], "Tough": ["defense"],
  "Ability Score Improvement": [], "Actor": ["skills"], "Athlete": ["mobility"], "Charger": ["offense", "mobility"], "Chef": ["healing", "allies", "skills"],
  "Crossbow Expert": ["offense"], "Crusher": ["offense", "allies"], "Defensive Duelist": ["defense"], "Dual Wielder": ["offense"], "Durable": ["defense", "healing"],
  "Elemental Adept": ["spells", "offense"], "Fey Touched": ["spells", "mobility"], "Grappler": ["offense"], "Great Weapon Master": ["offense"],
  "Heavily Armored": ["defense"], "Heavy Armor Master": ["defense"], "Inspiring Leader": ["allies", "healing", "defense"], "Keen Mind": ["skills", "utility"],
  "Lightly Armored": ["defense"], "Mage Slayer": ["offense", "defense"], "Martial Weapon Training": ["offense"], "Medium Armor Master": ["defense"],
  "Moderately Armored": ["defense"], "Mounted Combatant": ["offense", "defense"], "Observant": ["skills", "utility"], "Piercer": ["offense"], "Poisoner": ["offense", "skills"],
  "Polearm Master": ["offense"], "Resilient": ["defense"], "Ritual Caster": ["spells", "utility"], "Sentinel": ["offense", "allies"], "Shadow Touched": ["spells", "utility"],
  "Sharpshooter": ["offense"], "Shield Master": ["defense", "offense"], "Skill Expert": ["skills"], "Skulker": ["utility", "skills"], "Slasher": ["offense"],
  "Speedy": ["mobility"], "Spell Sniper": ["spells", "offense"], "Telekinetic": ["spells", "utility", "mobility"], "Telepathic": ["spells", "utility"],
  "War Caster": ["spells", "defense"], "Weapon Master": ["offense"],
  "Archery": ["offense"], "Blind Fighting": ["utility"], "Defense": ["defense"], "Dueling": ["offense"], "Great Weapon Fighting": ["offense"], "Interception": ["allies", "defense"],
  "Protection": ["allies", "defense"], "Thrown Weapon Fighting": ["offense"], "Two-Weapon Fighting": ["offense"], "Unarmed Fighting": ["offense"],
  "Boon of Combat Prowess": ["offense"], "Boon of Dimensional Travel": ["mobility"], "Boon of Energy Resistance": ["defense"], "Boon of Fate": ["allies", "utility"],
  "Boon of Fortitude": ["defense", "healing"], "Boon of Irresistible Offense": ["offense"], "Boon of Recovery": ["healing"], "Boon of Skill": ["skills"],
  "Boon of Speed": ["mobility"], "Boon of Spell Recall": ["spells"], "Boon of the Night Spirit": ["defense", "utility"], "Boon of Truesight": ["utility"]
};
// feats not in the table above (other books): guess from their text
const FEAT_TAG_RX = {
  spells: /\b(cast|learn)\b[^.]{0,60}\b(spell|cantrip)s?\b|\bspell list\b|\bspellcasting ability\b/i,
  allies: /\ball(y|ies)\b|\bfriendly creature|\bcreatures? of your choice\b/i,
  offense: /\b(attack|damage) rolls?\b|\bextra damage\b|\bdeals? (an )?extra\b|\bweapon attack\b/i,
  defense: /\bArmor Class\b|\bResistance to\b|\bsaving throws?\b|\bdisadvantage on attack rolls against you\b/i,
  healing: /\bregains?\b[^.]{0,40}\bHit Points\b|\bTemporary Hit Points\b/i,
  skills: /\b(proficiency|Expertise)\b[^.]{0,40}\b(skill|tool|kit|instrument)s?\b|\bskill proficiency\b/i,
  mobility: /\bSpeed increases\b|\bteleport|\bclimb Speed|\bfly Speed|\bDash\b/i
};
const FEAT_TAG_CACHE = {};
function featTags(name) {
  if (FEAT_TAGS[name]) return FEAT_TAGS[name];
  if (FEAT_TAG_CACHE[name]) return FEAT_TAG_CACHE[name];
  const t = featDesc(name) || "", out = Object.keys(FEAT_TAG_RX).filter(k => FEAT_TAG_RX[k].test(t));
  if (t && !out.length) out.push("utility");
  return (FEAT_TAG_CACHE[name] = out);
}
// shortlist ("put into list"): a few feats to compare before choosing; kept on this device
const FeatShort = {
  get() { try { return JSON.parse(localStorage.getItem("featShort") || "[]"); } catch (e) { return S.ui._fs || []; } },
  set(a) { S.ui._fs = a; try { localStorage.setItem("featShort", JSON.stringify(a)); } catch (e) { } },
  toggle(n) { const a = this.get(), i = a.indexOf(n); i >= 0 ? a.splice(i, 1) : a.push(n); this.set(a); }
};
const FT_ACT = {
  featTag: el => { const t = el.dataset.t, a = S.ui.featTags ||= []; if (!t) S.ui.featTags = []; else { const i = a.indexOf(t); i >= 0 ? a.splice(i, 1) : a.push(t); } S.modal ? renderModal() : render(); },
  featShort: el => { FeatShort.toggle(el.dataset.v); S.modal ? renderModal() : render(); }
};
