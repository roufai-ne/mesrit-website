// Script to rewrite all 4 établissement sub-pages with MESRIT hero + compact list
const fs = require('fs');

const base = 'c:/Users/PAES/Desktop/Devs/mesrit-websiteV2/mesrit-website/src/pages/etablissements';

// ─────────────────────────────────────────────
// CENTRES.JS
// ─────────────────────────────────────────────
const centresContent = `// src/pages/etablissements/centres.js
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
                className={\`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all \${
                  selectedCategory === cat
                    ? 'bg-niger-orange text-white border-niger-orange'
                    : 'bg-white dark:bg-secondary-800 text-readable dark:text-foreground border-gray-200 dark:border-secondary-700 hover:border-niger-orange/50'
                }\`}>
                {cat === 'all' ? 'Tous' : cat}
                <span className={\`text-xs px-1.5 py-0.5 rounded-full \${selectedCategory === cat ? 'bg-white/25' : 'bg-gray-100 dark:bg-secondary-700'}\`}>{count}</span>
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
                      <span className={\`text-xs px-2 py-0.5 rounded-full font-medium mr-2 \${CAT_BADGE[centre.category] || 'bg-gray-100 text-gray-700'}\`}>{centre.category}</span>
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
                  <Link href={\`/etablissements/\${centre._id}\`}
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
`;

// ─────────────────────────────────────────────
// ECOLES.JS
// ─────────────────────────────────────────────
const ecolesContent = `// src/pages/etablissements/ecoles.js
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
                className={\`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all \${
                  selectedType === type
                    ? 'bg-niger-orange text-white border-niger-orange'
                    : 'bg-white dark:bg-secondary-800 text-readable dark:text-foreground border-gray-200 dark:border-secondary-700 hover:border-niger-orange/50'
                }\`}>
                {type === 'all' ? 'Tous les types' : type}
                <span className={\`text-xs px-1.5 py-0.5 rounded-full \${selectedType === type ? 'bg-white/25' : 'bg-gray-100 dark:bg-secondary-700'}\`}>{count}</span>
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
                    <span className={\`text-xs px-2 py-0.5 rounded-full font-medium mr-2 \${TYPE_BADGE[ecole.subType] || 'bg-gray-100 text-gray-700'}\`}>{ecole.subType}</span>
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
                <Link href={\`/etablissements/\${ecole._id}\`}
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
              { Icon: Users, label: 'Partenariats Entreprises', txt: 'Collaborations étroites pour garantir l\'employabilité' },
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
`;

