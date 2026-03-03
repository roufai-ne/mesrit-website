import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Download, FileText, Calendar, BookOpen, AlertTriangle, Search, ChevronRight, Scale, BarChart3, X } from 'lucide-react';
import Link from 'next/link';
import { fetchAPI, endpoints } from '@/lib/strapi';
import { mapStrapiList, mapDocument } from '@/utils/strapiMapper';
import SeoHead from '@/components/seo/SeoHead';

// Catégories alignées sur les vraies valeurs Strapi
const CATEGORIES = [
  { id: 'all',        label: 'Tous',            icon: BookOpen, color: 'text-niger-orange',      bg: 'bg-niger-orange' },
  { id: 'circulaire', label: 'Circulaires',      icon: FileText, color: 'text-blue-600',          bg: 'bg-blue-600' },
  { id: 'rapport',    label: 'Rapports',         icon: BarChart3, color: 'text-green-600',        bg: 'bg-green-600' },
  { id: 'guide',      label: 'Guides',           icon: BookOpen, color: 'text-niger-orange',      bg: 'bg-niger-orange' },
  { id: 'loi',        label: 'Lois & Décrets',   icon: Scale,    color: 'text-red-600',           bg: 'bg-red-600' },
];

// Groupes réglementaires (loi = loi + decret + arrete + ordonnance)
const LOI_SUBTYPES = ['loi', 'decret', 'arrete', 'ordonnance'];

const DOC_TYPE_COLORS = {
  circulaire: 'bg-blue-50 text-blue-700 border-blue-200',
  rapport:    'bg-green-50 text-green-700 border-green-200',
  guide:      'bg-orange-50 text-orange-700 border-orange-200',
  loi:        'bg-red-50 text-red-700 border-red-200',
  decret:     'bg-red-50 text-red-700 border-red-200',
  arrete:     'bg-red-50 text-red-700 border-red-200',
  ordonnance: 'bg-red-50 text-red-700 border-red-200',
};

const YEARS = ['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'];
const FILE_TYPES = ['PDF', 'DOC', 'DOCX', 'XLS', 'XLSX'];

function DocTypeBadge({ category, subType }) {
  const color = DOC_TYPE_COLORS[category] || 'bg-gray-50 text-gray-600 border-gray-200';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {subType || category}
    </span>
  );
}

function FileTypeBadge({ type }) {
  if (!type) return null;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-niger-cream dark:bg-secondary-700 text-niger-green dark:text-niger-green-light font-mono">
      {type}
    </span>
  );
}

