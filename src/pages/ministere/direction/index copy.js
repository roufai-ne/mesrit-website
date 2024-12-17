import { React, useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Users, ChevronRight, Mail, Phone, ArrowLeft, ChevronDown } from 'lucide-react';
import Link from 'next/link';

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

  const renderMinisterSection = () => {
    if (!ministre) return null;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative h-[400px]">
          <img 
            src={ministre.photo || '/images/dir/default.jpg'}
            alt={ministre.nom}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <h2 className="text-3xl font-bold mb-2">{ministre.titre}</h2>
            <p className="text-xl">{ministre.nom}</p>
          </div>
        </div>
        <div className="p-8 flex flex-col">
          <div className="bg-blue-50 rounded-lg p-6 mb-6 flex-grow">
            <h3 className="text-xl font-semibold text-blue-800 mb-4">Message du Ministre</h3>
            <p className="text-gray-700 italic">
              {ministre.message || "Message du ministre non disponible"}
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <Mail className="w-5 h-5 mr-3" />
              <a href={`mailto:${ministre.email}`} className="hover:text-blue-600 transition-colors">
                {ministre.email}
              </a>
            </div>
            <div className="flex items-center text-gray-600">
              <Phone className="w-5 h-5 mr-3" />
              <a href={`tel:${ministre.telephone}`} className="hover:text-blue-600 transition-colors">
                {ministre.telephone}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDirectionCard = (data, showDirections = false) => {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 relative group">
        <div className="flex items-center">
          <img 
            src={data.photo || '/images/dir/default.jpg'}
            alt={data.nom}
            className="w-32 h-32 rounded-full object-cover mr-8"
          />
          <div className="flex-grow">
            <h2 className="text-2xl font-bold text-blue-800 mb-2">{data.titre}</h2>
            <p className="text-xl text-gray-700 mb-4">{data.nom}</p>
            <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                <a href={`mailto:${data.email}`} className="hover:text-blue-600">
                  {data.email}
                </a>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                <a href={`tel:${data.telephone}`} className="hover:text-blue-600">
                  {data.telephone}
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {showDirections && (
          <button 
            onClick={() => setCurrentSection(data)}
            className="absolute bottom-0 left-0 right-0 bg-blue-50 text-blue-600 py-3 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2 rounded-b-lg hover:bg-blue-100"
          >
            <Users className="w-5 h-5" />
            <span>Voir les directions</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </button>
        )}
      </div>
    );
  };

  const renderDirectionList = (directions) => {
    return (
      <div className="space-y-4">
        {directions?.map((direction, index) => (
          <div 
            key={index} 
            onClick={() => setCurrentDirection(direction)}
            className="bg-blue-50 p-6 rounded-lg shadow cursor-pointer hover:bg-blue-100 transition-all transform hover:-translate-y-1"
          >
            <span className="text-blue-800 font-semibold text-lg">{direction.nomComplet}</span>
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
          <div className="h-48 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      );
    }

    if (!ministre || !sg || dgs.length === 0) {
      return <div>Aucune donnée disponible</div>;
    }

    return (
      <div className="space-y-12">
        {renderMinisterSection()}
        
        <div className="space-y-8">
          {renderDirectionCard(sg, true)}
          
          <div className="grid md:grid-cols-2 gap-8">
            {dgs.map((dg, index) => (
              <div key={index}>
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
            <Link href="/" className="hover:text-blue-600">Accueil</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href="/ministere" className="hover:text-blue-600">Le Ministère</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span>Direction</span>
          </div>

          {currentDirection ? (
            <div>
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
            <div>
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