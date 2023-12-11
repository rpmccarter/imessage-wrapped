'use client';

import { ReactNode, useCallback, useState } from 'react';
import { FileInput } from './FileInput';
import clsx from 'clsx';
import { useData } from '@/contexts/DataContext';

import { useRouter } from 'next/navigation';
import { BeatLoader } from 'react-spinners';
import { QueryManager } from '@/db/QueryManager';

const dbSteps = [
  'Copy the following text: ~/Library/Messages/',
  'Hit “command + space” to open the Spotlight search',
  'Paste the text into the search bar, then open the "Messages" folder (search result)',
  'Locate the chat.db file, and drag it into the upload box to the right',
];

const contactSteps = [
  'Open the Contacts app on your Mac',
  '"Command + A" to select all contacts',
  'Right click, then click "Export vCard..."',
  'Choose a destination to save the file, then upload or drag it into the box to the right',
];

export default function GettingStarted() {
  const [chatFile, setChatFile] = useState<File>();
  const [contactFile, setContactFile] = useState<File>();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-24">
      <h1
        className="text-4xl"
        style={{ paddingBottom: chatFile && contactFile ? '10px' : '0px' }}
      >
        {"Let's get your iMessages wrapped"}
      </h1>

      <div className="flex gap-6 w-full">
        <div className="flex flex-col m-4 gap-6 w-2/3">
          <div className="flex flex-row gap-6">
            <h2 className="text-2xl">1. Upload your iMessages</h2>
            {chatFile ? (
              <div>
                <h2 className="text-2xl text-green-500">&#10003;</h2>
              </div>
            ) : null}
          </div>
          {chatFile ? (
            <div className="flex flex-row gap-6">
              <h2 className="text-2xl">2. Add your contacts</h2>
              {contactFile ? (
                <div>
                  <h2 className="text-2xl text-green-500">&#10003;</h2>
                </div>
              ) : null}
            </div>
          ) : null}
          {!chatFile && !contactFile ? (
            <div className="flex flex-col gap-6">
              {dbSteps.map((value, index) => (
                <Step num={index + 1} key={index}>
                  {value}
                </Step>
              ))}
            </div>
          ) : null}
          {chatFile && !contactFile ? (
            <div className="flex flex-col gap-6">
              {contactSteps.map((value, index) => (
                <Step num={index + 1} key={index}>
                  {value}
                </Step>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex flex-col w-1/3">
          {/*!chatFile || !contactFile ? (
            <div
              style={{
                aspectRatio: '1 / 1',
                width: '100%',
              }}
              className={clsx(
                'text-lg font-mono text-ellipsis overflow-hidden',
                'text-gray-400 dark:text-white/30',
                'flex items-center justify-center',
              )}
            >
              (gif goes here)
            </div>
              ) : null*/}

          {!chatFile ? (
            <FileInput
              title="chat.db file"
              accept={['.db']}
              value={chatFile}
              setValue={setChatFile}
            />
          ) : (
            <div
              style={{ height: '75px' }}
              className={clsx(
                'text-lg font-mono text-ellipsis overflow-hidden',
                'text-gray-400 dark:text-white/30',
                'flex items-center justify-center h-full text-center',
              )}
            >
              {chatFile.name ?? `Drop your file here or click to upload`}
              &#10003;
            </div>
          )}
          {chatFile && !contactFile ? (
            <FileInput
              title="contacts file"
              accept={['.vcf', '.vcard']}
              value={contactFile}
              setValue={setContactFile}
            />
          ) : null}
          {chatFile && contactFile ? (
            <div
              style={{ height: '75px' }}
              className={clsx(
                'text-lg font-mono text-ellipsis overflow-hidden',
                'text-gray-400 dark:text-white/30',
                'flex items-center justify-center h-full text-center',
              )}
            >
              {contactFile.name ?? `Drop your file here or click to upload`}
              &#10003;
            </div>
          ) : null}
        </div>
      </div>
      {chatFile && contactFile ? (
        <SubmitButton chatFile={chatFile} contactFile={contactFile} />
      ) : null}

      <h3 style={{ paddingTop: chatFile && contactFile ? '30px' : '0px' }}>
        Don’t worry, we NEVER store or save your data. All of the magic is done
        on your own device, so we never even see it.
      </h3>
    </main>
  );
}

type SubmitButtonProps = {
  chatFile?: File;
  contactFile?: File;
};

const SubmitButton = ({ chatFile, contactFile }: SubmitButtonProps) => {
  const [isSending, setIsSending] = useState(false);
  const submitFiles = useSubmitFiles(setIsSending);

  return (
    <button
      onClick={
        chatFile && !isSending
          ? () => submitFiles(chatFile, contactFile)
          : undefined
      }
      className={clsx(
        'border px-4 py-2 rounded-full items-center w-1/3',
        chatFile === undefined
          ? 'text-gray-600 bg-gray-600/20 border-gray-600 pointer-events-none'
          : 'text-white bg-sky-600/20 border-sky-600',
      )}
    >
      {isSending ? (
        <BeatLoader className="pt-1" />
      ) : (
        <div className="py-0.5">{"let's go"}</div>
      )}
    </button>
  );
};

const useSubmitFiles = (setIsSending: (val: boolean) => void) => {
  const { setData } = useData();
  const router = useRouter();

  return useCallback(
    async (chatFile: File, contactFile?: File) => {
      setIsSending(true);
      try {
        const results = await QueryManager.runQueries(chatFile, contactFile);
        setData(results);
        router.push('/results');
      } catch (err) {
        console.error('an error occurred while fetching your results:', err);
      }
      setIsSending(false);
    },
    [setData, router, setIsSending],
  );
};

type StepProps = {
  num: number;
  children?: ReactNode;
};

const Step = ({ num, children }: StepProps) => {
  return (
    <div className="relative">
      <div className="p-6 text-2xl bg-sky-600 rounded-3xl">{children}</div>
      <Tail />
    </div>
  );
};

const Tail = () => {
  return (
    <div
      className="w-5 h-5 left-[-5px] bottom-[2px] shadow-[6px_4px_0_0] shadow-sky-600 bottom-0 absolute"
      style={{ borderRadius: '50%' }}
    />
  );
};
