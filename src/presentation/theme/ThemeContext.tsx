import React, { createContext, useContext, useState } from 'react';
import { AppTheme } from './types';
import { DarkTheme } from './darkTheme';
import { LightTheme } from './lightTheme';

type ThemeType = 'dark' | 'light';

interface ThemeContextType {
  theme: AppTheme;
  themeType: ThemeType;
  setThemeType: (type: ThemeType) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeType, setThemeType] = useState<ThemeType>('dark'); // Dark theme by default (brand identity)
  const theme = themeType === 'dark' ? DarkTheme : LightTheme;

  const toggleTheme = () => {
    setThemeType(themeType === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, themeType, setThemeType, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};
export { AppTheme };
