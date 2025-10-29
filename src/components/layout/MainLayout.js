
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
      <main className="flex-grow">
        {children}
      </main>
      <Footer />

    </div>

    {/* Chatbot flottant */}
    <Chatbot />
    </div>

  );
}