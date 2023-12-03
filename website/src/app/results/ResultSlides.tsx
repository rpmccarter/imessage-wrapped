import { useData } from '@/contexts/DataContext';
import { useDownloadLink } from '@/hooks/useDownloadLinkAndCopy';
import { useState, ReactNode } from 'react';
import { Carousel } from './Carousel';
import { sampleData } from './sampleData';
import {
  ByMonthSlide,
  FriendSummarySlide,
  SummarySlide,
  TopFriendsSlide,
  TopSendersSlide,
} from './Slide';

export const ResultSlides = () => {
  let { data } = useData();
  const [index, setIndex] = useState(0);

  // TODO: remove
  data = sampleData;

  if (!data) return null;

  const friends = Object.entries(data.topFriends).sort(
    ([_a, a], [_b, b]) => a.message_count - b.message_count,
  );

  return (
    <div>
      <Carousel index={index} setIndex={setIndex}>
        <SummarySlide index={0} data={data.textSentSummary} />
        <ByMonthSlide index={1} data={data.topMonths} />
        <TopSendersSlide index={2} data={data.topSenders} />
        <TopFriendsSlide index={3} data={data.topFriends} />
        <FriendSummarySlide index={4} id={friends[0][0]} data={friends[0][1]} />
        <FriendSummarySlide index={5} id={friends[1][0]} data={friends[1][1]} />
        <FriendSummarySlide index={6} id={friends[2][0]} data={friends[2][1]} />
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
