// src/pages/documentation/guides.js
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { 
  BookOpen, 
  Download, 
  Calendar, 
  ChevronRight, 
  Search,
  User,
  Users,
  GraduationCap,
  Briefcase,
  Star,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { secureApi } from '@/lib/secureApi';

export default function GuidesPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('all');

  const audiences = ['all', 'Étudiants', 'Enseignants', 'Administrateurs', 'Chercheurs'];

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await secureApi.get('/api/documents?category=guides', false);
      setDocuments(data.filter(doc => doc.status === 'published'));
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAudience = selectedAudience === 'all' || doc.audience === selectedAudience;
    return matchesSearch && matchesAudience;
  });

  const getAudienceIcon = (audience) => {
    switch (audience) {
      case 'Étudiants': return <GraduationCap className="w-4 h-4" />;
      case 'Enseignants': return <User className="w-4 h-4" />;
      case 'Administrateurs': return <Briefcase className="w-4 h-4" />;
      case 'Chercheurs': return <BookOpen className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getAudienceColor = (audience) => {
    switch (audience) {
      case 'Étudiants': return 'bg-blue-100 text-blue-800';
      case 'Enseignants': return 'bg-green-100 text-green-800';
      case 'Administrateurs': return 'bg-purple-100 text-purple-800';
      case 'Chercheurs': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const guideCategories = [
    {
      title: "Guides pour Étudiants",
      icon: GraduationCap,
      color: "blue",
      description: "Tout ce qu'il faut savoir pour réussir vos études",
      guides: [
        "Guide d'inscription universitaire",
        "Procédures de demande de bourse",
        "Règlement intérieur étudiant",
        "Guide des services aux étudiants"
      ]
    },
    {
      title: "Guides pour Enseignants",
      icon: User,
      color: "green",
      description: "Ressources pédagogiques et administratives",
      guides: [
        "Manuel de l'enseignant",
        "Procédures d'évaluation",
        "Gestion des cours en ligne",
        "Recherche et publications"
      ]
    },
    {
      title: "Guides Administratifs",
      icon: Briefcase,
      color: "purple",
      description: "Procédures et directives administratives",
      guides: [
        "Procédures RH",
        "Gestion budgétaire",
        "Marchés publics",
        "Sécurité informatique"
      ]
    },
    {
      title: "Guides de Recherche",
      icon: BookOpen,
      color: "orange",
      description: "Méthodologie et outils de recherche",
      guides: [
        "Méthodologie de recherche",
        "Financement de projets",
        "Éthique de la recherche",
        "Propriété intellectuelle"
      ]
    }
  ];

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-900 to-teal-800 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-center text-sm mb-4">
            <Link href="/" className="hover:text-teal-200 transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href="/documentation" className="hover:text-teal-200 transition-colors">
              Documentation
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span>Guides</span>
          </div>
          
          <div className="flex items-center mb-6">
            <BookOpen className="w-10 h-10 mr-4" />
            <h1 className="text-4xl font-bold">Guides Pratiques</h1>
          </div>
          
          <p className="text-xl text-teal-100 max-w-3xl">
            Des guides détaillés pour vous accompagner dans vos démarches administratives, 
            pédagogiques et de recherche au sein du système d'enseignement supérieur nigérien.
          </p>
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
                    placeholder="Rechercher un guide..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <select
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                value={selectedAudience}
                onChange={(e) => setSelectedAudience(e.target.value)}
              >
                <option value="all">Tous les publics</option>
                {audiences.slice(1).map(audience => (
                  <option key={audience} value={audience}>{audience}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Catégories de guides */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {guideCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 bg-${category.color}-100 rounded-lg flex items-center justify-center mr-4`}>
                      <Icon className={`w-6 h-6 text-${category.color}-600`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{category.title}</h3>
                      <p className="text-gray-600 text-sm">{category.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {category.guides.map((guide, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <div className={`w-1.5 h-1.5 bg-${category.color}-500 rounded-full mr-3`}></div>
                        {guide}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Documents disponibles */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Documents Disponibles</h2>
            
            {filteredDocuments.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">
                  Aucun guide trouvé
                </h3>
                <p className="text-gray-500">
                  Les guides sont en cours de préparation. Revenez bientôt !
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredDocuments.map((doc) => (
                  <div 
                    key={doc._id}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getAudienceColor(doc.audience)}`}>
                            {getAudienceIcon(doc.audience)}
                            <span className="ml-1">{doc.audience}</span>
                          </span>
                          {doc.featured && (
                            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs flex items-center">
                              <Star className="w-3 h-3 mr-1" />
                              Populaire
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{doc.title}</h3>
                        <p className="text-gray-600 mb-3">{doc.description}</p>
                        
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(doc.publicationDate).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long'
                            })}
                          </div>
                          {doc.readingTime && (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {doc.readingTime} min
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <a
                        href={doc.url}
                        download
                        className="ml-4 p-3 bg-teal-50 rounded-lg text-teal-600 hover:bg-teal-100 transition-colors"
                        title="Télécharger"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section d'aide */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center mb-6">Besoin d'aide supplémentaire ?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="font-bold mb-2">FAQ</h3>
                <p className="text-gray-600 mb-4">
                  Consultez notre foire aux questions pour des réponses rapides
                </p>
                <Link
                  href="/faq"
                  className="text-teal-600 hover:text-teal-800 font-medium"
                >
                  Voir la FAQ →
                </Link>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="font-bold mb-2">Support</h3>
                <p className="text-gray-600 mb-4">
                  Contactez notre équipe de support pour une assistance personnalisée
                </p>
                <Link
                  href="/contact"
                  className="text-teal-600 hover:text-teal-800 font-medium"
                >
                  Nous contacter →
                </Link>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="font-bold mb-2">Formulaires</h3>
                <p className="text-gray-600 mb-4">
                  Téléchargez les formulaires officiels pour vos démarches
                </p>
                <Link
                  href="/documentation"
                  className="text-teal-600 hover:text-teal-800 font-medium"
                >
                  Voir les formulaires →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// Forcer SSR pour éviter les erreurs durant le SSG
export async function getServerSideProps() {
  return {
    props: {}
  };
}
