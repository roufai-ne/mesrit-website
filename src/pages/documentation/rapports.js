// src/pages/documentation/rapports.js
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  ChevronRight, 
  Search,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { secureApi } from '@/lib/secureApi';

export default function RapportsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const reportTypes = ['all', 'Rapport Annuel', 'Rapport d\'Activité', 'Rapport de Recherche', 'Rapport Statistique'];

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await secureApi.get('/api/documents?category=reports', false);
      setDocuments(data.filter(doc => doc.status === 'published'));
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || doc.subType === selectedType;
    return matchesSearch && matchesType;
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
      <div className="bg-gradient-to-r from-green-900 to-green-800 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-center text-sm mb-4">
            <Link href="/" className="hover:text-green-200 transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href="/documentation" className="hover:text-green-200 transition-colors">
              Documentation
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span>Rapports</span>
          </div>
          
          <div className="flex items-center mb-6">
            <BarChart3 className="w-10 h-10 mr-4" />
            <h1 className="text-4xl font-bold">Rapports Annuels</h1>
          </div>
          
          <p className="text-xl text-green-100 max-w-3xl">
            Découvrez nos rapports d'activité, bilans statistiques et études sectorielles 
            sur l'évolution de l'enseignement supérieur au Niger.
          </p>
        </div>
      </div>

      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-6">
          {/* Filtres */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher un rapport..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <select
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {reportTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'Tous les types' : type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grille des rapports */}
          <div className="grid md:grid-cols-2 gap-6">
            {filteredDocuments.map((doc) => (
              <div 
                key={doc._id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      <TrendingUp className="w-3 h-3 inline mr-1" />
                      {doc.subType || 'Rapport'}
                    </span>
                  </div>
                  <a
                    href={doc.url}
                    download
                    className="p-2 bg-green-50 rounded-lg text-green-600 hover:bg-green-100 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
                
                <h3 className="text-xl font-bold mb-3 text-gray-900">{doc.title}</h3>
                <p className="text-gray-600 mb-4">{doc.description}</p>
                
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(doc.publicationDate).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long'
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}