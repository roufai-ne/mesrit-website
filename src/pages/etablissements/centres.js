// src/pages/etablissements/centres.js
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import {
  GraduationCap, MapPin, Users, Clock,
  ChevronRight, Search, Award, BookOpen, Briefcase, Target, X
} from 'lucide-react';
import Link from 'next/link';
import { fetchAPI, endpoints } from '@/lib/strapi';
import { mapStrapiList, mapEstablishment } from '@/utils/strapiMapper';
import SeoHead from '@/components/seo/SeoHead';

const CATEGORIES = ['all', 'Formation Continue', 'Perfectionnement', 'Reconversion', 'Certification'];
const CAT_BADGE = {
  'Formation Continue': 'bg-blue-100 text-blue-800',
  'Perfectionnement': 'bg-green-100 text-green-800',
  'Reconversion': 'bg-orange-100 text-orange-800',
  'Certification': 'bg-purple-100 text-purple-800',
};

const getCatIcon = (cat) => {
  switch (cat) {
    case 'Formation Continue': return BookOpen;
    case 'Perfectionnement': return Target;
    case 'Reconversion': return Briefcase;
    case 'Certification': return Award;
    default: return GraduationCap;
  }
};

export default function CentresPage() {
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => { fetchCentres(); }, []);

  const fetchCentres = async () => {
    try {
      setLoading(true);
      const response = await fetchAPI(endpoints.establishments, {
        filters: { type: 'Centre' },
        pagination: { limit: 100 }
      });
      setCentres(mapStrapiList(response, mapEstablishment));
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const filteredCentres = centres.filter(c => {
    const q = searchTerm.toLowerCase();
    return (!q || c.nom?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)) &&
      (selectedCategory === 'all' || c.category === selectedCategory);
  });

  if (loading) {
    return (
      <MainLayout>
        <div className="relative bg-gradient-to-br from-niger-orange via-niger-orange-dark to-niger-green py-14">
          <div className="container mx-auto px-6">
            <div className="h-5 bg-white/20 rounded w-56 mb-3 animate-pulse" />
            <div className="h-10 bg-white/20 rounded w-72 animate-pulse" />
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 py-8 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0" />
              <div className="flex-1"><div className="h-4 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-3 bg-gray-200 rounded w-1/2" /></div>
              <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0" />
            </div>
          ))}
        </div>
      </MainLayout>
    );
  }

  const hasFilter = searchTerm || selectedCategory !== 'all';

  return (
    <MainLayout>
      <SeoHead title="Centres de recherche" description="Centres de recherche et d'innovation au Niger placés sous la tutelle du MESRIT." url="/etablissements/centres" />

      <div className="relative bg-gradient-to-br from-niger-orange via-niger-orange-dark to-niger-green text-white py-14 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="container mx-auto px-6 relative">
          <div className="flex items-center text-sm mb-3 opacity-80">
            <Link href="/" className="hover:opacity-100 transition-opacity">Accueil</Link>
            <ChevronRight className="w-4 h-4 mx-1.5" />
            <Link href="/etablissements" className="hover:opacity-100 transition-opacity">Établissements</Link>
            <ChevronRight className="w-4 h-4 mx-1.5" />
            <span className="font-medium">Centres de Formation</span>
          </div>
          <div className="flex items-center gap-4">
            <GraduationCap className="w-10 h-10 flex-shrink-0" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Centres de Formation Continue</h1>
              <p className="text-white/80 mt-1">{centres.length} centre{centres.length !== 1 ? 's' : ''} référencé{centres.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8">

        {/* Catégories */}
        <div className="flex flex-wrap gap-2 mb-5">
          {CATEGORIES.map(cat => {
            const count = cat === 'all' ? centres.length : centres.filter(c => c.category === cat).length;
            return (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  selectedCategory === cat
                    ? 'bg-niger-orange text-white border-niger-orange'
                    : 'bg-white dark:bg-secondary-800 text-readable dark:text-foreground border-gray-200 dark:border-secondary-700 hover:border-niger-orange/50'
                }`}>
                {cat === 'all' ? 'Tous' : cat}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedCategory === cat ? 'bg-white/25' : 'bg-gray-100 dark:bg-secondary-700'}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Recherche */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-niger-orange" />
            <input type="search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="Rechercher un centre..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-secondary-700 focus:ring-2 focus:ring-niger-orange focus:border-niger-orange bg-white dark:bg-secondary-800 text-readable dark:text-foreground text-sm" />
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-readable-muted dark:text-muted-foreground">
            <span className="font-semibold text-niger-green dark:text-niger-green-light">{filteredCentres.length}</span>
            {' '}centre{filteredCentres.length !== 1 ? 's' : ''} trouvé{filteredCentres.length !== 1 ? 's' : ''}
          </p>
          {hasFilter && (
            <button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
              className="flex items-center gap-1.5 text-xs text-readable-muted hover:text-niger-orange transition-colors">
              <X className="w-3.5 h-3.5" /> Réinitialiser
            </button>
          )}
        </div>

        {filteredCentres.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-secondary-800 rounded-2xl border border-gray-100 dark:border-secondary-700">
            <GraduationCap className="w-14 h-14 text-niger-orange/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-niger-green dark:text-niger-green-light mb-2">Aucun centre trouvé</h3>
            <p className="text-sm text-readable-muted dark:text-muted-foreground mb-4">
              {hasFilter ? 'Essayez de modifier vos critères.' : 'Les centres sont en cours de référencement.'}
            </p>
            {hasFilter && (
              <button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                className="px-5 py-2 bg-niger-orange text-white rounded-xl text-sm hover:bg-niger-orange-dark transition-colors">
                Réinitialiser
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-secondary-800 rounded-2xl border border-gray-100 dark:border-secondary-700 overflow-hidden divide-y divide-gray-100 dark:divide-secondary-700">
            {filteredCentres.map(centre => {
              const CatIcon = getCatIcon(centre.category);
              return (
                <div key={centre._id} className="flex items-center gap-4 px-4 py-4 hover:bg-niger-orange/5 dark:hover:bg-niger-orange/10 transition-colors group">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-niger-orange/10 border border-niger-orange/20">
                    <CatIcon className="w-5 h-5 text-niger-orange" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {centre.category && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium mr-2 ${CAT_BADGE[centre.category] || 'bg-gray-100 text-gray-700'}`}>{centre.category}</span>
                    )}
                    <h3 className="font-medium text-niger-green dark:text-niger-green-light group-hover:text-niger-orange transition-colors text-sm sm:text-base truncate">
                      {centre.nom}
                    </h3>
                    {centre.description && (
                      <p className="text-xs text-readable-muted dark:text-muted-foreground truncate hidden sm:block">{centre.description}</p>
                    )}
                  </div>
                  <div className="hidden md:flex flex-col items-end gap-0.5 flex-shrink-0 text-xs text-readable-muted dark:text-muted-foreground">
                    {centre.region && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{centre.region}</span>}
                    {centre.trainees && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{centre.trainees.toLocaleString()} stagiaires/an</span>}
                  </div>
                  <Link href={`/etablissements/${centre._id}`}
                    className="flex-shrink-0 p-2.5 rounded-xl transition-all text-niger-orange hover:bg-niger-orange hover:text-white border border-niger-orange/30 hover:border-niger-orange hover:shadow-md"
                    title="En savoir plus">
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Section info */}
        <div className="mt-12 bg-white dark:bg-secondary-800 rounded-2xl border border-gray-100 dark:border-secondary-700 p-8">
          <h2 className="text-lg font-semibold text-niger-green dark:text-niger-green-light mb-6">Pourquoi choisir la formation continue ?</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { Icon: BookOpen, label: 'Apprentissage Continu', txt: 'Restez à jour avec les dernières innovations' },
              { Icon: Target, label: 'Perfectionnement', txt: 'Développez vos compétences professionnelles' },
              { Icon: Briefcase, label: 'Reconversion', txt: 'Changez de carrière avec une formation adaptée' },
              { Icon: Award, label: 'Certification', txt: 'Obtenez des certifications reconnues' },
            ].map(({ Icon, label, txt }) => (
              <div key={label} className="text-center">
                <div className="w-12 h-12 bg-niger-orange/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-niger-orange" />
                </div>
                <p className="font-medium text-niger-green dark:text-niger-green-light text-sm mb-1">{label}</p>
                <p className="text-xs text-readable-muted dark:text-muted-foreground">{txt}</p>
              </div>
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
