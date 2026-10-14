'use client';
import { useState } from 'react';
import Bag from './Bag';
import { COLORWAYS } from '@/lib/catalog';

export default function ColorPicker() {
  const [key, setKey] = useState(COLORWAYS[0].key);
  const c = COLORWAYS.find((x) => x.key === key)!;
  return (
    <div className="colors">
      <div className="color-art rv"><Bag c={c} id={`pick-${c.key}`} /></div>
      <div className="stack rv rv-d1">
        <div className="eyebrow">Five colours</div>
        <h2 className="h-lg">Pick the one that is already you.</h2>
        <p className="sub">Every colourway is drum-dyed through the hide, so a scratch shows leather, not paint. Hardware is solid brass; Midnight ships with nickel.</p>
        <div className="swatches" role="group" aria-label="Colourways">
          {COLORWAYS.map((cw) => (
            <button key={cw.key} className="swatch-btn" aria-pressed={cw.key === key} aria-label={cw.name}
              style={{ background: `linear-gradient(135deg, ${cw.light}, ${cw.base} 55%, ${cw.dark})` }} onClick={() => setKey(cw.key)} />
          ))}
        </div>
        <div className="color-name">{c.name}</div>
        <a className="link" href="/collection">See it on every bag</a>
      </div>
    </div>
  );
}
