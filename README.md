# gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/ibrahimdiaz0x/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/ibrahimdiaz0x/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Vice Coast Trophy Guide — an offline web app that guides and tracks all 55 PlayStation 5 trophies of Grand Theft Auto VI: every official name, description and grade, a guide in our own words with its sources beside it, a checklist saved in the browser with export and import, filters by kind and grade, a spoiler setting that hides story trophies until earned, a five-stage roadmap to the platinum, and every missable trophy flagged.

## Run it

```sh
python3 -m http.server 8080 --directory app
```

Then open http://localhost:8080 in a desktop browser. The guide works with the network off: every file it loads is under `app/`.

To build the hand-in dossier locally:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## How it is built

- `app/index.html` — the page: progress bar, tabs (Tracker, Roadmap, Missables), filters and the spoiler setting.
- `app/main.js` — boot, state, hash routing (`#demo` seeds 13 earned trophies for screenshots, `#spoilers` previews the spoiler setting, `#trophy-17` opens one guide) and progress wiring.
- `app/store.js` — earned trophies in `localStorage`, plus export and import of the progress file.
- `app/filters.js` — kind, grade and search filtering, and the spoiler rule.
- `app/render.js` — the trophy list, the roadmap and the missables view.
- `app/data/trophies.json` — the 55 official trophies with their guides and sources.
- `app/data/roadmap.json` — the five roadmap stages.
- `main.ts` — copies `app/` and `screenshots/` to `/output` and writes `dossier.json` with the vendored make.fun library.

Sources: the official trophy list as published on Exophase and PSNProfiles (names, descriptions, grades and PSN counts); each guide names its sources beside it. Where a method is not confirmed in-game yet, the guide says so plainly instead of inventing a location or a step. No Rockstar logo or official artwork is used.

---

<sub>Entered in the make.fun bounty [gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01).</sub>
