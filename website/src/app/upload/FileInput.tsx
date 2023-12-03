'use client';

import clsx from 'clsx';
import { useRef } from 'react';

type FileInputParams = {
  title?: string;
  value?: File;
  accept?: string;
  setValue?: (file: File) => void;
};

export const FileInput = ({
  title,
  value,
  setValue,
  accept,
}: FileInputParams) => {
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        aria-label="file upload button"
        className="m-2 w-full h-full p-4 flex border-gray-400 dark:border-white/30 items-center justify-center border rounded-xl border-dashed bg-transparent outline-none min-w-0"
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
          {value?.name ??
            `Drop your ${title ?? 'file'} here or click to upload`}
        </div>
      </button>
      {/* HACK: file inputs are notoriously hard to style, so hide the native input and click it programmatically */}
      <input
        type="file"
        accept={accept}
        onChange={(event) =>
          event.target.files?.[0] && setValue?.(event.target.files[0])
        }
        ref={hiddenInputRef}
        className="hidden"
      />
    </>
  );
};
