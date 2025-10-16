// src/components/ui/Pagination.jsx
import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { clsx } from 'clsx';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  itemsPerPage, 
  totalItems,
  className 
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={clsx('flex flex-col sm:flex-row items-center justify-between gap-4', className)}>
      {/* Informations sur les éléments */}
      <div className="text-sm text-readable-muted dark:text-muted-foreground">
        Affichage de <span className="font-medium text-niger-green dark:text-niger-green-light">{startItem}</span> à{' '}
        <span className="font-medium text-niger-green dark:text-niger-green-light">{endItem}</span> sur{' '}
        <span className="font-medium text-niger-green dark:text-niger-green-light">{totalItems}</span> établissements
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-1">
        {/* Bouton précédent */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={clsx(
            'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300',
            currentPage === 1
              ? 'text-readable-muted dark:text-muted-foreground cursor-not-allowed'
              : 'text-niger-green dark:text-niger-green-light hover:bg-niger-orange/10 dark:hover:bg-niger-orange/20'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Précédent</span>
        </button>

        {/* Numéros de page */}
        <div className="flex items-center gap-1">
          {visiblePages.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-readable-muted dark:text-muted-foreground">
                  <MoreHorizontal className="w-4 h-4" />
                </span>
              ) : (
                <button
                  onClick={() => onPageChange(page)}
                  className={clsx(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300',
                    page === currentPage
                      ? 'bg-gradient-to-r from-niger-orange to-niger-green text-white shadow-md'
                      : 'text-niger-green dark:text-niger-green-light hover:bg-niger-orange/10 dark:hover:bg-niger-orange/20'
                  )}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Bouton suivant */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={clsx(
            'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300',
            currentPage === totalPages
              ? 'text-readable-muted dark:text-muted-foreground cursor-not-allowed'
              : 'text-niger-green dark:text-niger-green-light hover:bg-niger-orange/10 dark:hover:bg-niger-orange/20'
          )}
        >
          <span className="hidden sm:inline">Suivant</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;