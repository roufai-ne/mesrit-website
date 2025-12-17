// ============================================
// pages/_app.js - OPTIMISÉ
// ============================================
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import '@/styles/globals.css';
import 'leaflet/dist/leaflet.css';
import { Inter } from 'next/font/google';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/ui/toast';
import { Toaster } from 'react-hot-toast';
import { GoogleAnalytics, pageview } from '@/lib/analytics';
import Head from 'next/head';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export default function App({ Component, pageProps }) {
  const router = useRouter();

  // Track page views on route change
  useEffect(() => {
    const handleRouteChange = (url) => {
      pageview(url);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  const content = (
    <ThemeProvider defaultTheme="system">
      <AuthProvider>
        <ToastProvider>
          <SettingsProvider>
            {/* Global SEO Fallback */}
            <Head>
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <link rel="icon" href="/favicon.ico" />
              <meta name="theme-color" content="#ffffff" />
            </Head>

            <GoogleAnalytics />

            <main className={`${inter.variable} font-sans`}>
              <Component {...pageProps} />
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
            </main>
          </SettingsProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );

  // ✅ Désactiver StrictMode sur le réseau local pour éviter le double tracking
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

    // StrictMode seulement sur localhost, pas sur l'IP réseau
    if (isLocalhost && process.env.NODE_ENV === 'development') {
      return <React.StrictMode>{content}</React.StrictMode>;
    }
  }

  return content;
}