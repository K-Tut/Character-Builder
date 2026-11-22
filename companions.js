"use strict";
/* ============ COMPANIONS: Steel Defender, Primal Companion, familiars, steeds, vestige, dragon, own ones ============
   A companion has its own play view (stats, HP, attacks, traits). Its portrait sits in the bottom-left corner of the
   character's picture; tapping it switches the play sheet to the companion, and the character's picture then sits in the
   companion's corner to switch back.
   Built-in stat blocks scale with the character. They follow the published stat blocks as closely as I could; any number
   can be overridden with ✎ (and own companions are typed in completely).
   State per character: c.comps = { key: { name, img, form, hp, temp, cond:[], slot, edit:{…overrides} } }, own ones in
   c.ownComps = [{ id, name, img, stat:{…}, hp, temp, cond }].
*/
const AB6 = ["str", "dex", "con", "int", "wis", "cha"];
const abl = a => AB6.reduce((o, k, i) => (o[k] = a[i], o), {});
const cmod = v => Math.floor((v - 10) / 2);
const spAtk = (D, cls) => D.casters.find(x => x.cls === cls)?.atk ?? (D.pb + 3);
const spDC = (D, cls) => D.casters.find(x => x.cls === cls)?.dc ?? (11 + D.pb);

// familiar forms (Find Familiar; Pact of the Chain adds the special ones; a Necromancer can also pick Skeleton / Zombie)
// sk = the skills its stat block lists (all other skills just use the ability modifier)
const FAMILIARS = {
  Bat: { size: "Tiny", ac: 12, hp: 1, speed: "5 ft, fly 30 ft", ab: [2, 15, 8, 2, 12, 4], sk: { Perception: 3 }, senses: "Blindsight 60 ft", traits: [["Echolocation", "The bat can't use its Blindsight while it has the Deafened condition."]], atk: [["Bite", 4, "1", "piercing"]] },
  Cat: { size: "Tiny", ac: 12, hp: 2, speed: "40 ft, climb 40 ft", ab: [3, 15, 10, 3, 12, 7], sk: { Perception: 3, Stealth: 4 }, senses: "Darkvision 60 ft", traits: [["Jumper", "The cat's jump distance is determined using its Dexterity rather than its Strength."]], atk: [["Scratch", 4, "1", "slashing"]] },
  Frog: { size: "Tiny", ac: 11, hp: 1, speed: "20 ft, swim 20 ft", ab: [1, 13, 8, 1, 8, 3], sk: { Perception: 1, Stealth: 3 }, senses: "Darkvision 30 ft", traits: [["Amphibious", "The frog can breathe air and water."], ["Standing Leap", "The frog's Long Jump is up to 10 feet and its High Jump is up to 5 feet, with or without a running start."]], atk: [["Bite", 3, "1", "piercing"]] },
  Hawk: { size: "Tiny", ac: 13, hp: 1, speed: "10 ft, fly 60 ft", ab: [5, 16, 8, 2, 14, 6], sk: { Perception: 6 }, senses: "", traits: [], atk: [["Beak", 5, "1", "piercing"]] },
  Lizard: { size: "Tiny", ac: 10, hp: 2, speed: "20 ft, climb 20 ft", ab: [2, 11, 10, 1, 8, 3], sk: {}, senses: "Darkvision 30 ft", traits: [["Spider Climb", "The lizard can climb difficult surfaces, including along ceilings, without needing to make an ability check."]], atk: [["Bite", 2, "1", "piercing"]] },
  Octopus: { size: "Small", ac: 12, hp: 3, speed: "5 ft, swim 30 ft", ab: [4, 15, 11, 3, 10, 4], sk: { Perception: 2, Stealth: 6 }, senses: "Darkvision 30 ft", traits: [["Compression", "The octopus can move through a space as narrow as 1 inch without expending extra movement to do so."], ["Water Breathing", "The octopus can breathe only underwater. It can hold its breath for 30 minutes outside water."], ["Ink Cloud (1/day)", "Reaction, when a creature ends its turn within 5 feet of the octopus while it is underwater: the octopus releases ink that fills a 10-foot Cube centered on itself. The Cube is Heavily Obscured for 1 minute or until a strong current or similar effect disperses it. The octopus can then move up to its Swim Speed."]], atk: [["Tentacles", 4, "1", "bludgeoning", "", "", "the target has the Grappled condition (escape DC 10) from one of four tentacles"]] },
  Owl: { size: "Tiny", ac: 11, hp: 1, speed: "5 ft, fly 60 ft", ab: [3, 13, 8, 2, 12, 7], sk: { Perception: 5, Stealth: 5 }, senses: "Darkvision 120 ft", traits: [["Flyby", "The owl doesn't provoke Opportunity Attacks when it flies out of an enemy's reach."]], atk: [["Rend", 3, "1", "slashing"]] },
  Rat: { size: "Tiny", ac: 10, hp: 1, speed: "20 ft, climb 20 ft", ab: [2, 11, 9, 2, 10, 4], sk: { Perception: 2 }, senses: "Darkvision 30 ft", traits: [["Agile", "The rat doesn't provoke Opportunity Attacks when it moves out of an enemy's reach."]], atk: [["Bite", 2, "1", "piercing"]] },
  Raven: { size: "Tiny", ac: 12, hp: 2, speed: "10 ft, fly 50 ft", ab: [2, 14, 8, 2, 15, 6], sk: { Perception: 6 }, senses: "", traits: [["Mimicry", "The raven can mimic simple sounds it has heard, such as a whisper or chitter. A hearer can discern the sounds are imitations with a successful DC 10 Wisdom (Insight) check."]], atk: [["Beak", 4, "1", "piercing"]] },
  Spider: { size: "Tiny", ac: 12, hp: 1, speed: "20 ft, climb 20 ft", ab: [2, 14, 8, 1, 10, 2], sk: { Stealth: 4 }, senses: "Darkvision 30 ft", traits: [["Spider Climb", "The spider can climb difficult surfaces, including along ceilings, without needing to make an ability check."], ["Web Walker", "The spider ignores movement restrictions caused by webs, and it knows the location of any other creature in contact with the same web."]], atk: [["Bite", 4, "1", "piercing", "1d4", "poison"]] },
  Weasel: { size: "Tiny", ac: 13, hp: 1, speed: "30 ft, climb 30 ft", ab: [3, 16, 8, 2, 12, 3], sk: { Acrobatics: 5, Perception: 3, Stealth: 5 }, senses: "Darkvision 60 ft", traits: [], atk: [["Bite", 5, "1", "piercing"]] },
  "Imp (Pact of the Chain)": { size: "Tiny", ac: 13, hp: 21, speed: "20 ft, fly 40 ft", ab: [6, 17, 13, 11, 12, 14], sk: { Deception: 4, Insight: 3, Stealth: 5 }, senses: "Darkvision 120 ft", traits: [["Magic Resistance", "The imp has Advantage on saving throws against spells and other magical effects."], ["Invisibility", "Magic action: the imp gains the Invisible condition until it attacks, deals damage, or its Concentration ends."], ["Shape-Shift", "The imp shape-shifts to resemble a rat, a raven or a spider, or back into its true form. Its game statistics are the same in each form."]], atk: [["Sting", 5, "1d6+3", "piercing", "2d6", "poison"]] },
  "Pseudodragon (Pact of the Chain)": { size: "Tiny", ac: 14, hp: 10, speed: "15 ft, fly 60 ft", ab: [6, 15, 13, 10, 12, 10], sk: { Perception: 5, Stealth: 4 }, senses: "Blindsight 10 ft, Darkvision 60 ft", traits: [["Magic Resistance", "The pseudodragon has Advantage on saving throws against spells and other magical effects."]], atk: [["Bite", 4, "1d4+2", "piercing"], ["Sting", 4, "1d4+2", "piercing", "", "", "Con save DC 12 or Poisoned for 1 hour; if it fails by 5 or more, it is also Unconscious while Poisoned this way"]] },
  "Quasit (Pact of the Chain)": { size: "Tiny", ac: 13, hp: 25, speed: "40 ft", ab: [5, 17, 10, 7, 10, 10], sk: { Stealth: 5 }, senses: "Darkvision 120 ft", traits: [["Magic Resistance", "The quasit has Advantage on saving throws against spells and other magical effects."], ["Invisibility", "Magic action: the quasit gains the Invisible condition until it attacks or deals damage."], ["Shape-Shift", "The quasit shape-shifts to resemble a bat, a centipede or a toad, or back into its true form."]], atk: [["Rend", 5, "1d4+3", "slashing", "", "", "Con save DC 10 or Poisoned until the start of the quasit's next turn"]] },
  "Sprite (Pact of the Chain)": { size: "Tiny", ac: 15, hp: 10, speed: "10 ft, fly 40 ft", ab: [3, 18, 10, 14, 13, 11], sk: { Perception: 3, Stealth: 8 }, senses: "", traits: [["Invisibility", "Magic action: the sprite gains the Invisible condition until it attacks, deals damage, or its Concentration ends."], ["Heart Sight", "Magic action: the sprite touches a creature and learns its emotional state."]], atk: [["Needle Sword", 6, "1d4+4", "piercing"], ["Enchanting Bow (40/160 ft)", 6, "1", "piercing", "", "", "the target has the Charmed condition until the start of the sprite's next turn"]] },
  "Venomous Snake (Pact of the Chain)": { size: "Tiny", ac: 12, hp: 5, speed: "30 ft, swim 30 ft", ab: [2, 15, 11, 1, 10, 3], sk: {}, senses: "Blindsight 10 ft", traits: [], atk: [["Bite", 4, "1d4+2", "piercing", "1d6", "poison"]] },
  "Skeleton (Pact of the Chain / Necromancer)": { size: "Medium", ac: 14, hp: 13, speed: "30 ft", ab: [10, 16, 15, 6, 8, 5], sk: {}, senses: "Darkvision 60 ft", extra: "Vulnerable to Bludgeoning; immune to Poison damage, Exhaustion and Poisoned", traits: [], atk: [["Shortsword", 5, "1d6+3", "piercing"], ["Shortbow (80/320 ft)", 5, "1d6+3", "piercing"]] },
  "Zombie (Necromancer)": { size: "Medium", ac: 8, hp: 15, speed: "20 ft", ab: [13, 6, 16, 3, 6, 5], sk: {}, senses: "Darkvision 60 ft", extra: "Immune to Poison damage, Exhaustion and Poisoned", traits: [["Undead Fortitude", "If damage reduces the zombie to 0 Hit Points, it makes a Constitution saving throw (DC 5 plus the damage taken) unless the damage is Radiant or from a Critical Hit. On a success, the zombie drops to 1 Hit Point instead."]], atk: [["Slam", 3, "1d8+1", "bludgeoning"]] }
};
const famAtk = a => ({ name: a[0], hit: a[1], parts: [{ f: a[2], type: a[3] }].concat(a[4] ? [{ f: a[4], type: a[5] }] : []), note: a[6] || "" });

