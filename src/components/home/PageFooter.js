import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { clsx } from 'clsx';
import FloatingParticles from './FloatingParticles';

export default function PageFooter() {
  const { isDark } = useTheme();

  return (
    <div className="relative">
      {/* Séparateur principal */}
      <div className={clsx(
        'relative overflow-hidden',
        isDark 
          ? 'bg-gradient-to-r from-niger-green/15 via-niger-orange/15 to-niger-green/15' 
          : 'bg-gradient-to-r from-gray-50 via-niger-orange/10 to-gray-50'
      )}>
        {/* Particules flottantes */}
        <FloatingParticles count={6} size="xs" opacity="medium" />
        
        <div className="h-1.5 flex items-center justify-center">
          {/* Motif central */}
          <div className="flex items-center space-x-2">
            <div className="w-4 h-px bg-gradient-to-r from-transparent to-niger-orange/50" />
            <div className="w-1 h-1 bg-niger-orange rounded-full" />
            <div className="w-1 h-1 bg-niger-green rounded-full" />
            <div className="w-1 h-1 bg-niger-orange rounded-full" />
            <div className="w-4 h-px bg-gradient-to-l from-transparent to-niger-orange/50" />
          </div>
        </div>
      </div>
      
      {/* Séparateur secondaire */}
      <div className={clsx(
        'relative overflow-hidden',
        isDark 
          ? 'bg-gradient-to-r from-niger-green/10 via-niger-orange/10 to-niger-green/10' 
          : 'bg-gradient-to-r from-gray-50 via-niger-green/10 to-gray-50'
      )}>
        {/* Particules flottantes */}
        <FloatingParticles count={4} size="xs" opacity="medium" />
        
        <div className="h-1.5 flex items-center justify-center">
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-niger-green/50 to-transparent" />
        </div>
      </div>
      
      {/* Bordure finale */}
      <div className={clsx(
        'h-px',
        isDark 
          ? 'bg-gradient-to-r from-niger-green/30 via-niger-orange/30 to-niger-green/30' 
          : 'bg-gradient-to-r from-niger-green/20 via-niger-orange/20 to-niger-green/20'
      )} />
    </div>
  );
}
