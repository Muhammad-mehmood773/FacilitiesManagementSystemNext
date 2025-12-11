import { createContext, useContext } from 'react';

export type LayoutContextType = {
  roleId: string;
};

export const LayoutContext = createContext<LayoutContextType>({ roleId: '' });

export const useLayoutContext = () => useContext(LayoutContext);
