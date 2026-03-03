// src/pages/etablissements/universites.js
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import {
  GraduationCap, MapPin, Users, BookOpen,
  ChevronRight, Search, Calendar, Award, ExternalLink, X
} from 'lucide-react';
import Link from 'next/link';
import { fetchAPI, endpoints } from '@/lib/strapi';
import { mapStrapiList, mapEstablishment } from '@/utils/strapiMapper';
import SeoHead from '@/components/seo/SeoHead';

const REGIONS = ['all', 'Niamey', 'Maradi', 'Tahoua', 'Zinder', 'Tillabéri', 'Dosso', 'Agadez', 'Diffa'];

export default function UniversitesPage() {
  const [universites, setUniversites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');

  useEffect(() => { fetchUniversites(); }, []);

  const fetchUniversites = async () => {
    try {
      setLoading(true);
      let allData = [], page = 1;
      const pageSize = 200;
      while (true) {
        // eslint-disable-next-line no-await-in-loop
        const response = await fetchAPI(endpoints.establishments, {
          filters: { type: 'Université' },
          pagination: { page, pageSize },
          populate: ['logo'],
          sort: ['name:asc'],
        });
        const chunk = mapStrapiList(response, mapEstablishment);
        allData = allData.concat(chunk);
        const total = response.meta?.pagination?.total ?? chunk.length;
        if (allData.length >= total || chunk.length < pageSize) break;
        page++;
      }
      setUniversites(allData);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const filteredUniversites = universites.filter(u => {
    const q = searchTerm.toLowerCase();
    return (!q || u.nom?.toLowerCase().includes(q) || u.description?.toLowerCase().includes(q)) &&
      (selectedRegion === 'all' || u.region === selectedRegion);
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

  const hasFilter = searchTerm || selectedRegion !== 'all';

  return (
    <MainLayout>
      <SeoHead title="Universités" description="Universités publiques et privées du Niger reconnues par le Ministère de l'Enseignement Supérieur." url="/etablissements/universites" />

      <div className="relative bg-gradient-to-br from-niger-orange via-niger-orange-dark to-niger-green text-white py-14 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="container mx-auto px-6 relative">
          <div className="flex items-center text-sm mb-3 opacity-80">
            <Link href="/" className="hover:opacity-100 transition-opacity">Accueil</Link>
            <ChevronRight className="w-4 h-4 mx-1.5" />
            <Link href="/etablissements" className="hover:opacity-100 transition-opacity">Établissements</Link>
            <ChevronRight className="w-4 h-4 mx-1.5" />
            <span className="font-medium">Universités</span>
          </div>
          <div className="flex items-center gap-4">
            <GraduationCap className="w-10 h-10 flex-shrink-0" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Nos Universités</h1>
              <p className="text-white/80 mt-1">{universites.length} université{universites.length !== 1 ? 's' : ''} référencée{universites.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8">

        <div className="flex flex-wrap gap-2 mb-5">
          {REGIONS.map(region => {
            const count = region === 'all' ? universites.length : universites.filter(u => u.region === region).length;
            return (
              <button key={region} onClick={() => setSelectedRegion(region)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  selectedRegion === region
                    ? 'bg-niger-orange text-white border-niger-orange'
                    : 'bg-white dark:bg-secondary-800 text-readable dark:text-foreground border-gray-200 dark:border-secondary-700 hover:border-niger-orange/50'
                }`}>
                {region === 'all' ? 'Toutes les régions' : region}
                {count > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedRegion === region ? 'bg-white/25' : 'bg-gray-100 dark:bg-secondary-700'}`}>{count}</span>}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-niger-orange" />
            <input type="search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="Rechercher une université..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-secondary-700 focus:ring-2 focus:ring-niger-orange focus:border-niger-orange bg-white dark:bg-secondary-800 text-readable dark:text-foreground text-sm" />
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-readable-muted dark:text-muted-foreground">
            <span className="font-semibold text-niger-green dark:text-niger-green-light">{filteredUniversites.length}</span>
            {' '}université{filteredUniversites.length !== 1 ? 's' : ''} trouvée{filteredUniversites.length !== 1 ? 's' : ''}
          </p>
          {hasFilter && (
            <button onClick={() => { setSearchTerm(''); setSelectedRegion('all'); }}
              className="flex items-center gap-1.5 text-xs text-readable-muted hover:text-niger-orange transition-colors">
              <X className="w-3.5 h-3.5" /> Réinitialiser
            </button>
          )}
        </div>

        {filteredUniversites.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-secondary-800 rounded-2xl border border-gray-100 dark:border-secondary-700">
            <GraduationCap className="w-14 h-14 text-niger-orange/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-niger-green dark:text-niger-green-light mb-2">Aucune université trouvée</h3>
            <p className="text-sm text-readable-muted dark:text-muted-foreground mb-4">
              {hasFilter ? 'Essayez de modifier vos critères.' : 'Les universités sont en cours de référencement.'}
            </p>
            {hasFilter && (
              <button onClick={() => { setSearchTerm(''); setSelectedRegion('all'); }}
                className="px-5 py-2 bg-niger-orange text-white rounded-xl text-sm hover:bg-niger-orange-dark transition-colors">
                Réinitialiser
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-secondary-800 rounded-2xl border border-gray-100 dark:border-secondary-700 overflow-hidden divide-y divide-gray-100 dark:divide-secondary-700">
            {filteredUniversites.map(universite => (
              <div key={universite._id} className="flex items-center gap-4 px-4 py-4 hover:bg-niger-orange/5 dark:hover:bg-niger-orange/10 transition-colors group">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-niger-orange/10 border border-niger-orange/20">
                  <GraduationCap className="w-5 h-5 text-niger-orange" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-niger-green dark:text-niger-green-light group-hover:text-niger-orange transition-colors text-sm sm:text-base truncate">
                    {universite.sigle ? <><span className="font-bold">{universite.sigle}</span> — {universite.nom}</> : universite.nom}
                  </h3>
                  {universite.description && (
                    <p className="text-xs text-readable-muted dark:text-muted-foreground truncate hidden sm:block">{universite.description}</p>
                  )}
                </div>
                <div className="hidden md:flex flex-col items-end gap-0.5 flex-shrink-0 text-xs text-readable-muted dark:text-muted-foreground">
                  {universite.region && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{universite.region}</span>}
                  {universite.students && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{universite.students.toLocaleString()} étudiants</span>}
                  {universite.founded && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Fondée en {universite.founded}</span>}
                </div>
                <div className="flex-shrink-0 flex gap-2 items-center">
                  {universite.siteWeb && (
                    <a href={universite.siteWeb} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-lg text-readable-muted hover:text-niger-orange transition-colors"
                      title="Site officiel">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <Link href={`/etablissements/${universite._id}`}
                    className="p-2.5 rounded-xl transition-all text-niger-orange hover:bg-niger-orange hover:text-white border border-niger-orange/30 hover:border-niger-orange hover:shadow-md"
                    title="En savoir plus">
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: universites.length, label: 'Universités', Icon: GraduationCap },
            { value: '8', label: 'Régions', Icon: MapPin },
            { value: '50+', label: 'Filières', Icon: BookOpen },
            { value: '80K+', label: 'Étudiants', Icon: Users },
          ].map(({ value, label, Icon }) => (
            <div key={label} className="bg-white dark:bg-secondary-800 rounded-2xl border border-gray-100 dark:border-secondary-700 p-5 text-center">
              <div className="w-10 h-10 bg-niger-orange/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Icon className="w-5 h-5 text-niger-orange" />
              </div>
              <div className="text-2xl font-bold text-niger-green dark:text-niger-green-light mb-1">{value}</div>
              <div className="text-xs text-readable-muted dark:text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

export async function getStaticProps() {
  return { props: {}, revalidate: 3600 };
}
