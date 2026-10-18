// ILLUSTRATIVE BESS data for the demos. The sample exports have no BESS columns, so this
// simulates a 4 MWh / 1 MW battery on top of them and adds the columns the preset reads:
//   'BESS Charge (kW)', 'BESS SoC (%)', 'Banked (kW)', 'Wasted (kW)'
// and moves the discharge into 'Local Battery (kW)' (taking it off 'Grid Supply (kW)').
// Convention: source columns hold only what served demand (they sum to demand); energy that
// did not serve demand (charging, banked, wasted) sits in its own column above the demand line.
// Real deployments map their own columns instead (see README → Battery and surplus).
(function () {
  const CAP = 4000; // kWh
  const PMAX = 1000; // kW
  const H = 0.25; // h per block
  function augment(raw) {
    if (!raw || raw.header.includes('BESS SoC (%)')) return;
    const col = (name) => raw.header.indexOf(name);
    const iBlock = col('Block');
    const iSur = col('Surplus Renewable (kW)');
    const iGrid = col('Grid Supply (kW)');
    const iBat = col('Local Battery (kW)');
    raw.header.push('BESS Charge (kW)', 'BESS SoC (%)', 'Banked (kW)', 'Wasted (kW)');
    let stored = CAP * 0.3;
    for (const r of raw.rows) {
      const b = r[iBlock];
      const sur = Math.max(0, +r[iSur] || 0);
      let charge = 0;
      let dis = 0;
      // 1. surplus goes to the battery first, as far as power and room allow
      const fromSurplus = Math.min(sur, PMAX, (CAP - stored) / H);
      charge += fromSurplus;
      // 2. off-peak top-up from the grid (05:00–09:00) when below half
      if (b >= 21 && b <= 36 && stored < CAP * 0.5) {
        const g = Math.min(500, PMAX - charge, (CAP * 0.5 - stored) / H);
        // charging energy is shown in 'BESS Charge' (above demand), not added to the grid layer
        if (g > 0) charge += g;
      }
      stored += charge * H;
      // 3. evening peak (18:00–22:00): discharge instead of drawing from the grid
      if (b >= 73 && b <= 88) {
        dis = Math.min(PMAX, stored / H, +r[iGrid] || 0);
        stored -= dis * H;
        r[iGrid] = (+r[iGrid] || 0) - dis;
        r[iBat] = (+r[iBat] || 0) + dis;
      }
      // 4. what the battery could not take: most is banked, the rest is wasted
      const rest = sur - fromSurplus;
      const banked = rest * 0.75;
      r.push(+charge.toFixed(2), +((stored / CAP) * 100).toFixed(1), +banked.toFixed(2), +(rest - banked).toFixed(2));
    }
  }
  augment(window.ENERGY_DATA);
  augment(window.ENERGY_DATA_0924);
})();