// ─────────────────────────────────────────────
// INSTITUTS.JS
// ─────────────────────────────────────────────
const institutsContent = `// src/pages/etablissements/instituts.js
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import {
  School, MapPin, Users, BookOpen,
  ChevronRight, Search, Award, FlaskConical, Briefcase, X
} from 'lucide-react';
import Link from 'next/link';
import { fetchAPI, endpoints } from '@/lib/strapi';
import { mapStrapiList, mapEstablishment } from '@/utils/strapiMapper';
import SeoHead from '@/components/seo/SeoHead';

const DOMAINS = ['all', 'Technologie', 'Sciences Appliquées', 'Agriculture', 'Santé', 'Commerce'];
const DOMAIN_BADGE = {
  'Technologie': 'bg-purple-100 text-purple-800',
  'Commerce': 'bg-green-100 text-green-800',
  'Santé': 'bg-red-100 text-red-800',
  'Agriculture': 'bg-yellow-100 text-yellow-800',
};

const getDomainIcon = (domain) => {
  if (domain === 'Technologie') return FlaskConical;
  if (domain === 'Commerce') return Briefcase;
  if (domain === 'Santé') return Award;
  return BookOpen;
};

export default function InstitutsPage() {
  const [instituts, setInstituts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');

  useEffect(() => { fetchInstituts(); }, []);

  const fetchInstituts = async () => {
    try {
      setLoading(true);
      let allData = [], page = 1;
      const pageSize = 200;
      while (true) {
        // eslint-disable-next-line no-await-in-loop
        const response = await fetchAPI(endpoints.establishments, {
          filters: { type: 'Institut' },
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
      setInstituts(allData);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const filteredInstituts = instituts.filter(i => {
    const q = searchTerm.toLowerCase();
    return (!q || i.nom?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)) &&
      (selectedDomain === 'all' || i.domain === selectedDomain);
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

  const hasFilter = searchTerm || selectedDomain !== 'all';

  return (
    <MainLayout>
      <SeoHead title="Instituts de recherche" description="Instituts d'enseignement supérieur et de recherche au Niger agréés par le MESRIT." url="/etablissements/instituts" />

      <div className="relative bg-gradient-to-br from-niger-orange via-niger-orange-dark to-niger-green text-white py-14 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="container mx-auto px-6 relative">
          <div className="flex items-center text-sm mb-3 opacity-80">
            <Link href="/" className="hover:opacity-100 transition-opacity">Accueil</Link>
            <ChevronRight className="w-4 h-4 mx-1.5" />
            <Link href="/etablissements" className="hover:opacity-100 transition-opacity">Établissements</Link>
            <ChevronRight className="w-4 h-4 mx-1.5" />
            <span className="font-medium">Instituts</span>
          </div>
          <div className="flex items-center gap-4">
            <School className="w-10 h-10 flex-shrink-0" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Instituts Spécialisés</h1>
              <p className="text-white/80 mt-1">{instituts.length} institut{instituts.length !== 1 ? 's' : ''} référencé{instituts.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8">

        <div className="flex flex-wrap gap-2 mb-5">
          {DOMAINS.map(domain => {
            const count = domain === 'all' ? instituts.length : instituts.filter(i => i.domain === domain).length;
            const DIcon = getDomainIcon(domain);
            return (
              <button key={domain} onClick={() => setSelectedDomain(domain)}
                className={\`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all \${
                  selectedDomain === domain
                    ? 'bg-niger-orange text-white border-niger-orange'
                    : 'bg-white dark:bg-secondary-800 text-readable dark:text-foreground border-gray-200 dark:border-secondary-700 hover:border-niger-orange/50'
                }\`}>
                {domain === 'all' ? 'Tous les domaines' : domain}
                <span className={\`text-xs px-1.5 py-0.5 rounded-full \${selectedDomain === domain ? 'bg-white/25' : 'bg-gray-100 dark:bg-secondary-700'}\`}>{count}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-niger-orange" />
            <input type="search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="Rechercher un institut..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-secondary-700 focus:ring-2 focus:ring-niger-orange focus:border-niger-orange bg-white dark:bg-secondary-800 text-readable dark:text-foreground text-sm" />
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-readable-muted dark:text-muted-foreground">
            <span className="font-semibold text-niger-green dark:text-niger-green-light">{filteredInstituts.length}</span>
            {' '}institut{filteredInstituts.length !== 1 ? 's' : ''} trouvé{filteredInstituts.length !== 1 ? 's' : ''}
          </p>
          {hasFilter && (
            <button onClick={() => { setSearchTerm(''); setSelectedDomain('all'); }}
              className="flex items-center gap-1.5 text-xs text-readable-muted hover:text-niger-orange transition-colors">
              <X className="w-3.5 h-3.5" /> Réinitialiser
            </button>
          )}
        </div>

        {filteredInstituts.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-secondary-800 rounded-2xl border border-gray-100 dark:border-secondary-700">
            <School className="w-14 h-14 text-niger-orange/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-niger-green dark:text-niger-green-light mb-2">Aucun institut trouvé</h3>
            <p className="text-sm text-readable-muted dark:text-muted-foreground mb-4">
              {hasFilter ? 'Essayez de modifier vos critères.' : 'Les instituts sont en cours de référencement.'}
            </p>
            {hasFilter && (
              <button onClick={() => { setSearchTerm(''); setSelectedDomain('all'); }}
                className="px-5 py-2 bg-niger-orange text-white rounded-xl text-sm hover:bg-niger-orange-dark transition-colors">
                Réinitialiser
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-secondary-800 rounded-2xl border border-gray-100 dark:border-secondary-700 overflow-hidden divide-y divide-gray-100 dark:divide-secondary-700">
            {filteredInstituts.map(institut => {
              const DIcon = getDomainIcon(institut.domain);
              return (
                <div key={institut._id} className="flex items-center gap-4 px-4 py-4 hover:bg-niger-orange/5 dark:hover:bg-niger-orange/10 transition-colors group">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-niger-orange/10 border border-niger-orange/20">
                    <DIcon className="w-5 h-5 text-niger-orange" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {institut.domain && (
                      <span className={\`text-xs px-2 py-0.5 rounded-full font-medium mr-2 \${DOMAIN_BADGE[institut.domain] || 'bg-gray-100 text-gray-700'}\`}>{institut.domain}</span>
                    )}
                    <h3 className="font-medium text-niger-green dark:text-niger-green-light group-hover:text-niger-orange transition-colors text-sm sm:text-base truncate">
                      {institut.nom}
                    </h3>
                    {institut.description && (
                      <p className="text-xs text-readable-muted dark:text-muted-foreground truncate hidden sm:block">{institut.description}</p>
                    )}
                  </div>
                  <div className="hidden md:flex flex-col items-end gap-0.5 flex-shrink-0 text-xs text-readable-muted dark:text-muted-foreground">
                    {institut.region && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{institut.region}</span>}
                    {institut.students && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{institut.students.toLocaleString()} étudiants</span>}
                  </div>
                  <Link href={\`/etablissements/\${institut._id}\`}
                    className="flex-shrink-0 p-2.5 rounded-xl transition-all text-niger-orange hover:bg-niger-orange hover:text-white border border-niger-orange/30 hover:border-niger-orange hover:shadow-md"
                    title="En savoir plus">
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-12 bg-white dark:bg-secondary-800 rounded-2xl border border-gray-100 dark:border-secondary-700 p-8">
          <h2 className="text-lg font-semibold text-niger-green dark:text-niger-green-light mb-6">Pourquoi choisir nos instituts ?</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { Icon: FlaskConical, label: 'Formation Spécialisée', txt: 'Programmes ciblés sur les besoins du marché du travail' },
              { Icon: Briefcase, label: 'Insertion Professionnelle', txt: 'Taux d\'emploi élevé grâce à une formation pratique' },
              { Icon: Award, label: 'Excellence Reconnue', txt: 'Diplômes reconnus nationalement et internationalement' },
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
`;

