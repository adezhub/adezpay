import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AdezPay',
  description: 'A complete payment site built with Next.js and Stripe',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
