import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { clsx } from 'clsx';
import FloatingParticles from './FloatingParticles';

export default function SectionContainer({ 
  children, 
  variant = 'light', 
  className = '',
  showDivider = true,
  dividerVariant = 'gradient'
}) {
  const { isDark } = useTheme();

  const variants = {
    light: clsx(
      isDark 
        ? 'bg-gradient-to-b from-niger-green/10 to-niger-orange/10' 
        : 'bg-white'
    ),
    dark: clsx(
      isDark 
        ? 'bg-gradient-to-b from-niger-green/20 to-niger-orange/20' 
        : 'bg-gray-50'
    ),
    gradient: clsx(
      isDark 
        ? 'bg-gradient-to-br from-niger-green/15 via-niger-orange/15 to-niger-green/15' 
        : 'bg-gradient-to-br from-gray-50 via-niger-green/5 to-gray-50'
    ),
    accent: clsx(
      isDark 
        ? 'bg-gradient-to-br from-niger-orange/20 to-niger-green/20' 
        : 'bg-gradient-to-br from-niger-orange/5 to-niger-green/5'
    ),
    glass: clsx(
      isDark 
        ? 'bg-white/5 backdrop-blur-sm' 
        : 'bg-white/80 backdrop-blur-sm'
    )
  };

  return (
    <>
      <section className={clsx(
        'relative',
        variants[variant],
        className
      )}>
        {/* Bordure supérieure décorative */}
        <div className={clsx(
          'absolute top-0 left-0 w-full h-px',
          isDark 
            ? 'bg-gradient-to-r from-niger-green/40 via-niger-orange/40 to-niger-green/40' 
            : 'bg-gradient-to-r from-niger-green/20 via-niger-orange/20 to-niger-green/20'
        )} />
        
        {/* Contenu de la section */}
        <div className="relative z-10">
          {children}
        </div>
        
        {/* Bordure inférieure décorative */}
        <div className={clsx(
          'absolute bottom-0 left-0 w-full h-px',
          isDark 
            ? 'bg-gradient-to-r from-niger-green/40 via-niger-orange/40 to-niger-green/40' 
            : 'bg-gradient-to-r from-niger-green/20 via-niger-orange/20 to-niger-green/20'
        )} />
      </section>
      
      {/* Séparateur optionnel */}
      {showDivider && (
        <div className={clsx(
          'relative overflow-hidden',
          isDark 
            ? 'bg-gradient-to-r from-niger-green/15 via-niger-orange/15 to-niger-green/15' 
            : 'bg-gradient-to-r from-gray-50 via-niger-orange/10 to-gray-50'
        )}>
          {/* Particules flottantes */}
          <FloatingParticles count={6} size="xs" opacity="medium" />
          
          <div className="h-1.5 flex items-center justify-center">
            <div className="w-6 h-px bg-gradient-to-r from-transparent via-niger-orange/50 to-transparent" />
            <div className="w-1 h-1 bg-niger-orange rounded-full mx-1" />
            <div className="w-6 h-px bg-gradient-to-r from-transparent via-niger-orange/50 to-transparent" />
          </div>
        </div>
      )}
    </>
  );
}
