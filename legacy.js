"use strict";
/* ============ Older (pre-2024) species and subclasses, adapted to the 2024 rules ============
   - Species: latest pre-2024 version (mostly Monsters of the Multiverse). No ability score increases
     (in 2024 rules those come from the background).
   - Subclasses: only those NOT reprinted in the 2024 Player's Handbook. All are chosen at level 3:
     features the old books gave at level 1 or 2 now arrive at level 3; the old Cleric level-8 features
     (Divine Strike / Potent Spellcasting) are left out because 2024 Clerics get Blessed Strikes instead.
   - Descriptions come from dnd5e.wikidot.com (imported by importer.py into "legacy-" pages).
*/
const PB = (l, c) => c.pb, ONE = () => 1;
const LEGACY_SPECIES = {
  aarakocra: { name: "Aarakocra", size: "Medium", speed: 30, darkvision: 0, wiki: "aarakocra", src: "Monsters of the Multiverse", note: "Fly 30 ft",
    traits: { 1: ["Flight", "Talons"], 3: ["Wind Caller"] }, spells: { 3: ["Gust of Wind"] }, spellAbility: true },
  airgenasi: { name: "Air Genasi", size: "Medium or Small", speed: 35, darkvision: 60, resist: ["Lightning"], wiki: "genasi", src: "Monsters of the Multiverse",
    traits: { 1: ["Darkvision", "Unending Breath", "Lightning Resistance", "Mingle with the Wind"] }, spells: { 1: ["Shocking Grasp"], 3: ["Feather Fall"], 5: ["Levitate"] }, spellAbility: true },
  earthgenasi: { name: "Earth Genasi", size: "Medium or Small", speed: 30, darkvision: 60, wiki: "genasi", src: "Monsters of the Multiverse",
    traits: { 1: ["Darkvision", "Earth Walk", "Merge with Stone"] }, spells: { 1: ["Blade Ward"], 5: ["Pass without Trace"] }, spellAbility: true,
    resources: [{ key: "mergestone", name: "Blade Ward (bonus action)", feature: "Merge with Stone", reset: "LR", n: PB }] },
  firegenasi: { name: "Fire Genasi", size: "Medium or Small", speed: 30, darkvision: 60, resist: ["Fire"], wiki: "genasi", src: "Monsters of the Multiverse",
    traits: { 1: ["Darkvision", "Fire Resistance", "Reach to the Blaze"] }, spells: { 1: ["Produce Flame"], 3: ["Burning Hands"], 5: ["Flame Blade"] }, spellAbility: true },
  watergenasi: { name: "Water Genasi", size: "Medium or Small", speed: 30, darkvision: 60, resist: ["Acid"], wiki: "genasi", src: "Monsters of the Multiverse", note: "Swim 30 ft",
    traits: { 1: ["Acid Resistance", "Amphibious", "Darkvision", "Call to the Wave"] }, spells: { 1: ["Acid Splash"], 3: ["Create or Destroy Water"], 5: ["Water Walk"] }, spellAbility: true },
  astralelf: { name: "Astral Elf", size: "Medium", speed: 30, darkvision: 60, wiki: "astral-elf", src: "Spelljammer",
    traits: { 1: ["Astral Fire", "Darkvision", "Fey Ancestry", "Keen Senses", "Starlight Step", "Astral Trance"] },
    choice: { label: "Astral Fire", opts: ["Dancing Lights", "Light", "Sacred Flame"] }, spellAbility: true, pools: { keenSenses: 1 },
    resources: [{ key: "starlight", name: "Starlight Step", feature: "Starlight Step", reset: "LR", n: PB }] },
  autognome: { name: "Autognome", size: "Small", speed: 30, darkvision: 0, resist: ["Poison"], wiki: "autognome", src: "Spelljammer",
    traits: { 1: ["Armored Casing", "Built for Success", "Healing Machine", "Mechanical Nature", "Sentry's Rest", "Specialized Design"] },
    resources: [{ key: "builtsuccess", name: "Built for Success", feature: "Built for Success", reset: "LR", n: PB, die: () => "d4" }] },
  bugbear: { name: "Bugbear", size: "Medium", speed: 30, darkvision: 60, wiki: "bugbear", src: "Monsters of the Multiverse", skills: ["Stealth"],
    traits: { 1: ["Darkvision", "Fey Ancestry", "Long-Limbed", "Powerful Build", "Sneaky", "Surprise Attack"] } },
  centaur: { name: "Centaur", size: "Medium", speed: 40, darkvision: 0, wiki: "centaur", src: "Monsters of the Multiverse",
    traits: { 1: ["Charge", "Equine Build", "Hooves", "Natural Affinity"] }, skillChoice: { n: 1, from: ["Animal Handling", "Medicine", "Nature", "Survival"] } },
  changeling: { name: "Changeling", size: "Medium or Small", speed: 30, darkvision: 0, wiki: "changeling", src: "Monsters of the Multiverse",
    traits: { 1: ["Changeling Instincts", "Shapechanger"] }, skillChoice: { n: 2, from: ["Deception", "Insight", "Intimidation", "Performance", "Persuasion"] } },
  deepgnome: { name: "Deep Gnome", size: "Small", speed: 30, darkvision: 120, wiki: "deep-gnome", src: "Monsters of the Multiverse",
    traits: { 1: ["Darkvision", "Gnomish Magic Resistance", "Svirfneblin Camouflage"], 3: ["Gift of the Svirfneblin"] }, spells: { 3: ["Disguise Self"], 5: ["Nondetection"] }, spellAbility: true,
    resources: [{ key: "camo", name: "Svirfneblin Camouflage", feature: "Svirfneblin Camouflage", reset: "LR", n: PB }] },
  dhampir: { name: "Dhampir", size: "Medium or Small", speed: 35, darkvision: 60, wiki: "dhampir", src: "Van Richten's Guide to Ravenloft", note: "Climb 35 ft",
    traits: { 1: ["Ancestral Legacy", "Darkvision", "Deathless Nature", "Spider Climb", "Vampiric Bite"] },
    resources: [{ key: "bite", name: "Vampiric Bite (empower)", feature: "Vampiric Bite", reset: "LR", n: PB }] },
  duergar: { name: "Duergar", size: "Medium", speed: 30, darkvision: 120, resist: ["Poison"], wiki: "duergar", src: "Monsters of the Multiverse",
    traits: { 1: ["Darkvision", "Dwarven Resilience", "Psionic Fortitude"], 3: ["Duergar Magic"] }, spells: { 3: ["Enlarge/Reduce"], 5: ["Invisibility"] }, spellAbility: true },
  eladrin: { name: "Eladrin", size: "Medium", speed: 30, darkvision: 60, wiki: "eladrin", src: "Monsters of the Multiverse",
    traits: { 1: ["Darkvision", "Fey Ancestry", "Fey Step", "Keen Senses", "Trance"] }, pools: { keenSenses: 1 },
    choice: { label: "Season", opts: ["Autumn", "Winter", "Spring", "Summer"] },
    resources: [{ key: "feystep", name: "Fey Step", feature: "Fey Step", reset: "LR", n: PB }] },
  fairy: { name: "Fairy", size: "Small", speed: 30, darkvision: 0, wiki: "fairy", src: "Monsters of the Multiverse", note: "Fly 30 ft",
    traits: { 1: ["Fairy Magic", "Flight"] }, spells: { 1: ["Druidcraft"], 3: ["Faerie Fire"], 5: ["Enlarge/Reduce"] }, spellAbility: true },
  firbolg: { name: "Firbolg", size: "Medium", speed: 30, darkvision: 0, wiki: "firbolg", src: "Monsters of the Multiverse",
    traits: { 1: ["Firbolg Magic", "Hidden Step", "Powerful Build", "Speech of Beast and Leaf"] }, spells: { 1: ["Detect Magic", "Disguise Self"] }, spellAbility: true,
    resources: [{ key: "hiddenstep", name: "Hidden Step", feature: "Hidden Step", reset: "LR", n: PB }] },
  giff: { name: "Giff", size: "Medium", speed: 30, darkvision: 0, wiki: "giff", src: "Spelljammer", note: "Swim 30 ft",
    traits: { 1: ["Astral Spark", "Firearms Mastery", "Hippo Build"] } },
  githyanki: { name: "Githyanki", size: "Medium", speed: 30, darkvision: 0, resist: ["Psychic"], wiki: "githyanki", src: "Monsters of the Multiverse",
    traits: { 1: ["Astral Knowledge", "Githyanki Psionics", "Psychic Resilience"] }, spells: { 1: ["Mage Hand"], 3: ["Jump"], 5: ["Misty Step"] }, spellAbility: true },
  githzerai: { name: "Githzerai", size: "Medium", speed: 30, darkvision: 0, resist: ["Psychic"], wiki: "githzerai", src: "Monsters of the Multiverse",
    traits: { 1: ["Githzerai Psionics", "Mental Discipline", "Psychic Resilience"] }, spells: { 1: ["Mage Hand"], 3: ["Shield"], 5: ["Detect Thoughts"] }, spellAbility: true },
  goblin: { name: "Goblin", size: "Small", speed: 30, darkvision: 60, wiki: "goblin", src: "Monsters of the Multiverse",
    traits: { 1: ["Darkvision", "Fey Ancestry", "Fury of the Small", "Nimble Escape"] },
    resources: [{ key: "furysmall", name: "Fury of the Small", feature: "Fury of the Small", reset: "LR", n: PB }] },
  hadozee: { name: "Hadozee", size: "Medium or Small", speed: 30, darkvision: 0, wiki: "hadozee", src: "Spelljammer", note: "Climb 30 ft",
    traits: { 1: ["Dexterous Feet", "Glide", "Hadozee Dodge"] },
    resources: [{ key: "hdodge", name: "Hadozee Dodge", feature: "Hadozee Dodge", reset: "LR", n: PB, die: (l, c) => "1d6+" + c.pb }] },
  halfelf: { name: "Half-Elf", size: "Medium", speed: 30, darkvision: 60, wiki: "half-elf", src: "Player's Handbook 2014",
    traits: { 1: ["Darkvision", "Fey Ancestry", "Skill Versatility"] }, skillChoice: { n: 2, from: null } },
  halforc: { name: "Half-Orc", size: "Medium", speed: 30, darkvision: 60, wiki: "half-orc", src: "Player's Handbook 2014", skills: ["Intimidation"],
    traits: { 1: ["Darkvision", "Menacing", "Relentless Endurance", "Savage Attacks"] },
    resources: [{ key: "relentless", name: "Relentless Endurance", feature: "Relentless Endurance", reset: "LR", n: ONE }] },
  harengon: { name: "Harengon", size: "Medium or Small", speed: 30, darkvision: 0, wiki: "harengon", src: "Monsters of the Multiverse", skills: ["Perception"],
    traits: { 1: ["Hare-Trigger", "Leporine Senses", "Lucky Footwork", "Rabbit Hop"] },
    resources: [{ key: "hop", name: "Rabbit Hop", feature: "Rabbit Hop", reset: "LR", n: PB }] },
  hexblood: { name: "Hexblood", size: "Medium or Small", speed: 30, darkvision: 60, wiki: "hexblood", src: "Van Richten's Guide to Ravenloft",
    traits: { 1: ["Ancestral Legacy", "Darkvision", "Eerie Token", "Hex Magic"] }, spells: { 1: ["Disguise Self", "Hex"] }, spellAbility: true,
    resources: [{ key: "token", name: "Eerie Token", feature: "Eerie Token", reset: "LR", n: ONE }, { key: "hexmagic", name: "Hex Magic (free casts)", feature: "Hex Magic", reset: "LR", n: () => 2 }] },
  hobgoblin: { name: "Hobgoblin", size: "Medium", speed: 30, darkvision: 60, wiki: "hobgoblin", src: "Monsters of the Multiverse",
    traits: { 1: ["Darkvision", "Fey Ancestry", "Fey Gift", "Fortune from the Many"] },
    resources: [{ key: "feygift", name: "Fey Gift (Help)", feature: "Fey Gift", reset: "LR", n: PB }, { key: "fortune", name: "Fortune from the Many", feature: "Fortune from the Many", reset: "LR", n: PB }] },
  kalashtar: { name: "Kalashtar", size: "Medium", speed: 30, darkvision: 0, resist: ["Psychic"], wiki: "kalashtar", src: "Eberron: Rising from the Last War",
    traits: { 1: ["Dual Mind", "Mental Discipline", "Mind Link", "Severed from Dreams"] } },
  kender: { name: "Kender", size: "Small", speed: 30, darkvision: 0, wiki: "kender", src: "Dragonlance: Shadow of the Dragon Queen",
    traits: { 1: ["Fearless", "Kender Aptitude", "Taunt"] }, skillChoice: { n: 1, from: ["Insight", "Investigation", "Sleight of Hand", "Stealth", "Survival"] },
    resources: [{ key: "taunt", name: "Taunt", feature: "Taunt", reset: "LR", n: PB }] },
  kenku: { name: "Kenku", size: "Medium or Small", speed: 30, darkvision: 0, wiki: "kenku", src: "Monsters of the Multiverse",
    traits: { 1: ["Expert Duplication", "Kenku Recall", "Mimicry"] }, skillChoice: { n: 2, from: null },
    resources: [{ key: "recall", name: "Kenku Recall (advantage)", feature: "Kenku Recall", reset: "LR", n: PB }] },
  kobold: { name: "Kobold", size: "Small", speed: 30, darkvision: 60, wiki: "kobold", src: "Monsters of the Multiverse",
    traits: { 1: ["Darkvision", "Draconic Cry", "Kobold Legacy"] }, choice: { label: "Kobold Legacy", opts: ["Craftiness", "Defiance", "Draconic Sorcery"] },
    resources: [{ key: "dcry", name: "Draconic Cry", feature: "Draconic Cry", reset: "LR", n: PB }] },
  leonin: { name: "Leonin", size: "Medium", speed: 35, darkvision: 60, wiki: "leonin", src: "Mythic Odysseys of Theros",
    traits: { 1: ["Darkvision", "Claws", "Hunter's Instincts", "Daunting Roar"] }, skillChoice: { n: 1, from: ["Athletics", "Intimidation", "Perception", "Survival"] },
    resources: [{ key: "roar", name: "Daunting Roar", feature: "Daunting Roar", reset: "SR", n: ONE }] },
  lizardfolk: { name: "Lizardfolk", size: "Medium", speed: 30, darkvision: 0, wiki: "lizardfolk", src: "Monsters of the Multiverse", note: "Swim 30 ft",
    traits: { 1: ["Bite", "Hold Breath", "Hungry Jaws", "Natural Armor", "Nature's Intuition"] }, skillChoice: { n: 2, from: ["Animal Handling", "Medicine", "Nature", "Perception", "Stealth", "Survival"] },
    resources: [{ key: "jaws", name: "Hungry Jaws", feature: "Hungry Jaws", reset: "LR", n: PB }] },
  loxodon: { name: "Loxodon", size: "Medium", speed: 30, darkvision: 0, wiki: "loxodon", src: "Guildmasters' Guide to Ravnica",
    traits: { 1: ["Powerful Build", "Loxodon Serenity", "Natural Armor", "Trunk", "Keen Smell"] } },
  minotaur: { name: "Minotaur", size: "Medium", speed: 30, darkvision: 0, wiki: "minotaur", src: "Monsters of the Multiverse",
    traits: { 1: ["Horns", "Goring Rush", "Hammering Horns", "Labyrinthine Recall"] } },
  owlin: { name: "Owlin", size: "Medium or Small", speed: 30, darkvision: 120, wiki: "owlin", src: "Strixhaven", note: "Fly 30 ft", skills: ["Stealth"],
    traits: { 1: ["Darkvision", "Flight", "Silent Feathers"] } },
  plasmoid: { name: "Plasmoid", size: "Medium or Small", speed: 30, darkvision: 60, resist: ["Acid", "Poison"], wiki: "plasmoid", src: "Spelljammer",
    traits: { 1: ["Amorphous", "Darkvision", "Hold Breath", "Natural Resilience", "Shape Self"] } },
  reborn: { name: "Reborn", size: "Medium or Small", speed: 30, darkvision: 0, wiki: "reborn", src: "Van Richten's Guide to Ravenloft",
    traits: { 1: ["Ancestral Legacy", "Deathless Nature", "Knowledge from a Past Life"] },
    resources: [{ key: "pastlife", name: "Knowledge from a Past Life", feature: "Knowledge from a Past Life", reset: "LR", n: PB, die: () => "d6" }] },
  satyr: { name: "Satyr", size: "Medium", speed: 35, darkvision: 0, wiki: "satyr", src: "Monsters of the Multiverse", skills: ["Performance", "Persuasion"],
    traits: { 1: ["Ram", "Magic Resistance", "Mirthful Leaps", "Reveler"] } },
  seaelf: { name: "Sea Elf", size: "Medium", speed: 30, darkvision: 60, resist: ["Cold"], wiki: "sea-elf", src: "Monsters of the Multiverse", note: "Swim 30 ft",
    traits: { 1: ["Child of the Sea", "Darkvision", "Fey Ancestry", "Friend of the Sea", "Keen Senses", "Trance"] }, pools: { keenSenses: 1 } },
  shadarkai: { name: "Shadar-kai", size: "Medium", speed: 30, darkvision: 60, resist: ["Necrotic"], wiki: "shadar-kai", src: "Monsters of the Multiverse",
    traits: { 1: ["Blessing of the Raven Queen", "Darkvision", "Fey Ancestry", "Keen Senses", "Necrotic Resistance", "Trance"] }, pools: { keenSenses: 1 },
    resources: [{ key: "ravenq", name: "Blessing of the Raven Queen", feature: "Blessing of the Raven Queen", reset: "LR", n: PB }] },
  shifter: { name: "Shifter", size: "Medium", speed: 30, darkvision: 60, wiki: "shifter", src: "Monsters of the Multiverse",
    traits: { 1: ["Bestial Instincts", "Darkvision", "Shifting"] }, skillChoice: { n: 1, from: ["Acrobatics", "Athletics", "Intimidation", "Survival"] },
    choice: { label: "Shifting", opts: ["Beasthide", "Longtooth", "Swiftstride", "Wildhunt"] },
    resources: [{ key: "shift", name: "Shifting", feature: "Shifting", reset: "LR", n: PB }] },
  simichybrid: { name: "Simic Hybrid", size: "Medium", speed: 30, darkvision: 60, wiki: "simic-hybrid", src: "Guildmasters' Guide to Ravnica",
    traits: { 1: ["Darkvision", "Animal Enhancement"] }, choice: { label: "Animal Enhancement (1st level)", opts: ["Manta Glide", "Nimble Climber", "Underwater Adaptation"] } },
  tabaxi: { name: "Tabaxi", size: "Medium or Small", speed: 30, darkvision: 60, wiki: "tabaxi", src: "Monsters of the Multiverse", note: "Climb 30 ft", skills: ["Perception", "Stealth"],
    traits: { 1: ["Cat's Claws", "Cat's Talent", "Darkvision", "Feline Agility"] } },
  thrikreen: { name: "Thri-kreen", size: "Medium or Small", speed: 30, darkvision: 60, wiki: "thri-kreen", src: "Spelljammer",
    traits: { 1: ["Chameleon Carapace", "Darkvision", "Secondary Arms", "Sleepless", "Thri-kreen Telepathy"] } },
  tortle: { name: "Tortle", size: "Medium or Small", speed: 30, darkvision: 0, wiki: "tortle", src: "Monsters of the Multiverse",
    traits: { 1: ["Claws", "Hold Breath", "Natural Armor", "Nature's Intuition", "Shell Defense"] }, skillChoice: { n: 1, from: ["Animal Handling", "Medicine", "Nature", "Perception", "Stealth", "Survival"] } },
  triton: { name: "Triton", size: "Medium", speed: 30, darkvision: 60, resist: ["Cold"], wiki: "triton", src: "Monsters of the Multiverse", note: "Swim 30 ft",
    traits: { 1: ["Amphibious", "Control Air and Water", "Darkvision", "Emissary of the Sea", "Guardian of the Depths"] }, spells: { 1: ["Fog Cloud"], 3: ["Gust of Wind"], 5: ["Water Walk"] }, spellAbility: true },
  vedalken: { name: "Vedalken", size: "Medium", speed: 30, darkvision: 0, wiki: "vedalken", src: "Guildmasters' Guide to Ravnica",
    traits: { 1: ["Vedalken Dispassion", "Tireless Precision", "Partially Amphibious"] } },
  verdan: { name: "Verdan", size: "Medium or Small", speed: 30, darkvision: 0, wiki: "verdan", src: "Acquisitions Incorporated",
    traits: { 1: ["Black Blood Healing", "Limited Telepathy", "Persuasive", "Telepathic Insight"] }, skills: ["Persuasion"] },
  warforged: { name: "Warforged", size: "Medium", speed: 30, darkvision: 0, resist: ["Poison"], wiki: "warforged", src: "Eberron: Rising from the Last War",
    traits: { 1: ["Constructed Resilience", "Sentry's Rest", "Integrated Protection", "Specialized Design"] } },
  yuanti: { name: "Yuan-ti", size: "Medium or Small", speed: 30, darkvision: 60, resist: ["Poison"], wiki: "yuan-ti", src: "Monsters of the Multiverse",
    traits: { 1: ["Darkvision", "Magic Resistance", "Poison Resilience", "Serpentine Spellcasting"] }, spells: { 1: ["Animal Friendship", "Poison Spray"], 3: ["Suggestion"] }, spellAbility: true }
};
for (const [k, s] of Object.entries(LEGACY_SPECIES)) SPECIES[k] = { ...s, legacy: true };
SPECIES.astralelf.byChoice = { "Dancing Lights": { spells: { 1: ["Dancing Lights"] } }, "Light": { spells: { 1: ["Light"] } }, "Sacred Flame": { spells: { 1: ["Sacred Flame"] } } };

