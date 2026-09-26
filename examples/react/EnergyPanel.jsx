// Any React app (Vite, CRA, Remix...). Minimal usage.
import { EnergyFlowBoard } from 'energy-flow-chart/react';

export default function EnergyPanel({ rows }) {
  // rows: records with the standard export columns, or { header, rows }, or a URL string
  return <EnergyFlowBoard data={rows} view="tod" theme="energy" />;
}
