/* eslint-disable @next/next/no-img-element */
import { Shell } from '@/components/Shell';
import { Icon } from '@/components/ui';
import './brand.css';

const LOGOS = [
  { file: 'joulewise-dark.svg', name: 'Wordmark · glass · dark grounds', ground: 'var(--charcoal)', h: 72 },
  { file: 'joulewise-light.svg', name: 'Wordmark · glass · light grounds', ground: '#EEF2EC', h: 72 },
  { file: 'joulewise-classic-glass.svg', name: 'Classic 2D glass · original gold · light grounds', ground: '#FFFFFF', h: 72 },
  { file: 'joulewise-classic-glass-dark.svg', name: 'Classic 2D glass · original gold · dark grounds', ground: '#1A1407', h: 72 },
  { file: 'joulewise-mark.svg', name: 'Glass orb mark', ground: 'var(--charcoal)', h: 120 },
  { file: 'joulewise-classic-mark.svg', name: 'Classic glass mark', ground: '#FFFFFF', h: 110 },
  { file: 'joulewise-app-icon.svg', name: 'App icon', ground: 'transparent', h: 120 },
  { file: 'joulewise-mono.svg', name: 'Mono (currentColor) · print, one colour', ground: '#FFFFFF', h: 56 },
];
const COLORS = [
  ['Blue Charcoal', '#000B1A', 'Ground, ink on light'], ['Harmony Green', '#68E78E', 'Accent, glow, live'], ['Folder', '#2B7445', 'Glass cards'],
  ['Folder deep', '#1F5A35', 'Shade, primary core'], ['White', '#FFFFFF', 'Ink on dark'], ['Classic gold', '#CEAB0E', 'Original jouleWise'], ['Classic brown', '#4D3C00', 'Original jouleWise'],
];

export default function BrandPage() {
  return (
    <Shell crumb="Brand">
      <section className="eg-glass panel" style={{ display: 'grid', gap: 8 }}>
        <h1 className="eg-h1">jouleWise, in <em>glass</em>.</h1>
        <p className="muted" style={{ maxWidth: '64ch' }}>The wordmark is set in Urbanist with the “o” as a glass orb: a translucent green body, a caustic glow at its foot, an engraved J-and-wave glyph, a specular cap and a rim light. The classic version keeps the original gold and brown as flat 2D glass. Every file is SVG in design-system/assets/logo.</p>
      </section>
      <div className="br-grid">
        {LOGOS.map((l) => (
          <figure key={l.file} className="br-card">
            <div className="br-ground" style={{ background: l.ground }}><img src={`/brand/${l.file}`} alt={l.name} style={{ height: l.h }} /></div>
            <figcaption><span>{l.name}</span><a href={`/brand/${l.file}`} download>{l.file} <Icon name="download" size={14} /></a></figcaption>
          </figure>
        ))}
      </div>
      <section className="eg-glass panel">
        <div className="eg-card__head"><h3 className="eg-card__title">Colour</h3></div>
        <div className="br-colors">
          {COLORS.map(([n, hex, use]) => (
            <div key={hex} className="br-color"><span style={{ background: hex }} /><b>{n}</b><code>{hex}</code><small>{use}</small></div>
          ))}
        </div>
      </section>
      <section className="eg-glass panel" style={{ display: 'grid', gap: 10 }}>
        <div className="eg-card__head" style={{ marginBottom: 6 }}><h3 className="eg-card__title">Type</h3><span className="muted">Urbanist · JetBrains Mono</span></div>
        <div className="eg-type-display-xl">₹3,91,192</div>
        <div className="eg-type-display">Ready to plan tomorrow?</div>
        <div className="eg-type-title">Savings engine</div>
        <div className="eg-type-body">Bid cleared for blocks 36–61 at an average ₹4.12/kWh.</div>
        <div className="eg-type-overline">Volume cleared</div>
        <div className="eg-type-code">N2UP0AEV0003</div>
      </section>
      <section className="eg-glass panel">
        <div className="eg-card__head"><h3 className="eg-card__title">Logo rules</h3></div>
        <ul className="br-rules">
          <li>Use the glass wordmark on screens. Pick the dark-ground or light-ground file to match the ground; never place the dark-ground file on white.</li>
          <li>Keep clear space of one orb diameter around the wordmark. Minimum width 120 px on screen; below that, use the orb mark or the app icon.</li>
          <li>The classic 2D glass version is for places that keep the original gold, such as documents, partner decks and print on white.</li>
          <li>Use the mono file for one-colour print, engraving and embroidery. Don’t recolour the glass files, add effects, stretch or rotate them.</li>
        </ul>
      </section>
    </Shell>
  );
}
