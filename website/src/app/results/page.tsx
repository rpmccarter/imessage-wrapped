'use client';

import { ResultSlides } from './ResultSlides';

export default function Results() {
  return (
    <main className="flex overflow-x-hidden min-h-screen flex-col items-center justify-center gap-4 p-24">
      <h1 className="text-4xl">your year through texts</h1>
      <ResultSlides />
    </main>
  );
}
