"use strict";
/* ============ Official subclasses released after the 2024 Player's Handbook ============
   - Heroes of Faerûn (Forgotten Realms, Nov 2025)
   - Arcana Unleashed (2026): two new subclasses plus 2024 versions of six older ones
   - D&D: World of Warcraft (2026)
   Rules text comes from the imported wiki when it has the page; otherwise the short
   summaries in SUB_DESC below are shown (written for this app, not the book text).
   choiceSpells: always-prepared spells that depend on a choice (a pool) the player makes.
*/
const NEW_SUBCLASSES = {
  barbarian: {
    spiritualguardian: { name: "Path of the Spiritual Guardian", src: "D&D: World of Warcraft", features: { 3: ["Spiritual Protectors"], 6: ["Spirit Shield"], 10: ["Consult the Spirits"], 14: ["Spirits' Fury"] } },
    elements: { name: "Path of the Elements", src: "D&D: World of Warcraft", features: { 3: ["Raging Elements"], 6: ["Echo of the Elements"], 10: ["Primordial Bond"], 14: ["Elemental Overload"] } }
  },
  bard: {
    moon: { name: "College of the Moon", src: "Heroes of Faerûn", features: { 3: ["Moon's Inspiration", "Primal Lore"], 6: ["Blessing of Moonlight"], 14: ["Eventide's Splendor"] },
      spells: { 6: ["Moonbeam"] }, pools: { moonSkill: step({ 3: 1 }) },
      resources: [{ key: "moonblessing", name: "Blessing of Moonlight", feature: "Blessing of Moonlight", reset: "LR", n: step({ 6: 1 }) }] }
  },
  cleric: {
    knowledge24: { name: "Knowledge Domain", src: "Heroes of Faerûn", features: { 3: ["Blessings of Knowledge", "Knowledge Domain Spells", "Mind Magic"], 6: ["Unfettered Mind"], 17: ["Divine Foreknowledge"] },
      spells: { 3: ["Command", "Comprehend Languages", "Detect Magic", "Detect Thoughts", "Identify", "Mind Spike"], 5: ["Dispel Magic", "Nondetection", "Tongues"], 7: ["Arcane Eye", "Banishment", "Confusion"], 9: ["Legend Lore", "Scrying", "Synaptic Static"] },
      resources: [{ key: "foreknow", name: "Divine Foreknowledge", feature: "Divine Foreknowledge", reset: "LR", note: "or spend a level 6+ slot", n: step({ 17: 1 }) }] },
    arcana24: { name: "Arcana Domain", src: "Arcana Unleashed", features: { 3: ["Arcana Domain Spells", "Modify Magic", "Student of Arcana"], 6: ["Dispelling Recovery"], 17: ["Magical Mastery"] },
      spells: { 3: ["Detect Magic", "Magic Missile", "Magic Weapon", "Nystul's Magic Aura"], 5: ["Counterspell", "Dispel Magic"], 7: ["Arcane Eye", "Leomund's Secret Chest"], 9: ["Bigby's Hand", "Teleportation Circle"] },
      resources: [{ key: "dispelrec", name: "Dispelling Recovery", feature: "Dispelling Recovery", reset: "SR", n: step({ 6: 1 }) }] },
    discipline: { name: "Discipline Domain", src: "D&D: World of Warcraft", features: { 3: ["Holy Bolt", "Atonement"], 6: ["Luminous Barrier"] } },
    shadow24: { name: "Shadow Domain", src: "D&D: World of Warcraft", features: { 3: ["Shadow Domain Spells", "Devouring Plague", "Shadowform"], 6: ["Dispersion"], 17: ["Vampiric Embrace"] },
      spells: { 3: ["Crown of Madness", "Dissonant Whispers", "Mind Spike", "Shadow Word: Pain"], 5: ["Summon Undead", "Vampiric Touch"], 7: ["Evard's Black Tentacles", "Psychic Horror"], 9: ["Dominate Person", "Void Eruption"] },
      resources: [{ key: "plague", name: "Devouring Plague", feature: "Devouring Plague", reset: "LR", n: (l, c) => Math.max(1, c.mod.wis) }] }
  },
  fighter: {
    purpledragon: { name: "Purple Dragon Knight", src: "Heroes of Faerûn", features: { 3: ["Knightly Envoy", "Purple Dragon Companion"], 7: ["Dragon Rider"], 10: ["Rallying Surge"], 15: ["Amethyst Pinnacle"], 18: ["Enduring Commander"] } },
    arcanearcher24: { name: "Arcane Archer", src: "Arcana Unleashed", features: { 3: ["Arcane Archer Lore", "Arcane Shot"], 7: ["Curving Shot", "Magical Ammunition"], 10: ["Ever-Ready Shot"], 15: ["Indomitable Teleport"], 18: ["Masterful Shots"] },
      resources: [{ key: "arcaneshot", name: "Arcane Shot", feature: "Arcane Shot", reset: "SR", n: (l, c) => Math.max(1, c.mod.int) }] }
  },
  monk: {
    mysticarts: { name: "Warrior of the Mystic Arts", src: "Arcana Unleashed", caster: { type: "third", ability: "wis", cantrips: step({ 3: 2, 10: 3 }), prepared: PREP.third, list: "sorcerer" },
      features: { 3: ["Spellcasting"], 6: ["Mystic Fighting Style", "Mystic Focus"], 11: ["Focused Strike"], 17: ["Improved Mystic Fighting Style"] } },
    mysticbrews: { name: "Warrior of Mystic Brews", src: "D&D: World of Warcraft", features: { 3: ["Bonus Proficiencies", "Drunken Technique"], 6: ["Tipsy Sway", "Mystic Brew"], 11: ["Wizened Brewer"], 17: ["Master Brewer", "Intoxicated Frenzy"] },
      skills: ["Performance"], tools: ["Brewer's Supplies"] }
  },
  paladin: {
    noblegenies: { name: "Oath of the Noble Genies", src: "Heroes of Faerûn", features: { 3: ["Elemental Smite", "Genie Spells", "Genie's Splendor"], 7: ["Aura of Elemental Shielding"], 15: ["Elemental Rebuke"], 20: ["Noble Scion"] },
      spells: { 3: ["Chromatic Orb", "Elementalism", "Thunderous Smite"], 5: ["Mirror Image", "Phantasmal Force"], 9: ["Fly", "Gaseous Form"], 13: ["Conjure Minor Elementals", "Summon Elemental"], 17: ["Banishing Smite", "Contact Other Plane"] },
      resources: [{ key: "rebuke", name: "Elemental Rebuke", feature: "Elemental Rebuke", reset: "LR", n: (l, c) => l >= 15 ? Math.max(1, c.mod.cha) : 0 },
        { key: "scion", name: "Noble Scion", feature: "Noble Scion", reset: "LR", note: "or spend a level 5 slot", n: step({ 20: 1 }) }] },
    ebonblade: { name: "Oath of the Ebon Blade", src: "D&D: World of Warcraft", features: { 3: ["Death Coil", "Runic Smite", "Oath of the Ebon Blade Spells", "Runeforging", "Runic Power"], 5: ["Otherworldly Steed"], 7: ["Aura of Deathly Endurance"], 11: ["Runic Strikes"], 14: ["Improved Death Coil"], 15: ["Runic Mastery"], 20: ["Aspect of the Horsemen"] },
      spells: { 3: ["Death Grip"], 5: ["Death and Decay"], 9: ["Summon Undead"], 13: ["Freedom of Movement"], 17: ["Circle of Power"] },
      pools: { ebonRune: step({ 3: 1 }) },
      choiceSpells: { pool: "ebonRune", by: {
        "Blood rune": { 3: ["Vampiric Blood"], 5: ["Spiritual Weapon"], 9: ["Leeching Strike"], 13: ["Evard's Black Tentacles"], 17: ["Bonestorm"] },
        "Frost rune": { 3: ["Chains of Ice"], 5: ["Frostscythe"], 9: ["Remorseless Winter"], 13: ["Ice Storm"], 17: ["Cone of Cold"] },
        "Unholy rune": { 3: ["Scourge Strike"], 5: ["Ray of Enfeeblement"], 9: ["Bestow Curse"], 13: ["Blight"], 17: ["Contagion"] } } },
      resources: [{ key: "runicmastery", name: "Runic Mastery", feature: "Runic Mastery", reset: "LR", note: "or spend a level 4+ slot", n: step({ 15: 1 }) }] },
    holy: { name: "Oath of the Holy", src: "D&D: World of Warcraft", features: { 3: ["Oath of the Holy Spells", "Beacon of Light"], 7: ["Lightbringer's Aura"], 15: ["Infusion of Light"], 20: ["Holy Deliverance"] },
      spells: { 3: ["Cure Wounds", "Healing Word"], 5: ["Lesser Restoration", "Prayer of Healing"], 9: ["Dispel Magic", "Mass Healing Word"], 13: ["Aura of Life", "Death Ward"], 17: ["Greater Restoration", "Mass Cure Wounds"] } }
  },
  ranger: {
    winterwalker: { name: "Winter Walker", src: "Heroes of Faerûn", features: { 3: ["Frigid Explorer", "Hunter's Rime", "Winter Walker Spells"], 7: ["Fortifying Soul"], 11: ["Chilling Retribution"], 15: ["Frozen Haunt"] },
      spells: { 3: ["Ice Knife"], 5: ["Hold Person"], 9: ["Remove Curse"], 13: ["Ice Storm"], 17: ["Cone of Cold"] },
      notes: { "Frigid Explorer": l => "Polar Strikes +" + (l >= 11 ? "1d6" : "1d4") + " Cold" },
      resources: [{ key: "fortify", name: "Fortifying Soul", feature: "Fortifying Soul", reset: "LR", n: step({ 7: 1 }) },
        { key: "chilling", name: "Chilling Retribution", feature: "Chilling Retribution", reset: "LR", n: (l, c) => l >= 11 ? Math.max(1, c.mod.wis) : 0 },
        { key: "haunt", name: "Frozen Haunt", feature: "Frozen Haunt", reset: "LR", note: "or spend a level 4+ slot", n: step({ 15: 1 }) }] },
    demonhunter: { name: "Demon Hunter", src: "D&D: World of Warcraft", features: { 3: ["Demon Hunter Spells", "Soul Fragments", "Soul Cleave", "Spectral Sight"], 7: ["Torment"], 11: ["Illidari Knowledge"], 15: ["Soul Shatter"], 18: ["Improved Spectral Sight"] },
      spells: { 3: ["Throw Glaive"], 5: ["Sigil of Flame"], 9: ["Metamorphosis"], 13: ["Chaos Nova"], 17: ["Destructive Wave"] }, pools: { dhPath: step({ 3: 1 }) } }
  },
  rogue: {
    scion: { name: "Scion of the Three", src: "Heroes of Faerûn", features: { 3: ["Bloodthirst", "Dread Allegiance"], 9: ["Strike Fear"], 13: ["Aura of Malevolence"], 17: ["Dread Incarnate"] },
      pools: { dreadAllegiance: step({ 3: 1 }) },
      choiceSpells: { pool: "dreadAllegiance", by: { "Bane (Psychic resistance)": { 3: ["Minor Illusion"] }, "Bhaal (Poison resistance)": { 3: ["Blade Ward"] }, "Myrkul (Necrotic resistance)": { 3: ["Chill Touch"] } } },
      resources: [{ key: "bloodthirst", name: "Bloodthirst", feature: "Bloodthirst", reset: "LR", note: "from level 17: regain 1 on Short Rest", n: (l, c) => Math.max(1, c.mod.int) }] },
    swashbuckler24: { name: "Swashbuckler", src: "D&D: World of Warcraft", features: { 3: ["Fancy Footwork", "Rakish Audacity"], 9: ["Panache"], 13: ["Dashing Strikes"], 17: ["Master Duelist"] } }
  },
  sorcerer: {
    spellfire: { name: "Spellfire Sorcery", src: "Heroes of Faerûn", features: { 3: ["Spellfire Burst", "Spellfire Spells"], 6: ["Absorb Spells"], 14: ["Honed Spellfire"], 18: ["Crown of Spellfire"] },
      spells: { 3: ["Cure Wounds", "Guiding Bolt", "Lesser Restoration", "Scorching Ray"], 5: ["Aura of Vitality", "Dispel Magic"], 6: ["Counterspell"], 7: ["Fire Shield", "Wall of Fire"], 9: ["Flame Strike", "Greater Restoration"] },
      resources: [{ key: "crown", name: "Crown of Spellfire", feature: "Crown of Spellfire", reset: "LR", note: "or spend Sorcery Points", n: step({ 18: 1 }) }] }
  },
  warlock: {
    vestige: { name: "Vestige Patron", src: "Arcana Unleashed", features: { 3: ["Vestige Companion", "Vestige Spells"], 6: ["Vestige Power"], 10: ["Vestige Recovery"], 14: ["Semblance of Life"] },
      pools: { vestigeList: step({ 3: 1 }) },
      choiceSpells: { pool: "vestigeList", by: {
        "Life": { 3: ["Aid", "Bless", "Cure Wounds", "Lesser Restoration"], 5: ["Mass Healing Word", "Revivify"], 7: ["Aura of Life", "Death Ward"], 9: ["Greater Restoration", "Mass Cure Wounds"] },
        "Light": { 3: ["Burning Hands", "Faerie Fire", "Scorching Ray", "See Invisibility"], 5: ["Daylight", "Fireball"], 7: ["Arcane Eye", "Wall of Fire"], 9: ["Flame Strike", "Scrying"] },
        "Trickery": { 3: ["Charm Person", "Disguise Self", "Invisibility", "Pass without Trace"], 5: ["Hypnotic Pattern", "Nondetection"], 7: ["Confusion", "Dimension Door"], 9: ["Dominate Person", "Modify Memory"] },
        "War": { 3: ["Guiding Bolt", "Magic Weapon", "Shield of Faith", "Spiritual Weapon"], 5: ["Crusader's Mantle", "Spirit Guardians"], 7: ["Fire Shield", "Freedom of Movement"], 9: ["Hold Monster", "Steel Wind Strike"] } } },
      resources: [{ key: "vestigerec", name: "Vestige Recovery", feature: "Vestige Recovery", reset: "LR", n: step({ 10: 1 }) }] }
  },
  wizard: {
    bladesinger: { name: "Bladesinger", src: "Heroes of Faerûn", features: { 3: ["Bladesong", "Training in War and Song"], 6: ["Extra Attack"], 10: ["Song of Defense"], 14: ["Song of Victory"] },
      wprof: ["martial"], pools: { bladeSkill: step({ 3: 1 }) },
      resources: [{ key: "bladesong", name: "Bladesong", feature: "Bladesong", reset: "LR", note: "regain 1 with Arcane Recovery", n: (l, c) => Math.max(1, c.mod.int) }] },
    conjurer: { name: "Conjurer", src: "Arcana Unleashed", features: { 3: ["Conjuration Savant", "Benign Transposition"], 6: ["Distant Transposition", "Durable Summons"], 10: ["Focused Conjuration"], 14: ["Splintered Summons"] },
      resources: [{ key: "transpose", name: "Benign Transposition", feature: "Benign Transposition", reset: "LR", n: (l, c) => Math.max(1, c.mod.int) }] },
    enchanter: { name: "Enchanter", src: "Arcana Unleashed", features: { 3: ["Enchantment Savant", "Enchanting Conversationalist", "Hypnotic Presence"], 6: ["Split Enchantment"], 10: ["Instinctive Charm"], 14: ["Alter Memories"] },
      resources: [{ key: "hypnotic", name: "Hypnotic Presence", feature: "Hypnotic Presence", reset: "LR", n: (l, c) => Math.max(1, c.mod.int) }] },
    necromancer: { name: "Necromancer", src: "Arcana Unleashed", features: { 3: ["Necromancy Savant", "Necromancy Spellbook"], 6: ["Grave Power", "Undead Thralls"], 10: ["Harvest Undead"], 14: ["Death's Master"] }, spells: { 3: ["Find Familiar"], 6: ["Animate Dead"] } },
    transmuter: { name: "Transmuter", src: "Arcana Unleashed", features: { 3: ["Transmutation Savant", "Transmuter's Stone", "Wondrous Alteration"], 6: ["Empowered Transmutation"], 10: ["Potent Stone", "Shape-Shifter"], 14: ["Master Transmuter"] } }
  }
};
for (const [cls, subs] of Object.entries(NEW_SUBCLASSES)) Object.assign(CLASSES[cls].subclasses, subs);

