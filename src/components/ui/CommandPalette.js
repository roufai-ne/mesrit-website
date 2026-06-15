'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search,
  X,
  Loader2,
  FileText,
  Newspaper,
  Calendar,
  Building2,
  ArrowRight,
  Command,
} from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';

// Pages de navigation rapide
const quickLinks = [
  { title: 'Accueil', url: '/', type: 'page', category: 'Navigation' },
  { title: 'Actualités', url: '/actualites', type: 'page', category: 'Navigation' },
  { title: 'Établissements', url: '/etablissements', type: 'page', category: 'Navigation' },
  { title: 'Services', url: '/services', type: 'page', category: 'Navigation' },
  { title: 'Le Ministère', url: '/ministere', type: 'page', category: 'Navigation' },
  { title: 'Contact', url: '/contact', type: 'page', category: 'Navigation' },
];

const typeIcons = {
  news: Newspaper,
  document: FileText,
  event: Calendar,
  establishment: Building2,
  page: ArrowRight,
};

function ResultItem({ item, isSelected, onClick }) {
  const Icon = typeIcons[item.type] || FileText;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors duration-100 rounded-lg
        ${isSelected
          ? 'bg-niger-orange/10 dark:bg-niger-orange/15 text-niger-orange'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      aria-selected={isSelected}
      role="option"
    >
      <div className={`mt-0.5 p-1.5 rounded-md flex-shrink-0
        ${isSelected ? 'bg-niger-orange/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{item.title}</div>
        {item.category && (
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{item.category}</div>
        )}
      </div>
      {isSelected && <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-niger-orange" aria-hidden="true" />}
    </button>
  );
}

export default function CommandPalette({ isOpen, onClose }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const { results: searchResults, isSearching } = useSearch(query, 250);

  const items = query.trim()
    ? searchResults
    : quickLinks;

  const navigateTo = useCallback((item) => {
    const url = item.url || (item._id ? `/actualites/${item._id}` : '/');
    router.push(url);
    onClose();
  }, [router, onClose]);

  // Focus input à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Navigation clavier
  useEffect(() => {
    if (!isOpen) return;

    const handler = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, items.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && items[selectedIndex]) {
        e.preventDefault();
        navigateTo(items[selectedIndex]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, items, selectedIndex, navigateTo, onClose]);

  // Scroll l'item sélectionné dans la vue
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const selected = list.querySelector('[aria-selected="true"]');
    selected?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // Reset selectedIndex quand les résultats changent
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }}
            exit={{ opacity: 0, scale: 0.96, y: -12, transition: { duration: 0.15 } }}
            role="dialog"
            aria-modal="true"
            aria-label="Palette de commandes — recherche rapide"
            className="fixed top-[10vh] left-1/2 -translate-x-1/2 z-50
                       w-full max-w-xl mx-4
                       bg-white dark:bg-gray-900
                       border border-gray-200 dark:border-gray-700
                       rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Barre de recherche */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
              {isSearching
                ? <Loader2 className="w-5 h-5 text-niger-orange animate-spin flex-shrink-0" aria-hidden="true" />
                : <Search className="w-5 h-5 text-gray-400 flex-shrink-0" aria-hidden="true" />
              }
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher une page, un article…"
                aria-label="Rechercher"
                aria-autocomplete="list"
                aria-controls="command-palette-list"
                className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100
                           placeholder:text-gray-400 dark:placeholder:text-gray-500
                           focus:outline-none"
              />
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <kbd className="hidden sm:flex items-center px-1.5 py-0.5 text-xs font-mono
                               bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400
                               border border-gray-300 dark:border-gray-700 rounded">
                  Esc
                </kbd>
                <button
                  onClick={onClose}
                  aria-label="Fermer la palette"
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                             hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                  <span className="sr-only">Fermer</span>
                </button>
              </div>
            </div>

            {/* Résultats */}
            <div
              id="command-palette-list"
              ref={listRef}
              role="listbox"
              aria-label="Résultats de recherche"
              className="max-h-80 overflow-y-auto p-2"
            >
              {items.length > 0 ? (
                <>
                  {!query.trim() && (
                    <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                      Navigation rapide
                    </div>
                  )}
                  {items.map((item, i) => (
                    <ResultItem
                      key={item._id || item.url || i}
                      item={item}
                      isSelected={i === selectedIndex}
                      onClick={() => navigateTo(item)}
                    />
                  ))}
                </>
              ) : query.trim() && !isSearching ? (
                <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                  Aucun résultat pour <strong>&ldquo;{query}&rdquo;</strong>
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
              <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 font-mono bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-[10px]">↑↓</kbd>
                  Naviguer
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 font-mono bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-[10px]">↵</kbd>
                  Ouvrir
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                <Command className="w-3 h-3" aria-hidden="true" />
                <span>+K pour ouvrir</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
