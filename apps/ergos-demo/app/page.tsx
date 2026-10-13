import Link from 'next/link';
import { Shell } from '@/components/Shell';
import { Icon } from '@/components/ui';
import { Logo } from '@/components/Logo';

const SCREENS = [
  { href: '/today', icon: 'gauge', title: 'Today', text: 'The day so far for one plant: the green folder headline, source mix, live supply chart with cards, trading log and the T+1 nudge.' },
  { href: '/savings', icon: 'rupee', title: 'Savings', text: 'Net savings against the DISCOM benchmark, landed tariff, daily savings and the 96-slot profile.' },
  { href: '/prices', icon: 'exchange', title: 'Prices', text: 'The price landscape heatmap and the day profile against the state’s marginal cost, linked.' },
  { href: '/forecast', icon: 'trend', title: 'Actual vs forecast', text: 'The clean overlay chart, the stacked source chart and the four colour schemes.' },
  { href: '/real-talk', icon: 'mic', title: 'Real talk', text: 'Ask ergOS by voice: the voice bar in all four states and the transcript panel.' },
  { href: '/mobile', icon: 'factory', title: 'Mobile', text: 'The phone onboarding and the trading desk folder.' },
  { href: '/brand', icon: 'sparkle', title: 'Brand', text: 'The jouleWise logo in glass, colours, type and downloads.' },
  { href: '/design-system', icon: 'layers', title: 'Design system', text: 'Every ergOS Harmony component and screen, live, with its guidelines.' },
];

export default function Overview() {
  return (
    <Shell crumb="Overview">
      <section className="eg-glass panel" style={{ display: 'grid', gap: 18 }}>
        <Logo height={56} />
        <h1 className="eg-h1">The new ergOS, in <em>Harmony</em>.</h1>
        <p className="muted" style={{ maxWidth: '62ch' }}>
          A walk-through of the redesigned screens, built only from the ergOS Harmony design system and the charting library in this repo.
          Switch theme from the top bar. All numbers are sample data for HALDIRAM C1.
        </p>
      </section>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {SCREENS.map((s) => (
          <Link key={s.href} href={s.href} className="eg-glass panel" style={{ display: 'grid', gap: 10, textDecoration: 'none', color: 'inherit' }}>
            <span className="eg-stat__icon" style={{ width: 40, height: 40, color: 'var(--accent)' }}><Icon name={s.icon} size={20} /></span>
            <b style={{ fontSize: 18, fontWeight: 500 }}>{s.title}</b>
            <span className="muted" style={{ fontSize: 14 }}>{s.text}</span>
            <span style={{ color: 'var(--accent)', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>Open <Icon name="arrow-right" size={14} /></span>
          </Link>
        ))}
      </div>
    </Shell>
  );
}
