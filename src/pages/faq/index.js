import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import {
  ChevronRight, HelpCircle, Search, Mail,
  Plus, Minus, AlertCircle, BookOpen, FileText, Loader
} from 'lucide-react';
import { sanitizeForReact } from '@/lib/sanitize';
import { fetchAPI, endpoints } from '@/lib/strapi';
import { mapStrapiList, mapFAQ } from '@/utils/strapiMapper';
import SeoHead from '@/components/seo/SeoHead';

export default function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setIsLoading(true);
        const response = await fetchAPI(endpoints.faqs, {
          sort: ['order:asc', 'publishedAt:desc'],
          pagination: { limit: 100 }
        });
        const data = mapStrapiList(response, mapFAQ).filter(item => item);
        setFaqs(data);
        if (data.length > 0) setExpandedItems({ [data[0]._id]: true });
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFAQs();
  }, []);

  const filteredFaqs = faqs.filter(faq => {
    if (!faq) return false;
    const matchesSearch = faq.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(faqs.map(faq => faq.category))];

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

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
      <SeoHead title="Foire aux questions" description="Réponses aux questions fréquemment posées sur les services du MESRIT et l'enseignement supérieur au Niger." url="/faq" />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-niger-orange via-niger-orange-dark to-niger-green text-white py-14 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="container mx-auto px-6 relative">
          <nav aria-label="Breadcrumb" className="flex items-center text-sm mb-3 opacity-80">
            <Link href="/" className="hover:opacity-100 transition-opacity">Accueil</Link>
            <ChevronRight className="w-4 h-4 mx-1.5" aria-hidden="true" />
            <span aria-current="page" className="font-medium">Foire Aux Questions</span>
          </nav>

          <div className="flex items-center gap-4 mb-8">
            <HelpCircle className="w-10 h-10 flex-shrink-0" aria-hidden="true" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-balance">Foire Aux Questions</h1>
              <p className="text-white/80 mt-1">Trouvez rapidement des réponses à vos questions</p>
            </div>
          </div>

          {/* Barre de recherche dans le hero */}
          <div className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
              <input
                type="text"
                aria-label="Rechercher une question"
                className="block w-full rounded-xl pl-10 pr-4 py-3.5 bg-white/15 backdrop-blur-sm text-white placeholder-white/60 border border-white/25 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 text-sm"
                placeholder="Rechercher une question..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-12 bg-gray-50 dark:bg-secondary-900">
        <div className="container mx-auto px-6">

          {/* Filtres par catégorie */}
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? 'bg-niger-orange text-white'
                    : 'bg-white dark:bg-secondary-800 text-readable dark:text-foreground hover:bg-niger-orange/10 dark:hover:bg-niger-orange/20 border border-gray-200 dark:border-secondary-600'
                }`}
              >
                {category === 'all' ? 'Toutes les questions' : category}
              </button>
            ))}
          </div>

          {/* Chargement */}
          {isLoading && (
            <div className="flex justify-center items-center p-12" role="status">
              <Loader className="w-10 h-10 animate-spin text-niger-orange" aria-hidden="true" />
              <span className="ml-3 text-readable dark:text-foreground">Chargement des questions...</span>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-6 rounded-xl flex items-start border border-red-200 dark:border-red-800">
              <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0" aria-hidden="true" />
              <div><h3 className="font-bold">Erreur de chargement</h3><p>{error}</p></div>
            </div>
          )}

          {/* Liste FAQs */}
          {!isLoading && !error && (
            <div className="space-y-3 mb-16">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => (
                  <div
                    key={faq._id}
                    className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-gray-100 dark:border-secondary-700 overflow-hidden"
                  >
                    <button
                      className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-niger-orange/20 focus:ring-inset"
                      onClick={() => toggleExpand(faq._id)}
                      aria-expanded={expandedItems[faq._id]}
                      aria-controls={`faq-panel-${faq._id}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-niger-orange/10 dark:bg-niger-orange/20 rounded-lg p-2 flex-shrink-0">
                          <HelpCircle className="w-5 h-5 text-niger-orange" aria-hidden="true" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white pr-8 text-left">{faq.question}</h3>
                      </div>
                      <div className="flex-shrink-0">
                        {expandedItems[faq._id]
                          ? <Minus className="w-5 h-5 text-niger-orange" aria-hidden="true" />
                          : <Plus className="w-5 h-5 text-niger-orange" aria-hidden="true" />
                        }
                      </div>
                    </button>

                    {expandedItems[faq._id] && (
                      <div id={`faq-panel-${faq._id}`} className="px-6 pb-5 pt-1">
                        <div className="border-t border-gray-100 dark:border-secondary-600 pt-4">
                          <div
                            className="prose max-w-none text-readable dark:text-foreground text-sm leading-relaxed"
                            dangerouslySetInnerHTML={sanitizeForReact(faq.answer, 'rich')}
                          />
                          {faq.category && (
                            <div className="mt-4">
                              <span className="inline-block px-3 py-1 text-xs font-medium bg-niger-orange/10 dark:bg-niger-orange/20 text-niger-orange rounded-full">
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
                <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-gray-100 dark:border-secondary-700 p-8 text-center">
                  <div className="inline-flex items-center justify-center p-3 bg-niger-orange/10 dark:bg-niger-orange/20 rounded-full mb-4">
                    <HelpCircle className="w-8 h-8 text-niger-orange" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-balance">Aucun résultat trouvé</h3>
                  <p className="text-readable-muted dark:text-muted-foreground">
                    Aucune FAQ ne correspond à votre recherche. Essayez d'autres termes ou consultez toutes les questions.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Ressources supplémentaires */}
          <section aria-labelledby="additional-resources" className="bg-white dark:bg-secondary-800 rounded-2xl border border-gray-100 dark:border-secondary-700 p-8 mb-8">
            <h2 id="additional-resources" className="text-lg font-semibold text-niger-green dark:text-niger-green-light mb-6">Ressources supplémentaires</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {resourceGroups.map((group) => {
                const Icon = group.icon;
                return (
                  <div key={group.title} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-niger-orange/10 rounded-lg p-2.5">
                        <Icon className="w-5 h-5 text-niger-orange" aria-hidden="true" />
                      </div>
                      <h3 className="font-semibold text-niger-green dark:text-niger-green-light text-sm">{group.title}</h3>
                    </div>
                    <ul className="space-y-1.5 pl-12">
                      {group.items.map((item) => (
                        <li key={item.title}>
                          <Link
                            href={item.link}
                            className="flex items-center text-sm text-readable dark:text-foreground hover:text-niger-orange dark:hover:text-niger-orange-light transition-colors"
                          >
                            <ChevronRight className="w-3.5 h-3.5 mr-1 text-niger-orange flex-shrink-0" aria-hidden="true" />
                            {item.title}
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
          <div className="bg-gradient-to-br from-niger-orange/10 to-niger-green/10 dark:from-niger-orange/20 dark:to-niger-green/20 rounded-2xl border border-niger-orange/20 p-8 text-center">
            <h2 className="text-xl font-bold text-niger-green dark:text-niger-green-light mb-3 text-balance">Vous n'avez pas trouvé votre réponse ?</h2>
            <p className="text-readable-muted dark:text-muted-foreground mb-6 max-w-2xl mx-auto text-sm">
              Si vous ne trouvez pas la réponse à votre question, n'hésitez pas à nous contacter directement.
              Notre équipe vous répondra dans les plus brefs délais.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-niger-orange text-white font-medium rounded-xl hover:bg-niger-orange-dark transition-colors shadow-lg hover:shadow-xl"
            >
              <Mail className="w-5 h-5" aria-hidden="true" />
              Nous contacter
            </Link>
          </div>
        </div>
      </main>
    </MainLayout>
  );
}

export async function getStaticProps() {
  return { props: {}, revalidate: 86400 };
}
