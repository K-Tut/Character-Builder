"use strict";
/* Descriptions of the Artificer's magic item plans.
   Items marked srd: text from the System Reference Document 5.2.1 ("SRD 5.2.1") by Wizards of the Coast LLC, available at
   https://www.dndbeyond.com/srd, licensed under the Creative Commons Attribution 4.0 International License (CC-BY-4.0).
   Items marked own: short summaries written for this app (the items are not in the SRD) — check the book for the full rules. */
const MAGIC_ITEMS = {
"Alchemy Jug": {
"r": "Uncommon wondrous item",
"t": "A ceramic jug that can pour out liquids. As a Magic action you name one liquid and the jug produces it: acid (8 oz), basic poison (½ oz), beer (4 gallons), honey (1 gallon), mayonnaise (2 gallons), oil (1 quart), vinegar (2 gallons), fresh water (8 gallons), salt water (12 gallons) or wine (1 gallon). After that it can't make a liquid again until the next dawn. It pours up to 2 gallons per minute.",
"own": 1
},
"Bag of Holding": {
"r": "Wondrous Item · Uncommon",
"t": "This bag has an interior space considerably larger than its outside dimensions-roughly 2 feet square and 4 feet deep on the inside. The bag can hold up to 500 pounds, not exceeding a volume of 64 cubic feet. The bag weighs 5 pounds, regardless of its contents. Retrieving an item from the bag requires a Utilize action.\n If the bag is overloaded, pierced, or torn, it is destroyed, and its contents are scattered in the Astral Plane. If the bag is turned inside out, its contents spill forth unharmed, but the bag must be put right before it can be used again. The bag holds enough air for 10 minutes of breathing, divided by the number of breathing creatures inside.\n Placing a Bag of Holding inside an extradimensional space created by a Handy Haversack, Portable Hole, or similar item instantly destroys both items and opens a gate to the Astral Plane. The gate originates where the one item was placed inside the other. Any creature within a 10-foot-radius Sphere centered on the gate is sucked through it to a random location on the Astral Plane. The gate then closes. The gate is one-way and can't be reopened."
},
"Cap of Water Breathing": {
"r": "Uncommon wondrous item",
"t": "While wearing this cap underwater, you can take a Magic action to create a bubble of air around your head. You can breathe normally underwater until you remove the cap or end the effect.",
"own": 1
},
"Goggles of Night": {
"r": "Wondrous Item · Uncommon",
"t": "While wearing these dark lenses, you have Darkvision out to 60 feet. If you already have Darkvision, wearing the goggles increases its range by 60 feet."
},
"Manifold Tool": {
"r": "Wondrous item (artificer)",
"t": "A multi-purpose tool that can change its form into any set of Artisan's Tools, Thieves' Tools or Tinker's Tools you need. An artificer can also use it as a spellcasting focus. Check the book for the exact rules.",
"own": 1
},
"Repeating Shot": {
"r": "Uncommon weapon (any with the Ammunition property), requires attunement",
"t": "+1 bonus to attack and damage rolls made with this weapon. It ignores the Loading property, and if you have no ammunition loaded it makes its own: a piece of magic ammunition appears when you attack and vanishes right after the hit or miss.",
"own": 1
},
"Returning Weapon": {
"r": "Uncommon weapon (any with the Thrown property)",
"t": "+1 bonus to attack and damage rolls made with this weapon, and it returns to your hand right after you use it to make a ranged attack.",
"own": 1
},
"Rope of Climbing": {
"r": "Wondrous Item · Uncommon",
"t": "This 60-foot length of rope can hold up to 3,000 pounds. While holding one end of the rope, you can take a Magic action to command the other end of the rope to animate and move toward a destination you choose, up to the rope's length away from you. That end moves 10 feet on your turn when you first command it and 10 feet at the start of each of your subsequent turns until reaching its destination or until you tell it to stop. You can also tell the rope to fasten itself securely to an object or to unfasten itself, to knot or unknot itself, or to coil itself for carrying.\n If you tell the rope to knot, large knots appear at 1-foot intervals along the rope. While knotted, therope shortens to a 50-foot length and grants Advantage on ability checks made to climb using the rope. The rope has AC 20, HP 20, and Immunity to Poison and Psychic damage. It regains 1 Hit Point every5 minutes as long as it has at least 1 Hit Point. If the rope drops to 0 Hit Points, it is destroyed."
},
"Sending Stones": {
"r": "Uncommon wondrous item",
"t": "A pair of matched stones. While you touch one, you can cast Sending from it, targeting whoever carries the other stone. Once used, the stones can't cast it again until the next dawn.",
"own": 1
},
"Shield, +1": {
"r": "Armor (Shield) · Uncommon",
"t": "While holding this Shield, you have a +1 bonus to Armor Class, in addition to the Shield's normal bonus to AC."
},
"Wand of Magic Detection": {
"r": "Wand · Uncommon",
"t": "This wand has 3 charges. While holding it, you can expend 1 charge to cast Detect Magic from it. The wand regains 1d3 expended charges daily at dawn."
},
"Wand of Secrets": {
"r": "Wand · Uncommon",
"t": "This wand has 3 charges and regains 1d3 expended charges daily at dawn. While holding it, you can take a Magic action to expend 1 charge, and if a secret door or trap is within 60 feet of you, the wand pulses and points at the one nearest to you."
},
"Wand of the War Mage, +1": {
"r": "Wand · Uncommon",
"t": "Uncommon (+1)\n While holding this wand, you gain a +1 bonus to spell attack rolls. In addition, you ignore Half Cover when making a spell attack roll."
},
"Weapon, +1": {
"r": "Weapon (Any Simple or Martial) · Uncommon",
"t": "Uncommon (+1)\n You have a +1 bonus to attack rolls and damage rolls made with this magic weapon."
},
"Wraps of Unarmed Power, +1": {
"r": "Uncommon wondrous item",
"t": "While wearing these hand wraps you have a +1 bonus to attack and damage rolls with your Unarmed Strikes.",
"own": 1
},
"Clockwork Amulet": {
"r": "Common wondrous item",
"t": "When you make an attack roll while wearing the amulet, you can choose not to roll and treat the d20 as a 10. Once used, this can't be done again until the next dawn.",
"own": 1
},
"Dark Shard Amulet": {
"r": "Common wondrous item, requires attunement by a warlock",
"t": "Works as a spellcasting focus for your warlock spells. Once per long rest you can try to cast a warlock cantrip you don't know: make a DC 10 Intelligence (Arcana) check; on a success you cast it.",
"own": 1
},
"Everbright Lantern": {
"r": "Common wondrous item",
"t": "A lantern whose flame never goes out and needs no oil; it gives off light like a normal lantern.",
"own": 1
},
"Hat of Vermin": {
"r": "Common wondrous item",
"t": "Has 3 charges. As a Magic action you spend a charge and pull a bat, a frog or a rat out of the hat. The creature is an ordinary animal that vanishes after an hour. The hat regains all charges at dawn.",
"own": 1
},
"Hat of Wizardry": {
"r": "Common wondrous item, requires attunement by a wizard",
"t": "Works as a spellcasting focus for your wizard spells. Once per long rest you can try to cast a wizard cantrip you don't know: make a DC 10 Intelligence (Arcana) check; on a success you cast it.",
"own": 1
},
"Perfume of Bewitching": {
"r": "Common wondrous item",
"t": "A small vial of perfume. Applying it takes an action; for 1 hour you have Advantage on Charisma checks you make against Humanoids of Challenge Rating 1 or lower.",
"own": 1
},
"Pot of Awakening": {
"r": "Common wondrous item",
"t": "Plant an ordinary shrub in this pot and let it grow for 30 days; at the end the shrub becomes an Awakened Shrub that is friendly to you.",
"own": 1
},
"Ruby of the War Mage": {
"r": "Common wondrous item, requires attunement by a spellcaster",
"t": "A gem you fix to a Simple or Martial weapon. While you hold that weapon you can use it as a spellcasting focus.",
"own": 1
},
"Armor, +1": {
"r": "Armor (Any Light, Medium, or Heavy) · Rare",
"t": "You have a +1 bonus to Armor Class while wearing this armor."
},
"Boots of Elvenkind": {
"r": "Wondrous Item · Uncommon",
"t": "While you wear these boots, your steps make no sound, regardless of the surface you are moving across. You also have Advantage on Dexterity (Stealth) checks."
},
"Boots of the Winding Path": {
"r": "Uncommon wondrous item, requires attunement",
"t": "As a Bonus Action you can teleport up to 15 feet to an unoccupied space you were in earlier this turn or on your previous turn.",
"own": 1
},
"Cloak of Elvenkind": {
"r": "Wondrous Item · Uncommon",
"t": "While you wear this cloak, Wisdom (Perception) checks made to perceive you have Disadvantage, and you have Advantage on Dexterity (Stealth) checks."
},
"Cloak of the Manta Ray": {
"r": "Wondrous Item · Uncommon",
"t": "While wearing this cloak, you can breathe underwater, and you have a Swim Speed of 60 feet."
},
"Eyes of Charming": {
"r": "Wondrous Item · Uncommon",
"t": "These crystal lenses fit over the eyes. They have 3 charges. While wearing them, you can expend 1 or more charges to cast Charm Person (save DC13). For 1 charge, you cast the level 1 version of the spell. You increase the spell's level by one for each additional charge you expend. The lenses regain all expended charges daily at dawn."
},
"Eyes of Minute Seeing": {
"r": "Wondrous Item · Uncommon",
"t": "These crystal lenses fit over the eyes. While wearing them, your vision improves significantly out to a range of 1 foot, granting you Darkvision within that range and Advantage on Intelligence (Investigation) checks made to examine something within that range."
},
"Gloves of Thievery": {
"r": "Uncommon wondrous item",
"t": "These gloves are invisible while worn. You get a +5 bonus to Dexterity (Sleight of Hand) checks.",
"own": 1
},
"Helm of Awareness": {
"r": "Uncommon wondrous item, requires attunement",
"t": "While wearing this helm you have Advantage on Initiative rolls, and you can't be surprised while you aren't Incapacitated.",
"own": 1
},
"Lantern of Revealing": {
"r": "Wondrous Item · Uncommon",
"t": "While lit, this hooded lantern burns for 6 hours on 1 pint of oil, shedding Bright Light in a 30-foot radius and Dim Light for an additional 30 feet. Invisible creatures and objects are visible as long as they are in the lantern's Bright Light. You can take a Utilize action to lower the hood, reducing the lantern's light to Dim Light in a 5-foot radius."
},
"Mind Sharpener": {
"r": "Uncommon wondrous item, requires attunement",
"t": "Has 4 charges. When you fail a Constitution saving throw to keep Concentration, you can take a Reaction and spend a charge to succeed instead. Regains 1d4 charges at dawn.",
"own": 1
},
"Necklace of Adaptation": {
"r": "Wondrous Item · Uncommon",
"t": "While wearing this necklace, you can breathe normally in any environment, and you have Advantage on saving throws made to avoid or end the Poisoned condition."
},
"Pipes of Haunting": {
"r": "Wondrous Item · Uncommon",
"t": "These pipes have 3 charges and regain 1d3 expended charges daily at dawn. You can take a Magic action to play them and expend 1 charge to create an eerie, spellbinding tune. Each creature of your choice within 30 feet of you must succeed on a DC 15 Wisdom saving throw or have the Frightened condition for 1 minute. A creature that fails the save repeats it at the end of each of its turns, ending the effect on itself on a success. A creature that succeeds on its save is immune to the effect of these pipes for 24 hours."
},
"Repulsion Shield": {
"r": "Uncommon armor (Shield)",
"t": "+1 bonus to AC on top of the shield's normal bonus. It has 4 charges: when a creature hits you with a melee attack, you can take a Reaction and spend a charge to push it up to 15 feet away. Regains 1d4 charges at dawn.",
"own": 1
},
"Ring of Swimming": {
"r": "Ring · Uncommon",
"t": "You have a Swim Speed of 40 feet while wearing this ring."
},
"Ring of Water Walking": {
"r": "Ring · Uncommon",
"t": "While wearing this ring, you cast Water Walk from it, targeting only yourself."
},
"Sentinel Shield": {
"r": "Uncommon armor (Shield)",
"t": "While holding this shield you have Advantage on Initiative rolls and on Wisdom (Perception) checks.",
"own": 1
},
"Spell-Refueling Ring": {
"r": "Uncommon ring, requires attunement",
"t": "As a Magic action you regain one expended spell slot of level 3 or lower. Once used, the ring can't do this again until the next dawn.",
"own": 1
},
"Wand of Magic Missiles": {
"r": "Wand · Uncommon",
"t": "This wand has 7 charges. While holding it, you can expend no more than 3 charges to cast Magic Missile from it. For 1 charge, you cast the level 1 version of the spell. You can increase the spell's level by 1 for each additional charge you expend.\n Regaining Charges. The wand regains 1d6 + 1 expended charges daily at dawn. If you expend the wand's last charge, roll 1d20. On a 1, the wand crumbles into ashes and is destroyed."
},
"Wand of Web": {
"r": "Wand · Uncommon",
"t": "This wand has 7 charges. While holding it, you can expend 1 charge to cast Web (save DC 13) from it.\n Regaining Charges. The wand regains 1d6 + 1 expended charges daily at dawn. If you expendthe wand's last charge, roll 1d20. On a 1, the wand crumbles into ashes and is destroyed."
},
"Weapon of Warning": {
"r": "Weapon (Any Simple or Martial) · Uncommon",
"t": "As long as this weapon is within your reach and you are attuned to it, you and allies within 30 feet of you gain the following benefits.\n Alarm. The weapon magically awakens each subject who is sleeping naturally when combat begins. This benefit doesn't wake a subject from magically induced sleep.\n Supernatural Readiness. Each subject has Advantage on its Initiative rolls."
},
"Armor of Resistance": {
"r": "Armor (Any Light, Medium, or Heavy) · Rare",
"t": "You have Resistance to one type of damage while you wear this armor. The GM chooses the type or determines it randomly by rolling on the following table.1d10Damage Type1d10Damage Type1Acid6Necrotic2Cold7Poison3Fire8Psychic4Force9Radiant5Lightning10Thunder"
},
"Dagger of Venom": {
"r": "Weapon (Dagger) · Rare",
"t": "You gain a +1 bonus to attack rolls and damage rolls made with this magic weapon.\n You can take a Bonus Action to magically coat the blade with poison. The poison remains for 1 minute or until an attack using this weapon hits a creature. That creature must succeed on a DC 15 Constitution saving throw or take 2d10 Poison damage and have the Poisoned condition for 1 minute. The weapon can't be used this way again until the next dawn."
},
"Elven Chain": {
"r": "Armor (Chain Mail or Chain Shirt) · Rare",
"t": "You gain a +1 bonus to Armor Class while you wear this armor. You are considered trained with this armor even if you lack training with Medium or Heavy armor."
},
"Ring of Feather Falling": {
"r": "Ring · Rare",
"t": "When you fall while wearing this ring, you descend 60 feet per round and take no damage from falling."
},
"Ring of Jumping": {
"r": "Ring · Uncommon",
"t": "While wearing this ring, you can cast Jump from it, but can target only yourself when you do so."
},
"Ring of Mind Shielding": {
"r": "Ring · Uncommon",
"t": "While wearing this ring, you are immune to magic that allows other creatures to read your thoughts, determine whether you are lying, know your alignment, or know your creature type. Creatures can telepathically communicate with you only if you allow it.\n You can take a Magic action to cause the ring to become imperceptible until you take another Magic action to make it perceptible, until you remove the ring, or until you die.\n If you die while wearing the ring, your soul enters it, unless it already houses a soul. You can remain in the ring or depart for the afterlife. As long as your soul is in the ring, you can telepathically communicate with any creature wearing it. A wearer can't prevent this telepathic communication."
},
"Shield, +2": {
"r": "Armor (Shield) · Rare",
"t": "While holding this Shield, you have a +2 bonus to Armor Class, in addition to the Shield's normal bonus to AC."
},
"Wand of the War Mage, +2": {
"r": "Wand · Rare",
"t": "Rare (+2)\n While holding this wand, you gain a +2 bonus to spell attack rolls. In addition, you ignore Half Cover when making a spell attack roll."
},
"Weapon, +2": {
"r": "Weapon (Any Simple or Martial) · Rare",
"t": "Rare (+2)\n You have a +2 bonus to attack rolls and damage rolls made with this magic weapon."
},
"Wraps of Unarmed Power, +2": {
"r": "Rare wondrous item",
"t": "While wearing these hand wraps you have a +2 bonus to attack and damage rolls with your Unarmed Strikes.",
"own": 1
},
"Amulet of Proof against Detection and Location": {
"r": "Wondrous Item · Uncommon",
"t": "While wearing this amulet, you can't be targeted by Divination spells or perceived through magical scrying sensors unless you allow it."
},
"Boots of Striding and Springing": {
"r": "Wondrous Item · Uncommon",
"t": "While you wear these boots, your Speed becomes 30 feet unless your Speed is higher, and your Speed isn't reduced by you carrying weight in excess of your carrying capacity or wearing Heavy Armor.\n Once on each of your turns, you can jump up to 30 feet by spending only 10 feet of movement."
},
"Bracers of Archery": {
"r": "Wondrous Item · Uncommon",
"t": "While wearing these bracers, you have proficiency with the Longbow and Shortbow, and you gain a +2 bonus to damage rolls made with such weapons."
},
"Brooch of Shielding": {
"r": "Wondrous Item · Uncommon",
"t": "While wearing this brooch, you have Resistance to Force damage, and you have Immunity to damage from the Magic Missile spell."
},
"Broom of Flying": {
"r": "Wondrous Item · Uncommon",
"t": "This wooden broom functions like a mundane broom until you stand astride it and take a Magic action to make it hover beneath you, at which time it can be ridden in the air. It has a Fly Speed of 50 feet. It can carry up to 400 pounds, but its Fly Speed becomes 30 feet while carrying over 200 pounds.The broom stops hovering when you land or when you're no longer riding it.\n As a Magic action, you can send the broom to travel alone to a destination within 1 mile of you if you name the location and are familiar with it. The broom comes back to you when you take a Magic action and use a command word if the broom is still within 1 mile of you."
},
"Cloak of Protection": {
"r": "Wondrous Item · Uncommon",
"t": "You gain a +1 bonus to Armor Class and saving throws while you wear this cloak."
},
"Decanter of Endless Water": {
"r": "Wondrous Item · Uncommon",
"t": "This stoppered flask sloshes when shaken, as if itcontains water. The decanter weighs 2 pounds.\n You can take a Magic action to remove the stopper and issue one of three command words, whereupon an amount of fresh water or salt water (your choice) pours out of the flask. The water stops pouring out at the start of your next turn. Choose from the following command words:Splash. The decanter produces 1 gallon of water.Fountain. The decanter produces 5 gallons of water. Geyser. The decanter produces 30 gallons of water that gushes forth in a Line 30 feet long and 1 foot wide. If you're holding the decanter, you can aim the geyser in one direction (no action required).One creature of your choice in the Line must succeed on a DC 13 Strength saving throw or take 1d4 Bludgeoning damage and have the Prone condition. Instead of a creature, you can target one object in the Line that isn't being worn or carried and that weighs no more than 200 pounds. The object is knocked over by the geyser."
},
"Eyes of the Eagle": {
"r": "Wondrous Item · Uncommon",
"t": "These crystal lenses fit over the eyes. While wearing them, you have Advantage on Wisdom (Perception) checks that rely on sight. In conditions of clear visibility, you can make out details of even extremely distant creatures and objects as small as 2 feet across."
},
"Gauntlets of Ogre Power": {
"r": "Wondrous Item · Uncommon",
"t": "Your Strength is 19 while you wear these gauntlets. They have no effect on you if your Strength is 19 or higher without them."
},
"Headband of Intellect": {
"r": "Wondrous Item · Uncommon",
"t": "Your Intelligence is 19 while you wear this headband. It has no effect on you if your Intelligence is 19 or higher without it."
},
"Pearl of Power": {
"r": "Wondrous Item · Uncommon",
"t": "While this pearl is on your person, you can take a Magic action to regain one expended spell slot of level 3 or lower. Once you use the pearl, it can't be used again until the next dawn."
},
"Periapt of Health": {
"r": "Wondrous Item · Uncommon",
"t": "While wearing this pendant, you can take a Magic action to regain 2d4 + 2 Hit Points. Once used, this property can't be used again until the next dawn.\n In addition, you have Advantage on saving throws to avoid or end the Poisoned condition while you wear this pendant."
},
"Periapt of Wound Closure": {
"r": "Wondrous Item · Uncommon",
"t": "While wearing this pendant, you gain the followingbenefits.\n Life Preservation. Whenever you make a Death Saving Throw, you can change a roll of 9 or lower to a 10, turning a failed save into a successful one.\n Natural Healing Boost. Whenever you roll a Hit Point Die to regain Hit Points, double the number of Hit Points it restores."
},
"Slippers of Spider Climbing": {
"r": "Wondrous Item · Uncommon",
"t": "While you wear these light shoes, you can move up, down, and across vertical surfaces and along ceilings, while leaving your hands free. You have aClimb Speed equal to your Speed. However, the slippers don't allow you to move this way on a slippery surface, such as one covered by ice or oil."
},
"Stone of Good Luck": {
"r": "Wondrous Item · Uncommon",
"t": "While this polished agate is on your person, you gain a +1 bonus to ability checks and saving throws."
},
"Winged Boots": {
"r": "Wondrous Item · Uncommon",
"t": "These boots have 4 charges and regain 1d4 expended charges daily at dawn. While wearing the boots, you can take a Magic action to expend 1 charge, gaining a Fly Speed of 30 feet for 1 hour. If you are flying when the duration expires, you descend at a rate of 30 feet per round until you land."
},
"Armor, +2": {
"r": "Armor (Any Light, Medium, or Heavy) · Very Rare",
"t": "You have a +2 bonus to Armor Class while wearing this armor."
},
"Arrow-Catching Shield": {
"r": "Armor (Shield) · Rare",
"t": "You gain a +2 bonus to Armor Class against ranged attack rolls while you wield this Shield. This bonus is in addition to the Shield's normal bonus to AC.\n Whenever an attacker makes a ranged attack roll against a target within 5 feet of you, you can take a Reaction to become the target of the attack instead."
},
"Flame Tongue": {
"r": "Weapon (Any Melee Weapon) · Rare",
"t": "While holding this magic weapon, you can take a Bonus Action and use a command word to cause flames to engulf the damage-dealing part of the weapon. These flames shed Bright Light in a 40foot radius and Dim Light for an additional 40 feet. While the weapon is ablaze, it deals an extra 2d6 Fire damage on a hit. The flames last until you take a Bonus Action to issue the command again or until you drop, stow, or sheathe the weapon."
},
"Ring of Free Action": {
"r": "Ring · Rare",
"t": "While you wear this ring, Difficult Terrain doesn't cost you extra movement. In addition, magic can neither reduce any of your Speeds nor cause you to have the Paralyzed or Restrained condition."
},
"Ring of Protection": {
"r": "Ring · Rare",
"t": "You gain a +1 bonus to Armor Class and saving throws while wearing this ring."
},
"Ring of the Ram": {
"r": "Ring · Rare",
"t": "This ring has 3 charges and regains 1d3 expended charges daily at dawn. While wearing the ring, you can take a Magic action to expend 1 to 3 charges to make a ranged spell attack against one creature you can see within 60 feet of yourself. The ring produces a spectral ram's head and makes its attack roll with a +7 bonus. On a hit, for each charge you spend, the target takes 2d10 Force damage and is pushed 5 feet away from you.\n Alternatively, you can expend 1 to 3 of the ring's charges as a Magic action to try to break a nonmagical object you can see within 60 feet of yourself that isn't being worn or carried. The ring makesa Strength check with a +5 bonus for each charge you spend."
},
"Amulet of Health": {
"r": "Wondrous Item · Rare",
"t": "Your Constitution is 19 while you wear this amulet. It has no effect on you if your Constitution is 19 or higher without it."
},
"Belt of Dwarvenkind": {
"r": "Wondrous Item · Rare",
"t": "While wearing this belt, you gain the followingbenefits:Dwarvish. You know Dwarvish.Friend of Dwarvenkind. You have Advantage on Charisma (Persuasion) checks made to interact with dwarves and duergar.Toughness. Your Constitution increases by 2, to a maximum of 20.In addition, while attuned to the belt, you have a 50 percent chance each day at dawn of growing a full beard if you can grow one, or a thicker beard if you already have one.If you aren't a dwarf or duergar, you gain the following additional benefits while wearing the belt:Darkvision. You have Darkvision with a range of 60 feet.Resilience. You have Resistance to Poison damage. You also have Advantage on saving throws you make to avoid or end the Poisoned condition."
},
"Boots of Speed": {
"r": "Wondrous Item · Rare",
"t": "While you wear these boots, you can take a Bonus Action to click the boots' heels together. If you do, the boots double your Speed, and any creature that makes an Opportunity Attack against you has Disadvantage on the attack roll. If you click your heels together again, you end the effect.\n When you've used the boots' property for a total of 10 minutes, the magic ceases to function for you until you finish a Long Rest."
},
"Cloak of Displacement": {
"r": "Wondrous Item · Rare",
"t": "While you wear this cloak, it magically projects an illusion that makes you appear to be standing in a place near your actual location, causing any creature to have Disadvantage on attack rolls against you. If you take damage, the property ceases to function until the start of your next turn. This property is suppressed while your Speed is 0."
},
"Cloak of the Bat": {
"r": "Wondrous Item · Rare",
"t": "While wearing this cloak, you have Advantage on Dexterity (Stealth) checks. In an area of Dim Light or Darkness, you can grip the edges of the cloak and use it to gain a Fly Speed of 40 feet. If you ever fail to grip the cloak's edges while flying in this way, or if you are no longer in Dim Light or Darkness, you lose this Fly Speed.\n While wearing the cloak in an area of Dim Light or Darkness, you can cast Polymorph on yourself, shape-shifting into a Bat. While in that form, you retain your Intelligence, Wisdom, and Charisma scores. The cloak can't be used this way again until the next dawn."
},
"Cube of Force": {
"r": "Wondrous Item · Rare",
"t": "This cube is about an inch across. Each face has a distinct marking on it. You can press one of those faces, expend the number of charges required for it, and thereby cast the spell associated with it (save DC 17), as shown in the Cube of Force Faces table.\n The cube starts with 10 charges, and it regains 1d6 expended charges daily at dawn.Cube of Force FacesSpellCharge CostMage Armor1Shield1Tiny Hut3Private Sanctum4Resilient Sphere4Wall of Force5"
},
"Gem of Seeing": {
"r": "Wondrous Item · Rare",
"t": "This gem has 3 charges. As a Magic action, you can expend 1 charge. For the next 10 minutes, you have Truesight out to 120 feet when you peer through the gem.\n The gem regains 1d3 expended charges daily at dawn."
},
"Necklace of Fireballs": {
"r": "Wondrous Item · Rare",
"t": "This necklace has 1d6 + 3 beads hanging from it. You can take a Magic action to detach a bead and throw it up to 60 feet away. When it reaches the end of its trajectory, the bead detonates as a level 3 Fireball (save DC 15).\n You can hurl multiple beads, or even the whole necklace, at one time. When you do so, increase the damage of the Fireball by 1d6 for each bead after the first (maximum 12d6)."
},
"Periapt of Proof against Poison": {
"r": "Wondrous Item · Rare",
"t": "This delicate silver chain has a brilliant-cut black gem pendant. While you wear it, you have Immunity to the Poisoned condition and Poison damage."
},
"Portable Hole": {
"r": "Wondrous Item · Rare",
"t": "This fine black cloth, soft as silk, is folded up to the dimensions of a handkerchief. It unfolds into a circular sheet 6 feet in diameter.\n You can take a Magic action to unfold a Portable Hole and place it on or against a solid surface, whereupon the Portable Hole creates an extradimensional hole 10 feet deep. The cylindrical space within the hole exists on a different plane of existence, so it can't be used to create open passages. Any creature inside an open Portable Hole can exit the hole by climbing out of it.\n You can take a Magic action to close a Portable Hole by taking hold of the edges of the cloth and folding it up. Folding the cloth closes the hole, and any creatures or objects within remain in the extradimensional space. No matter what's in it, the hole weighs next to nothing.\n If the hole is folded up, a creature within the hole's extradimensional space can take an action to make a DC 10 Strength (Athletics) check. On a successful check, the creature forces its way out and appears within 5 feet of the Portable Hole. A closed Portable Hole holds enough air for 1 hour of breathing, divided by the number of breathing creatures inside.\n Placing a Portable Hole inside an extradimensional space created by a Bag of Holding, Handy Haversack, or similar item instantly destroys both items and opens a gate to the Astral Plane. The gate originates where the one item was placed inside the other. Any creature within 10 feet of the gate and not behind Total Cover is sucked through it and deposited ina random location on the Astral Plane. The gate then closes. The gate is one-way only and can't be reopened."
},
"Robe of Eyes": {
"r": "Wondrous Item · Rare",
"t": "This robe is adorned with eyelike patterns. Whileyou wear the robe, you gain the following benefits:All-Around Vision. The robe gives you Advantage on Wisdom (Perception) checks that rely on sight.Special Senses. You have Darkvision and Truesight, both with a range of 120 feet.\n Drawbacks. A Light spell cast on the robe or a Daylight spell cast within 5 feet of the robe gives you the Blinded condition for 1 minute. At the end of each of your turns, you make a Constitution saving throw (DC 11 for Light or DC 15 for Daylight), ending the condition on yourself on a success."
},
"Wings of Flying": {
"r": "Wondrous Item · Rare",
"t": "While wearing this cloak, you can take a Magic action to turn the cloak into a pair of wings on your back. The wings lasts for 1 hour or until you end the effect early as a Magic action. The wings give you a Fly Speed of 60 feet. If you are aloft when the wings disappear, you fall. When the wings disappear, you can't use them again for 1d12 hours."
}
};
