import Link from 'next/link';
import Exploded from '@/components/Exploded';
import { COLORWAYS, inr } from '@/lib/catalog';

export const metadata = { title: 'Inside Leprasm — the materials' };

const MATS = [
  { n: '01', t: 'Full-grain leather', d: 'Vegetable-tanned buffalo hide, 1.4 mm, from the Kanpur tanneries that supply European houses. Drum-dyed through, so colour goes all the way in.', bg: 'linear-gradient(160deg,#8a2f3c,#3b0f17 70%)' },
  { n: '02', t: 'Cotton twill lining', d: 'Coated 280 gsm cotton with the L monogram. Water-resistant, breathable, and it does not crackle like PU.', bg: 'linear-gradient(160deg,#e9d7b8,#b89b6d 70%)' },
  { n: '03', t: 'Solid brass hardware', d: 'Cast and hand-polished turn-lock, feet, D-rings. Nickel-free plating on Midnight. Heavy in the hand on purpose.', bg: 'linear-gradient(160deg,#f1d98a,#7a5a1c 70%)' },
  { n: '04', t: 'Bonded nylon thread', d: 'Saddle-stitched at 7 stitches per inch. One thread breaks, the seam holds.', bg: 'linear-gradient(160deg,#5b6473,#1f2530 70%)' },
  { n: '05', t: 'Hand edge paint', d: 'Four coats, sanded between each. The edge is the first place a cheap bag gives up. Ours does not.', bg: 'linear-gradient(160deg,#6f7f66,#2f3a2b 70%)' },
  { n: '06', t: 'Fibre-board structure', d: 'Recycled cellulose board in the base and gussets. The bag stands on a café table and keeps its shape in a packed metro.', bg: 'linear-gradient(160deg,#4a4a52,#15151a 70%)' },
];

export default function Inside() {
  const c = COLORWAYS[0];
  return (
    <main>
      <section className="dark"><Exploded c={c} id="inside-x" /></section>

      <section className="section dark-2">
        <div className="wrap">
          <div className="center stack rv">
            <div className="eyebrow">Materials</div>
            <h2 className="h-lg">What ₹4,499 should actually buy.</h2>
            <p className="sub" style={{ color: 'rgba(255,255,255,.6)' }}>Six materials. Each one is the thing the premium houses use, sourced at home.</p>
          </div>
          <div className="mats">
            {MATS.map((m, i) => (
              <div className={`mat rv rv-d${i % 3}`} key={m.n}>
                <div className="swatch" style={{ background: m.bg }} />
                <div className="swatch" style={{ background: 'linear-gradient(to top, rgba(0,0,0,.7), transparent 60%)' }} />
                <div className="num">{m.n}</div><h3>{m.t}</h3><p>{m.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section dark">
        <div className="wrap">
          <div className="center stack rv">
            <div className="eyebrow">How it is made</div>
            <h2 className="h-lg">Eleven hours. Two pairs of hands.</h2>
          </div>
          <div className="steps">
            <div className="step rv"><h3>Cut</h3><p>Each hide is inspected and clicked by hand so no scar lands on the flap.</p></div>
            <div className="step rv rv-d1"><h3>Skive & paint</h3><p>Edges are thinned, then painted four times and sanded between coats.</p></div>
            <div className="step rv rv-d2"><h3>Stitch</h3><p>Saddle-stitched with bonded nylon. The lining is sewn in, never glued.</p></div>
            <div className="step rv rv-d3"><h3>Fit & sign</h3><p>Brass set, bag inspected, maker’s initials stamped inside the pocket.</p></div>
          </div>
          <div className="center" style={{ marginTop: 56 }}>
            <div className="btn-row" style={{ justifyContent: 'center' }}>
              <Link href="/collection" className="btn btn-primary">Buy from {inr(2499)}</Link>
              <Link href="/" className="btn btn-ghost">Back to the story</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
