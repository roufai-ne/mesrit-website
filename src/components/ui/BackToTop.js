'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, transition: { duration: 0.2 } }}
          exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
          onClick={scrollToTop}
          aria-label="Retour en haut de la page"
          className="fixed bottom-24 right-5 z-[900]
                     w-11 h-11 rounded-full
                     bg-gradient-to-br from-niger-orange to-niger-orange-dark
                     text-white
                     flex items-center justify-center
                     shadow-lg
                     hover:shadow-[0_8px_24px_rgba(255,140,0,0.4)]
                     hover:scale-110
                     transition-[box-shadow,transform] duration-200
                     focus:outline-none focus:ring-2 focus:ring-niger-orange focus:ring-offset-2"
        >
          <ArrowUp className="w-5 h-5" aria-hidden="true" />
          <span className="sr-only">Retour en haut de la page</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
