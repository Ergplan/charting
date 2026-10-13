'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { NAV } from '@/lib/demo';
import { Icon, IconButton, Chip } from './ui';
import { Logo } from './Logo';

function useTheme(): ['dark' | 'light', () => void] {
  const [t, setT] = useState<'dark' | 'light'>('dark');
  useEffect(() => { setT((document.documentElement.dataset.theme as 'dark' | 'light') || 'dark'); }, []);
  const toggle = () => {
    const n = t === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = n;
    try { localStorage.setItem('ergos-theme', n); } catch { /* private mode */ }
    setT(n);
  };
  return [t, toggle];
}

export function Shell({ crumb, children, actions }: { crumb: string; children: ReactNode; actions?: ReactNode }) {
  const path = usePathname();
  const [theme, toggle] = useTheme();
  return (
    <div className="eg-screen demo-screen">
      <aside className="eg-side demo-side">
        <div className="eg-brand"><span className="eg-wordmark">erg<i>OS</i></span><Chip icon="shield">Admin</Chip></div>
        <nav className="eg-nav" aria-label="Screens">
          <div className="eg-overline eg-nav__group">Demo screens</div>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="eg-nav__item" aria-current={path === n.href ? 'page' : undefined}>
              <Icon name={n.icon} size={19} />{n.label}
            </Link>
          ))}
        </nav>
        <div className="eg-side__foot demo-foot"><Logo height={26} /><span>Energy management platform</span></div>
      </aside>
      <main className="eg-main">
        <header className="eg-topbar">
          <div className="eg-crumbs">ergOS <Icon name="chevron-right" size={14} /> <b>{crumb}</b></div>
          <div className="eg-topbar__end">
            {actions}
            <Chip lg live>Live · Block 89 · 22:15</Chip>
            <IconButton icon={theme === 'dark' ? 'sun' : 'moon'} label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} size="sm" onClick={toggle} />
            <IconButton icon="bell" label="Notifications" size="sm" badge />
            <span className="eg-avatar eg-avatar--lg" style={{ borderColor: 'var(--line)' }}>JW</span>
          </div>
        </header>
        {children}
      </main>
      <nav className="eg-dock demo-dock" aria-label="Screens">
        {NAV.filter((n) => ['/today', '/savings', '/prices', '/real-talk'].includes(n.href)).map((n) => (
          <Link key={n.href} href={n.href} aria-current={path === n.href ? 'page' : undefined}><Icon name={n.icon} size={18} />{n.label.split(' ')[0]}</Link>
        ))}
      </nav>
    </div>
  );
}
