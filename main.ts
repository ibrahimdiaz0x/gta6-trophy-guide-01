// Vice Coast Trophy Guide — the hand-in step for make.fun's gta6-trophy-guide-01.
//
// The guide itself is plain static files in app/ (page, styles, script and the
// trophy data), so it opens in any browser with no build step and no network.
// This file only delivers it: it copies app/ and screenshots/ from next to
// this file into the hand-in folder and writes dossier.json there with the
// vendored make.fun library, which is the summary the judge reads. I did not
// touch vendor/makefun-frontend.ts — the scorer wants dossier.json exactly
// as that library writes it. Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const guideRoot = fileURLToPath(new URL('.', import.meta.url));
// Where the handed-in copy goes: the grader's /output, or a local folder
// when MAKEFUN_OUTPUT_DIR is set.
const handInDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Copy one folder into place, making the destination first.
function stageFolder(from, to) {
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

mkdirSync(handInDir, { recursive: true });
stageFolder(join(guideRoot, 'app'), join(handInDir, 'app'));
mkdirSync(join(handInDir, 'screenshots'), { recursive: true });
if (existsSync(join(guideRoot, 'screenshots'))) stageFolder(join(guideRoot, 'screenshots'), join(handInDir, 'screenshots'));

// The scorer's own limits, as I read them in the kit: at most 4 screenshots,
// each at most 256 KiB, and the app folder within its file and byte limits.
// The dossier call below enforces them, and refuses an entry that breaks one.
writeFileSync(
  join(handInDir, 'dossier.json'),
  buildDossier(handInDir, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
