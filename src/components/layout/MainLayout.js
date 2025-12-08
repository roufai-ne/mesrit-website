
'use client';
import dynamic from 'next/dynamic';
import Header from './Header';
import Footer from './Footer';

// Charger le chatbot côté client uniquement
const Chatbot = dynamic(() => import('@/components/Chatbot'), {
  ssr: false,
  loading: () => null
});

export default function MainLayout({ children }) {

  return (

    <div className="min-h-screen flex flex-col relative">
      {/* Skip Link pour l'accessibilité */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-6 focus:py-3 focus:bg-gradient-to-r focus:from-orange-500 focus:to-green-500 focus:text-white focus:font-bold focus:rounded-xl focus:shadow-2xl focus:ring-4 focus:ring-orange-400/50 focus:transform focus:scale-105 transition-all duration-200"
        tabIndex={0}
      >
        Passer au contenu principal
      </a>

      {/* Image en filigrane */}
      <div
        className="fixed inset-0 pointer-events-none z-0 transition-transform duration-700 ease-in-out hover:scale-105"
        style={{
          backgroundImage: 'url("/images/hero/Slide4.png")',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'contain',
          opacity: '0.10',
          filter: 'grayscale(50%) drop-shadow(0 20px 25px rgba(0, 0, 0, 0.25)) drop-shadow(0 10px 10px rgba(0, 0, 0, 0.15))',
          transform: 'perspective(1000px) rotateX(5deg) rotateY(2deg)',
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
          animation: 'float 6s ease-in-out infinite'
        }}
      />
    <div className="min-h-screen flex flex-col">

      <Header />
      <main id="main-content" className="flex-grow" tabIndex={-1}>
        {children}
      </main>
      <Footer />

    </div>

    {/* Chatbot flottant */}
    <Chatbot />
    </div>

  );
}