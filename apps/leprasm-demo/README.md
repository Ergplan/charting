# Leprasm demo

An Apple-style product launch site for a premium Indian handbag label, built as a client demo.
Positioning: full-grain leather bags at ₹2,499–₹6,999 for 25–45 year olds in tier-1 cities.

Pages: `/` (launch story), `/inside` (scroll-driven 3D cut-away of the materials), `/collection` (lineup and compare).

```bash
cd apps/leprasm-demo
npm install
npm run dev      # http://localhost:3001
```

Product imagery is a parametric SVG bag (`components/Bag.tsx`) so the demo has no external assets; swap it for photography when the client supplies it. Copy, prices and specs are placeholders.
