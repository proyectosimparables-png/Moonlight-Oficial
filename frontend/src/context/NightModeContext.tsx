"use client";

import { createContext, useContext, useState } from "react";

interface NightModeContextType {
  isNight: boolean;
  setIsNight: (value: boolean) => void;
}

const NightModeContext = createContext<NightModeContextType>({
  isNight: false,
  setIsNight: () => {},
});

export const NightModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isNight, setIsNight] = useState(false);

  return (
    <NightModeContext.Provider value={{ isNight, setIsNight }}>
      {children}
    </NightModeContext.Provider>
  );
};

export const useNightMode = () => useContext(NightModeContext);
