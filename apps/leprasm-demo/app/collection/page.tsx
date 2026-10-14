import Link from 'next/link';
import Bag from '@/components/Bag';
import { BAGS, COLORWAYS, inr } from '@/lib/catalog';

export const metadata = { title: 'Leprasm Collection — compare the three bags' };
const cw = (k: string) => COLORWAYS.find((c) => c.key === k)!;

export default function Collection() {
  const rows: [string, (b: (typeof BAGS)[number]) => string][] = [
    ['Price', (b) => inr(b.price)],
    ['Size', (b) => b.size],
    ['Fits', (b) => b.fits],
    ['Weight', (b) => b.weight],
    ['Strap', (b) => b.strap],
    ['Leather', () => 'Full-grain, 1.4 mm'],
    ['Hardware', () => 'Solid brass'],
    ['Lining', () => 'Coated cotton twill'],
    ['Warranty', () => '2 years'],
  ];
  return (
    <main className="light">
      <section className="page-hero wrap">
        <div className="eyebrow rv in">The collection</div>
        <h1 className="h-xl rv in rv-d1">Which Leprasm is yours?</h1>
        <p className="sub rv in rv-d2">Three sizes, five colours, one standard of making. All between {inr(2499)} and {inr(6999)}.</p>
      </section>

      <section className="wrap" style={{ paddingBottom: 40 }}>
        <div className="lineup" style={{ marginTop: 0 }}>
          {BAGS.map((b, i) => (
            <div className={`card rv rv-d${i}`} key={b.slug} id={b.slug}>
              <Bag c={cw(b.colorway)} id={`col-${b.slug}`} />
              {b.badge && <div className="badge">{b.badge}</div>}
              <div className="name">{b.name}</div>
              <div className="tag">{b.tagline}</div>
              <div className="price">{inr(b.price)}</div>
              <div className="swatches" style={{ justifyContent: 'center', marginTop: 8 }}>
                {COLORWAYS.map((c) => <span key={c.key} className="swatch-btn" style={{ width: 22, height: 22, background: `linear-gradient(135deg, ${c.light}, ${c.base} 55%, ${c.dark})` }} title={c.name} />)}
              </div>
              <div className="cta"><a href="#" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: 15 }}>Buy</a><a href="#" className="link" style={{ fontSize: 15 }}>Try at home</a></div>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap-n section" style={{ paddingTop: 20 }}>
        <div className="center stack rv"><h2 className="h-md">Compare</h2></div>
        <table className="compare rv">
          <thead><tr><th></th>{BAGS.map((b) => <th key={b.slug}>{b.name}</th>)}</tr></thead>
          <tbody>
            {rows.map(([label, f]) => <tr key={label}><td>{label}</td>{BAGS.map((b) => <td key={b.slug}>{f(b)}</td>)}</tr>)}
          </tbody>
        </table>
        <div className="center" style={{ marginTop: 48 }}>
          <Link href="/inside" className="link">What is inside every bag</Link>
        </div>
      </section>
    </main>
  );
}
