// src/pages/documentation/circulaires.js
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { 
  FileText, 
  Download, 
  Calendar, 
  ChevronRight, 
  Search,
  AlertTriangle,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { secureApi } from '@/lib/secureApi';

export default function CirculairesPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');

  const years = ['all', '2024', '2023', '2022', '2021', '2020'];

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await secureApi.get('/api/documents?category=circulaires', false);
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
    const matchesYear = selectedYear === 'all' || 
                       new Date(doc.publicationDate).getFullYear().toString() === selectedYear;
    return matchesSearch && matchesYear;
  });

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
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-center text-sm mb-4">
            <Link href="/" className="hover:text-blue-200 transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href="/documentation" className="hover:text-blue-200 transition-colors">
              Documentation
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span>Circulaires</span>
          </div>
          
          <div className="flex items-center mb-6">
            <FileText className="w-10 h-10 mr-4" />
            <h1 className="text-4xl font-bold">Circulaires Ministérielles</h1>
          </div>
          
          <p className="text-xl text-blue-100 max-w-3xl">
            Accédez aux circulaires, notes de service et instructions du ministère 
            destinées aux établissements d'enseignement supérieur.
          </p>
          
          <div className="mt-6 text-blue-100">
            {filteredDocuments.length} circulaire{filteredDocuments.length > 1 ? 's' : ''} trouvée{filteredDocuments.length > 1 ? 's' : ''}
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
                    placeholder="Rechercher dans les circulaires..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="md:w-48">
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="all">Toutes les années</option>
                  {years.slice(1).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Liste des circulaires */}
          <div className="space-y-4">
            {filteredDocuments.map((doc) => (
              <div 
                key={doc._id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        <Target className="w-3 h-3 inline mr-1" />
                        Circulaire
                      </span>
                      {doc.priority && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                          Priorité {doc.priority}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3 text-gray-900">{doc.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{doc.description}</p>
                    
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
                        <span className="uppercase">{doc.type}</span>
                        {doc.size && <span> • {doc.size}</span>}
                      </div>
                      {doc.reference && (
                        <div className="text-blue-600 font-medium">
                          N° {doc.reference}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <a
                    href={doc.url}
                    download
                    className="ml-6 p-3 bg-blue-50 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors transform hover:scale-105"
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
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-600 mb-2">
                Aucune circulaire trouvée
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