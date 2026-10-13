# ergOS Harmony demo (Next.js)

A clickable walk-through of the redesigned ergOS screens, built only from the ergOS Harmony design system (`design-system/`) and the charting library in this repo. Use it to review the design with real interactions, then copy the patterns into ergOS.

## Run

```bash
# from the repo root, once: build the library bundle and the design-system outputs
npm ci && npm run build

cd apps/ergos-demo
npm install
npm run dev          # http://localhost:3000
```

`npm run dev` and `npm run build` first run `npm run sync`, which copies `design-system/`, `dist/` and the logo files into `public/` (git-ignored).

## Screens

| Route | What it shows |
| --- | --- |
| `/` | Overview and links |
| `/today` | Folder headline with source mix and day track, KPI tiles, plant picker, the production supply chart (`EnergyFlowBoard`, Harmony theme, scheme switcher), trading timeline, T+1 card with the voice bar |
| `/savings` | Account switcher, plants, savings folder, tariff tiles, daily savings chart, 96-slot heatmap |
| `/prices` | Price landscape heatmap + price profile, linked; colour-map switcher; buy/sell hours |
| `/forecast` | Actual vs forecast (Volt), stacked sources with toggles and colour schemes |
| `/real-talk` | Transcript panel and the voice bar in all four states |
| `/mobile` | Phone onboarding and trading desk |
| `/brand` | jouleWise logo in glass (and the classic 2D glass in original gold), colour, type, logo rules |
| `/design-system` | The full design-system gallery |

The theme switch in the top bar sets `<html data-theme>` and is remembered per browser. All numbers are illustrative sample data.

## How it is wired

- `app/layout.tsx` imports `energy-flow-chart/tokens.css` and `energy-flow-chart/harmony.css` (the package is linked from the repo root with `file:../..`).
- `lib/ergos.ts` loads `design-system/harmony.js` on the client only (`window.ErgOS`: folder shape, charts, voice bar).
- `components/ui.tsx` and `components/blocks.tsx` are thin React wrappers that output `eg-` markup only. No colours live in React code.
- Production charts come from the library: `EnergyFlowBoard` (from `energy-flow-chart/react`) and `createPriceExplorer`.

More: [`docs/HARMONY.md`](../../docs/HARMONY.md).
