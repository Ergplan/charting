// Copy the design system, the library bundle and the brand assets from the repo root into public/,
// so the demo serves the design-system gallery and logo files as static pages.
// Runs automatically before `npm run dev` and `npm run build`.
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const app = fileURLToPath(new URL('..', import.meta.url));
const repo = join(app, '..', '..');
const pub = join(app, 'public');
const copies = [
  [join(repo, 'design-system'), join(pub, 'ds')],
  [join(repo, 'dist'), join(pub, 'dist')],
  [join(repo, 'design-system', 'assets', 'logo'), join(pub, 'brand')],
];
for (const [from, to] of copies) {
  if (!existsSync(from)) { console.warn(`sync: missing ${from} (run npm run build in the repo root)`); continue; }
  rmSync(to, { recursive: true, force: true });
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}
console.log('sync: design-system → public/ds, dist → public/dist, logo → public/brand');
