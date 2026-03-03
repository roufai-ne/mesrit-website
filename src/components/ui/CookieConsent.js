'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Shield } from 'lucide-react';
import Link from 'next/link';

const STORAGE_KEY = 'mesrit-cookie-consent';

export default function CookieConsent({ onAccept, onDecline }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (!consent) setVisible(true);
    } catch {
      // localStorage indisponible (SSR ou mode privé strict)
    }
  }, []);

  const handleAccept = () => {
    try { localStorage.setItem(STORAGE_KEY, 'accepted'); } catch {}
    setVisible(false);
    onAccept?.();
  };

  const handleDecline = () => {
    try { localStorage.setItem(STORAGE_KEY, 'declined'); } catch {}
    setVisible(false);
    onDecline?.();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } }}
          exit={{ opacity: 0, y: 80, transition: { duration: 0.25 } }}
          role="dialog"
          aria-label="Consentement aux cookies"
          aria-live="polite"
          className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-sm z-[9000]
                     bg-white dark:bg-gray-900
                     border border-gray-200 dark:border-gray-700
                     rounded-2xl shadow-2xl p-5
                     flex flex-col gap-4"
        >
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-niger-orange/10 flex-shrink-0">
              <Cookie className="w-5 h-5 text-niger-orange" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Cookies &amp; Confidentialité
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                Nous utilisons des cookies analytiques (GA4) pour améliorer votre expérience. Aucune donnée n&apos;est vendue.
              </p>
            </div>
            <button
              onClick={handleDecline}
              aria-label="Fermer et refuser les cookies"
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                         hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" aria-hidden="true" />
              <span className="sr-only">Fermer</span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleAccept}
              className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold
                         bg-gradient-to-r from-niger-orange to-niger-orange-dark text-white
                         hover:shadow-[0_4px_14px_rgba(255,140,0,0.3)] transition-shadow duration-200"
            >
              Accepter
            </button>
            <button
              onClick={handleDecline}
              className="flex-1 px-4 py-2 rounded-xl text-sm font-medium
                         border border-gray-200 dark:border-gray-700
                         text-gray-600 dark:text-gray-400
                         hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Refuser
            </button>
          </div>

          {/* Politique */}
          <div className="flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-niger-green flex-shrink-0" aria-hidden="true" />
            <Link
              href="/politique-confidentialite"
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-niger-orange dark:hover:text-niger-orange-light underline-offset-2 hover:underline transition-colors"
            >
              Politique de confidentialité
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
