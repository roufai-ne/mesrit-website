import '@/styles/globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/components/ui/toast';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider defaultTheme="system">
      <ToastProvider>
        <AuthProvider>
          <SettingsProvider>
            <main className={`${inter.variable} font-sans`}>
              <Component {...pageProps} />
              {/* Keep existing react-hot-toast for backward compatibility */}
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
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}