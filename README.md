# D&D 2024 Character Builder

> **Phone app:** see **SETUP-PHONE.md**. Move characters between devices with **⤓ Export** and **⤒ Import**. Automatic Google Drive sync is optional.

A local app that runs on your own PC and opens in your browser. Use it to build characters, play from the sheet on your laptop, level up, and print a PDF in the style of your old PowerPoint sheets.

## Setup (one time)

1. Install **Python 3.10+** from https://www.python.org/downloads/.
   On Windows, tick **"Add Python to PATH"** in the installer.
2. Open a terminal in this folder and run:
   ```
   pip install -r requirements.txt
   ```
   (These packages are only needed for the wiki import. The builder itself has no dependencies.)

## Start

- **Windows:** double-click `start.bat`
- **Mac / Linux:** double-click `start.command`, or run `python3 run.py`

Your browser opens at http://localhost:8765. Keep the black terminal window open while you play, and close it to stop the app.

## First run: import rules text

On the home screen, click **"Import from dnd2024.wikidot.com"**. This takes a few minutes. It downloads the descriptions of species, backgrounds, feats, class and subclass features, and spells into `data/wiki.json`. Pages are cached in `data/cache`, so later updates are quick.

All rules and numbers are built into the app (`app/rules.js`), so it works without the import too. Feature, feat and spell descriptions are just empty until you import, and you can type them in yourself.

The import also reads the **older subclasses and species** (e.g. Hexblade, Forge Domain, Echo Knight, Hexblood, Warforged) from the 2014 wiki **dnd5e.wikidot.com**, for the options that were not reprinted in 2024. They appear in the app under *More species from older books* and *Older subclasses*. All subclasses are chosen at level 3: whatever an old subclass gave at level 1 or 2 arrives at level 3, and older species get no ability score increases (those come from the background, as in 2024).

**Getting it to the phone:** after updating on the laptop, click **🔒 Create wiki.enc for GitHub…** and upload that `wiki.enc` to your GitHub repo (the app finds it by itself), or copy `data/wiki.json` to the phone and use **Load wiki.json file…**.

If the import fails or some text is missing, run `python importer.py --test /barbarian:main` and send the output to Claude to adjust the parser.

## Workflow

1. **Build:** Basics → Species → Background (+2/+1 or +1/+1/+1, origin feat) → Abilities (point buy) → Class & Levels → Spells → Equipment → Story.
2. **Play sheet:** track current HP and temp HP, take damage or heal, hit dice, death saves, conditions and exhaustion. Click resource and spell slot pips to use or restore them. Short rest (roll hit dice) and long rest buttons. Expand any feature or spell to read it.
3. **Level up:** pick a class (multiclassing allowed), HP (average or roll), subclass, ASI or feat, plus any new choices (skills, expertise, weapon masteries, fighting style, invocations, metamagic, maneuvers…). Max HP updates automatically.
4. **Print / PDF:** choose *Save as PDF* in the print dialog, with **Margins: None** and **Background graphics** on.
   - Page 1: main sheet
   - Page 2: backstory and notes
   - Following pages: Powers (passive/active with usages, then spells)
5. **Languages:** pick two in *Basics*. Standard, rare (Abyssal, Celestial, Infernal, Undercommon…) and other languages (Aquan, Gith, Sylvan dialects…) are all listed; rare and other ones need your DM's OK.
6. **Aasimar:** the Celestial Revelation form (Heavenly Wings, Inner Radiance, Necrotic Shroud) is chosen each time you use it, on the play sheet under *Resources*.

## Tips

- **Edit feature text:** click ✎ next to any feature to change its text, move it between Active and Passive, or hide it.
- **Custom features:** add magic items, DM boons or companions with uses under *Story & Notes → Custom features*.
- **Where characters are saved:** on the laptop (started with `run.py`) every character is also a file `characters/<Name>__<id>.json`, and the previous version is kept in `characters/backup`. On the phone, characters are stored inside the app.
- **Moving a character to another device:** **⤓ Export** on the sheet, send the file, then **⤒ Import** on the other device's home screen. A newer version replaces the older one.
- **Different port:** `python run.py 9000` starts the app on another port.

## Files

| File | Contents |
|---|---|
| `run.py` | local web server |
| `importer.py` | wiki downloader and parser |
| `app/rules.js` | 2024 mechanics: classes, subclasses, species, backgrounds, feats, weapons, armor, spell slots |
| `app/app.js` | character calculations |
| `app/ui.js`, `app/sheet.js`, `app/print.js` | screens |
| `app/style.css`, `app/print.css` | look of the app and of the PDF |
