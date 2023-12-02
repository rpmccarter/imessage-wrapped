'use client';

import { ReactNode, useCallback, useState } from 'react';
import { FileInput } from './FileInput';
import clsx from 'clsx';
import { useData } from '@/context/DataContext';
import axios from 'axios';

const steps = [
  'download your phone data to your laptop',
  'download your phone data to your laptop',
  'download your phone data to your laptop',
];

// TODO: define api endpoint
const API_ENDPOINT = 'http://localhost:8000';

export default function GettingStarted() {
  const [files, setFiles] = useState<FileList>();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-24">
      <h1 className="text-4xl">how to get your wrapped</h1>
      <div className="flex gap-6">
        <div className="flex flex-col m-4 gap-6">
          {steps.map((value, index) => (
            <Step num={index + 1} key={index}>
              {value}
            </Step>
          ))}
        </div>
        <FileInput value={files} setValue={setFiles} />
      </div>
      <SubmitButton files={files} />
    </main>
  );
}

type SubmitButtonProps = {
  files?: FileList;
};

const SubmitButton = ({ files }: SubmitButtonProps) => {
  const submitFiles = useSubmitFiles();

  return (
    <button
      onClick={files && (() => submitFiles(files))}
      className={clsx(
        'border px-4 py-2 rounded-full',
        files === undefined
          ? 'text-gray-600 bg-gray-600/20 border-gray-600 pointer-events-none'
          : 'text-sky-600 bg-sky-600/20 border-sky-600',
      )}
    >
      {"let's go"}
    </button>
  );
};

const useSubmitFiles = () => {
  const { setData } = useData();

  return useCallback(
    async (files: FileList) => {
      const file = files[0];
      if (file === undefined) {
        console.error('no file found');
      }

      try {
        const response = await axios.post(API_ENDPOINT, file);
        console.log(response.data);
        setData(response.data);
      } catch (err) {
        console.error('an error occurred while fetching your results:', err);
      }
    },
    [setData],
  );
};

type StepProps = {
  num: number;
  children?: ReactNode;
};

const Step = ({ num, children }: StepProps) => {
  return (
    <div className="relative">
      <div className="p-6 text-3xl bg-sky-600 rounded-3xl">{children}</div>
      <Tail />
    </div>
  );
};

const Tail = () => {
  return (
    <div
      className="w-5 h-5 left-[-5px] bottom-[2px] shadow-[6px_4px_0_0] shadow-sky-600 bottom-0 absolute"
      style={{
        borderRadius: '50%',
      }}
    />
  );
};
