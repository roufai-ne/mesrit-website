// src/components/ui/grid.jsx
import React from 'react';
import { clsx } from 'clsx';

// Grid Container Component
const Grid = ({
  children,
  className,
  cols = 1,
  sm,
  md,
  lg,
  xl,
  gap = 4,
  gapX,
  gapY,
  autoRows,
  autoFlow,
  placeItems,
  ...props
}) => {
  // Generate responsive grid classes
  const gridClasses = clsx(
    'grid',
    
    // Base columns
    `grid-cols-${cols}`,
    
    // Responsive columns
    sm && `sm:grid-cols-${sm}`,
    md && `md:grid-cols-${md}`,
    lg && `lg:grid-cols-${lg}`,
    xl && `xl:grid-cols-${xl}`,
    
    // Gap classes
    gapX !== undefined && gapY !== undefined 
      ? `gap-x-${gapX} gap-y-${gapY}`
      : `gap-${gap}`,
    
    // Auto rows
    autoRows && `auto-rows-${autoRows}`,
    
    // Grid flow
    autoFlow && `grid-flow-${autoFlow}`,
    
    // Place items
    placeItems && `place-items-${placeItems}`,
    
    className
  );

  return (
    <div className={gridClasses} {...props}>
      {children}
    </div>
  );
};

// Grid Item Component
const GridItem = ({
  children,
  className,
  colSpan = 1,
  colStart,
  colEnd,
  rowSpan = 1,
  rowStart,
  rowEnd,
  sm,
  md,
  lg,
  xl,
  placeSelf,
  ...props
}) => {
  const itemClasses = clsx(
    // Column span
    colSpan && `col-span-${colSpan}`,
    
    // Column start/end
    colStart && `col-start-${colStart}`,
    colEnd && `col-end-${colEnd}`,
    
    // Row span
    rowSpan && `row-span-${rowSpan}`,
    
    // Row start/end
    rowStart && `row-start-${rowStart}`,
    rowEnd && `row-end-${rowEnd}`,
    
    // Responsive column spans
    sm?.colSpan && `sm:col-span-${sm.colSpan}`,
    sm?.colStart && `sm:col-start-${sm.colStart}`,
    sm?.colEnd && `sm:col-end-${sm.colEnd}`,
    
    md?.colSpan && `md:col-span-${md.colSpan}`,
    md?.colStart && `md:col-start-${md.colStart}`,
    md?.colEnd && `md:col-end-${md.colEnd}`,
    
    lg?.colSpan && `lg:col-span-${lg.colSpan}`,
    lg?.colStart && `lg:col-start-${lg.colStart}`,
    lg?.colEnd && `lg:col-end-${lg.colEnd}`,
    
    xl?.colSpan && `xl:col-span-${xl.colSpan}`,
    xl?.colStart && `xl:col-start-${xl.colStart}`,
    xl?.colEnd && `xl:col-end-${xl.colEnd}`,
    
    // Place self
    placeSelf && `place-self-${placeSelf}`,
    
    className
  );

  return (
    <div className={itemClasses} {...props}>
      {children}
    </div>
  );
};

// Flexbox Container Component for alternative layout
const Flex = ({
  children,
  className,
  direction = 'row',
  wrap = false,
  justify = 'start',
  align = 'stretch',
  gap = 0,
  sm,
  md,
  lg,
  xl,
  ...props
}) => {
  const flexClasses = clsx(
    'flex',
    
    // Direction
    `flex-${direction}`,
    
    // Wrap
    wrap && 'flex-wrap',
    
    // Justify content
    justify !== 'start' && `justify-${justify}`,
    
    // Align items
    align !== 'stretch' && `items-${align}`,
    
    // Gap
    gap > 0 && `gap-${gap}`,
    
    // Responsive modifications
    sm?.direction && `sm:flex-${sm.direction}`,
    sm?.justify && `sm:justify-${sm.justify}`,
    sm?.align && `sm:items-${sm.align}`,
    sm?.gap !== undefined && `sm:gap-${sm.gap}`,
    
    md?.direction && `md:flex-${md.direction}`,
    md?.justify && `md:justify-${md.justify}`,
    md?.align && `md:items-${md.align}`,
    md?.gap !== undefined && `md:gap-${md.gap}`,
    
    lg?.direction && `lg:flex-${lg.direction}`,
    lg?.justify && `lg:justify-${lg.justify}`,
    lg?.align && `lg:items-${lg.align}`,
    lg?.gap !== undefined && `lg:gap-${lg.gap}`,
    
    xl?.direction && `xl:flex-${xl.direction}`,
    xl?.justify && `xl:justify-${xl.justify}`,
    xl?.align && `xl:items-${xl.align}`,
    xl?.gap !== undefined && `xl:gap-${xl.gap}`,
    
    className
  );

  return (
    <div className={flexClasses} {...props}>
      {children}
    </div>
  );
};

