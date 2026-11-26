// StatAtlas entry program: copies app/ and screenshots/ from this
// repository into the output directory and writes the dossier that
// the kit's buildDossier library computes from those files.
//
// It runs on Node 22 with the standard library only, reads nothing
// outside this repository, and writes the same bytes on every run:
// files are copied in sorted path order and the dossier is a pure
// function of the copied files.
import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

function copyTreeSorted(fromDir: string, toDir: string): void {
  mkdirSync(toDir, { recursive: true });
  const names = readdirSync(fromDir).sort();
  for (const name of names) {
    const from = join(fromDir, name);
    const to = join(toDir, name);
    const st = statSync(from);
    if (st.isDirectory()) {
      copyTreeSorted(from, to);
    } else if (st.isFile()) {
      cpSync(from, to);
    }
  }
}

function main(): void {
  const appDir = join(repoRoot, 'app');
  const shotsDir = join(repoRoot, 'screenshots');
  if (!existsSync(appDir)) throw new Error('main.ts: app/ is missing from the repository');
  if (!existsSync(shotsDir)) throw new Error('main.ts: screenshots/ is missing from the repository');
  mkdirSync(outDir, { recursive: true });
  copyTreeSorted(appDir, join(outDir, 'app'));
  copyTreeSorted(shotsDir, join(outDir, 'screenshots'));
  const dossier = buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
    app_path_max_bytes: 1000,
  });
  writeFileSync(join(outDir, 'dossier.json'), dossier);
}

main();
