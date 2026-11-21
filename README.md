# gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/ibrahimdiaz0x/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/ibrahimdiaz0x/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Vice Coast Trophy Guide — an offline tracker for all 55 official GTA VI trophies, with a guide for each one, a platinum roadmap, filters and a spoiler setting. Tick trophies off as you earn them, filter by grade or kind, hide the story trophies until you earn them, and export your progress to take it to another device. One trophy is missable (Positive Mental Attitude — meditate at all 18 spots), and the guide flags it up front.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. No build step, no network — the guide runs entirely from its own files.

## Structure

- `app/index.html` — the guide page: hero, progress bar, filters, roadmap, trophy grid.
- `app/style.css` — the guide's theme.
- `app/app.js` — checklist state (localStorage), filters, spoiler setting, export/import.
- `app/data/trophies.json` — the official 55 trophies with grades, kinds, hidden flags, the one missable flag, sources and an original guide per trophy.
- `main.ts` — the entrypoint: copies `app/` and `screenshots/` to the output and writes `dossier.json`.
- `serve.ts` — a tiny static server for local use.
- `screenshots/` — the four views below, taken at 1280×800.

## Screenshots

- `1-cover.jpg` — the guide's top: hero, progress and filters.
- `2-roadmap.jpg` — the four-step roadmap to the platinum.
- `3-missables.jpg` — the missable-only filter: just Positive Mental Attitude.
- `4-spoilers.jpg` — spoilers on: hidden story trophies revealed with their guides.

## Sources

Trophy names, descriptions and grades follow the official 55-trophy list for Grand Theft Auto VI (PlayStation 5). Guides are written for this page. Sources per trophy: Exophase — Grand Theft Auto VI trophy list; PSNProfiles — Grand Theft Auto VI trophy guide.

---

<sub>Entered on [make.fun](https://make.fun/?ref=cbxffxvz&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
