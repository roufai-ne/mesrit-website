// src/pages/ministere/historique.js
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Clock, ChevronRight, Calendar, Award, Building } from 'lucide-react';
import Link from 'next/link';
import SeoHead from '@/components/seo/SeoHead';

const FALLBACK_MILESTONES = [
  { year: "1962", title: "Création du Ministère de l'Éducation Nationale", content: "Après l'indépendance du Niger, création du premier ministère en charge de l'éducation.", icon: "Building" },
  { year: "1975", title: "Création de l'Université de Niamey", content: "Fondation de la première université du Niger, qui deviendra plus tard l'Université Abdou Moumouni.", icon: "Award" },
  { year: "1992", title: "Réorganisation du système éducatif", content: "Restructuration majeure avec la séparation entre l'enseignement de base et l'enseignement supérieur.", icon: "Building" },
  { year: "2000", title: "Expansion universitaire", content: "Lancement du programme d'expansion avec la création de nouvelles universités régionales.", icon: "Award" },
  { year: "2010", title: "Modernisation technologique", content: "Introduction des TIC dans l'enseignement supérieur et développement de l'e-learning.", icon: "Building" },
  { year: "2020", title: "Création du MESRIT", content: "Formation du Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique.", icon: "Award" }
];

export default function HistoriquePage({ initialMilestones = [] }) {
  const milestones = initialMilestones.length ? initialMilestones : FALLBACK_MILESTONES;

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
                    <div key={index} className={`flex items-center ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
                      <div className={`w-1/2 ${isEven ? 'pr-8 text-right' : 'pl-8'}`}>
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
  try {
    const { fetchAPI, endpoints } = await import('@/lib/strapi');
    const { mapStrapiList, mapHistoryMilestone } = await import('@/utils/strapiMapper');
    const response = await fetchAPI(endpoints.history, {
      sort: ['order:asc', 'year:asc'],
      pagination: { limit: 50 },
    });
    const initialMilestones = mapStrapiList(response, mapHistoryMilestone) || [];
    return { props: { initialMilestones }, revalidate: 3600 };
  } catch {
    return { props: { initialMilestones: [] }, revalidate: 60 };
  }
}
