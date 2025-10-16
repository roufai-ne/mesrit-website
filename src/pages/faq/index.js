import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { 
  ChevronRight, 
  ChevronDown, 
  HelpCircle, 
  Search, 
  Mail, 
  Plus, 
  Minus, 
  AlertCircle, 
  BookOpen, 
  FileText, 
  Loader 
} from 'lucide-react';
import Link from 'next/link';
import { sanitizeForReact } from '@/lib/sanitize';

export default function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState({});

  // Récupération des FAQs depuis l'API
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/faq');
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des FAQs');
        }
        const data = await response.json();
        setFaqs(data);
        
        // Initialiser l'état d'expansion (premier élément ouvert)
        if (data.length > 0) {
          setExpandedItems({ [data[0]._id]: true });
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  // Filtrage des FAQs en fonction de la recherche
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Obtenir les catégories uniques pour le filtrage
  const categories = ['all', ...new Set(faqs.map(faq => faq.category))];

  // Toggle expansion d'un élément FAQ
  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Groupes de ressources pour la section ressources supplémentaires
  const resourceGroups = [
    {
      title: "Guides et Documentation",
      icon: BookOpen,
      items: [
        { title: "Guide de l'étudiant", link: "/documentation" },
        { title: "Procédures administratives", link: "/documentation" }
      ]
    },
    {
      title: "Formulaires",
      icon: FileText,
      items: [
        { title: "Demande de bourse", link: "/formulaires/bourse" },
        { title: "Inscription universitaire", link: "/formulaires/inscription" }
      ]
    },
    {
      title: "Assistance",
      icon: HelpCircle,
      items: [
        { title: "Support technique", link: "/support" },
        { title: "Service aux étudiants", link: "/services-etudiants" }
      ]
    }
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-900 to-blue-800 text-white py-20">
        <div className="container mx-auto px-6">
          <nav aria-label="Breadcrumb" className="flex items-center text-sm mb-4">
            <Link href="/" className="hover:text-blue-200 transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" aria-hidden="true" />
            <span aria-current="page">Foire Aux Questions</span>
          </nav>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Foire Aux Questions
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Trouvez rapidement des réponses à vos questions concernant l'enseignement 
            supérieur, les procédures administratives et les services du ministère.
          </p>

          {/* Barre de recherche */}
          <div className="mt-12 max-w-2xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-blue-300" />
              </div>
              <input
                type="text"
                className="block w-full rounded-lg pl-10 pr-4 py-4 bg-white/10 backdrop-blur-sm text-white placeholder-blue-300 border border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Rechercher une question..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          
          {/* Filtres par catégorie */}
          <div className="mb-10 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? 'bg-niger-orange text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-niger-orange/10 dark:hover:bg-niger-orange/20 border border-gray-200 dark:border-gray-600'
                }`}
              >
                {category === 'all' ? 'Toutes les questions' : category}
              </button>
            ))}
          </div>

          {/* État de chargement */}
          {isLoading && (
            <div className="flex justify-center items-center p-12">
              <Loader className="w-10 h-10 animate-spin text-niger-orange" />
              <span className="ml-3 text-gray-700 dark:text-gray-300">Chargement des questions...</span>
            </div>
          )}

          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-6 rounded-lg flex items-start border border-red-200 dark:border-red-800">
              <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-bold">Erreur de chargement</h3>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Liste des FAQs */}
          {!isLoading && !error && (
            <div className="space-y-4 mb-16">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => (
                  <div
                    key={faq._id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden"
                  >
                    <button
                      className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-niger-orange/20 focus:ring-inset"
                      onClick={() => toggleExpand(faq._id)}
                      aria-expanded={expandedItems[faq._id]}
                    >
                      <div className="flex items-start">
                        <div className="bg-niger-orange/10 dark:bg-niger-orange/20 rounded-lg p-2 mr-4">
                          <HelpCircle className="w-5 h-5 text-niger-orange" aria-hidden="true" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-8">{faq.question}</h3>
                      </div>
                      <div className="flex-shrink-0">
                        {expandedItems[faq._id] ? (
                          <Minus className="w-5 h-5 text-niger-orange" />
                        ) : (
                          <Plus className="w-5 h-5 text-niger-orange" />
                        )}
                      </div>
                    </button>
                    
                    {expandedItems[faq._id] && (
                      <div className="px-6 pb-5 pt-1">
                        <div className="border-t border-gray-100 dark:border-gray-600 pt-4">
                          <div 
                            className="prose prose-niger-orange max-w-none text-gray-700 dark:text-gray-300"
                            dangerouslySetInnerHTML={sanitizeForReact(faq.answer, 'rich')}
                          />
                          {faq.category && (
                            <div className="mt-4">
                              <span className="inline-block px-3 py-1 text-xs font-medium bg-niger-orange/10 dark:bg-niger-orange/20 text-niger-orange dark:text-niger-orange-light rounded-full">
                                {faq.category}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-8 text-center">
                  <div className="inline-flex items-center justify-center p-3 bg-niger-orange/10 dark:bg-niger-orange/20 rounded-full mb-4">
                    <HelpCircle className="w-8 h-8 text-niger-orange" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Aucun résultat trouvé</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Aucune FAQ ne correspond à votre recherche. Essayez d'autres termes ou consultez 
                    toutes les questions en effaçant votre recherche.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Ressources supplémentaires */}
          <section aria-labelledby="additional-resources" className="bg-white rounded-xl shadow-lg p-8 mt-16">
            <h2 id="additional-resources" className="text-2xl font-bold mb-8">Ressources supplémentaires</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {resourceGroups.map((group) => {
                const Icon = group.icon;
                return (
                  <div key={group.title} className="space-y-4">
                    <div className="flex items-center">
                      <div className="bg-blue-50 rounded-lg p-3 mr-3">
                        <Icon className="w-6 h-6 text-blue-600" aria-hidden="true" />
                      </div>
                      <h3 className="font-bold">{group.title}</h3>
                    </div>
                    <ul className="space-y-2 pl-12">
                      {group.items.map((item) => (
                        <li key={item.title}>
                          <Link 
                            href={item.link}
                            className="text-gray-700 hover:text-blue-600 hover:underline flex items-center"
                          >
                            <ChevronRight className="w-4 h-4 mr-1 text-blue-600" />
                            <span>{item.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Contact CTA */}
          <div className="bg-blue-50 rounded-xl shadow-sm p-8 mt-16 text-center">
            <h2 className="text-xl font-bold mb-4">Vous n'avez pas trouvé votre réponse ?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Si vous ne trouvez pas la réponse à votre question, n'hésitez pas à nous contacter 
              directement. Notre équipe vous répondra dans les plus brefs délais.
            </p>
            <Link 
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Mail className="w-5 h-5 mr-2" />
              Nous contacter
            </Link>
          </div>
        </div>
      </main>
    </MainLayout>
  );
}