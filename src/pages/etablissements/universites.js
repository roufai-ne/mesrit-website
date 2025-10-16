// src/pages/etablissements/universites.js
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { 
  GraduationCap, 
  MapPin, 
  Users, 
  BookOpen, 
  ChevronRight, 
  Search,
  Calendar,
  Award,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { secureApi } from '@/lib/secureApi';

export default function UniversitesPage() {
  const [universites, setUniversites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');

  const regions = ['all', 'Niamey', 'Maradi', 'Tahoua', 'Zinder', 'Tillabéri', 'Dosso', 'Agadez', 'Diffa'];

  useEffect(() => {
    fetchUniversites();
  }, []);

  const fetchUniversites = async () => {
    try {
      setLoading(true);
      const data = await secureApi.get('/api/establishments?type=Université', false);
      setUniversites(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUniversites = universites.filter(univ => {
    const matchesSearch = univ.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         univ.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === 'all' || univ.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-48 rounded-lg"></div>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

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
            <Link href="/etablissements" className="hover:text-blue-200 transition-colors">
              Établissements
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span>Universités</span>
          </div>
          
          <div className="flex items-center mb-6">
            <GraduationCap className="w-10 h-10 mr-4" />
            <h1 className="text-4xl font-bold">Nos Universités</h1>
          </div>
          
          <p className="text-xl text-blue-100 max-w-3xl">
            Découvrez notre réseau d'universités publiques réparties à travers le Niger, 
            offrant une formation de qualité dans tous les domaines du savoir.
          </p>
          
          <div className="mt-6 text-blue-100">
            {filteredUniversites.length} université{filteredUniversites.length > 1 ? 's' : ''} trouvée{filteredUniversites.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-6">
          {/* Filtres et recherche */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher une université..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="md:w-64">
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                >
                  <option value="all">Toutes les régions</option>
                  {regions.slice(1).map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{universites.length}</div>
              <div className="text-gray-600">Universités</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">8</div>
              <div className="text-gray-600">Régions</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
              <div className="text-gray-600">Filières</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">80K+</div>
              <div className="text-gray-600">Étudiants</div>
            </div>
          </div>

          {/* Liste des universités */}
          <div className="space-y-6">
            {filteredUniversites.map((universite) => (
              <div key={universite._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="md:flex">
                  <div className="md:w-1/3 h-48 md:h-auto bg-gradient-to-br from-blue-500 to-blue-700 relative">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <div className="flex items-center text-sm mb-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {universite.region}
                      </div>
                      <div className="text-xl font-bold">{universite.sigle || universite.nom}</div>
                    </div>
                  </div>
                  
                  <div className="md:w-2/3 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{universite.nom}</h3>
                        <p className="text-gray-600 mb-4">{universite.description}</p>
                      </div>
                      {universite.siteWeb && (
                        <a
                          href={universite.siteWeb}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      {universite.faculties && (
                        <div className="flex items-center text-sm text-gray-600">
                          <BookOpen className="w-4 h-4 mr-2 text-blue-500" />
                          <span>{universite.faculties.length} Facultés</span>
                        </div>
                      )}
                      {universite.students && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2 text-green-500" />
                          <span>{universite.students.toLocaleString()} Étudiants</span>
                        </div>
                      )}
                      {universite.founded && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                          <span>Fondée en {universite.founded}</span>
                        </div>
                      )}
                    </div>

                    {universite.specialties && universite.specialties.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Domaines d'excellence:</h4>
                        <div className="flex flex-wrap gap-2">
                          {universite.specialties.slice(0, 4).map((specialty, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                              {specialty}
                            </span>
                          ))}
                          {universite.specialties.length > 4 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                              +{universite.specialties.length - 4} autres
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-500">
                        <Award className="w-4 h-4 mr-1" />
                        Université publique
                      </div>
                      <Link
                        href={`/etablissements/${universite._id}`}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        En savoir plus
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredUniversites.length === 0 && (
            <div className="text-center py-12">
              <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-600 mb-2">
                Aucune université trouvée
              </h3>
              <p className="text-gray-500">
                Essayez de modifier vos critères de recherche.
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}