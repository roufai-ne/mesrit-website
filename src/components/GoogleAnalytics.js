// src/components/GoogleAnalytics.js
// Séparé de analytics.js pour satisfaire les règles de Fast Refresh
// (un fichier ne peut exporter que des composants React OU des utilitaires, pas les deux)
import { GA_MEASUREMENT_ID } from '@/lib/analytics';

export default function GoogleAnalytics() {
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
