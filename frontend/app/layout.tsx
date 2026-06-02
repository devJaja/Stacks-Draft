import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';

export const metadata: Metadata = {
  title: 'Checkers on Stacks',
  description: 'Fully decentralized Checkers/Draughts game on the Stacks blockchain with Bitcoin security.',
  openGraph: {
    title: 'Checkers on Stacks',
    description: 'Play checkers on-chain with Bitcoin finality.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
