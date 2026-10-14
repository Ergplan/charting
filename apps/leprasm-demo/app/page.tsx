import Link from 'next/link';
import Bag from '@/components/Bag';
import Exploded from '@/components/Exploded';
import ColorPicker from '@/components/ColorPicker';
import { BAGS, CITIES, COLORWAYS, inr } from '@/lib/catalog';

const cw = (k: string) => COLORWAYS.find((c) => c.key === k)!;

export default function Home() {
  return (
    <main>
      {/* HERO */}
      <section className="hero dark">
        <div className="hero-bg" /><div className="hero-grain" />
        <div className="wrap hero-in">
          <div className="eyebrow rv in">Leprasm · Spring 2026</div>
          <h1 className="h-hero rv in rv-d1">Carry the city.</h1>
          <p className="lede rv in rv-d2">Full-grain leather handbags for the 7 a.m. metro and the 11 p.m. dinner. Designed in Mumbai. Crafted in Kanpur.</p>
          <div className="btn-row rv in rv-d3">
            <Link href="/collection" className="btn btn-primary">Buy from {inr(2499)}</Link>
            <Link href="/inside" className="btn btn-ghost">Look inside</Link>
          </div>
          <div style={{ position: 'relative', marginTop: 16 }}>
            <div className="hero-floor" />
            <Bag c={cw('oxblood')} id="hero" className="hero-bag" />
          </div>
          <div className="scroll-hint">Scroll</div>
        </div>
      </section>

      {/* BANG BANNER */}
      <section className="bang dark-2" id="story">
        <div className="bang-art"><Bag c={cw('tan')} id="bang" /></div>
        <div className="bang-shade" />
        <div className="wrap bang-copy">
          <div className="eyebrow rv">The idea</div>
          <h2 className="h-xl rv rv-d1">Luxury-grade leather.<br />Honest Indian price.</h2>
          <p className="lede rv rv-d2">Most bags under ₹7,000 are plastic pretending to be leather. We went the other way: the hide a ₹40,000 bag uses, with none of the airport-store markup.</p>
          <div className="rv rv-d3"><Link href="/inside" className="link">See what is inside</Link></div>
        </div>
      </section>

      {/* BENTO FEATURES */}
      <section className="section light">
        <div className="wrap">
          <div className="center stack rv">
            <div className="eyebrow">Built for your day</div>
            <h2 className="h-lg">Every detail earns its place.</h2>
          </div>
          <div className="bento">
            <div className="tile tile-4 rv"><div><h3>Full-grain, vegetable-tanned</h3><p>The top layer of the hide, untouched. It develops a patina instead of peeling at the corners after one monsoon.</p></div><div className="big"><em>1.4</em> mm hide</div></div>
            <div className="tile tile-2 dark rv rv-d1"><div><h3>Fits a 14″ laptop</h3><p>Marine Tote carries a MacBook Pro, charger and a water bottle without bulging.</p></div><div className="big">14″</div></div>
            <div className="tile tile-2 gold rv"><div><h3>Solid brass</h3><p>Turn-lock, feet and rings. Nickel-free, so no rash on a humid day.</p></div><div className="big">Brass</div></div>
            <div className="tile tile-2 rv rv-d1"><div><h3>Water-resistant lining</h3><p>Coated cotton twill. Wipe out the spilled chai, keep going.</p></div><div className="big"><em>0</em> plastic</div></div>
            <div className="tile tile-2 rv rv-d2"><div><h3>Lighter than it looks</h3><p>Structured, not stiff. Aria weighs less than two phones.</p></div><div className="big">640 g</div></div>
            <div className="tile tile-3 dark rv"><div><h3>Two-year craft warranty</h3><p>Stitching, hardware and edge paint are covered. Repairs are done by the same hands that made it.</p></div><div className="big"><span style={{ color: 'var(--accent)' }}>2</span> years</div></div>
            <div className="tile tile-3 rv rv-d1"><div><h3>Try at home for 7 days</h3><p>Order, carry it to work, decide. Free pickup if it is not the one, in all tier-1 cities.</p></div><div className="big"><em>7</em> days</div></div>
          </div>
        </div>
      </section>

      {/* INSIDE (scroll-scrubbed) */}
      <section className="dark" id="inside">
        <Exploded c={cw('oxblood')} id="home-x" compact />
        <div className="wrap center" style={{ paddingBottom: 100 }}>
          <Link href="/inside" className="btn btn-ghost">Explore every material</Link>
        </div>
      </section>

      {/* COLOURS */}
      <section className="section light-2" id="colors">
        <div className="wrap"><ColorPicker /></div>
      </section>

      {/* LINEUP */}
      <section className="section light" id="lineup">
        <div className="wrap">
          <div className="center stack rv">
            <div className="eyebrow">The collection</div>
            <h2 className="h-lg">Three bags. One standard.</h2>
            <p className="sub">Same hide, same brass, same hands. Pick the size your day needs.</p>
          </div>
          <div className="lineup">
            {BAGS.map((b, i) => (
              <div className={`card rv rv-d${i}`} key={b.slug}>
                <Bag c={cw(b.colorway)} id={`line-${b.slug}`} />
                {b.badge && <div className="badge">{b.badge}</div>}
                <div className="name">{b.name}</div>
                <div className="tag">{b.tagline}</div>
                <div className="price">From {inr(b.price)}</div>
                <div className="cta"><Link href="/collection" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: 15 }}>Buy</Link><Link href="/collection" className="link" style={{ fontSize: 15 }}>Compare</Link></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CITIES */}
      <section className="section dark center" id="cities">
        <div className="wrap-n stack">
          <div className="eyebrow rv">Where to find us</div>
          <h2 className="h-lg rv rv-d1">Now in eight cities. Delivered in two days.</h2>
          <p className="sub rv rv-d2" style={{ marginInline: 'auto' }}>Studios in Mumbai and Bengaluru to touch the leather. Everywhere else, the bag comes to you.</p>
          <div className="cities rv rv-d3">
            {CITIES.map((c, i) => <span key={c} className={`city ${i < 2 ? 'live' : ''}`}>{c}{i < 2 ? ' · Studio' : ''}</span>)}
          </div>
          <div className="btn-row rv rv-d3" style={{ justifyContent: 'center', marginTop: 24 }}>
            <Link href="/collection" className="btn btn-primary">Buy from {inr(2499)}</Link>
            <a href="#" className="btn btn-ghost">Book a studio visit</a>
          </div>
        </div>
      </section>
    </main>
  );
}
