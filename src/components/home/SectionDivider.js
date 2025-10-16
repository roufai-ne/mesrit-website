import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { clsx } from 'clsx';
import FloatingParticles from './FloatingParticles';

export default function SectionDivider({ 
  variant = 'gradient', 
  height = 'h-8', 
  className = '',
  showPattern = true 
}) {
  const { isDark } = useTheme();

  const variants = {
    gradient: clsx(
      'relative overflow-hidden',
      isDark 
        ? 'bg-gradient-to-r from-niger-green/15 via-niger-orange/15 to-niger-green/15' 
        : 'bg-gradient-to-r from-gray-50 via-niger-orange/10 to-gray-50'
    ),
    wave: clsx(
      'relative overflow-hidden',
      isDark 
        ? 'bg-gradient-to-r from-niger-green/20 to-niger-orange/20' 
        : 'bg-gradient-to-r from-gray-50 via-niger-orange/10 to-gray-50'
    ),
    line: clsx(
      'relative',
      isDark 
        ? 'bg-gradient-to-r from-transparent via-niger-orange/40 to-transparent' 
        : 'bg-gradient-to-r from-transparent via-niger-orange/30 to-transparent'
    ),
    geometric: clsx(
      'relative overflow-hidden',
      isDark 
        ? 'bg-gradient-to-br from-niger-green/15 to-niger-orange/15' 
        : 'bg-gradient-to-br from-gray-50 via-niger-orange/10 to-gray-50'
    )
  };

  const patterns = {
    gradient: (
      <div className="absolute inset-0">
        <div className={clsx(
          'absolute top-0 left-0 w-full h-full',
          isDark 
            ? 'bg-gradient-to-r from-transparent via-niger-orange/10 to-transparent' 
            : 'bg-gradient-to-r from-transparent via-niger-orange/5 to-transparent'
        )} />
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-niger-orange/30 to-transparent transform -translate-y-1/2" />
      </div>
    ),
    wave: (
      <div className="absolute inset-0">
        <svg className="w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path 
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
            className={clsx(
              'opacity-20',
              isDark ? 'fill-niger-orange' : 'fill-niger-green'
            )}
          />
        </svg>
      </div>
    ),
    line: (
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-niger-orange/40 to-transparent transform -translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-niger-orange rounded-full transform -translate-x-1/2 -translate-y-1/2" />
      </div>
    ),
    geometric: (
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-niger-orange/30 transform rotate-45" />
        <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-niger-green/30 transform -rotate-45" />
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-niger-orange rounded-full transform -translate-x-1/2 -translate-y-1/2" />
      </div>
    )
  };

  return (
    <div className={clsx(
      variants[variant],
      height,
      className
    )}>
      {/* Particules flottantes */}
      <FloatingParticles count={5} size="xs" opacity="low" />
      
      {showPattern && patterns[variant]}
      
      {/* Ligne de séparation centrale */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-niger-orange/20 to-transparent transform -translate-y-1/2" />
      
      {/* Points décoratifs */}
      <div className="absolute top-1/2 left-1/4 w-1.5 h-1.5 bg-niger-orange/70 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-niger-green/70 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
    </div>
  );
}
