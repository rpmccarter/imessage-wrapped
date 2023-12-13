'use client';
import Link from 'next/link';

//let's use React to execute client-side device check (we can't get info on device in Next because of SSR)
import * as React from 'react';
import isUserOnMobile from './helpers/isUserOnMobile';

export default function Home() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    setIsMobile(isUserOnMobile());
  }, []);

  return (
    <main>
      {!isMobile ? (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-24">
          <h1 className="text-4xl">your year through texts</h1>
          <Link
            href="/upload"
            className="border px-4 py-2 text-sky-600 bg-sky-600/20 rounded-full border-sky-600"
          >
            get started
          </Link>
        </div>
      ) : (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-24">
          <h1 className="text-4xl">iMessage Wrapped requires a MacBook</h1> Grab
          your laptop and come back when you're ready to try it out
        </div>
      )}
    </main>
  );
}
