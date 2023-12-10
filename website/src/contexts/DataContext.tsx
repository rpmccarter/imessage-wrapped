import { ResultJawn } from '@/db/QueryManager';
import { createContext, useContext } from 'react';

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
