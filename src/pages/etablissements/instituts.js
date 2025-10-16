// src/pages/etablissements/instituts.js
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { 
  School, 
  MapPin, 
  Users, 
  BookOpen, 
  ChevronRight, 
  Search,
  Award,
  FlaskConical,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';
import { secureApi } from '@/lib/secureApi';

export default function InstitutsPage() {
  const [instituts, setInstituts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');

  const domains = ['all', 'Technologie', 'Sciences Appliquées', 'Agriculture', 'Santé', 'Commerce'];

  useEffect(() => {
    fetchInstituts();
  }, []);

  const fetchInstituts = async () => {
    try {
      setLoading(true);
      const data = await secureApi.get('/api/establishments?type=Institut', false);
      setInstituts(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInstituts = instituts.filter(institut => {
    const matchesSearch = institut.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         institut.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = selectedDomain === 'all' || institut.domain === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  const getDomainIcon = (domain) => {
    switch (domain) {
      case 'Technologie': return <FlaskConical className="w-5 h-5" />;
      case 'Commerce': return <Briefcase className="w-5 h-5" />;
      case 'Santé': return <Award className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const getDomainColor = (domain) => {
    switch (domain) {
      case 'Technologie': return 'bg-purple-100 text-purple-800';
      case 'Commerce': return 'bg-green-100 text-green-800';
      case 'Santé': return 'bg-red-100 text-red-800';
      case 'Agriculture': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
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
      <div className="bg-gradient-to-r from-purple-900 to-purple-800 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-center text-sm mb-4">
            <Link href="/" className="hover:text-purple-200 transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href="/etablissements" className="hover:text-purple-200 transition-colors">
              Établissements
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span>Instituts</span>
          </div>
          
          <div className="flex items-center mb-6">
            <School className="w-10 h-10 mr-4" />
            <h1 className="text-4xl font-bold">Instituts Spécialisés</h1>
          </div>
          
          <p className="text-xl text-purple-100 max-w-3xl">
            Des institutions spécialisées offrant une formation technique et professionnelle 
            de haut niveau dans des domaines stratégiques pour le développement du Niger.
          </p>
          
          <div className="mt-6 text-purple-100">
            {filteredInstituts.length} institut{filteredInstituts.length > 1 ? 's' : ''} trouvé{filteredInstituts.length > 1 ? 's' : ''}
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
                    placeholder="Rechercher un institut..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="md:w-64">
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                >
                  <option value="all">Tous les domaines</option>
                  {domains.slice(1).map(domain => (
                    <option key={domain} value={domain}>{domain}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Domaines d'expertise */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {domains.slice(1).map(domain => {
              const count = instituts.filter(inst => inst.domain === domain).length;
              return (
                <button
                  key={domain}
                  onClick={() => setSelectedDomain(domain)}
                  className={`p-4 rounded-xl transition-all text-center ${
                    selectedDomain === domain
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-white hover:bg-purple-50 shadow'
                  }`}
                >
                  <div className="flex justify-center mb-2">
                    {getDomainIcon(domain)}
                  </div>
                  <div className="font-medium text-sm">{domain}</div>
                  <div className="text-xs opacity-75">{count} institut{count > 1 ? 's' : ''}</div>
                </button>
              );
            })}
          </div>

          {/* Liste des instituts */}
          <div className="grid md:grid-cols-2 gap-6">
            {filteredInstituts.map((institut) => (
              <div key={institut._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="h-32 bg-gradient-to-br from-purple-500 to-purple-700 relative">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex justify-between items-end">
                      <div className="text-white">
                        <div className="flex items-center text-sm mb-1 opacity-90">
                          <MapPin className="w-4 h-4 mr-1" />
                          {institut.region}
                        </div>
                        <div className="font-bold">{institut.sigle || institut.nom}</div>
                      </div>
                      {institut.domain && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDomainColor(institut.domain)}`}>
                          {institut.domain}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{institut.nom}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{institut.description}</p>

                  <div className="space-y-3 mb-4">
                    {institut.programs && institut.programs.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Programmes:</h4>
                        <div className="flex flex-wrap gap-2">
                          {institut.programs.slice(0, 3).map((program, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                            >
                              {program}
                            </span>
                          ))}
                          {institut.programs.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                              +{institut.programs.length - 3} autres
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      {institut.students && (
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2 text-purple-500" />
                          <span>{institut.students.toLocaleString()} étudiants</span>
                        </div>
                      )}
                      {institut.duration && (
                        <div className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-2 text-purple-500" />
                          <span>{institut.duration}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-500">
                      <Award className="w-4 h-4 mr-1" />
                      Institut spécialisé
                    </div>
                    <Link
                      href={`/etablissements/${institut._id}`}
                      className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      En savoir plus
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredInstituts.length === 0 && (
            <div className="text-center py-12">
              <School className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-600 mb-2">
                Aucun institut trouvé
              </h3>
              <p className="text-gray-500">
                Essayez de modifier vos critères de recherche.
              </p>
            </div>
          )}

          {/* Section informative */}
          <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center mb-6">Pourquoi choisir nos instituts ?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FlaskConical className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-bold mb-2">Formation Spécialisée</h3>
                <p className="text-gray-600">
                  Programmes ciblés sur les besoins spécifiques du marché du travail
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-bold mb-2">Insertion Professionnelle</h3>
                <p className="text-gray-600">
                  Taux d'emploi élevé grâce à une formation pratique et adaptée
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-bold mb-2">Excellence Reconnue</h3>
                <p className="text-gray-600">
                  Diplômes reconnus nationalement et internationalement
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}