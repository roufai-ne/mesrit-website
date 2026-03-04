// src/lib/analytics.js
// Google Analytics 4 — utilitaires purs (pas de composant React ici)
// Le composant <GoogleAnalytics /> est dans src/components/GoogleAnalytics.js

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const pageview = (url) => {
  if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined' && GA_MEASUREMENT_ID) {
    window.gtag('config', GA_MEASUREMENT_ID, { page_path: url });
  }
};

export const event = ({ action, category, label, value }) => {
  if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined' && GA_MEASUREMENT_ID) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value,
    });
  }
};
