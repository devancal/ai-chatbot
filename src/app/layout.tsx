import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aurum AI',
  description: 'General and engineering-focused AI assistant',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
