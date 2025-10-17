import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { Map, Home, Building, FileText, Users, Settings, Search, Mail, Calendar, ChevronRight, ExternalLink, ArrowLeft } from 'lucide-react';

export default function Sitemap() {
  const [activeSection, setActiveSection] = useState('all');

  const siteStructure = {
    principal: {
      title: 'Pages principales',
      icon: Home,
      pages: [
        { title: 'Accueil', path: '/', description: 'Page d\'accueil du site' },
        { title: 'Contact', path: '/contact', description: 'Formulaire de contact et coordonnées' },
        { title: 'FAQ', path: '/faq', description: 'Questions fréquemment posées' },
        { title: 'Recherche', path: '/search', description: 'Recherche dans le contenu du site' }
      ]
    },
    ministere: {
      title: 'Le Ministère',
      icon: Building,
      pages: [
        { title: 'À propos', path: '/ministere', description: 'Présentation générale du ministère' },
        { title: 'Historique', path: '/ministere/historique', description: 'Histoire et évolution du ministère' },
        { title: 'Missions', path: '/ministere/missions', description: 'Missions et objectifs du ministère' },
        { title: 'Organisation', path: '/ministere/organisation', description: 'Structure organisationnelle' },
        { title: 'Directions', path: '/ministere/direction', description: 'Liste des directions' },
        { title: 'Direction [ID]', path: '/ministere/direction/[id]', description: 'Détails d\'une direction spécifique' }
      ]
    },
    etablissements: {
      title: 'Établissements',
      icon: Users,
      pages: [
        { title: 'Tous les établissements', path: '/etablissements', description: 'Liste complète des établissements' },
        { title: 'Universités', path: '/etablissements/universites', description: 'Universités publiques et privées' },
        { title: 'Instituts', path: '/etablissements/instituts', description: 'Instituts spécialisés' },
        { title: 'Écoles', path: '/etablissements/ecoles', description: 'Écoles supérieures' },
        { title: 'Centres', path: '/etablissements/centres', description: 'Centres de formation' },
        { title: 'Établissement [ID]', path: '/etablissements/[id]', description: 'Fiche détaillée d\'un établissement' }
      ]
    },
    actualites: {
      title: 'Actualités',
      icon: Calendar,
      pages: [
        { title: 'Toutes les actualités', path: '/actualites', description: 'Liste des actualités récentes' },
        { title: 'Actualité [ID]', path: '/actualites/[id]', description: 'Détail d\'une actualité' }
      ]
    },
    documentation: {
      title: 'Documentation',
      icon: FileText,
      pages: [
        { title: 'Centre de documentation', path: '/documentation', description: 'Accès aux documents officiels' },
        { title: 'Lois et décrets', path: '/documentation/lois', description: 'Textes législatifs et réglementaires' },
        { title: 'Circulaires', path: '/documentation/circulaires', description: 'Circulaires et instructions' },
        { title: 'Rapports', path: '/documentation/rapports', description: 'Rapports d\'activités et études' },
        { title: 'Guides', path: '/documentation/guides', description: 'Guides et manuels' }
      ]
    },
    services: {
      title: 'Services',
      icon: Settings,
      pages: [
        { title: 'Tous les services', path: '/services', description: 'Services offerts par le ministère' },
        { title: 'Services étudiants', path: '/services-etudiants', description: 'Services dédiés aux étudiants' },
        { title: 'Service [ID]', path: '/services/[id]', description: 'Détail d\'un service spécifique' },
        { title: 'Support', path: '/support', description: 'Support et assistance technique' }
      ]
    },
    newsletter: {
      title: 'Newsletter',
      icon: Mail,
      pages: [
        { title: 'Confirmation email', path: '/newsletter/confirm-email', description: 'Confirmation d\'inscription newsletter' },
        { title: 'Désabonnement', path: '/newsletter/unsubscribe', description: 'Désabonnement newsletter' }
      ]
    },
    externe: {
      title: 'Services externes',
      icon: ExternalLink,
      pages: [
        { title: 'ANAB', path: 'https://anab.ne', description: 'Agence Nationale d\'Assurance Qualité', external: true },
        { title: 'OBEECS', path: 'https://www.obeecsniger.com/', description: 'Office du Baccalauréat', external: true },
        { title: 'ANAQ-SUP', path: 'https://anaq-sup.ne', description: 'Agence Nationale d\'Assurance Qualité Supérieur', external: true }
      ]
    },
    legal: {
      title: 'Pages légales',
      icon: FileText,
      pages: [
        { title: 'Mentions légales', path: '/mentions-legales', description: 'Informations légales du site' },
        { title: 'Politique de confidentialité', path: '/politique-confidentialite', description: 'Protection des données personnelles' },
        { title: 'Conditions d\'utilisation', path: '/conditions-utilisation', description: 'Conditions d\'usage du site' },
        { title: 'Plan du site', path: '/sitemap', description: 'Architecture et navigation du site' }
      ]
    }
  };

  const allPages = Object.values(siteStructure).reduce((acc, section) => {
    return acc.concat(section.pages);
  }, []);

  const filteredSections = activeSection === 'all'
    ? siteStructure
    : { [activeSection]: siteStructure[activeSection] };

  return (
    <>
      <Head>
        <title>Plan du site - Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique</title>
        <meta name="description" content="Plan du site et architecture de navigation du site officiel du Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique du Niger." />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-secondary-900 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Bouton retour */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-white dark:bg-secondary-800 text-niger-green dark:text-niger-green-light border border-niger-orange/20 dark:border-secondary-600 rounded-lg hover:bg-niger-orange/10 dark:hover:bg-secondary-700 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Link>
          </div>
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-niger-green to-niger-orange px-8 py-6">
              <div className="flex items-center text-white">
                <Map className="w-8 h-8 mr-3" />
                <div>
                  <h1 className="text-3xl font-bold">Plan du site</h1>
                  <p className="text-white/90 mt-1">Architecture et navigation du site</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="border-b border-gray-200 dark:border-secondary-600 px-8 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                    {Object.keys(siteStructure).length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Sections</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-niger-orange">
                    {allPages.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Pages totales</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                    {allPages.filter(p => !p.external).length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Pages internes</div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="px-8 py-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-niger-green dark:text-niger-green-light mb-4">
                  Filtrer par section
                </h2>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveSection('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === 'all'
                        ? 'bg-niger-orange text-white'
                        : 'bg-gray-100 dark:bg-secondary-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-secondary-600'
                    }`}
                  >
                    Toutes les sections
                  </button>
                  {Object.entries(siteStructure).map(([key, section]) => (
                    <button
                      key={key}
                      onClick={() => setActiveSection(key)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                        activeSection === key
                          ? 'bg-niger-orange text-white'
                          : 'bg-gray-100 dark:bg-secondary-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-secondary-600'
                      }`}
                    >
                      <section.icon className="w-4 h-4 mr-2" />
                      {section.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-8">
                {Object.entries(filteredSections).map(([key, section]) => (
                  <div key={key} className="border border-gray-200 dark:border-secondary-600 rounded-lg">
                    <div className="bg-gray-50 dark:bg-secondary-700 px-6 py-4 border-b border-gray-200 dark:border-secondary-600">
                      <h3 className="text-xl font-semibold text-niger-green dark:text-niger-green-light flex items-center">
                        <section.icon className="w-6 h-6 mr-3 text-niger-orange" />
                        {section.title}
                        <span className="ml-3 text-sm font-normal text-gray-500 dark:text-gray-400">
                          ({section.pages.length} page{section.pages.length > 1 ? 's' : ''})
                        </span>
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {section.pages.map((page, index) => (
                          <div
                            key={index}
                            className="border border-gray-200 dark:border-secondary-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                {page.external ? (
                                  <a
                                    href={page.path}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-niger-green dark:text-niger-green-light font-medium hover:text-niger-orange transition-colors flex items-center"
                                  >
                                    {page.title}
                                    <ExternalLink className="w-4 h-4 ml-2" />
                                  </a>
                                ) : (
                                  <Link
                                    href={page.path.includes('[') ? page.path.replace('[id]', '1') : page.path}
                                    className="text-niger-green dark:text-niger-green-light font-medium hover:text-niger-orange transition-colors flex items-center"
                                  >
                                    {page.title}
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                  </Link>
                                )}
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {page.description}
                                </p>
                                <div className="text-xs text-gray-500 dark:text-gray-500 mt-2 font-mono">
                                  {page.path}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Search tip */}
              <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <div className="flex items-start">
                  <Search className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
                      Vous ne trouvez pas ce que vous cherchez ?
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
                      Utilisez notre fonction de recherche pour trouver rapidement les informations dont vous avez besoin.
                    </p>
                    <Link
                      href="/search"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Rechercher sur le site
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}