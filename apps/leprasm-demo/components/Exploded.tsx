'use client';
import { useEffect, useRef, useState } from 'react';
import Bag, { LAYERS, type Layer } from './Bag';
import type { Colorway } from '@/lib/catalog';

const INFO: Record<Layer, { label: string; detail: string; side: 'l' | 'r'; y: number }> = {
  base:     { label: 'Structure',  detail: 'Recycled fibre board base. Keeps its shape, stands on its own.', side: 'r', y: 86 },
  lining:   { label: 'Lining',     detail: 'Water-resistant cotton twill, monogram-printed, no plastic feel.', side: 'l', y: 72 },
  pocket:   { label: 'Inner pocket', detail: 'Zip pocket sized for a passport and AirPods.', side: 'r', y: 60 },
  body:     { label: 'Full-grain leather', detail: '1.4 mm vegetable-tanned hide from Kanpur. Ages, never peels.', side: 'l', y: 46 },
  flap:     { label: 'Flap',       detail: 'Double-layered, edge-painted by hand in four coats.', side: 'r', y: 34 },
  hardware: { label: 'Hardware',   detail: 'Solid brass turn-lock, nickel-free. Feels heavy because it is.', side: 'l', y: 22 },
  strap:    { label: 'Handle',     detail: 'Rolled handle around a cotton core. Shoulder strap included.', side: 'r', y: 10 },
};

type Props = { c: Colorway; id: string; compact?: boolean };

/** Scroll-scrubbed 3D cut-away. Layers stack flat at the top of the section and
 *  separate in Z as the reader scrolls through 320vh of pinned stage. */
export default function Exploded({ c, id, compact }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const travel = r.height - window.innerHeight;
        const t = Math.min(1, Math.max(0, -r.top / travel));
        setP(t);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf); };
  }, []);

  const ease = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
  const spread = compact ? 62 : 92;
  const stageStyle = { transform: `rotateX(${48 * ease}deg) rotateY(${-16 * ease}deg) rotateZ(${8 * ease}deg) scale(${1 - .22 * ease}) translateY(${-9 * ease}%)`, transformStyle: 'preserve-3d' as const };

  return (
    <div className="explode-stage" ref={ref} style={compact ? { height: '220vh' } : undefined}>
      <div className="explode-sticky">
        <div className="progress" style={{ width: `${p * 100}%` }} />
        <div className="explode-copy top" style={{ opacity: 1 - ease * 1.6 }}>
          <div className="eyebrow">Inside Leprasm</div>
          <h2 className="h-lg" style={{ marginTop: 10 }}>Seven layers. Zero shortcuts.</h2>
          <p className="sub" style={{ marginInline: 'auto', marginTop: 12, color: 'rgba(255,255,255,.6)' }}>Keep scrolling to take the bag apart.</p>
        </div>

        <div className="explode-3d" style={stageStyle}>
          {LAYERS.map((layer, i) => {
            const k = i - 3;
            const z = k * spread * ease;
            const y = k * -18 * ease;
            return (
              <div key={layer} className="explode-layer" style={{ transform: `translate3d(0, ${y}px, ${z}px)` }}>
                <Bag c={c} layers={[layer]} id={`${id}-${layer}`} />
              </div>
            );
          })}
        </div>

        {LAYERS.map((layer, i) => {
          const info = INFO[layer];
          const show = ease > 0.55 + i * 0.045;
          const pos = info.side === 'l' ? { left: 'max(16px, 6vw)' } : { right: 'max(16px, 6vw)' };
          return (
            <div key={layer} className="callout" style={{ ...pos, top: `${info.y}%`, opacity: show ? 1 : 0, transform: show ? 'none' : 'translateY(8px)' }} title={info.detail}>
              <b>{String(i + 1).padStart(2, '0')}</b> &nbsp;{info.label}
            </div>
          );
        })}

        <div className="explode-copy bottom" style={{ opacity: Math.max(0, (ease - .8) * 5) }}>
          <p className="lede" style={{ marginInline: 'auto', fontSize: 18, maxWidth: '44ch' }}>Full-grain leather, brass, cotton twill and a fibre-board heart. Every layer chosen to last the decade, not the season.</p>
        </div>
      </div>
    </div>
  );
}
