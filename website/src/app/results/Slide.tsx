import {
  MessagesPerDay,
  MonthOfYear,
  TextsSentSummary,
  TopFriends,
  TopMonths,
  TopSender,
} from '@/contexts/DataContext';
import { BarElement, CategoryScale, Chart, LinearScale } from 'chart.js';
import { ReactNode } from 'react';
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
