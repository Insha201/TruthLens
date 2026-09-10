import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppTheme, UITransitionMode } from '../types';

interface ThemeContextType {
  theme: AppTheme;
  toggleTheme: () => void;
  setTheme: (t: AppTheme) => void;
  uiTransition: UITransitionMode;
  setUITransition: (mode: UITransitionMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const defaultThemeContext: ThemeContextType = {
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
  uiTransition: 'kinetic',
  setUITransition: () => {},
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const existingContext = useContext(ThemeContext);
  if (existingContext) {
    return <>{children}</>;
  }

  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem('containment_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // ignore storage errors
    }
    return 'dark'; // default security ops dark mode
  });

  const [uiTransition, setUITransitionState] = useState<UITransitionMode>(() => {
    try {
      const saved = localStorage.getItem('containment_ui_transition');
      if (saved === 'kinetic' || saved === 'smooth' || saved === 'cyber' || saved === 'discrete') {
        return saved;
      }
    } catch {
      // ignore storage errors
    }
    return 'kinetic';
  });

  useEffect(() => {
    try {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
      localStorage.setItem('containment_theme', theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem('containment_ui_transition', uiTransition);
    } catch {
      // ignore storage errors
    }
  }, [uiTransition]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
  };

  const setUITransition = (mode: UITransitionMode) => {
    setUITransitionState(mode);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        uiTransition,
        setUITransition,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    return defaultThemeContext;
  }
  return context;
};