const COMP_TEMPLATES = {
  steeldefender: {
    label: "Steel Defender", icon: "🛡", has: (c, D) => D.subs.artificer && /battle smith/i.test(D.subs.artificer.name), wiki: ["artificer", "battlesmith"],
    stat: (c, D) => { const l = D.cls.artificer || 1, pb = D.pb; return { type: "Medium Construct", ac: 15, hpMax: 2 + D.mod.int + 5 * l, speed: "40 ft", ab: abl([14, 12, 14, 4, 10, 6]), saves: { dex: 1 + pb, con: 2 + pb },
      skills: { Athletics: 2 + 2 * pb, Perception: 2 * pb }, senses: "Darkvision 60 ft", extra: "Immune to Poison damage; Charmed, Exhaustion, Poisoned",
      traits: [["Vigilant", "The defender can't be surprised."], ["Combat Behavior", "The defender is an ally to you and your allies and obeys your commands. In combat it acts during your turn. It can move and use its Reaction on its own, but the only action it takes is the Dodge action, unless you take a Bonus Action to command it to take another action. If you have the Incapacitated condition, the defender can take any action of its choice."]],
      actions: [{ name: "Force-Empowered Rend", hit: spAtk(D, "artificer"), parts: [{ f: "1d8+" + pb, type: "force" }], note: "melee, reach 5 ft, one target you can see" }],
      text: [["Repair (3/day)", `Magic action: the defender's magical mechanisms restore 2d8 + ${pb} Hit Points to itself or to one Construct or object within 5 feet of it.`], ["Deflect Attack (Reaction)", "Trigger: a creature the defender can see within 5 feet of it makes an attack roll against a creature other than the defender. Response: the defender imposes Disadvantage on that attack roll."]] }; } },
  primal: {
    label: "Primal Companion", icon: "🐺", forms: ["Beast of the Land", "Beast of the Sea", "Beast of the Sky"], wiki: ["ranger", "beastmaster"],
    has: (c, D) => D.subs.ranger && /beast master/i.test(D.subs.ranger.name),
    stat: (c, D, st) => { const l = D.cls.ranger || 1, w = D.mod.wis, atk = spAtk(D, "ranger"), dc = spDC(D, "ranger"), f = st.form || "Beast of the Land", force = l >= 7 ? " or Force (your choice)" : "";
      const base = { type: "Beast (" + f.replace("Beast of the ", "") + ")", ab: abl(f === "Beast of the Sky" ? [6, 16, 13, 8, 14, 11] : [14, 14, 15, 8, 14, 11]), ac: 13 + w, senses: "Darkvision 60 ft", checkBonus: D.pb,
        traits: [["Primal Bond", `Add your Proficiency Bonus (+${D.pb}) to any ability check or saving throw the beast makes.`], ["Combat Behavior", `The beast acts during your turn. It can move and use its Reaction on its own, but the only action it takes is the Dodge action, unless you take a Bonus Action to command it to take an action in its stat block or some other action${l >= 7 ? " (Exceptional Training: when you do, it can also take the Dash, Disengage, Dodge or Help action as a Bonus Action)" : ""}. You can also sacrifice one of your attacks when you take the Attack action to command it to take the Beast's Strike action. If you have the Incapacitated condition, the beast acts on its own.`]].concat(l >= 11 ? [["Bestial Fury", "When you command the beast to take the Beast's Strike action, it can use it twice. The first time each turn it hits a creature under your Hunter's Mark, it deals extra Force damage equal to the bonus damage of that spell."]] : []) };
      if (f === "Beast of the Sea") return { ...base, hpMax: 5 + 5 * l, speed: "5 ft, swim 60 ft", traits: base.traits.concat([["Amphibious", "The beast can breathe air and water."]]), actions: [{ name: "Beast's Strike", hit: atk, parts: [{ f: "1d6+" + (2 + w), type: "piercing" }], note: `Bludgeoning or Piercing${force}; the target has the Grappled condition (escape DC ${dc})` }] };
      if (f === "Beast of the Sky") return { ...base, hpMax: 4 + 4 * l, speed: "10 ft, fly 60 ft", traits: base.traits.concat([["Flyby", "The beast doesn't provoke Opportunity Attacks when it flies out of an enemy's reach."]]), actions: [{ name: "Beast's Strike", hit: atk, parts: [{ f: "1d4+" + (3 + w), type: "slashing" }], note: "Slashing" + force }] };
      return { ...base, hpMax: 5 + 5 * l, speed: "40 ft, climb 40 ft", actions: [{ name: "Beast's Strike", hit: atk, parts: [{ f: "1d8+" + (2 + w), type: "slashing" }], note: `Bludgeoning, Piercing or Slashing${force}. If the beast moved at least 20 feet straight toward the target right before the hit, the target takes an extra 1d6 damage of the same type, and a Large or smaller target makes a Strength save (DC ${dc}) or has the Prone condition` }] };
    } },
  familiar: {
    label: "Familiar", icon: "🦉", forms: Object.keys(FAMILIARS),
    has: (c, D) => hasAnySpell(c, D, "Find Familiar") || (c.pools?.invocations || []).includes("Pact of the Chain") || (D.subs.wizard && /necroman/i.test(D.subs.wizard.name)),
    stat: (c, D, st) => { const k = FAMILIARS[st.form] ? st.form : "Owl", F = FAMILIARS[k];
      return { type: F.size + " " + (/Skeleton|Zombie/.test(k) ? "Undead" : "Celestial, Fey or Fiend (your choice)"), ac: F.ac, hpMax: F.hp, speed: F.speed, ab: abl(F.ab), skills: F.sk || {}, senses: F.senses, extra: F.extra || "",
        traits: F.traits.concat([["Telepathic Connection", "While the familiar is within 100 feet of you, you can communicate with it telepathically. As a Bonus Action, you can see through its eyes and hear what it hears until the start of your next turn."],
          ["Combat", "The familiar acts independently of you but always obeys your commands. In combat it rolls its own Initiative. It can't attack, but it can take other actions as normal" + (/Skeleton|Zombie|Pact/.test(k) ? ". Pact of the Chain or Necromancer: when you take the Attack action, you can forgo one of your attacks to let it make one attack of its own with its Reaction." : ".")],
          ["Touch Spells", "When you cast a spell with a range of touch, the familiar can deliver it as if it had cast the spell. It must be within 100 feet of you, and it uses its Reaction to deliver the spell."]]),
        actions: F.atk.map(famAtk) }; } },
  steed: {
    label: "Steed", icon: "🐴", forms: ["Celestial", "Fey", "Fiend", "Undead (Ebon Blade)"],
    has: (c, D) => hasAnySpell(c, D, "Find Steed") || (D.cls.paladin || 0) >= 5,
    stat: (c, D, st) => { const L = Math.max(2, +st.slot || 2), f = st.form || "Celestial", type = { Celestial: "radiant", Fey: "psychic", Fiend: "necrotic", "Undead (Ebon Blade)": "necrotic" }[f], dc = Math.max(spDC(D, "paladin"), spDC(D, "ranger"));
      const ba = { Celestial: ["Healing Touch (1/long rest)", `Bonus Action: one creature within 5 feet of the steed regains 2d8 + ${L} Hit Points.`], Fey: ["Fey Step (1/long rest)", "Bonus Action: the steed teleports, along with its rider, to an unoccupied space of your choice up to 60 feet away from itself."], Fiend: ["Fell Glare (1/long rest)", `Bonus Action: one creature within 60 feet of the steed that it can see makes a Wisdom saving throw (DC ${dc}). On a failure, the target has the Frightened condition until the end of your next turn.`], "Undead (Ebon Blade)": ["Ghostly Stride (1/long rest)", "Bonus Action: the steed and its rider can move through creatures and objects as if they were Difficult Terrain this turn. Each takes 1d10 Force damage if it ends its turn inside a creature or an object."] }[f];
      return { type: "Large " + f.replace(" (Ebon Blade)", ""), ac: 10 + L, hpMax: 5 + 10 * L, speed: "60 ft" + (L >= 4 ? ", fly 60 ft" : ""), ab: abl([18, 12, 14, 6, 12, 8]), senses: "",
        traits: [["Life Bond", "When you regain Hit Points from a spell of level 1 or higher, the steed regains the same number of Hit Points if you're within 5 feet of it."], ["Spell level", `Summoned with a level ${L} slot — change it in the list above.`]],
        actions: [{ name: "Otherworldly Slam", hit: Math.max(spAtk(D, "paladin"), spAtk(D, "ranger")), parts: [{ f: "1d8+" + L, type }], note: "melee, reach 5 ft" }], text: [ba] }; } },
  vestige: {
    label: "Vestige", icon: "👻", forms: ["Celestial", "Fiend", "Undead"], wiki: ["warlock", "vestige"],
    has: (c, D) => D.subs.warlock && /vestige/i.test(D.subs.warlock.name),
    stat: (c, D, st) => { const l = D.cls.warlock || 1, ch = D.mod.cha, f = st.form || "Celestial", type = { Celestial: "radiant", Fiend: "fire", Undead: "necrotic" }[f];
      const dp = { Celestial: ["Healing Touch", `The target regains 2d8 + ${ch} Hit Points, and one of these conditions ends on it: Blinded, Deafened or Poisoned.`], Fiend: ["Fiendish Swap", "If you and the vestige are within 60 feet of each other, you swap places by teleporting."], Undead: ["Cursed Invocation", "One creature the vestige can see within 30 feet of it is cursed for 1 minute: it has Disadvantage on attack rolls against you and the vestige."] }[f];
      return { type: "Small " + f, ac: 13 + ch, hpMax: 4 + 4 * l, speed: "5 ft, hover 30 ft", ab: abl([1, 14, 10, 15, 15, 16]), senses: "Passive Perception 12", checkBonus: D.pb, extra: `Resists ${type[0].toUpperCase() + type.slice(1)}; immune to Charmed, Frightened, Prone`,
        traits: [["Pact Bond", `Add your Proficiency Bonus (+${D.pb}) to any ability check or saving throw the vestige makes.`], ["Combat Behavior", "The vestige acts during your turn. It can move and use its Reaction on its own, but the only action it takes is the Dodge action, unless you take a Bonus Action to command it to take another action. You can also forgo one of your attacks when you take the Attack action to command it to use Vestige's Strike."]],
        actions: [{ name: "Vestige's Strike", hit: spAtk(D, "warlock"), parts: [{ f: "1d6+" + (3 + ch), type }], note: "melee reach 5 ft or ranged 60 ft" }],
        text: [["Divine Power: " + dp[0] + " (Bonus Action, 1/day" + (l >= 6 ? "; also regained on a short rest or with Magical Cunning" : "") + ")", dp[1]]] }; } },
  purpledragon: {
    label: "Purple Dragon", icon: "🐉", wiki: ["fighter", "purpledragon"], has: (c, D) => D.subs.fighter && /purple dragon knight/i.test(D.subs.fighter.name),
    stat: (c, D) => { const l = D.cls.fighter || 1, i = D.mod.int;
      return { type: (l >= 15 ? "Large" : l >= 7 ? "Medium" : "Small") + " Dragon", ac: 13 + i, hpMax: 4 + 4 * l, speed: l >= 15 ? "40 ft, fly 40 ft, swim 30 ft" : "30 ft, fly 30 ft, swim 30 ft", ab: abl([16, 16, 12, 8, 13, 10]), senses: "Darkvision 60 ft, telepathy 30 ft", checkBonus: Math.floor(D.pb / 2),
        traits: [["Stalwart Bond", `Add half your Proficiency Bonus (+${Math.floor(D.pb / 2)}, rounded down) to any ability check or saving throw the dragon makes.`], ["Amphibious", "The dragon can breathe air and water."], ["Combat Behavior", "The dragon acts during your turn. It can move and use its Reaction on its own, but the only action it takes is the Dodge action, unless you take a Bonus Action to command it to take an action in its stat block or some other action."]],
        actions: [{ name: "Rend", hit: 3 + i, parts: [{ f: "1d6+" + i, type: "force" }], note: "melee, reach 5 ft" }],
        text: [["Gravity Breath (2/day)", `The dragon exhales in a ${l >= 7 ? 30 : 15}-foot Cone. Each creature in it makes a Constitution saving throw (DC ${8 + D.pb + i}). On a failure, the dragon pulls it up to 15 feet straight toward itself or pushes it up to 15 feet straight away${l >= 7 ? ", and it takes 2d6 Force damage" : ""}.`]] }; } }
};
function hasAnySpell(c, D, n) { const k = norm(n); return (c.spells || []).some(s => norm(s.name) === k) || D.alwaysSpells.some(s => norm(s.name) === k); }

