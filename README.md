# Vice Coast Trophy Guide — GTA VI, all 55 trophies, offline

[![make.fun bounty](https://img.shields.io/badge/make.fun-bounty-gta6--trophy--guide--01-ff2e88)](https://make.fun/bounty/gta6-trophy-guide-01)
[![offline](https://img.shields.io/badge/offline-static%20web%20app-19c2b8)](https://make.fun/bounty/gta6-trophy-guide-01)
[![license MIT](https://img.shields.io/badge/license-MIT-f5c542)](LICENSE)

A free, open-source, offline trophy guide and tracker for **Grand Theft Auto VI** on PlayStation 5. It covers every one of the **55 official trophies** (1 platinum, 2 gold, 6 silver, 46 bronze) with the official name, description and grade exactly as PlayStation publishes them, a guide to each in this entry's own words with its source named, a roadmap to the platinum, and a checklist that saves progress in the browser.

## What it does

- **Tracker** — tick a trophy off and it stays ticked (localStorage). Export progress to a JSON file and import it back on any device.
- **Filters** — by kind (story, side missions, activities, collectibles, crime & heists, money & property, moments, 100% completion), by grade, by missable, and free-text search. A "hide earned" toggle clears the finished ones away.
- **Spoiler setting** — on by default: story trophies stay hidden (name, description and guide) until you earn them.
- **Roadmap** — seven stages to the platinum, built from the official descriptions: story first, then side characters, activities, collectibles, crime and money, then the 100% checklist.
- **Missables flagged** — exactly one trophy is flagged as possibly missable, *Positive Mental Attitude*: the first meditation at Jason's house is only offered in Chapter 1. PowerPyx notes it is still unconfirmed whether that spot is required for the trophy, so the guide says to do it anyway. Everything else can be earned after the story in a single playthrough, with no online play.
- **Honest gaps** — five trophies (*Challenging Tank*, *Personal Best*, *Actions Speak Louder*, *Bad Luck, I Guess*, *The Truth Is Out There*) are marked **method unconfirmed**: no published guide had confirmed a method for them when this guide was written (20 November 2026), so the guide says so instead of guessing. *Ten Pin* is marked partly confirmed.

## Run it offline

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network: `app/` is plain static files, and the page loads only its own files. Open `app/index.html` from any static server and it works with the network off.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's vendored `vendor/makefun-frontend.ts`.

## Sources

Names, descriptions and grades are the official list as PlayStation publishes it (Exophase and PSNProfiles agree on all 55). Guides cite PowerPyx (trophy guide & roadmap, meditation locations), Push Square, KeenGamer, GTA Zone, GTAVice, Output Lag, Beebom and EGamers — named beside each trophy in the app, with links. Nothing is copied from another guide. Counts (42 Shooting Range challenges, 14 drone-race locations, 18 meditations, 52 areas, 9 gangs, 8 garages) are the numbers those guides report from the finished game.

## Notes

- No Rockstar Games logo, artwork or game screenshot is used; the look is original. Grand Theft Auto VI is developed and published by Rockstar Games.
- Trophy names and descriptions are shown as PlayStation publishes them, including *T**s Ass Drug Money*.
- MIT licensed. Entry for the [gta6-trophy-guide-01 bounty on make.fun](https://make.fun/bounty/gta6-trophy-guide-01).
