export type Colorway = {
  key: string;
  name: string;
  base: string;   // mid leather tone
  dark: string;   // shadow / edges
  light: string;  // sheen
  lining: string; // interior fabric
  hardware: string;
};

export const COLORWAYS: Colorway[] = [
  { key: 'oxblood',  name: 'Oxblood',       base: '#6e1f2b', dark: '#3b0f17', light: '#a4414f', lining: '#e9d7b8', hardware: '#d9b45a' },
  { key: 'tan',      name: 'Kanpur Tan',    base: '#b5733a', dark: '#6e4120', light: '#d9a46c', lining: '#1f2d3a', hardware: '#d9b45a' },
  { key: 'midnight', name: 'Midnight',      base: '#1c2238', dark: '#0d101c', light: '#3a4670', lining: '#e3c9a3', hardware: '#cfcfd6' },
  { key: 'sage',     name: 'Monsoon Sage',  base: '#6f7f66', dark: '#3d4a38', light: '#9aab8e', lining: '#f1e7d2', hardware: '#d9b45a' },
  { key: 'sand',     name: 'Marine Sand',   base: '#cdb58f', dark: '#8f7652', light: '#ead9bb', lining: '#2b2b30', hardware: '#d9b45a' },
];

export type Bag = {
  slug: string;
  name: string;
  tagline: string;
  price: number;
  size: string;
  fits: string;
  weight: string;
  strap: string;
  colorway: string;
  badge?: string;
};

export const BAGS: Bag[] = [
  { slug: 'nova',   name: 'Nova Mini',    tagline: 'The crossbody for nights out.',          price: 2499, size: '20 × 14 × 7 cm',  fits: 'Phone, cards, lipstick', weight: '380 g',  strap: 'Adjustable chain-leather', colorway: 'oxblood', badge: 'New' },
  { slug: 'aria',   name: 'Aria',         tagline: 'The shoulder bag that goes everywhere.', price: 4499, size: '28 × 19 × 10 cm', fits: '11" tablet, wallet, bottle', weight: '640 g', strap: 'Top handle + detachable', colorway: 'tan' },
  { slug: 'marine', name: 'Marine Tote',  tagline: 'Boardroom to Bandra. One bag.',          price: 6999, size: '38 × 28 × 13 cm', fits: '14" laptop, charger, everything', weight: '920 g', strap: 'Twin handle + padded', colorway: 'midnight', badge: 'Flagship' },
];

export const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

export const CITIES = ['Mumbai', 'Delhi NCR', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'];
