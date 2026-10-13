'use client';
import { useEffect, useRef, useState } from 'react';
import { createPriceExplorer, samplePriceYear, dayIndexOf, dayStats, tradeWindows } from 'energy-flow-chart';
import { Shell } from '@/components/Shell';
import { Chip, Seg } from '@/components/ui';

type Explorer = ReturnType<typeof createPriceExplorer>;

export default function PricesPage() {
  const a = useRef<HTMLDivElement>(null);
  const b = useRef<HTMLDivElement>(null);
  const ex = useRef<Explorer | null>(null);
  const [day, setDay] = useState<{ label: string; min: number; max: number; mean: number; buy: number; sell: number } | null>(null);
  const [map, setMap] = useState<'landscape' | 'harmony' | 'volt' | 'verdant'>('landscape');

  useEffect(() => {
    const data = samplePriceYear();
    const describe = (d: number) => {
      const st = dayStats(data, 'dam', d);
      const w = tradeWindows(data, d);
      const blocks = (t: string) => w.filter((x) => x.type === t).reduce((s, x) => s + x.to - x.from, 0);
      setDay({ label: new Date(data.days[d]).toUTCString().slice(0, 16), ...st, buy: blocks('buy'), sell: blocks('sell') });
    };
    const e = createPriceExplorer({
      landscape: a.current!, profile: b.current!, data, day: dayIndexOf(data, '2026-07-04'), mode: 'auto',
      landscapeOptions: { height: 400 }, profileOptions: { height: 400, onDayChange: (d: number) => describe(d) },
    });
    ex.current = e;
    describe(e.profile.day);
    return () => e.destroy();
  }, []);

  useEffect(() => {
    ex.current?.landscape.setColormap(map);
  }, [map]);

  return (
    <Shell crumb="Prices">
      <div className="toolbar">
        <div className="eg-row">
          {day && <>
            <Chip lg icon="calendar">{day.label}</Chip>
            <Chip lg>DAM ₹{day.min.toFixed(2)} – ₹{day.max.toFixed(2)}</Chip>
            <Chip lg tone="accent">Buy {day.buy / 4} h</Chip>
            <Chip lg tone="warning">Sell {day.sell / 4} h</Chip>
          </>}
        </div>
        <Seg label="Colour map" glass value={map} onChange={setMap} options={[{ v: 'landscape', label: 'Landscape' }, { v: 'harmony', label: 'Harmony' }, { v: 'volt', label: 'Volt' }, { v: 'verdant', label: 'Verdant' }]} />
      </div>
      <div ref={a} />
      <div ref={b} />
      <p className="muted" style={{ fontSize: 13 }}>Click any day in the landscape to open its profile. Sample prices (samplePriceYear) for the demo; production reads the IEX / SLDC feed with fromPriceRows().</p>
    </Shell>
  );
}
