'use client';
// Thin React wrappers that only output ergOS Harmony (eg-) markup.
// Styling lives in design-system/harmony.css; never add colours here.
import { ReactNode, useEffect, useRef } from 'react';
import { ICONS } from '@/lib/icons';
import { useErgOS } from '@/lib/ergos';

export function Icon({ name, size = 18, className }: { name: string; size?: number; className?: string }) {
  const inner = ICONS[name] || ICONS.bolt;
  return (
    <svg className={`eg-ico ${className || ''}`} viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
      strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: inner }} />
  );
}

type BtnVariant = 'primary' | 'accent' | 'solid' | 'ghost' | 'default';
export function Button({ variant = 'default', size, icon, children, block, onClick, disabled, type = 'button' }: {
  variant?: BtnVariant; size?: 'sm' | 'lg'; icon?: string; children: ReactNode; block?: boolean; onClick?: () => void; disabled?: boolean; type?: 'button' | 'submit';
}) {
  const cls = ['eg-btn', variant !== 'default' && `eg-btn--${variant}`, size && `eg-btn--${size}`, block && 'eg-btn--block'].filter(Boolean).join(' ');
  return <button type={type} className={cls} onClick={onClick} disabled={disabled}>{icon && <Icon name={icon} size={size === 'sm' ? 15 : 17} />}{children}</button>;
}

export function IconButton({ icon, label, size, variant, badge, onClick }: { icon: string; label: string; size?: 'sm' | 'xs'; variant?: 'solid' | 'accent'; badge?: boolean; onClick?: () => void }) {
  const cls = ['eg-icon-btn', size && `eg-icon-btn--${size}`, variant && `eg-icon-btn--${variant}`].filter(Boolean).join(' ');
  return <button type="button" className={cls} aria-label={label} onClick={onClick}><Icon name={icon} size={size ? 17 : 20} />{badge && <span className="eg-icon-btn__badge" />}</button>;
}

export function Chip({ tone, children, icon, live, off, mono, lg, time }: { tone?: 'accent' | 'negative' | 'warning' | 'solid'; children: ReactNode; icon?: string; live?: boolean; off?: boolean; mono?: boolean; lg?: boolean; time?: boolean }) {
  const cls = ['eg-chip', tone && `eg-chip--${tone}`, mono && 'eg-chip--mono', lg && 'eg-chip--lg', time && 'eg-chip--time'].filter(Boolean).join(' ');
  return <span className={cls}>{live && <span className="eg-dot eg-dot--live" />}{off && <span className="eg-dot eg-dot--off" />}{icon && <Icon name={icon} size={13} />}{children}</span>;
}

export function Seg<T extends string>({ options, value, onChange, size, glass, label }: { options: { v: T; label: string; icon?: string }[]; value: T; onChange: (v: T) => void; size?: 'sm'; glass?: boolean; label: string }) {
  return (
    <div className={`eg-seg${size ? ' eg-seg--sm' : ''}${glass ? ' eg-seg--glass' : ''}`} role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.v} type="button" aria-pressed={o.v === value} onClick={() => onChange(o.v)}>{o.icon && <Icon name={o.icon} size={15} />}{o.label}</button>
      ))}
    </div>
  );
}

export function Sparkline({ values, series }: { values: number[]; series: string }) {
  const el = useRef<HTMLDivElement>(null);
  const E = useErgOS();
  useEffect(() => { if (E && el.current) E.sparkline(el.current, values, { series }); }, [E, values, series]);
  return <div className="eg-stat__spark" ref={el} />;
}

export function StatTile({ series, label, icon, value, unit, foot, chip, spark, date = 'Tue 13 Oct' }: {
  series: string; label: string; icon: string; value: string; unit: string; foot: string; chip?: ReactNode; spark?: number[]; date?: string;
}) {
  return (
    <div className="eg-stat" data-series={series}>
      <div className="eg-stat__top"><span className="eg-stat__label">{label}</span><span className="eg-stat__icon"><Icon name={icon} size={16} /></span></div>
      <div className="eg-stat__date">{date}</div>
      <div className="eg-stat__value">{value}<span className="eg-stat__unit">{unit}</span></div>
      {spark && <Sparkline values={spark} series={series} />}
      <div className="eg-stat__foot"><span>{foot}</span>{chip}</div>
    </div>
  );
}

export function PlantCard({ name, cap, selected, onSelect }: { name: string; cap: string; selected?: boolean; onSelect?: () => void }) {
  return (
    <button className={`eg-plant${selected ? ' is-selected' : ''}`} aria-pressed={!!selected} onClick={onSelect}>
      <span className="eg-plant__head">
        <span className="eg-plant__icon"><Icon name="factory" size={20} /></span>
        <span><span className="eg-plant__name">{name}</span><span className="eg-plant__loc"><Icon name="pin" size={13} />Noida</span></span>
        <span className="eg-plant__radio">{selected && <Icon name="check" size={14} />}</span>
      </span>
      <span className="eg-plant__stats"><span className="eg-plant__cap"><Icon name="bolt" size={16} />{cap}</span><span className="eg-plant__iex"><Icon name="trend" size={14} />IEX —</span></span>
      <span className="eg-plant__foot"><span>Uttar Pradesh</span><Chip off>Auto: OFF</Chip></span>
    </button>
  );
}

export function Track({ value, left, leftSub, right, rightSub, style }: { value: number; left: ReactNode; leftSub?: ReactNode; right: ReactNode; rightSub?: ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="eg-track" style={{ ['--value' as string]: `${value}%`, ...style }}>
      <div className="eg-track__labels"><span>{left}{leftSub && <small>{leftSub}</small>}</span><span>{right}{rightSub && <small>{rightSub}</small>}</span></div>
      <div className="eg-track__rail"><div className="eg-track__fill" /><div className="eg-track__marker" /></div>
    </div>
  );
}

/** Any ErgOS chart: render(ErgOS, element) runs once the runtime has loaded. */
export function ErgosChart({ render, className, deps = [] }: { render: (E: NonNullable<ReturnType<typeof useErgOS>>, el: HTMLDivElement) => void; className?: string; deps?: unknown[] }) {
  const el = useRef<HTMLDivElement>(null);
  const E = useErgOS();
  useEffect(() => {
    if (!E || !el.current) return;
    el.current.innerHTML = '';
    render(E, el.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [E, ...deps]);
  return <div className={`eg-chart ${className || ''}`} ref={el} />;
}

export function MiniBars({ values }: { values: readonly number[] }) {
  return <ErgosChart className="eg-thumb__bars" render={(E, el) => E.miniBars(el, [...values], 'iex')} />;
}
