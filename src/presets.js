// Ready-made configuration for the standard "Energy Supply Chart" export
// (Date, Block, Time (IST), Total Demand (kW), Renewable Energy (kW), ...).
// Pass `preset: 'energy-supply'` to mount() and only override what differs.

import { DEFAULT_TOD_ZONES } from './tod.js';
import { fmtNumber, fmtEnergy } from './format.js';
import { allocateSurplus } from './data.js';

const pct = (a, b) => (b > 0 ? `${fmtNumber((a / b) * 100, 0)}%` : '0%');

export const energySupplyPreset = {
  /** series key → column header in the export */
  columns: {
    demand: 'Total Demand (kW)',
    renewable: 'Renewable Energy (kW)',
    surplus: 'Surplus Renewable (kW)',
    grid: 'Grid Supply (kW)',
    localBattery: 'Local Battery (kW)',
    market: 'Energy Market (kW)',
    govBattery: 'Government Battery (kW)',
    // BESS and surplus destinations (optional: shown only when the export has them; rename to your headers)
    bessCharge: 'BESS Charge (kW)',
    bessSoc: 'BESS SoC (%)',
    banked: 'Banked (kW)',
    wasted: 'Wasted (kW)',
  },
  dateKey: 'Date',
  blockKey: 'Block',
  blockMinutes: 15,
  /** declaration order = stack order, bottom → top */
  series: [
    { key: 'renewable', label: 'Renewable', role: 'renewable' },
    { key: 'localBattery', label: 'BESS discharge', role: 'localBattery' },
    { key: 'govBattery', label: 'Gov battery', role: 'govBattery' },
    { key: 'grid', label: 'Grid', role: 'grid' },
    { key: 'market', label: 'Market (IEX)', role: 'market' },
    // above demand: where the surplus went (charged into the BESS, banked, or wasted)
    { key: 'bessCharge', label: 'To BESS', role: 'bessCharge', pattern: 'hatch', countInTotal: false, optional: true, zeroNote: 'Not charging' },
    { key: 'banked', label: 'Banked', role: 'banked', pattern: 'hatch', countInTotal: false, optional: true },
    { key: 'wasted', label: 'Wasted', role: 'wasted', pattern: 'hatch', countInTotal: false, optional: true },
    { key: 'surplus', label: 'Surplus RE', role: 'surplus', pattern: 'hatch', countInTotal: false },
    { key: 'demand', label: 'Demand', role: 'demand', type: 'line', dash: '6 4' },
    // state of charge: not drawn as a band; read by the battery in the band and the SoC card
    { key: 'bessSoc', label: 'BESS SoC', role: 'soc', type: 'state', unit: '%', optional: true },
  ],
  /** split the undivided surplus into charge / banked / wasted when the export says where it went */
  prepare: (ds) => allocateSurplus(ds),
  metrics: [
    { id: 'demand', label: 'Total Demand', series: 'demand', icon: 'bolt', description: 'Energy consumed' },
    { id: 'renewable', label: 'Renewable', series: 'renewable', icon: 'sun', description: (a) => `${pct(a.energy('renewable'), a.energy('demand'))} of demand` },
    { id: 'grid', label: 'Grid', series: 'grid', icon: 'grid', description: 'From grid meters' },
    { id: 'market', label: 'Exchange (IEX)', series: 'market', icon: 'market', description: (a) => `${pct(a.energy('market'), a.energy('demand'))} of demand` },
    { id: 'localBattery', label: 'BESS Discharge', series: 'localBattery', icon: 'battery', description: 'Discharged to load' },
    { id: 'bessSoc', label: 'BESS SoC', series: 'bessSoc', agg: 'last', format: 'soc', icon: 'battery', toggle: false,
      description: (a) => `Charged ${fmtEnergy(a.energy('bessCharge'), { digits: 1 })} · out ${fmtEnergy(a.energy('localBattery'), { digits: 1 })}` },
    { id: 'bessCharged', label: 'To BESS', series: 'bessCharge', icon: 'battery', description: 'Surplus charged into the BESS' },
    { id: 'banked', label: 'Banked', series: 'banked', icon: 'bank', description: 'Surplus banked with the DISCOM' },
    { id: 'wasted', label: 'Wasted', series: 'wasted', icon: 'curtail', description: 'Surplus curtailed' },
    { id: 'govBattery', label: 'Gov Battery', series: 'govBattery', icon: 'battery', description: 'Discharged' },
    { id: 'surplus', label: 'Surplus RE', series: 'surplus', icon: 'surplus', description: 'Above demand' },
    { id: 'peak', label: 'Peak Demand', series: 'demand', agg: 'max', icon: 'peak', toggle: false },
  ],
  /** shown only when prices are supplied */
  priceMetrics: [
    { id: 'avgPrice', label: 'Avg Purchase Price', series: ['renewable', 'localBattery', 'govBattery', 'grid', 'market'], agg: 'avgPrice', icon: 'rupee', description: 'Weighted avg cost', toggle: false, sparkline: false },
    { id: 'cost', label: 'Purchase Cost', series: ['renewable', 'localBattery', 'govBattery', 'grid', 'market'], agg: 'cost', icon: 'rupee', description: 'All sources', toggle: false, sparkline: false },
  ],
  /** cards shown when `metrics` isn't given; any card id above can be picked instead */
  defaultCards: ['demand', 'renewable', 'grid', 'market', 'peak'],
  /** added to the defaults when the data has them */
  defaultOptionalCards: { bessSoc: 'bessSoc' },
  defaultPriceCards: ['avgPrice'],
  todZones: DEFAULT_TOD_ZONES,
  live: { series: 'demand' },
};

// Typical Sep-2026 day-ahead shape (₹/kWh by hour): solar dip midday, evening peak.
const IEX_HOURLY = [4.2, 3.9, 3.7, 3.6, 3.6, 3.9, 4.8, 5.6, 5.2, 4.4, 3.6, 3.1, 2.9, 2.9, 3.2, 3.8, 4.9, 7.2, 9.6, 10.0, 9.4, 8.1, 6.4, 5.0];

/**
 * ILLUSTRATIVE prices for demos only. Replace with your DISCOM tariff, IEX MCP feed and
 * PPA rates in production. Grid follows the preset's ToD zones.
 */
export const SAMPLE_PRICES = {
  renewable: 4.2, // PPA
  localBattery: 6.8, // levelised storage cost
  govBattery: 5.9,
  grid: {
    tod: [
      { start: '00:00', end: '03:00', price: 8.76 },
      { start: '03:00', end: '05:00', price: 7.3 },
      { start: '05:00', end: '10:00', price: 6.21 },
      { start: '10:00', end: '19:00', price: 7.3 },
      { start: '19:00', end: '24:00', price: 8.76 },
    ],
  },
  market: (t) => {
    const d = new Date(t - 15 * 60_000); // interval start
    const day = Math.floor(t / 86_400_000);
    const wobble = 1 + 0.08 * Math.sin(day * 2.1) + 0.03 * Math.sin(d.getUTCMinutes() / 9 + day);
    return +(IEX_HOURLY[d.getUTCHours()] * wobble).toFixed(2);
  },
};

export const presets = { 'energy-supply': energySupplyPreset };
