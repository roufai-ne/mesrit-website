// src/pages/_app.js
import '@/styles/globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
    <main className={`${inter.variable} font-sans`}>
      <Component {...pageProps} />
      <Toaster position="top-right" />
    </main>
    </AuthProvider>
  )
}