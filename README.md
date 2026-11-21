# gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/ibrahimdiaz0x/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/ibrahimdiaz0x/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Vice Coast Trophy Guide — an offline tracker for all 55 official GTA VI trophies, with a guide for each, a platinum roadmap, filters and a spoiler setting.

## Run it

```sh
node serve.ts
```

Then open the address serve.ts prints. No build step, no network calls: the guide runs entirely in your browser, and your progress is stored only in localStorage.

## What it covers

- All 55 official GTA VI trophies (1 platinum, 2 gold, 6 silver, 46 bronze) in story order, each with its own guide written for this page.
- A checklist that saves your progress in the browser, with export and import so you can move it to another device.
- Filters by grade and kind, search, a missable-only view, a hide-earned toggle, and a spoiler setting that keeps hidden story trophies masked until you earn them or choose to reveal them.
- A 4-step platinum roadmap, with the one missable trophy — Positive Mental Attitude, meditate at all 18 spots — called out before the story moves past it.
- Trophy names, descriptions and grades follow the official 55-trophy list for Grand Theft Auto VI (PlayStation 5). Sources per trophy: Exophase trophy list and the PSNProfiles trophy guide.

## Structure

- `app/index.html` — page shell: hero, progress bar, filters, roadmap, checklist.
- `app/style.css` — Vice City styling.
- `app/app.js` — rendering, filters, progress storage, export/import, deep links.
- `app/data/trophies.json` — the 55 trophies with grades, kinds, hidden/missable flags, sources and guides.
- `shots.json` — the 4 screenshots below.
- `screenshots/` — the screenshots.
- `main.ts` — the make.fun program entrypoint (copies the app and screenshots, writes the dossier).
- `serve.ts` — local static server for trying the guide.

## Screenshots

1. `1-cover.jpg` — the guide's front page: hero, progress and filters.
2. `2-roadmap.jpg` — the platinum roadmap.
3. `3-missables.jpg` — the missable-only view: just Positive Mental Attitude.
4. `4-spoilers.jpg` — the full list with story spoilers revealed.

---

<sub>Entered on [make.fun](https://make.fun/?ref=cbxffxvz&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
