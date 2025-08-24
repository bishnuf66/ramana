import { useContext, createContext, useState } from "react";

const testContext = createContext({} as any);

export const TestProvider = ({ children }: { children: React.ReactNode }) => {
  const [test, setTest] = useState<number>(0);
  const increaseTest = () => {
    setTest(test + 1);
  };
  const decreaseTest = () => {
    setTest(test - 1);
  };
  return (
    <testContext.Provider value={{ test, setTest, increaseTest, decreaseTest }}>
      {children}
    </testContext.Provider>
  );
};

export const useTestContext = () => {
  const context = useContext(testContext);
  if (!context) {
    throw new Error("useContext must be used within Provider");
  }
  return useContext(testContext);
};
