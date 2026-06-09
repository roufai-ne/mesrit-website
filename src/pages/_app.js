// ============================================
// pages/_app.js - OPTIMISÉ
// ============================================
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useReducedMotion } from 'framer-motion';
import dynamic from 'next/dynamic';
import PageTransition from '@/components/PageTransition';

const CookieConsent = dynamic(() => import('@/components/ui/CookieConsent'), { ssr: false });
import '@/styles/globals.css';
import 'leaflet/dist/leaflet.css';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/ui/toast';
import { Toaster } from 'react-hot-toast';
import { pageview } from '@/lib/analytics.js';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import Head from 'next/head';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
};

const pageVariantsReduced = {
  initial: {},
  enter: {},
  exit: {},
};

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

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion ? pageVariantsReduced : pageVariants;
  const [hasConsent, setHasConsent] = useState(false);

  // Lire le consentement au montage (côté client uniquement)
  useEffect(() => {
    try {
      const consent = localStorage.getItem('mesrit-cookie-consent');
      if (consent === 'accepted') setHasConsent(true);
    } catch {}
  }, []);

  useEffect(() => {
    const handleRouteChange = (url) => {
      pageview(url);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <ThemeProvider defaultTheme="system">
      <AuthProvider>
        <ToastProvider>
          <SettingsProvider>
            <Head>
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <link rel="icon" href="/favicon.ico" />
              <meta name="theme-color" content="#ffffff" />
            </Head>

            {/* GA4 chargé uniquement après consentement explicite */}
            {hasConsent && <GoogleAnalytics />}

            <CookieConsent onAccept={() => setHasConsent(true)} />

            <div className="font-sans">
              <PageTransition routeKey={router.pathname} variants={variants}>
                <Component {...pageProps} />
              </PageTransition>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#fff',
                    color: '#374151',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  },
                }}
              />
            </div>
          </SettingsProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}