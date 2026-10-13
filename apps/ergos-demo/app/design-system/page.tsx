import { Shell } from '@/components/Shell';

export default function DesignSystemPage() {
  return (
    <Shell crumb="Design system">
      <p className="muted">The ergOS Harmony gallery: every component and screen from design-system/, served from public/ds by <code>npm run sync</code>. Open it full screen at <a href="/ds/gallery/index.html" style={{ color: 'var(--accent)' }}>/ds/gallery/</a>.</p>
      <iframe src="/ds/gallery/index.html" title="ergOS Harmony gallery" style={{ width: '100%', height: '80vh', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', background: 'var(--canvas)' }} />
    </Shell>
  );
}