// every companion this character has: built-in ones it qualifies for, plus own ones
function companionList(c, D) {
  const out = [];
  for (const [k, T] of Object.entries(COMP_TEMPLATES)) if (T.has(c, D)) {
    const st = (c.comps ||= {})[k] ||= {};
    if (T.forms && !st.form) st.form = k === "familiar" ? (D.subs.wizard && /necroman/i.test(D.subs.wizard.name) ? "Skeleton (Pact of the Chain / Necromancer)" : "Owl") : T.forms[0];
    const s = applyBuffsComp(c, k, { ...T.stat(c, D, st), ...(st.edit || {}) });
    const icon = k === "familiar" && /Skeleton|Zombie/.test(st.form) ? "💀" : k === "steed" && /Undead/.test(st.form) ? "💀" : T.icon;
    out.push({ key: k, label: T.label, icon, forms: T.forms, st, s, name: st.name || (k === "familiar" || k === "primal" ? st.form.replace(/ \(.*\)$/, "") : T.label) });
  }
  (c.ownComps || []).forEach(o => out.push({ key: "own:" + o.id, label: "Own companion", icon: "🐾", st: o, s: applyBuffsComp(c, "own:" + o.id, o.stat || {}), name: o.name || "Companion", own: true }));
  return out;
}
function compByKey(c, D, k) { return companionList(c, D).find(x => x.key === k); }

