// D&D 2024 (5.5e) rules data: mechanics only (names, numbers, choices).
// Descriptions come from the wiki import (data/wiki.json) or your own edits.
"use strict";

// step({1:2,3:3}) -> array of 20 values, index = level-1
function step(spec) {
  const out = []; let cur = 0;
  for (let l = 1; l <= 20; l++) { if (spec[l] !== undefined) cur = spec[l]; out.push(cur); }
  return out;
}

const ABILITIES = ["str", "dex", "con", "int", "wis", "cha"];
const ABILITY_NAMES = { str: "Strength", dex: "Dexterity", con: "Constitution", int: "Intelligence", wis: "Wisdom", cha: "Charisma" };

const SKILLS = {
  "Acrobatics": "dex", "Animal Handling": "wis", "Arcana": "int", "Athletics": "str",
  "Deception": "cha", "History": "int", "Insight": "wis", "Intimidation": "cha",
  "Investigation": "int", "Medicine": "wis", "Nature": "int", "Perception": "wis",
  "Performance": "cha", "Persuasion": "cha", "Religion": "int", "Sleight of Hand": "dex",
  "Stealth": "dex", "Survival": "wis"
};
const ALL_SKILLS = Object.keys(SKILLS);

const POINT_BUY_COST = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };

// Spell slots by caster level (multiclass table)
const SLOTS = [
  [], [2], [3], [4, 2], [4, 3], [4, 3, 2], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 2], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1, 1], [4, 3, 3, 3, 3, 1, 1, 1, 1], [4, 3, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 3, 2, 2, 1, 1]
];

const PREP = {
  full: [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22],
  wizard: [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 18, 19, 21, 22, 23, 24, 25],
  sorcerer: [2, 4, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22],
  half: [2, 3, 4, 5, 6, 6, 7, 7, 9, 9, 10, 10, 11, 11, 12, 12, 14, 14, 15, 15],
  warlock: [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15],
  third: [0, 0, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13]
};

const STD_ASI = [4, 8, 12, 16];
const FIGHTING_STYLES = ["Archery", "Blind Fighting", "Defense", "Dueling", "Great Weapon Fighting", "Interception", "Protection", "Thrown Weapon Fighting", "Two-Weapon Fighting", "Unarmed Fighting"];

const WEAPONS = [
  // name, cat, damage, type, properties, mastery
  ["Club", "simple", "1d4", "Bludgeoning", "Light", "Slow"],
  ["Dagger", "simple", "1d4", "Piercing", "Finesse, Light, Thrown (20/60)", "Nick"],
  ["Greatclub", "simple", "1d8", "Bludgeoning", "Two-Handed", "Push"],
  ["Handaxe", "simple", "1d6", "Slashing", "Light, Thrown (20/60)", "Vex"],
  ["Javelin", "simple", "1d6", "Piercing", "Thrown (30/120)", "Slow"],
  ["Light Hammer", "simple", "1d4", "Bludgeoning", "Light, Thrown (20/60)", "Nick"],
  ["Mace", "simple", "1d6", "Bludgeoning", "", "Sap"],
  ["Quarterstaff", "simple", "1d6", "Bludgeoning", "Versatile (1d8)", "Topple"],
  ["Sickle", "simple", "1d4", "Slashing", "Light", "Nick"],
  ["Spear", "simple", "1d6", "Piercing", "Thrown (20/60), Versatile (1d8)", "Sap"],
  ["Dart", "simpleR", "1d4", "Piercing", "Finesse, Thrown (20/60)", "Vex"],
  ["Light Crossbow", "simpleR", "1d8", "Piercing", "Ammunition (80/320), Loading, Two-Handed", "Slow"],
  ["Shortbow", "simpleR", "1d6", "Piercing", "Ammunition (80/320), Two-Handed", "Vex"],
  ["Sling", "simpleR", "1d4", "Bludgeoning", "Ammunition (30/120)", "Slow"],
  ["Battleaxe", "martial", "1d8", "Slashing", "Versatile (1d10)", "Topple"],
  ["Flail", "martial", "1d8", "Bludgeoning", "", "Sap"],
  ["Glaive", "martial", "1d10", "Slashing", "Heavy, Reach, Two-Handed", "Graze"],
  ["Greataxe", "martial", "1d12", "Slashing", "Heavy, Two-Handed", "Cleave"],
  ["Greatsword", "martial", "2d6", "Slashing", "Heavy, Two-Handed", "Graze"],
  ["Halberd", "martial", "1d10", "Slashing", "Heavy, Reach, Two-Handed", "Cleave"],
  ["Lance", "martial", "1d10", "Piercing", "Heavy, Reach, Two-Handed (unless mounted)", "Topple"],
  ["Longsword", "martial", "1d8", "Slashing", "Versatile (1d10)", "Sap"],
  ["Maul", "martial", "2d6", "Bludgeoning", "Heavy, Two-Handed", "Topple"],
  ["Morningstar", "martial", "1d8", "Piercing", "", "Sap"],
  ["Pike", "martial", "1d10", "Piercing", "Heavy, Reach, Two-Handed", "Push"],
  ["Rapier", "martial", "1d8", "Piercing", "Finesse", "Vex"],
  ["Scimitar", "martial", "1d6", "Slashing", "Finesse, Light", "Nick"],
  ["Shortsword", "martial", "1d6", "Piercing", "Finesse, Light", "Vex"],
  ["Trident", "martial", "1d8", "Piercing", "Thrown (20/60), Versatile (1d10)", "Topple"],
  ["Warhammer", "martial", "1d8", "Bludgeoning", "Versatile (1d10)", "Push"],
  ["War Pick", "martial", "1d8", "Piercing", "Versatile (1d10)", "Sap"],
  ["Whip", "martial", "1d4", "Slashing", "Finesse, Reach", "Slow"],
  ["Blowgun", "martialR", "1", "Piercing", "Ammunition (25/100), Loading", "Vex"],
  ["Hand Crossbow", "martialR", "1d6", "Piercing", "Ammunition (30/120), Light, Loading", "Vex"],
  ["Heavy Crossbow", "martialR", "1d10", "Piercing", "Ammunition (100/400), Heavy, Loading, Two-Handed", "Push"],
  ["Longbow", "martialR", "1d8", "Piercing", "Ammunition (150/600), Heavy, Two-Handed", "Slow"],
  ["Musket", "martialR", "1d12", "Piercing", "Ammunition (40/120), Loading, Two-Handed", "Slow"],
  ["Pistol", "martialR", "1d10", "Piercing", "Ammunition (30/90), Loading", "Vex"],
  ["Unarmed Strike", "unarmed", "1", "Bludgeoning", "", ""]
].map(w => ({ name: w[0], cat: w[1], dmg: w[2], type: w[3], props: w[4], mastery: w[5] }));

const ARMOR = {
  "": { name: "No armor", base: 10, kind: "none" },
  padded: { name: "Padded Armor", base: 11, kind: "light", stealth: true },
  leather: { name: "Leather Armor", base: 11, kind: "light" },
  studded: { name: "Studded Leather Armor", base: 12, kind: "light" },
  hide: { name: "Hide Armor", base: 12, kind: "medium" },
  chainshirt: { name: "Chain Shirt", base: 13, kind: "medium" },
  scale: { name: "Scale Mail", base: 14, kind: "medium", stealth: true },
  breastplate: { name: "Breastplate", base: 14, kind: "medium" },
  halfplate: { name: "Half Plate Armor", base: 15, kind: "medium", stealth: true },
  ring: { name: "Ring Mail", base: 14, kind: "heavy", stealth: true },
  chainmail: { name: "Chain Mail", base: 16, kind: "heavy", stealth: true, str: 13 },
  splint: { name: "Splint Armor", base: 17, kind: "heavy", stealth: true, str: 15 },
  plate: { name: "Plate Armor", base: 18, kind: "heavy", stealth: true, str: 15 }
};

const CONDITIONS = ["Blinded", "Charmed", "Deafened", "Frightened", "Grappled", "Incapacitated", "Invisible", "Paralyzed", "Petrified", "Poisoned", "Prone", "Restrained", "Stunned", "Unconscious", "Concentrating", "Raging"];

