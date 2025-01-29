import { React, useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Users, ChevronRight, Mail, Phone, ArrowLeft, ChevronDown, Building } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const DirectionCard = ({ data, showDirections, onShowDirections }) => (
  <div className="direction-card group relative">
    <div className="p-6">
      <div className="flex items-center gap-8">
        <div className="relative w-32 h-32 rounded-full overflow-hidden flex-shrink-0">
          <Image
            src={data.photo || '/images/dir/default.jpg'}
            alt={data.nom}
            fill
            className="object-cover"
            sizes="128px"
          />
        </div>
        <div className="flex-grow">
          <div className="bg-blue-50 inline-block px-3 py-1 rounded-full mb-2">
            <span className="text-blue-600 text-sm font-medium">{data.key || "Direction"}</span>
          </div>
          <h2 className="text-2xl font-bold text-blue-800 mb-2">{data.titre}</h2>
          <p className="text-xl text-gray-700 mb-4">{data.nom}</p>
          
          <div className="flex gap-6">
            {data.email && (
              <a 
                href={`mailto:${data.email}`}
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors group"
              >
                <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center mr-2 group-hover:bg-blue-100">
                  <Mail className="w-4 h-4" />
                </div>
                <span>Contact</span>
              </a>
            )}
            {data.telephone && (
              <a 
                href={`tel:${data.telephone}`}
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors group"
              >
                <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center mr-2 group-hover:bg-blue-100">
                  <Phone className="w-4 h-4" />
                </div>
                <span>Téléphone</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
    
    {showDirections && (
      <button 
        onClick={onShowDirections}
        className="absolute -bottom-px left-0 right-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2 rounded-b-lg"
      >
        <Users className="w-5 h-5" />
        <span className="font-medium">Voir les directions</span>
        <ChevronDown className="w-5 h-5" />
      </button>
    )}
  </div>
);

const SubDirectionCard = ({ direction, onClick }) => (
  <div 
    onClick={onClick}
    className="direction-card cursor-pointer hover:scale-[1.02] transition-transform p-6"
  >
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
        <Building className="w-6 h-6 text-blue-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-blue-800 mb-1">
          {direction.nomComplet}
        </h3>
        {direction.nom && (
          <p className="text-gray-600">{direction.nom}</p>
        )}
      </div>
    </div>
  </div>
);

export default function DirectionPage() {
  const [loading, setLoading] = useState(true);
  const [ministre, setMinistre] = useState(null);
  const [sg, setSg] = useState(null);
  const [dgs, setDgs] = useState([]);
  const [currentSection, setCurrentSection] = useState(null);
  const [currentDirection, setCurrentDirection] = useState(null);
  const [sousDirections, setSousDirections] = useState({});

  useEffect(() => {
    fetchDirectors();
  }, []);

  const fetchDirectors = async () => {
    try {
      const response = await fetch('/api/directors');
      if (response.ok) {
        const data = await response.json();
        setMinistre(data.find(d => d.titre === "Ministre"));
        setSg(data.find(d => d.key === "SG"));
        setDgs(data.filter(d => ["DGES", "DGR"].includes(d.key)));
        
        const sousDir = data.filter(d => d.nomComplet)
          .reduce((acc, curr) => {
            if (!acc[curr.direction]) acc[curr.direction] = [];
            acc[curr.direction].push(curr);
            return acc;
          }, {});
        setSousDirections(sousDir);
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
        <div className="py-12 bg-gradient-to-b from-blue-50 to-white min-h-screen">
          <div className="container mx-auto px-4">
            <div className="animate-pulse space-y-8">
              <div className="h-4 bg-gray-200 w-48 rounded mb-8" />
              <div className="grid gap-8">
                <div className="h-64 bg-gray-200 rounded-xl" />
                <div className="h-48 bg-gray-200 rounded-xl" />
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="h-48 bg-gray-200 rounded-xl" />
                  <div className="h-48 bg-gray-200 rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

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
            <div className="space-y-6 animate-fade-in">
              <button
                onClick={() => setCurrentDirection(null)}
                className="btn btn-secondary inline-flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </button>
              <DirectionCard data={currentDirection} />
            </div>
          ) : currentSection ? (
            <div className="space-y-6 animate-fade-in">
              <button
                onClick={() => setCurrentSection(null)}
                className="btn btn-secondary inline-flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </button>
              <div className="bg-white rounded-xl p-6 shadow-soft mb-8">
                <h2 className="text-2xl font-bold text-gradient mb-2">
                  Directions sous {currentSection.titre}
                </h2>
                <p className="text-gray-600">
                  Découvrez les différentes directions et leurs responsables
                </p>
              </div>
              <div className="grid gap-4 animate-slide-in">
                {sousDirections[currentSection.key]?.map((direction, index) => (
                  <SubDirectionCard
                    key={direction.id || index}
                    direction={direction}
                    onClick={() => setCurrentDirection(direction)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              <div className="grid gap-8">
                {ministre && <DirectionCard data={ministre} />}
                {sg && (
                  <DirectionCard 
                    data={sg}
                    showDirections={true}
                    onShowDirections={() => setCurrentSection(sg)}
                  />
                )}
                <div className="grid md:grid-cols-2 gap-8">
                  {dgs.map((dg, index) => (
                    <DirectionCard
                      key={dg.id || index}
                      data={dg}
                      showDirections={true}
                      onShowDirections={() => setCurrentSection(dg)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}