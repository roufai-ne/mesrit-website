// src/components/ui/button.jsx
import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';
import { useAccessibleIds, screenReader } from '@/lib/accessibility';

const buttonVariants = {
  variant: {
    primary: 'bg-primary-500 dark:bg-primary-600 text-white hover:bg-primary-600 dark:hover:bg-primary-700 focus:ring-primary-500/20 shadow-colored',
    secondary: 'bg-secondary-100 dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 hover:bg-secondary-200 dark:hover:bg-secondary-700 focus:ring-secondary-500/20 border border-secondary-200 dark:border-secondary-700',
    success: 'bg-success-500 dark:bg-success-600 text-white hover:bg-success-600 dark:hover:bg-success-700 focus:ring-success-500/20',
    warning: 'bg-warning-500 dark:bg-warning-600 text-white hover:bg-warning-600 dark:hover:bg-warning-700 focus:ring-warning-500/20',
    error: 'bg-error-500 dark:bg-error-600 text-white hover:bg-error-600 dark:hover:bg-error-700 focus:ring-error-500/20',
    ghost: 'bg-transparent text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 focus:ring-secondary-500/20',
    outline: 'border-2 border-primary-500 dark:border-primary-400 text-primary-500 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950 focus:ring-primary-500/20',
    neumorph: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-neumorph dark:shadow-neumorph-dark hover:shadow-neumorph-inset active:shadow-neumorph-inset transition-all duration-200',
    'neumorph-primary': 'bg-niger-orange-glass text-niger-orange dark:text-niger-orange-light shadow-neumorph dark:shadow-neumorph-dark hover:shadow-neumorph-inset active:shadow-neumorph-inset transition-all duration-200',
    'neumorph-secondary': 'bg-niger-green-glass text-niger-green dark:text-niger-green-light shadow-neumorph dark:shadow-neumorph-dark hover:shadow-neumorph-inset active:shadow-neumorph-inset transition-all duration-200',
  },
  size: {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  },
  radius: {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-full',
  },
};

const Button = React.forwardRef(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  radius = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  // Accessibility props
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  'aria-pressed': ariaPressed,
  'aria-expanded': ariaExpanded,
  'aria-haspopup': ariaHaspopup,
  'aria-controls': ariaControls,
  loadingText = 'Chargement...',
  ...props
}, ref) => {
  const isDisabled = disabled || loading;
  const ids = useAccessibleIds('button');
  
  // Generate accessible label for loading state
  const accessibleLabel = loading 
    ? `${ariaLabel || children} - ${loadingText}`
    : ariaLabel;
    
  // Handle keyboard interactions
  const handleKeyDown = (e) => {
    // Space and Enter should trigger click for buttons
    if (e.key === ' ' || e.key === 'Enter') {
      if (type === 'button' && onClick && !isDisabled) {
        e.preventDefault();
        onClick(e);
      }
    }
    
    // Call any existing onKeyDown handler
    if (props.onKeyDown) {
      props.onKeyDown(e);
    }
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={accessibleLabel}
      aria-describedby={ariaDescribedby}
      aria-pressed={ariaPressed}
      aria-expanded={ariaExpanded}
      aria-haspopup={ariaHaspopup}
      aria-controls={ariaControls}
      aria-busy={loading}
      aria-disabled={isDisabled}
      role={type === 'button' ? 'button' : undefined}
      className={clsx(
        // Base styles
        'inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out',
        'focus:outline-none focus:ring-3 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'hover-lift',
        
        // High contrast focus for accessibility
        'focus-visible:ring-4 focus-visible:ring-primary-500/50',
        
        // Variant styles
        buttonVariants.variant[variant],
        
        // Size styles
        buttonVariants.size[size],
        
        // Radius styles
        buttonVariants.radius[radius],
        
        // Full width
        fullWidth && 'w-full',
        
        // Custom className
        className
      )}
      {...(props.onKeyDown ? {} : { ...props })}
    >
      {loading && (
        <>
          <Loader2 
            className="w-4 h-4 mr-2 animate-spin" 
            aria-hidden="true"
          />
          <span className="sr-only">{loadingText}</span>
        </>
      )}
      
      {leftIcon && !loading && (
        <span className="mr-2" aria-hidden="true">{leftIcon}</span>
      )}
      
      {children}
      
      {rightIcon && (
        <span className="ml-2" aria-hidden="true">{rightIcon}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants };