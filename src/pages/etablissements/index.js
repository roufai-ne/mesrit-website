import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import EstablishmentMap from '@/components/maps/EstablishmentMap';
import { 
  Search, 
  Building2, 
  MapPin, 
  Globe, 
  ChevronRight, 
  ChevronLeft,
  
} from 'lucide-react';
import Link from 'next/link';

export default function Etablissements() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [startIndex, setStartIndex] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const itemsPerPage = 4;

  const etablissements = [
    { 
      id: 1, 
      nom: "Université Abdou Moumouni", 
      type: "Université", 
      ville: "Niamey",
      logo: "/images/logos/uam.jpg",
      website: "https://uam.edu.ne",
      description: "Plus grande université publique du Niger",
      coordinates: { lat: 13.5137, lng: 2.1098 }
    },
    { 
      id: 2, 
      nom: "École des Mines, de l'Industrie et de la Géologie (EMIG)", 
      type: "École", 
      ville: "Niamey",
      logo: "/images/logos/emig.png", 
      website: "https://www.emig-niger.org/",
      description: "Formation en ingénierie minière et géologique",
      coordinates: { lat: 13.5287, lng: 2.1028 }
    },
    { 
      id: 3, 
      nom: "Université Dan Dicko Dankoulodo", 
      type: "Université", 
      ville: "Maradi",
      logo: "/images/logos/uddm.jpg",
      website: "https://uddm.edu.ne",
      description: "Université publique de Maradi",
      coordinates: { lat: 13.4833, lng: 7.0833 }
    },
    { 
      id: 4, 
      nom: "Université André Salifou", 
      type: "Université", 
      ville: "Zinder",
      logo: "/images/logos/uas.jpg",
      website: "https://uasz.edu.ne",
      description: "Université publique de Zinder",
      coordinates: { lat: 13.8039, lng: 8.9881 }
    },
    { 
      id: 5, 
      nom: "Université de Tahoua", 
      type: "Université", 
      ville: "Tahoua",
      logo: "/images/logos/udh.jpg",
      website: "https://ut.edu.ne",
      description: "Université publique de Tahoua",
      coordinates: { lat: 14.8888, lng: 5.2692 }
    },
    { 
      id: 6, 
      nom: "Institut National de la Jeunesse et des Sports", 
      type: "Institut", 
      ville: "Niamey",
      logo: "/images/logos/injs.png",
      website: "https://injs.edu.ne",
      description: "Formation en sport et éducation physique",
      coordinates: { lat: 13.5127, lng: 2.1128 }
    }
  ];
  const [selectedEtablissement, setSelectedEtablissement] = useState(null);
  

// Ajoutez cette fonction
const handleMarkerClick = (id) => {
  setSelectedEtablissement(id);
  // Optionnellement, faites défiler jusqu'à la carte
  const mapElement = document.getElementById('map-section');
  if (mapElement) {
    mapElement.scrollIntoView({ behavior: 'smooth' });
  }
};
  const filteredEtablissements = useMemo(() => {
    return etablissements.filter(etab => {
      const matchesSearch = etab.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          etab.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || etab.type === selectedType;
      const matchesCity = selectedCity === 'all' || etab.ville === selectedCity;

      return matchesSearch && matchesType && matchesCity;
    });
  }, [searchTerm, selectedType, selectedCity]);

  const types = [...new Set(etablissements.map(etab => etab.type))];
  const villes = [...new Set(etablissements.map(etab => etab.ville))];
  const displayedItems = filteredEtablissements.slice(startIndex, startIndex + itemsPerPage);

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-center text-sm mb-4">
            <Link href="/" className="hover:text-blue-200 transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span>Établissements</span>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-4">Nos Établissements</h1>
              <p className="text-xl text-blue-100 max-w-2xl">
                Découvrez notre réseau d'établissements d'enseignement supérieur à travers le Niger
              </p>
            </div>
            <div className="mt-6 md:mt-0 flex items-center space-x-4">
              <button 
                onClick={() => setShowMap(!showMap)}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center space-x-2"
              >
                <MapPin className="w-5 h-5" />
                <span>{showMap ? 'Masquer la carte' : 'Voir la carte'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow-lg relative -mt-8 rounded-xl mx-auto container px-6">
        <div className="flex flex-col md:flex-row gap-4 p-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un établissement..."
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          <select 
            className="px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">Tous les types</option>
            {types.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select 
            className="px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            <option value="all">Toutes les villes</option>
            {villes.map(ville => (
              <option key={ville} value={ville}>{ville}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {showMap && (
          <div className="mb-12 rounded-xl overflow-hidden shadow-lg">
            <EstablishmentMap 
              etablissements={filteredEtablissements}
                selectedId={selectedEtablissement}
                onMarkerClick={handleMarkerClick}/>
          </div>
        )}

        {filteredEtablissements.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">
              Aucun établissement trouvé
            </h3>
            <p className="text-gray-500">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {displayedItems.map((etab) => (
                <div 
                  key={etab.id} 
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="p-6">
                    <div className="flex items-start space-x-6">
                      <div className="w-32 h-32 bg-gray-50 rounded-lg p-4 flex-shrink-0">
                        <img 
                          src={etab.logo}
                          alt={`Logo ${etab.nom}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-3 text-gray-900">{etab.nom}</h3>
                        <p className="text-gray-600 mb-4">{etab.description}</p>
                        
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="flex items-center text-gray-600">
                            <Building2 className="w-4 h-4 mr-2 text-blue-600" />
                            <span>{etab.type}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                            <span>{etab.ville}</span>
                          </div>
                        </div>

                        <a 
                          href={etab.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Globe className="w-4 h-4 mr-2" />
                          Visiter le site web
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setStartIndex(prev => Math.max(0, prev - itemsPerPage))}
                disabled={startIndex === 0}
                className={`p-3 rounded-lg transition-all duration-300 ${
                  startIndex === 0 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setStartIndex(prev => Math.min(filteredEtablissements.length - itemsPerPage, prev + itemsPerPage))}
                disabled={startIndex + itemsPerPage >= filteredEtablissements.length}
                className={`p-3 rounded-lg transition-all duration-300 ${
                  startIndex + itemsPerPage >= filteredEtablissements.length 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}