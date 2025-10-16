import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Services from '@/components/home/Services';
import Head from 'next/head';
import Link from 'next/link';
import { Users, ChevronRight } from 'lucide-react';

export default function ServicesPage() {
  return (
    <>
      <Head>
        <title>Services - MESRIT Niger</title>
        <meta 
          name="description" 
          content="Découvrez tous les services en ligne du Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique du Niger. Inscription, bourses, résultats, accréditation et plus encore." 
        />
        <meta 
          name="keywords" 
          content="services, enseignement supérieur, Niger, inscription, bourses, résultats, accréditation, recherche, formation" 
        />
      </Head>
      
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
              <span className="text-niger-cream font-medium">Services</span>
            </div>
            
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center mb-6">
                  <Users className="w-12 h-12 mr-4 text-niger-cream" />
                  <div>
                    <h1 className="text-5xl font-bold">Services</h1>
                    <p className="text-niger-cream/80 text-lg mt-2">Plateforme de Services Numériques</p>
                  </div>
                </div>
                <p className="text-xl text-niger-cream max-w-3xl leading-relaxed mb-6">
                  Découvrez tous les services en ligne du Ministère de l'Enseignement Supérieur, 
                  de la Recherche et de l'Innovation Technologique. Simplifiez vos démarches administratives.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="bg-gradient-to-b from-niger-cream to-white dark:from-secondary-900 dark:to-secondary-800 shadow-2xl relative -mt-12 rounded-2xl mx-auto container px-6 transition-colors duration-300">
          <div className="p-8">
            <Services />
          </div>
        </div>
      </MainLayout>
    </>
  );
}