// ---------- CLASSES ----------
// features: {level: [names]}  "@sub" = subclass feature level, "@asi" = Ability Score Improvement, "@boon" = Epic Boon
// resources: [{key,name,reset:'SR'|'LR',n:array|fn(lvl,char) , die?}]
// pools: {poolKey: step-spec of how many picks this class grants}
const CLASSES = {
  barbarian: {
    name: "Barbarian", hd: 12, primary: ["str"], saves: ["str", "con"],
    skills: { n: 2, from: ["Animal Handling", "Athletics", "Intimidation", "Nature", "Perception", "Survival"] },
    armor: ["Light armor", "Medium armor", "Shields"], wprof: ["simple", "martial"], tools: [],
    mc: { skills: 0, armor: ["Shields"], wprof: ["martial"] },
    unarmored: ["con"],
    features: {
      1: ["Rage", "Unarmored Defense", "Weapon Mastery"], 2: ["Danger Sense", "Reckless Attack"], 3: ["@sub", "Primal Knowledge"], 4: ["@asi"],
      5: ["Extra Attack", "Fast Movement"], 6: ["@sub"], 7: ["Feral Instinct", "Instinctive Pounce"], 8: ["@asi"], 9: ["Brutal Strike"], 10: ["@sub"],
      11: ["Relentless Rage"], 12: ["@asi"], 13: ["Improved Brutal Strike"], 14: ["@sub"], 15: ["Persistent Rage"], 16: ["@asi"],
      17: ["Improved Brutal Strike"], 18: ["Indomitable Might"], 19: ["@boon"], 20: ["Primal Champion"]
    },
    resources: [{ key: "rage", name: "Rage", feature: "Rage", reset: "LR", note: "regain 1 on Short Rest", n: step({ 1: 2, 3: 3, 6: 4, 12: 5, 17: 6 }) }],
    notes: { "Rage": l => `Rage Damage +${step({ 1: 2, 9: 3, 16: 4 })[l - 1]}` },
    pools: { mastery: step({ 1: 2, 4: 3, 10: 4 }), primalKnowledge: step({ 3: 1 }) },
    subclasses: {
      berserker: { name: "Path of the Berserker", features: { 3: ["Frenzy"], 6: ["Mindless Rage"], 10: ["Retaliation"], 14: ["Intimidating Presence"] } },
      wildheart: { name: "Path of the Wild Heart", features: { 3: ["Animal Speaker", "Rage of the Wilds"], 6: ["Aspect of the Wilds"], 10: ["Nature Speaker"], 14: ["Power of the Wilds"] } },
      worldtree: { name: "Path of the World Tree", features: { 3: ["Vitality of the Tree"], 6: ["Branches of the Tree"], 10: ["Battering Roots"], 14: ["Travel along the Tree"] } },
      zealot: { name: "Path of the Zealot", features: { 3: ["Divine Fury", "Warrior of the Gods"], 6: ["Fanatical Focus"], 10: ["Zealous Presence"], 14: ["Rage of the Gods"] } }
    }
  },
  bard: {
    name: "Bard", hd: 8, primary: ["cha"], saves: ["dex", "cha"],
    skills: { n: 3, from: ALL_SKILLS },
    armor: ["Light armor"], wprof: ["simple"], tools: ["Three Musical Instruments of your choice"],
    mc: { skills: 1, armor: ["Light armor"], wprof: [], tools: ["One Musical Instrument"] },
    caster: { type: "full", ability: "cha", cantrips: step({ 1: 2, 4: 3, 10: 4 }), prepared: PREP.full },
    features: {
      1: ["Bardic Inspiration", "Spellcasting"], 2: ["Expertise", "Jack of All Trades"], 3: ["@sub"], 4: ["@asi"], 5: ["Font of Inspiration"],
      6: ["@sub"], 7: ["Countercharm"], 8: ["@asi"], 9: ["Expertise"], 10: ["Magical Secrets"], 12: ["@asi"], 14: ["@sub"], 16: ["@asi"],
      18: ["Superior Inspiration"], 19: ["@boon"], 20: ["Words of Creation"]
    },
    resources: [{ key: "bardic", name: "Bardic Inspiration", feature: "Bardic Inspiration", reset: l => l >= 5 ? "SR" : "LR", n: (l, c) => Math.max(1, c.mod.cha), die: l => "d" + step({ 1: 6, 5: 8, 10: 10, 15: 12 })[l - 1] }],
    pools: { expertise: step({ 2: 2, 9: 4 }) },
    jack: 2,
    subclasses: {
      dance: { name: "College of Dance", features: { 3: ["Dazzling Footwork"], 6: ["Inspiring Movement", "Tandem Footwork"], 14: ["Leading Evasion"] } },
      glamour: { name: "College of Glamour", features: { 3: ["Beguiling Magic", "Mantle of Inspiration"], 6: ["Mantle of Majesty"], 14: ["Unbreakable Majesty"] } },
      lore: { name: "College of Lore", features: { 3: ["Bonus Proficiencies", "Cutting Words"], 6: ["Magical Discoveries"], 14: ["Peerless Skill"] }, pools: { skillsLore: step({ 3: 3 }) } },
      valor: { name: "College of Valor", features: { 3: ["Combat Inspiration", "Martial Training"], 6: ["Extra Attack"], 14: ["Battle Magic"] }, armor: ["Medium armor", "Shields"], wprof: ["martial"] }
    }
  },
  cleric: {
    name: "Cleric", hd: 8, primary: ["wis"], saves: ["wis", "cha"],
    skills: { n: 2, from: ["History", "Insight", "Medicine", "Persuasion", "Religion"] },
    armor: ["Light armor", "Medium armor", "Shields"], wprof: ["simple"], tools: [],
    mc: { skills: 0, armor: ["Light armor", "Medium armor", "Shields"], wprof: [] },
    caster: { type: "full", ability: "wis", cantrips: step({ 1: 3, 4: 4, 10: 5 }), prepared: PREP.full },
    features: {
      1: ["Spellcasting", "Divine Order"], 2: ["Channel Divinity"], 3: ["@sub"], 4: ["@asi"], 5: ["Sear Undead"], 6: ["@sub"], 7: ["Blessed Strikes"],
      8: ["@asi"], 10: ["Divine Intervention"], 12: ["@asi"], 14: ["Improved Blessed Strikes"], 16: ["@asi"], 17: ["@sub"], 19: ["@boon"], 20: ["Greater Divine Intervention"]
    },
    resources: [{ key: "channel", name: "Channel Divinity", feature: "Channel Divinity", reset: "LR", note: "regain 1 on Short Rest", n: step({ 2: 2, 6: 3, 18: 4 }) },
    { key: "divint", name: "Divine Intervention", feature: "Divine Intervention", reset: "LR", n: step({ 10: 1 }) }],
    pools: { divineOrder: step({ 1: 1 }) },
    subclasses: {
      life: { name: "Life Domain", features: { 3: ["Disciple of Life", "Life Domain Spells", "Preserve Life"], 6: ["Blessed Healer"], 17: ["Supreme Healing"] }, spells: { 3: ["Aid", "Bless", "Cure Wounds", "Lesser Restoration"], 5: ["Mass Healing Word", "Revivify"], 7: ["Aura of Life", "Death Ward"], 9: ["Greater Restoration", "Mass Cure Wounds"] } },
      light: { name: "Light Domain", features: { 3: ["Light Domain Spells", "Radiance of the Dawn", "Warding Flare"], 6: ["Improved Warding Flare"], 17: ["Corona of Light"] }, spells: { 3: ["Burning Hands", "Faerie Fire", "Scorching Ray", "See Invisibility"], 5: ["Daylight", "Fireball"], 7: ["Arcane Eye", "Wall of Fire"], 9: ["Flame Strike", "Scrying"] }, resources: [{ key: "flare", name: "Warding Flare", feature: "Warding Flare", reset: "LR", n: (l, c) => Math.max(1, c.mod.wis) }] },
      trickery: { name: "Trickery Domain", features: { 3: ["Blessing of the Trickster", "Invoke Duplicity", "Trickery Domain Spells"], 6: ["Trickster's Transposition"], 17: ["Improved Duplicity"] }, spells: { 3: ["Charm Person", "Disguise Self", "Invisibility", "Pass without Trace"], 5: ["Hypnotic Pattern", "Nondetection"], 7: ["Confusion", "Dimension Door"], 9: ["Dominate Person", "Modify Memory"] } },
      war: { name: "War Domain", features: { 3: ["Guided Strike", "War Domain Spells", "War Priest"], 6: ["War God's Blessing"], 17: ["Avatar of Battle"] }, spells: { 3: ["Guiding Bolt", "Magic Weapon", "Shield of Faith", "Spiritual Weapon"], 5: ["Crusader's Mantle", "Spirit Guardians"], 7: ["Fire Shield", "Freedom of Movement"], 9: ["Hold Monster", "Steel Wind Strike"] }, resources: [{ key: "warpriest", name: "War Priest", feature: "War Priest", reset: "SR", n: (l, c) => Math.max(1, c.mod.wis) }] }
    }
  },
  druid: {
    name: "Druid", hd: 8, primary: ["wis"], saves: ["int", "wis"],
    skills: { n: 2, from: ["Arcana", "Animal Handling", "Insight", "Medicine", "Nature", "Perception", "Religion", "Survival"] },
    armor: ["Light armor", "Shields"], wprof: ["simple"], tools: ["Herbalism Kit"],
    mc: { skills: 0, armor: ["Light armor", "Shields"], wprof: [] },
    caster: { type: "full", ability: "wis", cantrips: step({ 1: 2, 4: 3, 10: 4 }), prepared: PREP.full },
    features: {
      1: ["Spellcasting", "Druidic", "Primal Order"], 2: ["Wild Shape", "Wild Companion"], 3: ["@sub"], 4: ["@asi"], 5: ["Wild Resurgence"], 6: ["@sub"],
      7: ["Elemental Fury"], 8: ["@asi"], 10: ["@sub"], 12: ["@asi"], 14: ["@sub"], 15: ["Improved Elemental Fury"], 16: ["@asi"], 18: ["Beast Spells"], 19: ["@boon"], 20: ["Archdruid"]
    },
    resources: [{ key: "wildshape", name: "Wild Shape", feature: "Wild Shape", reset: "LR", note: "regain 1 on Short Rest", n: step({ 2: 2, 6: 3, 17: 4 }) }],
    pools: { primalOrder: step({ 1: 1 }) },
    subclasses: {
      land: { name: "Circle of the Land", features: { 3: ["Circle of the Land Spells", "Land's Aid"], 6: ["Natural Recovery"], 10: ["Nature's Ward"], 14: ["Nature's Sanctuary"] } },
      moon: { name: "Circle of the Moon", features: { 3: ["Circle Forms", "Circle of the Moon Spells"], 6: ["Improved Circle Forms"], 10: ["Moonlight Step"], 14: ["Lunar Form"] }, spells: { 3: ["Cure Wounds", "Moonbeam", "Starry Wisp"], 5: ["Conjure Animals"], 7: ["Fount of Moonlight"], 9: ["Mass Cure Wounds"] } },
      sea: { name: "Circle of the Sea", features: { 3: ["Circle of the Sea Spells", "Wrath of the Sea"], 6: ["Aquatic Affinity"], 10: ["Stormborn"], 14: ["Oceanic Gift"] }, spells: { 3: ["Fog Cloud", "Gust of Wind", "Ray of Frost", "Shatter", "Thunderwave"], 5: ["Lightning Bolt", "Water Breathing"], 7: ["Control Water", "Ice Storm"], 9: ["Conjure Elementals", "Hold Monster"] } },
      stars: { name: "Circle of the Stars", features: { 3: ["Star Map", "Starry Form"], 6: ["Cosmic Omen"], 10: ["Twinkling Constellations"], 14: ["Full of Stars"] }, spells: { 3: ["Guidance", "Guiding Bolt"] } }
    }
  },
  fighter: {
    name: "Fighter", hd: 10, primary: ["str", "dex"], saves: ["str", "con"],
    skills: { n: 2, from: ["Acrobatics", "Animal Handling", "Athletics", "History", "Insight", "Intimidation", "Persuasion", "Perception", "Survival"] },
    armor: ["Light armor", "Medium armor", "Heavy armor", "Shields"], wprof: ["simple", "martial"], tools: [],
    mc: { skills: 0, armor: ["Light armor", "Medium armor", "Shields"], wprof: ["martial"] },
    asi: [4, 6, 8, 12, 14, 16],
    features: {
      1: ["Fighting Style", "Second Wind", "Weapon Mastery"], 2: ["Action Surge", "Tactical Mind"], 3: ["@sub"], 4: ["@asi"], 5: ["Extra Attack", "Tactical Shift"],
      6: ["@asi"], 7: ["@sub"], 8: ["@asi"], 9: ["Indomitable", "Tactical Master"], 10: ["@sub"], 11: ["Two Extra Attacks"], 12: ["@asi"], 13: ["Studied Attacks"],
      14: ["@asi"], 15: ["@sub"], 16: ["@asi"], 18: ["@sub"], 19: ["@boon"], 20: ["Three Extra Attacks"]
    },
    resources: [
      { key: "secondwind", name: "Second Wind", feature: "Second Wind", reset: "LR", note: "regain 1 on Short Rest", n: step({ 1: 2, 4: 3, 10: 4 }) },
      { key: "surge", name: "Action Surge", feature: "Action Surge", reset: "SR", n: step({ 2: 1, 17: 2 }) },
      { key: "indomitable", name: "Indomitable", feature: "Indomitable", reset: "LR", n: step({ 9: 1, 13: 2, 17: 3 }) }],
    notes: { "Second Wind": l => `heal 1d10 + ${l}` },
    pools: { mastery: step({ 1: 3, 4: 4, 10: 5, 16: 6 }), fightingStyle: step({ 1: 1 }) },
    subclasses: {
      battlemaster: { name: "Battle Master", features: { 3: ["Combat Superiority", "Student of War"], 7: ["Know Your Enemy"], 10: ["Improved Combat Superiority"], 15: ["Relentless"], 18: ["Ultimate Combat Superiority"] },
        resources: [{ key: "superiority", name: "Superiority Dice", feature: "Combat Superiority", reset: "SR", n: step({ 3: 4, 7: 5, 15: 6 }), die: l => "d" + step({ 3: 8, 10: 10, 18: 12 })[l - 1] }],
        pools: { maneuvers: step({ 3: 3, 7: 5, 10: 7, 15: 9 }) } },
      champion: { name: "Champion", features: { 3: ["Improved Critical", "Remarkable Athlete"], 7: ["Additional Fighting Style"], 10: ["Heroic Warrior"], 15: ["Superior Critical"], 18: ["Survivor"] }, pools: { fightingStyle: step({ 7: 1 }) } },
      eldritchknight: { name: "Eldritch Knight", caster: { type: "third", ability: "int", cantrips: step({ 3: 2, 10: 3 }), prepared: PREP.third, list: "wizard" },
        features: { 3: ["Spellcasting", "War Bond"], 7: ["War Magic"], 10: ["Eldritch Strike"], 15: ["Arcane Charge"], 18: ["Improved War Magic"] } },
      psiwarrior: { name: "Psi Warrior", features: { 3: ["Psionic Power"], 7: ["Telekinetic Adept"], 10: ["Guarded Mind"], 15: ["Bulwark of Force"], 18: ["Telekinetic Master"] },
        resources: [{ key: "psi", name: "Psionic Energy Dice", feature: "Psionic Power", reset: "LR", note: "regain 1 on Short Rest", n: step({ 3: 4, 5: 6, 9: 8, 13: 10, 17: 12 }), die: l => "d" + step({ 3: 6, 5: 8, 11: 10, 17: 12 })[l - 1] }] }
    }
  },
  monk: {
    name: "Monk", hd: 8, primary: ["dex", "wis"], saves: ["str", "dex"],
    skills: { n: 2, from: ["Acrobatics", "Athletics", "History", "Insight", "Religion", "Stealth"] },
    armor: [], wprof: ["simple", "martialL"], tools: ["One Artisan's Tool or Musical Instrument"],
    mc: { skills: 0, armor: [], wprof: [] },
    unarmored: ["wis"], noShield: true,
    features: {
      1: ["Martial Arts", "Unarmored Defense"], 2: ["Monk's Focus", "Unarmored Movement", "Uncanny Metabolism"], 3: ["Deflect Attacks", "@sub"], 4: ["@asi", "Slow Fall"],
      5: ["Extra Attack", "Stunning Strike"], 6: ["Empowered Strikes", "@sub"], 7: ["Evasion"], 8: ["@asi"], 9: ["Acrobatic Movement"], 10: ["Heightened Focus", "Self-Restoration"],
      11: ["@sub"], 12: ["@asi"], 13: ["Deflect Energy"], 14: ["Disciplined Survivor"], 15: ["Perfect Focus"], 16: ["@asi"], 17: ["@sub"], 18: ["Superior Defense"], 19: ["@boon"], 20: ["Body and Mind"]
    },
    resources: [{ key: "focus", name: "Focus Points", feature: "Monk's Focus", reset: "SR", n: l => l >= 2 ? l : 0 },
    { key: "metabolism", name: "Uncanny Metabolism", feature: "Uncanny Metabolism", reset: "LR", n: step({ 2: 1 }) }],
    notes: { "Martial Arts": l => `Martial Arts die d${step({ 1: 6, 5: 8, 11: 10, 17: 12 })[l - 1]}`, "Unarmored Movement": l => `+${step({ 2: 10, 6: 15, 10: 20, 14: 25, 18: 30 })[l - 1]} ft speed` },
    speedBonus: l => step({ 1: 0, 2: 10, 6: 15, 10: 20, 14: 25, 18: 30 })[l - 1],
    subclasses: {
      mercy: { name: "Warrior of Mercy", features: { 3: ["Hand of Harm", "Hand of Healing", "Implements of Mercy"], 6: ["Physician's Touch"], 11: ["Flurry of Healing and Harm"], 17: ["Hand of Ultimate Mercy"] } },
      shadow: { name: "Warrior of Shadow", features: { 3: ["Shadow Arts"], 6: ["Shadow Step"], 11: ["Improved Shadow Step"], 17: ["Cloak of Shadows"] } },
      elements: { name: "Warrior of the Elements", features: { 3: ["Elemental Attunement", "Manipulate Elements"], 6: ["Elemental Burst"], 11: ["Stride of the Elements"], 17: ["Elemental Epitome"] } },
      openhand: { name: "Warrior of the Open Hand", features: { 3: ["Open Hand Technique"], 6: ["Wholeness of Body"], 11: ["Fleet Step"], 17: ["Quivering Palm"] } }
    }
  },
  paladin: {
    name: "Paladin", hd: 10, primary: ["str", "cha"], saves: ["wis", "cha"],
    skills: { n: 2, from: ["Athletics", "Insight", "Intimidation", "Medicine", "Persuasion", "Religion"] },
    armor: ["Light armor", "Medium armor", "Heavy armor", "Shields"], wprof: ["simple", "martial"], tools: [],
    mc: { skills: 0, armor: ["Light armor", "Medium armor", "Shields"], wprof: ["martial"] },
    caster: { type: "half", ability: "cha", cantrips: step({}), prepared: PREP.half },
    features: {
      1: ["Lay On Hands", "Spellcasting", "Weapon Mastery"], 2: ["Fighting Style", "Paladin's Smite"], 3: ["Channel Divinity", "@sub"], 4: ["@asi"], 5: ["Extra Attack", "Faithful Steed"],
      6: ["Aura of Protection"], 7: ["@sub"], 8: ["@asi"], 9: ["Abjure Foes"], 10: ["Aura of Courage"], 11: ["Radiant Strikes"], 12: ["@asi"], 14: ["Restoring Touch"],
      15: ["@sub"], 16: ["@asi"], 18: ["Aura Expansion"], 19: ["@boon"], 20: ["@sub"]
    },
    resources: [{ key: "layonhands", name: "Lay On Hands (HP pool)", feature: "Lay On Hands", reset: "LR", n: l => 5 * l },
    { key: "channel", name: "Channel Divinity", feature: "Channel Divinity", reset: "LR", note: "regain 1 on Short Rest", n: step({ 3: 2, 11: 3 }) },
    { key: "smite", name: "Paladin's Smite (free cast)", feature: "Paladin's Smite", reset: "LR", n: step({ 2: 1 }) }],
    pools: { mastery: step({ 1: 2 }), fightingStyle: step({ 2: 1 }) },
    fightingStyleExtra: ["Blessed Warrior"],
    notes: { "Aura of Protection": (l, c) => `+${Math.max(1, c.mod.cha)} to saves (${l >= 18 ? 30 : 10} ft)` },
    subclasses: {
      devotion: { name: "Oath of Devotion", features: { 3: ["Oath of Devotion Spells", "Sacred Weapon"], 7: ["Aura of Devotion"], 15: ["Smite of Protection"], 20: ["Holy Nimbus"] }, spells: { 3: ["Protection from Evil and Good", "Shield of Faith"], 5: ["Aid", "Zone of Truth"], 9: ["Beacon of Hope", "Dispel Magic"], 13: ["Freedom of Movement", "Guardian of Faith"], 17: ["Commune", "Flame Strike"] } },
      glory: { name: "Oath of Glory", features: { 3: ["Inspiring Smite", "Oath of Glory Spells", "Peerless Athlete"], 7: ["Aura of Alacrity"], 15: ["Glorious Defense"], 20: ["Living Legend"] }, spells: { 3: ["Guiding Bolt", "Heroism"], 5: ["Enhance Ability", "Magic Weapon"], 9: ["Haste", "Protection from Energy"], 13: ["Compulsion", "Freedom of Movement"], 17: ["Legend Lore", "Yolande's Regal Presence"] } },
      ancients: { name: "Oath of the Ancients", features: { 3: ["Nature's Wrath", "Oath of the Ancients Spells"], 7: ["Aura of Warding"], 15: ["Undying Sentinel"], 20: ["Elder Champion"] }, spells: { 3: ["Ensnaring Strike", "Speak with Animals"], 5: ["Misty Step", "Moonbeam"], 9: ["Plant Growth", "Protection from Energy"], 13: ["Ice Storm", "Stoneskin"], 17: ["Commune with Nature", "Tree Stride"] } },
      vengeance: { name: "Oath of Vengeance", features: { 3: ["Oath of Vengeance Spells", "Vow of Enmity"], 7: ["Relentless Avenger"], 15: ["Soul of Vengeance"], 20: ["Avenging Angel"] }, spells: { 3: ["Bane", "Hunter's Mark"], 5: ["Hold Person", "Misty Step"], 9: ["Haste", "Protection from Energy"], 13: ["Banishment", "Dimension Door"], 17: ["Hold Monster", "Scrying"] } }
    }
  },
  ranger: {
    name: "Ranger", hd: 10, primary: ["dex", "wis"], saves: ["str", "dex"],
    skills: { n: 3, from: ["Animal Handling", "Athletics", "Insight", "Investigation", "Nature", "Perception", "Stealth", "Survival"] },
    armor: ["Light armor", "Medium armor", "Shields"], wprof: ["simple", "martial"], tools: [],
    mc: { skills: 1, armor: ["Light armor", "Medium armor", "Shields"], wprof: ["martial"] },
    caster: { type: "half", ability: "wis", cantrips: step({}), prepared: PREP.half },
    features: {
      1: ["Spellcasting", "Favored Enemy", "Weapon Mastery"], 2: ["Deft Explorer", "Fighting Style"], 3: ["@sub"], 4: ["@asi"], 5: ["Extra Attack"], 6: ["Roving"],
      7: ["@sub"], 8: ["@asi"], 9: ["Expertise"], 10: ["Tireless"], 11: ["@sub"], 12: ["@asi"], 13: ["Relentless Hunter"], 14: ["Nature's Veil"], 15: ["@sub"], 16: ["@asi"],
      17: ["Precise Hunter"], 18: ["Feral Senses"], 19: ["@boon"], 20: ["Foe Slayer"]
    },
    resources: [{ key: "favored", name: "Favored Enemy (Hunter's Mark)", feature: "Favored Enemy", reset: "LR", n: step({ 1: 2, 5: 3, 9: 4, 13: 5, 17: 6 }) }],
    pools: { mastery: step({ 1: 2 }), fightingStyle: step({ 2: 1 }), expertise: step({ 2: 1, 9: 3 }) },
    fightingStyleExtra: ["Druidic Warrior"],
    speedBonus: l => l >= 6 ? 10 : 0,
    subclasses: {
      beastmaster: { name: "Beast Master", features: { 3: ["Primal Companion"], 7: ["Exceptional Training"], 11: ["Bestial Fury"], 15: ["Share Spells"] } },
      feywanderer: { name: "Fey Wanderer", features: { 3: ["Dreadful Strikes", "Fey Wanderer Spells", "Otherworldly Glamour"], 7: ["Beguiling Twist"], 11: ["Fey Reinforcements"], 15: ["Misty Wanderer"] }, spells: { 3: ["Charm Person"], 5: ["Misty Step"], 9: ["Summon Fey"], 13: ["Dimension Door"], 17: ["Mislead"] } },
      gloomstalker: { name: "Gloom Stalker", features: { 3: ["Dread Ambusher", "Gloom Stalker Spells", "Umbral Sight"], 7: ["Iron Mind"], 11: ["Stalker's Flurry"], 15: ["Shadowy Dodge"] }, spells: { 3: ["Disguise Self"], 5: ["Rope Trick"], 9: ["Fear"], 13: ["Greater Invisibility"], 17: ["Seeming"] } },
      hunter: { name: "Hunter", features: { 3: ["Hunter's Lore", "Hunter's Prey"], 7: ["Defensive Tactics"], 11: ["Superior Hunter's Prey"], 15: ["Superior Hunter's Defense"] } }
    }
  },
  rogue: {
    name: "Rogue", hd: 8, primary: ["dex"], saves: ["dex", "int"],
    skills: { n: 4, from: ["Acrobatics", "Athletics", "Deception", "Insight", "Intimidation", "Investigation", "Perception", "Persuasion", "Sleight of Hand", "Stealth"] },
    armor: ["Light armor"], wprof: ["simple", "martialFL"], tools: ["Thieves' Tools"],
    mc: { skills: 1, armor: ["Light armor"], wprof: [], tools: ["Thieves' Tools"] },
    asi: [4, 8, 10, 12, 16],
    features: {
      1: ["Expertise", "Sneak Attack", "Thieves' Cant", "Weapon Mastery"], 2: ["Cunning Action"], 3: ["@sub", "Steady Aim"], 4: ["@asi"], 5: ["Cunning Strike", "Uncanny Dodge"],
      6: ["Expertise"], 7: ["Evasion", "Reliable Talent"], 8: ["@asi"], 9: ["@sub"], 10: ["@asi"], 11: ["Improved Cunning Strike"], 12: ["@asi"], 13: ["@sub"],
      14: ["Devious Strikes"], 15: ["Slippery Mind"], 16: ["@asi"], 17: ["@sub"], 18: ["Elusive"], 19: ["@boon"], 20: ["Stroke of Luck"]
    },
    notes: { "Sneak Attack": l => `${Math.ceil(l / 2)}d6` },
    resources: [{ key: "strokeofluck", name: "Stroke of Luck", feature: "Stroke of Luck", reset: "SR", n: step({ 20: 1 }) }],
    pools: { mastery: step({ 1: 2 }), expertise: step({ 1: 2, 6: 4 }) },
    subclasses: {
      arcanetrickster: { name: "Arcane Trickster", caster: { type: "third", ability: "int", cantrips: step({ 3: 3, 10: 4 }), prepared: PREP.third, list: "wizard" },
        features: { 3: ["Spellcasting", "Mage Hand Legerdemain"], 9: ["Magical Ambush"], 13: ["Versatile Trickster"], 17: ["Spell Thief"] } },
      assassin: { name: "Assassin", features: { 3: ["Assassinate", "Assassin's Tools"], 9: ["Infiltration Expertise"], 13: ["Envenom Weapons"], 17: ["Death Strike"] } },
      soulknife: { name: "Soulknife", features: { 3: ["Psionic Power", "Psychic Blades"], 9: ["Soul Blades"], 13: ["Psychic Veil"], 17: ["Rend Mind"] },
        resources: [{ key: "psi", name: "Psionic Energy Dice", feature: "Psionic Power", reset: "LR", note: "regain 1 on Short Rest", n: step({ 3: 4, 5: 6, 9: 8, 13: 10, 17: 12 }), die: l => "d" + step({ 3: 6, 5: 8, 11: 10, 17: 12 })[l - 1] }] },
      thief: { name: "Thief", features: { 3: ["Fast Hands", "Second-Story Work"], 9: ["Supreme Sneak"], 13: ["Use Magic Device"], 17: ["Thief's Reflexes"] } }
    }
  },
  sorcerer: {
    name: "Sorcerer", hd: 6, primary: ["cha"], saves: ["con", "cha"],
    skills: { n: 2, from: ["Arcana", "Deception", "Insight", "Intimidation", "Persuasion", "Religion"] },
    armor: [], wprof: ["simple"], tools: [],
    mc: { skills: 0, armor: [], wprof: [] },
    caster: { type: "full", ability: "cha", cantrips: step({ 1: 4, 4: 5, 10: 6 }), prepared: PREP.sorcerer },
    features: {
      1: ["Spellcasting", "Innate Sorcery"], 2: ["Font of Magic", "Metamagic"], 3: ["@sub"], 4: ["@asi"], 5: ["Sorcerous Restoration"], 6: ["@sub"], 7: ["Sorcery Incarnate"],
      8: ["@asi"], 10: ["Metamagic"], 12: ["@asi"], 14: ["@sub"], 16: ["@asi"], 17: ["Metamagic"], 18: ["@sub"], 19: ["@boon"], 20: ["Arcane Apotheosis"]
    },
    resources: [{ key: "sorcery", name: "Sorcery Points", feature: "Font of Magic", reset: "LR", n: l => l >= 2 ? l : 0 },
    { key: "innate", name: "Innate Sorcery", feature: "Innate Sorcery", reset: "LR", n: step({ 1: 2 }) },
    { key: "restoration", name: "Sorcerous Restoration", feature: "Sorcerous Restoration", reset: "LR", n: step({ 5: 1 }) }],
    pools: { metamagic: step({ 2: 2, 10: 4, 17: 6 }) },
    subclasses: {
      aberrant: { name: "Aberrant Sorcery", features: { 3: ["Psionic Spells", "Telepathic Speech"], 6: ["Psionic Sorcery", "Psychic Defenses"], 14: ["Revelation in Flesh"], 18: ["Warping Implosion"] }, spells: { 3: ["Arms of Hadar", "Calm Emotions", "Detect Thoughts", "Dissonant Whispers", "Mind Sliver"], 5: ["Hunger of Hadar", "Sending"], 7: ["Evard's Black Tentacles", "Summon Aberration"], 9: ["Rary's Telepathic Bond", "Telekinesis"] } },
      clockwork: { name: "Clockwork Sorcery", features: { 3: ["Clockwork Spells", "Restore Balance"], 6: ["Bastion of Law"], 14: ["Trance of Order"], 18: ["Clockwork Cavalcade"] }, spells: { 3: ["Aid", "Alarm", "Lesser Restoration", "Protection from Evil and Good"], 5: ["Dispel Magic", "Protection from Energy"], 7: ["Freedom of Movement", "Summon Construct"], 9: ["Greater Restoration", "Wall of Force"] } },
      draconic: { name: "Draconic Sorcery", features: { 3: ["Draconic Resilience", "Draconic Spells"], 6: ["Elemental Affinity"], 14: ["Dragon Wings"], 18: ["Dragon Companion"] }, unarmored: ["cha"], hpPerLevel: 1, spells: { 3: ["Alter Self", "Chromatic Orb", "Command", "Dragon's Breath"], 5: ["Fear", "Fly"], 7: ["Arcane Eye", "Charm Monster"], 9: ["Legend Lore", "Summon Dragon"] } },
      wildmagic: { name: "Wild Magic Sorcery", features: { 3: ["Wild Magic Surge", "Tides of Chaos"], 6: ["Bend Luck"], 14: ["Controlled Chaos"], 18: ["Tamed Surge"] }, resources: [{ key: "tides", name: "Tides of Chaos", feature: "Tides of Chaos", reset: "LR", n: step({ 3: 1 }) }] }
    }
  },
  warlock: {
    name: "Warlock", hd: 8, primary: ["cha"], saves: ["wis", "cha"],
    skills: { n: 2, from: ["Arcana", "Deception", "History", "Intimidation", "Investigation", "Nature", "Religion"] },
    armor: ["Light armor"], wprof: ["simple"], tools: [],
    mc: { skills: 0, armor: ["Light armor"], wprof: [] },
    caster: { type: "pact", ability: "cha", cantrips: step({ 1: 2, 4: 3, 10: 4 }), prepared: PREP.warlock },
    pact: { n: step({ 1: 1, 2: 2, 11: 3, 17: 4 }), lvl: step({ 1: 1, 3: 2, 5: 3, 7: 4, 9: 5 }) },
    features: {
      1: ["Eldritch Invocations", "Pact Magic"], 2: ["Magical Cunning"], 3: ["@sub"], 4: ["@asi"], 6: ["@sub"], 8: ["@asi"], 9: ["Contact Patron"], 10: ["@sub"],
      11: ["Mystic Arcanum"], 12: ["@asi"], 14: ["@sub"], 16: ["@asi"], 19: ["@boon"], 20: ["Eldritch Master"]
    },
    notes: { "Mystic Arcanum": l => "spell levels: " + [[11, 6], [13, 7], [15, 8], [17, 9]].filter(x => l >= x[0]).map(x => x[1]).join(", ") },
    resources: [{ key: "cunning", name: "Magical Cunning", feature: "Magical Cunning", reset: "LR", n: step({ 2: 1 }) },
    { key: "patron", name: "Contact Patron", feature: "Contact Patron", reset: "LR", n: step({ 9: 1 }) },
    { key: "arc6", name: "Mystic Arcanum (6th)", feature: "Mystic Arcanum", reset: "LR", n: step({ 11: 1 }) },
    { key: "arc7", name: "Mystic Arcanum (7th)", feature: "Mystic Arcanum", reset: "LR", n: step({ 13: 1 }) },
    { key: "arc8", name: "Mystic Arcanum (8th)", feature: "Mystic Arcanum", reset: "LR", n: step({ 15: 1 }) },
    { key: "arc9", name: "Mystic Arcanum (9th)", feature: "Mystic Arcanum", reset: "LR", n: step({ 17: 1 }) }],
    pools: { invocations: step({ 1: 1, 2: 3, 5: 5, 7: 6, 9: 7, 12: 8, 15: 9, 18: 10 }) },
    subclasses: {
      archfey: { name: "Archfey Patron", features: { 3: ["Archfey Spells", "Steps of the Fey"], 6: ["Misty Escape"], 10: ["Beguiling Defenses"], 14: ["Bewitching Magic"] }, spells: { 3: ["Calm Emotions", "Faerie Fire", "Misty Step", "Phantasmal Force", "Sleep"], 5: ["Blink", "Plant Growth"], 7: ["Dominate Beast", "Greater Invisibility"], 9: ["Dominate Person", "Seeming"] },
        resources: [{ key: "fey", name: "Steps of the Fey", feature: "Steps of the Fey", reset: "LR", n: (l, c) => Math.max(1, c.mod.cha) }] },
      celestial: { name: "Celestial Patron", features: { 3: ["Celestial Spells", "Healing Light"], 6: ["Radiant Soul"], 10: ["Celestial Resilience"], 14: ["Searing Vengeance"] }, spells: { 3: ["Aid", "Cure Wounds", "Guiding Bolt", "Lesser Restoration", "Light", "Sacred Flame"], 5: ["Daylight", "Revivify"], 7: ["Guardian of Faith", "Wall of Fire"], 9: ["Greater Restoration", "Summon Celestial"] },
        resources: [{ key: "healinglight", name: "Healing Light (d6 pool)", feature: "Healing Light", reset: "LR", n: l => 1 + l }] },
      fiend: { name: "Fiend Patron", features: { 3: ["Dark One's Blessing", "Fiend Spells"], 6: ["Dark One's Own Luck"], 10: ["Fiendish Resilience"], 14: ["Hurl Through Hell"] }, spells: { 3: ["Burning Hands", "Command", "Scorching Ray", "Suggestion"], 5: ["Fireball", "Stinking Cloud"], 7: ["Fire Shield", "Wall of Fire"], 9: ["Geas", "Insect Plague"] },
        resources: [{ key: "darkluck", name: "Dark One's Own Luck", feature: "Dark One's Own Luck", reset: "LR", n: (l, c) => l >= 6 ? Math.max(1, c.mod.cha) : 0 }] },
      greatoldone: { name: "Great Old One Patron", features: { 3: ["Awakened Mind", "Great Old One Spells", "Psychic Spells"], 6: ["Clairvoyant Combatant"], 10: ["Eldritch Hex", "Thought Shield"], 14: ["Create Thrall"] }, spells: { 3: ["Detect Thoughts", "Dissonant Whispers", "Phantasmal Force", "Tasha's Hideous Laughter"], 5: ["Clairvoyance", "Hunger of Hadar"], 7: ["Confusion", "Summon Aberration"], 9: ["Modify Memory", "Telekinesis"] } }
    }
  },
  wizard: {
    name: "Wizard", hd: 6, primary: ["int"], saves: ["int", "wis"],
    skills: { n: 2, from: ["Arcana", "History", "Insight", "Investigation", "Medicine", "Nature", "Religion"] },
    armor: [], wprof: ["simple"], tools: [],
    mc: { skills: 0, armor: [], wprof: [] },
    caster: { type: "full", ability: "int", cantrips: step({ 1: 3, 4: 4, 10: 5 }), prepared: PREP.wizard },
    features: {
      1: ["Spellcasting", "Ritual Adept", "Arcane Recovery"], 2: ["Scholar"], 3: ["@sub"], 4: ["@asi"], 5: ["Memorize Spell"], 6: ["@sub"], 8: ["@asi"], 10: ["@sub"],
      12: ["@asi"], 14: ["@sub"], 16: ["@asi"], 18: ["Spell Mastery"], 19: ["@boon"], 20: ["Signature Spells"]
    },
    resources: [{ key: "arcrec", name: "Arcane Recovery", feature: "Arcane Recovery", reset: "LR", n: step({ 1: 1 }) }],
    notes: { "Arcane Recovery": l => `recover up to ${Math.ceil(l / 2)} levels of slots` },
    pools: { expertise: step({ 2: 1 }) },
    subclasses: {
      abjurer: { name: "Abjurer", features: { 3: ["Abjuration Savant", "Arcane Ward"], 6: ["Projected Ward"], 10: ["Spell Breaker"], 14: ["Spell Resistance"] }, notes: { "Arcane Ward": (l, c) => `Ward HP ${2 * l + c.mod.int}` } },
      diviner: { name: "Diviner", features: { 3: ["Divination Savant", "Portent"], 6: ["Expert Divination"], 10: ["The Third Eye"], 14: ["Greater Portent"] }, resources: [{ key: "portent", name: "Portent dice", feature: "Portent", reset: "LR", n: step({ 3: 2, 14: 3 }) }] },
      evoker: { name: "Evoker", features: { 3: ["Evocation Savant", "Potent Cantrip"], 6: ["Sculpt Spells"], 10: ["Empowered Evocation"], 14: ["Overchannel"] } },
      illusionist: { name: "Illusionist", features: { 3: ["Illusion Savant", "Improved Illusions"], 6: ["Phantasmal Creatures"], 10: ["Illusory Self"], 14: ["Illusory Reality"] } }
    }
  }
};

