import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import { Mail, Phone, ChevronRight, ArrowLeft, Building, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Composant Breadcrumb
const Breadcrumb = ({ title }) => (
  <div className="flex items-center text-sm text-gray-500 mb-6">
    <Link href="/" className="hover:text-blue-600 transition-colors">Accueil</Link>
    <ChevronRight className="w-4 h-4 mx-2" aria-hidden="true" />
    <Link href="/ministere" className="hover:text-blue-600 transition-colors">Le Ministère</Link>
    <ChevronRight className="w-4 h-4 mx-2" aria-hidden="true" />
    <Link href="/ministere/direction" className="hover:text-blue-600 transition-colors">Direction</Link>
    <ChevronRight className="w-4 h-4 mx-2" aria-hidden="true" />
    <span aria-current="page">{title}</span>
  </div>
);

// Composant Contact
const Contact = ({ email, telephone }) => (
  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
    <h2 className="font-bold mb-4">Contact</h2>
    <div className="space-y-3">
      {email && (
        <a 
          href={`mailto:${email}`}
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <Mail className="w-5 h-5 mr-2" />
          {email}
        </a>
      )}
      {telephone && (
        <a 
          href={`tel:${telephone}`}
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <Phone className="w-5 h-5 mr-2" />
          {telephone}
        </a>
      )}
    </div>
  </div>
);

// Composant pour les sous-directions
const SousDirection = ({ data }) => (
  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-start gap-4">
      <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
        <Image
          src={data.photo || '/images/dir/default.jpg'}
          alt={data.nom}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>
      <div className="flex-grow">
        <h3 className="font-semibold text-lg mb-1">{data.titre}</h3>
        <p className="text-gray-600">{data.nom}</p>
        {data.description && (
          <p className="text-gray-500 text-sm mt-2">{data.description}</p>
        )}
      </div>
    </div>
  </div>
);

export default function DirectionDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [direction, setDirection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDirection = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/directors/${id}`);
        
        if (!response.ok) {
          throw new Error('Direction non trouvée');
        }
        
        const data = await response.json();
        setDirection(data);
      } catch (error) {
        console.error('Erreur:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDirection();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="py-12 bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto px-4">
            <div className="animate-pulse space-y-8">
              <div className="h-4 bg-gray-200 w-2/3 rounded"></div>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <div className="h-64 bg-gray-200 rounded-lg"></div>
                </div>
                <div>
                  <div className="h-32 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !direction) {
    return (
      <MainLayout>
        <div className="py-12 bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">{error || 'Direction non trouvée'}</h1>
            <Link 
              href="/ministere/direction"
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
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
      <div className="py-12 bg-gradient-to-b from-blue-50 to-white min-h-screen">
        <div className="container mx-auto px-4">
          <Breadcrumb title={direction.titre} />

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                <div className="flex items-center mb-6">
                  <Building className="w-8 h-8 text-blue-600 mr-4" />
                  <h1 className="text-2xl font-bold">{direction.titre}</h1>
                </div>
                
                <div className="prose max-w-none mb-8">
                  <p className="text-gray-600">{direction.description || "Description non disponible"}</p>
                </div>

                <div className="border-t pt-6">
                  <h2 className="font-bold mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    Responsable
                  </h2>
                  <div className="flex items-center space-x-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden">
                      <Image
                        src={direction.photo || '/images/dir/default.jpg'}
                        alt={direction.nom}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">{direction.nom}</h3>
                      <p className="text-gray-600">{direction.titre}</p>
                    </div>
                  </div>
                </div>
              </div>

              {direction.sousDirections?.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold">Sous-directions</h2>
                  <div className="grid gap-6">
                    {direction.sousDirections.map((sousDirection) => (
                      <SousDirection key={sousDirection._id} data={sousDirection} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <Contact 
                email={direction.email}
                telephone={direction.telephone}
              />

              <Link 
                href="/ministere/direction"
                className="block text-center bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
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