// Script to rewrite FAQ, support, historique pages
const fs = require('fs');
const path = require('path');

const src = 'c:/Users/PAES/Desktop/Devs/mesrit-websiteV2/mesrit-website/src/pages';

// ─────────────────────────────────────────────
// FAQ/INDEX.JS — fix hero + resource icons + CTA
// ─────────────────────────────────────────────
const faqContent = `import React, { useState, useEffect } from 'react';
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
            <HelpCircle className="w-10 h-10 flex-shrink-0" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Foire Aux Questions</h1>
              <p className="text-white/80 mt-1">Trouvez rapidement des réponses à vos questions</p>
            </div>
          </div>

          {/* Barre de recherche dans le hero */}
          <div className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
              <input
                type="text"
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
                className={\`px-4 py-2 rounded-full text-sm font-medium transition-colors \${
                  activeCategory === category
                    ? 'bg-niger-orange text-white'
                    : 'bg-white dark:bg-secondary-800 text-readable dark:text-foreground hover:bg-niger-orange/10 dark:hover:bg-niger-orange/20 border border-gray-200 dark:border-secondary-600'
                }\`}
              >
                {category === 'all' ? 'Toutes les questions' : category}
              </button>
            ))}
          </div>

          {/* Chargement */}
          {isLoading && (
            <div className="flex justify-center items-center p-12">
              <Loader className="w-10 h-10 animate-spin text-niger-orange" />
              <span className="ml-3 text-readable dark:text-foreground">Chargement des questions...</span>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-6 rounded-xl flex items-start border border-red-200 dark:border-red-800">
              <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0" />
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
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-niger-orange/10 dark:bg-niger-orange/20 rounded-lg p-2 flex-shrink-0">
                          <HelpCircle className="w-5 h-5 text-niger-orange" aria-hidden="true" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white pr-8 text-left">{faq.question}</h3>
                      </div>
                      <div className="flex-shrink-0">
                        {expandedItems[faq._id]
                          ? <Minus className="w-5 h-5 text-niger-orange" />
                          : <Plus className="w-5 h-5 text-niger-orange" />
                        }
                      </div>
                    </button>

                    {expandedItems[faq._id] && (
                      <div className="px-6 pb-5 pt-1">
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
                    <HelpCircle className="w-8 h-8 text-niger-orange" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Aucun résultat trouvé</h3>
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
                            <ChevronRight className="w-3.5 h-3.5 mr-1 text-niger-orange flex-shrink-0" />
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
            <h2 className="text-xl font-bold text-niger-green dark:text-niger-green-light mb-3">Vous n'avez pas trouvé votre réponse ?</h2>
            <p className="text-readable-muted dark:text-muted-foreground mb-6 max-w-2xl mx-auto text-sm">
              Si vous ne trouvez pas la réponse à votre question, n'hésitez pas à nous contacter directement.
              Notre équipe vous répondra dans les plus brefs délais.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-niger-orange text-white font-medium rounded-xl hover:bg-niger-orange-dark transition-colors shadow-lg hover:shadow-xl"
            >
              <Mail className="w-5 h-5" />
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
`;

