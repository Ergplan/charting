import Link from 'next/link';

export default function Nav() {
  return (
    <header className="nav">
      <div className="wrap nav-in">
        <Link href="/" className="nav-brand">Leprasm</Link>
        <nav className="nav-links">
          <Link href="/#story">Story</Link>
          <Link href="/inside">Inside</Link>
          <Link href="/#colors">Colours</Link>
          <Link href="/collection">Collection</Link>
          <Link href="/#cities">Cities</Link>
        </nav>
        <Link href="/collection" className="nav-cta">Buy</Link>
      </div>
    </header>
  );
}
