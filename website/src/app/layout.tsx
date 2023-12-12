'use client';
import { Inter } from 'next/font/google';
import './globals.css';
import { DataContext } from '@/contexts/DataContext';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ResultJawn } from '@/db/types';
import posthog from 'posthog-js';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.NEXT_PUBLIC_POSTHOG_API_KEY || '';

posthog.init(apiKey, { api_host: 'https://app.posthog.com' });

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [data, setData] = useState<ResultJawn>();

  // TODO: if there is no data, go back to home page
  // if (pathname !== '/' && pathname !== '/upload' && data === undefined) {
  //   router.replace('/');
  // }

  return (
    <html lang="en">
      <body className={inter.className}>
        <DataContext.Provider value={{ data, setData }}>
          {children}
        </DataContext.Provider>
      </body>
    </html>
  );
}
