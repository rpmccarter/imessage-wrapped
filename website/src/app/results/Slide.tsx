import {
  TextsSentSummary,
  TopFriend,
  TopFriends,
  TopMonths,
  TopSender,
} from '@/db/QueryManager';
import { BarElement, CategoryScale, Chart, LinearScale } from 'chart.js';
import { ReactNode, useState } from 'react';
import { Bar } from 'react-chartjs-2';

Chart.register(CategoryScale);
Chart.register(LinearScale);
Chart.register(BarElement);

type SlideProps = {
  index: number;
  children?: ReactNode;
};

export const Slide = ({ index, children }: SlideProps) => {
  return (
    <div
      key={index}
      id={`result-${index}`}
      className="w-full h-full bg-sky-600"
    >
      {children}
    </div>
  );
};

type SummarySlideProps = {
  index: number;
  data: TextsSentSummary;
};

export const SummarySlide = ({ index, data }: SummarySlideProps) => {
  const copy = getCopyForCount(data.total_texts_sent);

  return (
    <div
      key={index}
      id={`result-${index}`}
      className="p-10 flex flex-col w-full h-full bg-orange-400 items-center justify-center gap-4"
    >
      <h1 className="text-5xl">This year you sent</h1>
      <h1 className="text-6xl font-bold">
        {numberWithCommas(data.total_texts_sent)}
      </h1>
      <h2 className="text-5xl">messages</h2>
      <div className="pt-8 text-3xl text-center text-balance">{copy}</div>
    </div>
  );
};

type ByMonthSlideProps = {
  index: number;
  data: TopMonths;
};

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const ByMonthSlide = ({ index, data }: ByMonthSlideProps) => {
  const sortedMonths = Object.entries(data).sort(
    ([a], [b]) => months.indexOf(a) - months.indexOf(b),
  );
  const labels = sortedMonths.map(([key]) => key);
  const datasets = [{ data: sortedMonths.map(([_, val]) => val) }];

  const { topMonth, count } = findMaxMonth(data);
  return (
    <div
      key={index}
      id={`result-${index}`}
      className="p-10 flex flex-col w-full h-full bg-orange-400 items-center justify-center gap-4"
    >
      <h1 className="leading-tight text-5xl text-center">
        Your busiest month was {topMonth}, where you sent{' '}
        {numberWithCommas(count)} messages
      </h1>
      <Bar data={{ labels, datasets }} />
    </div>
  );
};

const findMaxMonth = (data: TopMonths) => {
  let [topMonth, maxVal] = Object.entries(data)[0];
  Object.entries(data).forEach(([month, val]) => {
    if (val > maxVal) {
      topMonth = month;
      maxVal = val;
    }
  });

  return {
    topMonth,
    count: maxVal,
  };
};

type TopSendersSlideProps = {
  index: number;
  data: TopSender[];
};

export const TopSendersSlide = ({ index, data }: TopSendersSlideProps) => {
  const labels = data.map(({ id }) => id);
  const datasets = [{ data: data.map(({ messages_sent }) => messages_sent) }];

  return (
    <div
      key={index}
      id={`result-${index}`}
      className="p-10 flex flex-col w-full h-full bg-orange-400 items-center justify-center gap-4"
    >
      <h1 className="leading-tight text-5xl text-center">
        {"Here's who you've texted this year. You should text your mom more."}
      </h1>
      <Bar data={{ labels, datasets }} />
    </div>
  );
};

type TopFriendsSlideProps = {
  index: number;
  data: TopFriends;
};

export const TopFriendsSlide = ({ index, data }: TopFriendsSlideProps) => {
  const friends = Object.entries(data).sort(
    ([_a, a], [_b, b]) => a.message_count - b.message_count,
  );

  return (
    <div
      key={index}
      id={`result-${index}`}
      className="p-10 flex flex-col w-full h-full bg-sky-400 items-center justify-center gap-4"
    >
      <h1 className="leading-tight text-5xl text-center">
        We all have favorites. Your three best friends are:
      </h1>
      <div className="flex flex-col gap-2">
        {friends.map(([name, { message_count }], i) => {
          return (
            <div key={i} className="flex gap-6">
              <div className="flex gap-2">
                <div className="text-6xl">{i + 1}</div>
                <div className="text-4xl">{name}</div>
              </div>
              <div>
                <div className="text-4xl">
                  {numberWithCommas(message_count)}
                </div>
                <div>messages</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

type FriendSummarySlideProps = {
  index: number;
  id: string;
  data: TopFriend;
};

const randomContent = [
  'Kind of weird, but okay.',
  'Yeah that’s on brand.',
  'Makes sense. Strange tho.',
  'Why are y’all like this…',
  'That’s cute.',
  'I’d be a bit embarrassed if I were you.',
];

const useRandomContent = () => {
  return useState(() => {
    const index1 = Math.floor(Math.random() * randomContent.length);
    let index2 = Math.floor(Math.random() * randomContent.length);
    if (index1 === index2) {
      index2++;
      if (index2 >= randomContent.length) index2 = 0;
    }
    return [randomContent[index1], randomContent[index2]];
  })[0];
};

export const FriendSummarySlide = ({
  index,
  id,
  data,
}: FriendSummarySlideProps) => {
  const [quip1, quip2] = useRandomContent();
  return (
    <div
      key={index}
      id={`result-${index}`}
      className="p-10 flex flex-col w-full h-full bg-sky-400 items-center justify-center gap-4"
    >
      <h1 className="leading-tight text-5xl text-center">
        {"Let's talk about " + id + '.'}
      </h1>
      <h1 className="leading-tight text-2xl text-center">
        Your top words were:
      </h1>
      <div className="flex flex-col gap-1">
        {Object.entries(data.top_word_count).map(([word], i) => {
          return (
            <div key={i} className="flex gap-2">
              <div className="text-2xl leading-none">{i + 1}.</div>
              <div className="text-2xl leading-none">{word}</div>
            </div>
          );
        })}
      </div>
      <h1 className="leading-tight text-1xl text-center">{quip1}</h1>
      <h1 className="leading-tight text-2xl text-center">
        Your top emojis were:
      </h1>
      <div className="flex flex-col gap-2">
        {Object.entries(data.top_emojis).map(([emoji], i) => {
          return (
            <div key={i} className="flex gap-2">
              <div className="text-2xl">{i + 1}.</div>
              <div className="text-2xl">{emoji}</div>
            </div>
          );
        })}
      </div>
      <h1 className="leading-tight text-1xl text-center">{quip2}</h1>
    </div>
  );
};

const getCopyForCount = (n: number) => {
  if (n < 25_000) {
    return 'you really need more friends. Can’t help you with that, but there may be some paid sites!';
  }

  if (n < 50_000) {
    return 'according to our calculations, you are very average. Take that as you will';
  }

  return 'congrats! You’re an iMessage socialite. An addict, some might say. Feel free to text your friends about it, because you’re probably compelled to. You probably already did.';
};

function numberWithCommas(x: number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
