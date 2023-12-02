'use client';
import { Inter } from 'next/font/google';
import './globals.css';
import { DataContext, DataType } from '@/contexts/DataContext';
import { useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setData] = useState<DataType>();

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
