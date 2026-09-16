import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DaamBD (দামবিডি) | আজকের বাজারদর, এক জায়গায়',
  description: 'বাংলাদেশের সেরা মোবাইল-ফার্স্ট দৈনিক বাজারদর ট্র্যাকিং প্ল্যাটফর্ম। কৃষি বিপণন অধিদপ্তর (DAM) দ্বারা যাচাইকৃত চাল, ডাল, তেল, সবজি, মাছ, ডিম ও মাংসের সঠিক বাজারদর।',
  keywords: [
    'DaamBD',
    'আজকের বাজারদর',
    'দামবিডি',
    'বাংলাদেশ বাজারদর',
    'Grocery Prices Bangladesh',
    'DAM MOA prices'
  ],
  authors: [{ name: 'DaamBD Intelligence Platform' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Noto+Sans+Bengali:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>

      <body className="min-h-screen bg-[#F8FAF8] text-[#17211B] antialiased flex flex-col selection:bg-emerald-200 selection:text-emerald-900">
        {children}
        <Analytics />
      </body>
    </html>
  );
}