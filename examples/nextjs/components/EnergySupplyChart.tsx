'use client';

// Drop-in client component for the Next.js App Router.
// Install: npm i github:Ergplan/charting   (package name: energy-flow-chart)
//
// Everything interactive is built into the chart's toolbar:
//   [1 day | 7 days]  ‹ period ›   [Timeline | ToD]  (●) Lock Y axis  Export PNG
// Hover a time → it stays pinned when the pointer leaves → Export PNG shares that moment.
import { EnergyFlowBoard } from 'energy-flow-chart/react';
import { SAMPLE_PRICES } from 'energy-flow-chart';

type Props = {
  /** URL of an endpoint returning { header, rows } or records[] (see app/api/energy/route.ts) */
  src: string;
  /** Poll the endpoint for live updates (seconds). */
  refreshSeconds?: number;
};

export default function EnergySupplyChart({ src, refreshSeconds = 60 }: Props) {
  return (
    <EnergyFlowBoard
      url={src}
      refreshSeconds={refreshSeconds}
      rangeMode="day"
      theme="energy"
      metrics={['demand', 'grid', 'market', 'peak', 'avgPrice']}
      prices={SAMPLE_PRICES /* replace with real tariffs, see README → Prices */}
    />
  );
}
