import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { clsx } from 'clsx';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Composant Breadcrumbs pour améliorer la navigation
 * @param {Array} items - Tableau d'objets {label, path}
 * @example
 * <Breadcrumbs items={[
 *   { label: 'Accueil', path: '/' },
 *   { label: 'Ministère', path: '/ministere' },
 *   { label: 'Direction', path: '/ministere/direction' }
 * ]} />
 */
export default function Breadcrumbs({ items = [] }) {
  const { isDark } = useTheme();

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Fil d'Ariane"
      className={clsx(
        'py-3 px-4 rounded-xl border-2 mb-6',
        isDark
          ? 'bg-gray-800/50 border-gray-700'
          : 'bg-gray-50/50 border-gray-200'
      )}
    >
      <ol className="flex flex-wrap items-center space-x-2 text-sm">
        {/* Home icon pour le premier élément */}
        <li className="flex items-center">
          <Link
            href="/"
            className={clsx(
              'flex items-center space-x-1 px-2 py-1 rounded-lg transition-all duration-200 hover:scale-105',
              isDark
                ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            )}
            aria-label="Retour à l'accueil"
          >
            <Home className="w-4 h-4" style={{ color: '#ff8c00' }} />
            <span className="font-medium">Accueil</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={index}>
              {/* Séparateur */}
              <li aria-hidden="true">
                <ChevronRight
                  className={clsx(
                    'w-4 h-4',
                    isDark ? 'text-gray-600' : 'text-gray-400'
                  )}
                />
              </li>

              {/* Item */}
              <li className="flex items-center">
                {isLast ? (
                  // Dernier élément (page actuelle) - non cliquable
                  <span
                    className={clsx(
                      'px-3 py-1 rounded-lg font-bold',
                      isDark
                        ? 'text-white bg-gradient-to-r from-orange-500/20 to-green-500/20 border-2 border-orange-500/40'
                        : 'text-gray-900 bg-gradient-to-r from-orange-100 to-green-100 border-2 border-orange-300'
                    )}
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  // Éléments intermédiaires - cliquables
                  <Link
                    href={item.path}
                    className={clsx(
                      'px-2 py-1 rounded-lg font-medium transition-all duration-200 hover:scale-105',
                      isDark
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
