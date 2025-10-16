// src/pages/documentation/lois.js
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { 
  Scale, 
  Download, 
  FileText, 
  Calendar, 
  ChevronRight, 
  Search,
  Filter,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { secureApi } from '@/lib/secureApi';

export default function LoisPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const documentTypes = ['all', 'Loi', 'Décret', 'Arrêté', 'Ordonnance'];
  const years = ['all', '2024', '2023', '2022', '2021', '2020', '2019', '2018'];

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await secureApi.get('/api/documents?category=regulatory', false);
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
    const matchesType = selectedType === 'all' || doc.subType === selectedType;
    return matchesSearch && matchesYear && matchesType;
  });

  const getTypeColor = (type) => {
    switch (type) {
      case 'Loi': return 'bg-red-100 text-red-800';
      case 'Décret': return 'bg-blue-100 text-blue-800';
      case 'Arrêté': return 'bg-green-100 text-green-800';
      case 'Ordonnance': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    return <Scale className="w-4 h-4" />;
  };

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
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-900 to-red-800 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-center text-sm mb-4">
            <Link href="/" className="hover:text-red-200 transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href="/documentation" className="hover:text-red-200 transition-colors">
              Documentation
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span>Lois et Décrets</span>
          </div>
          
          <div className="flex items-center mb-6">
            <Scale className="w-10 h-10 mr-4" />
            <h1 className="text-4xl font-bold">Lois et Décrets</h1>
          </div>
          
          <p className="text-xl text-red-100 max-w-3xl">
            Consultez l'ensemble des textes législatifs et réglementaires régissant 
            l'enseignement supérieur, la recherche et l'innovation technologique au Niger.
          </p>
          
          <div className="mt-6 text-red-100">
            {filteredDocuments.length} document{filteredDocuments.length > 1 ? 's' : ''} trouvé{filteredDocuments.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-6">
          {/* Filtres et recherche */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher dans les textes législatifs..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="all">Tous les types</option>
                  {documentTypes.slice(1).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <select
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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

          {/* Statistiques par type */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {documentTypes.slice(1).map(type => {
              const count = documents.filter(doc => doc.subType === type).length;
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`p-4 rounded-xl transition-all text-center ${
                    selectedType === type
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'bg-white hover:bg-red-50 shadow'
                  }`}
                >
                  <div className="flex justify-center mb-2">
                    {getTypeIcon(type)}
                  </div>
                  <div className="font-medium text-sm mb-1">{type}</div>
                  <div className="text-xs opacity-75">{count} document{count > 1 ? 's' : ''}</div>
                </button>
              );
            })}
          </div>

          {/* Liste des documents */}
          <div className="space-y-4">
            {filteredDocuments.map((doc) => (
              <div 
                key={doc._id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {doc.subType && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(doc.subType)}`}>
                          <Scale className="w-3 h-3 inline mr-1" />
                          {doc.subType}
                        </span>
                      )}
                      {doc.status === 'urgent' && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                          Urgent
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
                          Réf: {doc.reference}
                        </div>
                      )}
                    </div>

                    {doc.keywords && doc.keywords.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {doc.keywords.slice(0, 5).map((keyword, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-6 flex flex-col gap-2">
                    <a
                      href={doc.url}
                      download
                      className="p-3 bg-red-50 rounded-lg text-red-600 hover:bg-red-100 transition-colors transform hover:scale-105 flex items-center justify-center"
                      title="Télécharger"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                    {doc.officialUrl && (
                      <a
                        href={doc.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-blue-50 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors transform hover:scale-105 flex items-center justify-center"
                        title="Voir sur le site officiel"
                      >
                        <FileText className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* État vide */}
          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <Scale className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-600 mb-2">
                Aucun document trouvé
              </h3>
              <p className="text-gray-500">
                Essayez de modifier vos critères de recherche.
              </p>
            </div>
          )}

          {/* Section informative */}
          <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center mb-6">À propos de nos textes législatifs</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-lg mb-3">Hiérarchie des normes</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <Scale className="w-4 h-4 mr-2 text-red-600" />
                    <strong>Lois :</strong> Votées par l'Assemblée Nationale
                  </li>
                  <li className="flex items-center">
                    <Scale className="w-4 h-4 mr-2 text-blue-600" />
                    <strong>Décrets :</strong> Pris par le Président ou le Premier Ministre
                  </li>
                  <li className="flex items-center">
                    <Scale className="w-4 h-4 mr-2 text-green-600" />
                    <strong>Arrêtés :</strong> Pris par les ministres
                  </li>
                  <li className="flex items-center">
                    <Scale className="w-4 h-4 mr-2 text-purple-600" />
                    <strong>Ordonnances :</strong> Mesures d'application immédiate
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-3">Domaines couverts</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Organisation de l'enseignement supérieur</li>
                  <li>• Statuts des établissements universitaires</li>
                  <li>• Recherche scientifique et innovation</li>
                  <li>• Coopération universitaire internationale</li>
                  <li>• Bourses et aides aux étudiants</li>
                  <li>• Qualité et accréditation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}