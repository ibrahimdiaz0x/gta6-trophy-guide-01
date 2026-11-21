# Vice Coast Trophy Guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/ibrahimdiaz0x/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/ibrahimdiaz0x/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

A tracker for all 55 official GTA VI trophies that works fully offline. Every trophy has a guide that says what to do, a four-step roadmap leads to the platinum, and you can search, filter by grade or kind, hide the story trophies until you earn them, and carry your progress to another device with export and import. The one missable trophy (Positive Mental Attitude — meditate at all 18 spots) is flagged up front so you never lose it.

## How to run it

```sh
node serve.ts
```

Then open http://localhost:8080. There is no build step and no network — the guide runs entirely from its own files.

## What is inside

- `app/index.html` — the guide page: title, progress meter, filters, roadmap, trophy grid.
- `app/style.css` — the guide's theme.
- `app/app.js` — the checklist state (localStorage), filters, spoiler setting, export and import.
- `app/data/trophies.json` — the official 55 trophies with grades, kinds, hidden flags, the one missable flag, sources and a guide written for each trophy.
- `main.ts` — the hand-in step: copies `app/` and `screenshots/` to the output and writes `dossier.json`.
- `serve.ts` — a small static server for local use.
- `screenshots/` — the four views listed below, taken at 1280×800.

## Screenshots

- `1-cover.jpg` — the top of the guide: title, progress meter and filters.
- `2-roadmap.jpg` — the four-step roadmap to the platinum.
- `3-missables.jpg` — the missable filter on: just Positive Mental Attitude.
- `4-spoilers.jpg` — spoilers on: hidden story trophies shown with their guides.

## Where the trophy facts come from

Trophy names, descriptions and grades follow the official 55-trophy list for Grand Theft Auto VI (PlayStation 5). The guides are written for this page. Each trophy cites the Exophase trophy list and the PSNProfiles trophy guide.

---

<sub>Entered on [make.fun](https://make.fun/?ref=cbxffxvz&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
