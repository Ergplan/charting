'use client';
import { useState } from 'react';
import { EnergyFlowBoard } from 'energy-flow-chart/react';
import { SAMPLE_PRICES } from 'energy-flow-chart';
import { Shell } from '@/components/Shell';
import { Button, Chip, ErgosChart, IconButton, Icon, PlantCard, Seg, StatTile, Track } from '@/components/ui';
import { Folder, Timeline, VoiceBar } from '@/components/blocks';
import { PLANTS, TODAY } from '@/lib/demo';
import energy from '@/data/energy-sample.json';

const RING = [
  { key: 'hydro', value: 3.39 }, { key: 'wind', value: 4.57 }, { key: 'solar', value: 3.11 },
  { key: 'iex', value: 16.83 }, { key: 'grid', value: 22.65 },
];

export default function TodayPage() {
  const [plant, setPlant] = useState('HALDIRAM C1');
  const [period, setPeriod] = useState<'day' | 'mtd'>('day');
  const [scheme, setScheme] = useState<'harmony' | 'volt' | 'verdant' | 'aurora'>('harmony');
  return (
    <Shell crumb="Today">
      <div className="row-hero">
        <Folder title="Today" sub={`${plant} · ${TODAY.date}`}
          sheets={[
            { kicker: 'Renewable', label: 'Solar, wind, hydro', value: '11.07 MWh', more: ['Share', '22%'] },
            { kicker: 'Peak', label: 'Demand', value: `${TODAY.peak} kW`, more: ['At', '09:00 · Block 37'] },
            { kicker: 'IEX DAM', label: 'Bought', value: `${TODAY.iexBought} MWh`, more: ['Rate', `₹${TODAY.iexPrice} / kWh`], q: true },
          ]}>
          <div className="hero-split">
            <div>
              <div className="eg-overline" style={{ color: 'var(--on-folder-muted)' }}>Total demand so far</div>
              <div className="big" style={{ marginTop: 8 }}>{TODAY.demand}<span>MWh</span></div>
              <div className="eg-row" style={{ marginTop: 16 }}>
                <Chip live>Live updates</Chip><Chip>Peak {TODAY.peak} kW at 09:00</Chip><Chip icon="solar">Renewable {TODAY.renewableShare}%</Chip>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
              <div className="eg-ringwrap">
                <ErgosChart render={(E, el) => E.ring(el, { parts: RING, size: 150, stroke: 13 })} />
                <div className="eg-ringwrap__center"><b>22%</b><span>renewable</span></div>
              </div>
              <div className="mini-legend">
                {[['grid', 'Grid', TODAY.grid], ['iex', 'IEX', TODAY.iex], ['wind', 'Wind', TODAY.wind], ['hydro', 'Hydro', TODAY.hydro], ['solar', 'Solar', TODAY.solar]].map(([k, l, v]) => (
                  <div key={k}><span className="eg-swatch" data-series={k} style={k === 'grid' ? { background: 'var(--white)' } : k === 'iex' ? { background: 'var(--harmony)' } : undefined} />{l}<b>{v}</b></div>
                ))}
              </div>
            </div>
          </div>
          <Track value={92.7} left="00:00 · Block 1" leftSub="Day started" right="24:00 · Block 96" rightSub="7 blocks to go" />
        </Folder>
        <div className="tiles2">
          <StatTile series="grid" label="Grid" icon="grid" value={TODAY.grid} unit="MWh" foot="From grid meters" chip={<Chip>45%</Chip>} spark={[24.1, 23.8, 25.6, 22.0, 21.2, 23.9, 22.65]} />
          <StatTile series="iex" label="Power exchange" icon="exchange" value={TODAY.iexBought} unit="MWh" foot="35% of demand" chip={<Chip tone="accent">35%</Chip>} spark={[16.1, 17.1, 16.9, 16.8, 14.9, 16.8, 17.66]} />
          <StatTile series="battery" label="Peak demand" icon="gauge" value={TODAY.peak} unit="kW" foot="at 09:00" spark={[3612, 3740, 3655, 3802, 3401, 3716, 3789]} />
          <StatTile series="gov" label="IEX price" icon="rupee" value={`₹${TODAY.iexPrice}`} unit="/ kWh" foot="Purchase rate" chip={<Chip tone="negative">▲ ₹0.41</Chip>} spark={[4.61, 4.85, 4.92, 5.08, 4.7, 4.92, 5.33]} />
        </div>
      </div>

      <section className="eg-stack">
        <div className="section-head">
          <h3><Icon name="factory" size={18} />Plants <Chip tone="solid">8 units</Chip></h3>
          <div className="eg-row">
            <Seg label="Period" glass value={period} onChange={setPeriod} options={[{ v: 'day', label: 'Day view', icon: 'calendar' }, { v: 'mtd', label: 'Month to date' }]} />
            <IconButton icon="chevron-left" label="Previous day" size="sm" />
            <Chip lg icon="calendar">Tue, 13 Oct 2026 <Chip tone="accent">TODAY</Chip></Chip>
          </div>
        </div>
        <div className="plants">{PLANTS.map((p) => <PlantCard key={p.name} {...p} selected={p.name === plant} onSelect={() => setPlant(p.name)} />)}</div>
      </section>

      <section className="eg-glass panel">
        <div className="eg-card__head">
          <div><h3 className="eg-card__title">Energy supply <Chip tone="accent" live>Live</Chip></h3><p className="eg-card__sub">{plant} · 15-minute blocks · production chart from this repo (EnergyFlowChart, Harmony theme)</p></div>
          <Seg label="Colour scheme" size="sm" value={scheme} onChange={setScheme} options={[{ v: 'harmony', label: 'Harmony' }, { v: 'volt', label: 'Volt' }, { v: 'verdant', label: 'Verdant' }, { v: 'aurora', label: 'Aurora' }]} />
        </div>
        <EnergyFlowBoard data={energy} theme={scheme} mode="auto" height={420} panel={false /* this section is already the glass panel */} prices={SAMPLE_PRICES /* illustrative: DISCOM ToD tariff, IEX MCP, PPA rates */} cardsClassName="eg-grid cards6" gap={16} />
      </section>

      <div className="two">
        <section className="eg-glass panel">
          <div className="eg-card__head"><div><h3 className="eg-card__title">Trading activity</h3><p className="eg-card__sub">What happened on the exchange today</p></div><Button variant="ghost" size="sm">View log</Button></div>
          <Timeline />
        </section>
        <section className="eg-glass panel" style={{ display: 'grid', gap: 18 }}>
          <h3 style={{ margin: 0, font: '300 30px/36px var(--font-display)' }}>Ready to plan <em style={{ fontStyle: 'normal', fontWeight: 500, color: 'var(--accent)' }}>tomorrow</em>?</h3>
          <p className="muted">The T+1 bid for {plant} closes at 12:00. ergOS has a draft based on the last 7 days.</p>
          <Button variant="primary" size="lg" icon="bolt" block>Open T+1 planner</Button>
          <VoiceBar text="Ask anything about today’s blocks" />
        </section>
      </div>
    </Shell>
  );
}
