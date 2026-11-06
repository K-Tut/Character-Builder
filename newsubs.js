"use strict";
/* ============ Official subclasses released after the 2024 Player's Handbook ============
   - Heroes of Faerûn (Forgotten Realms, Nov 2025)
   - Arcana Unleashed (2026): two new subclasses plus 2024 versions of six older ones
   - D&D: World of Warcraft (2026)
   Feature names follow dnd2024.wikidot.com, so a fresh wiki import shows the full rules text.
   Until then the summaries in SUB_DESC are shown (written for this app).

   choices: [{ key, label, from, reset, options, desc, spells, resist, resistFrom }]
     reset "LR" = can be changed when you finish a Long Rest, "SR" = on any rest, null = picked at level-up only.
     spells/desc/resist are keyed by option. The pick is stored in c.pools[key][0].
   freeCasts: { level: [spell] } = always prepared + castable once per Long Rest without a slot.
   replaces: class features (and their tracked uses) that this subclass swaps out.
*/
const NEW_SUBCLASSES = {
  barbarian: {
    spiritualguardian: { name: "Path of the Spiritual Guardian", src: "D&D: World of Warcraft", features: { 3: ["Spiritual Protectors"], 6: ["Spirit Shield"], 10: ["Consult the Spirits"], 14: ["Spirits' Fury"] },
      resources: [{ key: "consult", name: "Consult the Spirits", feature: "Consult the Spirits", reset: "SR", n: step({ 10: 1 }) }] },
    elements: { name: "Path of the Elements", src: "D&D: World of Warcraft", features: { 3: ["Raging Elements"], 6: ["Echo of the Elements"], 10: ["Primordial Bond"], 14: ["Elemental Overload"] },
      spells: { 6: ["Elementalism"] } }
  },
  bard: {
    moon: { name: "College of the Moon", src: "Heroes of Faerûn", features: { 3: ["Moon's Inspiration", "Primal Lore"], 6: ["Blessing of Moonlight"], 14: ["Eventide's Splendor"] },
      spells: { 6: ["Moonbeam"] }, pools: { moonSkill: step({ 3: 1 }) },
      resources: [{ key: "moonblessing", name: "Blessing of Moonlight", feature: "Blessing of Moonlight", reset: "LR", n: step({ 6: 1 }) }] }
  },
  cleric: {
    knowledge24: { name: "Knowledge Domain", src: "Heroes of Faerûn", features: { 3: ["Blessings of Knowledge", "Knowledge Domain Spells", "Mind Magic"], 6: ["Unfettered Mind"], 17: ["Divine Foreknowledge"] },
      spells: { 3: ["Command", "Comprehend Languages", "Detect Magic", "Detect Thoughts", "Identify", "Mind Spike"], 5: ["Dispel Magic", "Nondetection", "Tongues"], 7: ["Arcane Eye", "Banishment", "Confusion"], 9: ["Legend Lore", "Scrying", "Synaptic Static"] },
      pools: { knowSkills: step({ 3: 2 }) },
      resources: [{ key: "foreknow", name: "Divine Foreknowledge", feature: "Divine Foreknowledge", reset: "LR", note: "or spend a level 6+ slot", n: step({ 17: 1 }) }] },
    arcana24: { name: "Arcana Domain", src: "Arcana Unleashed", features: { 3: ["Arcana Domain Spells", "Modify Magic", "Student of Arcana"], 6: ["Dispelling Recovery"], 17: ["Magical Mastery"] },
      spells: { 3: ["Detect Magic", "Magic Missile", "Magic Weapon", "Nystul's Magic Aura"], 5: ["Counterspell", "Dispel Magic"], 7: ["Arcane Eye", "Leomund's Secret Chest"], 9: ["Bigby's Hand", "Teleportation Circle"] },
      resources: [{ key: "dispelrec", name: "Dispelling Recovery", feature: "Dispelling Recovery", reset: "SR", note: "or spend a Channel Divinity", n: step({ 6: 1 }) }] },
    discipline: { name: "Discipline Domain", src: "D&D: World of Warcraft", features: { 3: ["Discipline Spells", "Holy Bolt", "Atonement"], 6: ["Luminous Barrier"], 17: ["Ultimate Penitence"] },
      spells: { 3: ["Arcane Vigor", "Guiding Bolt", "Magic Weapon", "Shield of Faith"], 5: ["Prayer of Mending", "Protection from Energy"], 7: ["Guardian of Faith", "Stoneskin"], 9: ["Circle of Power", "Destructive Wave"] } },
    shadow24: { name: "Shadow Domain", src: "D&D: World of Warcraft", features: { 3: ["Shadow Spells", "Shadowform", "Devouring Plague"], 6: ["Dispersion"], 17: ["Vampiric Embrace"] },
      spells: { 3: ["Crown of Madness", "Dissonant Whispers", "Mind Spike", "Shadow Word: Pain"], 5: ["Summon Undead", "Vampiric Touch"], 7: ["Evard's Black Tentacles", "Psychic Horror"], 9: ["Dominate Person", "Void Eruption"] },
      resources: [{ key: "plague", name: "Devouring Plague", feature: "Devouring Plague", reset: "LR", n: (l, c) => Math.max(1, c.mod.wis) },
        { key: "dispersion", name: "Dispersion", feature: "Dispersion", reset: "SR", n: step({ 6: 1 }) }] }
  },
  fighter: {
    purpledragon: { name: "Purple Dragon Knight", src: "Heroes of Faerûn", features: { 3: ["Knightly Envoy", "Purple Dragon Companion"], 7: ["Dragon Rider"], 10: ["Rallying Surge"], 15: ["Amethyst Pinnacle"], 18: ["Enduring Commander"] },
      resources: [{ key: "gravbreath", name: "Gravity Breath (dragon)", feature: "Purple Dragon Companion", reset: "LR", n: step({ 3: 2 }) }] },
    arcanearcher24: { name: "Arcane Archer", src: "Arcana Unleashed", features: { 3: ["Arcane Archer Lore", "Arcane Shot"], 7: ["Curving Shot", "Magical Ammunition"], 10: ["Ever-Ready Shot"], 15: ["Indomitable Teleport"], 18: ["Masterful Shots"] },
      skills: ["Arcana", "Nature"], pools: { arcaneShots: step({ 3: 2, 7: 3, 10: 4, 15: 5, 18: 6 }) },
      notes: { "Arcane Shot": l => "die d" + step({ 3: 6, 10: 8, 15: 10, 18: 12 })[l - 1] },
      resources: [{ key: "arcaneshot", name: "Arcane Shot", feature: "Arcane Shot", reset: "SR", n: (l, c) => Math.max(1, c.mod.int), die: l => "d" + step({ 3: 6, 10: 8, 15: 10, 18: 12 })[l - 1] },
        { key: "magammo", name: "Magical Ammunition", feature: "Magical Ammunition", reset: "SR", note: "or spend a Second Wind", n: step({ 7: 1 }) }] }
  },
  monk: {
    mysticarts: { name: "Warrior of the Mystic Arts", src: "Arcana Unleashed", caster: { type: "third", ability: "wis", cantrips: step({ 3: 2, 10: 3 }), prepared: PREP.third, list: "sorcerer" },
      features: { 3: ["Spellcasting"], 6: ["Mystic Fighting Style", "Mystic Focus"], 11: ["Focused Strike"], 17: ["Improved Mystic Fighting Style"] } },
    mysticbrews: { name: "Warrior of Mystic Brews", src: "D&D: World of Warcraft", features: { 3: ["Bonus Proficiencies", "Drunken Technique"], 6: ["Tipsy Sway", "Mystic Brew"], 11: ["Wizened Brewer"], 17: ["Master Brewer", "Intoxicated Frenzy"] },
      skills: ["Performance"], tools: ["Brewer's Supplies"],
      choices: [{ key: "brew", label: "Mystic Brew (today's beverage)", from: 6, reset: "SR",
        options: ["Cinnamon Dragon", "Heavenly Spirit", "Refreshing Dip", "Blue Lightning (level 11+)", "Drunkard's Luck (level 11+)", "Stumbling Monk (level 11+)"],
        desc: {
          "Cinnamon Dragon": "Magic action: breathe fire in a 30-ft Cone. Dex save (DC 8 + Wis + PB): Fire damage = 4 rolls of your Martial Arts die and Poisoned until the end of its next turn; half damage and no Poisoned on a success.",
          "Heavenly Spirit": "Resistance to two of: Cold, Necrotic, Psychic, Radiant (your choice).",
          "Refreshing Dip": "A pool of Martial Arts dice (max Wis mod + half your Monk level). Whenever you regain HP, spend and roll one die to regain that much more.",
          "Blue Lightning (level 11+)": "Whenever you take a Reaction (not an Opportunity Attack or a spell), you can make one Unarmed Strike as part of it.",
          "Drunkard's Luck (level 11+)": "Gain Heroic Inspiration if you lack it; you can also give it to yourself when you make an ability check or saving throw without it.",
          "Stumbling Monk (level 11+)": "When you take a Bonus Action other than Patient Defense, you can use Patient Defense right afterwards."
        } }] }
  },
  paladin: {
    noblegenies: { name: "Oath of the Noble Genies", src: "Heroes of Faerûn", features: { 3: ["Elemental Smite", "Genie Spells", "Genie's Splendor"], 7: ["Aura of Elemental Shielding"], 15: ["Elemental Rebuke"], 20: ["Noble Scion"] },
      spells: { 3: ["Chromatic Orb", "Elementalism", "Thunderous Smite"], 5: ["Mirror Image", "Phantasmal Force"], 9: ["Fly", "Gaseous Form"], 13: ["Conjure Minor Elementals", "Summon Elemental"], 17: ["Banishing Smite", "Contact Other Plane"] },
      pools: { genieSkill: step({ 3: 1 }) },
      resources: [{ key: "rebuke", name: "Elemental Rebuke", feature: "Elemental Rebuke", reset: "LR", n: (l, c) => l >= 15 ? Math.max(1, c.mod.cha) : 0 },
        { key: "scion", name: "Noble Scion", feature: "Noble Scion", reset: "LR", note: "or spend a level 5 slot", n: step({ 20: 1 }) }] },
    ebonblade: { name: "Oath of the Ebon Blade", src: "D&D: World of Warcraft", features: { 3: ["Death Coil", "Runic Smite", "Oath of the Ebon Blade Spells", "Runeforging", "Runic Power"], 5: ["Faithful Steed"], 7: ["Aura of Deathly Endurance"], 11: ["Runic Strikes"], 14: ["Improved Death Coil"], 15: ["Runic Mastery"], 20: ["Aspect of the Horsemen"] },
      spells: { 3: ["Death Grip"], 5: ["Death and Decay"], 9: ["Summon Undead"], 13: ["Freedom of Movement"], 17: ["Circle of Power"] },
      freeCasts: { 3: ["Rune Strike"] }, replaces: ["Lay On Hands", "Paladin's Smite", "Radiant Strikes", "Restoring Touch"],
      notes: { "Death Coil": (l, D) => (1 + Math.max(1, D.mod.cha)) + "d8 pool, max " + Math.max(1, D.mod.cha) + " dice per use", "Runic Strikes": () => "+1d8 Necrotic" },
      choices: [{ key: "ebonRune", label: "Inscribed rune", from: 3, reset: "LR", lrTemp: { "Blood rune": (l, D) => Math.max(0, D.mod.cha) + l },
        options: ["Blood rune", "Frost rune", "Unholy rune"],
        spells: {
          "Blood rune": { 3: ["Vampiric Blood"], 5: ["Spiritual Weapon"], 9: ["Leeching Strike"], 13: ["Evard's Black Tentacles"], 17: ["Bonestorm"] },
          "Frost rune": { 3: ["Chains of Ice"], 5: ["Frostscythe"], 9: ["Remorseless Winter"], 13: ["Ice Storm"], 17: ["Cone of Cold"] },
          "Unholy rune": { 3: ["Scourge Strike"], 5: ["Ray of Enfeeblement"], 9: ["Bestow Curse"], 13: ["Blight"], 17: ["Contagion"] } },
        desc: {
          "Blood rune": "Runeforging: when you finish a Long Rest you gain Temporary HP = Cha mod + Paladin level, and again whenever you drop an enemy to 0 HP while wielding the weapon.\nRunic Power (Channel Divinity after Rune Strike): regain HP equal to the Necrotic damage Rune Strike dealt.\nRunic Mastery (level 15, 1/Long Rest): Reaction when a creature hits someone within 10 ft of you that you can see — reduce that damage by your Paladin level; you lose that many HP.",
          "Frost rune": "Runeforging: while wielding the weapon, your weapon attacks, Paladin spells and features ignore Cold resistance; the extra attack from the Light property deals +1d4 Cold.\nRunic Power (Channel Divinity after Rune Strike): the target and each enemy in a 10-ft Emanation from it take 2d6 Cold damage.\nRunic Mastery (level 15, 1/Long Rest): replace one attack with a 30-ft Cone of frost — Dex save vs your spell DC, 8d6 Cold, half on a success.",
          "Unholy rune": "Runeforging: while wielding the weapon, your weapon attacks, Paladin spells and features ignore Necrotic resistance; with a Heavy weapon, the first creature you hit each turn takes extra Necrotic damage = Cha mod (min 1).\nRunic Power (Channel Divinity after Rune Strike): the target is cursed until the end of your next turn and subtracts 1d6 from its next saving throw.\nRunic Mastery (level 15, 1/Long Rest): cast Summon Undead without Concentration (1 minute); the spirit gets Temp HP = Paladin level + Cha mod and +½ Paladin level Necrotic damage on its first hit each turn." } }],
      resources: [{ key: "deathcoil", name: "Death Coil (d8 pool)", feature: "Death Coil", reset: "LR", n: (l, c) => 1 + Math.max(1, c.mod.cha), die: () => "d8" },
        { key: "ghoststride", name: "Ghostly Stride (steed)", feature: "Faithful Steed", reset: "LR", n: step({ 5: 1 }) },
        { key: "runicmastery", name: "Runic Mastery", feature: "Runic Mastery", reset: "LR", note: "level 20: restore with a level 4 slot", n: step({ 15: 1 }) },
        { key: "horsemen", name: "Aspect of the Horsemen", feature: "Aspect of the Horsemen", reset: "LR", note: "or spend a level 5 slot", n: step({ 20: 1 }) }] },
    holy: { name: "Oath of the Holy", src: "D&D: World of Warcraft", features: { 3: ["Oath of the Holy Spells", "Beacon of Light"], 7: ["Lightbringer's Aura"], 15: ["Infusion of Light"], 20: ["Holy Deliverance"] },
      spells: { 3: ["Cure Wounds", "Healing Word"], 5: ["Lesser Restoration", "Prayer of Healing"], 9: ["Dispel Magic", "Mass Healing Word"], 13: ["Aura of Life", "Death Ward"], 17: ["Greater Restoration", "Mass Cure Wounds"] },
      resources: [{ key: "deliverance", name: "Holy Deliverance", feature: "Holy Deliverance", reset: "LR", note: "or spend a level 5 slot", n: step({ 20: 1 }) }] }
  },
  ranger: {
    winterwalker: { name: "Winter Walker", src: "Heroes of Faerûn", features: { 3: ["Frigid Explorer", "Hunter's Rime", "Winter Walker Spells"], 7: ["Fortifying Soul"], 11: ["Chilling Retribution"], 15: ["Frozen Haunt"] },
      spells: { 3: ["Ice Knife"], 5: ["Hold Person"], 9: ["Remove Curse"], 13: ["Ice Storm"], 17: ["Cone of Cold"] }, resist: ["Cold"],
      notes: { "Frigid Explorer": l => "Polar Strikes +" + (l >= 11 ? "1d6" : "1d4") + " Cold" },
      resources: [{ key: "fortify", name: "Fortifying Soul", feature: "Fortifying Soul", reset: "LR", n: step({ 7: 1 }) },
        { key: "chilling", name: "Chilling Retribution", feature: "Chilling Retribution", reset: "LR", n: (l, c) => l >= 11 ? Math.max(1, c.mod.wis) : 0 },
        { key: "haunt", name: "Frozen Haunt", feature: "Frozen Haunt", reset: "LR", note: "or spend a level 4+ slot", n: step({ 15: 1 }) }] },
    demonhunter: { name: "Demon Hunter", src: "D&D: World of Warcraft", replaces: ["Feral Senses"], features: { 3: ["Demon Hunter Spells", "Soul Fragments", "Spectral Sight"], 7: ["Torment"], 11: ["Illidari Knowledge"], 15: ["Soul Shatter"], 18: ["Improved Spectral Sight"] },
      spells: { 3: ["Throw Glaive"], 5: ["Sigil of Flame"], 9: ["Metamorphosis"], 13: ["Chaos Nova"], 17: ["Destructive Wave"] },
      notes: { "Soul Fragments": l => "Soul Cleave " + (l >= 15 ? "2d12" : "1d12") + " + Wis Psychic" },
      choices: [{ key: "dhPath", label: "Demon Hunter path", from: 3, reset: null, options: ["Devourer", "Havoc", "Vengeance"],
        spells: {
          "Devourer": { 3: ["Consume Soul"], 5: ["Misty Step"], 9: ["Soul Reap"], 13: ["Collapsing Star"], 17: ["Steel Wind Strike"] },
          "Havoc": { 3: ["Fel Rush"], 5: ["Eye Beam"], 9: ["Blink"], 13: ["Fire Shield"], 17: ["Conjure Volley"] },
          "Vengeance": { 3: ["Infernal Strike"], 5: ["Fiery Brand"], 9: ["Demon Spikes"], 13: ["Banishment"], 17: ["Sigil of Chains"] } } }],
      resources: [{ key: "soulfrag", name: "Soul Fragments", feature: "Soul Fragments", reset: "LR", note: "regain 1 (Reaction) when an enemy within 30 ft dies", n: (l, c) => Math.max(1, c.mod.wis) + (l >= 17 ? 2 : l >= 13 ? 1 : 0) }] }
  },
  rogue: {
    scion: { name: "Scion of the Three", src: "Heroes of Faerûn", features: { 3: ["Bloodthirst", "Dread Allegiance"], 9: ["Strike Fear"], 13: ["Aura of Malevolence"], 17: ["Dread Incarnate"] },
      choices: [{ key: "dreadAllegiance", label: "Dread Allegiance", from: 3, reset: "LR",
        options: ["Bane", "Bhaal", "Myrkul"],
        spells: { "Bane": { 3: ["Minor Illusion"] }, "Bhaal": { 3: ["Blade Ward"] }, "Myrkul": { 3: ["Chill Touch"] } },
        resist: { "Bane": ["Psychic"], "Bhaal": ["Poison"], "Myrkul": ["Necrotic"] },
        desc: { "Bane": "Resistance to Psychic damage; you know Minor Illusion (Int). Aura of Malevolence deals Psychic damage.",
          "Bhaal": "Resistance to Poison damage; you know Blade Ward (Int). Aura of Malevolence deals Poison damage.",
          "Myrkul": "Resistance to Necrotic damage; you know Chill Touch (Int). Aura of Malevolence deals Necrotic damage." } }],
      resources: [{ key: "bloodthirst", name: "Bloodthirst", feature: "Bloodthirst", reset: "LR", note: "from level 17: regain 1 on Short Rest", n: (l, c) => Math.max(1, c.mod.int) }] },
    swashbuckler24: { name: "Swashbuckler", src: "D&D: World of Warcraft", features: { 3: ["Fancy Footwork", "Rakish Audacity"], 9: ["Panache"], 13: ["Dashing Strikes"], 17: ["Master Duelist"] } }
  },
  sorcerer: {
    spellfire: { name: "Spellfire Sorcery", src: "Heroes of Faerûn", features: { 3: ["Spellfire Burst", "Spellfire Spells"], 6: ["Absorb Spells"], 14: ["Honed Spellfire"], 18: ["Crown of Spellfire"] },
      spells: { 3: ["Cure Wounds", "Guiding Bolt", "Lesser Restoration", "Scorching Ray"], 5: ["Aura of Vitality", "Dispel Magic"], 6: ["Counterspell"], 7: ["Fire Shield", "Wall of Fire"], 9: ["Flame Strike", "Greater Restoration"] },
      notes: { "Spellfire Burst": (l, D) => l >= 14 ? `Temp HP 1d4+${D.mod.cha + l} · 1d8 dmg` : `Temp HP 1d4+${D.mod.cha} · 1d4 dmg` },
      resources: [{ key: "crown", name: "Crown of Spellfire", feature: "Crown of Spellfire", reset: "LR", note: "or spend 5 Sorcery Points", n: step({ 18: 1 }) }] }
  },
  warlock: {
    vestige: { name: "Vestige Patron", src: "Arcana Unleashed", features: { 3: ["Vestige Companion", "Vestige Spells"], 6: ["Vestige Power"], 10: ["Vestige Recovery"], 14: ["Semblance of Life"] },
      choices: [
        { key: "vestigeList", label: "Vestige Spells (Cleric domain)", from: 3, reset: null, options: ["Life", "Light", "Trickery", "War"],
          spells: {
            "Life": { 3: ["Aid", "Bless", "Cure Wounds", "Lesser Restoration"], 5: ["Mass Healing Word", "Revivify"], 7: ["Aura of Life", "Death Ward"], 9: ["Greater Restoration", "Mass Cure Wounds"] },
            "Light": { 3: ["Burning Hands", "Faerie Fire", "Scorching Ray", "See Invisibility"], 5: ["Daylight", "Fireball"], 7: ["Arcane Eye", "Wall of Fire"], 9: ["Flame Strike", "Scrying"] },
            "Trickery": { 3: ["Charm Person", "Disguise Self", "Invisibility", "Pass without Trace"], 5: ["Hypnotic Pattern", "Nondetection"], 7: ["Confusion", "Dimension Door"], 9: ["Dominate Person", "Modify Memory"] },
            "War": { 3: ["Guiding Bolt", "Magic Weapon", "Shield of Faith", "Spiritual Weapon"], 5: ["Crusader's Mantle", "Spirit Guardians"], 7: ["Fire Shield", "Freedom of Movement"], 9: ["Hold Monster", "Steel Wind Strike"] } } },
        { key: "vestigeForm", label: "Vestige form", from: 3, reset: "LR", options: ["Celestial", "Fiend", "Undead"],
          resist: { "Celestial": ["Radiant"], "Fiend": ["Fire"], "Undead": ["Necrotic"] }, resistFrom: 6,
          desc: {
            "Celestial": "Vestige's Strike deals Radiant damage; it resists Radiant (you too within 30 ft, level 6+). Divine Power — Healing Touch (Bonus Action, 1/day; from level 6 also on Short Rest or Magical Cunning): a creature regains 2d8 + Cha HP and ends Blinded, Deafened or Poisoned. Semblance of Life: Celestial Spirit (Summon Celestial).",
            "Fiend": "Vestige's Strike deals Fire damage; it resists Fire (you too within 30 ft, level 6+). Divine Power — Fiendish Swap (Bonus Action): you and the vestige swap places if within 60 ft. Semblance of Life: Fiendish Spirit (Summon Fiend).",
            "Undead": "Vestige's Strike deals Necrotic damage; it resists Necrotic (you too within 30 ft, level 6+). Divine Power — Cursed Invocation (Bonus Action): a creature within 30 ft of the vestige has Disadvantage on attacks against you and the vestige for 1 minute. Semblance of Life: Undead Spirit (Summon Undead)." } }],
      notes: { "Vestige Companion": (l, D) => `AC ${13 + D.mod.cha} · HP ${4 + 4 * l} · strike +${D.casters.find(x => x.cls === "warlock")?.atk ?? ""} 1d6+${3 + D.mod.cha}` },
      resources: [{ key: "divpower", name: "Divine Power (vestige)", feature: "Vestige Companion", reset: l => l >= 6 ? "SR" : "LR", n: step({ 3: 1 }) },
        { key: "vestigerec", name: "Vestige Recovery", feature: "Vestige Recovery", reset: "LR", note: "also costs a Pact slot", n: step({ 10: 1 }) },
        { key: "semblance", name: "Semblance of Life", feature: "Semblance of Life", reset: "LR", n: step({ 14: 1 }) }] }
  },
  wizard: {
    bladesinger: { name: "Bladesinger", src: "Heroes of Faerûn", features: { 3: ["Bladesong", "Training in War and Song"], 6: ["Extra Attack"], 10: ["Song of Defense"], 14: ["Song of Victory"] },
      wprof: ["martial"], pools: { bladeSkill: step({ 3: 1 }) },
      resources: [{ key: "bladesong", name: "Bladesong", feature: "Bladesong", reset: "LR", note: "regain 1 with Arcane Recovery", n: (l, c) => Math.max(1, c.mod.int) }] },
    conjurer: { name: "Conjurer", src: "Arcana Unleashed", features: { 3: ["Benign Transposition", "Conjuration Savant"], 6: ["Distant Transposition", "Durable Summons"], 10: ["Focused Conjuration"], 14: ["Splintered Summons"] },
      resources: [{ key: "transpose", name: "Benign Transposition", feature: "Benign Transposition", reset: "LR", note: "level 6+: restore 1 with a level 3+ slot", n: (l, c) => Math.max(1, c.mod.int) },
        { key: "splinter", name: "Splintered Summons", feature: "Splintered Summons", reset: "LR", note: "or spend a level 5+ slot", n: step({ 14: 1 }) }] },
    enchanter: { name: "Enchanter", src: "Arcana Unleashed", features: { 3: ["Enchanting Conversationalist", "Enchantment Savant", "Hypnotic Presence"], 6: ["Split Enchantment"], 10: ["Instinctive Charm"], 14: ["Alter Memories"] },
      pools: { enchSkill: step({ 3: 1 }) },
      resources: [{ key: "hypnotic", name: "Hypnotic Presence", feature: "Hypnotic Presence", reset: "LR", n: (l, c) => Math.max(1, c.mod.int) },
        { key: "splitench", name: "Split Enchantment", feature: "Split Enchantment", reset: "LR", n: (l, c) => l >= 6 ? Math.max(1, c.mod.int) : 0 },
        { key: "instcharm", name: "Instinctive Charm", feature: "Instinctive Charm", reset: "LR", note: "or cast an Enchantment spell with a slot", n: step({ 10: 1 }) }] },
    necromancer: { name: "Necromancer", src: "Arcana Unleashed", features: { 3: ["Necromancy Savant", "Necromancy Spellbook"], 6: ["Grave Power", "Undead Thralls"], 10: ["Harvest Undead"], 14: ["Death's Master"] },
      resist: ["Necrotic"], spells: { 3: ["Find Familiar"] }, freeCasts: { 6: ["Animate Dead"] },
      resources: [{ key: "bolster", name: "Bolster Undead", feature: "Death's Master", reset: "LR", n: step({ 14: 1 }) }] },
    transmuter: { name: "Transmuter", src: "Arcana Unleashed", features: { 3: ["Transmutation Savant", "Transmuter's Stone", "Wondrous Alteration"], 6: ["Empowered Transmutation"], 10: ["Potent Stone", "Shape-Shifter"], 14: ["Master Transmuter"] },
      freeCasts: { 3: ["Alter Self"], 10: ["Polymorph"] },
      choices: [{ key: "transStone", label: "Transmuter's Stone benefit", from: 3, reset: "LR",
        options: ["Darkvision", "Resistance", "Speed", "Mighty Build (level 10+)", "Tremorsense (level 10+)"],
        desc: { "Darkvision": "The holder gains Darkvision 60 ft (or +60 ft). Also proficiency in Constitution saving throws.",
          "Resistance": "The holder resists Acid, Cold, Fire, Lightning, Poison or Thunder (choose when creating it). Also proficiency in Constitution saving throws.",
          "Speed": "The holder's Speed increases by 10 ft. Also proficiency in Constitution saving throws.",
          "Mighty Build (level 10+)": "The holder has Advantage on Strength saves and counts as one size larger for carrying capacity.",
          "Tremorsense (level 10+)": "The holder gains Tremorsense 30 ft." } }],
      resources: [{ key: "empowertrans", name: "Empowered Transmutation", feature: "Empowered Transmutation", reset: "LR", n: (l, c) => l >= 6 ? Math.max(1, c.mod.int) : 0 }] }
  }
};
for (const [cls, subs] of Object.entries(NEW_SUBCLASSES)) Object.assign(CLASSES[cls].subclasses, subs);

