import { useData } from '@/contexts/DataContext';
import { useDownloadLink } from '@/hooks/useDownloadLinkAndCopy';
import { useState, ReactNode } from 'react';
import { Carousel } from './Carousel';
import { sampleData } from './sampleData';

export const ResultSlides = () => {
  const { data } = useData();
  const [index, setIndex] = useState(0);

  return (
    <div>
      <Carousel index={index} setIndex={setIndex}>
        {Object.keys(sampleData.topFriends).map((value, i) => (
          <div key={i} id={`result-${i}`} className="w-full h-full bg-sky-600">
            {value}
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
