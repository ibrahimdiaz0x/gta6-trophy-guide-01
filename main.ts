// Vice Coast Trophy Guide — my build for make.fun's gta6-trophy-guide-01.
// The guide itself lives in app/ as plain static files (index, styles,
// script and the trophy data) so any browser can open it offline with no
// build step. This entrypoint only hands it in: it copies app/ and
// screenshots/ next to this file into the output folder and writes
// dossier.json there, using the vendored make.fun library to build the
// summary the judge reads. I left vendor/makefun-frontend.ts untouched on
// purpose — the scorer needs dossier.json byte for byte as its own copy
// writes it. Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
// Where the handed-in copy lands: the grader's /output, or a local folder
// when MAKEFUN_OUTPUT_DIR is set.
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(OUTPUT_DIR, { recursive: true });
cpSync(join(repoRoot, 'app'), join(OUTPUT_DIR, 'app'), { recursive: true });
mkdirSync(join(OUTPUT_DIR, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) cpSync(join(repoRoot, 'screenshots'), join(OUTPUT_DIR, 'screenshots'), { recursive: true });

// The scorer's own caps, as this build understands them: at most 4
// screenshots, each at most 256 KiB, and the app folder within its file
// and byte caps. They live in one named constant so the dossier call
// below stays readable, and the call itself enforces them.
const DOSSIER_OPTIONS = { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 };
writeFileSync(
  join(OUTPUT_DIR, 'dossier.json'),
  buildDossier(OUTPUT_DIR, DOSSIER_OPTIONS),
);