// Circle of the Land: the land type is picked again after each Long Rest
Object.assign(CLASSES.druid.subclasses.land, {
  choices: [{ key: "landType", label: "Land type", from: 3, reset: "LR", options: ["Arid", "Polar", "Temperate", "Tropical"],
    spells: {
      "Arid": { 3: ["Blur", "Burning Hands", "Fire Bolt"], 5: ["Fireball"], 7: ["Blight"], 9: ["Wall of Stone"] },
      "Polar": { 3: ["Fog Cloud", "Hold Person", "Ray of Frost"], 5: ["Sleet Storm"], 7: ["Ice Storm"], 9: ["Cone of Cold"] },
      "Temperate": { 3: ["Misty Step", "Shocking Grasp", "Sleep"], 5: ["Lightning Bolt"], 7: ["Freedom of Movement"], 9: ["Tree Stride"] },
      "Tropical": { 3: ["Acid Splash", "Ray of Sickness", "Web"], 5: ["Stinking Cloud"], 7: ["Polymorph"], 9: ["Insect Plague"] } },
    resist: { "Arid": ["Fire"], "Polar": ["Cold"], "Temperate": ["Lightning"], "Tropical": ["Poison"] }, resistFrom: 10 }]
});

// every choice becomes a pool, so it can be picked at level-up (and changed on rests)
for (const C of Object.values(CLASSES)) for (const s of Object.values(C.subclasses)) for (const ch of s.choices || []) {
  POOLS[ch.key] = { label: ch.label, options: () => ch.options.slice() };
  (s.pools ||= {})[ch.key] = step({ [ch.from || 3]: 1 });
}

