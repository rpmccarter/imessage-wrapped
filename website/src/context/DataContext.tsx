import { createContext, useContext } from 'react';

// TODO: define datatype of results
export type DataType = any;

type DataContextType = {
  setData: (data: DataType) => void;
  data?: DataType;
};

export const DataContext = createContext<DataContextType>({
  setData: () => {},
});

DataContext.displayName = 'DataContext';

export const useData = () => {
  return useContext(DataContext);
};