// ---------- subclasses (2014 books, not reprinted in 2024) ----------
// spells use the 2024 subclass spell levels (the old level-1 and level-3 lists are combined at level 3)
const LEGACY_SUBCLASSES = {
  barbarian: {
    ancestralguardian: { name: "Path of the Ancestral Guardian", wiki: "ancestral-guardian", src: "Xanathar's Guide to Everything", features: { 3: ["Ancestral Protectors"], 6: ["Spirit Shield"], 10: ["Consult the Spirits"], 14: ["Vengeful Ancestors"] } },
    battlerager: { name: "Path of the Battlerager", wiki: "battlerager", src: "Sword Coast Adventurer's Guide", features: { 3: ["Battlerager Armor"], 6: ["Reckless Abandon"], 10: ["Battlerager Charge"], 14: ["Spiked Retribution"] } },
    beast: { name: "Path of the Beast", wiki: "beast", src: "Tasha's Cauldron of Everything", features: { 3: ["Form of the Beast"], 6: ["Bestial Soul"], 10: ["Infectious Fury"], 14: ["Call the Hunt"] } },
    giant: { name: "Path of the Giant", wiki: "giant", src: "Bigby Presents: Glory of the Giants", features: { 3: ["Giant's Power", "Giant's Havoc"], 6: ["Elemental Cleaver"], 10: ["Mighty Impel"], 14: ["Demiurgic Colossus"] } },
    stormherald: { name: "Path of the Storm Herald", wiki: "storm-herald", src: "Xanathar's Guide to Everything", features: { 3: ["Storm Aura"], 6: ["Storm Soul"], 10: ["Shielding Storm"], 14: ["Raging Storm"] } },
    wildmagic: { name: "Path of Wild Magic", wiki: "wild-magic", src: "Tasha's Cauldron of Everything", features: { 3: ["Magic Awareness", "Wild Surge"], 6: ["Bolstering Magic"], 10: ["Unstable Backlash"], 14: ["Controlled Surge"] },
      resources: [{ key: "magicaware", name: "Magic Awareness", feature: "Magic Awareness", reset: "LR", n: PB }] }
  },
  bard: {
    creation: { name: "College of Creation", wiki: "creation", src: "Tasha's Cauldron of Everything", features: { 3: ["Mote of Potential", "Performance of Creation"], 6: ["Animating Performance"], 14: ["Creative Crescendo"] } },
    eloquence: { name: "College of Eloquence", wiki: "eloquence", src: "Mythic Odysseys of Theros", features: { 3: ["Silver Tongue", "Unsettling Words"], 6: ["Unfailing Inspiration", "Universal Speech"], 14: ["Infectious Inspiration"] } },
    spirits: { name: "College of Spirits", wiki: "spirits", src: "Van Richten's Guide to Ravenloft", features: { 3: ["Guiding Whispers", "Spiritual Focus", "Tales from Beyond"], 6: ["Spirit Session"], 14: ["Mystical Connection"] } },
    swords: { name: "College of Swords", wiki: "swords", src: "Xanathar's Guide to Everything", features: { 3: ["Bonus Proficiencies", "Fighting Style", "Blade Flourish"], 6: ["Extra Attack"], 14: ["Master's Flourish"] }, armor: ["Medium armor"], pools: { fightingStyle: step({ 3: 1 }) } },
    whispers: { name: "College of Whispers", wiki: "whispers", src: "Xanathar's Guide to Everything", features: { 3: ["Psychic Blades", "Words of Terror"], 6: ["Mantle of Whispers"], 14: ["Shadow Lore"] } }
  },
  cleric: {
    arcana: { name: "Arcana Domain", wiki: "arcana", src: "Sword Coast Adventurer's Guide", features: { 3: ["Arcane Initiate", "Channel Divinity: Arcane Abjuration"], 6: ["Spell Breaker"], 17: ["Arcane Mastery"] },
      spells: { 3: ["Detect Magic", "Magic Missile", "Magic Weapon", "Nystul's Magic Aura"], 5: ["Dispel Magic", "Magic Circle"], 7: ["Arcane Eye", "Leomund's Secret Chest"], 9: ["Planar Binding", "Teleportation Circle"] } },
    death: { name: "Death Domain", wiki: "death", src: "Dungeon Master's Guide 2014", features: { 3: ["Bonus Proficiency", "Reaper", "Channel Divinity: Touch of Death"], 6: ["Inescapable Destruction"], 17: ["Improved Reaper"] }, wprof: ["martial"],
      spells: { 3: ["False Life", "Ray of Sickness", "Blindness/Deafness", "Ray of Enfeeblement"], 5: ["Animate Dead", "Vampiric Touch"], 7: ["Blight", "Death Ward"], 9: ["Antilife Shell", "Cloudkill"] } },
    forge: { name: "Forge Domain", wiki: "forge", src: "Xanathar's Guide to Everything", features: { 3: ["Bonus Proficiencies", "Blessing of the Forge", "Channel Divinity: Artisan's Blessing"], 6: ["Soul of the Forge"], 17: ["Saint of Forge and Fire"] }, armor: ["Heavy armor"], tools: ["Smith's Tools"],
      spells: { 3: ["Identify", "Searing Smite", "Heat Metal", "Magic Weapon"], 5: ["Elemental Weapon", "Protection from Energy"], 7: ["Fabricate", "Wall of Fire"], 9: ["Animate Objects", "Creation"] } },
    grave: { name: "Grave Domain", wiki: "grave", src: "Xanathar's Guide to Everything", features: { 3: ["Circle of Mortality", "Eyes of the Grave", "Channel Divinity: Path to the Grave"], 6: ["Sentinel at Death's Door"], 17: ["Keeper of Souls"] },
      spells: { 3: ["Bane", "False Life", "Gentle Repose", "Ray of Enfeeblement"], 5: ["Revivify", "Vampiric Touch"], 7: ["Blight", "Death Ward"], 9: ["Antilife Shell", "Raise Dead"] },
      resources: [{ key: "eyesgrave", name: "Eyes of the Grave", feature: "Eyes of the Grave", reset: "LR", n: (l, c) => Math.max(1, c.mod.wis) }, { key: "sentinel", name: "Sentinel at Death's Door", feature: "Sentinel at Death's Door", reset: "LR", n: (l, c) => l >= 6 ? Math.max(1, c.mod.wis) : 0 }] },
    knowledge: { name: "Knowledge Domain", wiki: "knowledge", src: "Player's Handbook 2014", features: { 3: ["Blessings of Knowledge", "Channel Divinity: Knowledge of the Ages"], 6: ["Channel Divinity: Read Thoughts"], 17: ["Visions of the Past"] },
      spells: { 3: ["Command", "Identify", "Augury", "Suggestion"], 5: ["Nondetection", "Speak with Dead"], 7: ["Arcane Eye", "Confusion"], 9: ["Legend Lore", "Scrying"] } },
    nature: { name: "Nature Domain", wiki: "nature", src: "Player's Handbook 2014", features: { 3: ["Acolyte of Nature", "Bonus Proficiency", "Channel Divinity: Charm Animals and Plants"], 6: ["Dampen Elements"], 17: ["Master of Nature"] }, armor: ["Heavy armor"],
      spells: { 3: ["Animal Friendship", "Speak with Animals", "Barkskin", "Spike Growth"], 5: ["Plant Growth", "Wind Wall"], 7: ["Dominate Beast", "Grasping Vine"], 9: ["Insect Plague", "Tree Stride"] } },
    order: { name: "Order Domain", wiki: "order", src: "Tasha's Cauldron of Everything", features: { 3: ["Bonus Proficiencies", "Voice of Authority", "Channel Divinity: Order's Demand"], 6: ["Embodiment of the Law"], 17: ["Order's Wrath"] }, armor: ["Heavy armor"],
      spells: { 3: ["Command", "Heroism", "Hold Person", "Zone of Truth"], 5: ["Mass Healing Word", "Slow"], 7: ["Compulsion", "Locate Creature"], 9: ["Commune", "Dominate Person"] } },
    peace: { name: "Peace Domain", wiki: "peace", src: "Tasha's Cauldron of Everything", features: { 3: ["Implement of Peace", "Emboldening Bond", "Channel Divinity: Balm of Peace"], 6: ["Protective Bond"], 17: ["Expansive Bond"] },
      spells: { 3: ["Heroism", "Sanctuary", "Aid", "Warding Bond"], 5: ["Beacon of Hope", "Sending"], 7: ["Aura of Purity", "Otiluke's Resilient Sphere"], 9: ["Greater Restoration", "Rary's Telepathic Bond"] },
      resources: [{ key: "embolden", name: "Emboldening Bond", feature: "Emboldening Bond", reset: "LR", n: PB }] },
    tempest: { name: "Tempest Domain", wiki: "tempest", src: "Player's Handbook 2014", features: { 3: ["Bonus Proficiencies", "Wrath of the Storm", "Channel Divinity: Destructive Wrath"], 6: ["Thunderbolt Strike"], 17: ["Stormborn"] }, armor: ["Heavy armor"], wprof: ["martial"],
      spells: { 3: ["Fog Cloud", "Thunderwave", "Gust of Wind", "Shatter"], 5: ["Call Lightning", "Sleet Storm"], 7: ["Control Water", "Ice Storm"], 9: ["Destructive Wave", "Insect Plague"] },
      resources: [{ key: "wrathstorm", name: "Wrath of the Storm", feature: "Wrath of the Storm", reset: "LR", n: (l, c) => Math.max(1, c.mod.wis) }] },
    twilight: { name: "Twilight Domain", wiki: "twilight", src: "Tasha's Cauldron of Everything", features: { 3: ["Bonus Proficiencies", "Eyes of Night", "Vigilant Blessing", "Channel Divinity: Twilight Sanctuary"], 6: ["Steps of Night"], 17: ["Twilight Shroud"] }, armor: ["Heavy armor"], wprof: ["martial"],
      spells: { 3: ["Faerie Fire", "Sleep", "Moonbeam", "See Invisibility"], 5: ["Aura of Vitality", "Leomund's Tiny Hut"], 7: ["Aura of Life", "Greater Invisibility"], 9: ["Circle of Power", "Mislead"] },
      resources: [{ key: "stepsnight", name: "Steps of Night", feature: "Steps of Night", reset: "LR", n: (l, c) => l >= 6 ? c.pb : 0 }] }
  },
  druid: {
    dreams: { name: "Circle of Dreams", wiki: "dreams", src: "Xanathar's Guide to Everything", features: { 3: ["Balm of the Summer Court"], 6: ["Hearth of Moonlight and Shadow"], 10: ["Hidden Paths"], 14: ["Walker in Dreams"] },
      resources: [{ key: "balm", name: "Balm of the Summer Court (d6 pool)", feature: "Balm of the Summer Court", reset: "LR", n: l => l }] },
    shepherd: { name: "Circle of the Shepherd", wiki: "shepherd", src: "Xanathar's Guide to Everything", features: { 3: ["Speech of the Woods", "Spirit Totem"], 6: ["Mighty Summoner"], 10: ["Guardian Spirit"], 14: ["Faithful Summons"] },
      resources: [{ key: "totem", name: "Spirit Totem", feature: "Spirit Totem", reset: "SR", n: ONE }] },
    spores: { name: "Circle of Spores", wiki: "spores", src: "Tasha's Cauldron of Everything", features: { 3: ["Circle Spells", "Halo of Spores", "Symbiotic Entity"], 6: ["Fungal Infestation"], 10: ["Spreading Spores"], 14: ["Fungal Body"] },
      spells: { 3: ["Chill Touch", "Blindness/Deafness", "Gentle Repose"], 5: ["Animate Dead", "Gaseous Form"], 7: ["Blight", "Confusion"], 9: ["Cloudkill", "Contagion"] } },
    wildfire: { name: "Circle of Wildfire", wiki: "wildfire", src: "Tasha's Cauldron of Everything", features: { 3: ["Circle Spells", "Summon Wildfire Spirit"], 6: ["Enhanced Bond"], 10: ["Cauterizing Flames"], 14: ["Blazing Revival"] },
      spells: { 3: ["Burning Hands", "Cure Wounds", "Flaming Sphere", "Scorching Ray"], 5: ["Plant Growth", "Revivify"], 7: ["Aura of Life", "Fire Shield"], 9: ["Flame Strike", "Mass Cure Wounds"] } }
  },
  fighter: {
    arcanearcher: { name: "Arcane Archer", wiki: "arcane-archer", src: "Xanathar's Guide to Everything", features: { 3: ["Arcane Archer Lore", "Arcane Shot"], 7: ["Curving Shot", "Magic Arrow"], 15: ["Ever-Ready Shot"] },
      resources: [{ key: "arcaneshot", name: "Arcane Shot", feature: "Arcane Shot", reset: "SR", n: () => 2 }] },
    banneret: { name: "Banneret (Purple Dragon Knight)", wiki: "purple-dragon-knight", src: "Sword Coast Adventurer's Guide", features: { 3: ["Rallying Cry"], 7: ["Royal Envoy"], 10: ["Inspiring Surge"], 15: ["Bulwark"] } },
    cavalier: { name: "Cavalier", wiki: "cavalier", src: "Xanathar's Guide to Everything", features: { 3: ["Bonus Proficiency", "Born to the Saddle", "Unwavering Mark"], 7: ["Warding Maneuver"], 10: ["Hold the Line"], 15: ["Ferocious Charger"], 18: ["Vigilant Defender"] },
      resources: [{ key: "unwavering", name: "Unwavering Mark (special attack)", feature: "Unwavering Mark", reset: "LR", n: (l, c) => Math.max(1, c.mod.str) }, { key: "warding", name: "Warding Maneuver", feature: "Warding Maneuver", reset: "LR", n: (l, c) => l >= 7 ? Math.max(1, c.mod.con) : 0 }] },
    echoknight: { name: "Echo Knight", wiki: "echo-knight", src: "Explorer's Guide to Wildemount", features: { 3: ["Manifest Echo", "Unleash Incarnation"], 7: ["Echo Avatar"], 10: ["Shadow Martyr"], 15: ["Reclaim Potential"], 18: ["Legion of One"] },
      resources: [{ key: "incarnation", name: "Unleash Incarnation", feature: "Unleash Incarnation", reset: "LR", n: (l, c) => Math.max(1, c.mod.con) }] },
    runeknight: { name: "Rune Knight", wiki: "rune-knight", src: "Tasha's Cauldron of Everything", features: { 3: ["Bonus Proficiencies", "Rune Carver", "Giant's Might"], 7: ["Runic Shield"], 10: ["Great Stature"], 15: ["Master of Runes"], 18: ["Runic Juggernaut"] }, tools: ["Smith's Tools"],
      resources: [{ key: "giantsmight", name: "Giant's Might", feature: "Giant's Might", reset: "LR", n: PB }, { key: "runicshield", name: "Runic Shield", feature: "Runic Shield", reset: "LR", n: (l, c) => l >= 7 ? c.pb : 0 }] },
    samurai: { name: "Samurai", wiki: "samurai", src: "Xanathar's Guide to Everything", features: { 3: ["Bonus Proficiency", "Fighting Spirit"], 7: ["Elegant Courtier"], 10: ["Tireless Spirit"], 15: ["Rapid Strike"], 18: ["Strength before Death"] },
      resources: [{ key: "fspirit", name: "Fighting Spirit", feature: "Fighting Spirit", reset: "LR", n: () => 3 }] }
  },
  monk: {
    ascendantdragon: { name: "Way of the Ascendant Dragon", wiki: "ascendant-dragon", src: "Fizban's Treasury of Dragons", features: { 3: ["Draconic Disciple", "Breath of the Dragon"], 6: ["Wings Unfurled"], 11: ["Aspect of the Wyrm"], 17: ["Ascendant Aspect"] },
      resources: [{ key: "dbreath", name: "Breath of the Dragon (free)", feature: "Breath of the Dragon", reset: "LR", n: PB }] },
    astralself: { name: "Way of the Astral Self", wiki: "astral-self", src: "Tasha's Cauldron of Everything", features: { 3: ["Arms of the Astral Self"], 6: ["Visage of the Astral Self"], 11: ["Body of the Astral Self"], 17: ["Awakened Astral Self"] } },
    drunkenmaster: { name: "Way of the Drunken Master", wiki: "drunken-master", src: "Xanathar's Guide to Everything", features: { 3: ["Bonus Proficiencies", "Drunken Technique"], 6: ["Tipsy Sway"], 11: ["Drunkard's Luck"], 17: ["Intoxicated Frenzy"] }, tools: ["Brewer's Supplies"] },
    kensei: { name: "Way of the Kensei", wiki: "kensei", src: "Xanathar's Guide to Everything", features: { 3: ["Path of the Kensei"], 6: ["One with the Blade"], 11: ["Sharpen the Blade"], 17: ["Unerring Accuracy"] } },
    longdeath: { name: "Way of the Long Death", wiki: "long-death", src: "Sword Coast Adventurer's Guide", features: { 3: ["Touch of Death"], 6: ["Hour of Reaping"], 11: ["Mastery of Death"], 17: ["Touch of the Long Death"] } },
    sunsoul: { name: "Way of the Sun Soul", wiki: "sun-soul", src: "Xanathar's Guide to Everything", features: { 3: ["Radiant Sun Bolt"], 6: ["Searing Arc Strike"], 11: ["Searing Sunburst"], 17: ["Sun Shield"] } }
  },
  paladin: {
    conquest: { name: "Oath of Conquest", wiki: "conquest", src: "Xanathar's Guide to Everything", features: { 3: ["Oath Spells", "Channel Divinity: Conquering Presence", "Channel Divinity: Guided Strike"], 7: ["Aura of Conquest"], 15: ["Scornful Rebuke"], 20: ["Invincible Conqueror"] },
      spells: { 3: ["Armor of Agathys", "Command"], 5: ["Hold Person", "Spiritual Weapon"], 9: ["Bestow Curse", "Fear"], 13: ["Dominate Beast", "Stoneskin"], 17: ["Cloudkill", "Dominate Person"] } },
    crown: { name: "Oath of the Crown", wiki: "crown", src: "Sword Coast Adventurer's Guide", features: { 3: ["Oath Spells", "Channel Divinity: Champion Challenge", "Channel Divinity: Turn the Tide"], 7: ["Divine Allegiance"], 15: ["Unyielding Spirit"], 20: ["Exalted Champion"] },
      spells: { 3: ["Command", "Compelled Duel"], 5: ["Warding Bond", "Zone of Truth"], 9: ["Aura of Vitality", "Spirit Guardians"], 13: ["Banishment", "Guardian of Faith"], 17: ["Circle of Power", "Geas"] } },
    redemption: { name: "Oath of Redemption", wiki: "redemption", src: "Xanathar's Guide to Everything", features: { 3: ["Oath Spells", "Channel Divinity: Emissary of Peace", "Channel Divinity: Rebuke the Violent"], 7: ["Aura of the Guardian"], 15: ["Protective Spirit"], 20: ["Emissary of Redemption"] },
      spells: { 3: ["Sanctuary", "Sleep"], 5: ["Calm Emotions", "Hold Person"], 9: ["Counterspell", "Hypnotic Pattern"], 13: ["Otiluke's Resilient Sphere", "Stoneskin"], 17: ["Hold Monster", "Wall of Force"] } },
    watchers: { name: "Oath of the Watchers", wiki: "watchers", src: "Tasha's Cauldron of Everything", features: { 3: ["Oath Spells", "Channel Divinity: Watcher's Will", "Channel Divinity: Abjure the Extraplanar"], 7: ["Aura of the Sentinel"], 15: ["Vigilant Rebuke"], 20: ["Mortal Bulwark"] },
      spells: { 3: ["Alarm", "Detect Magic"], 5: ["Moonbeam", "See Invisibility"], 9: ["Counterspell", "Nondetection"], 13: ["Aura of Purity", "Banishment"], 17: ["Hold Monster", "Scrying"] } },
    oathbreaker: { name: "Oathbreaker", wiki: "oathbreaker", src: "Dungeon Master's Guide 2014", features: { 3: ["Oathbreaker Spells", "Channel Divinity: Control Undead", "Channel Divinity: Dreadful Aspect"], 7: ["Aura of Hate"], 15: ["Supernatural Resistance"], 20: ["Dread Lord"] },
      spells: { 3: ["Hellish Rebuke", "Inflict Wounds"], 5: ["Crown of Madness", "Darkness"], 9: ["Animate Dead", "Bestow Curse"], 13: ["Blight", "Confusion"], 17: ["Contagion", "Dominate Person"] } }
  },
  ranger: {
    drakewarden: { name: "Drakewarden", wiki: "drakewarden", src: "Fizban's Treasury of Dragons", features: { 3: ["Draconic Gift", "Drake Companion"], 7: ["Bond of Fang and Scale"], 11: ["Drake's Breath"], 15: ["Perfected Bond"] } },
    horizonwalker: { name: "Horizon Walker", wiki: "horizon-walker", src: "Xanathar's Guide to Everything", features: { 3: ["Horizon Walker Magic", "Detect Portal", "Planar Warrior"], 7: ["Ethereal Step"], 11: ["Distant Strike"], 15: ["Spectral Defense"] },
      spells: { 3: ["Protection from Evil and Good"], 5: ["Misty Step"], 9: ["Haste"], 13: ["Banishment"], 17: ["Teleportation Circle"] } },
    monsterslayer: { name: "Monster Slayer", wiki: "monster-slayer", src: "Xanathar's Guide to Everything", features: { 3: ["Monster Slayer Magic", "Hunter's Sense", "Slayer's Prey"], 7: ["Supernatural Defense"], 11: ["Magic-User's Nemesis"], 15: ["Slayer's Counter"] },
      spells: { 3: ["Protection from Evil and Good"], 5: ["Zone of Truth"], 9: ["Magic Circle"], 13: ["Banishment"], 17: ["Hold Monster"] },
      resources: [{ key: "huntersense", name: "Hunter's Sense", feature: "Hunter's Sense", reset: "LR", n: (l, c) => Math.max(1, c.mod.wis) }] },
    swarmkeeper: { name: "Swarmkeeper", wiki: "swarmkeeper", src: "Tasha's Cauldron of Everything", features: { 3: ["Gathered Swarm", "Swarmkeeper Magic"], 7: ["Writhing Tide"], 11: ["Mighty Swarm"], 15: ["Swarming Dispersal"] },
      spells: { 3: ["Faerie Fire", "Mage Hand"], 5: ["Web"], 9: ["Gaseous Form"], 13: ["Arcane Eye"], 17: ["Insect Plague"] } }
  },
  rogue: {
    inquisitive: { name: "Inquisitive", wiki: "inquisitive", src: "Xanathar's Guide to Everything", features: { 3: ["Ear for Deceit", "Eye for Detail", "Insightful Fighting"], 9: ["Steady Eye"], 13: ["Unerring Eye"], 17: ["Eye for Weakness"] } },
    mastermind: { name: "Mastermind", wiki: "mastermind", src: "Xanathar's Guide to Everything", features: { 3: ["Master of Intrigue", "Master of Tactics"], 9: ["Insightful Manipulator"], 13: ["Misdirection"], 17: ["Soul of Deceit"] }, tools: ["Disguise Kit", "Forgery Kit", "Gaming Set"] },
    phantom: { name: "Phantom", wiki: "phantom", src: "Tasha's Cauldron of Everything", features: { 3: ["Whispers of the Dead", "Wails from the Grave"], 9: ["Tokens of the Departed"], 13: ["Ghost Walk"], 17: ["Death's Friend"] },
      resources: [{ key: "wails", name: "Wails from the Grave", feature: "Wails from the Grave", reset: "LR", n: PB }] },
    scout: { name: "Scout", wiki: "scout", src: "Xanathar's Guide to Everything", features: { 3: ["Skirmisher", "Survivalist"], 9: ["Superior Mobility"], 13: ["Ambush Master"], 17: ["Sudden Strike"] }, skills: ["Nature", "Survival"] },
    swashbuckler: { name: "Swashbuckler", wiki: "swashbuckler", src: "Xanathar's Guide to Everything", features: { 3: ["Fancy Footwork", "Rakish Audacity"], 9: ["Panache"], 13: ["Elegant Maneuver"], 17: ["Master Duelist"] } }
  },
  sorcerer: {
    divinesoul: { name: "Divine Soul", wiki: "divine-soul", src: "Xanathar's Guide to Everything", features: { 3: ["Divine Magic", "Favored by the Gods"], 6: ["Empowered Healing"], 14: ["Otherworldly Wings"], 18: ["Unearthly Recovery"] },
      pools: { divineAffinity: step({ 3: 1 }) },
      resources: [{ key: "favored", name: "Favored by the Gods", feature: "Favored by the Gods", reset: "SR", n: ONE, die: () => "2d4" }] },
    lunar: { name: "Lunar Sorcery", wiki: "lunar-sorcery", src: "Dragonlance: Shadow of the Dragon Queen", features: { 3: ["Lunar Embodiment", "Moon Fire"], 6: ["Lunar Boons"], 14: ["Waxing and Waning"], 18: ["Lunar Phenomenon"] } },
    shadow: { name: "Shadow Magic", wiki: "shadow-magic", src: "Xanathar's Guide to Everything", features: { 3: ["Eyes of the Dark", "Strength of the Grave"], 6: ["Hound of Ill Omen"], 14: ["Shadow Walk"], 18: ["Umbral Form"] }, spells: { 3: ["Darkness"] } },
    storm: { name: "Storm Sorcery", wiki: "storm-sorcery", src: "Xanathar's Guide to Everything", features: { 3: ["Wind Speaker", "Tempestuous Magic"], 6: ["Heart of the Storm", "Storm Guide"], 14: ["Storm's Fury"], 18: ["Wind Soul"] } }
  },
  warlock: {
    fathomless: { name: "The Fathomless", wiki: "fathomless", src: "Tasha's Cauldron of Everything", features: { 3: ["Expanded Spell List", "Tentacle of the Deeps", "Gift of the Sea"], 6: ["Oceanic Soul", "Guardian Coil"], 10: ["Grasping Tentacles"], 14: ["Fathomless Plunge"] },
      spells: { 3: ["Create or Destroy Water", "Thunderwave", "Gust of Wind", "Silence"], 5: ["Lightning Bolt", "Sleet Storm"], 7: ["Control Water", "Summon Elemental"], 9: ["Bigby's Hand", "Cone of Cold"] },
      resources: [{ key: "tentacle", name: "Tentacle of the Deeps", feature: "Tentacle of the Deeps", reset: "LR", n: PB }] },
    genie: { name: "The Genie", wiki: "genie", src: "Tasha's Cauldron of Everything", features: { 3: ["Expanded Spell List", "Genie's Vessel"], 6: ["Elemental Gift"], 10: ["Sanctuary Vessel"], 14: ["Limited Wish"] },
      pools: { genieKind: step({ 3: 1 }) },
      resources: [{ key: "bottled", name: "Bottled Respite", feature: "Genie's Vessel", reset: "LR", n: ONE }, { key: "elgift", name: "Elemental Gift (flight)", feature: "Elemental Gift", reset: "LR", n: (l, c) => l >= 6 ? c.pb : 0 }] },
    hexblade: { name: "The Hexblade", wiki: "hexblade", src: "Xanathar's Guide to Everything", features: { 3: ["Expanded Spell List", "Hexblade's Curse", "Hex Warrior"], 6: ["Accursed Specter"], 10: ["Armor of Hexes"], 14: ["Master of Hexes"] }, armor: ["Medium armor", "Shields"], wprof: ["martial"],
      spells: { 3: ["Shield", "Wrathful Smite", "Blur", "Branding Smite"], 5: ["Blink", "Elemental Weapon"], 7: ["Phantasmal Killer", "Staggering Smite"], 9: ["Banishing Smite", "Cone of Cold"] },
      resources: [{ key: "hexcurse", name: "Hexblade's Curse", feature: "Hexblade's Curse", reset: "SR", n: ONE }] },
    undead: { name: "The Undead", wiki: "undead", src: "Van Richten's Guide to Ravenloft", features: { 3: ["Expanded Spell List", "Form of Dread"], 6: ["Grave Touched"], 10: ["Necrotic Husk"], 14: ["Spirit Projection"] },
      spells: { 3: ["Bane", "False Life", "Blindness/Deafness", "Phantasmal Force"], 5: ["Phantom Steed", "Speak with Dead"], 7: ["Death Ward", "Greater Invisibility"], 9: ["Antilife Shell", "Cloudkill"] },
      resources: [{ key: "dread", name: "Form of Dread", feature: "Form of Dread", reset: "LR", n: PB }] },
    undying: { name: "The Undying", wiki: "undying", src: "Sword Coast Adventurer's Guide", features: { 3: ["Expanded Spell List", "Among the Dead"], 6: ["Defy Death"], 10: ["Undying Nature"], 14: ["Indestructible Life"] },
      spells: { 3: ["False Life", "Ray of Sickness", "Blindness/Deafness", "Silence"], 5: ["Feign Death", "Speak with Dead"], 7: ["Aura of Life", "Death Ward"], 9: ["Contagion", "Legend Lore"] },
      resources: [{ key: "defydeath", name: "Defy Death", feature: "Defy Death", reset: "LR", n: (l) => l >= 6 ? 1 : 0 }] }
  },
  wizard: {
    bladesinging: { name: "Bladesinging", wiki: "bladesinging", src: "Tasha's Cauldron of Everything", features: { 3: ["Training in War and Song", "Bladesong"], 6: ["Extra Attack"], 10: ["Song of Defense"], 14: ["Song of Victory"] }, armor: ["Light armor"], wprof: ["martialFL"],
      resources: [{ key: "bladesong", name: "Bladesong", feature: "Bladesong", reset: "LR", n: PB }] },
    chronurgy: { name: "Chronurgy Magic", wiki: "chronurgy", src: "Explorer's Guide to Wildemount", features: { 3: ["Chronal Shift", "Temporal Awareness"], 6: ["Momentary Stasis"], 10: ["Arcane Abeyance"], 14: ["Convergent Future"] },
      resources: [{ key: "chronal", name: "Chronal Shift", feature: "Chronal Shift", reset: "LR", n: () => 2 }] },
    conjuration: { name: "School of Conjuration", wiki: "conjuration", src: "Player's Handbook 2014", features: { 3: ["Conjuration Savant", "Minor Conjuration"], 6: ["Benign Transposition"], 10: ["Focused Conjuration"], 14: ["Durable Summons"] } },
    enchantment: { name: "School of Enchantment", wiki: "enchantment", src: "Player's Handbook 2014", features: { 3: ["Enchantment Savant", "Hypnotic Gaze"], 6: ["Instinctive Charm"], 10: ["Split Enchantment"], 14: ["Alter Memories"] } },
    graviturgy: { name: "Graviturgy Magic", wiki: "graviturgy", src: "Explorer's Guide to Wildemount", features: { 3: ["Adjust Density"], 6: ["Gravity Well"], 10: ["Violent Attraction"], 14: ["Event Horizon"] } },
    necromancy: { name: "School of Necromancy", wiki: "necromancy", src: "Player's Handbook 2014", features: { 3: ["Necromancy Savant", "Grim Harvest"], 6: ["Undead Thralls"], 10: ["Inured to Undeath"], 14: ["Command Undead"] }, spells: { 6: ["Animate Dead"] } },
    scribes: { name: "Order of Scribes", wiki: "order-of-scribes", src: "Tasha's Cauldron of Everything", features: { 3: ["Wizardly Quill", "Awakened Spellbook"], 6: ["Manifest Mind"], 10: ["Master Scrivener"], 14: ["One with the Word"] } },
    transmutation: { name: "School of Transmutation", wiki: "transmutation", src: "Player's Handbook 2014", features: { 3: ["Transmutation Savant", "Minor Alchemy"], 6: ["Transmuter's Stone"], 10: ["Shapechanger"], 14: ["Master Transmuter"] }, spells: { 10: ["Polymorph"] } },
    warmagic: { name: "War Magic", wiki: "war-magic", src: "Xanathar's Guide to Everything", features: { 3: ["Arcane Deflection", "Tactical Wit"], 6: ["Power Surge"], 10: ["Durable Magic"], 14: ["Deflecting Shroud"] } }
  }
};
for (const s of Object.values(LEGACY_SUBCLASSES.cleric)) s.features[3].unshift("Domain Spells");
for (const [cls, subs] of Object.entries(LEGACY_SUBCLASSES)) for (const [k, s] of Object.entries(subs)) {
  if (!CLASSES[cls].subclasses[k]) CLASSES[cls].subclasses[k] = { ...s, legacy: true, slug: cls + ":legacy-" + s.wiki };
  else CLASSES[cls].subclasses[k + "2014"] = { ...s, legacy: true, slug: cls + ":legacy-" + s.wiki };
}
for (const [k, s] of Object.entries(SPECIES)) if (s.legacy) s.slug = "species:legacy-" + s.wiki;