Object.assign(POOLS, {
  moonSkill: { label: "Primal Lore (skill)", skill: true, options: () => ["Animal Handling", "Insight", "Medicine", "Nature", "Perception", "Survival"] },
  knowSkills: { label: "Blessings of Knowledge (2 skills, with Expertise)", skill: true, options: () => ["Arcana", "History", "Nature", "Religion"] },
  genieSkill: { label: "Genie's Splendor (skill)", skill: true, options: () => ["Acrobatics", "Intimidation", "Performance", "Persuasion"] },
  bladeSkill: { label: "Training in War and Song (skill)", skill: true, options: () => ["Acrobatics", "Athletics", "Performance", "Persuasion"] },
  enchSkill: { label: "Enchanting Conversationalist (skill)", skill: true, options: () => ["Deception", "Intimidation", "Persuasion"] },
  arcaneShots: { label: "Arcane Shot options", options: () => ["Banishing Shot", "Beguiling Shot", "Bursting Shot", "Enfeebling Shot", "Grasping Shot", "Piercing Shot", "Seeking Shot", "Shadow Shot"] }
});

// Short summaries per subclass, shown when the imported wiki has no text for that subclass.
const SUB_DESC = {
  "barbarian:spiritualguardian": {
    "Spiritual Protectors": "While Raging, when you hit a creature with a weapon or Unarmed Strike, choose one effect:\n• Distract: until the start of your next turn it has Disadvantage on attacks against anyone but you (or another Barbarian with this feature).\n• Hinder: you can also apply the Slow mastery property in addition to your weapon's mastery.\n• Strike: it takes an extra 1d4 Cold, Fire or Lightning damage (your choice).",
    "Spirit Shield": "While Raging, when another creature you can see within 30 ft takes damage, use your Reaction to reduce that damage by d6s equal to your Rage Damage bonus.",
    "Consult the Spirits": "Cast Augury or Clairvoyance without a spell slot or Material components (Wisdom is your spellcasting ability). Clairvoyance invisibly sends one of your guardian spirits instead of a sensor. Once per Short or Long Rest.",
    "Spirits' Fury": "When you roll an 18–20 on a melee weapon attack as part of the Attack action, you make one additional attack with that weapon. Once per turn (usable again from the start of your next turn)."
  },
  "barbarian:elements": {
    "Raging Elements": "When you Rage you can choose an option as part of that Bonus Action; while raging you can use a Bonus Action to use it again or switch. Save DC 8 + Con + PB. Dice = your Rage Damage bonus.\n• Icefury: melee or ranged spell attack (Con) at a creature within 30 ft: that many d8 Cold. The next Fire damage it takes before the end of your next turn deals +1d10 Fire.\n• Lava Burst: a creature within 30 ft makes a Dex save: that many d4 Fire (half on success). On a failure, the next Lightning damage it takes deals +1d8 Lightning.\n• Lightning Bolt: a creature within 30 ft makes a Dex save: that many d6 Lightning (half on success). On a failure, the next Cold damage it takes deals +1d6 Cold.",
    "Echo of the Elements": "You know the Elementalism cantrip. You can expend a use of Rage to cast Daylight, Water Walk or Wind Wall (Wisdom is your spellcasting ability).",
    "Primordial Bond": "While Raging you have Resistance to Cold, Fire and Lightning damage.",
    "Elemental Overload": "Your Raging Elements improve, hit or miss:\n• Icefury: the target subtracts half the number rolled from its next damage roll before the start of your next turn.\n• Lava Burst: the target and each enemy within 10 ft of it start burning.\n• Lightning Bolt: the bolt jumps to a second creature you can see within 30 ft of the first (Dex save, same damage, half on success)."
  },
  "bard:moon": {
    "Moon's Inspiration": "Inspired Eclipse: when you use a Bonus Action to give Bardic Inspiration, you can also turn Invisible and teleport up to 30 ft to a space you can see. The invisibility lasts until the start of your next turn, or until you attack, deal damage or cast a spell.\nLunar Vitality: once per turn, when you restore HP to a creature with a spell, you can expend a Bardic Inspiration die and add its roll to the healing; the creature's Speed increases by 10 ft until the end of its next turn.",
    "Primal Lore": "You learn Druidic and one Druid cantrip (it counts as a Bard spell and doesn't count against your cantrips; you can swap it when you gain a Bard level). You gain proficiency in one of Animal Handling, Insight, Medicine, Nature, Perception or Survival.",
    "Blessing of Moonlight": "You always have Moonbeam prepared. When you cast it you can make yourself glow (Dim Light 5 ft) while it lasts; whenever a creature fails its save against that Moonbeam, another creature of your choice within 60 ft regains 2d4 HP. Once per Long Rest.",
    "Eventide's Splendor": "Shadow of the New Moon: when you use Inspired Eclipse, the creature you inspired can also turn Invisible and use its Reaction to teleport up to 30 ft; it stays Invisible until the start of its next turn.\nVibrance of the Full Moon: for Lunar Vitality you can roll 1d6 instead of expending a Bardic Inspiration die."
  },
  "cleric:knowledge24": {
    "Blessings of Knowledge": "You gain proficiency with one type of Artisan's Tools, and proficiency and Expertise in two skills from Arcana, History, Nature and Religion.",
    "Knowledge Domain Spells": "You always have these spells prepared from the listed Cleric level. Divination spells: Comprehend Languages, Detect Magic, Detect Thoughts, Identify, Mind Spike, Tongues, Arcane Eye, Legend Lore, Scrying.",
    "Mind Magic": "Magic action, expend one Channel Divinity: cast one of your prepared Divination spells from the Knowledge Domain list without a spell slot or Material components.",
    "Unfettered Mind": "Telepathy 60 ft, with up to your Wisdom modifier creatures at once. You gain proficiency in Intelligence saving throws (or another save of your choice if you already have it).",
    "Divine Foreknowledge": "Bonus Action: for 1 hour you have Advantage on D20 Tests. Once per Long Rest; restore it by expending a level 6+ spell slot (no action)."
  },
  "cleric:arcana24": {
    "Arcana Domain Spells": "You always have these spells prepared from the listed Cleric level.",
    "Modify Magic": "When you cast a spell, expend a Channel Divinity (no action) for one effect:\n• Fortifying Spell: one target of the spell gains Temporary HP = 2d8 + your Cleric level.\n• Tenacious Spell: if a creature you can see succeeds on the spell's save, roll 1d6; it subtracts that from its first save against the spell's effect.",
    "Student of Arcana": "You gain proficiency in Arcana (or another Cleric skill), and learn two Wizard cantrips; you can swap one whenever you gain a Cleric level.",
    "Dispelling Recovery": "Right after you cast a spell with a slot that restores HP or ends a condition, you can cast Dispel Magic as part of the same action without a slot. Once per Short or Long Rest; regain it by expending a Channel Divinity.",
    "Magical Mastery": "You learn four Wizard spells, one each of levels 6, 7, 8 and 9, and always have them prepared. You can swap one when you gain a Cleric level."
  },
  "cleric:discipline": {
    "Discipline Spells": "You always have these spells prepared from the listed Cleric level.",
    "Holy Bolt": "Bonus Action, expend a Channel Divinity: ranged spell attack against a creature within 60 ft; on a hit 2d10 + Wis Radiant damage. Also a creature you can see within 60 ft regains 1d10 + Wis HP.",
    "Atonement": "When a level 1+ spell you cast restores HP, each healed creature is blessed until the end of your next turn. While blessed, whenever you deal damage with a spell using a slot, each blessed creature regains HP equal to the slot's level.",
    "Luminous Barrier": "Bonus Action, expend a Channel Divinity: each creature blessed by Atonement gains Temp HP = Cleric level + Wis, and has Resistance to all damage while it has them.",
    "Ultimate Penitence": "Ascending Step: before the Holy Bolt attack you can teleport up to 30 ft.\nAscending Volley: when you use Holy Bolt, expend a spell slot to fire extra bolts equal to its level (separate attack rolls, any targets)."
  },
  "cleric:shadow24": {
    "Shadow Spells": "You always have these spells prepared from the listed Cleric level.",
    "Shadowform": "Bonus Action, expend a Channel Divinity: for 1 minute you can Hide as a Bonus Action in Dim Light or Darkness, and when a spell with a slot deals Psychic or Necrotic damage you add 1d6 to one damage roll. Ends if you're Incapacitated or deal Radiant damage with a spell.",
    "Devouring Plague": "When a creature you can see within 30 ft fails a saving throw, it takes 1d10 Necrotic damage and you regain that many HP. Uses = Wisdom modifier per Long Rest.",
    "Dispersion": "Reaction when hit by an attack: until the end of your next turn you have Resistance to all damage (including the attack), can't take actions, Bonus Actions or Reactions, and have Fly 40 ft. When it ends you can spend up to half your Hit Dice to heal. Once per Short or Long Rest.",
    "Vampiric Embrace": "While Shadowform is active, whenever you roll its extra 1d6 damage, a creature of your choice within 30 ft regains that many HP."
  },
  "fighter:purpledragon": {
    "Knightly Envoy": "You learn one language, and can cast Comprehend Languages as a Ritual (Intelligence).",
    "Purple Dragon Companion": "An amethyst dragon hatchling (Small Dragon) is your companion: AC 13 + Int, HP 4 + 4 × Fighter level, Speed 30, Fly 30, Swim 30, Darkvision 60, telepathy 30 ft. It acts on your turn and only Dodges unless you command it with a Bonus Action.\nRend: +3 + Int to hit, 1d6 + Int Force.\nGravity Breath (2/day): 15-ft Cone, Con save (DC 8 + PB + Int) or pulled/pushed 15 ft.\nIf it died in the last hour, a Magic action and one Second Wind bring it back after 1 minute.",
    "Dragon Rider": "The dragon becomes Medium and you can ride it. Gravity Breath becomes a 30-ft Cone and also deals 2d6 Force on a failed save. When you use Second Wind, the dragon regains 1d6 + Fighter level HP and one use of Gravity Breath.",
    "Rallying Surge": "When you use Action Surge, up to three allies within 30 ft can use their Reaction to make one attack (the dragon: one Rend) or move half their Speed without provoking Opportunity Attacks.",
    "Amethyst Pinnacle": "The dragon becomes Large, Speed and Fly 40 ft, and doesn't fall while you ride it. When you take the Attack action you can forgo one attack to have it Rend, or two attacks to have it use Gravity Breath.",
    "Enduring Commander": "You and your dragon have Resistance to Force and Psychic damage."
  },
  "fighter:arcanearcher24": {
    "Arcane Archer Lore": "You learn Druidcraft or Prestidigitation (Intelligence). You gain proficiency in Arcana and Nature (another Fighter skill for each you already have).",
    "Arcane Shot": "You know two Arcane Shot options (+1 at levels 7, 10, 15, 18). Once per turn, when you hit with an Ammunition weapon, apply one option. Uses = Int modifier per Short or Long Rest. Die d6 (d8 at 10, d10 at 15, d12 at 18). Save DC 8 + Int + PB.\n• Banishing: +1 die Psychic, Cha save or banished until the end of its next turn.\n• Beguiling: +2 dice Psychic, Wis save or Charmed by you or an ally until your next turn.\n• Bursting: target and creatures within 10 ft take 2 dice Force.\n• Enfeebling: +2 dice Necrotic, Con save or Poisoned and its hits deal one die less.\n• Grasping: +1 die Slashing, Str save or Restrained for 1 minute.\n• Piercing (no attack roll): 30-ft Line, Dex save, weapon damage + 2 dice Piercing (half on success).\n• Seeking (no attack roll): homes in on a creature seen in the last minute, Dex save, weapon damage + 2 dice Force and you learn where it is.\n• Shadow: +1 die Psychic, Wis save or Blinded until the end of its next turn.",
    "Curving Shot": "When you miss with an Ammunition weapon, use a Bonus Action to reroll the attack against another creature within 60 ft of the first target.",
    "Magical Ammunition": "Magic action: fire enchanted ammunition at a surface. Darkening (15-ft magical shadow, −5 Perception, 1 minute), Unlocking (opens one lock within 15 ft, loud knock) or Vine (a 120-ft climbable vine for 10 minutes). Once per Short or Long Rest, or spend a Second Wind.",
    "Ever-Ready Shot": "When you roll Initiative you can regain one expended use of Arcane Shot.",
    "Indomitable Teleport": "When you succeed on a save with Indomitable, you can teleport up to 60 ft to a space you can see.",
    "Masterful Shots": "Reaction when a creature you can see misses you: move up to half your Speed without provoking Opportunity Attacks, then make a ranged attack against it if it's in range."
  },
  "monk:mysticarts": {
    "Spellcasting": "You cast Sorcerer spells with Wisdom (Arcane Focus). Two cantrips (+1 at level 10), spell slots like an Eldritch Knight (level 1–4 spells); you start with three level 1 spells and prepare more as you level. Swap one spell or cantrip when you gain a Monk level.",
    "Mystic Fighting Style": "When you take the Attack action, you can replace one Unarmed Strike with a Sorcerer cantrip that has a casting time of an action.",
    "Mystic Focus": "Expend a spell slot (no action) to regain Focus Points equal to its level. When you finish a Short Rest or use Uncanny Metabolism, you can spend Focus Points to recover a slot: level 1 = 2 FP, level 2 = 3 FP (Monk 7), level 3 = 5 FP (Monk 13), level 4 = 6 FP (Monk 19).",
    "Focused Strike": "When you use Stunning Strike, the target has Disadvantage on saves against your spells until the start of your next turn, whether or not it succeeded.",
    "Improved Mystic Fighting Style": "When you use Flurry of Blows, you can replace two Unarmed Strikes with a level 1 or 2 Sorcerer spell that has a casting time of an action."
  },
  "monk:mysticbrews": {
    "Bonus Proficiencies": "You gain proficiency in Performance (or another Monk skill if you have it) and with Brewer's Supplies.",
    "Drunken Technique": "When you spend a Focus Point on Patient Defense, your Speed increases by 10 ft this turn and you can make one Unarmed Strike right after that Bonus Action.",
    "Tipsy Sway": "Leap to Your Feet: standing up from Prone costs only 5 ft of movement.\nRedirect Attack: when an enemy misses you with a melee attack, use your Reaction and 1 Focus Point to make it hit another creature you can see within 5 ft of you (not the attacker).",
    "Mystic Brew": "When you finish a Short or Long Rest holding Brewer's Supplies, you create one magical pint (it vanishes at your next rest). Drinking it takes 1 minute; the effect lasts 1 hour (8 hours if you spend 1 Focus Point when brewing) or until you drink another. Pick today's brew on the sheet when you rest.",
    "Wizened Brewer": "Three new brews: Blue Lightning, Drunkard's Luck and Stumbling Monk.",
    "Master Brewer": "Your brew can combine two different options in one beverage.",
    "Intoxicated Frenzy": "Right after you use Patient Defense you can move up to your Speed; when you move within 5 ft of a creature you can make an Unarmed Strike against it (each creature once per turn). On a hit it makes a Dex save or falls Prone."
  },
  "paladin:noblegenies": {
    "Elemental Smite": "Right after you cast Divine Smite, expend a Channel Divinity for one effect:\n• Dao's Crush: the target is Grappled (escape DC = spell DC) and Restrained while Grappled.\n• Djinni's Escape: teleport up to 30 ft and become semi-incorporeal until the end of your next turn (Resistance to Bludgeoning, Piercing, Slashing; immune to Grappled, Prone, Restrained).\n• Efreeti's Fury: the target takes +2d4 Fire, and fire leaps to another creature within 30 ft for 2d4 Fire.\n• Marid's Surge: the target and creatures you choose within 10 ft make a Str save or are pushed 15 ft and knocked Prone.",
    "Genie Spells": "You always have these spells prepared from the listed Paladin level.",
    "Genie's Splendor": "Without armor your base AC is 10 + Dex + Cha (Shields allowed). You gain proficiency in Acrobatics, Intimidation, Performance or Persuasion.",
    "Aura of Elemental Shielding": "You and allies in your Aura of Protection have Resistance to Acid, Cold, Fire, Lightning or Thunder (your choice); you can switch the type at the start of each of your turns.",
    "Elemental Rebuke": "Reaction when hit by an attack: halve the damage, and the attacker makes a Dex save or takes 2d10 + Cha Acid, Cold, Fire, Lightning or Thunder damage (half on success). Uses = Cha modifier per Long Rest.",
    "Noble Scion": "Bonus Action, 10 minutes: Fly 60 ft (hover), and Minor Wish — when you or an ally in your aura fails a D20 Test, use your Reaction to make it succeed. Once per Long Rest, or spend a level 5 slot."
  },
  "paladin:ebonblade": {
    "Death Coil": "Replaces Lay On Hands. Your creature type becomes Undead. You have a pool of d8s = 1 + Cha modifier (refills on a Long Rest). Bonus Action: a creature within 60 ft makes a Con save; spend up to Cha-mod dice from the pool and roll them — Necrotic damage (half on a success). An Undead target can instead regain that many HP.",
    "Runic Smite": "Replaces Paladin's Smite: you always have Rune Strike prepared and can cast it once per Long Rest without a spell slot.",
    "Oath of the Ebon Blade Spells": "You always have the spells for all Ebon Blade paladins plus those of the rune currently inscribed on your weapon (shown in your Spells).",
    "Runeforging": "When you finish a Long Rest you inscribe a Blood, Frost or Unholy rune on a melee weapon you hold (or move it). Your current rune and what it does is shown under \"Inscribed rune\" in your features; change it in the Long Rest window.",
    "Runic Power": "Immediately after casting Rune Strike, you can expend a Channel Divinity for your rune's effect — Blood: heal the Necrotic damage dealt. Frost: target and enemies within 10 ft of it take 2d6 Cold. Unholy: the target subtracts 1d6 from its next save before the end of your next turn.",
    "Faithful Steed": "Your Find Steed can be Undead: its Otherworldly Slam deals Necrotic damage, and once per Long Rest it can use Ghostly Stride (Bonus Action: it and its rider move through creatures and objects as Difficult Terrain this turn; 1d10 Force if they end inside one).",
    "Aura of Deathly Endurance": "You and allies in your Aura of Protection have Resistance to Cold, Necrotic and Psychic damage.",
    "Runic Strikes": "Replaces Radiant Strikes: your melee weapon hits and Unarmed Strikes deal an extra 1d8 Necrotic damage.",
    "Improved Death Coil": "Death Coil deals extra Necrotic damage equal to your Cha modifier (save or not), and heals Undead for your Paladin level extra.",
    "Runic Mastery": "Once per Long Rest, invoke your rune's mastery (see \"Inscribed rune\").",
    "Aspect of the Horsemen": "Bonus Action, 10 minutes (once per Long Rest, or a level 5 slot): you can restore Runic Mastery by expending a level 4 slot, and Runic Power and Runic Mastery can use any rune's effect."
  },
  "paladin:holy": {
    "Oath of the Holy Spells": "You always have these spells prepared from the listed Paladin level.",
    "Beacon of Light": "Magic action, expend a Channel Divinity: choose an ally within 60 ft for 1 minute. Whenever you heal another creature with a spell or Lay On Hands, the beacon regains half as much.",
    "Lightbringer's Aura": "When you heal a Bloodied creature in your Aura of Protection with a spell or Lay On Hands, it regains an extra 1d6 HP.",
    "Infusion of Light": "When you cast a spell that deals Radiant damage, your Lay On Hands pool regains HP equal to the Radiant damage rolled (up to its maximum of 5 × Paladin level).",
    "Holy Deliverance": "Bonus Action, 10 minutes (once per Long Rest, or a level 5 slot): your aura is filled with sunlight, and each ally that starts its turn Bloodied in it regains Cha + PB HP."
  },
  "ranger:winterwalker": {
    "Frigid Explorer": "Biting Cold: your weapon attacks, Ranger spells and features ignore Cold Resistance.\nFrost Resistance: you have Resistance to Cold.\nPolar Strikes: once per turn when you hit with a weapon attack, +1d4 Cold (1d6 from level 11).",
    "Hunter's Rime": "When you cast Hunter's Mark you gain Temp HP = 1d10 + Ranger level. The marked creature can't take the Disengage action.",
    "Winter Walker Spells": "You always have these spells prepared from the listed Ranger level.",
    "Fortifying Soul": "Magic action: up to Wis-modifier creatures you can see regain 1d10 + Ranger level HP and have Advantage on saves against Frightened for 1 hour. Once per Long Rest.",
    "Chilling Retribution": "Reaction when a creature hits you: it makes a Wis save or is Stunned (Speed 0) until the end of your next turn. Uses = Wis modifier per Long Rest.",
    "Frozen Haunt": "When you cast Hunter's Mark you can take a ghostly snowy form until it ends (once per Long Rest, or a level 4+ slot): Cold immunity; 2d4 Cold to chosen creatures in a 15-ft Emanation when you transform and at the start of each turn; immune to Grappled, Prone, Restrained; move through creatures and objects as Difficult Terrain (1d10 Force if you end inside one)."
  },
  "ranger:demonhunter": {
    "Demon Hunter Spells": "You always have the Demon Hunter spells plus those of your path (Devourer, Havoc or Vengeance) from the listed Ranger level.",
    "Soul Fragments": "After a Long Rest you have soul fragments = Wis modifier (+1 at level 13, +2 at 17); they vanish at your next Long Rest. Reaction: regain one when an enemy you can see within 30 ft dies.\n• Double Jump: spend 1 to cast Feather Fall or Jump without a slot.\n• Soul Cleave: once per turn with the Attack action, spend 1 to replace an attack with a 10-ft Emanation — Dex save or 1d12 + Wis Psychic, and you heal Wis-modifier HP.",
    "Spectral Sight": "You have Blindsight 10 ft.",
    "Torment": "A creature marked by your Hunter's Mark has Disadvantage on attacks against anyone but you. Once per turn when you hit it: Aura of Pain (it subtracts 1d4 from its next save before the end of your next turn) or Chaos Strike (+1d8 Fire).",
    "Illidari Knowledge": "Disrupt: spend 2 fragments to cast Counterspell. Warglaive Mastery: Bonus Action, spend 1 fragment to cast Throw Glaive without a slot.",
    "Soul Shatter": "Soul Cleave deals 2d12 + Wis. When you roll Initiative with no fragments, you gain one.",
    "Improved Spectral Sight": "Replaces Feral Senses: you have Truesight 30 ft."
  },
  "rogue:scion": {
    "Bloodthirst": "When an enemy you can see within 30 ft takes damage and becomes Bloodied without dying, use your Reaction to teleport next to it and make one melee attack. Uses = Int modifier per Long Rest.",
    "Dread Allegiance": "Choose Bane (Psychic resistance, Minor Illusion), Bhaal (Poison resistance, Blade Ward) or Myrkul (Necrotic resistance, Chill Touch); Intelligence for the cantrip. You can change it when you finish a Long Rest.",
    "Strike Fear": "New Cunning Strike — Terrify (cost 1d6): Wis save or Frightened for 1 minute (save again at the end of each turn); you have Advantage on attacks against it while it's Frightened.",
    "Aura of Malevolence": "When you teleport with Bloodthirst, creatures of your choice within 10 ft of where you left or arrived take damage = Int modifier, of your Dread Allegiance type. It ignores Resistance.",
    "Dread Incarnate": "Cutthroat: regain one Bloodthirst use on a Short Rest. Murderous Intent: Sneak Attack dice that roll 1 or 2 count as 3."
  },
  "rogue:swashbuckler24": {
    "Fancy Footwork": "When you make a melee attack against a creature, it can't make Opportunity Attacks against you for the rest of your turn.",
    "Rakish Audacity": "Add your Charisma modifier to Initiative. You can Sneak Attack a creature without Advantage if no other creature is within 5 ft of you (and you don't have Disadvantage).",
    "Panache": "After a Sneak Attack you can goad the target into attacking you, or charm nearby enemies for a round.",
    "Dashing Strikes": "New Cunning Strike options: raise your AC for a round, or bolster an ally's attack rolls and saving throws for a round.",
    "Master Duelist": "When you hit with a Sneak Attack, you can make another attack."
  },
  "sorcerer:spellfire": {
    "Spellfire Burst": "Once per turn, when you spend at least 1 Sorcery Point as part of a Magic action or Bonus Action:\n• Bolstering Flames: you or a creature within 30 ft gains Temp HP = 1d4 + Cha.\n• Radiant Fire: a creature within 30 ft takes 1d4 Fire or Radiant damage.",
    "Spellfire Spells": "You always have these spells prepared from the listed Sorcerer level.",
    "Absorb Spells": "You always have Counterspell prepared. When a target fails its save against your Counterspell, you regain 1d4 Sorcery Points.",
    "Honed Spellfire": "Bolstering Flames adds your Sorcerer level to the Temp HP, and Radiant Fire deals 1d8.",
    "Crown of Spellfire": "When you use Innate Sorcery you can infuse yourself with spellfire while it lasts: Burning Life Force (once per turn when hit, spend up to Cha-mod Hit Dice and reduce the damage by the roll), Fly 60 ft (hover), and Spell Avoidance (no damage on a successful save vs half-damage effects, half on a failure). Once per Long Rest, or spend 5 Sorcery Points."
  },
  "warlock:vestige": {
    "Vestige Companion": "A Small vestige (Celestial, Fiend or Undead — you can change the form after a Long Rest) serves you: AC 13 + Cha, HP 4 + 4 × Warlock level, hover 30 ft, immune to Charmed, Frightened, Prone. It acts on your turn and only Dodges unless you command it with a Bonus Action; you can give up one of your attacks to have it use Vestige's Strike (your spell attack, reach 5 or range 60 ft, 1d6 + 3 + Cha damage of its type). Divine Power (Bonus Action, 1/day) depends on its form — see \"Vestige form\". At 0 HP it vanishes; a 1-minute ceremony brings it back.",
    "Vestige Spells": "Choose Life, Light, Trickery or War: that Cleric domain's spells count as Warlock spells and are always prepared at the matching Warlock levels.",
    "Vestige Power": "Divine Power recharges on a Short or Long Rest or when you use Magical Cunning. Within 30 ft of the vestige you share its damage Resistance.",
    "Vestige Recovery": "When the vestige would drop to 0 HP, use your Reaction and a Pact Magic slot to restore it to full HP; it teleports up to 30 ft. Once per Long Rest.",
    "Semblance of Life": "Magic action, vestige within 90 ft: for 1 hour it becomes a Celestial, Fiendish or Undead Spirit (as Summon Celestial/Fiend/Undead at half your Warlock level, max 9), keeping its HP and Divine Power and gaining Temp HP equal to the spirit's HP. Once per Long Rest."
  },
  "wizard:bladesinger": {
    "Bladesong": "Bonus Action, no armor or Shield, 1 minute: +Int to AC (min +1), +10 ft Speed, Advantage on Acrobatics, use Int for attack and damage with proficient weapons, and add Int to Concentration saves. Ends if Incapacitated, you don armor or a Shield, or attack two-handed. Uses = Int modifier per Long Rest; regain one with Arcane Recovery.",
    "Training in War and Song": "Proficiency with Melee Martial weapons without Two-Handed or Heavy; a proficient melee weapon can be your Spellcasting Focus; one skill from Acrobatics, Athletics, Performance or Persuasion.",
    "Extra Attack": "You attack twice when you take the Attack action, and can replace one attack with a Wizard cantrip that takes an action.",
    "Song of Defense": "When you take damage while Bladesong is active, use your Reaction and a spell slot to reduce it by 5 × the slot's level.",
    "Song of Victory": "After you cast a spell with a casting time of an action, you can make one weapon attack as a Bonus Action."
  },
  "wizard:conjurer": {
    "Benign Transposition": "Bonus Action: teleport up to 30 ft, or swap places with a willing Medium or smaller creature in range. Uses = Int modifier per Long Rest.",
    "Conjuration Savant": "Add two Conjuration spells (level 2 or lower) to your spellbook for free, plus one each time you gain a new spell slot level.",
    "Distant Transposition": "Benign Transposition reaches 60 ft, and you can restore a use by expending a level 3+ slot.",
    "Durable Summons": "Creatures you summon or create with a Conjuration spell gain Temp HP = 2 × Wizard level and, while they have them, Resistance to all damage except Force, Necrotic, Psychic and Radiant.",
    "Focused Conjuration": "Taking damage can't break your Concentration on Conjuration spells.",
    "Splintered Summons": "When a Conjuration spell summons a spirit with a stat block (e.g. Summon Aberration), you summon two, each with half the HP. Once per Long Rest, or spend a level 5+ slot."
  },
  "wizard:enchanter": {
    "Enchanting Conversationalist": "Proficiency in Deception, Intimidation or Persuasion; add your Int modifier to checks with it.",
    "Enchantment Savant": "Add two Enchantment spells (level 2 or lower) to your spellbook for free, plus one each time you gain a new spell slot level.",
    "Hypnotic Presence": "Magic action: a creature within 10 ft that can see or hear you makes a Wis save or is Charmed for 1 minute (Incapacitated, Speed 0). Ends if it moves more than 10 ft away, can't see or hear you, or takes damage. Uses = Int modifier per Long Rest.",
    "Split Enchantment": "When an Enchantment spell with a slot could target an extra creature when upcast, you can raise its effective level by 1 for free. Uses = Int modifier per Long Rest.",
    "Instinctive Charm": "Reaction when a creature within 30 ft hits you: Wis save or the attack misses and is redirected to another creature in range (your choice). Once per Long Rest; recharge by casting an Enchantment spell with a slot.",
    "Alter Memories": "When you Charm with an Enchantment spell, one target doesn't notice it. Once before the spell ends, a Magic action forces an Int save or it loses 1 + Int-mod hours of memory."
  },
  "wizard:necromancer": {
    "Necromancy Savant": "Add two Necromancy spells (level 2 or lower) to your spellbook for free, plus one each time you gain a new spell slot level.",
    "Necromancy Spellbook": "Resistance to Necrotic damage. Find Familiar is in your spellbook and can be a Skeleton or Zombie (or Undead familiar); you can forgo one attack so it attacks with its Reaction. When you cast a Necromancy spell with a slot, an Undead within 60 ft regains slot level + Wizard level HP.",
    "Grave Power": "Holding your spellbook: Arcane Recovery also removes 1 Exhaustion, and your Wizard spells and features ignore Necrotic Resistance.",
    "Undead Thralls": "Animate Dead is always prepared; cast it once per Long Rest without a slot, and you can raise its level by 1. Your Undead from Necromancy spells gain HP = Int + half Wizard level, and deal extra Necrotic = Int modifier on hits.",
    "Harvest Undead": "Reaction right after you become Bloodied (not at 0 HP): reduce an Undead you control to 0 HP and regain HP equal to your Wizard level.",
    "Death's Master": "Bolster Undead (Bonus Action, once per Long Rest): your Undead within 60 ft gain Temp HP = Wizard level. Extinguish Undead: when an Undead you can see drops to 0 HP it explodes — 10-ft Emanation, Dex save, d6s = half its remaining Hit Dice Necrotic (half on success) and no Reactions. For Undead you don't control: Reaction + level 5+ slot."
  },
  "wizard:transmuter": {
    "Transmutation Savant": "Add two Transmutation spells (level 2 or lower) to your spellbook for free, plus one each time you gain a new spell slot level.",
    "Transmuter's Stone": "After a Long Rest you create a stone (also a Spellcasting Focus). Its holder has proficiency in Con saves and one benefit: Darkvision 60 ft, a Resistance (Acid, Cold, Fire, Lightning, Poison or Thunder) or +10 ft Speed. You can change the benefit when you cast a Transmutation spell with a slot.",
    "Wondrous Alteration": "Alter Self is always prepared; cast it once per Long Rest without a slot. Its options improve: Dash as a Bonus Action underwater, Advantage on Deception, natural weapons deal 2d6 and Advantage on Concentration saves.",
    "Empowered Transmutation": "When you cast a Transmutation spell with a slot that doesn't attack or force a save, raise its effective level by 1. Uses = Int modifier per Long Rest.",
    "Potent Stone": "Your stone grants two benefits, with two new options: Mighty Build (Advantage on Str saves, one size larger for carrying) and Tremorsense 30 ft.",
    "Shape-Shifter": "Polymorph is always prepared; cast it once per Long Rest without a slot. On yourself (once per Long Rest) you keep your mind, Int/Wis/Cha, proficiencies, features and feats, and can cast Transmutation spells.",
    "Master Transmuter": "Magic action: consume the stone (or spend a level 7+ slot to keep it) for Major Transformation, Panacea (heal half max HP and end curses, Poisoned, Petrified), Restore Life (Raise Dead, no slot) or Restore Youth."
  }
};
function subDesc(cls, subKey, name) { return SUB_DESC[cls + ":" + subKey]?.[name] || ""; }
// what each rest-choice option does, for the features list
function choiceText(ch, opt) {
  const parts = [];
  if (ch.desc?.[opt]) parts.push(ch.desc[opt]);
  const sp = ch.spells?.[opt]; if (sp) parts.push("Spells always prepared: " + Object.entries(sp).map(([l, a]) => a.join(", ") + " (level " + l + ")").join("; ") + ".");
  if (ch.resist?.[opt]) parts.push("Resistance: " + ch.resist[opt].join(", ") + (ch.resistFrom ? " (from level " + ch.resistFrom + ")" : "") + ".");
  parts.push(ch.reset === "LR" ? "You can change this when you finish a Long Rest." : ch.reset === "SR" ? "You pick this again whenever you finish a Short or Long Rest." : "Chosen when you gain this feature.");
  return parts.join("\n\n");
}