// ---------- OPTION POOLS ----------
const POOLS = {
  mastery: { label: "Weapon Masteries", options: () => WEAPONS.filter(w => w.mastery).map(w => w.name + " (" + w.mastery + ")") },
  fightingStyle: { label: "Fighting Style", options: c => FIGHTING_STYLES.concat(c.fightingStyleExtra || []) },
  expertise: { label: "Expertise (skills)", options: c => c.profSkills },
  invocations: { label: "Eldritch Invocations", options: () => ["Agonizing Blast", "Armor of Shadows", "Ascendant Step", "Devil's Sight", "Devouring Blade", "Eldritch Mind", "Eldritch Smite", "Eldritch Spear", "Fiendish Vigor", "Gaze of Two Minds", "Gift of the Depths", "Gift of the Protectors", "Investment of the Chain Master", "Lessons of the First Ones", "Lifedrinker", "Mask of Many Faces", "Master of Myriad Forms", "Misty Visions", "One with Shadows", "Otherworldly Leap", "Pact of the Blade", "Pact of the Chain", "Pact of the Tome", "Repelling Blast", "Thirsting Blade", "Visions of Distant Realms", "Whispers of the Grave", "Witch Sight"], repeat: true },
  metamagic: { label: "Metamagic Options", options: () => ["Careful Spell", "Distant Spell", "Empowered Spell", "Extended Spell", "Heightened Spell", "Quickened Spell", "Seeking Spell", "Subtle Spell", "Transmuted Spell", "Twinned Spell"] },
  maneuvers: { label: "Battle Master Maneuvers", options: () => ["Ambush", "Bait and Switch", "Commander's Strike", "Commanding Presence", "Disarming Attack", "Distracting Strike", "Evasive Footwork", "Feinting Attack", "Goading Attack", "Lunging Attack", "Maneuvering Attack", "Menacing Attack", "Parry", "Precision Attack", "Pushing Attack", "Rally", "Riposte", "Sweeping Attack", "Tactical Assessment", "Trip Attack"] },
  divineOrder: { label: "Divine Order", options: () => ["Protector", "Thaumaturge"] },
  primalOrder: { label: "Primal Order", options: () => ["Magician", "Warden"] },
  skillsLore: { label: "Bonus Proficiencies (Lore)", options: () => ALL_SKILLS },
  keenSenses: { label: "Keen Senses", options: () => ["Insight", "Perception", "Survival"] },
  skillful: { label: "Skillful (Human)", options: () => ALL_SKILLS },
  primalKnowledge: { label: "Primal Knowledge (skill)", options: () => CLASSES.barbarian.skills.from }
};
// Effects of specific pool picks
const OPTION_FX = {
  "Protector": { armor: ["Heavy armor"], wprof: ["martial"] },
  "Thaumaturge": { cantrips: 1 },
  "Magician": { cantrips: 1 },
  "Warden": { armor: ["Medium armor"], wprof: ["martial"] },
  "Defense": { acArmored: 1 }
};

