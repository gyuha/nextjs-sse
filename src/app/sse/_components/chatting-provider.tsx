import React, { createContext, useContext, useState } from 'react';

interface chattingProviderState {
  value: string;
}

interface chattingProvider extends chattingProviderState {
  setValue: React.Dispatch<React.SetStateAction<string>>;
}

const chattingProvider = createContext<chattingProvider | undefined>(undefined);

interface chattingProviderProps {
  children: React.ReactNode;
}

export const ChattingProvider: React.FC<chattingProviderProps> = ({ children }: chattingProviderProps) => {
  const [value, setValue] = useState<string>('');
  return <chattingProvider.Provider value={{ value, setValue }}>{children}</chattingProvider.Provider>;
};

export const useChattingProvider = () => {
  const context = useContext(chattingProvider);
  if (!context) {
    throw new Error('usechatting-provider must be used within a chatting-provider');
  }
  return context;
};
