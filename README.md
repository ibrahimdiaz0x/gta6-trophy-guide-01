# gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/ibrahimdiaz0x/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/ibrahimdiaz0x/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Vice Coast Trophy Guide — an offline, static web app that tracks all 55 official Grand Theft Auto VI trophies (PlayStation 5): a real guide for every trophy in the player's own words, a platinum roadmap, filters by grade and kind, a spoiler setting that keeps hidden story trophies secret until earned, and the one missable trophy flagged up front.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. No build step, no network calls: the guide is plain static files in `app/`, and progress is saved in the browser (localStorage) with export/import.

## How it works

- `app/data/trophies.json` — the official 55 trophies (name, description, grade) plus an original guide, kind, hidden/missable flags and sources for each.
- `app/index.html`, `app/app.js`, `app/style.css` — the tracker: checklist, progress bar, search, grade/kind filters, missable-only view, spoiler setting, export/import. Deep links: `#roadmap`, `#missables`, `#spoilers`.
- `main.ts` — copies `app/` and `screenshots/` to `/output` and writes `dossier.json` (via `vendor/makefun-frontend.ts`).

## Screenshots

1. Checklist — the full tracker. 2. Roadmap — the four-step path to the platinum. 3. Missables — the missable-only view. 4. Spoilers — hidden trophies revealed with the spoiler setting on.

---

<sub>Entered on [make.fun](https://make.fun/?ref=cbxffxvz&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
