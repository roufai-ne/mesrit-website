import { React, useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Users, ChevronRight, ArrowLeft} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { secureApi } from '@/lib/secureApi';


export default function DirectionPage() {
  const [loading, setLoading] = useState(true);
  const [ministre, setMinistre] = useState(null);
  const [sg, setSg] = useState(null);
  const [sga, setSga] = useState(null);
  const [dgs, setDgs] = useState([]);
  const [currentSection, setCurrentSection] = useState(null);
  const [currentDirection, setCurrentDirection] = useState(null);
  const [sousDirections, setSousDirections] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDirectors();
  }, []);

  const fetchDirectors = async () => {
    try {
      setLoading(true);
      // Utiliser secureApi sans authentification (endpoint public)
      const data = await secureApi.get('/api/directors', false);

      if (Array.isArray(data)) {
        setMinistre(data.find(d => d.titre === "Ministre"));
        setSg(data.find(d => d.key === "SG"));
        setSga(data.find(d => d.key === "SGA"));
        setDgs(data.filter(d => ["DGES", "DGR"].includes(d.key)));
        
        const sousDir = data.reduce((acc, curr) => {
          if (curr.direction) {
            if (!acc[curr.direction]) {
              acc[curr.direction] = [];
            }
            acc[curr.direction].push(curr);
          }
          return acc;
        }, {});
        
        setSousDirections(sousDir);
      } else {
        setError('Format de données invalide');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError(error.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const renderMinisterSection = () => {
    if (!ministre) return null;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative h-[500px]">
          <Image
            src={ministre.photo || '/images/dir/default.jpg'}
            alt={ministre.nom}
            fill
            className="object-cover object-top brightness-110"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <h2 className="text-3xl font-bold mb-2">{ministre.titre}</h2>
            <p className="text-xl">{ministre.nom}</p>
          </div>
        </div>
        <div className="p-8 flex flex-col">
          <div className="bg-blue-50 rounded-lg p-8 mb-6 flex-grow">
            <h3 className="text-2xl font-semibold text-blue-800 mb-6">Message du Ministre</h3>
            <p className="text-gray-700 italic leading-relaxed text-lg text-justify">
              {ministre.message || "Message du ministre non disponible"}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderDirectionCard = (data, showDirections = false) => {
    if (!data) return null;
    
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 relative group">
        <div className="flex items-center">
          <div className="relative w-32 h-32">
            <Image
              src={data.photo || '/images/dir/default.jpg'}
              alt={data.nom}
              fill
              className="rounded-full object-cover"
              sizes="128px"
            />
          </div>
          <div className="flex-grow ml-8">
            <div className="bg-blue-50 inline-block px-3 py-1 rounded-full mb-2">
              <span className="text-blue-600 text-sm font-medium">{data.key || "Direction"}</span>
            </div>
            <h2 className="text-2xl font-bold text-blue-800 mb-2">{data.titre}</h2>
            <p className="text-xl text-gray-700">{data.nom}</p>
          </div>
        </div>
        
        {showDirections && sousDirections[data.key]?.length > 0 && (
          <button 
            onClick={() => setCurrentSection(data)}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-l from-blue-500 to-blue-600 text-white px-6 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2 rounded-r-lg"
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Voir les directions</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  };

  const renderSgaCard = (data) => {
    if (!data) return null;

    return (
      <div className="bg-white rounded-lg shadow-lg p-4 relative group">
        <div className="flex items-center">
          <div className="relative w-20 h-20">
            <Image
              src={data.photo || '/images/dir/default.jpg'}
              alt={data.nom}
              fill
              className="rounded-full object-cover"
              sizes="80px"
            />
          </div>
          <div className="flex-grow ml-4">
            <div className="bg-blue-50 inline-block px-3 py-1 rounded-full mb-1">
              <span className="text-blue-600 text-sm font-medium">{data.key || "Direction"}</span>
            </div>
            <h3 className="text-lg font-semibold text-blue-800">{data.titre}</h3>
            <p className="text-gray-700">{data.nom}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderSgSection = () => {
    if (!sg) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {renderDirectionCard(sg, true)}
        </div>
        <div>
          {renderSgaCard(sga)}
        </div>
      </div>
    );
  };

  const renderDirectionList = (directions) => {
    if (!directions?.length) {
      return (
        <div className="text-center py-8 text-gray-600">
          Aucune direction disponible
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {directions.map((direction, index) => (
          <div 
            key={direction.id || index}
            onClick={() => setCurrentDirection(direction)}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg cursor-pointer transform hover:-translate-y-1 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg text-blue-800">
                {direction.nomComplet || direction.titre}
              </h3>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMainContent = () => {
    if (loading) {
      return (
        <div className="animate-pulse space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-[400px] bg-gray-200 rounded-lg"></div>
            <div className="h-[400px] bg-gray-200 rounded-lg"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 h-48 bg-gray-200 rounded-lg"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{error}</div>
          <button 
            onClick={fetchDirectors}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      );
    }

    if (!ministre && !sg && dgs.length === 0) {
      return <div className="text-center py-12 text-gray-600">Aucune donnée disponible</div>;
    }

    return (
      <div className="space-y-12">
        {renderMinisterSection()}
        
        <div className="space-y-8">
          {renderSgSection()}
          
          <div className="grid md:grid-cols-2 gap-8">
            {dgs.map((dg, index) => (
              <div key={dg.id || index}>
                {renderDirectionCard(dg, true)}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="py-12 bg-gradient-to-b from-blue-50 to-white min-h-screen">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-blue-600 transition-colors">Accueil</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href="/ministere" className="hover:text-blue-600 transition-colors">Le Ministère</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span>Direction</span>
          </div>

          {currentDirection ? (
            <div className="space-y-6">
              <button
                onClick={() => setCurrentDirection(null)}
                className="flex items-center text-blue-600 mb-6 hover:text-blue-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </button>
              {renderDirectionCard(currentDirection)}
            </div>
          ) : currentSection ? (
            <div className="space-y-6">
              <button
                onClick={() => setCurrentSection(null)}
                className="flex items-center text-blue-600 mb-6 hover:text-blue-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </button>
              <h2 className="text-2xl font-bold text-blue-800 mb-6">
                Directions sous {currentSection.titre}
              </h2>
              {renderDirectionList(sousDirections[currentSection.key])}
            </div>
          ) : (
            renderMainContent()
          )}
        </div>
      </div>
    </MainLayout>
  );
}