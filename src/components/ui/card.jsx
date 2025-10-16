// src/components/ui/card.jsx
import React from 'react';
import { clsx } from 'clsx';
import { useAccessibleIds } from '@/lib/accessibility';

const cardVariants = {
  variant: {
    default: 'bg-niger-green-glass dark:bg-niger-dark-glass border border-niger-orange/30 dark:border-niger-orange/50 shadow-glass backdrop-blur-md',
    elevated: 'bg-niger-green-glass dark:bg-niger-dark-glass shadow-glass hover:shadow-neumorph dark:shadow-neumorph-dark border border-niger-orange/30 dark:border-niger-orange/50 backdrop-blur-md',
    outlined: 'bg-transparent border-2 border-niger-orange/50 dark:border-niger-orange/60 shadow-none backdrop-blur-sm',
    filled: 'bg-niger-orange-glass dark:bg-niger-orange-glass/20 border border-niger-orange/40 dark:border-niger-orange/60 shadow-soft backdrop-blur-md',
    gradient: 'bg-gradient-to-br from-niger-green-glass to-niger-orange-glass dark:from-niger-dark-glass dark:to-niger-orange-glass/30 border border-niger-orange/30 dark:border-niger-orange/50 shadow-glass backdrop-blur-md',
    glass: 'bg-niger-white-glass dark:bg-niger-dark-glass border border-white/30 dark:border-white/10 shadow-glass backdrop-blur-lg',
    neumorph: 'bg-niger-green-glass dark:bg-niger-dark-glass shadow-neumorph dark:shadow-neumorph-dark border border-niger-orange/20 dark:border-niger-orange/40 backdrop-blur-md',
  },
  padding: {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  },
  radius: {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
  },
};

const Card = React.forwardRef(({
  children,
  className,
  variant = 'default',
  padding = 'md',
  radius = 'lg',
  hover = false,
  // Accessibility props
  as: Component = 'div',
  role,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  tabIndex,
  onClick,
  onKeyDown,
  interactive = false,
  ...props
}, ref) => {
  const ids = useAccessibleIds('card');
  const isInteractive = interactive || onClick || hover;
  
  // Handle keyboard interactions for interactive cards
  const handleKeyDown = (e) => {
    if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
      if (onClick) {
        e.preventDefault();
        onClick(e);
      }
    }
    
    if (onKeyDown) {
      onKeyDown(e);
    }
  };
  
  return (
    <Component
      ref={ref}
      role={role || (isInteractive ? 'button' : undefined)}
      tabIndex={isInteractive ? (tabIndex ?? 0) : tabIndex}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-describedby={ariaDescribedby}
      className={clsx(
        // Base styles
        'transition-all duration-300 ease-in-out',
        
        // Variant styles
        cardVariants.variant[variant],
        
        // Padding styles
        cardVariants.padding[padding],
        
        // Radius styles
        cardVariants.radius[radius],
        
        // Interactive styles
        isInteractive && [
          'focus:outline-none focus:ring-3 focus:ring-primary-500/20 focus:ring-offset-2',
          'cursor-pointer',
          hover && 'hover-lift'
        ],
        
        // Custom className
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
});

Card.displayName = 'Card';

const CardHeader = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={clsx(
        'flex flex-col space-y-1.5 pb-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef(({
  children,
  className,
  as: Component = 'h3',
  level = 3,
  id,
  ...props
}, ref) => {
  const ids = useAccessibleIds('card-title');
  const titleId = id || ids.label;
  
  // Ensure proper heading hierarchy
  const HeadingComponent = Component === 'h3' ? `h${Math.max(1, Math.min(6, level))}` : Component;
  
  return (
    <HeadingComponent
      ref={ref}
      id={titleId}
      className={clsx(
        'text-xl font-semibold leading-none tracking-tight text-secondary-900 dark:text-secondary-100',
        className
      )}
      {...props}
    >
      {children}
    </HeadingComponent>
  );
});

CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef(({
  children,
  className,
  id,
  ...props
}, ref) => {
  const ids = useAccessibleIds('card-description');
  const descriptionId = id || ids.description;
  
  return (
    <p
      ref={ref}
      id={descriptionId}
      className={clsx(
        'text-sm text-secondary-600 dark:text-secondary-400 leading-relaxed',
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
});

CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={clsx(
        'flex-1',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef(({
  children,
  className,
  as: Component = 'div',
  role = 'contentinfo',
  ...props
}, ref) => {
  return (
    <Component
      ref={ref}
      role={role}
      className={clsx(
        'flex items-center justify-between pt-4',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
});

CardFooter.displayName = 'CardFooter';

export { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  cardVariants
};