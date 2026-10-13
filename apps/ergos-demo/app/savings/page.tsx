'use client';
import { useState } from 'react';
import { Shell } from '@/components/Shell';
import { Button, Chip, ErgosChart, Icon, PlantCard, Seg, StatTile, Track } from '@/components/ui';
import { Folder } from '@/components/blocks';
import { PLANTS, SAVINGS } from '@/lib/demo';

export default function SavingsPage() {
  const [plant, setPlant] = useState('HALDIRAM C1');
  const [engine, setEngine] = useState<'iex' | 'ems'>('iex');
  const [view, setView] = useState<'daily' | 'slots' | 'reports'>('daily');
  return (
    <Shell crumb="Savings">
      <div className="eg-account" style={{ justifySelf: 'start' }}>
        <span className="eg-avatar eg-avatar--lg" style={{ background: 'var(--accent-soft)', color: 'var(--accent)', border: 0 }}>H</span>
        <div style={{ minWidth: 240 }}><div className="eg-account__name">HALDIRAM</div><div className="eg-account__meta">Haldiram 01 · 8 plants in Uttar Pradesh</div></div>
        <Icon name="chevron-down" size={16} />
      </div>
      <div className="plants">{PLANTS.map((p) => <PlantCard key={p.name} {...p} selected={p.name === plant} onSelect={() => setPlant(p.name)} />)}</div>
      <div className="toolbar">
        <Seg label="Engine" glass value={engine} onChange={setEngine} options={[{ v: 'iex', label: 'IEX ToD obligation and savings', icon: 'bolt' }, { v: 'ems', label: 'EMS monthly calendar', icon: 'calendar' }]} />
        <div className="eg-row">
          <Chip mono lg>N2UP0AEV0003</Chip>
          <div className="eg-range" role="group" aria-label="Date range"><button><Icon name="calendar" size={16} />01 Oct 2026</button><span className="eg-range__arrow"><Icon name="arrow-right" size={15} /></span><button><Icon name="calendar" size={16} />13 Oct 2026</button></div>
          <Button variant="ghost" icon="sliders">Parameters</Button>
          <Button icon="save">Save to DB</Button>
          <Button variant="primary" icon="bolt">Calculate savings</Button>
        </div>
      </div>
      <div className="row-hero">
        <Folder title="Savings" sub={`${plant} · 1–13 Oct 2026`}
          sheets={[
            { kicker: 'Volume', label: 'Cleared', value: `${SAVINGS.volume} kWh`, more: ['Trade days', String(SAVINGS.days)] },
            { kicker: 'Benchmark', label: 'DISCOM, ToD weighted', value: `₹${SAVINGS.benchmark} / kWh`, more: ['Basis', 'Grid tariff'] },
            { kicker: 'IEX landed', label: 'Average', value: `₹${SAVINGS.landed} / kWh`, more: ['Includes', 'STU, CTU, CSS, ED, losses'], q: true },
          ]}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', margin: '28px 0 30px' }}>
            <div>
              <div className="eg-overline" style={{ color: 'var(--on-folder-muted)' }}>Total net savings</div>
              <div className="big" style={{ marginTop: 8 }}>₹{SAVINGS.total}<span style={{ fontSize: 32 }}>{SAVINGS.paise}</span></div>
            </div>
            <Chip lg icon="arrow-up">{SAVINGS.pct}% below DISCOM benchmark</Chip>
          </div>
          <Track value={66.8} left="Landed ₹4.24 / kWh" leftSub="What you paid via IEX" right="Benchmark ₹6.35 / kWh" rightSub="What the grid would have cost" />
        </Folder>
        <div className="tiles3">
          <StatTile series="iex" label="Volume cleared" icon="bolt" value={SAVINGS.volume} unit="kWh" foot={`${SAVINGS.days} trade days`} chip={<Chip>235.37 MWh</Chip>} date="1–13 Oct" />
          <StatTile series="gov" label="Avg landed tariff" icon="trend" value={`₹${SAVINGS.landed}`} unit="/ kWh" foot="Includes STU, CTU, CSS, ED and losses" date="Weighted by volume" />
          <StatTile series="grid" label="Grid benchmark" icon="shield" value={`₹${SAVINGS.benchmark}`} unit="/ kWh" foot="ToD weighted baseline" date="DISCOM" />
        </div>
      </div>
      <div className="toolbar">
        <Seg label="Savings view" glass value={view} onChange={setView} options={[{ v: 'daily', label: 'Daily breakdown', icon: 'bars' }, { v: 'slots', label: '96-slot profile', icon: 'layers' }, { v: 'reports', label: 'Reports and exports', icon: 'download' }]} />
        <Button variant="solid" icon="download">Download bundle (.zip)</Button>
      </div>
      {view !== 'slots' && (
        <section className="eg-glass panel">
          <div className="eg-card__head"><div><h3 className="eg-card__title">Daily net savings and volume</h3><p className="eg-card__sub">Best day Oct 10 · ₹40,460 saved on 22,500 kWh</p></div>
            <div className="eg-legend"><span><span className="eg-swatch" data-series="iex" />Net savings (₹)</span><span><span className="eg-swatch" data-series="grid" style={{ height: 3, width: 14 }} />Volume cleared (kWh)</span></div></div>
          <ErgosChart render={(E, el) => E.savingsChart(el, { height: 320 })} />
        </section>
      )}
      <section className="eg-glass panel">
        <div className="eg-card__head"><div><h3 className="eg-card__title">96-slot profile</h3><p className="eg-card__sub">Cleared kW per 15-minute block · last 7 days</p></div></div>
        <ErgosChart render={(E, el) => E.heatmap(el)} />
      </section>
    </Shell>
  );
}
