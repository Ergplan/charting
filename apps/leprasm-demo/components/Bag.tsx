import type { Colorway } from '@/lib/catalog';

export const LAYERS = ['base', 'lining', 'pocket', 'body', 'flap', 'hardware', 'strap'] as const;
export type Layer = (typeof LAYERS)[number];

type Props = { c: Colorway; layers?: readonly Layer[]; id: string; className?: string };

/** A parametric satchel drawn in SVG. Each layer can be rendered alone so the
 *  exploded view can separate them in 3D while they still stack pixel-perfectly. */
export default function Bag({ c, layers = LAYERS, id, className }: Props) {
  const has = (l: Layer) => layers.includes(l);
  const g = (n: string) => `url(#${id}-${n})`;
  return (
    <svg viewBox="0 0 600 520" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c.light} />
          <stop offset=".45" stopColor={c.base} />
          <stop offset="1" stopColor={c.dark} />
        </linearGradient>
        <linearGradient id={`${id}-flap`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.base} />
          <stop offset="1" stopColor={c.dark} />
        </linearGradient>
        <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".22" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset=".4" stopColor={c.hardware} />
          <stop offset="1" stopColor="#7a5a1c" />
        </linearGradient>
        <linearGradient id={`${id}-board`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a4a52" />
          <stop offset="1" stopColor="#202026" />
        </linearGradient>
        <pattern id={`${id}-mono`} width="34" height="34" patternUnits="userSpaceOnUse" patternTransform="rotate(-20)">
          <text x="6" y="22" fontSize="16" fontFamily="Georgia, serif" fontWeight="700" fill="rgba(0,0,0,.18)">L</text>
        </pattern>
        <filter id={`${id}-grain`} x="0" y="0" width="1" height="1">
          <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" result="n" />
          <feColorMatrix in="n" type="saturate" values="0" result="g" />
          <feComponentTransfer in="g" result="a"><feFuncA type="table" tableValues="0 .16" /></feComponentTransfer>
          <feBlend in="SourceGraphic" in2="a" mode="multiply" />
        </filter>
        <filter id={`${id}-soft`}><feGaussianBlur stdDeviation="1.2" /></filter>
      </defs>

      {has('base') && (
        <g>
          <rect x="104" y="398" width="392" height="64" rx="14" fill={g('board')} />
          <rect x="118" y="410" width="364" height="40" rx="8" fill="none" stroke="rgba(255,255,255,.12)" strokeDasharray="6 6" />
        </g>
      )}

      {has('lining') && (
        <g>
          <rect x="118" y="214" width="364" height="244" rx="20" fill={c.lining} />
          <rect x="118" y="214" width="364" height="244" rx="20" fill={g('mono')} />
          <rect x="118" y="214" width="364" height="244" rx="20" fill="none" stroke="rgba(0,0,0,.18)" strokeWidth="2" />
        </g>
      )}

      {has('pocket') && (
        <g>
          <rect x="168" y="250" width="264" height="96" rx="12" fill="rgba(0,0,0,.14)" />
          <rect x="168" y="250" width="264" height="96" rx="12" fill="none" stroke="rgba(0,0,0,.3)" strokeWidth="2" />
          <line x1="184" y1="266" x2="416" y2="266" stroke={c.hardware} strokeWidth="3" strokeDasharray="4 3" />
          <rect x="404" y="258" width="18" height="16" rx="3" fill={g('gold')} />
        </g>
      )}

      {has('body') && (
        <g filter={`url(#${id}-grain)`}>
          <path d="M112 200 H488 Q518 200 520 230 L506 438 Q503 470 470 470 H130 Q97 470 94 438 L80 230 Q82 200 112 200 Z" fill={g('body')} />
          <path d="M94 230 L108 460" stroke="rgba(0,0,0,.35)" strokeWidth="14" strokeLinecap="round" filter={`url(#${id}-soft)`} />
          <path d="M506 230 L492 460" stroke="rgba(0,0,0,.28)" strokeWidth="14" strokeLinecap="round" filter={`url(#${id}-soft)`} />
          <path d="M126 215 H474 L492 452 H108 Z" fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="1.5" strokeDasharray="5 5" />
          <path d="M140 210 H300 L260 470 H150 Z" fill={g('sheen')} opacity=".6" />
        </g>
      )}

      {has('flap') && (
        <g filter={`url(#${id}-grain)`}>
          <path d="M108 200 H492 L494 322 Q494 354 462 354 H138 Q106 354 106 322 Z" fill={g('flap')} />
          <path d="M120 212 H480 L481 318 Q481 342 458 342 H142 Q119 342 119 318 Z" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="1.5" strokeDasharray="5 5" />
          <path d="M150 200 H330 L300 354 H170 Z" fill={g('sheen')} opacity=".55" />
          <path d="M108 350 Q300 372 492 350 L492 360 Q300 384 108 360 Z" fill="rgba(0,0,0,.35)" filter={`url(#${id}-soft)`} />
        </g>
      )}

      {has('hardware') && (
        <g>
          <rect x="272" y="318" width="56" height="40" rx="10" fill={g('gold')} />
          <rect x="280" y="326" width="40" height="24" rx="6" fill="none" stroke="rgba(0,0,0,.35)" strokeWidth="1.5" />
          <circle cx="300" cy="338" r="7" fill="#3a2a0c" />
          <rect x="296" y="326" width="8" height="24" rx="4" fill={g('gold')} />
          <rect x="196" y="186" width="34" height="30" rx="8" fill={g('gold')} />
          <rect x="370" y="186" width="34" height="30" rx="8" fill={g('gold')} />
          <circle cx="213" cy="201" r="4" fill="#3a2a0c" /><circle cx="387" cy="201" r="4" fill="#3a2a0c" />
          {[150, 250, 350, 450].map((x) => <circle key={x} cx={x} cy="468" r="6" fill={g('gold')} />)}
          <text x="300" y="300" textAnchor="middle" fontSize="13" letterSpacing="4" fontFamily="Georgia, serif" fill={c.hardware} opacity=".9">LEPRASM</text>
        </g>
      )}

      {has('strap') && (
        <g>
          <path d="M213 192 C 213 70, 387 70, 387 192" fill="none" stroke={c.dark} strokeWidth="22" strokeLinecap="round" />
          <path d="M213 192 C 213 70, 387 70, 387 192" fill="none" stroke={c.base} strokeWidth="14" strokeLinecap="round" />
          <path d="M213 192 C 213 70, 387 70, 387 192" fill="none" stroke="rgba(255,255,255,.28)" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 6" />
        </g>
      )}
    </svg>
  );
}