// ---------- SPECIES ----------
const SPECIES = {
  aasimar: { name: "Aasimar", size: "Medium or Small", speed: 30, darkvision: 60, resist: ["Necrotic", "Radiant"],
    traits: { 1: ["Celestial Resistance", "Darkvision", "Healing Hands", "Light Bearer"], 3: ["Celestial Revelation"] },
    choice: { label: "Celestial Revelation", opts: ["Heavenly Wings", "Inner Radiance", "Necrotic Shroud"] },
    spells: { 1: ["Light"] },
    resources: [{ key: "healhands", name: "Healing Hands", feature: "Healing Hands", reset: "LR", n: () => 1, die: (l, c) => c.pb + "d4" },
    { key: "revelation", name: "Celestial Revelation", feature: "Celestial Revelation", reset: "LR", n: l => l >= 3 ? 1 : 0 }] },
  dragonborn: { name: "Dragonborn", size: "Medium", speed: 30, darkvision: 60,
    traits: { 1: ["Draconic Ancestry", "Breath Weapon", "Damage Resistance", "Darkvision"], 5: ["Draconic Flight"] },
    choice: { label: "Draconic Ancestry", opts: ["Black (Acid)", "Blue (Lightning)", "Brass (Fire)", "Bronze (Lightning)", "Copper (Acid)", "Gold (Fire)", "Green (Poison)", "Red (Fire)", "Silver (Cold)", "White (Cold)"] },
    resistFromChoice: true,
    resources: [{ key: "breath", name: "Breath Weapon", feature: "Breath Weapon", reset: "LR", n: (l, c) => c.pb, die: l => step({ 1: 1, 5: 2, 11: 3, 17: 4 })[l - 1] + "d10" },
    { key: "dflight", name: "Draconic Flight", feature: "Draconic Flight", reset: "LR", n: l => l >= 5 ? 1 : 0 }] },
  dwarf: { name: "Dwarf", size: "Medium", speed: 30, darkvision: 120, resist: ["Poison"], hpPerLevel: 1,
    traits: { 1: ["Darkvision", "Dwarven Resilience", "Dwarven Toughness", "Stonecunning"] },
    resources: [{ key: "stonecunning", name: "Stonecunning (Tremorsense)", feature: "Stonecunning", reset: "LR", n: (l, c) => c.pb }] },
  elf: { name: "Elf", size: "Medium", speed: 30, darkvision: 60,
    traits: { 1: ["Darkvision", "Elven Lineage", "Fey Ancestry", "Keen Senses", "Trance"] },
    choice: { label: "Elven Lineage", opts: ["Drow", "High Elf", "Wood Elf"] },
    pools: { keenSenses: 1 },
    byChoice: {
      "Drow": { darkvision: 120, spells: { 1: ["Dancing Lights"], 3: ["Faerie Fire"], 5: ["Darkness"] } },
      "High Elf": { spells: { 1: ["Prestidigitation"], 3: ["Detect Magic"], 5: ["Misty Step"] } },
      "Wood Elf": { speed: 35, spells: { 1: ["Druidcraft"], 3: ["Longstrider"], 5: ["Pass without Trace"] } }
    },
    spellAbility: true },
  gnome: { name: "Gnome", size: "Small", speed: 30, darkvision: 60,
    traits: { 1: ["Darkvision", "Gnomish Cunning", "Gnomish Lineage"] },
    choice: { label: "Gnomish Lineage", opts: ["Forest Gnome", "Rock Gnome"] },
    byChoice: { "Forest Gnome": { spells: { 1: ["Minor Illusion", "Speak with Animals"] } }, "Rock Gnome": { spells: { 1: ["Mending", "Prestidigitation"] } } },
    spellAbility: true },
  goliath: { name: "Goliath", size: "Medium", speed: 35, darkvision: 0,
    traits: { 1: ["Giant Ancestry", "Powerful Build"], 5: ["Large Form"] },
    choice: { label: "Giant Ancestry", opts: ["Cloud's Jaunt", "Fire's Burn", "Frost's Chill", "Hill's Tumble", "Stone's Endurance", "Storm's Thunder"] },
    resources: [{ key: "giant", name: "Giant Ancestry", feature: "Giant Ancestry", reset: "LR", n: (l, c) => c.pb },
    { key: "largeform", name: "Large Form", feature: "Large Form", reset: "LR", n: l => l >= 5 ? 1 : 0 }] },
  halfling: { name: "Halfling", size: "Small", speed: 30, darkvision: 0,
    traits: { 1: ["Brave", "Halfling Nimbleness", "Luck", "Naturally Stealthy"] } },
  human: { name: "Human", size: "Medium or Small", speed: 30, darkvision: 0,
    traits: { 1: ["Resourceful", "Skillful", "Versatile"] },
    pools: { skillful: 1 }, extraOriginFeat: true },
  orc: { name: "Orc", size: "Medium", speed: 30, darkvision: 120,
    traits: { 1: ["Adrenaline Rush", "Darkvision", "Relentless Endurance"] },
    resources: [{ key: "adrenaline", name: "Adrenaline Rush", feature: "Adrenaline Rush", reset: "SR", n: (l, c) => c.pb },
    { key: "relentless", name: "Relentless Endurance", feature: "Relentless Endurance", reset: "LR", n: () => 1 }] },
  tiefling: { name: "Tiefling", size: "Medium or Small", speed: 30, darkvision: 60,
    traits: { 1: ["Darkvision", "Fiendish Legacy", "Otherworldly Presence"] },
    choice: { label: "Fiendish Legacy", opts: ["Abyssal", "Chthonic", "Infernal"] },
    byChoice: {
      "Abyssal": { resist: ["Poison"], spells: { 1: ["Poison Spray"], 3: ["Ray of Sickness"], 5: ["Hold Person"] } },
      "Chthonic": { resist: ["Necrotic"], spells: { 1: ["Chill Touch"], 3: ["False Life"], 5: ["Ray of Enfeeblement"] } },
      "Infernal": { resist: ["Fire"], spells: { 1: ["Fire Bolt"], 3: ["Hellish Rebuke"], 5: ["Darkness"] } }
    },
    spells: { 1: ["Thaumaturgy"] }, spellAbility: true }
};

