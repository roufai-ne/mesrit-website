// components/layout/Footer.js - VERSION REFACTORÉE
import React from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/contexts/ThemeContext';
import FooterLinks from './FooterLinks';
import FooterBottom from './FooterBottom';

// Import dynamique sans SSR pour éviter les erreurs d'hydratation
const FooterNewsletter = dynamic(() => import('./FooterNewsletter'), {
  ssr: false,
  loading: () => (
    <div className="py-16 bg-gradient-to-br from-niger-orange/95 via-niger-orange-dark to-niger-green/90">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-8">
            <div className="h-8 bg-white/20 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-white/10 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="space-y-4">
            <div className="h-14 bg-white/20 rounded-xl animate-pulse"></div>
            <div className="h-14 bg-white/20 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  ),
});

/**
 * Footer Principal - Version Refactorée
 *
 * Divisé en 3 composants pour améliorer la maintenabilité:
 * - FooterNewsletter: Section inscription newsletter (client-side only)
 * - FooterLinks: Liens de navigation
 * - FooterBottom: Contact et copyright
 *
 * Ancienne version: 628 lignes (monolithique)
 * Nouvelle version: ~50 lignes (composé)
 */
export default function Footer() {
  const { isDark } = useTheme();

  return (
    <footer className="bg-white dark:bg-secondary-900 border-t border-niger-orange/20 dark:border-niger-orange/30">
      {/* Section Newsletter - Client-side only */}
      <FooterNewsletter isDark={isDark} />

      {/* Section Liens */}
      <FooterLinks />

      {/* Section Bas de page */}
      <FooterBottom />
    </footer>
  );
}