// Container Component with responsive max-widths
const Container = ({
  children,
  className,
  size = 'default',
  padding = true,
  center = true,
  ...props
}) => {
  const sizeClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    default: 'max-w-7xl',
    full: 'max-w-full',
  };

  const containerClasses = clsx(
    sizeClasses[size],
    center && 'mx-auto',
    padding && 'px-4 sm:px-6 lg:px-8',
    className
  );

  return (
    <div className={containerClasses} {...props}>
      {children}
    </div>
  );
};

// Responsive Stack Component
const Stack = ({
  children,
  className,
  space = 4,
  sm,
  md,
  lg,
  xl,
  horizontal = false,
  ...props
}) => {
  const stackClasses = clsx(
    'flex',
    horizontal ? 'flex-row' : 'flex-col',
    
    // Spacing
    horizontal 
      ? `space-x-${space}` 
      : `space-y-${space}`,
    
    // Responsive spacing
    sm !== undefined && (horizontal 
      ? `sm:space-x-${sm}` 
      : `sm:space-y-${sm}`),
    md !== undefined && (horizontal 
      ? `md:space-x-${md}` 
      : `md:space-y-${md}`),
    lg !== undefined && (horizontal 
      ? `lg:space-x-${lg}` 
      : `lg:space-y-${lg}`),
    xl !== undefined && (horizontal 
      ? `xl:space-x-${xl}` 
      : `xl:space-y-${xl}`),
    
    className
  );

  return (
    <div className={stackClasses} {...props}>
      {children}
    </div>
  );
};

// Responsive Show/Hide Components
const Show = ({
  children,
  above,
  below,
  only,
  className,
  ...props
}) => {
  const breakpoints = ['sm', 'md', 'lg', 'xl', '2xl'];
  
  let showClasses = [];
  
  if (above) {
    const index = breakpoints.indexOf(above);
    if (index !== -1) {
      showClasses.push('hidden');
      showClasses.push(`${above}:block`);
    }
  }
  
  if (below) {
    const index = breakpoints.indexOf(below);
    if (index !== -1) {
      showClasses.push('block');
      showClasses.push(`${below}:hidden`);
    }
  }
  
  if (only) {
    showClasses.push('hidden');
    if (Array.isArray(only)) {
      only.forEach(bp => {
        showClasses.push(`${bp}:block`);
        const nextIndex = breakpoints.indexOf(bp) + 1;
        if (nextIndex < breakpoints.length) {
          showClasses.push(`${breakpoints[nextIndex]}:hidden`);
        }
      });
    } else {
      showClasses.push(`${only}:block`);
    }
  }

  return (
    <div className={clsx(showClasses, className)} {...props}>
      {children}
    </div>
  );
};

// Aspect Ratio Component
const AspectRatio = ({
  children,
  ratio = '16/9',
  className,
  ...props
}) => {
  const aspectClasses = clsx(
    'relative',
    `aspect-${ratio}`,
    className
  );

  return (
    <div className={aspectClasses} {...props}>
      <div className="absolute inset-0">
        {children}
      </div>
    </div>
  );
};

// Responsive Utilities Hook
import { useState, useEffect } from 'react';

export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState('');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint('base');
      else if (width < 768) setBreakpoint('sm');
      else if (width < 1024) setBreakpoint('md');
      else if (width < 1280) setBreakpoint('lg');
      else if (width < 1536) setBreakpoint('xl');
      else setBreakpoint('2xl');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    breakpoint,
    isBase: breakpoint === 'base',
    isSm: breakpoint === 'sm',
    isMd: breakpoint === 'md',
    isLg: breakpoint === 'lg',
    isXl: breakpoint === 'xl',
    is2Xl: breakpoint === '2xl',
    isMobile: ['base', 'sm'].includes(breakpoint),
    isTablet: breakpoint === 'md',
    isDesktop: ['lg', 'xl', '2xl'].includes(breakpoint),
  };
};

export { 
  Grid, 
  GridItem, 
  Flex, 
  Container, 
  Stack, 
  Show, 
  AspectRatio 
};