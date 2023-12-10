export type TextsSentSummary = {
  total_texts_sent: number;
  first_text_date: string;
  last_text_date: string;
};

export type TopSender = {
  id: string;
  messages_sent: number;
};

export type MonthOfYear =
  | 'January'
  | 'February'
  | 'March'
  | 'April'
  | 'May'
  | 'June'
  | 'July'
  | 'August'
  | 'September'
  | 'October'
  | 'November'
  | 'December';

export type TopMonths = Record<MonthOfYear, number>;

export type TopFriends = Record<string, TopFriend>;

export type TopFriend = {
  message_count: number;
  top_word_count: WordCount;
  top_emojis: WordCount;
};

export type TopWordsPerFriend = {
  id: string;
  wordCount: WordCount[];
};

export type WordCount = Record<string, number>;

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
