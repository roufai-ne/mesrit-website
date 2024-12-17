
import React from 'react';
import { useRouter } from 'next/router';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';



export default function MainLayout({ children }) {
  const router = useRouter(); // Initialisation du hook à l'intérieur du composant
  const isRTL = router.locale === 'ar';
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
    <div className="min-h-screen flex flex-col relative">
      {/* Image en filigrane */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'url("/images/hero/slide4.png")', // Assurez-vous que l'image est dans le dossier public
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'contain',
          opacity: '0.08', // Ajustez l'opacité selon vos besoins (0.05 = 5%)
          filter: 'grayscale(80%)', // Optionnel : rend l'image en niveaux de gris
        }}
      />
    <div className="min-h-screen flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      <Navigation />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
    </div>
    </div>
  );
}