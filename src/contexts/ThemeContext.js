// src/contexts/ThemeContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
  systemPreference: 'light',
  isDark: false,
  isLight: false,
  isSystem: false,
});

const THEME_STORAGE_KEY = 'mesrit-theme-preference';

export function ThemeProvider({ children, defaultTheme = 'system' }) {
  const [theme, setTheme] = useState(defaultTheme);
  const [systemPreference, setSystemPreference] = useState('light');
  const [mounted, setMounted] = useState(false);

  // Detect system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemPreference(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Load saved theme preference
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
    }
    setMounted(true);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const effectiveTheme = theme === 'system' ? systemPreference : theme;

    // Remove previous theme classes
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(effectiveTheme);
    
    // Set data attribute for CSS targeting
    root.setAttribute('data-theme', effectiveTheme);
    
    // Set color-scheme property for native form controls
    root.style.colorScheme = effectiveTheme;

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content', 
        effectiveTheme === 'dark' ? '#1f2937' : '#ffffff'
      );
    }
  }, [theme, systemPreference, mounted]);

  // Save theme preference
  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  };

  const toggleTheme = () => {
    if (theme === 'light') {
      updateTheme('dark');
    } else if (theme === 'dark') {
      updateTheme('system');
    } else {
      updateTheme('light');
    }
  };

  const resolvedTheme = theme === 'system' ? systemPreference : theme;

  const contextValue = {
    theme,
    setTheme: updateTheme,
    toggleTheme,
    systemPreference,
    resolvedTheme,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    isSystem: theme === 'system',
    mounted,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Higher-order component for theme-aware components
export function withTheme(Component) {
  return function ThemedComponent(props) {
    const theme = useTheme();
    return <Component {...props} theme={theme} />;
  };
}

// Custom hook for theme-aware styles
export function useThemeAwareStyles(lightStyles, darkStyles) {
  const { isDark } = useTheme();
  return isDark ? darkStyles : lightStyles;
}

// Theme-aware class name utility (for use in components with theme context)
export function getThemeClasses(theme, baseClasses, lightClasses = '', darkClasses = '') {
  const isDark = theme?.isDark || false;
  const mounted = theme?.mounted || false;
  
  if (!mounted) {
    // Return base classes during SSR/initial render
    return baseClasses;
  }
  
  return `${baseClasses} ${isDark ? darkClasses : lightClasses}`.trim();
}

// Custom hook version of theme classes utility
export function useThemeClasses(baseClasses, lightClasses = '', darkClasses = '') {
  const { isDark, mounted } = useTheme();
  
  if (!mounted) {
    // Return base classes during SSR/initial render
    return baseClasses;
  }
  
  return `${baseClasses} ${isDark ? darkClasses : lightClasses}`.trim();
}

export default ThemeContext;