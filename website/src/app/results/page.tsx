'use client';

import { useData } from '@/context/DataContext';
import Link from 'next/link';
import { useState } from 'react';
import { Carousel } from './Carousel';

const results = ['foo', 'bar', 'baz'];

export default function Results() {
  return (
    <main className="flex overflow-x-hidden min-h-screen flex-col items-center justify-center gap-4 p-24">
      <h1 className="text-4xl">see your year through texts</h1>
      <ResultSlides />
    </main>
  );
}

const ResultSlides = () => {
  const { data } = useData();
  const [index, setIndex] = useState(0);

  return (
    <Carousel>
      {results.map((value, i) => (
        <div key={i} className="w-full h-full bg-sky-600">
          value
        </div>
      ))}
    </Carousel>
  );
};