// ---------- languages: standard, rare and other (exotic / setting) ----------
const LANG_EXOTIC = ["Aarakocra", "Aquan", "Auran", "Ignan", "Terran", "Gith", "Gnoll", "Grung", "Leonin", "Loxodon", "Minotaur", "Quori", "Sahuagin", "Thri-kreen", "Vedalken", "Yeti", "Modron", "Slaad", "Sphinx", "Blink Dog", "Giant Eagle", "Giant Owl", "Bullywug", "Hook Horror", "Ixitxachitl", "Kraul", "Merfolk", "Bothii", "Daelkyr"];

POOLS.spSkills = { label: "Skill proficiencies (species)", options: ctx => (ctx && ctx.from) || ALL_SKILLS };
POOLS.genieKind = { label: "Genie kind", options: () => ["Dao (Earth)", "Djinni (Air)", "Efreeti (Fire)", "Marid (Water)"] };
POOLS.divineAffinity = { label: "Divine Magic affinity", options: () => ["Good (Cure Wounds)", "Evil (Inflict Wounds)", "Law (Bless)", "Chaos (Bane)", "Neutrality (Protection from Evil and Good)"] };
POOLS.langOrigin = { label: "Languages (choose 2 — standard; rare and other languages if your DM allows)", options: () => LANG_STANDARD.concat(LANG_RARE, ["Druidic", "Thieves' Cant"], LANG_EXOTIC) };
POOLS.langDeft.options = () => LANG_STANDARD.concat(LANG_RARE, LANG_EXOTIC);
// Aasimar: the Celestial Revelation form is picked each time it is used (on the sheet), not when building
delete SPECIES.aasimar.choice;
SPECIES.aasimar.resources.find(r => r.key === "revelation").forms = ["Heavenly Wings", "Inner Radiance", "Necrotic Shroud"];
