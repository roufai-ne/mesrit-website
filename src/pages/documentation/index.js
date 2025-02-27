import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Download, FileText, Calendar, BookOpen, Filter, AlertTriangle } from 'lucide-react';
import { secureApi } from '@/lib/secureApi';

export default function DocumentationPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Tous les documents' },
    { id: 'regulatory', label: 'Textes réglementaires' },
    { id: 'policy', label: 'Politiques' },
    { id: 'reports', label: 'Rapports' },
    { id: 'guides', label: 'Guides' }
  ];

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
    return matchesSearch && matchesCategory;
  });

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
      {/* Hero Section reste identique */}

      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-6">
          {/* Statistiques des documents */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {categories.filter(cat => cat.id !== 'all').map((category) => {
              const count = documents.filter(doc => doc.category === category.id).length;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-4 rounded-xl transition-all ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white hover:bg-blue-50'
                  }`}
                >
                  <div className="text-2xl font-bold mb-1">{count}</div>
                  <div className="text-sm">{category.label}</div>
                </button>
              );
            })}
          </div>

          {/* Filtres de catégories */}
          <div className="flex items-center space-x-4 mb-8 overflow-x-auto pb-4">
            <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all flex-shrink-0 ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Grille de documents */}
          <div className="grid md:grid-cols-2 gap-6">
            {filteredDocuments.map((doc) => (
              <div 
                key={doc._id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        doc.category === 'regulatory' ? 'bg-purple-100 text-purple-700' :
                        doc.category === 'policy' ? 'bg-blue-100 text-blue-700' :
                        doc.category === 'reports' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {categories.find(cat => cat.id === doc.category)?.label}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{doc.title}</h3>
                    <p className="text-gray-600 mb-4">{doc.description}</p>
                    
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(doc.publicationDate).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        <span className="uppercase">{doc.type}</span> • {doc.size}
                      </div>
                    </div>
                  </div>
                  
                  
                  <a
                    href={doc.url}
                    download
                    className="ml-4 p-3 bg-blue-50 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors transform hover:scale-105"
                    title="Télécharger"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* État vide */}
          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-600 mb-2">
                Aucun document trouvé
              </h3>
              <p className="text-gray-500">
                Essayez de modifier vos critères de recherche
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}