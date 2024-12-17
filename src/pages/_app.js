// src/pages/_app.js
// src/pages/_app.js
import '@/styles/globals.css'
import { Inter } from 'next/font/google'
import 'leaflet/dist/leaflet.css';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export default function App({ Component, pageProps }) {
  return (
    <main className={`${inter.variable} font-sans`}>
      <Component {...pageProps} />
    </main>
  )
}