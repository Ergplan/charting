/* eslint-disable @next/next/no-img-element */
// jouleWise logo in ergOS Harmony. Files: design-system/assets/logo/ (copied to /brand by npm run sync).
export function Logo({ height = 32, variant = 'auto' }: { height?: number; variant?: 'auto' | 'dark' | 'light' | 'classic' }) {
  if (variant === 'classic') return <img src="/brand/joulewise-classic-glass.svg" alt="jouleWise" height={height} style={{ height, width: 'auto' }} />;
  if (variant !== 'auto') return <img src={`/brand/joulewise-${variant}.svg`} alt="jouleWise" height={height} style={{ height, width: 'auto' }} />;
  // auto: the light-ground artwork in the light theme, the dark-ground artwork otherwise (CSS swaps them)
  return (
    <span className="jw-logo" style={{ height }}>
      <img className="jw-logo--dark" src="/brand/joulewise-dark.svg" alt="jouleWise" height={height} />
      <img className="jw-logo--light" src="/brand/joulewise-light.svg" alt="" aria-hidden="true" height={height} />
    </span>
  );
}
