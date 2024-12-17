// pages/ministere/direction/[id].js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import { Mail, Phone, ChevronRight, ArrowLeft, Building } from 'lucide-react';
import Link from 'next/link';

export default function DirectionDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [direction, setDirection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchDirection();
    }
  }, [id]);

  const fetchDirection = async () => {
    try {
      const response = await fetch(`/api/directors/${id}`);
      if (response.ok) {
        const data = await response.json();
        setDirection(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="py-12 bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto px-4">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-gray-200 w-1/3 rounded"></div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!direction) {
    return (
      <MainLayout>
        <div className="py-12 bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Direction non trouvée</h1>
            <Link 
              href="/ministere/direction"
              className="text-blue-600 hover:text-blue-800 inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux directions
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="py-12 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          {/* Fil d'Ariane */}
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-blue-600">Accueil</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href="/ministere" className="hover:text-blue-600">Le Ministère</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href="/ministere/direction" className="hover:text-blue-600">Direction</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span>{direction.titre}</span>
          </div>

          {/* Contenu principal */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Informations principales */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-6">
                  <Building className="w-8 h-8 text-blue-600 mr-4" />
                  <h1 className="text-2xl font-bold">{direction.titre}</h1>
                </div>
                
                <div className="prose max-w-none mb-6">
                  <p className="text-gray-600">{direction.description || "Description non disponible"}</p>
                </div>

                <div className="border-t pt-6">
                  <h2 className="font-bold mb-4">Responsable</h2>
                  <div className="flex items-center space-x-4">
                    <img
                      src={direction.photo || '/images/dir/default.jpg'}
                      alt={direction.nom}
                      className="w-16 h-16 rounded-full object-cover"
                      onError={(e) => {e.target.src = '/images/dir/default.jpg'}}
                    />
                    <div>
                      <h3 className="font-medium">{direction.nom}</h3>
                      <p className="text-gray-600">{direction.titre}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact et informations supplémentaires */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="font-bold mb-4">Contact</h2>
                <div className="space-y-3">
                  <a 
                    href={`mailto:${direction.email}`}
                    className="flex items-center text-gray-600 hover:text-blue-600"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    {direction.email}
                  </a>
                  <a 
                    href={`tel:${direction.telephone}`}
                    className="flex items-center text-gray-600 hover:text-blue-600"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    {direction.telephone}
                  </a>
                </div>
              </div>

              <Link 
                href="/ministere/direction"
                className="block bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retour aux directions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}