// ─────────────────────────────────────────────
// SUPPORT.JS — fix hero gradient order + resource colors
// ─────────────────────────────────────────────
const supportContent = `// src/pages/support.js
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import {
  HelpCircle, ChevronRight, Mail, Phone, MessageCircle,
  Book, FileText, Users, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import SeoHead from '@/components/seo/SeoHead';

export default function SupportPage() {
  const [selectedCategory, setSelectedCategory] = useState('general');

  const supportCategories = [
    { id: 'general', title: 'Questions Générales', description: 'Informations générales sur le ministère et ses services', icon: HelpCircle },
    { id: 'students', title: 'Support Étudiants', description: 'Aide aux étudiants et procédures académiques', icon: Users },
    { id: 'technical', title: 'Support Technique', description: 'Assistance technique et problèmes informatiques', icon: FileText },
    { id: 'documents', title: 'Documents & Formulaires', description: 'Aide pour les documents et démarches administratives', icon: Book }
  ];

  const contactMethods = [
    { title: 'Email', description: 'Contactez-nous par email pour toute question', icon: Mail, contact: 'support@mesrit.gov.ne', responseTime: '24-48 heures' },
    { title: 'Téléphone', description: 'Appelez-nous directement pour une assistance immédiate', icon: Phone, contact: '+227 20 72 29 42', responseTime: 'Immédiat' },
    { title: 'Chat en Ligne', description: 'Discutez avec notre équipe de support', icon: MessageCircle, contact: 'Disponible sur le site', responseTime: '5-10 minutes' }
  ];

  const faqQuestions = {
    general: [
      { question: 'Comment contacter le ministère ?', answer: 'Vous pouvez nous contacter par email à contact@mesrit.gov.ne, par téléphone au +227 20 72 29 42, ou en visitant nos bureaux à Niamey.' },
      { question: "Quels sont les horaires d'ouverture ?", answer: 'Nos bureaux sont ouverts du lundi au vendredi de 8h00 à 17h00. Le service client est disponible de 8h30 à 16h30.' },
      { question: 'Où se trouvent vos bureaux ?', answer: 'Le siège du ministère se trouve au Boulevard Mali Béro, Niamey, Niger. Nous avons également des représentations dans toutes les régions.' }
    ],
    students: [
      { question: 'Comment faire une demande de bourse ?', answer: "Les demandes de bourses se font via l'ANAB (Agence Nigérienne des Allocations et des Bourses). Consultez leur site web ou visitez leurs bureaux." },
      { question: "Comment s'inscrire à l'université ?", answer: "Les inscriptions se font directement auprès des universités. Consultez notre section établissements pour les contacts des différentes universités." },
      { question: 'Où trouver les résultats du baccalauréat ?', answer: "Les résultats du baccalauréat sont publiés sur le site de l'OBEECS. Vous pouvez également les consulter dans les centres d'examen." }
    ],
    technical: [
      { question: 'Problème de connexion au site ?', answer: 'Vérifiez votre connexion internet et réessayez. Si le problème persiste, contactez notre support technique.' },
      { question: 'Comment télécharger les documents ?', answer: 'Cliquez sur le bouton de téléchargement à côté du document. Assurez-vous d\'avoir un lecteur PDF installé.' },
      { question: 'Le formulaire ne fonctionne pas ?', answer: 'Vérifiez que tous les champs obligatoires sont remplis. Utilisez un navigateur récent comme Chrome, Firefox ou Safari.' }
    ],
    documents: [
      { question: 'Où trouver les formulaires officiels ?', answer: 'Tous les formulaires sont disponibles dans la section Documentation de notre site web.' },
      { question: 'Comment authentifier un diplôme ?', answer: "Contactez le service de l'authentification de l'université qui a délivré le diplôme ou l'ANAQ-SUP pour les procédures." },
      { question: 'Délai de traitement des dossiers ?', answer: 'Les délais varient selon le type de dossier. Généralement entre 15 à 30 jours ouvrables pour les demandes complètes.' }
    ]
  };

  return (
    <MainLayout>
      <SeoHead title="Support" description="Centre d'aide et de support du site officiel du MESRIT Niger." url="/support" />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-niger-orange via-niger-orange-dark to-niger-green text-white py-14 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="container mx-auto px-6 relative">
          <div className="flex items-center text-sm mb-3 opacity-80">
            <Link href="/" className="hover:opacity-100 transition-opacity">Accueil</Link>
            <ChevronRight className="w-4 h-4 mx-1.5" />
            <span className="font-medium">Support</span>
          </div>
          <div className="flex items-center gap-4">
            <HelpCircle className="w-10 h-10 flex-shrink-0" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Centre de Support</h1>
              <p className="text-white/80 mt-1">Nous sommes là pour vous aider</p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12 bg-gray-50 dark:bg-secondary-900">
        <div className="container mx-auto px-6">

          {/* Méthodes de contact */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light text-center mb-6">Comment nous contacter</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {contactMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <div key={method.title} className="bg-white dark:bg-secondary-800 rounded-2xl border border-gray-100 dark:border-secondary-700 p-6 text-center hover:shadow-lg transition-all duration-300">
                    <div className="w-14 h-14 bg-niger-orange/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-niger-orange" />
                    </div>
                    <h3 className="text-lg font-semibold text-niger-green dark:text-niger-green-light mb-2">{method.title}</h3>
                    <p className="text-readable-muted dark:text-muted-foreground mb-3 text-sm">{method.description}</p>
                    <div className="text-niger-orange font-medium mb-2 text-sm">{method.contact}</div>
                    <div className="flex items-center justify-center gap-1.5 text-xs text-readable-muted dark:text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {method.responseTime}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Catégories */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light text-center mb-6">Choisissez votre catégorie</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {supportCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={\`p-4 rounded-xl transition-all text-center border \${
                      selectedCategory === category.id
                        ? 'bg-niger-orange text-white border-niger-orange shadow-lg'
                        : 'bg-white dark:bg-secondary-800 hover:bg-niger-orange/10 dark:hover:bg-niger-orange/20 border-gray-200 dark:border-secondary-600 text-readable dark:text-foreground'
                    }\`}
                  >
                    <div className="flex justify-center mb-2.5">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{category.title}</h3>
                    <p className="text-xs opacity-80">{category.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* FAQ par catégorie */}
          <div className="bg-white dark:bg-secondary-800 rounded-2xl border border-gray-100 dark:border-secondary-700 p-8 mb-8">
            <h2 className="text-lg font-semibold text-niger-green dark:text-niger-green-light mb-6">
              Questions fréquentes — {supportCategories.find(cat => cat.id === selectedCategory)?.title}
            </h2>
            <div className="space-y-3">
              {faqQuestions[selectedCategory]?.map((faq, index) => (
                <div key={index} className="border border-gray-100 dark:border-secondary-600 rounded-xl p-4 bg-white dark:bg-secondary-700">
                  <h3 className="font-semibold text-niger-green dark:text-niger-green-light mb-2 flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-niger-orange flex-shrink-0" />
                    {faq.question}
                  </h3>
                  <p className="text-readable-muted dark:text-muted-foreground ml-6 text-sm">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ressources */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Book, title: 'Documentation', desc: 'Consultez notre documentation complète pour trouver des guides détaillés.', link: '/documentation', linkLabel: 'Voir la documentation' },
              { icon: HelpCircle, title: 'FAQ', desc: 'Trouvez rapidement des réponses dans notre foire aux questions.', link: '/faq', linkLabel: 'Consulter la FAQ' },
              { icon: Mail, title: 'Contact Direct', desc: 'Contactez-nous directement pour toute question spécifique.', link: '/contact', linkLabel: 'Nous contacter' },
            ].map(({ icon: Icon, title, desc, link, linkLabel }) => (
              <div key={title} className="bg-white dark:bg-secondary-800 rounded-2xl border border-gray-100 dark:border-secondary-700 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-niger-orange/10 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-niger-orange" />
                  </div>
                  <h3 className="font-semibold text-niger-green dark:text-niger-green-light">{title}</h3>
                </div>
                <p className="text-readable-muted dark:text-muted-foreground mb-4 text-sm">{desc}</p>
                <Link href={link} className="flex items-center gap-1 text-niger-orange hover:text-niger-orange-dark transition-colors font-medium text-sm">
                  {linkLabel} <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>

          {/* Alerte urgence */}
          <div className="mt-10 bg-niger-orange/10 dark:bg-niger-orange/20 border border-niger-orange/30 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-niger-orange flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-niger-green dark:text-niger-green-light mb-1">Support d'urgence</h3>
                <p className="text-readable dark:text-foreground text-sm mb-1">
                  Pour les problèmes urgents nécessitant une assistance immédiate, contactez-nous au <strong>+227 20 72 29 42</strong>.
                </p>
                <p className="text-xs text-readable-muted dark:text-muted-foreground">
                  Horaires d'urgence : Du lundi au vendredi de 8h00 à 20h00
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export async function getStaticProps() {
  return { props: {}, revalidate: 86400 };
}
`;

