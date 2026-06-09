// Extraction de reportWebVitals hors de _app.js pour préserver la compatibilité
// Fast Refresh — un module ne doit pas mélanger exports React et non-React.
export function reportWebVitals({ id, name, label, value }) {
  if (
    typeof window !== 'undefined' &&
    typeof window.gtag !== 'undefined' &&
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  ) {
    window.gtag('event', name, {
      event_category: label === 'web-vital' ? 'Web Vitals' : 'Next.js custom metric',
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      event_label: id,
      non_interaction: true,
    });
  }
}
