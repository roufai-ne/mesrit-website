import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { clsx } from 'clsx';

export default function FloatingParticles({ 
  count = 8, 
  size = 'sm',
  opacity = 'low',
  className = '' 
}) {
  const { isDark } = useTheme();
  
  const sizeClasses = {
    xs: 'w-1 h-1',
    sm: 'w-1.5 h-1.5', 
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5'
  };
  
  const opacityClasses = {
    low: isDark ? 'opacity-25' : 'opacity-35',
    medium: isDark ? 'opacity-35' : 'opacity-45',
    high: isDark ? 'opacity-45' : 'opacity-55'
  };
  
  const colors = [
    'bg-niger-orange',
    'bg-niger-green', 
    'bg-niger-orange-light',
    'bg-niger-green-light',
    'bg-niger-orange-dark',
    'bg-niger-green-dark'
  ];
  
  const positions = [
    'top-1/4 left-1/6',
    'top-1/3 right-1/4',
    'top-1/2 left-1/3',
    'top-2/3 right-1/6',
    'top-3/4 left-1/4',
    'top-1/6 right-1/3',
    'top-2/5 left-2/3',
    'top-4/5 right-2/3'
  ];
  
  const animations = [
    'animate-pulse-slow',
    'animate-pulse',
    'animate-bounce-gentle',
    'animate-fade-in'
  ];

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {Array.from({ length: count }).map((_, index) => {
        const color = colors[index % colors.length];
        const position = positions[index % positions.length];
        const animation = animations[index % animations.length];
        
        return (
          <div
            key={index}
            className={clsx(
              'absolute rounded-full',
              sizeClasses[size],
              color,
              opacityClasses[opacity],
              position,
              animation,
              'transition-all duration-3000 ease-in-out'
            )}
            style={{
              animationDelay: `${index * 200}ms`,
              animationDuration: `${3000 + index * 500}ms`
            }}
          />
        );
      })}
    </div>
  );
}
