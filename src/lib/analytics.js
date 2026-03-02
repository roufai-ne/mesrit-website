// src/lib/analytics.js
// Google Analytics 4 — utilitaires + composant React

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

export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', { page_path: window.location.pathname });
          `,
        }}
      />
    </>
  );
}
