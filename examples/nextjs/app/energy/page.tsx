import EnergySupplyChart from '@/components/EnergySupplyChart';

export const metadata = { title: 'Energy Supply' };

export default function EnergyPage() {
  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: 24 }}>
      <h1>Energy Supply</h1>
      <EnergySupplyChart src="/api/energy" refreshSeconds={60} />
    </main>
  );
}
