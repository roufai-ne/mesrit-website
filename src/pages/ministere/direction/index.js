import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Users, ChevronRight, Mail, Phone, ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';

export default function DirectionPage() {
  const [loading, setLoading] = useState(true);
  const [ministre, setMinistre] = useState(null);
  const [sg, setSg] = useState(null);
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
      const response = await fetch('/api/directors');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMinistre(data.find(d => d.titre === "Ministre"));
      setSg(data.find(d => d.key === "SG"));
      setDgs(data.filter(d => ["DGES", "DGR"].includes(d.key)));

      const sousDir = data.filter(d => d.direction)
        .reduce((acc, curr) => {
          const parentKey = curr.direction;
          if (!acc[parentKey]) {
            acc[parentKey] = [];
          }
          acc[parentKey].push(curr);
          return acc;
        }, {});
      setSousDirections(sousDir);
    } catch (error) {
      console.error('Erreur:', error);
      setError("Une erreur est survenue lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  };

  const MinisterSection = ({ ministre }) => {
    if (!ministre) return null;

    return (
      <div className="card animate-fade-in p-8">
        <div className="grid grid-cols-2 gap-8">
          {/* Colonne gauche : Photo et informations */}
          <div>
            {/* Cadre photo avec style amélioré */}
            <div className="relative h-[500px] overflow-hidden rounded-xl shadow-lg">
              <img 
                src={ministre.photo || '/images/dir/default.jpg'}
                alt={ministre.nom}
                className="w-full h-full object-cover object-top"
              />
              {/* Dégradé subtil en bas pour le texte */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                {/*<h2 className="text-2xl font-bold">{ministre.titre}</h2>
                <p className="text-xl mt-1">{ministre.nom}</p>*/}
              </div>
            </div>
          </div>

          {/* Colonne droite : Message */}
          <div className="bg-blue-50 rounded-xl p-8 relative">
            <h3 className="text-xl font-semibold text-gradient mb-6">
              Message du Ministre
            </h3>
            
            <div className="space-y-6">
              <p className="text-gray-700 italic leading-relaxed">
                {ministre.message || "Message du ministre non disponible"}
              </p>

              {/* Signature */}
              <div className="text-right pt-4">
                <p className="font-semibold text-gray-800">{ministre.nom}</p>
                <p className="text-gray-600">{ministre.titre}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};
  const DirectionCard = ({ data, onClick, showDirections = false }) => {
    if (!data) return null;
    
    return (
      <div 
        className="direction-card"
        onClick={onClick}
        role="button"
        tabIndex={0}
      >
        <div className="flex items-center gap-8 p-6">
          <div className="relative w-32 h-32 overflow-hidden rounded-full hover-scale">
            <div className="absolute inset-0 bg-gradient-primary opacity-20" />
            <img 
              src={data.photo || '/images/dir/default.jpg'}
              alt={data.nom}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-grow space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gradient mb-1">{data.titre}</h2>
              <p className="text-xl text-gray-700">{data.nom}</p>
            </div>
            
            {/*<div className="space-y-3">
              {data.email && (
                <a 
                  href={`mailto:${data.email}`}
                  className="flex items-center text-gray-600 hover-lift group"
                  onClick={e => e.stopPropagation()}
                >
                  <Mail className="w-4 h-4 mr-3 group-hover:animate-bounce-x" />
                  <span className="hover:text-blue-600">{data.email}</span>
                </a>
              )}
              {data.telephone && (
                <a 
                  href={`tel:${data.telephone}`}
                  className="flex items-center text-gray-600 hover-lift group"
                  onClick={e => e.stopPropagation()}
                >
                  <Phone className="w-4 h-4 mr-3 group-hover:animate-bounce-x" />
                  <span className="hover:text-blue-600">{data.telephone}</span>
                </a>
              )}
            </div>*/}
          </div>
          
          {showDirections && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center text-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <span className="mr-2 font-medium">Voir les directions</span>
              <ChevronRight className="w-5 h-5 animate-bounce-x" />
            </div>
          )}
        </div>
      </div>
    );
  };

  const DirectionList = ({ directions, onDirectionClick, currentDirection }) => {
    if (!directions?.length) return (
      <p className="text-gray-500 animate-fade-in">Aucune direction disponible</p>
    );

    return (
      <div className="space-y-6">
        {directions.map((direction, index) => (
          <div 
            key={direction.key || direction.titre} 
            className="animate-slide-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div 
              className={`
                card hover-lift group bg-gradient-subtle p-6 cursor-pointer
                ${currentDirection?.key === direction.key ? 'shadow-intense ring-2 ring-blue-300' : 'shadow-soft'}
              `}
              onClick={() => onDirectionClick(direction)}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gradient">
                  {direction.titre}
                </span>
                <ChevronRight 
                  className={`w-5 h-5 text-blue-600 transition-transform duration-300
                    ${currentDirection?.key === direction.key ? 'rotate-90' : 'group-hover:animate-bounce-x'}`}
                />
              </div>
            </div>

            {currentDirection?.key === direction.key && (
              <div className="mt-4 animate-slide-down">
                <div className="card relative border-blue-100">
                  <div className="absolute -top-2 left-8 w-4 h-4 bg-white transform rotate-45 border-l border-t border-blue-100" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDirectionClick(null);
                    }}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-red-50 group"
                    aria-label="Fermer"
                  >
                    <X className="w-5 h-5 text-gray-400 group-hover:text-red-500 group-hover:animate-rotate-bounce" />
                  </button>
                  <DirectionCard 
                    data={currentDirection}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}
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
            <div className="h-[400px] bg-gray-200 rounded-xl" />
            <div className="h-[400px] bg-gray-200 rounded-xl" />
          </div>
          <div className="h-48 bg-gray-200 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-48 bg-gray-200 rounded-xl" />
            <div className="h-48 bg-gray-200 rounded-xl" />
          </div>
        </div>
      );
    }

    if (error) {
      return <div className="text-red-600">{error}</div>;
    }

    if (!ministre || !sg || dgs.length === 0) {
      return <div>Aucune donnée disponible</div>;
    }

    return (
      <div className="space-y-12">
        <MinisterSection ministre={ministre} />
        
        <div className="space-y-8">
          <DirectionCard 
            data={sg} 
            showDirections={true}
            onClick={() => setCurrentSection(sg)}
          />
          
          <div className="grid md:grid-cols-2 gap-8">
            {dgs.map((dg) => (
              <DirectionCard
                key={dg.key}
                data={dg}
                showDirections={true}
                onClick={() => setCurrentSection(dg)}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="py-12 bg-gradient-subtle min-h-screen">
        <div className="container">
          <div className="flex items-center text-sm text-gray-500 mb-8 animate-fade-in">
            <Link href="/" className="nav-link">Accueil</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href="/ministere" className="nav-link">Le Ministère</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span>Direction</span>
          </div>

          {currentDirection ? (
            <div className="animate-fade-in">
              <button
                onClick={() => setCurrentDirection(null)}
                className="btn btn-secondary mb-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </button>
              <DirectionCard data={currentDirection} />
            </div>
          ) : currentSection ? (
            <div className="animate-fade-in">
              <button
                onClick={() => {
                  setCurrentSection(null);
                  setCurrentDirection(null);
                }}
                className="btn btn-secondary mb-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </button>
              <h2 className="text-2xl font-bold text-gradient mb-6">
                Directions sous {currentSection.titre}
              </h2>
              <div className="relative">
                <DirectionList 
                  directions={sousDirections[currentSection.key]}
                  onDirectionClick={setCurrentDirection}
                  currentDirection={currentDirection}
                />
              </div>
            </div>
          ) : (
            renderMainContent()
          )}
        </div>
      </div>
    </MainLayout>
  );
}