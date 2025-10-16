import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ContactForm from '@/pages/contact/ContactForm';
import { Mail, Phone, MapPin, ChevronRight } from 'lucide-react';
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
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center mb-6">
                <Mail className="w-12 h-12 mr-4 text-niger-cream" />
                <div>
                  <h1 className="text-5xl font-bold">Contact</h1>
                  <p className="text-niger-cream/80 text-lg mt-2">Nous Contacter</p>
                </div>
              </div>
              <p className="text-xl text-niger-cream max-w-3xl leading-relaxed mb-6">
                Contactez le Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique. 
                Notre équipe est à votre disposition pour répondre à vos questions et demandes.
              </p>
              
              {/* Contact Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-niger-cream">
                <div className="bg-niger-white/10 backdrop-blur-sm rounded-xl p-4 border border-niger-white/20 flex items-center">
                  <MapPin className="w-8 h-8 mr-3 text-niger-cream" />
                  <div>
                    <span className="text-sm opacity-90 block">Adresse</span>
                    <span className="font-bold">Niamey, Niger</span>
                  </div>
                </div>
                <div className="bg-niger-white/10 backdrop-blur-sm rounded-xl p-4 border border-niger-white/20 flex items-center">
                  <Phone className="w-8 h-8 mr-3 text-niger-cream" />
                  <div>
                    <span className="text-sm opacity-90 block">Téléphone</span>
                    <span className="font-bold">+227 XX XX XX XX</span>
                  </div>
                </div>
                <div className="bg-niger-white/10 backdrop-blur-sm rounded-xl p-4 border border-niger-white/20 flex items-center">
                  <Mail className="w-8 h-8 mr-3 text-niger-cream" />
                  <div>
                    <span className="text-sm opacity-90 block">Email</span>
                    <span className="font-bold">contact@mesrit.ne</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="bg-gradient-to-b from-niger-cream to-white dark:from-secondary-900 dark:to-secondary-800 shadow-2xl relative -mt-12 rounded-2xl mx-auto container px-6 transition-colors duration-300">
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Informations de contact */}
            <div>
              <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg border border-niger-orange/10 p-8">
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="w-6 h-6 text-niger-orange" />
                  <h2 className="text-2xl font-bold text-niger-green dark:text-niger-green-light">Nos coordonnées</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-start p-4 rounded-xl bg-niger-cream dark:bg-secondary-700 border border-niger-orange/10">
                    <MapPin className="w-6 h-6 text-niger-orange mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-niger-green dark:text-niger-green-light mb-1">Adresse</h3>
                      <span className="text-readable-muted dark:text-muted-foreground">Niamey, Niger</span>
                    </div>
                  </div>
                  <div className="flex items-start p-4 rounded-xl bg-niger-cream dark:bg-secondary-700 border border-niger-orange/10">
                    <Phone className="w-6 h-6 text-niger-orange mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-niger-green dark:text-niger-green-light mb-1">Téléphone</h3>
                      <span className="text-readable-muted dark:text-muted-foreground">+227 XX XX XX XX</span>
                    </div>
                  </div>
                  <div className="flex items-start p-4 rounded-xl bg-niger-cream dark:bg-secondary-700 border border-niger-orange/10">
                    <Mail className="w-6 h-6 text-niger-orange mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-niger-green dark:text-niger-green-light mb-1">Email</h3>
                      <span className="text-readable-muted dark:text-muted-foreground">contact@mesrit.ne</span>
                    </div>
                  </div>
                </div>
              </div>
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