// ─────────────────────────────────────────────
// UNIVERSITES.JS
// ─────────────────────────────────────────────
const universitesContent = `// src/pages/etablissements/universites.js
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
                className={\`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all \${
                  selectedRegion === region
                    ? 'bg-niger-orange text-white border-niger-orange'
                    : 'bg-white dark:bg-secondary-800 text-readable dark:text-foreground border-gray-200 dark:border-secondary-700 hover:border-niger-orange/50'
                }\`}>
                {region === 'all' ? 'Toutes les régions' : region}
                {count > 0 && <span className={\`text-xs px-1.5 py-0.5 rounded-full \${selectedRegion === region ? 'bg-white/25' : 'bg-gray-100 dark:bg-secondary-700'}\`}>{count}</span>}
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
                  <Link href={\`/etablissements/\${universite._id}\`}
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
`;

fs.writeFileSync(base + '/centres.js', centresContent, 'utf8');
fs.writeFileSync(base + '/ecoles.js', ecolesContent, 'utf8');
fs.writeFileSync(base + '/instituts.js', institutsContent, 'utf8');
fs.writeFileSync(base + '/universites.js', universitesContent, 'utf8');

console.log('All 4 établissement pages written successfully');
console.log('centres.js:', fs.statSync(base + '/centres.js').size, 'bytes');
console.log('ecoles.js:', fs.statSync(base + '/ecoles.js').size, 'bytes');
console.log('instituts.js:', fs.statSync(base + '/instituts.js').size, 'bytes');
console.log('universites.js:', fs.statSync(base + '/universites.js').size, 'bytes');
