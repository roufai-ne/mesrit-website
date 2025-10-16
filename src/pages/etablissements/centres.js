// src/pages/etablissements/centres.js
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { 
  GraduationCap, 
  MapPin, 
  Users, 
  Clock, 
  ChevronRight, 
  Search,
  Award,
  BookOpen,
  Briefcase,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { secureApi } from '@/lib/secureApi';

export default function CentresPage() {
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'Formation Continue', 'Perfectionnement', 'Reconversion', 'Certification'];

  useEffect(() => {
    fetchCentres();
  }, []);

  const fetchCentres = async () => {
    try {
      setLoading(true);
      const data = await secureApi.get('/api/establishments?type=Centre', false);
      setCentres(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCentres = centres.filter(centre => {
    const matchesSearch = centre.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         centre.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || centre.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Formation Continue': return 'bg-blue-100 text-blue-800';
      case 'Perfectionnement': return 'bg-green-100 text-green-800';
      case 'Reconversion': return 'bg-orange-100 text-orange-800';
      case 'Certification': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Formation Continue': return <BookOpen className="w-4 h-4" />;
      case 'Perfectionnement': return <Target className="w-4 h-4" />;
      case 'Reconversion': return <Briefcase className="w-4 h-4" />;
      case 'Certification': return <Award className="w-4 h-4" />;
      default: return <GraduationCap className="w-4 h-4" />;
    }
  };

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
      <div className="bg-gradient-to-r from-orange-900 to-orange-800 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-center text-sm mb-4">
            <Link href="/" className="hover:text-orange-200 transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href="/etablissements" className="hover:text-orange-200 transition-colors">
              Établissements
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span>Centres de Formation</span>
          </div>
          
          <div className="flex items-center mb-6">
            <GraduationCap className="w-10 h-10 mr-4" />
            <h1 className="text-4xl font-bold">Centres de Formation Continue</h1>
          </div>
          
          <p className="text-xl text-orange-100 max-w-3xl">
            Des centres spécialisés dans la formation continue, le perfectionnement professionnel 
            et la reconversion, accompagnant les professionnels tout au long de leur carrière.
          </p>
          
          <div className="mt-6 text-orange-100">
            {filteredCentres.length} centre{filteredCentres.length > 1 ? 's' : ''} trouvé{filteredCentres.length > 1 ? 's' : ''}
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
                    placeholder="Rechercher un centre de formation..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="md:w-64">
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">Toutes les catégories</option>
                  {categories.slice(1).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Catégories de formation */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {categories.slice(1).map(category => {
              const count = centres.filter(centre => centre.category === category).length;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`p-4 rounded-xl transition-all text-center ${
                    selectedCategory === category
                      ? 'bg-orange-600 text-white shadow-lg'
                      : 'bg-white hover:bg-orange-50 shadow'
                  }`}
                >
                  <div className="flex justify-center mb-2">
                    {getCategoryIcon(category)}
                  </div>
                  <div className="font-medium text-sm mb-1">{category}</div>
                  <div className="text-xs opacity-75">{count} centre{count > 1 ? 's' : ''}</div>
                </button>
              );
            })}
          </div>

          {/* Liste des centres */}
          <div className="grid md:grid-cols-2 gap-6">
            {filteredCentres.map((centre) => (
              <div key={centre._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="h-32 bg-gradient-to-br from-orange-500 to-orange-700 relative">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex justify-between items-end">
                      <div className="text-white">
                        <div className="flex items-center text-sm mb-1 opacity-90">
                          <MapPin className="w-4 h-4 mr-1" />
                          {centre.region}
                        </div>
                        <div className="font-bold">{centre.sigle || centre.nom}</div>
                      </div>
                      {centre.category && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(centre.category)}`}>
                          {centre.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{centre.nom}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{centre.description}</p>

                  <div className="space-y-3 mb-4">
                    {centre.formations && centre.formations.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Formations proposées:</h4>
                        <div className="flex flex-wrap gap-2">
                          {centre.formations.slice(0, 3).map((formation, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm"
                            >
                              {formation}
                            </span>
                          ))}
                          {centre.formations.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                              +{centre.formations.length - 3} autres
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      {centre.trainees && (
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2 text-orange-500" />
                          <span>{centre.trainees.toLocaleString()} stagiaires/an</span>
                        </div>
                      )}
                      {centre.duration && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-orange-500" />
                          <span>{centre.duration}</span>
                        </div>
                      )}
                      {centre.schedule && (
                        <div className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-2 text-orange-500" />
                          <span>{centre.schedule}</span>
                        </div>
                      )}
                      {centre.successRate && (
                        <div className="flex items-center">
                          <Target className="w-4 h-4 mr-2 text-orange-500" />
                          <span>{centre.successRate}% réussite</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-500">
                      <Award className="w-4 h-4 mr-1" />
                      Centre de formation
                    </div>
                    <Link
                      href={`/etablissements/${centre._id}`}
                      className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      En savoir plus
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCentres.length === 0 && (
            <div className="text-center py-12">
              <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-600 mb-2">
                Aucun centre trouvé
              </h3>
              <p className="text-gray-500">
                Essayez de modifier vos critères de recherche.
              </p>
            </div>
          )}

          {/* Section informative */}
          <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center mb-6">Pourquoi choisir la formation continue ?</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-bold mb-2">Apprentissage Continu</h3>
                <p className="text-gray-600">
                  Restez à jour avec les dernières innovations de votre secteur
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-bold mb-2">Perfectionnement</h3>
                <p className="text-gray-600">
                  Développez vos compétences pour évoluer professionnellement
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-bold mb-2">Reconversion</h3>
                <p className="text-gray-600">
                  Changez de carrière avec une formation adaptée à vos objectifs
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-bold mb-2">Certification</h3>
                <p className="text-gray-600">
                  Obtenez des certifications reconnues par les employeurs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}