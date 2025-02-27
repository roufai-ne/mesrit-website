/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { secureApi } from '@/lib/secureApi';

const Breadcrumb = () => (
  <nav className="bg-white border-b">
    <div className="container py-4">
      <div className="flex items-center text-sm">
        <Link href="/" className="text-gray-500 hover:text-blue-600 transition-colors">Accueil</Link>
        <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
        <Link href="/ministere" className="text-gray-500 hover:text-blue-600 transition-colors">Le Ministère</Link>
        <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
        <span className="text-blue-600 font-medium">Direction</span>
      </div>
    </div>
  </nav>
);

const DirectionCard = ({ direction, index }) => (
  <Link href={`/ministere/direction/${direction._id}`} className="group">
    <div 
      className="relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-500 animate-slide-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="aspect-[4/3] relative">
        <Image
          src={direction.photo || '/images/dir/default.jpg'}
          alt={direction.titre}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
      </div>

      <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
        <div>
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
            Direction {index + 1}
          </span>
          <h3 className="text-2xl font-bold group-hover:text-blue-300 transition-colors">
            {direction.titre}
          </h3>
        </div>

        <div className="flex items-center justify-between border-t border-white/20 pt-4 mt-4">
          <span className="text-sm font-medium">En savoir plus</span>
          <ArrowRight className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" />
        </div>
      </div>
    </div>
  </Link>
);

export default function DirectionsList() {
  const [directions, setDirections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDirections = async () => {
      try {
        setLoading(true);
        // Utiliser secureApi sans authentification (endpoint public)
        const data = await secureApi.get('/api/directors', false);
        setDirections(data);
      } catch (error) {
        console.error('Erreur:', error);
        setError(error.message || 'Erreur lors du chargement des directions');
      } finally {
        setLoading(false);
      }
    };

    fetchDirections();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <Breadcrumb />
        <div className="bg-gray-50 min-h-screen">
          <div className="container py-12">
            <div className="animate-pulse mb-12">
              <div className="h-12 bg-gray-200 rounded-lg w-2/3 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="aspect-[4/3] bg-gray-200 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Breadcrumb />
      <div className="bg-gray-50 min-h-screen">
        <div className="container py-12">
          <div className="max-w-3xl mb-12">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800 mb-4">
              Directions sous Directeur Général de la Recherche
            </h1>
            <p className="text-gray-600 text-lg">
              Découvrez les différentes directions du ministère et leurs responsables. Chaque direction joue un rôle essentiel dans la réalisation de nos objectifs et la mise en œuvre de nos politiques.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {directions.map((direction, i) => (
              <DirectionCard 
                key={direction._id} 
                direction={direction}
                index={i}
              />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}