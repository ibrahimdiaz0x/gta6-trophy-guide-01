/**
 * Vice Coast Trophy Guide — program entry point.
 *
 * Copies the offline trophy guide (app/) and its screenshots into the
 * scorer's /output directory, then writes /output/dossier.json with the
 * kit's own buildDossier helper so the scorer can measure the result.
 *
 * Run with: MAKEFUN_OUTPUT_DIR=<dir> node main.ts
 * (Without the env var, it writes to ./out for a local check.)
 */
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const OUT = process.env.MAKEFUN_OUTPUT_DIR ?? "./out";
const ROOT = import.meta.dirname;

const APP_DIR = join(ROOT, "app");
const SHOTS_DIR = join(ROOT, "screenshots");
const OUT_APP = join(OUT, "app");
const OUT_SHOTS = join(OUT, "screenshots");

function fail(message: string): never {
  console.error("vice-coast-trophy-guide: " + message);
  process.exit(1);
}

function main(): void {
  // The guide itself is the entry: all 55 trophies with their data.
  if (!existsSync(join(APP_DIR, "data", "trophies.json"))) {
    fail("app/data/trophies.json is missing — the guide has no trophy data.");
  }
  const data = JSON.parse(readFileSync(join(APP_DIR, "data", "trophies.json"), "utf8"));
  const trophies = Array.isArray(data.trophies) ? data.trophies : [];
  if (trophies.length !== 55) {
    fail(`expected 55 trophies, found ${trophies.length}.`);
  }
  const named = trophies.filter((t: any) => typeof t.name === "string" && t.name.length > 0);
  if (named.length !== 55) fail("every trophy needs a non-blank name.");

  // Fresh output directory, then copy the app and its screenshots in.
  mkdirSync(OUT, { recursive: true });
  cpSync(APP_DIR, OUT_APP, { recursive: true });
  if (existsSync(SHOTS_DIR)) cpSync(SHOTS_DIR, OUT_SHOTS, { recursive: true });

  // The kit's dossier writer measures the output for the scorer, with the
  // scorer's own caps from the kit's gate.json (at most 4 screenshots, each
  // at most 256 KiB; at most 993 app entries and 48 MiB of app files).
  writeFileSync(
    join(OUT, "dossier.json"),
    buildDossier(OUT, {
      text_max_bytes: 163840,
      screenshots: { max: 4, max_bytes: 262144 },
      app_max_files: 993,
      app_max_bytes: 50331648,
    }),
  );
  console.log(`vice-coast-trophy-guide: built ${trophies.length} trophies into ${OUT}`);
}

main();
