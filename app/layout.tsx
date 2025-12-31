import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import FullscreenButton from '@/components/FullscreenButton';
import { ThemeBootstrap } from '@/components/ThemeBootstrap';

const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });
const body = Inter({ subsets: ['latin'], variable: '--font-body' });

export const metadata: Metadata = {
  title: 'Flex Quiz',
  description: 'Flexibles Timeline-Quiz mit eigenen Fragen und Flex Buttons.',
  manifest: '/manifest.webmanifest'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${display.variable} ${body.variable}`}>
      <body className="font-body antialiased text-white">
        <FullscreenButton />
        <ThemeBootstrap />
        {children}
      </body>
    </html>
  );
}