// ─────────────────────────────────────────────
// HISTORIQUE.JS — add MESRIT hero + fix all colors
// ─────────────────────────────────────────────
const historiqueContent = `// src/pages/ministere/historique.js
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Clock, ChevronRight, Calendar, Award, Building } from 'lucide-react';
import Link from 'next/link';
import SeoHead from '@/components/seo/SeoHead';

export default function HistoriquePage() {
  const fallbackMilestones = [
    { year: "1962", title: "Création du Ministère de l'Éducation Nationale", content: "Après l'indépendance du Niger, création du premier ministère en charge de l'éducation.", icon: "Building" },
    { year: "1975", title: "Création de l'Université de Niamey", content: "Fondation de la première université du Niger, qui deviendra plus tard l'Université Abdou Moumouni.", icon: "Award" },
    { year: "1992", title: "Réorganisation du système éducatif", content: "Restructuration majeure avec la séparation entre l'enseignement de base et l'enseignement supérieur.", icon: "Building" },
    { year: "2000", title: "Expansion universitaire", content: "Lancement du programme d'expansion avec la création de nouvelles universités régionales.", icon: "Award" },
    { year: "2010", title: "Modernisation technologique", content: "Introduction des TIC dans l'enseignement supérieur et développement de l'e-learning.", icon: "Building" },
    { year: "2020", title: "Création du MESRIT", content: "Formation du Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique.", icon: "Award" }
  ];

  const [milestones, setMilestones] = React.useState(fallbackMilestones);

  React.useEffect(() => {
    const loadHistory = async () => {
      try {
        const { fetchAPI, endpoints } = require('@/lib/strapi');
        const { mapStrapiList, mapHistoryMilestone } = require('@/utils/strapiMapper');
        const response = await fetchAPI(endpoints.history, { sort: ['order:asc', 'year:asc'], pagination: { limit: 50 } });
        if (response?.data?.length > 0) setMilestones(mapStrapiList(response, mapHistoryMilestone));
      } catch (err) {
        console.warn('Failed to fetch history, using fallback');
      }
    };
    loadHistory();
  }, []);

  const achievements = [
    { title: "60 ans d'excellence", description: "Plus de six décennies au service de l'éducation nationale", stats: "1962-2024" },
    { title: "10 universités", description: "Un réseau national d'établissements d'enseignement supérieur", stats: "Toutes les régions" },
    { title: "100 000+ diplômés", description: "Générations de cadres formés pour le développement du Niger", stats: "Depuis 1975" }
  ];

  return (
    <MainLayout>
      <SeoHead title="Historique" description="L'histoire et l'évolution du Ministère de l'Enseignement Supérieur du Niger depuis sa création." url="/ministere/historique" />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-niger-orange via-niger-orange-dark to-niger-green text-white py-14 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="container mx-auto px-6 relative">
          <div className="flex items-center text-sm mb-3 opacity-80">
            <Link href="/" className="hover:opacity-100 transition-opacity">Accueil</Link>
            <ChevronRight className="w-4 h-4 mx-1.5" />
            <Link href="/ministere" className="hover:opacity-100 transition-opacity">Le Ministère</Link>
            <ChevronRight className="w-4 h-4 mx-1.5" />
            <span className="font-medium">Historique</span>
          </div>
          <div className="flex items-center gap-4">
            <Clock className="w-10 h-10 flex-shrink-0" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Notre Historique</h1>
              <p className="text-white/80 mt-1">Plus de 60 ans au service de l'enseignement supérieur nigérien</p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12 bg-gray-50 dark:bg-secondary-900">
        <div className="container mx-auto px-4 sm:px-6">

          {/* Introduction */}
          <div className="bg-white dark:bg-secondary-800 rounded-2xl border border-gray-100 dark:border-secondary-700 p-6 mb-12">
            <p className="text-readable dark:text-foreground leading-relaxed">
              Depuis l'indépendance du Niger, notre ministère a évolué pour devenir un acteur majeur
              du développement de l'enseignement supérieur et de la recherche. Découvrez les étapes
              marquantes de notre parcours et les réalisations qui ont façonné l'éducation supérieure nigérienne.
            </p>
          </div>

          {/* Timeline */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-8 text-center">Chronologie</h2>
            <div className="relative">
              {/* Ligne verticale */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-niger-orange/30 dark:bg-niger-orange/20"></div>

              <div className="space-y-10">
                {milestones.map((milestone, index) => {
                  let Icon = Building;
                  if (typeof milestone.icon === 'string') {
                    if (milestone.icon === 'Award') Icon = Award;
                    else if (milestone.icon === 'Building') Icon = Building;
                  } else {
                    Icon = milestone.icon || Building;
                  }

                  const isEven = index % 2 === 0;

                  return (
                    <div key={index} className={\`flex items-center \${isEven ? 'flex-row' : 'flex-row-reverse'}\`}>
                      <div className={\`w-1/2 \${isEven ? 'pr-8 text-right' : 'pl-8'}\`}>
                        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-md border border-gray-100 dark:border-secondary-700 p-5">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-niger-orange text-white text-xs font-medium mb-3">
                            <Calendar className="w-3 h-3" />
                            {milestone.year}
                          </div>
                          <h3 className="font-semibold text-niger-green dark:text-niger-green-light mb-2">{milestone.title}</h3>
                          <p className="text-readable-muted dark:text-muted-foreground text-sm">{milestone.content}</p>
                        </div>
                      </div>

                      {/* Point central */}
                      <div className="relative z-10">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-niger-orange text-white shadow-lg">
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="w-1/2"></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Réalisations */}
          <div className="bg-white dark:bg-secondary-800 rounded-2xl border border-gray-100 dark:border-secondary-700 p-8">
            <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-6 text-center">Nos Réalisations</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {achievements.map((achievement, index) => (
                <div key={index} className="text-center p-6 bg-niger-orange/10 dark:bg-niger-orange/20 rounded-xl border border-niger-orange/20">
                  <div className="text-2xl font-bold text-niger-orange mb-2">{achievement.stats}</div>
                  <h3 className="font-semibold text-niger-green dark:text-niger-green-light mb-2">{achievement.title}</h3>
                  <p className="text-readable-muted dark:text-muted-foreground text-sm">{achievement.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Vision d'avenir */}
          <div className="mt-10 bg-gradient-to-br from-niger-orange via-niger-orange-dark to-niger-green text-white rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Vers l'Avenir</h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Fort de notre riche histoire, nous continuons à innover et à nous adapter aux défis
              de l'enseignement supérieur moderne pour former les leaders de demain.
            </p>
            <Link
              href="/ministere/missions"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-niger-orange font-semibold rounded-xl hover:bg-niger-cream transition-colors shadow-lg"
            >
              Découvrir nos missions
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export async function getStaticProps() {
  return { props: {}, revalidate: 3600 };
}
`;

fs.writeFileSync(src + '/faq/index.js', faqContent, 'utf8');
fs.writeFileSync(src + '/support.js', supportContent, 'utf8');
fs.writeFileSync(src + '/ministere/historique.js', historiqueContent, 'utf8');

console.log('FAQ, support, historique written successfully');
console.log('faq/index.js:', fs.statSync(src + '/faq/index.js').size, 'bytes');
console.log('support.js:', fs.statSync(src + '/support.js').size, 'bytes');
console.log('ministere/historique.js:', fs.statSync(src + '/ministere/historique.js').size, 'bytes');
