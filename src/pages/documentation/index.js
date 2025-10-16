import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Download, FileText, Calendar, BookOpen, Filter, AlertTriangle, Search, ChevronRight, Scale, BarChart3, Users } from 'lucide-react';
import Link from 'next/link';
import { secureApi } from '@/lib/secureApi';

export default function DocumentationPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');

  const categories = [
    { id: 'all', label: 'Tous les documents', icon: BookOpen, color: 'niger-orange' },
    { id: 'regulatory', label: 'Textes réglementaires', icon: Scale, color: 'niger-orange' },
    { id: 'policy', label: 'Politiques', icon: Users, color: 'niger-green' },
    { id: 'reports', label: 'Rapports', icon: BarChart3, color: 'niger-orange' },
    { id: 'guides', label: 'Guides', icon: BookOpen, color: 'niger-green' }
  ];
  
  const documentTypes = ['all', 'PDF', 'DOC', 'DOCX', 'XLS', 'XLSX'];
  const years = ['all', '2024', '2023', '2022', '2021', '2020', '2019', '2018'];

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await secureApi.get('/api/documents', false); // Public endpoint
      setDocuments(data.filter(doc => doc.status === 'published'));
    } catch (error) {
      console.error('Erreur:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    const matchesYear = selectedYear === 'all' || 
                       new Date(doc.publicationDate).getFullYear().toString() === selectedYear;
    return matchesSearch && matchesCategory && matchesType && matchesYear;
  });
  
  // Statistiques par catégorie
  const getStatistics = () => {
    const stats = {
      total: documents.length,
      regulatory: documents.filter(d => d.category === 'regulatory').length,
      policy: documents.filter(d => d.category === 'policy').length,
      reports: documents.filter(d => d.category === 'reports').length,
      guides: documents.filter(d => d.category === 'guides').length
    };
    return stats;
  };

  const statistics = getStatistics();
  
  const handleFilterChange = (type, value) => {
    switch(type) {
      case 'category':
        setSelectedCategory(value);
        break;
      case 'type':
        setSelectedType(value);
        break;
      case 'year':
        setSelectedYear(value);
        break;
      default:
        break;
    }
  };

  // État de chargement
  if (loading) {
    return (
      <MainLayout>
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-16">
          {/* Hero Section identique */}
        </div>
        <div className="py-12 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-6 py-12">
          <div className="bg-red-50 text-red-600 p-6 rounded-lg flex items-center">
            <AlertTriangle className="w-6 h-6 mr-3" />
            <div>
              <h3 className="font-bold">Erreur de chargement</h3>
              <p>{error}</p>
            </div>
          </div>
          <button 
            onClick={fetchDocuments}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Hero Section (sans la première ligne de stats) */}
      <div className="relative bg-gradient-to-br from-niger-orange via-niger-orange-dark to-niger-green text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-niger-white/[0.05] bg-[size:20px_20px] opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="container mx-auto px-6 relative">
          <div className="flex items-center text-sm mb-4">
            <Link href="/" className="hover:text-niger-cream transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-niger-cream font-medium">Documentation</span>
          </div>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center mb-6">
                <BookOpen className="w-12 h-12 mr-4 text-niger-cream" />
                <div>
                  <h1 className="text-5xl font-bold">Documentation</h1>
                  <p className="text-niger-cream/80 text-lg mt-2">Centre de Ressources Documentaires</p>
                </div>
              </div>
              <p className="text-xl text-niger-cream max-w-3xl leading-relaxed mb-6">
                Accédez à l'ensemble de nos documents officiels, textes législatifs, rapports et guides pratiques. 
                Une ressource complète pour comprendre le cadre réglementaire et les politiques du secteur 
                avec recherche avancée et filtres par catégorie.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-b from-niger-cream to-white dark:from-secondary-900 dark:to-secondary-800 shadow-2xl relative -mt-12 rounded-2xl mx-auto container px-6 transition-colors duration-300">
        <div className="p-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {categories.map((category) => {
              const count = category.id === 'all' ? statistics.total : statistics[category.id] || 0;
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => handleFilterChange('category', category.id)}
                  className={`p-6 rounded-xl transition-all duration-300 text-center transform hover:scale-105 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-niger-orange to-niger-green text-white shadow-xl'
                      : 'bg-white dark:bg-secondary-800 hover:bg-niger-orange/10 dark:hover:bg-niger-orange/20 shadow-lg border border-niger-orange/20'
                  }`}
                >
                  <Icon className="w-8 h-8 mx-auto mb-3 text-niger-orange" />
                  <div className="text-2xl font-bold mb-1">{count}</div>
                  <div className="text-sm font-medium">{category.label}</div>
                </button>
              );
            })}
          </div>

          {/* Advanced Filters */}
          <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg p-6 border border-niger-orange/10 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-niger-orange" />
              <h3 className="text-lg font-semibold text-niger-green dark:text-niger-green-light">Filtres avancés</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher dans les documents..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-niger-orange/20 focus:ring-2 focus:ring-niger-orange focus:border-niger-orange transition-all duration-300 bg-white dark:bg-secondary-700 text-readable dark:text-foreground"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-niger-orange w-5 h-5" />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="px-4 py-3 rounded-xl border border-niger-orange/20 focus:ring-2 focus:ring-niger-orange focus:border-niger-orange transition-all duration-300 bg-white dark:bg-secondary-700 text-readable dark:text-foreground"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
              
              <select
                value={selectedType}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="px-4 py-3 rounded-xl border border-niger-orange/20 focus:ring-2 focus:ring-niger-orange focus:border-niger-orange transition-all duration-300 bg-white dark:bg-secondary-700 text-readable dark:text-foreground"
              >
                <option value="all">Tous les types</option>
                {documentTypes.slice(1).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              
              <select
                value={selectedYear}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className="px-4 py-3 rounded-xl border border-niger-orange/20 focus:ring-2 focus:ring-niger-orange focus:border-niger-orange transition-all duration-300 bg-white dark:bg-secondary-700 text-readable dark:text-foreground"
              >
                <option value="all">Toutes les années</option>
                {years.slice(1).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Documents Grid */}
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-secondary-800 rounded-2xl shadow-xl border border-niger-orange/10">
              <BookOpen className="w-20 h-20 text-niger-orange/60 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-niger-green dark:text-niger-green-light mb-4">
                Aucun document trouvé
              </h3>
              <p className="text-readable-muted dark:text-muted-foreground max-w-md mx-auto">
                Essayez de modifier vos critères de recherche ou supprimez certains filtres pour voir plus de résultats.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedType('all');
                  setSelectedYear('all');
                }}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-niger-orange to-niger-green text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((doc) => {
                const category = categories.find(cat => cat.id === doc.category);
                return (
                  <div 
                    key={doc._id}
                    className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-niger-orange/10 hover:border-niger-orange/30 transform hover:-translate-y-1 group"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              doc.category === 'regulatory' ? 'bg-red-100 text-red-700 border border-red-200' :
                              doc.category === 'policy' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                              doc.category === 'reports' ? 'bg-green-100 text-green-700 border border-green-200' :
                              'bg-niger-orange/20 text-niger-orange-dark border border-niger-orange/30'
                            }`}>
                              {category?.label}
                            </span>
                            {doc.type && (
                              <span className="px-2 py-1 bg-niger-cream dark:bg-secondary-700 text-niger-green dark:text-niger-green-light rounded text-xs font-medium">
                                {doc.type.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-bold mb-3 text-niger-green dark:text-niger-green-light group-hover:text-niger-orange dark:group-hover:text-niger-orange-light transition-colors">
                            {doc.title}
                          </h3>
                          <p className="text-readable-muted dark:text-muted-foreground mb-4 line-clamp-2">
                            {doc.description}
                          </p>
                          
                          <div className="flex items-center text-sm text-readable-muted dark:text-muted-foreground space-x-4">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-niger-orange" />
                              {new Date(doc.publicationDate).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                            {doc.size && (
                              <div className="flex items-center">
                                <FileText className="w-4 h-4 mr-2 text-niger-green" />
                                {doc.size}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <a
                          href={doc.url}
                          download
                          className="ml-4 p-4 bg-gradient-to-r from-niger-orange/20 to-niger-green/20 dark:from-niger-orange/30 dark:to-niger-green/30 rounded-xl text-niger-orange hover:from-niger-orange hover:to-niger-green hover:text-white transition-all duration-300 transform hover:scale-110 shadow-lg group-hover:shadow-xl"
                          title="Télécharger"
                        >
                          <Download className="w-6 h-6" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Quick Access Links */}
          <div className="mt-12 grid md:grid-cols-4 gap-6">
            <Link href="/documentation/lois" className="group">
              <div className="bg-white dark:bg-secondary-800 rounded-2xl p-6 border border-red-200 hover:border-red-400 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl">
                <Scale className="w-10 h-10 text-red-600 mb-4" />
                <h4 className="font-bold text-lg mb-2 text-niger-green dark:text-niger-green-light group-hover:text-red-600">Lois et Décrets</h4>
                <p className="text-sm text-readable-muted dark:text-muted-foreground">Textes législatifs et réglementaires</p>
              </div>
            </Link>
            
            <Link href="/documentation/rapports" className="group">
              <div className="bg-white dark:bg-secondary-800 rounded-2xl p-6 border border-green-200 hover:border-green-400 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl">
                <BarChart3 className="w-10 h-10 text-green-600 mb-4" />
                <h4 className="font-bold text-lg mb-2 text-niger-green dark:text-niger-green-light group-hover:text-green-600">Rapports</h4>
                <p className="text-sm text-readable-muted dark:text-muted-foreground">Rapports d'activité et études</p>
              </div>
            </Link>
            
            <Link href="/documentation/guides" className="group">
              <div className="bg-white dark:bg-secondary-800 rounded-2xl p-6 border border-niger-orange/30 hover:border-niger-orange transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl">
                <BookOpen className="w-10 h-10 text-niger-orange mb-4" />
                <h4 className="font-bold text-lg mb-2 text-niger-green dark:text-niger-green-light group-hover:text-niger-orange">Guides</h4>
                <p className="text-sm text-readable-muted dark:text-muted-foreground">Guides pratiques et procédures</p>
              </div>
            </Link>
            
            <Link href="/documentation/circulaires" className="group">
              <div className="bg-white dark:bg-secondary-800 rounded-2xl p-6 border border-blue-200 hover:border-blue-400 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl">
                <Users className="w-10 h-10 text-blue-600 mb-4" />
                <h4 className="font-bold text-lg mb-2 text-niger-green dark:text-niger-green-light group-hover:text-blue-600">Circulaires</h4>
                <p className="text-sm text-readable-muted dark:text-muted-foreground">Circulaires ministérielles</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}