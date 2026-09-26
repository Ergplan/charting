'use client';

// Drop-in client component for the Next.js App Router.
// Install: npm i github:Ergplan/charting   (package name: energy-flow-chart)
import { useState } from 'react';
import { EnergyFlowBoard } from 'energy-flow-chart/react';
import { SAMPLE_PRICES, type MountHandle } from 'energy-flow-chart';

type Props = {
  /** URL of an endpoint returning { header, rows } or records[] (see app/api/energy/route.ts) */
  src: string;
  /** Poll the endpoint for live updates (seconds). */
  refreshSeconds?: number;
};

export default function EnergySupplyChart({ src, refreshSeconds = 60 }: Props) {
  const [view, setView] = useState<'timeline' | 'tod'>('timeline');
  const [board, setBoard] = useState<MountHandle | null>(null);

  return (
    <section style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={() => setView('timeline')} aria-pressed={view === 'timeline'}>Timeline</button>
        <button onClick={() => setView('tod')} aria-pressed={view === 'tod'}>ToD basis</button>
        <span style={{ flex: 1 }} />
        <button onClick={() => board?.chart.showDay(board.chart.days().at(-1)!)}>Today</button>
        <button onClick={() => board?.chart.showAll()}>7 days</button>
        <button onClick={() => board?.chart.exportPNG()}>Export PNG</button>
      </div>

      <EnergyFlowBoard
        url={src}
        refreshSeconds={refreshSeconds}
        view={view}
        theme="energy"
        prices={SAMPLE_PRICES /* replace with real tariffs, see README → Prices */}
        onReady={setBoard}
      />
    </section>
  );
}
