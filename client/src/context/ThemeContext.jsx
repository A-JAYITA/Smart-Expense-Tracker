import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // Read persisted preference from localStorage (default: 'dark')
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('smt-theme') || 'dark';
  });

  useEffect(() => {
    // Apply theme attribute to document root for CSS variable switching
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('smt-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
