'use client';

import html2canvas from 'html2canvas';
import { useEffect, useState } from 'react';

export const useDownloadLink = (index: number) => {
  const [link, setLink] = useState<string>();
  const [copy, setCopy] = useState<() => void>();

  useEffect(() => {
    const element = document.getElementById(`result-${index}`);
    if (!element) {
      console.error('no image selected');
      return;
    }

    html2canvas(element).then((canvas) => {
      console.log('setting vals');
      setLink(
        canvas
          .toDataURL('image/png')
          .replace('image/png', 'image/octet-stream'),
      );
      setCopy(() => {
        canvas.toBlob((blob) => {
          if (!blob) {
            console.error('unable to create blob from canvas');
            return;
          }
          navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob,
            }),
          ]);
        });
      });
    });
  }, [index]);

  return { link, copy };
};
