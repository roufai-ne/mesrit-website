// src/pages/documentation/guides.js
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { BookOpen, Download, Calendar, ChevronRight, Search, X, Users, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { fetchAPI, endpoints } from '@/lib/strapi';
import { mapStrapiList, mapDocument } from '@/utils/strapiMapper';
import SeoHead from '@/components/seo/SeoHead';

const YEARS = ['2025', '2024', '2023', '2022', '2021', '2020'];
const AUDIENCES = ['Étudiants', 'Enseignants', 'Administrateurs', 'Chercheurs'];
const ICON_COLOR = 'bg-orange-50 text-orange-700 border-orange-200';
const getDownloadName = (url, title) =>
  url ? (url.split('/').pop()?.split('?')[0] || title || 'document') : undefined;

export default function GuidesPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');

  useEffect(() => { fetchDocuments(); }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetchAPI(endpoints.documents, {
        filters: { category: 'guide' },
        populate: ['file'],
        pagination: { limit: 100 },
        sort: ['publicationDate:desc']
      });
      setDocuments(mapStrapiList(response, mapDocument));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q ||
      (doc.title || '').toLowerCase().includes(q) ||
      (doc.description || '').toLowerCase().includes(q);
    const matchesAudience = selectedAudience === 'all' || doc.audience === selectedAudience;
    const matchesYear = selectedYear === 'all' ||
      new Date(doc.publicationDate).getFullYear().toString() === selectedYear;
    return matchesSearch && matchesAudience && matchesYear;
  });

  const hasFilter = searchTerm || selectedAudience !== 'all' || selectedYear !== 'all';
  const resetFilters = () => { setSearchTerm(''); setSelectedAudience('all'); setSelectedYear('all'); };

  if (loading) {
    return (
      <MainLayout>
        <div className="bg-gradient-to-br from-niger-orange via-niger-orange-dark to-niger-green py-14">
          <div className="container mx-auto px-6">
            <div className="h-8 bg-white/20 rounded w-48 mb-3 animate-pulse" />
            <div className="h-10 bg-white/20 rounded w-64 animate-pulse" />
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 py-8 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
              <div className="w-8 h-8 bg-gray-200 rounded-lg flex-shrink-0" />
            </div>
          ))}
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-6 py-12">
          <div className="bg-red-50 text-red-600 p-6 rounded-xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div><p className="font-semibold">Erreur</p><p className="text-sm">{error}</p></div>
          </div>
          <button onClick={fetchDocuments} className="mt-4 px-4 py-2 bg-niger-orange text-white rounded-lg text-sm hover:bg-niger-orange-dark transition-colors">
            Réessayer
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SeoHead title="Guides et manuels" description="Guides pratiques et manuels publiés par le MESRIT pour les étudiants, enseignants et institutions." url="/documentation/guides" />

      <div className="relative bg-gradient-to-br from-niger-orange via-niger-orange-dark to-niger-green text-white py-14 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="container mx-auto px-6 relative">
          <div className="flex items-center text-sm mb-3 opacity-80">
            <Link href="/" className="hover:opacity-100 transition-opacity">Accueil</Link>
            <ChevronRight className="w-4 h-4 mx-1.5" />
            <Link href="/documentation" className="hover:opacity-100 transition-opacity">Documentation</Link>
            <ChevronRight className="w-4 h-4 mx-1.5" />
            <span className="font-medium">Guides</span>
          </div>
          <div className="flex items-center gap-4">
            <BookOpen className="w-10 h-10 flex-shrink-0" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Guides pratiques</h1>
              <p className="text-white/80 mt-1">
                {documents.length} guide{documents.length !== 1 ? 's' : ''} disponible{documents.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8">

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-niger-orange" />
            <input
              type="search"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Rechercher un guide..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-secondary-700 focus:ring-2 focus:ring-niger-orange focus:border-niger-orange bg-white dark:bg-secondary-800 text-readable dark:text-foreground text-sm"
            />
          </div>
          <select
            value={selectedAudience}
            onChange={e => setSelectedAudience(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-secondary-700 focus:ring-2 focus:ring-niger-orange bg-white dark:bg-secondary-800 text-readable dark:text-foreground text-sm sm:w-44"
          >
            <option value="all">Tous les publics</option>
            {AUDIENCES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-secondary-700 focus:ring-2 focus:ring-niger-orange bg-white dark:bg-secondary-800 text-readable dark:text-foreground text-sm sm:w-40"
          >
            <option value="all">Toutes les années</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-readable-muted dark:text-muted-foreground">
            <span className="font-semibold text-niger-green dark:text-niger-green-light">{filteredDocuments.length}</span>
            {' '}guide{filteredDocuments.length !== 1 ? 's' : ''} trouvé{filteredDocuments.length !== 1 ? 's' : ''}
          </p>
          {hasFilter && (
            <button onClick={resetFilters} className="flex items-center gap-1.5 text-xs text-readable-muted hover:text-niger-orange transition-colors">
              <X className="w-3.5 h-3.5" /> Réinitialiser
            </button>
          )}
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-secondary-800 rounded-2xl border border-gray-100 dark:border-secondary-700">
            <BookOpen className="w-14 h-14 text-niger-orange/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-niger-green dark:text-niger-green-light mb-2">Aucun guide trouvé</h3>
            <p className="text-sm text-readable-muted dark:text-muted-foreground mb-4">
              {hasFilter ? 'Essayez de modifier vos critères de recherche.' : 'Les guides sont en cours de préparation.'}
            </p>
            {hasFilter && (
              <button onClick={resetFilters} className="px-5 py-2 bg-niger-orange text-white rounded-xl text-sm hover:bg-niger-orange-dark transition-colors">
                Réinitialiser
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-secondary-800 rounded-2xl border border-gray-100 dark:border-secondary-700 overflow-hidden divide-y divide-gray-100 dark:divide-secondary-700">
            {filteredDocuments.map(doc => (
              <div key={doc._id} className="flex items-center gap-4 px-4 py-3.5 hover:bg-niger-orange/5 dark:hover:bg-niger-orange/10 transition-colors group">
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold border ${ICON_COLOR}`}>
                  {doc.type || <BookOpen className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-niger-green dark:text-niger-green-light group-hover:text-niger-orange transition-colors text-sm sm:text-base truncate">
                    {doc.title}
                  </h3>
                  {doc.description && (
                    <p className="text-xs text-readable-muted dark:text-muted-foreground truncate hidden sm:block">{doc.description}</p>
                  )}
                </div>
                <div className="hidden md:flex flex-col items-end gap-0.5 flex-shrink-0 text-xs text-readable-muted dark:text-muted-foreground">
                  {doc.audience && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {doc.audience}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(doc.publicationDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  {doc.size && <span>{doc.size}</span>}
                </div>
                <a
                  href={doc.url || undefined}
                  download={getDownloadName(doc.url, doc.title)}
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

        <div className="mt-12 bg-white dark:bg-secondary-800 rounded-2xl border border-gray-100 dark:border-secondary-700 p-8">
          <h2 className="text-lg font-semibold text-niger-green dark:text-niger-green-light mb-6 text-center">Besoin d'aide supplémentaire ?</h2>
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-12 h-12 bg-niger-orange/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-niger-orange" />
              </div>
              <p className="font-medium text-niger-green dark:text-niger-green-light text-sm mb-1">FAQ</p>
              <p className="text-xs text-readable-muted dark:text-muted-foreground mb-3">Des réponses rapides à vos questions</p>
              <Link href="/faq" className="text-niger-orange hover:underline text-xs font-medium">Voir la FAQ →</Link>
            </div>
            <div>
              <div className="w-12 h-12 bg-niger-orange/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-niger-orange" />
              </div>
              <p className="font-medium text-niger-green dark:text-niger-green-light text-sm mb-1">Support</p>
              <p className="text-xs text-readable-muted dark:text-muted-foreground mb-3">Assistance personnalisée</p>
              <Link href="/contact" className="text-niger-orange hover:underline text-xs font-medium">Nous contacter →</Link>
            </div>
            <div>
              <div className="w-12 h-12 bg-niger-orange/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Download className="w-6 h-6 text-niger-orange" />
              </div>
              <p className="font-medium text-niger-green dark:text-niger-green-light text-sm mb-1">Formulaires</p>
              <p className="text-xs text-readable-muted dark:text-muted-foreground mb-3">Formulaires officiels</p>
              <Link href="/documentation" className="text-niger-orange hover:underline text-xs font-medium">Voir les documents →</Link>
            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}

export async function getStaticProps() {
  return { props: {}, revalidate: 3600 };
}
