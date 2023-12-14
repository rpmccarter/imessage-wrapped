import {
  TextsSentSummary,
  TopFriend,
  TopFriends,
  TopMonths,
  TopSender,
} from '@/db/types';
import { BarElement, CategoryScale, Chart, LinearScale } from 'chart.js';
import { ReactNode, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import bg1 from './ExampleForMatt.png';

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
      <h1 className="text-3xl">This year you sent</h1>
      <h1 className="text-6xl font-bold">
        {numberWithCommas(data.total_texts_sent)}
      </h1>
      <h2 className="text-3xl">messages</h2>
      <div className="pt-8 text-2xl text-center text-balance">{copy}</div>
    </div>
  );
};

const getCopyForCount = (n: number) => {
  if (n < 25_000) {
    return 'You really need more friends. Can’t help you with that, but there may be some paid sites!';
  }

  if (n < 50_000) {
    return 'According to our calculations, you are very average. Take that as you will.';
  }

  return 'Congrats! You’re an iMessage socialite. An addict, some might say. Feel free to text your friends about it, because you’re probably compelled to. You probably already did.';
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
  const datasets = [
    { data: sortedMonths.map(([_, val]) => val), backgroundColor: 'white' },
  ];

  const options = {
    scales: {
      x: {
        ticks: {
          //font: { weight: 'bold' },
          color: 'white', // Change X-axis labels to red
        },
      },
      y: {
        ticks: {
          maxTicksLimit: 5,
          color: 'white', // Change Y-axis labels to blue
        },
      },
    },
  };

  const { topMonth, count } = findMaxMonth(data);
  return (
    <div
      key={index}
      id={`result-${index}`}
      className="p-5 flex flex-col w-full h-full bg-orange-400 items-center justify-center gap-4"
    >
      <h1 className="leading-tight text-3xl text-center">
        Your busiest month was {topMonth}, where you sent{' '}
        {numberWithCommas(count)} messages
      </h1>
      <Bar data={{ labels, datasets }} options={options} />
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
  const datasets = [
    {
      data: data.map(({ messages_sent }) => messages_sent),
      backgroundColor: 'white',
    },
  ];

  const options = {
    scales: {
      x: {
        ticks: {
          //font: { weight: 'bold' },
          color: 'white', // Change X-axis labels to red
        },
      },
      y: {
        ticks: {
          maxTicksLimit: 5,
          color: 'white', // Change Y-axis labels to blue
        },
      },
    },
  };
  return (
    <div
      key={index}
      id={`result-${index}`}
      className="p-5 flex flex-col w-full h-full bg-orange-400 items-center justify-center gap-4"
    >
      <h1 className="leading-tight text-3xl text-center">
        {"Here's who you've texted this year. You should text your mom more."}
      </h1>
      <Bar data={{ labels, datasets }} options={options} />
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
      className="relative  flex flex-col w-full h-full bg-sky-400 items-center justify-center gap-4"
    >
      <img className="" src={bg1.src}></img>
      <div className="absolute p-10 flex flex-col gap-4">
        <h1 className="leading-tight text-3xl text-center ">
          We all have favorites. Your three best friends are...
        </h1>
        <div className="flex flex-col gap-2 w-full">
          {friends.map(([name, { message_count }], i) => {
            return (
              <div key={i} className="flex gap-6 ">
                <div className="flex gap-2">
                  <div className="text-4xl">{i + 1}</div>
                  <div className="text-3xl">{name}</div>
                </div>
                {/*<div className="bg-sky-400 p-2 rounded-lg items-center flex flex-col">
                  <div className="text-2xl">
                    {numberWithCommas(message_count)}
                  </div>
                  <div className="text-1xl">messages</div>
            </div>*/}
              </div>
            );
          })}
        </div>
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
      <h1 className="leading-tight text-3xl text-center">
        {"Let's talk about " + id + '.'}
      </h1>
      <div className="flex flex-row gap-10">
        <div className="flex flex-col gap-2 items-center">
          <h1 className="leading-tight text-2xl text-center">Top words:</h1>
          <div className="flex flex-col gap-4">
            {Object.entries(data.top_word_count).map(([word], i) => {
              return (
                <div key={i} className="flex gap-3">
                  <div className="text-2xl leading-none">{i + 1}.</div>
                  <div className="text-2xl leading-none">{word}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/*<h1 className="leading-tight text-1xl text-center">{quip1}</h1>*/}
        <div className="flex flex-col gap-2 ">
          <h1 className="leading-tight text-2xl text-center">Top emojis:</h1>
          <div className="flex flex-col gap-2 items-center">
            {Object.entries(data.top_emojis).map(([emoji], i) => {
              return (
                <div key={i} className="flex gap-4">
                  <div className="text-2xl">{i + 1}.</div>
                  <div className="text-2xl">{emoji}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <h1 className="leading-tight text-1xl text-center">{quip1}</h1>
    </div>
  );
};

function numberWithCommas(x: number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
