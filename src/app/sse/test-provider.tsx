import React, { createContext, useContext, useState } from 'react';

interface TestContextState {
  value: string;
}

interface TestContextAction extends TestContextState {
  setValue: React.Dispatch<React.SetStateAction<string>>;
}

const TestContext = createContext<TestContextAction | undefined>(undefined);

interface TestProviderProps {
  children: React.ReactNode;
}

export const TestProvider: React.FC<TestProviderProps> = ({ children }: TestProviderProps) => {
  const [value, setValue] = useState<string>('');
  return <TestContext.Provider value={{ value, setValue }}>{children}</TestContext.Provider>;
};

export const useTestContext = () => {
  const context = useContext(TestContext);
  if (!context) {
    throw new Error('useTestContext must be used within a TestProvider');
  }
  return context;
};