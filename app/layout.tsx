import type { Metadata } from 'next';
import { Figtree } from 'next/font/google';
import './globals.css';
import { ThemeBootstrap } from '@/components/ThemeBootstrap';

// Fokus-Design: eine Schriftfamilie für Überschriften und Text
const display = Figtree({ subsets: ['latin'], weight: ['500', '600', '700', '800'], variable: '--font-display' });
const body = Figtree({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-body' });

export const metadata: Metadata = {
  title: 'Flex Quiz',
  description: 'Flexibles Timeline-Quiz mit eigenen Fragen und Flex Buttons.',
  manifest: '/manifest.webmanifest'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${display.variable} ${body.variable}`}>
      <body className="font-body antialiased text-white">
        <ThemeBootstrap />
        {children}
      </body>
    </html>
  );
}
