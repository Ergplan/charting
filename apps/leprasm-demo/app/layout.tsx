import type { Metadata } from 'next';
import './globals.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';

export const metadata: Metadata = {
  title: 'Leprasm — Carry the city.',
  description: 'Full-grain leather handbags designed in Mumbai, crafted in Kanpur. From ₹2,499.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <body>
        <Nav />
        {children}
        <Footer />
        <Reveal />
      </body>
    </html>
  );
}
