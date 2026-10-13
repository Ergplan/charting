'use client';
// Loads the design system runtime (design-system/harmony.js → window.ErgOS) once, on the client.
// harmony.js is a classic script that touches `document`, so it must not run during SSR.
import { useEffect, useState } from 'react';

// Minimal typing for what the demo uses. Full types: design-system/harmony.d.ts.
export type ErgOS = {
  icon(name: string, size?: number): string;
  folder(front: HTMLElement): void;
  sparkline(el: HTMLElement, values: number[], opts?: Record<string, unknown>): unknown;
  supplyChart(el: HTMLElement, opts?: Record<string, unknown>): { palette(name: string): void; setCursor(i: number): void };
  trendChart(el: HTMLElement, opts?: Record<string, unknown>): unknown;
  savingsChart(el: HTMLElement, opts?: Record<string, unknown>): unknown;
  heatmap(el: HTMLElement, opts?: Record<string, unknown>): unknown;
  ring(el: HTMLElement, opts?: Record<string, unknown>): void;
  miniBars(el: HTMLElement, values: number[], series?: string): void;
  voiceBar(el: HTMLElement, opts?: Record<string, unknown>): { setState(s: string, t?: string): void; setText(t: string): void; demo(): void; stop(): void };
  palette(el: HTMLElement, name: string): void;
  inr(n: number, dp?: number): string;
  sample: Record<string, number[] | number | unknown>;
};

let loading: Promise<ErgOS> | null = null;

export function loadErgOS(): Promise<ErgOS> {
  if (!loading) {
    loading = import('energy-flow-chart/design-system/harmony.js').then(() => (window as unknown as { ErgOS: ErgOS }).ErgOS);
  }
  return loading;
}

/** The ErgOS runtime once it has loaded (null during SSR and the first client render). */
export function useErgOS(): ErgOS | null {
  const [e, setE] = useState<ErgOS | null>(null);
  useEffect(() => {
    let alive = true;
    loadErgOS().then((x) => alive && setE(x));
    return () => { alive = false; };
  }, []);
  return e;
}

/** Indian digit grouping without waiting for the runtime (SSR-safe). */
export function inr(n: number, dp = 0): string {
  const s = Math.abs(n).toFixed(dp);
  const [x, frac] = s.split('.');
  let last = x.slice(-3);
  const rest = x.slice(0, -3);
  if (rest) last = ',' + last;
  return (n < 0 ? '−' : '') + rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + last + (frac ? '.' + frac : '');
}
