// Serve block data to the chart. Replace the file read with your DB / meter API.
// Accepted shapes: { header: string[], rows: unknown[][] }  or  Record<string, unknown>[]
// with the standard export columns (Date, Block, Total Demand (kW), ...).
import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const file = path.join(process.cwd(), 'data', 'energy-supply-sample.json');
  const json = JSON.parse(await readFile(file, 'utf8'));
  return NextResponse.json(json, { headers: { 'Cache-Control': 'no-store' } });
}
