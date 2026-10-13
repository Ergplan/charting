import type { Metadata } from 'next';
import 'energy-flow-chart/tokens.css';
import 'energy-flow-chart/harmony.css';
import './demo.css';

export const metadata: Metadata = {
  title: 'ergOS Harmony demo',
  description: 'Walk through the redesigned ergOS screens: Today, Savings, Prices, Actual vs forecast, Real talk, Mobile and Brand.',
  icons: { icon: '/brand/joulewise-app-icon.svg' },
};

// Applies the saved theme before first paint (no flash).
const themeScript = `try{var t=localStorage.getItem('ergos-theme');if(t)document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="eg-stage">{children}</body>
    </html>
  );
}