export default function DocumentationPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');

  useEffect(() => { fetchDocuments(); }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetchAPI(endpoints.documents, {
        pagination: { limit: 100 },
        populate: ['file'],
        sort: ['publicationDate:desc']
      });
      setDocuments(mapStrapiList(response, mapDocument));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtre catégorie : 'loi' regroupe tous les textes réglementaires
  const matchesCategory = (doc) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'loi') return LOI_SUBTYPES.includes(doc.category);
    return doc.category === selectedCategory;
  };

  const filteredDocuments = documents.filter(doc => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q ||
      (doc.title || '').toLowerCase().includes(q) ||
      (doc.description || '').toLowerCase().includes(q);
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    const matchesYear = selectedYear === 'all' ||
      new Date(doc.publicationDate).getFullYear().toString() === selectedYear;
    return matchesSearch && matchesCategory(doc) && matchesType && matchesYear;
  });

  // Compteurs par catégorie (correct)
  const counts = {
    all:        documents.length,
    circulaire: documents.filter(d => d.category === 'circulaire').length,
    rapport:    documents.filter(d => d.category === 'rapport').length,
    guide:      documents.filter(d => d.category === 'guide').length,
    loi:        documents.filter(d => LOI_SUBTYPES.includes(d.category)).length,
  };

  const hasActiveFilter = selectedCategory !== 'all' || selectedType !== 'all' || selectedYear !== 'all' || searchTerm;

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedType('all');
    setSelectedYear('all');
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="relative bg-gradient-to-br from-niger-orange via-niger-orange-dark to-niger-green text-white py-16">
          <div className="container mx-auto px-6">
            <div className="h-8 bg-white/20 rounded w-48 mb-4 animate-pulse" />
            <div className="h-12 bg-white/20 rounded w-72 animate-pulse" />
          </div>
        </div>
        <div className="container mx-auto px-6 py-8">
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-secondary-800 rounded-xl p-4 animate-pulse flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-secondary-700 flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-secondary-700 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-secondary-700 rounded w-1/2" />
                </div>
                <div className="w-8 h-8 bg-gray-200 dark:bg-secondary-700 rounded-lg flex-shrink-0" />
              </div>
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
          <div className="bg-red-50 text-red-600 p-6 rounded-xl flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="font-semibold">Erreur de chargement</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
          <button onClick={fetchDocuments} className="mt-4 px-4 py-2 bg-niger-orange text-white rounded-lg hover:bg-niger-orange-dark transition-colors">
            Réessayer
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SeoHead title="Documentation officielle" description="Accédez aux documents officiels du MESRIT : lois, circulaires, guides, rapports et textes réglementaires." url="/documentation" />

      {/* Hero compact */}
      <div className="relative bg-gradient-to-br from-niger-orange via-niger-orange-dark to-niger-green text-white py-14 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="container mx-auto px-6 relative">
          <div className="flex items-center text-sm mb-3 opacity-80">
            <Link href="/" className="hover:opacity-100 transition-opacity">Accueil</Link>
            <ChevronRight className="w-4 h-4 mx-1.5" />
            <span className="font-medium">Documentation</span>
          </div>
          <div className="flex items-center gap-4">
            <BookOpen className="w-10 h-10 flex-shrink-0" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Centre de documentation</h1>
              <p className="text-white/80 mt-1">
                {documents.length} document{documents.length !== 1 ? 's' : ''} officiel{documents.length !== 1 ? 's' : ''} disponible{documents.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8">

        {/* Barres de filtre catégorie (chips) */}
        <div className="flex flex-wrap gap-2 mb-5">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            const count = counts[cat.id] ?? 0;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all border ${
                  isActive
                    ? `${cat.bg} text-white border-transparent shadow-md`
                    : 'bg-white dark:bg-secondary-800 text-readable dark:text-foreground border-gray-200 dark:border-secondary-700 hover:border-niger-orange/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : cat.color}`} />
                <span>{cat.label}</span>
                <span className={`text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center ${
                  isActive ? 'bg-white/25 text-white' : 'bg-gray-100 dark:bg-secondary-700 text-readable-muted'
                }`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Ligne recherche + filtres */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-niger-orange" />
            <input
              type="search"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Rechercher un document..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-secondary-700 focus:ring-2 focus:ring-niger-orange focus:border-niger-orange bg-white dark:bg-secondary-800 text-readable dark:text-foreground text-sm transition-all"
            />
          </div>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-secondary-700 focus:ring-2 focus:ring-niger-orange bg-white dark:bg-secondary-800 text-readable dark:text-foreground text-sm sm:w-36"
          >
            <option value="all">Toutes les années</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-secondary-700 focus:ring-2 focus:ring-niger-orange bg-white dark:bg-secondary-800 text-readable dark:text-foreground text-sm sm:w-32"
          >
            <option value="all">Tous les types</option>
            {FILE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Résultats + reset */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-readable-muted dark:text-muted-foreground">
            <span className="font-semibold text-niger-green dark:text-niger-green-light">{filteredDocuments.length}</span>
            {' '}document{filteredDocuments.length !== 1 ? 's' : ''} trouvé{filteredDocuments.length !== 1 ? 's' : ''}
          </p>
          {hasActiveFilter && (
            <button onClick={resetFilters} className="flex items-center gap-1.5 text-xs text-readable-muted hover:text-niger-orange transition-colors">
              <X className="w-3.5 h-3.5" />
              Réinitialiser
            </button>
          )}
        </div>

        {/* Liste des documents */}
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-secondary-800 rounded-2xl border border-gray-100 dark:border-secondary-700">
            <BookOpen className="w-14 h-14 text-niger-orange/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-niger-green dark:text-niger-green-light mb-2">Aucun document trouvé</h3>
            <p className="text-sm text-readable-muted dark:text-muted-foreground mb-4">
              Essayez de modifier vos critères de recherche.
            </p>
            <button onClick={resetFilters} className="px-5 py-2 bg-niger-orange text-white rounded-xl text-sm hover:bg-niger-orange-dark transition-colors">
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-secondary-800 rounded-2xl border border-gray-100 dark:border-secondary-700 overflow-hidden divide-y divide-gray-100 dark:divide-secondary-700">
            {filteredDocuments.map((doc) => (
              <div key={doc._id} className="flex items-center gap-4 px-4 py-3.5 hover:bg-niger-orange/5 dark:hover:bg-niger-orange/10 transition-colors group">

                {/* Icône type fichier */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold ${DOC_TYPE_COLORS[doc.category] || 'bg-gray-50 text-gray-600 border-gray-200'} border`}>
                  {doc.type || <FileText className="w-4 h-4" />}
                </div>

                {/* Contenu principal */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-medium text-niger-green dark:text-niger-green-light group-hover:text-niger-orange transition-colors text-sm sm:text-base truncate">
                      {doc.title}
                    </h3>
                    <DocTypeBadge category={doc.category} subType={doc.subType} />
                  </div>
                  {doc.description && (
                    <p className="text-xs text-readable-muted dark:text-muted-foreground truncate hidden sm:block">
                      {doc.description}
                    </p>
                  )}
                </div>

                {/* Méta (date + taille) */}
                <div className="hidden md:flex flex-col items-end gap-0.5 flex-shrink-0 text-xs text-readable-muted dark:text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(doc.publicationDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  {doc.size && <span>{doc.size}</span>}
                </div>

                {/* Bouton téléchargement */}
                <a
                  href={doc.url || undefined}
                  download={doc.url ? (doc.title || 'document') : undefined}
                  className={`flex-shrink-0 p-2.5 rounded-xl transition-all ${
                    doc.url
                      ? 'text-niger-orange hover:bg-niger-orange hover:text-white border border-niger-orange/30 hover:border-niger-orange hover:shadow-md'
                      : 'text-gray-300 border border-gray-200 cursor-not-allowed pointer-events-none opacity-40'
                  }`}
                  title={doc.url ? 'Télécharger' : 'Fichier non disponible'}
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Accès rapide par section */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-niger-green dark:text-niger-green-light mb-4">Parcourir par section</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { href: '/documentation/lois',        Icon: Scale,    label: 'Lois et Décrets',    sub: 'Textes législatifs',         border: 'border-red-200 hover:border-red-400',   iconCls: 'text-red-600' },
              { href: '/documentation/rapports',    Icon: BarChart3, label: 'Rapports',           sub: "Rapports et études",         border: 'border-green-200 hover:border-green-400', iconCls: 'text-green-600' },
              { href: '/documentation/guides',      Icon: BookOpen, label: 'Guides',              sub: 'Guides et procédures',       border: 'border-niger-orange/30 hover:border-niger-orange', iconCls: 'text-niger-orange' },
              { href: '/documentation/circulaires', Icon: FileText, label: 'Circulaires',         sub: 'Notes et instructions',      border: 'border-blue-200 hover:border-blue-400', iconCls: 'text-blue-600' },
            ].map(({ href, Icon, label, sub, border, iconCls }) => (
              <Link key={href} href={href} className="group">
                <div className={`bg-white dark:bg-secondary-800 rounded-xl p-5 border ${border} transition-all hover:-translate-y-1 hover:shadow-lg`}>
                  <Icon className={`w-8 h-8 ${iconCls} mb-3`} />
                  <p className="font-semibold text-niger-green dark:text-niger-green-light group-hover:text-inherit text-sm">{label}</p>
                  <p className="text-xs text-readable-muted dark:text-muted-foreground mt-0.5">{sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </MainLayout>
  );
}

export async function getStaticProps() {
  return { props: {}, revalidate: 3600 };
}
