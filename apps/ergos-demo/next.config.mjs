import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // the ErgOS runtime binds DOM listeners once per element
  // the library is linked from the repo root (file:../..) and ships plain ES modules
  transpilePackages: ['energy-flow-chart'],
  outputFileTracingRoot: fileURLToPath(new URL('../..', import.meta.url)),
};
export default nextConfig;
