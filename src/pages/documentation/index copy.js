// src/pages/documentation/index.js
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { 
  Book, 
  ChevronRight, 
  Download, 
  Search,
  FileText,
  Calendar,
  BookOpen,
  Filter
} from 'lucide-react';

export default function DocumentationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Tous les documents' },
    { id: 'policy', label: 'Politiques' },
    { id: 'reports', label: 'Rapports' },
    { id: 'guides', label: 'Guides' }
  ];

  const documents = [
    {
      title: "Politique nationale de l'enseignement supérieur",
      description: "Document cadre définissant les orientations stratégiques pour le développement de l'enseignement supérieur au Niger.",
      category: "policy",
      date: "2024-01-15",
      type: "pdf",
      size: "2.4 MB",
      url: "/documents/politique.pdf"
    },
    {
      title: "Plan stratégique 2024-2028",
      description: "Plan quinquennal détaillant les objectifs et actions prioritaires du ministère.",
      category: "policy",
      date: "2024-01-10",
      type: "pdf",
      size: "1.8 MB",
      url: "/documents/plan.pdf"
    },
    {
      title: "Rapport annuel 2023",
      description: "Bilan des activités et réalisations du ministère pour l'année 2023.",
      category: "reports",
      date: "2024-02-28",
      type: "pdf",
      size: "3.2 MB",
      url: "/documents/rapport.pdf"
    },
    {
      title: "Guide des procédures",
      description: "Manuel détaillant les procédures administratives du ministère.",
      category: "guides",
      date: "2023-12-20",
      type: "pdf",
      size: "1.5 MB",
      url: "/documents/guide.pdf"
    }
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
            <span>Documentation</span>
          </div>
          
          <h1 className="text-4xl font-bold mb-6">Centre de Documentation</h1>
          <p className="text-xl text-blue-100 max-w-3xl mb-8">
            Accédez à l'ensemble de nos documents officiels, rapports et publications.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <input
              type="search"
              placeholder="Rechercher un document..."
              className="w-full px-6 py-4 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-200 w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-6">
          {/* Category Filter */}
          <div className="flex items-center space-x-4 mb-8 overflow-x-auto pb-4">
            <Filter className="w-5 h-5 text-gray-400" />
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Documents Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {filteredDocuments.map((doc, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{doc.title}</h3>
                    <p className="text-gray-600 mb-4">{doc.description}</p>
                    
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(doc.date).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        {doc.size}
                      </div>
                    </div>
                  </div>
                  
                  <Link 
                    href={doc.url}
                    className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors"
                    title="Télécharger"
                  >
                    <Download className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

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