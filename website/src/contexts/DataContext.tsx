import { createContext, useContext } from 'react';
import { ResultJawn } from '../../../backend/src/queryManager';
export type {
  ResultJawn,
  TextsSentSummary,
  TopSender,
  DayOfWeek,
  MessagesPerDay,
  TopFriends,
  TopFriend,
  TopWordsPerFriend,
  Message,
  WordCount,
} from '../../../backend/src/queryManager';

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
