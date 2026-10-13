'use client';
import { useRef, useState } from 'react';
import { Shell } from '@/components/Shell';
import { ErgosChart, Icon, Seg } from '@/components/ui';
import type { ErgOS } from '@/lib/ergos';

const SOURCES = [['hydro', 'hydro', 'Hydro'], ['wind', 'wind', 'Wind'], ['solar', 'solar', 'Solar'], ['iex', 'exchange', 'Power exchange'], ['grid', 'grid', 'Grid']] as const;
type Scheme = 'harmony' | 'volt' | 'verdant' | 'aurora';

export default function ForecastPage() {
  const [range, setRange] = useState<'all' | 'day' | 'week' | 'month'>('day');
  const [scheme, setScheme] = useState<Scheme>('harmony');
  const [on, setOn] = useState<Record<string, boolean>>({ hydro: true, wind: true, solar: true, iex: true, grid: true });
  const card = useRef<HTMLElement>(null);
  const layers = (E: ErgOS) => {
    const s = E.sample as Record<string, number[]>;
    return [{ key: 'hydro', values: s.hydro }, { key: 'wind', values: s.wind }, { key: 'solar', values: s.solar }, { key: 'iex', values: s.iex }, { key: 'grid' }].filter((l) => on[l.key]);
  };
  return (
    <Shell crumb="Actual vs forecast">
      <section className="eg-glass panel eg-pal-volt">
        <div className="toolbar" style={{ marginBottom: 18, alignItems: 'flex-start' }}>
          <div><h3 className="eg-card__title">Actual vs forecast</h3><p className="eg-card__sub">HALDIRAM C1 · demand in kW · Tue, 13 Oct 2026</p></div>
          <div className="eg-pills" role="group" aria-label="Range">
            {(['all', 'day', 'week', 'month'] as const).map((r) => <button key={r} aria-pressed={range === r} onClick={() => setRange(r)}>{r[0].toUpperCase() + r.slice(1)}</button>)}
          </div>
        </div>
        <ErgosChart render={(E, el) => E.trendChart(el, { height: 360 })} />
      </section>

      <section className="eg-glass panel" ref={card}>
        <div className="eg-card__head">
          <div><h3 className="eg-card__title">Energy supply by source</h3><p className="eg-card__sub">Prototype chart from harmony.js (ErgOS.supplyChart) · hover a band, or use the arrow keys</p></div>
          <Seg label="Colour scheme" size="sm" value={scheme} onChange={(v) => { setScheme(v); }} options={[{ v: 'harmony', label: 'Harmony' }, { v: 'volt', label: 'Volt' }, { v: 'verdant', label: 'Verdant' }, { v: 'aurora', label: 'Aurora' }]} />
        </div>
        <div className={`eg-row ${scheme === 'harmony' ? '' : `eg-pal-${scheme}`}`} style={{ marginBottom: 14, gap: 8 }} role="group" aria-label="Sources shown">
          {SOURCES.map(([k, ic, lab]) => (
            <button key={k} className="eg-srcchip" data-series={k} aria-pressed={on[k]} onClick={() => setOn({ ...on, [k]: !on[k] })}>
              <span className="eg-srcchip__ic"><Icon name={ic} size={14} /></span>{lab}
            </button>
          ))}
        </div>
        <ErgosChart deps={[scheme, on]} render={(E, el) => E.supplyChart(el, { palette: scheme, layers: layers(E), height: 380 })} />
      </section>
    </Shell>
  );
}
