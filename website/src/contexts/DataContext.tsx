import { createContext, useContext } from 'react';

export type TextsSentSummary = {
  total_texts_sent: number;
  first_text_date: string;
  last_text_date: string;
};

export type TopSender = {
  id: string;
  messages_sent: number;
};

export type DayOfWeek =
  | "Monday"
  | "Sunday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

export type MessagesPerDay = Record<DayOfWeek, number>;

export type MonthOfYear =
  | "January"
  | "February"
  | "March"
  | "April"
  | "May"
  | "June"
  | "July"
  | "August"
  | "September"
  | "October"
  | "November"
  | "December";

export type TopMonths = Record<MonthOfYear, number>;

export type TopFriends = Record<string, TopFriend>;

export type TopFriend = {
  id: string;
  message_count: number;
  top_word_count: WordCount[];
  top_emojis: Emoji[];
};

export type TopWordsPerFriend = {
  id: string;
  wordCount: WordCount[];
};

export type Message = {
  handle_id: number;
  text: string;
};

export type Emoji = {
  emoji: string;
  count: number;
};

export type WordCount = {
  word: string;
  count: number;
};

export type UnbalancedFriend = {
  id: string;
  sent: number;
  received: number;
  ratio: number;
};

export type ResultJawn = {
  textSentSummary: TextsSentSummary;
  topSenders: TopSender[];
  topMonths: TopMonths;
  topFriends: TopFriends;
  unbalancedFriend: UnbalancedFriend;
};

type DataContextType = {
  setData: (data: ResultJawn) => void;
  data?: ResultJawn;
};

export const DataContext = createContext<DataContextType>({
  setData: () => {},
});

DataContext.displayName = 'DataContext';

export const useData = () => {
  return useContext(DataContext);
};