// ---------- BACKGROUNDS ----------
const BACKGROUNDS = {
  acolyte: ["Acolyte", ["int", "wis", "cha"], "Magic Initiate (Cleric)", ["Insight", "Religion"], "Calligrapher's Supplies"],
  artisan: ["Artisan", ["str", "dex", "int"], "Crafter", ["Investigation", "Persuasion"], "One kind of Artisan's Tools"],
  charlatan: ["Charlatan", ["dex", "con", "cha"], "Skilled", ["Deception", "Sleight of Hand"], "Forgery Kit"],
  criminal: ["Criminal", ["dex", "con", "int"], "Alert", ["Sleight of Hand", "Stealth"], "Thieves' Tools"],
  entertainer: ["Entertainer", ["str", "dex", "cha"], "Musician", ["Acrobatics", "Performance"], "One kind of Musical Instrument"],
  farmer: ["Farmer", ["str", "con", "wis"], "Tough", ["Animal Handling", "Nature"], "Carpenter's Tools"],
  guard: ["Guard", ["str", "int", "wis"], "Alert", ["Athletics", "Perception"], "One kind of Gaming Set"],
  guide: ["Guide", ["dex", "con", "wis"], "Magic Initiate (Druid)", ["Stealth", "Survival"], "Cartographer's Tools"],
  hermit: ["Hermit", ["con", "wis", "cha"], "Healer", ["Medicine", "Religion"], "Herbalism Kit"],
  merchant: ["Merchant", ["con", "int", "cha"], "Lucky", ["Animal Handling", "Persuasion"], "Navigator's Tools"],
  noble: ["Noble", ["str", "int", "cha"], "Skilled", ["History", "Persuasion"], "One kind of Gaming Set"],
  sage: ["Sage", ["con", "int", "wis"], "Magic Initiate (Wizard)", ["Arcana", "History"], "Calligrapher's Supplies"],
  sailor: ["Sailor", ["str", "dex", "wis"], "Tavern Brawler", ["Acrobatics", "Perception"], "Navigator's Tools"],
  scribe: ["Scribe", ["dex", "int", "wis"], "Skilled", ["Investigation", "Perception"], "Calligrapher's Supplies"],
  soldier: ["Soldier", ["str", "dex", "con"], "Savage Attacker", ["Athletics", "Intimidation"], "One kind of Gaming Set"],
  wayfarer: ["Wayfarer", ["dex", "wis", "cha"], "Lucky", ["Insight", "Stealth"], "Thieves' Tools"]
};
for (const k in BACKGROUNDS) { const b = BACKGROUNDS[k]; BACKGROUNDS[k] = { name: b[0], abil: b[1], feat: b[2], skills: b[3], tool: b[4] }; }

