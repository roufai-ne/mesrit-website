// src/pages/etablissements/ecoles.js
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { 
  BookOpen, 
  MapPin, 
  Users, 
  GraduationCap, 
  ChevronRight, 
  Search,
  Award,
  Clock,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { secureApi } from '@/lib/secureApi';

export default function EcolesPage() {
  const [ecoles, setEcoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const types = ['all', 'École Supérieure', 'École Technique', 'École Professionnelle', 'École de Commerce'];

  useEffect(() => {
    fetchEcoles();
  }, []);

  const fetchEcoles = async () => {
    try {
      setLoading(true);
      const data = await secureApi.get('/api/establishments?type=École', false);
      setEcoles(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEcoles = ecoles.filter(ecole => {
    const matchesSearch = ecole.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ecole.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || ecole.subType === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type) => {
    switch (type) {
      case 'École Supérieure': return 'bg-blue-100 text-blue-800';
      case 'École Technique': return 'bg-green-100 text-green-800';
      case 'École Professionnelle': return 'bg-orange-100 text-orange-800';
      case 'École de Commerce': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <div className="bg-gradient-to-r from-green-900 to-green-800 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-center text-sm mb-4">
            <Link href="/" className="hover:text-green-200 transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href="/etablissements" className="hover:text-green-200 transition-colors">
              Établissements
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span>Écoles</span>
          </div>
          
          <div className="flex items-center mb-6">
            <BookOpen className="w-10 h-10 mr-4" />
            <h1 className="text-4xl font-bold">Écoles Professionnelles</h1>
          </div>
          
          <p className="text-xl text-green-100 max-w-3xl">
            Des écoles spécialisées proposant des formations professionnelles et techniques 
            adaptées aux besoins du marché du travail nigérien.
          </p>
          
          <div className="mt-6 text-green-100">
            {filteredEcoles.length} école{filteredEcoles.length > 1 ? 's' : ''} trouvée{filteredEcoles.length > 1 ? 's' : ''}
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
                    placeholder="Rechercher une école..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="md:w-64">
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="all">Tous les types</option>
                  {types.slice(1).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Types d'écoles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {types.slice(1).map(type => {
              const count = ecoles.filter(ecole => ecole.subType === type).length;
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`p-4 rounded-xl transition-all text-center ${
                    selectedType === type
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-white hover:bg-green-50 shadow'
                  }`}
                >
                  <div className="font-medium text-sm mb-1">{type}</div>
                  <div className="text-xs opacity-75">{count} école{count > 1 ? 's' : ''}</div>
                </button>
              );
            })}
          </div>

          {/* Liste des écoles */}
          <div className="grid md:grid-cols-2 gap-6">
            {filteredEcoles.map((ecole) => (
              <div key={ecole._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="h-32 bg-gradient-to-br from-green-500 to-green-700 relative">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex justify-between items-end">
                      <div className="text-white">
                        <div className="flex items-center text-sm mb-1 opacity-90">
                          <MapPin className="w-4 h-4 mr-1" />
                          {ecole.region}
                        </div>
                        <div className="font-bold">{ecole.sigle || ecole.nom}</div>
                      </div>
                      {ecole.subType && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(ecole.subType)}`}>
                          {ecole.subType}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{ecole.nom}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{ecole.description}</p>

                  <div className="space-y-3 mb-4">
                    {ecole.specializations && ecole.specializations.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Spécialisations:</h4>
                        <div className="flex flex-wrap gap-2">
                          {ecole.specializations.slice(0, 3).map((spec, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm"
                            >
                              {spec}
                            </span>
                          ))}
                          {ecole.specializations.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                              +{ecole.specializations.length - 3} autres
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      {ecole.students && (
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2 text-green-500" />
                          <span>{ecole.students.toLocaleString()} étudiants</span>
                        </div>
                      )}
                      {ecole.duration && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-green-500" />
                          <span>{ecole.duration}</span>
                        </div>
                      )}
                      {ecole.diploma && (
                        <div className="flex items-center">
                          <GraduationCap className="w-4 h-4 mr-2 text-green-500" />
                          <span>{ecole.diploma}</span>
                        </div>
                      )}
                      {ecole.employmentRate && (
                        <div className="flex items-center">
                          <Target className="w-4 h-4 mr-2 text-green-500" />
                          <span>{ecole.employmentRate}% emploi</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-500">
                      <Award className="w-4 h-4 mr-1" />
                      École professionnelle
                    </div>
                    <Link
                      href={`/etablissements/${ecole._id}`}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      En savoir plus
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredEcoles.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-600 mb-2">
                Aucune école trouvée
              </h3>
              <p className="text-gray-500">
                Essayez de modifier vos critères de recherche.
              </p>
            </div>
          )}

          {/* Section informative */}
          <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center mb-6">L'excellence de la formation professionnelle</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold mb-2">Formation Pratique</h3>
                <p className="text-gray-600">
                  Apprentissage axé sur la pratique et l'acquisition de compétences concrètes
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold mb-2">Partenariats Entreprises</h3>
                <p className="text-gray-600">
                  Collaborations étroites avec les entreprises pour garantir l'employabilité
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold mb-2">Certifications Reconnues</h3>
                <p className="text-gray-600">
                  Diplômes et certifications reconnus par les professionnels du secteur
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}