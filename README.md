# Vice Coast Trophy Guide

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/ibrahimdiaz0x/gta6-trophy-guide-01/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/ibrahimdiaz0x/gta6-trophy-guide-01/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An offline, open-source guide and tracker for all 55 PlayStation 5 trophies of **Grand Theft Auto VI** (1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden, 0 online) — an entry for [make.fun's GTA 6 trophy guide competition](https://make.fun/c/gta6-trophy-guide-01).

## What it is

- **Tracker** — a checklist of every trophy with its official name, description and grade. Progress is saved in the browser (localStorage) and can be exported to a file and imported back.
- **Filters** — by kind (story, missable, collectibles, activities, online), by grade, by earned state, plus full-text search.
- **Spoiler setting** — hides the names and descriptions of story trophies until they are earned.
- **Roadmap to the platinum** — three stages (story, 100% checklist, cleanup) with time estimates, built from the official descriptions and the cited guides.
- **Missables** — the one trophy reported as possibly missable (Positive Mental Attitude) is called out, with the Chapter 1 meditation to do first.
- **A guide for every trophy** — written in our own words, each with its sources named beside it. Methods that players have not yet confirmed are labelled as such instead of being presented as fact.

## Sources

Names, descriptions and grades as listed by [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) and [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi). Methods and counts from [PowerPyx](https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/), [GTA Zone](https://gta-zone.com/news/gta-6-trophies-achievements/), [PushSquare](https://www.pushsquare.com/guides/gta-6-trophy-guide-and-roadmap) and [KeenGamer](https://www.keengamer.com/articles/guides/gta-6-trophy-guide-platinum-roadmap-all-55-trophies/). Sources are cited beside each guide in the app; no guide text is copied.

## Run it

The guide is static files under `app/` with no build step. Serve it and open it in a desktop browser:

```sh
node serve.ts
# then open http://localhost:8080
```

It works with the network off: it loads only its own files and makes no network request while it runs. No Rockstar logo or official artwork is used anywhere.

## Hand in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with the vendored make.fun library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see [LICENSE](LICENSE).
