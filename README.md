# Vice Coast Trophy Guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/ibrahimdiaz0x/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/ibrahimdiaz0x/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline checklist for GTA VI's 55 official trophies. Every trophy has its real requirement plus a guide written for this page, a four-step roadmap to the platinum, and filters for grade, kind, missable-only and earned. Story trophies stay hidden until you earn them or switch spoilers on. Progress is saved in the browser and can be exported.

## How to use it

```sh
node serve.ts
```

Open http://localhost:8080. No build step and no network — the whole guide is static files.

## What is inside

- `app/index.html` — hero, progress bar, filters, roadmap and the 55-card grid.
- `app/style.css` — the night-drive theme.
- `app/app.js` — loads the trophy data, renders the cards, keeps earned state in localStorage, and handles export/import.
- `app/data/trophies.json` — all 55 official trophies: grade, kind, hidden and missable flags, sources, and an original guide each.
- `main.ts` — entrypoint: copies `app/` and `screenshots/` to the output folder and writes `dossier.json`.
- `serve.ts` — small static server for local preview.
- `screenshots/` — four views of the guide at 1280×800.

## The four views

- `1-cover.jpg` — hero, progress bar and filters.
- `2-roadmap.jpg` — the roadmap to the platinum.
- `3-missables.jpg` — the missable filter: only Positive Mental Attitude.
- `4-spoilers.jpg` — spoilers on, with the hidden story trophies revealed.

## Where the facts come from

Trophy names, descriptions and grades are the official 55-trophy list for Grand Theft Auto VI (PlayStation 5). The guides are original to this page. Each trophy cites two sources: the Exophase GTA VI trophy list and the PSNProfiles GTA VI trophy guide.

---

<sub>Entered on [make.fun](https://make.fun/?ref=cbxffxvz&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
