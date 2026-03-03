// src/pages/etablissements/ecoles.js
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import {
  BookOpen, MapPin, Users, GraduationCap,
  ChevronRight, Search, Award, Clock, Target, X
} from 'lucide-react';
import Link from 'next/link';
import { fetchAPI, endpoints } from '@/lib/strapi';
import { mapStrapiList, mapEstablishment } from '@/utils/strapiMapper';
import SeoHead from '@/components/seo/SeoHead';

const TYPES = ['all', 'École Supérieure', 'École Technique', 'École Professionnelle', 'École de Commerce'];
const TYPE_BADGE = {
  'École Supérieure': 'bg-blue-100 text-blue-800',
  'École Technique': 'bg-green-100 text-green-800',
  'École Professionnelle': 'bg-orange-100 text-orange-800',
  'École de Commerce': 'bg-purple-100 text-purple-800',
};

export default function EcolesPage() {
  const [ecoles, setEcoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => { fetchEcoles(); }, []);

  const fetchEcoles = async () => {
    try {
      setLoading(true);
      let allData = [], page = 1;
      const pageSize = 200;
      while (true) {
        // eslint-disable-next-line no-await-in-loop
        const response = await fetchAPI(endpoints.establishments, {
          filters: { type: 'École' },
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
      setEcoles(allData);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const filteredEcoles = ecoles.filter(e => {
    const q = searchTerm.toLowerCase();
    return (!q || e.nom?.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q)) &&
      (selectedType === 'all' || e.subType === selectedType);
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

  const hasFilter = searchTerm || selectedType !== 'all';

  return (
    <MainLayout>
      <SeoHead title="Grandes écoles" description="Liste des grandes écoles reconnues par le MESRIT Niger — formations et informations pratiques." url="/etablissements/ecoles" />

      <div className="relative bg-gradient-to-br from-niger-orange via-niger-orange-dark to-niger-green text-white py-14 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="container mx-auto px-6 relative">
          <div className="flex items-center text-sm mb-3 opacity-80">
            <Link href="/" className="hover:opacity-100 transition-opacity">Accueil</Link>
            <ChevronRight className="w-4 h-4 mx-1.5" />
            <Link href="/etablissements" className="hover:opacity-100 transition-opacity">Établissements</Link>
            <ChevronRight className="w-4 h-4 mx-1.5" />
            <span className="font-medium">Écoles</span>
          </div>
          <div className="flex items-center gap-4">
            <BookOpen className="w-10 h-10 flex-shrink-0" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Écoles Professionnelles</h1>
              <p className="text-white/80 mt-1">{ecoles.length} école{ecoles.length !== 1 ? 's' : ''} référencée{ecoles.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8">

        <div className="flex flex-wrap gap-2 mb-5">
          {TYPES.map(type => {
            const count = type === 'all' ? ecoles.length : ecoles.filter(e => e.subType === type).length;
            return (
              <button key={type} onClick={() => setSelectedType(type)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  selectedType === type
                    ? 'bg-niger-orange text-white border-niger-orange'
                    : 'bg-white dark:bg-secondary-800 text-readable dark:text-foreground border-gray-200 dark:border-secondary-700 hover:border-niger-orange/50'
                }`}>
                {type === 'all' ? 'Tous les types' : type}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedType === type ? 'bg-white/25' : 'bg-gray-100 dark:bg-secondary-700'}`}>{count}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-niger-orange" />
            <input type="search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="Rechercher une école..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-secondary-700 focus:ring-2 focus:ring-niger-orange focus:border-niger-orange bg-white dark:bg-secondary-800 text-readable dark:text-foreground text-sm" />
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-readable-muted dark:text-muted-foreground">
            <span className="font-semibold text-niger-green dark:text-niger-green-light">{filteredEcoles.length}</span>
            {' '}école{filteredEcoles.length !== 1 ? 's' : ''} trouvée{filteredEcoles.length !== 1 ? 's' : ''}
          </p>
          {hasFilter && (
            <button onClick={() => { setSearchTerm(''); setSelectedType('all'); }}
              className="flex items-center gap-1.5 text-xs text-readable-muted hover:text-niger-orange transition-colors">
              <X className="w-3.5 h-3.5" /> Réinitialiser
            </button>
          )}
        </div>

        {filteredEcoles.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-secondary-800 rounded-2xl border border-gray-100 dark:border-secondary-700">
            <BookOpen className="w-14 h-14 text-niger-orange/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-niger-green dark:text-niger-green-light mb-2">Aucune école trouvée</h3>
            <p className="text-sm text-readable-muted dark:text-muted-foreground mb-4">
              {hasFilter ? 'Essayez de modifier vos critères.' : 'Les écoles sont en cours de référencement.'}
            </p>
            {hasFilter && (
              <button onClick={() => { setSearchTerm(''); setSelectedType('all'); }}
                className="px-5 py-2 bg-niger-orange text-white rounded-xl text-sm hover:bg-niger-orange-dark transition-colors">
                Réinitialiser
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-secondary-800 rounded-2xl border border-gray-100 dark:border-secondary-700 overflow-hidden divide-y divide-gray-100 dark:divide-secondary-700">
            {filteredEcoles.map(ecole => (
              <div key={ecole._id} className="flex items-center gap-4 px-4 py-4 hover:bg-niger-orange/5 dark:hover:bg-niger-orange/10 transition-colors group">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-niger-orange/10 border border-niger-orange/20">
                  <BookOpen className="w-5 h-5 text-niger-orange" />
                </div>
                <div className="flex-1 min-w-0">
                  {ecole.subType && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium mr-2 ${TYPE_BADGE[ecole.subType] || 'bg-gray-100 text-gray-700'}`}>{ecole.subType}</span>
                  )}
                  <h3 className="font-medium text-niger-green dark:text-niger-green-light group-hover:text-niger-orange transition-colors text-sm sm:text-base truncate">
                    {ecole.nom}
                  </h3>
                  {ecole.description && (
                    <p className="text-xs text-readable-muted dark:text-muted-foreground truncate hidden sm:block">{ecole.description}</p>
                  )}
                </div>
                <div className="hidden md:flex flex-col items-end gap-0.5 flex-shrink-0 text-xs text-readable-muted dark:text-muted-foreground">
                  {ecole.region && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ecole.region}</span>}
                  {ecole.students && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{ecole.students.toLocaleString()} étudiants</span>}
                  {ecole.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ecole.duration}</span>}
                </div>
                <Link href={`/etablissements/${ecole._id}`}
                  className="flex-shrink-0 p-2.5 rounded-xl transition-all text-niger-orange hover:bg-niger-orange hover:text-white border border-niger-orange/30 hover:border-niger-orange hover:shadow-md"
                  title="En savoir plus">
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-white dark:bg-secondary-800 rounded-2xl border border-gray-100 dark:border-secondary-700 p-8">
          <h2 className="text-lg font-semibold text-niger-green dark:text-niger-green-light mb-6">L'excellence de la formation professionnelle</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { Icon: Target, label: 'Formation Pratique', txt: 'Apprentissage axé sur la pratique et les compétences concrètes' },
              { Icon: Users, label: 'Partenariats Entreprises', txt: "Collaborations étroites pour garantir l'employabilité" },
              { Icon: Award, label: 'Certifications Reconnues', txt: 'Diplômes reconnus par les professionnels du secteur' },
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
