// components/layout/Footer.js - VERSION REFACTORÉE
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import FooterNewsletter from './FooterNewsletter';
import FooterLinks from './FooterLinks';
import FooterBottom from './FooterBottom';

/**
 * Footer Principal - Version Refactorée
 *
 * Divisé en 3 composants pour améliorer la maintenabilité:
 * - FooterNewsletter: Section inscription newsletter
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
      {/* Section Newsletter */}
      <FooterNewsletter isDark={isDark} />

      {/* Section Liens */}
      <FooterLinks />

      {/* Section Bas de page */}
      <FooterBottom />
    </footer>
  );
}