// ---------- FEATS ----------
// cat: origin | general | style | boon ; abil: abilities for +1 ; picks: extra choices
const ANY = ABILITIES;
const MENTAL = ["int", "wis", "cha"];
const FEATS = {
  "Alert": { cat: "origin", initPB: true },
  "Crafter": { cat: "origin" },
  "Healer": { cat: "origin" },
  "Lucky": { cat: "origin", res: { name: "Luck Points", reset: "LR", n: (l, c) => c.pb } },
  "Magic Initiate": { cat: "origin", repeat: true, picks: [{ key: "list", label: "Spell list", opts: ["Cleric", "Druid", "Wizard"] }, { key: "abil", label: "Spellcasting ability", opts: ["int", "wis", "cha"] }] },
  "Musician": { cat: "origin" },
  "Savage Attacker": { cat: "origin" },
  "Skilled": { cat: "origin", repeat: true, picks: [{ key: "skills", label: "Skills/Tools (3)", count: 3, opts: "skillsOrTools" }] },
  "Tavern Brawler": { cat: "origin" },
  "Tough": { cat: "origin", hpPerLevel: 2 },
  "Ability Score Improvement": { cat: "general", asi: true, repeat: true },
  "Actor": { cat: "general", abil: ["cha"] }, "Athlete": { cat: "general", abil: ["str", "dex"] }, "Charger": { cat: "general", abil: ["str", "dex"] },
  "Chef": { cat: "general", abil: ["con", "wis"] }, "Crossbow Expert": { cat: "general", abil: ["dex"] }, "Crusher": { cat: "general", abil: ["str", "con"] },
  "Defensive Duelist": { cat: "general", abil: ["dex"] }, "Dual Wielder": { cat: "general", abil: ["str", "dex"] }, "Durable": { cat: "general", abil: ["con"] },
  "Elemental Adept": { cat: "general", abil: MENTAL, repeat: true, picks: [{ key: "type", label: "Damage type", opts: ["Acid", "Cold", "Fire", "Lightning", "Thunder"] }] },
  "Fey Touched": { cat: "general", abil: MENTAL, spellsNote: "Misty Step + one 1st-level Divination/Enchantment spell" },
  "Grappler": { cat: "general", abil: ["str", "dex"] }, "Great Weapon Master": { cat: "general", abil: ["str"] },
  "Heavily Armored": { cat: "general", abil: ["con", "str"], armor: ["Heavy armor"] }, "Heavy Armor Master": { cat: "general", abil: ["con", "str"] },
  "Inspiring Leader": { cat: "general", abil: ["wis", "cha"] }, "Keen Mind": { cat: "general", abil: ["int"] },
  "Lightly Armored": { cat: "general", abil: ["str", "dex"], armor: ["Light armor", "Shields"] }, "Mage Slayer": { cat: "general", abil: ["str", "dex"] },
  "Martial Weapon Training": { cat: "general", abil: ["str", "dex"], wprof: ["martial"] }, "Medium Armor Master": { cat: "general", abil: ["str", "dex"] },
  "Moderately Armored": { cat: "general", abil: ["str", "dex"], armor: ["Medium armor"] }, "Mounted Combatant": { cat: "general", abil: ["str", "dex", "wis"] },
  "Observant": { cat: "general", abil: ["int", "wis"] }, "Piercer": { cat: "general", abil: ["str", "dex"] }, "Poisoner": { cat: "general", abil: ["dex", "int"] },
  "Polearm Master": { cat: "general", abil: ["str", "dex"] }, "Resilient": { cat: "general", abil: ANY, saveFromAbil: true },
  "Ritual Caster": { cat: "general", abil: MENTAL }, "Sentinel": { cat: "general", abil: ["str", "dex"] },
  "Shadow Touched": { cat: "general", abil: MENTAL, spellsNote: "Invisibility + one 1st-level Illusion/Necromancy spell" },
  "Sharpshooter": { cat: "general", abil: ["dex"] }, "Shield Master": { cat: "general", abil: ["str"] },
  "Skill Expert": { cat: "general", abil: ANY, repeat: true, picks: [{ key: "skill", label: "Skill proficiency", opts: "skills" }, { key: "expert", label: "Expertise", opts: "profSkills" }] },
  "Skulker": { cat: "general", abil: ["dex"] }, "Slasher": { cat: "general", abil: ["str", "dex"] }, "Speedy": { cat: "general", abil: ["dex", "con"], speed: 10 },
  "Spell Sniper": { cat: "general", abil: MENTAL }, "Telekinetic": { cat: "general", abil: MENTAL }, "Telepathic": { cat: "general", abil: MENTAL },
  "War Caster": { cat: "general", abil: MENTAL }, "Weapon Master": { cat: "general", abil: ["str", "dex"] },
  "Boon of Combat Prowess": { cat: "boon", abil: ANY, max30: true }, "Boon of Dimensional Travel": { cat: "boon", abil: ANY, max30: true },
  "Boon of Energy Resistance": { cat: "boon", abil: ANY, max30: true }, "Boon of Fate": { cat: "boon", abil: ANY, max30: true },
  "Boon of Fortitude": { cat: "boon", abil: ANY, max30: true, hpFlat: 40 }, "Boon of Irresistible Offense": { cat: "boon", abil: ["str", "dex"], max30: true },
  "Boon of Recovery": { cat: "boon", abil: ANY, max30: true }, "Boon of Skill": { cat: "boon", abil: ANY, max30: true },
  "Boon of Speed": { cat: "boon", abil: ANY, max30: true, speed: 30 }, "Boon of Spell Recall": { cat: "boon", abil: MENTAL, max30: true },
  "Boon of the Night Spirit": { cat: "boon", abil: ANY, max30: true }, "Boon of Truesight": { cat: "boon", abil: ANY, max30: true }
};
for (const s of FIGHTING_STYLES) FEATS[s] = { cat: "style" };

