// src/utils/themeConstants.js
export const THEME_COLORS = {
  primary: 'niger-orange',
  secondary: 'niger-green',
  accent: 'niger-orange-light',
  
  background: {
    light: 'bg-white',
    dark: 'bg-gray-800',
    muted: 'bg-gray-50',
    mutedDark: 'bg-gray-900'
  },
  
  text: {
    primary: 'text-gray-900 dark:text-white',
    secondary: 'text-gray-700 dark:text-gray-300',
    muted: 'text-gray-600 dark:text-gray-400',
    inverse: 'text-white dark:text-gray-900'
  }
};

export const COMPONENT_STYLES = {
  card: {
    base: 'bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700',
    hover: 'hover:shadow-xl transition-all duration-300',
    padding: 'p-6',
    full: 'bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 p-6'
  },
  
  section: {
    base: 'py-12',
    background: 'bg-gray-50 dark:bg-gray-900',
    container: 'container mx-auto px-6'
  }
};

export const getColorClasses = (color, variant = 'default') => {
  const colorMap = {
    'niger-orange': {
      default: 'bg-niger-orange text-white',
      light: 'bg-niger-orange-light text-niger-orange-dark',
      dark: 'bg-niger-orange-dark text-white'
    },
    'niger-green': {
      default: 'bg-niger-green text-white',
      light: 'bg-niger-green-light text-niger-green-dark',
      dark: 'bg-niger-green-dark text-white'
    },
    'blue': {
      default: 'bg-blue-600 text-white',
      light: 'bg-blue-100 text-blue-800',
      dark: 'bg-blue-800 text-white'
    },
    'green': {
      default: 'bg-emerald-600 text-white',
      light: 'bg-emerald-100 text-emerald-800',
      dark: 'bg-emerald-800 text-white'
    }
  };
  
  return colorMap[color]?.[variant] || colorMap['niger-orange'].default;
};
