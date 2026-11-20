// Vice Coast Trophy Guide — the entry program (Node 22, standard library
// only). The guide itself is plain static files under app/: index.html, its
// ES modules, its styles and its data, with app/data/trophies.json holding
// all 55 official trophies and a guide each. Nothing here builds anything:
// this program hands the guide in by copying app/ and screenshots/ from
// beside this file into /output and writing /output/dossier.json with the
// vendored make.fun library, which is the summary the judge reads — the
// screenshots, the first load's files and bytes, and the source. Leave
// vendor/makefun-frontend.ts untouched: the scorer requires dossier.json to
// be byte for byte what its own copy of the library writes.
//
// Try the guide locally with `node serve.ts`, then open
// http://localhost:8080. Outside the grader's container, MAKEFUN_OUTPUT_DIR
// stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fail fast with a clear message if the guide folder is missing, instead
// of copying an empty output and writing a dossier for it.
if (!existsSync(join(here, 'app'))) throw new Error('app/ is missing next to main.ts');

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the other limits refuse an entry the scorer would refuse (more than
// 4 screenshots or one over 256 KiB; more than 993 files and directories in
// app/ or 48 MiB of app files, counted beside /output's own 1000-entry cap).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
