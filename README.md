# Vice Coast — GTA 6 Trophy Guide & Tracker

[![make.fun — gta6-trophy-guide-01](https://img.shields.io/badge/make.fun-gta6--trophy--guide--01-orange)](https://make.fun/bounty/gta6-trophy-guide-01)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Offline](https://img.shields.io/badge/offline-static%20app-brightgreen)](app/index.html)

An unofficial, fan-made offline guide and tracker for all **55 PlayStation 5 trophies** of **Grand Theft Auto VI** (1 platinum, 2 gold, 6 silver, 46 bronze) — built for the [make.fun](https://make.fun/bounty/gta6-trophy-guide-01) bounty `gta6-trophy-guide-01`.

## What it is

- **Tracker** — a checklist of every trophy with its official name, description and grade. Progress is saved in the browser (localStorage), with export to a file and import back. Counters track partial progress (42 Shooting Range golds, 250 stunts, 100 WAiNK scans…).
- **Filters** — by kind (story, missable, collectibles, activities, 100% completion, online), by grade, by earned state, by unconfirmed methods, and by search. The Online filter is empty on purpose: GTA 6 has no online trophies.
- **Spoiler setting** — hides the names and descriptions of story trophies until they are earned.
- **Roadmap to the Platinum** — seven stages in order, from the opening mission to 100% completion, built from the official trophy descriptions.
- **Missables** — the one trophy early guides flag as possibly missable (*Positive Mental Attitude*: meditate at every spot, from Chapter 1), and how to protect it.
- **Cited guides** — every trophy has a guide in this entry's own words, with its sources named beside it (Exophase and PSNProfiles for the official list; PowerPyx, Push Square, KeenGamer and others for methods). Where a method is not yet confirmed in the game, the trophy is flagged **Unconfirmed** and the guide says so plainly instead of guessing.

## Run it

Static files under `app/` — no build step, no network at run time:

```sh
node serve.ts
# open http://localhost:8080
```

Or open `app/index.html` from any static file server with `app/` at its root.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored `vendor/makefun-frontend.ts` library.

## Honesty note

The game released on 19 November 2026, a day before this guide was written. Names, descriptions and grades are the official list as published via Exophase and PSNProfiles. Methods that early guides have not yet confirmed are flagged, not invented. This guide uses no Rockstar logo, artwork or game screenshots.

## License

MIT — see [LICENSE](LICENSE).
