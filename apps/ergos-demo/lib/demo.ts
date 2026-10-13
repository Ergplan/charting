// Illustrative content for the demo screens (HALDIRAM C1, Tue 13 Oct 2026). Not live data.
export const PLANTS = [
  { name: 'HALDIRAM A12A', cap: '2 MW' },
  { name: 'HALDIRAM C1', cap: '4.5 MW', selected: true },
  { name: 'HALDIRAM C3', cap: '5.13 MW' },
  { name: 'Haldiram B2', cap: '2 MW' },
];

export const TODAY = {
  date: 'Tue, 13 Oct 2026',
  demand: '50.55',
  grid: '22.65',
  iex: '16.83',
  iexBought: '17.66',
  solar: '3.11',
  wind: '4.57',
  hydro: '3.39',
  renewableShare: 22,
  peak: '3,789',
  iexPrice: '5.33',
};

export const SAVINGS = {
  total: '3,91,192',
  paise: '.06',
  pct: '26.19',
  volume: '2,35,373',
  landed: '4.2427',
  benchmark: '6.3468',
  days: 12,
};

export const TIMELINE = [
  {
    icon: 'file', title: 'DAM bid cleared for 13 Oct', meta: 'Blocks 36–61 · 2,716 kW · placed by ops desk',
    card: { icon: 'exchange', title: 'Cleared at IEX · ₹5.33 / kWh', who: 'Trading desk', avatars: ['RK', 'AS'], time: '08:45 AM',
      thumbs: [['B36–44', [20, 24, 27, 27, 27, 27, 27, 27, 27]], ['B45–53', [27, 27, 26, 27, 27, 27, 27, 27, 27]], ['B54–61', [27, 27, 27, 27, 27, 26, 27, 20]]] },
  },
  {
    icon: 'gauge', title: 'Demand dipped below the bid', meta: 'Blocks 44–45 · 2,120 kW against 2,716 kW cleared',
    card: { icon: 'bolt', title: '596 kW surplus for 30 minutes', who: 'Lunch break shutdown', chip: 'Deviation', time: '11:00 AM',
      thumbs: [['B44', [32, 30, 22, 21, 24, 31, 37, 38]], ['B45', [30, 24, 21, 21, 26, 33, 37, 37]]] },
  },
] as const;

export const NAV = [
  { href: '/', label: 'Overview', icon: 'apps' },
  { href: '/today', label: 'Today', icon: 'gauge' },
  { href: '/savings', label: 'Savings', icon: 'rupee' },
  { href: '/prices', label: 'Prices', icon: 'exchange' },
  { href: '/forecast', label: 'Actual vs forecast', icon: 'trend' },
  { href: '/real-talk', label: 'Real talk', icon: 'mic' },
  { href: '/mobile', label: 'Mobile', icon: 'factory' },
  { href: '/brand', label: 'Brand', icon: 'sparkle' },
  { href: '/design-system', label: 'Design system', icon: 'layers' },
] as const;
