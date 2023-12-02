'use client';

import { useData } from '@/context/DataContext';
import Link from 'next/link';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Carousel } from './Carousel';
import html2canvas from 'html2canvas';

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
      <Carousel>
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

const useCopyLinkToClipboard = () => {
  return useCallback(() => {
    try {
    } catch (err) {
      console.error('could not copy link to clipboard:', err);
    }
  }, []);
};

const useDownloadLink = (index: number) => {
  const [link, setLink] = useState<string>();
  useEffect(() => {
    const element = document.getElementById(`result-${index}`);
    if (!element) {
      console.error('no image selected');
      return;
    }

    html2canvas(element).then((canvas) =>
      setLink(
        canvas
          .toDataURL('image/png')
          .replace('image/png', 'image/octet-stream'),
      ),
    );
  }, [index]);

  return link;
};

type ButtonsParams = {
  index: number;
};

const Buttons = ({ index }: ButtonsParams) => {
  const copyLinkToClipboard = useCopyLinkToClipboard();
  const downloadLink = useDownloadLink(index);
  return (
    <div className="flex gap-8 items-center justify-center">
      <Button onClick={copyLinkToClipboard}>share link</Button>
      <a href={downloadLink} download={'imessage-wrapped.png'}>
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
    <div onClick={onClick} className="flex items-center justify-center rounded-full w-60 bg-sky-600 px-6 py-4">
      {children}
    </div>
  );
};
