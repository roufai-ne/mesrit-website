// src/components/ui/theme-toggle.jsx
import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Sun, Moon, Monitor, Palette } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAccessibleIds, useReducedMotion } from '@/lib/accessibility';
import { Button } from './button';

const themeOptions = [
  {
    value: 'light',
    label: 'Mode clair',
    icon: Sun,
    description: 'Utiliser le thème clair'
  },
  {
    value: 'dark',
    label: 'Mode sombre',
    icon: Moon,
    description: 'Utiliser le thème sombre'
  },
  {
    value: 'system',
    label: 'Système',
    icon: Monitor,
    description: 'Suivre les préférences du système'
  }
];

// Simple toggle button (light/dark only)
export function ThemeToggle({ className, variant = 'ghost', size = 'md', ...props }) {
  const { theme, toggleTheme, isDark, mounted } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  
  if (!mounted) {
    return (
      <Button
        variant={variant}
        size={size}
        className={clsx('opacity-50', className)}
        disabled
        aria-label="Chargement du thème..."
        {...props}
      >
        <Palette className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={clsx(
        'transition-all duration-200',
        !prefersReducedMotion && 'hover:scale-105',
        className
      )}
      aria-label={`Changer le thème (actuellement: ${isDark ? 'sombre' : 'clair'})`}
      {...props}
    >
      {isDark ? (
        <Moon className="w-4 h-4" />
      ) : (
        <Sun className="w-4 h-4" />
      )}
    </Button>
  );
}

// Advanced theme selector with dropdown
export function ThemeSelector({ 
  className, 
  buttonVariant = 'ghost', 
  buttonSize = 'md',
  showLabel = false,
  placement = 'bottom-end',
  ...props 
}) {
  const { theme, setTheme, resolvedTheme, mounted } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const ids = useAccessibleIds('theme-selector');
  const prefersReducedMotion = useReducedMotion();

  const selectedOption = themeOptions.find(option => option.value === theme);
  const SelectedIcon = selectedOption?.icon || Palette;

  // Close dropdown on escape or outside click
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e) => {
      if (!e.target.closest(`[data-theme-selector]`)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  if (!mounted) {
    return (
      <Button
        variant={buttonVariant}
        size={buttonSize}
        className={clsx('opacity-50', className)}
        disabled
        {...props}
      >
        <Palette className="w-4 h-4" />
        {showLabel && <span className="ml-2">Chargement...</span>}
      </Button>
    );
  }

  return (
    <div 
      className="relative" 
      data-theme-selector
      {...props}
    >
      <Button
        variant={buttonVariant}
        size={buttonSize}
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'transition-all duration-200',
          !prefersReducedMotion && 'hover:scale-105',
          className
        )}
        aria-label={`Sélecteur de thème - ${selectedOption?.label || 'Inconnu'}`}
        aria-expanded={isOpen}
        aria-controls={ids.dropdown}
        aria-haspopup="listbox"
      >
        <SelectedIcon className="w-4 h-4" />
        {showLabel && (
          <span className="ml-2">{selectedOption?.label || 'Thème'}</span>
        )}
      </Button>

      {isOpen && (
        <div
          id={ids.dropdown}
          role="listbox"
          aria-label="Options de thème"
          className={clsx(
            'absolute z-50 mt-2 w-48 rounded-lg bg-white dark:bg-secondary-800 shadow-strong border border-secondary-200 dark:border-secondary-700 py-2',
            placement === 'bottom-end' && 'right-0',
            placement === 'bottom-start' && 'left-0',
            placement === 'top-end' && 'right-0 bottom-full mb-2',
            placement === 'top-start' && 'left-0 bottom-full mb-2',
            !prefersReducedMotion && 'animate-scale-in'
          )}
        >
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = theme === option.value;
            const isActive = resolvedTheme === option.value;
            
            return (
              <button
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleThemeChange(option.value)}
                className={clsx(
                  'w-full flex items-center px-4 py-2.5 text-sm transition-colors',
                  'hover:bg-secondary-100 dark:hover:bg-secondary-700',
                  'focus:outline-none focus:bg-secondary-100 dark:focus:bg-secondary-700',
                  isSelected && 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400',
                  !isSelected && 'text-secondary-700 dark:text-secondary-300'
                )}
              >
                <Icon 
                  className={clsx(
                    'w-4 h-4 mr-3',
                    isActive && !prefersReducedMotion && 'animate-pulse-slow'
                  )} 
                />
                <div className="text-left flex-1">
                  <div className="font-medium">{option.label}</div>
                  <div className={clsx(
                    'text-xs',
                    isSelected ? 'text-primary-500 dark:text-primary-400' : 'text-secondary-500 dark:text-secondary-400'
                  )}>
                    {option.description}
                  </div>
                </div>
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-primary-500 dark:bg-primary-400 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Compact theme toggle for mobile/space-constrained areas
export function CompactThemeToggle({ className, ...props }) {
  const { isDark, toggleTheme, mounted } = useTheme();
  const prefersReducedMotion = useReducedMotion();

  if (!mounted) {
    return (
      <button
        className={clsx(
          'p-2 rounded-lg opacity-50 cursor-not-allowed',
          'bg-secondary-100 dark:bg-secondary-800',
          className
        )}
        disabled
        {...props}
      >
        <Palette className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={clsx(
        'p-2 rounded-lg transition-all duration-200',
        'bg-secondary-100 hover:bg-secondary-200 dark:bg-secondary-800 dark:hover:bg-secondary-700',
        'text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-secondary-100',
        'focus:outline-none focus:ring-2 focus:ring-primary-500/20',
        !prefersReducedMotion && 'hover:scale-105 active:scale-95',
        className
      )}
      aria-label={`Basculer vers le mode ${isDark ? 'clair' : 'sombre'}`}
      {...props}
    >
      <div className={clsx(
        'relative w-4 h-4',
        !prefersReducedMotion && 'transition-transform duration-300'
      )}>
        <Sun className={clsx(
          'absolute inset-0 w-4 h-4 transition-all duration-300',
          isDark ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'
        )} />
        <Moon className={clsx(
          'absolute inset-0 w-4 h-4 transition-all duration-300',
          isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'
        )} />
      </div>
    </button>
  );
}

// Theme-aware wrapper component
export function ThemeAware({ children, lightContent, darkContent }) {
  const { isDark, mounted } = useTheme();

  if (!mounted) {
    return children || lightContent;
  }

  if (lightContent && darkContent) {
    return isDark ? darkContent : lightContent;
  }

  return children;
}

export default ThemeToggle;