const TOOLS = ["Alchemist's Supplies", "Brewer's Supplies", "Calligrapher's Supplies", "Carpenter's Tools", "Cartographer's Tools", "Cobbler's Tools", "Cook's Utensils", "Glassblower's Tools", "Jeweler's Tools", "Leatherworker's Tools", "Mason's Tools", "Painter's Supplies", "Potter's Tools", "Smith's Tools", "Tinker's Tools", "Weaver's Tools", "Woodcarver's Tools", "Disguise Kit", "Forgery Kit", "Gaming Set", "Herbalism Kit", "Musical Instrument", "Navigator's Tools", "Poisoner's Kit", "Thieves' Tools"];
const LANGUAGES = ["Common", "Common Sign Language", "Draconic", "Dwarvish", "Elvish", "Giant", "Gnomish", "Goblin", "Halfling", "Orc", "Abyssal", "Celestial", "Deep Speech", "Druidic", "Infernal", "Primordial", "Sylvan", "Thieves' Cant", "Undercommon"];

const MC_PREREQ_NOTE = "Multiclassing requires 13+ in the primary ability of both your current classes and the new class.";

// ---------- STARTING EQUIPMENT (2024) ----------
// Each option: list of "count× item" strings; "N GP" becomes coins. Weapons/armor/shield are recognised automatically.
const START_EQUIP = {
  class: {
    barbarian: { A: ["Greataxe", "4 Handaxe", "Explorer's Pack", "15 GP"], B: ["75 GP"] },
    bard: { A: ["Leather Armor", "2 Dagger", "Musical Instrument (of your choice)", "Entertainer's Pack", "19 GP"], B: ["90 GP"] },
    cleric: { A: ["Chain Shirt", "Shield", "Mace", "Holy Symbol", "Priest's Pack", "7 GP"], B: ["110 GP"] },
    druid: { A: ["Leather Armor", "Shield", "Sickle", "Druidic Focus (Quarterstaff)", "Explorer's Pack", "Herbalism Kit", "9 GP"], B: ["50 GP"] },
    fighter: { A: ["Chain Mail", "Greatsword", "Flail", "8 Javelin", "Dungeoneer's Pack", "4 GP"], B: ["Studded Leather Armor", "Scimitar", "Shortsword", "Longbow", "20 Arrows", "Quiver", "Dungeoneer's Pack", "11 GP"], C: ["155 GP"] },
    monk: { A: ["Spear", "5 Dagger", "Artisan's Tools or Musical Instrument", "Explorer's Pack", "11 GP"], B: ["50 GP"] },
    paladin: { A: ["Chain Mail", "Shield", "Longsword", "6 Javelin", "Holy Symbol", "Priest's Pack", "9 GP"], B: ["150 GP"] },
    ranger: { A: ["Studded Leather Armor", "Scimitar", "Shortsword", "Longbow", "20 Arrows", "Quiver", "Druidic Focus (sprig of mistletoe)", "Explorer's Pack", "7 GP"], B: ["150 GP"] },
    rogue: { A: ["Leather Armor", "2 Dagger", "Shortsword", "Shortbow", "20 Arrows", "Quiver", "Thieves' Tools", "Burglar's Pack", "8 GP"], B: ["100 GP"] },
    sorcerer: { A: ["Spear", "2 Dagger", "Arcane Focus (crystal)", "Dungeoneer's Pack", "28 GP"], B: ["50 GP"] },
    warlock: { A: ["Leather Armor", "Sickle", "2 Dagger", "Arcane Focus (orb)", "Book (occult lore)", "Scholar's Pack", "15 GP"], B: ["100 GP"] },
    wizard: { A: ["2 Dagger", "Arcane Focus (Quarterstaff)", "Robe", "Spellbook", "Scholar's Pack", "5 GP"], B: ["55 GP"] }
  },
  background: {
    acolyte: ["Calligrapher's Supplies", "Book (prayers)", "Holy Symbol", "10 Parchment sheets", "Robe", "8 GP"],
    artisan: ["Artisan's Tools (same as above)", "2 Pouch", "Traveler's Clothes", "32 GP"],
    charlatan: ["Forgery Kit", "Costume", "Fine Clothes", "15 GP"],
    criminal: ["2 Dagger", "Thieves' Tools", "Crowbar", "2 Pouch", "Traveler's Clothes", "16 GP"],
    entertainer: ["Musical Instrument (same as above)", "2 Costume", "Mirror", "Perfume", "Traveler's Clothes", "11 GP"],
    farmer: ["Sickle", "Carpenter's Tools", "Healer's Kit", "Iron Pot", "Shovel", "Traveler's Clothes", "30 GP"],
    guard: ["Spear", "Light Crossbow", "20 Bolts", "Gaming Set (same as above)", "Hooded Lantern", "Manacles", "Quiver", "Traveler's Clothes", "12 GP"],
    guide: ["Shortbow", "20 Arrows", "Cartographer's Tools", "Bedroll", "Quiver", "Tent", "Traveler's Clothes", "3 GP"],
    hermit: ["Quarterstaff", "Herbalism Kit", "Bedroll", "Book (philosophy)", "Lamp", "3 Oil flasks", "Traveler's Clothes", "16 GP"],
    merchant: ["Navigator's Tools", "2 Pouch", "Traveler's Clothes", "22 GP"],
    noble: ["Gaming Set (same as above)", "Fine Clothes", "Perfume", "29 GP"],
    sage: ["Quarterstaff", "Calligrapher's Supplies", "Book (history)", "8 Parchment sheets", "Robe", "8 GP"],
    sailor: ["Dagger", "Navigator's Tools", "Rope", "Traveler's Clothes", "20 GP"],
    scribe: ["Calligrapher's Supplies", "Fine Clothes", "Lamp", "3 Oil flasks", "12 Parchment sheets", "23 GP"],
    soldier: ["Spear", "Shortbow", "20 Arrows", "Gaming Set (same as above)", "Healer's Kit", "Quiver", "Traveler's Clothes", "14 GP"],
    wayfarer: ["2 Dagger", "Thieves' Tools", "Gaming Set (of your choice)", "Bedroll", "2 Pouch", "Traveler's Clothes", "16 GP"]
  },
  backgroundGold: 50
};
const ABILITY_ORDER = ["str", "dex", "con", "int", "wis", "cha"];
const SKILLS_BY_ABILITY = ALL_SKILLS.slice().sort((a, b) => ABILITY_ORDER.indexOf(SKILLS[a]) - ABILITY_ORDER.indexOf(SKILLS[b]) || a.localeCompare(b));

