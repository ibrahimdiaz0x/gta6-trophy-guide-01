// Vice Coast Trophy Guide — hand-in program (Node 22, standard library only).
// It copies the static guide (app/) and its screenshots (screenshots/) into the
// output directory and writes dossier.json with the kit's vendored library,
// which is the summary the judge reads. vendor/makefun-frontend.ts is left
// exactly as the kit ships it: the scorer rebuilds the dossier with its own
// copy and the two must match byte for byte.
//
// Run locally with:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the guide with:  node serve.ts   (then open http://localhost:8080)

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// Caps from the scorer's gate: at most 4 screenshots of 256 KiB, app/ at most
// 993 files and 48 MiB, and the dossier text at most 160 KiB.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