Object.assign(POOLS, {
  moonSkill: { label: "Primal Lore (skill)", skill: true, options: () => ["Animal Handling", "Insight", "Medicine", "Nature", "Perception", "Survival"] },
  bladeSkill: { label: "Training in War and Song (skill)", skill: true, options: () => ["Acrobatics", "Athletics", "Performance", "Persuasion"] },
  ebonRune: { label: "Runeforging (rune)", options: () => ["Blood rune", "Frost rune", "Unholy rune"] },
  dreadAllegiance: { label: "Dread Allegiance (god)", options: () => ["Bane (Psychic resistance)", "Bhaal (Poison resistance)", "Myrkul (Necrotic resistance)"] },
  vestigeList: { label: "Vestige spell list", options: () => ["Life", "Light", "Trickery", "War"] },
  dhPath: { label: "Demon Hunter path", options: () => ["Devourer", "Havoc", "Vengeance"] }
});

// Short fallback summaries, shown only when the imported wiki has no text for the feature.
const SUB_DESC = {
  // Path of the Spiritual Guardian
  "Spiritual Protectors": "While raging you call protective ancestral spirits around you; they hinder enemies that attack your allies.",
  "Spirit Shield": "When a creature near you takes damage while you rage, you can use your Reaction to let the spirits absorb part of it.",
  "Consult the Spirits": "You can ask the spirits for guidance, casting divination magic (such as Augury or Clairvoyance) without a spell slot.",
  "Spirits' Fury": "Your protective spirits turn vengeful: creatures they hinder also take damage.",
  // Path of the Elements
  "Raging Elements": "While raging you channel ice, lava or lightning, adding an elemental effect to your attacks and surroundings.",
  "Echo of the Elements": "Your elemental power lingers, letting you call on a second element or repeat an elemental effect.",
  "Primordial Bond": "Your bond with the elements grants resistance and elemental utility outside of combat.",
  "Elemental Overload": "Once per rage you can unleash a burst of combined elemental power around you.",
  // College of the Moon
  "Moon's Inspiration": "Inspired Eclipse: when you give Bardic Inspiration as a Bonus Action you can turn Invisible and teleport up to 30 ft. Lunar Vitality: once per turn when you heal with a spell, spend a Bardic Inspiration die to add it to the healing; the target's Speed rises by 10 ft until the end of its next turn.",
  "Primal Lore": "You learn Druidic and one Druid cantrip (a Bard spell for you, not counting against cantrips known), and gain proficiency in Animal Handling, Insight, Medicine, Nature, Perception or Survival.",
  "Blessing of Moonlight": "You always have Moonbeam prepared. Once per Long Rest you can cast it with extra benefits.",
  "Eventide's Splendor": "Shadow of the New Moon: the target of Inspired Eclipse can also turn Invisible and teleport 30 ft as a Reaction. Vibrance of the Full Moon: you can roll 1d6 for Lunar Vitality instead of spending a Bardic Inspiration die.",
  // Knowledge Domain
  "Blessings of Knowledge": "You gain proficiency (and Expertise) in knowledge skills such as Arcana, History, Nature or Religion, and learn languages.",
  "Knowledge Domain Spells": "You always have your Knowledge Domain spells prepared.",
  "Mind Magic": "Use Channel Divinity to cast one of your Knowledge Domain spells without a spell slot.",
  "Unfettered Mind": "You gain telepathy and proficiency in Intelligence saving throws.",
  "Divine Foreknowledge": "For a while you get Advantage on d20 tests. Once per Long Rest, or by spending a level 6+ spell slot.",
  // Arcana Domain (2024)
  "Arcana Domain Spells": "You always have your Arcana Domain spells prepared.",
  "Modify Magic": "Use Channel Divinity (no action) when you cast a spell to grant allies Temporary Hit Points or make the spell's saving throw harder to resist.",
  "Student of Arcana": "You gain proficiency in Arcana and learn Wizard cantrips that count as Cleric spells for you.",
  "Dispelling Recovery": "Once per Short Rest, when you cast a healing spell you can also cast Dispel Magic without a spell slot as part of it.",
  "Magical Mastery": "You add high-level Wizard spells to your Cleric spells, and can swap them when you gain a level.",
  // Discipline / Shadow Domain
  "Holy Bolt": "A radiant bolt of holy power that damages a foe or restores an ally.",
  "Atonement": "When you damage a creature with a spell, an ally of your choice nearby regains Hit Points.",
  "Luminous Barrier": "Raise a barrier of light that shields allies with Temporary Hit Points.",
  "Shadow Domain Spells": "You always have your Shadow Domain spells prepared.",
  "Devouring Plague": "Infect a creature with a plague of shadow that deals Necrotic damage over time. Uses equal to your Wisdom modifier per Long Rest.",
  "Shadowform": "Take on a form of living shadow that strengthens your Necrotic and Psychic magic.",
  "Dispersion": "Reaction: dissolve into shadow to reduce the damage you take.",
  "Vampiric Embrace": "Your damaging shadow spells heal you and your allies.",
  // Purple Dragon Knight
  "Knightly Envoy": "You learn a language and can cast Comprehend Languages as a Ritual.",
  "Purple Dragon Companion": "A young purple dragon companion fights beside you. It has a Gravity Breath; you can revive it with a use of Second Wind.",
  "Dragon Rider": "You can ride your dragon companion, and sharing Second Wind with it restores its breath.",
  "Rallying Surge": "When you use Action Surge, allies near you also benefit.",
  "Amethyst Pinnacle": "Your dragon grows stronger; it can use Gravity Breath in place of two of your attacks.",
  "Enduring Commander": "You and your companion become harder to bring down, and your Second Wind empowers allies.",
  // Arcane Archer (2024)
  "Arcane Archer Lore": "You learn magical arrow lore: a Wizard or Druid cantrip and proficiency in Arcana or Nature.",
  "Arcane Shot": "Once per turn when you hit with an arrow you can add an Arcane Shot option (conditions or extra damage). Uses equal to your Intelligence modifier per Short Rest.",
  "Curving Shot": "Bonus Action: reroll a missed arrow attack against a different target within 60 ft.",
  "Magical Ammunition": "Your arrows count as magical and you can create utility arrows, such as a rope arrow up to 120 ft.",
  "Ever-Ready Shot": "If you have no Arcane Shot uses left when you roll Initiative, you regain one.",
  "Indomitable Teleport": "When you use Indomitable you can also teleport a short distance.",
  "Masterful Shots": "You can apply two Arcane Shot options to one hit.",
  // Warrior of the Mystic Arts
  "Mystic Fighting Style": "You can replace one Unarmed Strike with a cantrip when you take the Attack action.",
  "Mystic Focus": "Unspent Focus Points can be turned into spell slots when you finish a Short Rest or use Uncanny Metabolism.",
  "Focused Strike": "Stunning Strike improves when combined with your spells.",
  "Improved Mystic Fighting Style": "You can replace attacks of Flurry of Blows with a level 1 or 2 spell such as Shatter or Web.",
  // Warrior of Mystic Brews
  "Drunken Technique": "With Flurry of Blows you also gain Disengage, Dodge and extra movement, swaying unpredictably.",
  "Tipsy Sway": "Redirect a missed attack to another creature, and stand up from Prone using only 5 ft of movement.",
  "Mystic Brew": "Brew magical drinks with temporary benefits; spend a Focus Point to activate one when danger is near, or let it last 8 hours.",
  "Wizened Brewer": "You learn three more brew options.",
  "Master Brewer": "You can benefit from two brew effects at once.",
  "Intoxicated Frenzy": "When you use Flurry of Blows you can make extra Unarmed Strikes against different targets.",
  // Oath of the Noble Genies
  "Elemental Smite": "Use Channel Divinity after hitting with a Smite to add an elemental effect tied to your genie (Dao, Djinni, Efreeti or Marid).",
  "Genie Spells": "You always have your Oath of the Noble Genies spells prepared.",
  "Genie's Splendor": "You gain genie-themed benefits: a skill proficiency and an elemental gift based on your chosen genie.",
  "Aura of Elemental Shielding": "You and allies in your aura have resistance to one elemental damage type, which you can change.",
  "Elemental Rebuke": "Reaction when hit: deal elemental damage to the attacker. Uses equal to your Charisma modifier per Long Rest.",
  "Noble Scion": "Take on a genie-like form for a minute: flight, extra damage and resistances. Once per Long Rest, or spend a level 5 spell slot.",
  // Oath of the Ebon Blade
  "Death Coil": "Replaces Lay on Hands: a pool of necrotic power (d8s) that damages living enemies or heals you and Undead allies.",
  "Runic Smite": "Replaces Paladin's Smite with a Necrotic rune strike.",
  "Oath of the Ebon Blade Spells": "You always have your oath spells prepared, plus the spells of the rune you chose with Runeforging.",
  "Runeforging": "Inscribe a Blood, Frost or Unholy rune on your weapon; it decides extra oath spells and effects.",
  "Runic Power": "Use Channel Divinity to empower your rune for a burst of power.",
  "Otherworldly Steed": "Your Faithful Steed is a spectral death charger; once per Long Rest it can pass through solid objects.",
  "Aura of Deathly Endurance": "You and allies in your aura are harder to kill and resist the chill of death.",
  "Runic Strikes": "Replaces Radiant Strikes: your weapon hits deal extra Necrotic damage.",
  "Improved Death Coil": "Death Coil becomes stronger and can be used as part of your attacks.",
  "Runic Mastery": "Unleash your rune's ultimate power. Once per Long Rest, or spend a level 4+ spell slot.",
  "Aspect of the Horsemen": "Become an avatar of the Four Horsemen for a minute, empowering your runes and Runic Power.",
  // Oath of the Holy
  "Oath of the Holy Spells": "You always have your Oath of the Holy spells prepared.",
  "Beacon of Light": "Mark an ally as your beacon: when you heal another creature, the beacon regains half as much.",
  "Lightbringer's Aura": "Bloodied creatures in your aura regain an extra 1d6 when you heal them.",
  "Infusion of Light": "Your healing spells can refill your Lay on Hands pool (up to 5 × your Paladin level).",
  "Holy Deliverance": "Your aura heals Bloodied allies and revives allies at 0 Hit Points at the start of their turns.",
  // Winter Walker
  "Frigid Explorer": "Biting Cold: your attacks, Ranger spells and features ignore Cold resistance. Frost Resistance: you resist Cold. Polar Strikes: once per turn a weapon hit deals extra Cold damage (1d4, 1d6 from level 11).",
  "Hunter's Rime": "When you cast Hunter's Mark you gain 1d10 + Ranger level Temporary Hit Points, and the marked creature can't Disengage.",
  "Winter Walker Spells": "You always have your Winter Walker spells prepared.",
  "Fortifying Soul": "Magic action: up to your Wisdom modifier creatures you can see regain 1d10 + Ranger level HP and have Advantage on saves against Frightened for 1 hour. Once per Long Rest.",
  "Chilling Retribution": "Reaction when hit: the attacker makes a Wisdom save or is Stunned (Speed 0) until the end of your next turn. Uses equal to your Wisdom modifier per Long Rest.",
  "Frozen Haunt": "When you cast Hunter's Mark, take a ghostly frozen form: Cold immunity, 2d4 Cold to chosen creatures in a 15-ft Emanation each turn, immunity to Grappled/Prone/Restrained and you can move through creatures and objects. Once per Long Rest, or spend a level 4+ slot.",
  // Demon Hunter
  "Demon Hunter Spells": "You always have your Demon Hunter spells prepared, plus those of your path (Devourer, Havoc or Vengeance).",
  "Soul Fragments": "Collect soul fragments when enemies near you die (Reaction, once per round). Spend them on Soul Cleave and on spells such as Counterspell, Feather Fall and Jump.",
  "Soul Cleave": "Spend soul fragments for a cleaving attack that damages nearby enemies.",
  "Spectral Sight": "You gain Blindsight.",
  "Torment": "Once per turn your Hunter's Mark target takes extra damage or has a harder time with saves, and is drawn to fight you.",
  "Illidari Knowledge": "Counterspell costs you only 2 soul fragments, and you can cast Throw Glaive as a Bonus Action without a slot.",
  "Soul Shatter": "Soul Cleave deals extra damage, and you start combat with a soul fragment if you have none.",
  "Improved Spectral Sight": "Replaces Feral Senses: your Blindsight becomes Truesight.",
  // Scion of the Three
  "Bloodthirst": "When an enemy you can see within 30 ft is Bloodied but not killed, you can teleport next to it and make a melee attack. Uses equal to your Intelligence modifier per Long Rest.",
  "Dread Allegiance": "Choose Bane, Bhaal or Myrkul: you gain a damage resistance and a cantrip (Minor Illusion, Blade Ward or Chill Touch).",
  "Strike Fear": "You gain the Terrify Cunning Strike option (cost 1d6).",
  "Aura of Malevolence": "When you teleport with Bloodthirst, creatures near you take damage equal to your Intelligence modifier.",
  "Dread Incarnate": "Cutthroat: regain one Bloodthirst use on a Short Rest. Murderous Intent: Sneak Attack dice that roll 1 or 2 count as 3.",
  // Swashbuckler (2026)
  "Fancy Footwork": "After a melee attack, the target can't make Opportunity Attacks against you this turn.",
  "Rakish Audacity": "Add your Charisma modifier to Initiative, and you can Sneak Attack a lone target without Advantage.",
  "Panache": "After a Sneak Attack you can taunt the target into attacking you, or charm nearby enemies for a round.",
  "Dashing Strikes": "New Cunning Strike options: raise your AC for a round, or boost an ally's attack rolls and saving throws.",
  "Master Duelist": "When you land a Sneak Attack you can make another attack.",
  // Spellfire Sorcery
  "Spellfire Burst": "When you spend Sorcery Points on a spell, you can release spellfire: heal a creature (Temporary HP) or deal extra Fire or Radiant damage.",
  "Spellfire Spells": "You always have your Spellfire spells prepared (Counterspell from level 6).",
  "Absorb Spells": "When a creature fails its save against your Counterspell, you regain Sorcery Points.",
  "Honed Spellfire": "Spellfire Burst grants more Temporary HP and deals more damage.",
  "Crown of Spellfire": "Bonus Action: for a while you fly, can spend Hit Dice to reduce damage, and avoid damage from area effects on a successful save. Once per Long Rest, or by spending Sorcery Points.",
  // Vestige Patron
  "Vestige Companion": "A vestige companion (Celestial, Fiend or Undead) fights beside you and grows with your level; you command it with a Bonus Action.",
  "Vestige Spells": "Choose a spell list (Life, Light, Trickery or War); you always have its spells prepared.",
  "Vestige Power": "A Bonus Action power that you can use more often; you share your companion's damage resistance while near it.",
  "Vestige Recovery": "Once per Long Rest, when your companion drops to 0 HP, it fully recovers instead.",
  "Semblance of Life": "For 1 hour (no Concentration) your companion takes a stronger form with lots of Temporary HP and more attacks.",
  // Bladesinger
  "Bladesong": "Bonus Action, no armor or Shield, 1 minute: +Int to AC, +10 ft Speed, Advantage on Acrobatics, use Int for weapon attacks and damage, add Int to Concentration saves. Uses equal to your Intelligence modifier per Long Rest; regain one with Arcane Recovery.",
  "Training in War and Song": "Proficiency with Martial melee weapons without Two-Handed or Heavy; a melee weapon can be your spellcasting focus; one skill from Acrobatics, Athletics, Performance or Persuasion.",
  "Song of Defense": "Reaction while Bladesong is active and you take damage: spend a spell slot to reduce it by 5 × the slot's level.",
  "Song of Victory": "After you cast a spell with an action casting time, you can make one weapon attack as a Bonus Action.",
  // Conjurer / Enchanter / Necromancer / Transmuter (2024)
  "Conjuration Savant": "Add Conjuration spells to your spellbook for free, one extra each time you gain a new spell level.",
  "Benign Transposition": "Teleport up to 30 ft, or swap places with a willing creature, without a spell slot. Uses equal to your Intelligence modifier per Long Rest.",
  "Distant Transposition": "Benign Transposition reaches 60 ft.",
  "Durable Summons": "Creatures you summon or conjure gain Temporary Hit Points.",
  "Focused Conjuration": "Damage can't break your Concentration on Conjuration spells.",
  "Splintered Summons": "When you summon a creature you can split it into two, each with half the Hit Points.",
  "Enchantment Savant": "Add Enchantment spells to your spellbook for free, one extra each time you gain a new spell level.",
  "Enchanting Conversationalist": "Add your Intelligence modifier to Charisma checks.",
  "Hypnotic Presence": "Charm a creature with your gaze. Uses equal to your Intelligence modifier per Long Rest.",
  "Split Enchantment": "Enchantment spells that target one creature can target a second creature.",
  "Instinctive Charm": "Reaction: redirect an attack aimed at you to another creature.",
  "Alter Memories": "Creatures you charm can be made to forget or misremember the time they were charmed.",
  "Necromancy Savant": "Add Necromancy spells to your spellbook for free, one extra each time you gain a new spell level.",
  "Necromancy Spellbook": "Your familiar can be Undead, you resist Necrotic damage, and your Necromancy spells heal your Undead.",
  "Grave Power": "Arcane Recovery also removes Exhaustion, and your spells ignore Necrotic resistance.",
  "Undead Thralls": "Animate Dead raises extra Undead, which get bonus HP and damage.",
  "Harvest Undead": "Reaction when Bloodied: drain life from one of your Undead to heal yourself.",
  "Death's Master": "Your Undead gain Temporary HP and explode when destroyed.",
  "Transmutation Savant": "Add Transmutation spells to your spellbook for free, one extra each time you gain a new spell level.",
  "Transmuter's Stone": "Create a stone that grants its carrier a benefit (darkvision, speed, a save proficiency or a resistance).",
  "Wondrous Alteration": "Minor transmutations: change an object's material, shape or colour.",
  "Empowered Transmutation": "You can cast Transmutation spells as if one level higher.",
  "Potent Stone": "Your Transmuter's Stone grants stronger or extra benefits.",
  "Shape-Shifter": "Polymorph is always prepared and you can use it on yourself to take stronger forms.",
  "Master Transmuter": "Spend a level 7 slot or destroy your stone for a major transmutation (restore youth, heal fully, transform an object…)."
};