// small round picture(s) in the corner of the big one
function compBubbles(c, D) {
  const list = companionList(c, D); if (!list.length) return "";
  return `<div class="compbub">${list.slice(0, 4).map(x => `<span class="bub" data-act="compShow" data-k="${esc(x.key)}" title="${esc(x.name)} — show its sheet">${x.st.img ? `<img src="${x.st.img}" alt="">` : `<i>${x.icon}</i>`}</span>`).join("")}</div>`;
}

function companionCard(c, D) {
  const list = companionList(c, D);
  return `<div class="card"><h3>Companions</h3>${list.map(x => { const max = Math.max(1, +x.s.hpMax || 1), hp = Math.min(x.st.hp ?? max, max);
      return `<div class="res compline" data-act="compShow" data-k="${esc(x.key)}"><span class="n row" style="gap:8px;flex-wrap:nowrap"><span class="bub">${x.st.img ? `<img src="${x.st.img}" alt="">` : `<i>${x.icon}</i>`}</span><span><b>${esc(x.name)}</b><div class="small muted">${esc(x.label)} · AC ${+x.s.ac || 10}</div></span></span><span class="small"><b>${hp}</b> / ${max} HP ›</span></div>`; }).join("")}
    <div class="row" style="margin-top:8px"><button class="small ghost" data-act="compAdd">＋ Own companion</button><span class="small muted">${list.length ? "Tap one to open its sheet." : "Companions from your class, subclass or spells (Find Familiar, Find Steed …) appear here by themselves."}</span></div></div>`;
}
// "(3/day)", "(1/long rest)", "2/Day" … in a trait's name or text -> a use counter
function traitUses(n, t) { const m = (n + " " + t).match(/\b(\d+)\s*\/\s*(day|long rest|short rest)/i); return m ? { max: +m[1], sr: /short/i.test(m[2]) } : null; }
function skillsText(o) { return o && typeof o === "object" ? Object.entries(o).map(([k, v]) => k + " " + sgn(+v)).join(", ") : (o || ""); }
function parseSkills(t) { const o = {}; String(t || "").split(/[,;]/).forEach(p => { const m = p.trim().match(/^([A-Za-z' ]+?)\s*([+-]\s*\d+)$/); if (m) { const n = ALL_SKILLS.find(k => k.toLowerCase() === m[1].trim().toLowerCase()); if (n) o[n] = +m[2].replace(/\s/g, ""); } }); return o; }
// the official wording from the imported rules text, if the subclass page there has this entry
function compWiki(x, name) {
  const T = COMP_TEMPLATES[x.key]; if (!T?.wiki || !S.idx?.sec) return "";
  const slug = subclassSlug(T.wiki[0], T.wiki[1]); if (!slug) return "";
  for (const k of headingKeys(name.replace(/\s*\(.*\)$/, ""))) { const h = (S.idx.sec[k] || []).find(a => a.slug === slug); if (h) return stripSource(h.text); }
  return "";
}
function traitsCard(x) {
  const s = x.s, st = x.st, rows = (s.traits || []).concat(s.text || []).map(([n, t]) => [n, compWiki(x, n) || t]);
  const body = rows.map(([n, t]) => { const u = traitUses(n, t), used = (st.used || {})[n] || 0;
    const pipsH = u ? `<span class="pips">${Array.from({ length: u.max }, (_, i) => `<span class="pip ${i < u.max - used ? "" : "used"}" data-act="compPip" data-k="${esc(x.key)}" data-n="${esc(n)}" data-i="${i}" data-m="${u.max}"></span>`).join("")}</span>` : "";
    return `<div class="feat ctrait"><div class="h"><b>${esc(n)}</b>${actTag(actKind(t))}<span class="grow"></span>${pipsH}</div><div class="desc small">${diceLinks(para(t), n)}</div></div>`; }).join("");
  return `<div class="card"><h3>Traits & actions</h3>${body || '<p class="muted small">—</p>'}
    ${st.notes ? `<h3 style="margin-top:12px">Notes</h3><div class="desc">${para(st.notes)}</div>` : ""}
    <p class="small muted" style="margin-top:10px">${x.own ? "Your own companion — change anything with ✎ Edit." : "Stats scale with your level and modifiers. Check them against your book; anything can be changed with ✎ Edit."}</p></div>`;
}
// rests refill the companions' uses (and a long rest their HP)
function restCompanions(c, long) {
  const all = Object.values(c.comps || {}).concat(c.ownComps || []);
  for (const st of all) { if (long) { st.used = {}; st.hp = undefined; st.temp = 0; } else if (st.used) for (const n in st.used) if (/short/i.test(n)) delete st.used[n]; }
}
function renderCompanion(c, D, x) {
  const s = x.s, st = x.st, hpMax = Math.max(1, +s.hpMax || 1), hp = Math.min(st.hp ?? hpMax, hpMax), pct = Math.max(0, 100 * hp / hpMax), ab = s.ab || abl([10, 10, 10, 10, 10, 10]);
  const others = companionList(c, D).filter(y => y.key !== x.key);
  const h = `<div class="card"><div class="hero"><div class="heroimg compimg ${hp <= 0 ? "down" : ""}">${st.img ? `<img src="${st.img}" alt="">` : `<div class="compph">${x.icon}</div>`}
      <div class="compbub"><span class="bub me" data-act="compShow" data-k="" title="Back to ${esc(c.name)}">${c.portrait || c.thumb ? `<img src="${c.thumb || c.portrait}" alt="">` : "🛡"}</span>${others.slice(0, 3).map(y => `<span class="bub" data-act="compShow" data-k="${esc(y.key)}" title="${esc(y.name)}">${y.st.img ? `<img src="${y.st.img}" alt="">` : `<i>${y.icon}</i>`}</span>`).join("")}</div></div>
    <div class="grow herobody"><h2>${esc(x.name)}</h2><div>${x.name !== x.label ? esc(x.label) + " · " : ""}<span class="muted">${esc(s.type || "")}</span></div>
      <div class="muted small">${esc(c.name)}'s companion</div>
      <div class="heroact"><div class="herorow">${x.forms ? `<select data-act="compForm" data-k="${esc(x.key)}" class="compform">${x.forms.map(f => `<option ${f === st.form ? "selected" : ""}>${esc(f)}</option>`).join("")}</select>` : ""}${x.key === "steed" ? `<select data-act="compSlot" title="Spell slot level">${[2, 3, 4, 5, 6, 7, 8, 9].map(l => `<option value="${l}" ${l === (+st.slot || 2) ? "selected" : ""}>Level ${l} slot</option>`).join("")}</select>` : ""}<button class="ghost" data-act="compEdit" data-k="${esc(x.key)}">✎ Edit</button></div>
        <div class="herorow"><button class="ghost" data-act="compShow" data-k="">◀ Back to ${esc(c.name)}</button></div></div></div></div></div>`;
  const hb = buffBanner(c, x.key);
  const cb = +s.checkBonus || 0, sk = typeof s.skills === "object" && s.skills ? s.skills : parseSkills(s.skills);
  const c1 = `<div class="card"><h3>Abilities</h3>${AB6.map(a => { const m = cmod(+ab[a] || 10) + cb, sv = s.saves?.[a] ?? m; return `<div class="abil" style="background:var(--${a})"><b>${ABILITY_NAMES[a]}</b><span class="num">${+ab[a] || 10}</span><span class="m roll" ${R(x.name + ": " + ABILITY_NAMES[a] + " check", m)}>${sgn(m)}</span><span class="roll" ${R(x.name + ": " + ABILITY_NAMES[a] + " save", sv)}>${sgn(sv)}</span></div>`; }).join("")}
      <p class="small muted" style="margin:6px 0 0">Tap a modifier to roll a check, the last column for a save.</p></div>
    <div class="card"><h3>Skills</h3>${SKILLS_BY_ABILITY.map(n => { const a = SKILLS[n], own = sk[n] !== undefined, v = own ? +sk[n] : cmod(+ab[a] || 10) + cb;
      return `<div class="skill roll" style="background:var(--${a})" ${R(x.name + ": " + n + " check", v)}><span><span class="dot ${own ? "p" : ""}"></span>${n} <span class="muted small">${ABBR[a]}</span></span><b>${sgn(v)}</b></div>`; }).join("")}
      <p class="small muted" style="margin:6px 0 0">● = listed in its stat block; the rest come from its ability scores${cb ? ` (+${cb} from its bond)` : ""}.</p></div>
    <div class="card"><h3>Senses & more</h3><p class="small" style="margin:0">${[s.senses && "<b>Senses:</b> " + esc(s.senses), s.extra && esc(s.extra)].filter(Boolean).join("<br>") || '<span class="muted">—</span>'}</p></div>`;
  const acts = (s.actions || []).map((a, i) => `<tr><td><b>${esc(a.name)}</b>${a.note ? `<div class="small muted">${esc(a.note)}</div>` : ""}</td><td class="num${glowIf(a.buffed)}"><span class="hitbtn2 roll" data-act="compAtk" data-k="${esc(x.key)}" data-i="${i}" data-m="hit">${sgn(+a.hit || 0)}</span></td>
      <td><span class="roll" data-act="compAtk" data-k="${esc(x.key)}" data-i="${i}" data-m="dmg">${(a.parts || []).map(p => esc(p.f) + (p.type ? " " + dtIcon(p.type, "inl") : "")).join(" + ")}</span></td></tr>`).join("");
  const c2 = `<div class="card"><div class="stats"><div class="stat${glowIf(s.buffed?.ac)}"><div class="v">${+s.ac || 10}</div><div class="k">Armor Class</div></div><div class="stat roll" ${R(x.name + ": Initiative", cmod(+ab.dex || 10))}><div class="v">${sgn(cmod(+ab.dex || 10))}</div><div class="k">Initiative 🎲</div></div><div class="stat${glowIf(s.buffed?.speed)}" style="grid-column:span 2"><div class="v" style="font-size:15px">${esc(s.speed || "—")}</div><div class="k">Speed</div></div></div></div>
    <div class="card"><h3>Hit points</h3><div class="hpbox"><div><div class="small muted">Current</div><input type="number" value="${hp}" data-act="compHpSet" data-k="${esc(x.key)}"></div><div><div class="small muted">Max</div><div class="big${glowIf(s.buffed?.hp)}" style="font-size:26px;padding-top:4px">${hpMax}</div></div><div><div class="small muted">Temp</div><input type="number" value="${+st.temp || 0}" data-act="compTempSet" data-k="${esc(x.key)}"></div></div>
      <div class="hpbar"><div style="width:${pct}%;background:${pct < 30 ? "#b33" : pct < 60 ? "var(--warn)" : "var(--good)"}"></div></div>
      <div class="row"><input id="compAmt" type="number" min="0" placeholder="amount" style="width:90px"><button class="danger" data-act="compHp" data-k="${esc(x.key)}" data-m="dmg">Damage</button><button style="background:var(--good)" data-act="compHp" data-k="${esc(x.key)}" data-m="heal">Heal</button><button class="ghost" data-act="compHp" data-k="${esc(x.key)}" data-m="full">Full</button></div></div>
    <div class="card"><h3>Attacks</h3>${acts ? `<table class="t"><tr><th>Attack</th><th class="num">Hit</th><th>Damage</th></tr>${acts}</table><p class="small muted">🎲 Tap the hit bonus to attack — on a hit tap “Hit” to roll damage.</p>` : '<p class="muted small">No attacks.</p>'}</div>
    ${traitsCard(x)}
    <div class="card"><h3>Conditions</h3><div>${CONDITIONS.map(k => `<span class="chip ${(st.cond || []).includes(k) ? "acc" : ""}" style="cursor:pointer" data-act="compCond" data-k="${esc(x.key)}" data-v="${k}">${k}</span>`).join("")}</div></div>`;
  const mt = ["combat", "stats"].includes(S.mtab) ? S.mtab : "combat";
  const mnav = `<nav class="mnav">${[["combat", "❤", "Combat"], ["stats", "◆", "Stats"]].map(([k, i, l]) => `<button class="${mt === k ? "on" : ""}" data-act="mtab" data-k="${k}"><span>${i}</span>${l}</button>`).join("")}<button data-act="compShow" data-k=""><span>↩</span>${esc((c.name || "").split(/[ ,]/)[0])}</button></nav>`;
  return h + hb + `<div class="sheet compsheet m-${mt}"><div class="col1">${c1}</div><div class="col2">${c2}</div></div>${mnav}`;
}

// edit form: name, picture, notes, and overrides of the numbers (own companions: everything)
function mCompEdit() {
  const M = S.modal, e = M.e;
  const f = (id, l, v, t = "text", w = "") => `<label>${l}<input id="ce_${id}" type="${t}" value="${esc(v ?? "")}" ${w}></label>`;
  return `<h2>${M.isNew ? "New companion" : "Edit " + esc(e.name || "companion")}</h2>
    <div class="row" style="align-items:flex-start"><label class="ciimg">${e.img ? `<img src="${e.img}">` : `<span>📷<br><small>add picture</small></span>`}<input type="file" accept="image/*" data-act="ceImg" hidden></label>
      <div class="grow spform" style="grid-template-columns:minmax(0,1fr)">${f("name", "Name", e.name)}${f("type", "Kind (e.g. Medium Beast)", e.type)}</div></div>
    ${e.img ? `<a href="#" class="small" data-act="ceImgDel">remove picture</a>` : ""}
    <p class="small muted" style="margin:10px 0 4px">${M.isNew ? "Stats" : "Change numbers only if they differ — empty fields keep the built-in value."}</p>
    <div class="spform">${f("ac", "Armor class", e.ac, "number")}${f("hpMax", "Max HP", e.hpMax, "number")}<label class="full">Speed<input id="ce_speed" value="${esc(e.speed ?? "")}"></label>
      ${AB6.map(a => f(a, ABILITY_NAMES[a], e.ab?.[a], "number")).join("")}<label class="full">Skills from its stat block <input id="ce_skills" placeholder="e.g. Perception +5, Stealth +4" value="${esc(e.skillsTxt ?? "")}"></label></div>
    <p class="small muted" style="margin:10px 0 4px">Attacks (name · to hit · damage · type)</p>
    ${[0, 1, 2].map(i => { const a = (e.actions || [])[i] || {}; return `<div class="row ceatk"><input id="ce_an${i}" placeholder="Bite" value="${esc(a.name || "")}"><input id="ce_ah${i}" type="number" placeholder="+4" value="${a.hit ?? ""}"><input id="ce_af${i}" placeholder="1d6+2" value="${esc(a.parts?.[0]?.f || "")}">${dtSelect("ce_at" + i, a.parts?.[0]?.type || "")}</div>`; }).join("")}
    <label style="display:block;margin-top:10px">Notes / special abilities<textarea id="ce_notes" style="min-height:90px">${esc(e.notes || "")}</textarea></label>
    <div class="foot">${M.own && !M.isNew ? `<button class="ghost" data-act="ceDel">🗑 Remove</button>` : ""}${!M.own ? `<button class="ghost" data-act="ceReset">Reset numbers</button>` : ""}<button class="ghost" data-act="modalClose">Cancel</button><button data-act="ceSave">Save</button></div>`;
}
function readCompForm() {
  const e = S.modal.e, v = id => document.getElementById("ce_" + id)?.value ?? "";
  e.name = v("name").trim(); e.type = v("type").trim(); e.notes = v("notes");
  const num = k => { const x = v(k); return x === "" ? undefined : +x; };
  e.ac = num("ac"); e.hpMax = num("hpMax"); e.speed = v("speed").trim() || undefined; e.skillsTxt = v("skills").trim(); e.skills = e.skillsTxt ? parseSkills(e.skillsTxt) : undefined;
  const ab = {}; let anyAb = false; AB6.forEach(a => { const x = num(a); if (x !== undefined) { ab[a] = x; anyAb = true; } }); e.ab = anyAb ? ab : undefined;
  const acts = [0, 1, 2].map(i => ({ name: v("an" + i).trim(), hit: +v("ah" + i) || 0, parts: [{ f: v("af" + i).trim(), type: document.getElementById("ce_at" + i)?.value || "" }] })).filter(a => a.name && a.parts[0].f);
  e.actions = acts.length ? acts : undefined;
}
const COMP_ACT = {
  compShow: (el, e) => { e?.stopPropagation(); S.ui.comp = el.dataset.k ? { id: S.char.id, key: el.dataset.k } : null; S.mtab = "combat"; render(); window.scrollTo(0, 0); },
  compAdd: () => openModal({ type: "compEdit", own: true, isNew: true, e: { name: "", img: "", type: "", ac: 12, hpMax: 10, speed: "30 ft", ab: abl([10, 10, 10, 10, 10, 10]), actions: [] } }),
  compEdit: el => { const c = S.char, D = derive(c), x = compByKey(c, D, el.dataset.k); if (!x) return;
    if (x.own) return openModal({ type: "compEdit", own: true, key: x.key, e: { name: x.st.name, img: x.st.img, notes: x.st.notes, ...JSON.parse(JSON.stringify(x.s)), skillsTxt: skillsText(x.s.skills) } });
    const ed = x.st.edit || {}; openModal({ type: "compEdit", key: x.key, e: { name: x.st.name || "", img: x.st.img || "", notes: x.st.notes || "", skillsTxt: skillsText(ed.skills), type: ed.type, ac: ed.ac, hpMax: ed.hpMax, speed: ed.speed, ab: ed.ab, actions: ed.actions } }); },
  ceImgDel: (el, e) => { e.preventDefault(); readCompForm(); S.modal.e.img = ""; renderModal(); },
  ceReset: () => { const c = S.char, k = S.modal.key; if (c.comps?.[k]) delete c.comps[k].edit; save(); closeModal(); render(); },
  ceDel: () => { const c = S.char, id = S.modal.key.slice(4); if (!confirm("Remove this companion?")) return; c.ownComps = (c.ownComps || []).filter(o => o.id !== id); S.ui.comp = null; save(); closeModal(); render(); },
  ceSave: () => { readCompForm(); const c = S.char, M = S.modal, e = M.e;
    if (M.own) { const stat = { type: e.type, ac: e.ac ?? 10, hpMax: e.hpMax ?? 1, speed: e.speed || "30 ft", ab: { ...abl([10, 10, 10, 10, 10, 10]), ...(e.ab || {}) }, actions: e.actions || [], skills: e.skills || {}, traits: [] };
      if (M.isNew) { const id = Date.now().toString(36); (c.ownComps ||= []).push({ id, name: e.name || "Companion", img: e.img, notes: e.notes, stat }); S.ui.comp = { id: c.id, key: "own:" + id }; }
      else { const o = c.ownComps.find(x => "own:" + x.id === M.key); Object.assign(o, { name: e.name || o.name, img: e.img, notes: e.notes, stat }); } }
    else { const st = (c.comps ||= {})[M.key] ||= {}; st.name = e.name; st.img = e.img; st.notes = e.notes;
      const ed = {}; ["type", "ac", "hpMax", "speed"].forEach(k => { if (e[k] !== undefined && e[k] !== "") ed[k] = e[k]; }); if (e.ab) ed.ab = { ...compByKey(c, derive(c), M.key).s.ab, ...e.ab }; if (e.actions) ed.actions = e.actions; if (e.skills) ed.skills = { ...(compByKey(c, derive(c), M.key).s.skills || {}), ...e.skills };
      st.edit = Object.keys(ed).length ? ed : undefined; }
    save(); closeModal(); render(); },
  compAtk: (el, e) => { e.stopPropagation(); const c = S.char, D = derive(c), x = compByKey(c, D, el.dataset.k), a = x?.s.actions?.[+el.dataset.i]; if (!a) return;
    const dmg = { title: x.name + ": " + a.name + " damage", parts: a.parts, note: a.note || "" };
    if (el.dataset.m === "hit") Dice.ask({ kind: "d20", title: x.name + ": " + a.name, mod: +a.hit || 0, then: dmg }); else Dice.ask({ kind: "dmg", ...dmg }); },
  compHp: el => { const c = S.char, D = derive(c), x = compByKey(c, D, el.dataset.k); if (!x) return; const st = x.st, max = Math.max(1, +x.s.hpMax || 1), n = Math.max(0, +document.getElementById("compAmt")?.value || 0);
    let hp = Math.min(st.hp ?? max, max);
    if (el.dataset.m === "full") { hp = max; st.temp = 0; }
    else if (el.dataset.m === "heal") hp = Math.min(max, hp + n);
    else { let d = n; const t = +st.temp || 0; if (t) { const u = Math.min(t, d); st.temp = t - u; d -= u; } hp = Math.max(0, hp - d); }
    st.hp = hp; save(); render(); },
  compPip: el => { const c = S.char, x = compByKey(c, derive(c), el.dataset.k); if (!x) return; const u = x.st.used ||= {}, n = el.dataset.n, i = +el.dataset.i, m = +el.dataset.m, rem = m - (u[n] || 0);
    const nrem = Math.max(0, Math.min(m, i < rem ? rem - 1 : rem + 1)); u[n] = m - nrem; save(); render(); },
  compCond: el => { const c = S.char, x = compByKey(c, derive(c), el.dataset.k); if (!x) return; const a = x.st.cond ||= [], v = el.dataset.v, i = a.indexOf(v); i >= 0 ? a.splice(i, 1) : a.push(v); save(); render(); }
};
const COMP_CHG = {
  compSlot: el => { const c = S.char; ((c.comps ||= {}).steed ||= {}).slot = +el.value; c.comps.steed.hp = undefined; },
  compForm: el => { const c = S.char, k = el.dataset.k; ((c.comps ||= {})[k] ||= {}).form = el.value; c.comps[k].hp = undefined; },
  compHpSet: el => { const c = S.char, x = compByKey(c, derive(c), el.dataset.k); if (x) x.st.hp = Math.max(0, +el.value || 0); },
  compTempSet: el => { const c = S.char, x = compByKey(c, derive(c), el.dataset.k); if (x) x.st.temp = Math.max(0, +el.value || 0); },
  ceImg: async el => { readCompForm(); const f = el.files[0]; if (!f) return; try { S.modal.e.img = await resizeImage(f, 480); } catch (e) { toast("Could not read that picture"); } renderModal(); }
};
