//pages/ministere/direction/index.js
import { useEffect, useState, useMemo } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Users, ChevronRight, Mail, Phone, ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Composant de chargement
const LoadingSkeleton = () => (
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

// Composant de fil d'ariane
const Breadcrumb = () => (
  <div className="flex items-center text-sm text-gray-500 mb-8 animate-fade-in">
    <Link href="/" className="nav-link">Accueil</Link>
    <ChevronRight className="w-4 h-4 mx-2" aria-hidden="true" />
    <Link href="/ministere" className="nav-link">Le Ministère</Link>
    <ChevronRight className="w-4 h-4 mx-2" aria-hidden="true" />
    <span aria-current="page">Direction</span>
  </div>
);

const MinisterSection = ({ ministre }) => {
  if (!ministre) return null;

  return (
    <div className="card animate-fade-in p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="relative h-[500px] overflow-hidden rounded-xl shadow-lg">
            <Image
              src={ministre.photo || '/images/dir/default.jpg'}
              alt={ministre.nom}
              fill
              priority
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-8 relative">
          <h3 className="text-xl font-semibold text-gradient mb-6">Message du Ministre</h3>
          <div className="space-y-6">
            <p className="text-gray-700 italic leading-relaxed">
              {ministre.message || "Message du ministre non disponible"}
            </p>
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
      onKeyPress={(e) => e.key === 'Enter' && onClick()}
      aria-label={`Voir les détails de ${data.titre}`}
    >
      <div className="flex items-center gap-8 p-6">
        <div className="relative w-32 h-32 overflow-hidden rounded-full hover-scale">
          <div className="absolute inset-0 bg-gradient-primary opacity-20" />
          <Image
            src={data.photo || '/images/dir/default.jpg'}
            alt={data.nom}
            fill
            className="object-cover"
            sizes="128px"
          />
        </div>
        
        <div className="flex-grow space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gradient mb-1">{data.titre}</h2>
            <p className="text-xl text-gray-700">{data.nom}</p>
          </div>
        </div>
        
        {showDirections && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center text-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <span className="mr-2 font-medium">Voir les directions</span>
            <ChevronRight className="w-5 h-5 animate-bounce-x" aria-hidden="true" />
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
            onKeyPress={(e) => e.key === 'Enter' && onDirectionClick(direction)}
          >
            {/* ... reste du contenu ... */}
          </div>
          {/* ... expansion du détail ... */}
        </div>
      ))}
    </div>
  );
};

export default function DirectionPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ ministre: null, sg: null, dgs: [] });
  const [currentSection, setCurrentSection] = useState(null);
  const [currentDirection, setCurrentDirection] = useState(null);
  const [sousDirections, setSousDirections] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDirectors = async () => {
      try {
        const response = await fetch('/api/directors');
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const directorsData = await response.json();

        setData({
          ministre: directorsData.find(d => d.titre === "Ministre"),
          sg: directorsData.find(d => d.key === "SG"),
          dgs: directorsData.filter(d => ["DGES", "DGR"].includes(d.key))
        });

        const sousDir = directorsData
          .filter(d => d.direction)
          .reduce((acc, curr) => {
            const parentKey = curr.direction;
            if (!acc[parentKey]) acc[parentKey] = [];
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

    fetchDirectors();
  }, []);

  const mainContent = useMemo(() => {
    if (loading) return <LoadingSkeleton />;
    if (error) return <div className="text-red-600">{error}</div>;
    if (!data.ministre || !data.sg || data.dgs.length === 0) {
      return <div>Aucune donnée disponible</div>;
    }

    return (
      <div className="space-y-12">
        <MinisterSection ministre={data.ministre} />
        <div className="space-y-8">
          <DirectionCard 
            data={data.sg} 
            showDirections={true}
            onClick={() => setCurrentSection(data.sg)}
          />
          <div className="grid md:grid-cols-2 gap-8">
            {data.dgs.map((dg) => (
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
  }, [loading, error, data]);

  return (
    <MainLayout>
      <div className="py-12 bg-gradient-subtle min-h-screen">
        <div className="container">
          <Breadcrumb />

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
          ) : mainContent}
        </div>
      </div>
    </MainLayout>
  );
}