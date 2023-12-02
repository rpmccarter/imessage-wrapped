'use client';

import { useData } from '@/contexts/DataContext';
import { ReactNode, useState } from 'react';
import { Carousel } from './Carousel';
import { useDownloadLink } from '@/hooks/useDownloadLinkAndCopy';

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
    <div>
      <Carousel index={index} setIndex={setIndex}>
        {results.map((value, i) => (
          <div key={i} id={`result-${i}`} className="w-full h-full bg-sky-600">
            value
          </div>
        ))}
      </Carousel>
      <Buttons index={index} />
    </div>
  );
};

type ButtonsParams = {
  index: number;
};

const Buttons = ({ index }: ButtonsParams) => {
  const { link, copy } = useDownloadLink(index);
  return (
    <div className="flex gap-8 items-center justify-center">
      <Button onClick={copy}>copy image</Button>
      <a href={link} download={'imessage-wrapped.png'}>
        <Button>save image</Button>
      </a>
    </div>
  );
};

type ButtonParams = {
  onClick?: () => void;
  children?: ReactNode;
};

const Button = ({ onClick, children }: ButtonParams) => {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer flex items-center justify-center rounded-full w-60 bg-sky-600 px-6 py-4"
    >
      {children}
    </div>
  );
};
