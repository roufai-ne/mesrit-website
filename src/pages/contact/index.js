import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ContactForm from '@/pages/contact/ContactForm';
import MapComponent from '@/components/contact/MapComponent';
import { Mail, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function Contact() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-niger-orange via-niger-orange-dark to-niger-green text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-niger-white/[0.05] bg-[size:20px_20px] opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="container mx-auto px-6 relative">
          <div className="flex items-center text-sm mb-4">
            <Link href="/" className="hover:text-niger-cream transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-niger-cream font-medium">Contact</span>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Mail className="w-12 h-12 mr-4 text-niger-cream" />
              <div>
                <h1 className="text-5xl font-bold">Contact</h1>
                <p className="text-niger-cream/80 text-lg mt-2">Nous Contacter</p>
              </div>
            </div>
            <p className="text-xl text-niger-cream max-w-3xl leading-relaxed mx-auto">
              Contactez le Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique.
              Notre équipe est à votre disposition pour répondre à vos questions et demandes.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="bg-gradient-to-b from-niger-cream to-white dark:from-secondary-900 dark:to-secondary-800 shadow-2xl relative -mt-12 rounded-2xl mx-auto container px-6 transition-colors duration-300">
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Carte et informations de contact */}
            <div>
              <MapComponent />
            </div>

            {/* Formulaire de contact */}
            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// Forcer SSR pour éviter les erreurs durant le SSG
export async function getServerSideProps() {
  return {
    props: {}
  };
}
