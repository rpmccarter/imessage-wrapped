'use client';

import { ReactNode, useCallback, useState } from 'react';
import { FileInput } from './FileInput';
import clsx from 'clsx';
import { useData } from '@/contexts/DataContext';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const steps = [
  'download your phone data to your laptop',
  'download your phone data to your laptop',
  'download your phone data to your laptop',
];

const API_ENDPOINT = 'http://3.145.192.105';

export default function GettingStarted() {
  const [chatFile, setChatFile] = useState<File>();
  const [contactFile, setContactFile] = useState<File>();

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
        <div>
          <FileInput accept=".db" value={chatFile} setValue={setChatFile} />
          <FileInput
            accept=".vcf"
            value={contactFile}
            setValue={setContactFile}
          />
        </div>
      </div>
      <SubmitButton chatFile={chatFile} contactFile={contactFile} />
    </main>
  );
}

type SubmitButtonProps = {
  chatFile?: File;
  contactFile?: File;
};

const SubmitButton = ({ chatFile, contactFile }: SubmitButtonProps) => {
  const submitFiles = useSubmitFiles();

  return (
    <button
      onClick={chatFile && (() => submitFiles(chatFile, contactFile))}
      className={clsx(
        'border px-4 py-2 rounded-full',
        chatFile === undefined
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
  const router = useRouter();

  return useCallback(
    async (chatFile: File, contactFile?: File) => {
      try {
        const formData = new FormData();
        formData.append('chatdb', chatFile);
        if (contactFile) {
          formData.append('contactdb', contactFile);
        }

        const response = await axios({
          method: 'POST',
          url: API_ENDPOINT + '/multiplefiles',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log(response.data);
        setData(response.data);
        router.push('/results');
      } catch (err) {
        console.error('an error occurred while fetching your results:', err);
      }
    },
    [setData, router],
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
