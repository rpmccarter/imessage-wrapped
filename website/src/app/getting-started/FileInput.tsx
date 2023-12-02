'use client';

import clsx from 'clsx';
import { useRef } from 'react';

type FileInputParams = {
  value?: FileList;
  setValue?: (files: FileList) => void;
};

export const FileInput = ({ value, setValue }: FileInputParams) => {
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        aria-label="file upload button"
        className="m-2 p-4 w-1/2 flex border-gray-400 dark:border-white/30 items-center justify-center border rounded-xl border-dashed bg-transparent outline-none min-w-0"
        onClick={() => hiddenInputRef.current?.click()}
      >
        <div
          className={clsx(
            'text-lg font-mono text-ellipsis overflow-hidden',
            value
              ? 'text-gray-900 dark:text-gray-100'
              : 'text-gray-400 dark:text-white/30',
          )}
        >
          {value?.[0]?.name ??
            'Drop your iMessage data here or click to upload'}
        </div>
      </button>
      {/* HACK: file inputs are notoriously hard to style, so hide the native input and click it programmatically */}
      <input
        type="file"
        onChange={(event) =>
          event.target.files && setValue?.(event.target.files)
        }
        ref={hiddenInputRef}
        className="hidden"
      />
    </>
  );
};