// ---------- ARTIFICER (Eberron: Forge of the Artificer, 2024 rules; Reanimator from Ravenloft: The Horrors Within) ----------
CLASSES.artificer = {
  name: "Artificer", hd: 8, primary: ["int"], saves: ["con", "int"],
  skills: { n: 2, from: ["Arcana", "History", "Investigation", "Medicine", "Nature", "Perception", "Sleight of Hand"] },
  armor: ["Light armor", "Medium armor", "Shields"], wprof: ["simple"], tools: ["Thieves' Tools", "Tinker's Tools", "One kind of Artisan's Tools"],
  mc: { skills: 0, armor: ["Light armor", "Medium armor", "Shields"], wprof: [], tools: ["Thieves' Tools", "Tinker's Tools"] },
  caster: { type: "half", ability: "int", cantrips: step({ 1: 2, 10: 3, 14: 4 }), prepared: PREP.half },
  features: {
    1: ["Spellcasting", "Tinker's Magic"], 2: ["Replicate Magic Item"], 3: ["@sub"], 4: ["@asi"], 5: ["@sub"], 6: ["Magic Item Tinker"], 7: ["Flash of Genius"],
    8: ["@asi"], 9: ["@sub"], 10: ["Magic Item Adept"], 11: ["Spell-Storing Item"], 12: ["@asi"], 14: ["Advanced Artifice"], 15: ["@sub"], 16: ["@asi"],
    18: ["Magic Item Master"], 19: ["@boon"], 20: ["Soul of Artifice"]
  },
  notes: {
    "Replicate Magic Item": l => `${step({ 2: 4, 6: 5, 10: 6, 14: 7, 18: 8 })[l - 1]} plans known · ${step({ 2: 2, 6: 3, 10: 4, 14: 5, 18: 6 })[l - 1]} items at once`,
    "Magic Item Adept": () => "attune to 4 items", "Advanced Artifice": () => "attune to 5 items", "Magic Item Master": () => "attune to 6 items"
  },
  resources: [
    { key: "tinker", name: "Tinker's Magic", feature: "Tinker's Magic", reset: "LR", n: (l, D) => Math.max(1, D.mod.int) },
    { key: "flash", name: "Flash of Genius", feature: "Flash of Genius", reset: "LR", n: (l, D) => l >= 7 ? Math.max(1, D.mod.int) : 0, note: "" },
    { key: "spellstore", name: "Spell-Storing Item", feature: "Spell-Storing Item", reset: "LR", n: (l, D) => l >= 11 ? Math.max(2, 2 * D.mod.int) : 0 }
  ],
  subclasses: {
    alchemist: { name: "Alchemist", features: { 3: ["Tools of the Trade", "Alchemist Spells", "Experimental Elixir"], 5: ["Alchemical Savant"], 9: ["Restorative Reagents"], 15: ["Chemical Mastery"] },
      spells: { 3: ["Healing Word", "Ray of Sickness"], 5: ["Flaming Sphere", "Melf's Acid Arrow"], 9: ["Gaseous Form", "Mass Healing Word"], 13: ["Death Ward", "Vitriolic Sphere"], 17: ["Cloudkill", "Raise Dead"] },
      tools: ["Alchemist's Supplies"],
      resources: [{ key: "elixir", name: "Experimental Elixir (free)", feature: "Experimental Elixir", reset: "LR", n: step({ 3: 1, 6: 2, 15: 3 }) },
        { key: "reagents", name: "Restorative Reagents", feature: "Restorative Reagents", reset: "LR", n: (l, D) => l >= 9 ? Math.max(1, D.mod.int) : 0 }] },
    armorer: { name: "Armorer", features: { 3: ["Tools of the Trade", "Armorer Spells", "Arcane Armor", "Armor Model"], 5: ["Extra Attack"], 9: ["Improved Armorer"], 15: ["Perfected Armor"] },
      spells: { 3: ["Magic Missile", "Thunderwave"], 5: ["Mirror Image", "Shatter"], 9: ["Hypnotic Pattern", "Lightning Bolt"], 13: ["Fire Shield", "Greater Invisibility"], 17: ["Passwall", "Wall of Force"] },
      armor: ["Heavy armor"], tools: ["Smith's Tools"], pools: { armorModel: step({ 3: 1 }) } },
    artillerist: { name: "Artillerist", features: { 3: ["Tools of the Trade", "Artillerist Spells", "Eldritch Cannon"], 5: ["Arcane Firearm"], 9: ["Explosive Cannon"], 15: ["Fortified Position"] },
      spells: { 3: ["Shield", "Thunderwave"], 5: ["Scorching Ray", "Shatter"], 9: ["Fireball", "Wind Wall"], 13: ["Ice Storm", "Wall of Fire"], 17: ["Cone of Cold", "Wall of Force"] },
      wprof: ["martialRanged"], tools: ["Woodcarver's Tools"],
      resources: [{ key: "cannon", name: "Eldritch Cannon (free)", feature: "Eldritch Cannon", reset: "LR", n: step({ 3: 1 }) }] },
    battlesmith: { name: "Battle Smith", features: { 3: ["Tools of the Trade", "Battle Smith Spells", "Battle Ready", "Steel Defender"], 5: ["Extra Attack"], 9: ["Arcane Jolt"], 15: ["Improved Defender"] },
      spells: { 3: ["Heroism", "Shield"], 5: ["Shining Smite", "Warding Bond"], 9: ["Aura of Vitality", "Conjure Barrage"], 13: ["Aura of Purity", "Fire Shield"], 17: ["Banishing Smite", "Mass Cure Wounds"] },
      wprof: ["martial"], tools: ["Smith's Tools"], battleReady: true,
      resources: [{ key: "jolt", name: "Arcane Jolt", feature: "Arcane Jolt", reset: "LR", n: (l, D) => l >= 9 ? Math.max(1, D.mod.int) : 0, die: l => (l >= 15 ? 4 : 2) + "d6" }] },
    cartographer: { name: "Cartographer", features: { 3: ["Tools of the Trade", "Cartographer Spells", "Adventurer's Atlas", "Mapping Magic"], 5: ["Guided Precision"], 9: ["Ingenious Movement"], 15: ["Superior Atlas"] },
      spells: { 3: ["Faerie Fire", "Guiding Bolt", "Healing Word"], 5: ["Locate Object", "Mind Spike"], 9: ["Call Lightning", "Clairvoyance"], 13: ["Banishment", "Locate Creature"], 17: ["Scrying", "Teleportation Circle"] },
      tools: ["Calligrapher's Supplies", "Cartographer's Tools"] },
    reanimator: { name: "Reanimator", features: { 3: ["Reanimator Spells", "Reanimator's Skillset", "Reanimated Companion"], 5: ["Strange Modifications"], 9: ["Improved Reanimation", "Macabre Modifications"], 15: ["Refined Reanimation"] },
      spells: { 3: ["False Life", "Spare the Dying", "Witch Bolt"], 5: ["Blindness/Deafness", "Enhance Ability"], 9: ["Animate Dead", "Lightning Bolt"], 13: ["Blight", "Death Ward"], 17: ["Antilife Shell", "Raise Dead"] },
      tools: ["Alchemist's Supplies"],
      resources: [{ key: "raisedead", name: "Raise Dead (Refined Reanimation)", feature: "Refined Reanimation", reset: "LR", n: step({ 15: 1 }) }] }
  }
};
POOLS.armorModel = { label: "Arcane Armor model", options: () => ["Dreadnaught", "Guardian", "Infiltrator"] };
START_EQUIP.class.artificer = { A: ["Studded Leather Armor", "Dagger", "Thieves' Tools", "Tinker's Tools", "Dungeoneer's Pack", "16 GP"], B: ["150 GP"] };
