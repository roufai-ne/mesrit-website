// src/pages/ministere/missions.js
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Target, ChevronRight, CheckCircle, TrendingUp, Users, BookOpen, Award, Eye, RefreshCw, Clock, Loader } from 'lucide-react';
import Link from 'next/link';
import { useMinisterMissions } from '@/hooks/useMinisterContent';

export default function MissionsPage() {
  const [selectedMission, setSelectedMission] = useState(0);
  const { missions: missionsData, loading, error, lastUpdated, refresh, isStale } = useMinisterMissions();

  // Icônes mapping
  const iconMap = {
    BookOpen,
    Target,
    Award,
    Users
  };

  // Missions par défaut en cas d'erreur
  const fallbackMissions = [
    {
      title: "Enseignement Supérieur",
      icon: BookOpen,
      color: "from-niger-green to-niger-green-dark",
      content: "Assurer le développement et la qualité de l'enseignement supérieur au Niger pour former les cadres de demain",
      objectifs: [
        {
          text: "Améliorer l'accès à l'enseignement supérieur",
          progress: 75,
          description: "Augmentation du taux de scolarisation dans le supérieur"
        },
        {
          text: "Garantir la qualité des formations",
          progress: 85,
          description: "Mise en place de standards d'accréditation"
        },
        {
          text: "Renforcer les capacités des établissements",
          progress: 60,
          description: "Modernisation des infrastructures et équipements"
        }
      ],
      stats: {
        etablissements: "10+",
        etudiants: "100k+",
        programmes: "200+"
      }
    },
    {
      title: "Recherche",
      icon: Target,
      color: "from-niger-orange to-niger-orange-dark",
      content: "Promouvoir la recherche scientifique et l'innovation pour le développement socio-économique du Niger",
      objectifs: [
        {
          text: "Développer les infrastructures de recherche",
          progress: 45,
          description: "Construction de laboratoires et centres de recherche"
        },
        {
          text: "Soutenir les projets de recherche",
          progress: 70,
          description: "Financement et accompagnement des chercheurs"
        },
        {
          text: "Favoriser les partenariats internationaux",
          progress: 80,
          description: "Collaborations avec universités étrangères"
        }
      ],
      stats: {
        chercheurs: "500+",
        projets: "150+",
        publications: "300+"
      }
    },
    {
      title: "Innovation",
      icon: Award,
      color: "from-purple-500 to-purple-700",
      content: "Stimuler l'innovation technologique et le transfert de connaissances vers le secteur productif",
      objectifs: [
        {
          text: "Encourager les initiatives innovantes",
          progress: 55,
          description: "Incubateurs et pépinières d'entreprises"
        },
        {
          text: "Faciliter le transfert technologique",
          progress: 40,
          description: "Partenariats université-industrie"
        },
        {
          text: "Soutenir les startups universitaires",
          progress: 65,
          description: "Accompagnement entrepreneurial des étudiants"
        }
      ],
      stats: {
        startups: "50+",
        brevets: "25+",
        partenariats: "30+"
      }
    }
  ];

  // Utiliser les données dynamiques ou les données par défaut
  const missions = missionsData?.missions || fallbackMissions;
  const globalStats = missionsData?.globalStats;

  const getProgressColor = (progress) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-yellow-500";
    return "bg-orange-500";
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-niger-orange via-niger-orange-dark to-niger-green text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-niger-white/[0.05] bg-[size:20px_20px] opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="container mx-auto px-6 relative">
          <div className="flex items-center text-sm mb-4">
            <Link href="/" className="hover:text-niger-cream transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href="/ministere" className="hover:text-niger-cream transition-colors">
              Le Ministère
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-niger-cream font-medium">Nos Missions</span>
          </div>
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center mb-6">
                <Target className="w-12 h-12 mr-4 text-niger-cream" />
                <div>
                  <h1 className="text-5xl font-bold">Nos Missions</h1>
                  <p className="text-niger-cream/80 text-lg mt-2">Vision et Objectifs Stratégiques</p>
                </div>
              </div>
              <p className="text-xl text-niger-cream max-w-3xl leading-relaxed mb-6">
                Découvrez les missions fondamentales du Ministère de l'Enseignement Supérieur, 
                de la Recherche et de l'Innovation Technologique pour le développement du Niger.
              </p>
              
              {/* Indicateurs de mise à jour */}
              <div className="flex items-center gap-6 text-niger-cream/70 text-sm">
                {lastUpdated && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Mis à jour: {lastUpdated.toLocaleTimeString('fr-FR')}</span>
                  </div>
                )}
                {missionsData && !error && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Données temps réel</span>
                  </div>
                )}
                {isStale && (
                  <div className="flex items-center gap-2 text-yellow-300">
                    <RefreshCw className="w-4 h-4" />
                    <span>Actualisation recommandée</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <button 
                onClick={refresh}
                disabled={loading}
                className="px-8 py-4 bg-niger-white/20 hover:bg-niger-white/30 backdrop-blur-sm rounded-xl transition-all duration-300 flex items-center gap-3 text-white font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50"
              >
                <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualiser les missions</span>
              </button>
              
              {error && (
                <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-4 text-red-100 text-sm">
                  <p>⚠️ {error}</p>
                  <p className="mt-1 opacity-75">Missions par défaut affichées</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="bg-gradient-to-b from-niger-cream to-white dark:from-secondary-900 dark:to-secondary-800 shadow-2xl relative -mt-12 rounded-2xl mx-auto container px-6 transition-colors duration-300">
        <div className="p-8">

          {/* Navigation des missions */}
          <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg p-6 mb-8 border border-niger-orange/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-niger-green dark:text-niger-green-light">
                Nos Missions Stratégiques
              </h2>
              {loading && (
                <div className="flex items-center gap-2 text-niger-orange">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Chargement...</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              {missions.map((mission, index) => {
                const Icon = iconMap[mission.icon] || Target;
                return (
                  <button
                    key={mission.id || index}
                    onClick={() => setSelectedMission(index)}
                    className={`flex-1 p-4 rounded-xl transition-all duration-300 flex items-center gap-3 ${
                      selectedMission === index
                        ? `bg-gradient-to-r ${mission.color} text-white shadow-lg transform scale-105`
                        : 'bg-niger-cream/20 dark:bg-secondary-700 hover:bg-niger-orange/10 dark:hover:bg-niger-orange/20 text-readable dark:text-foreground'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="font-semibold">{mission.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mission sélectionnée */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg border border-niger-orange/10 overflow-hidden">
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className={`relative w-20 h-20 bg-gradient-to-br ${missions[selectedMission].color} rounded-2xl flex-shrink-0 p-4 mr-6 shadow-lg`}>
                    {React.createElement(iconMap[missions[selectedMission].icon] || Target, {
                      className: "w-12 h-12 text-white"
                    })}
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold text-niger-green dark:text-niger-green-light mb-2">
                      {missions[selectedMission].title}
                    </h2>
                    <p className="text-readable-muted dark:text-muted-foreground text-lg">
                      Mission stratégique du MESRIT
                    </p>
                  </div>
                </div>
                
                <p className="text-readable-muted dark:text-muted-foreground mb-8 text-xl leading-relaxed">
                  {missions[selectedMission].content}
                </p>

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {Object.entries(missions[selectedMission].stats).map(([key, value], idx) => (
                    <div key={idx} className="bg-gradient-to-br from-niger-cream/30 to-niger-cream/10 dark:from-secondary-700 dark:to-secondary-600 rounded-xl p-6 text-center border border-niger-orange/20">
                      <div className="text-3xl font-bold text-niger-orange dark:text-niger-orange-light mb-2">
                        {value}
                      </div>
                      <div className="text-sm font-medium text-readable-muted dark:text-muted-foreground capitalize">
                        {key}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Réalisations si disponibles */}
                {missions[selectedMission].achievements && (
                  <div className="bg-gradient-to-br from-niger-green/10 to-niger-orange/10 dark:from-niger-green/20 dark:to-niger-orange/20 rounded-xl p-6 mb-8 border border-niger-green/20">
                    <h4 className="text-lg font-bold text-niger-green dark:text-niger-green-light mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Réalisations Clés
                    </h4>
                    <ul className="space-y-2">
                      {missions[selectedMission].achievements.map((achievement, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-niger-green mt-0.5 flex-shrink-0" />
                          <span className="text-readable dark:text-foreground text-sm">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Objectifs avec barres de progression */}
                <div className="bg-niger-cream/30 dark:bg-secondary-700 rounded-2xl p-8 border border-niger-orange/10">
                  <div className="flex items-center gap-3 mb-8">
                    <TrendingUp className="w-7 h-7 text-niger-green" />
                    <h3 className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                      Objectifs et Progression
                    </h3>
                  </div>
                  
                  <div className="space-y-6">
                    {missions[selectedMission].objectifs.map((objectif, idx) => (
                      <div key={idx} className="group">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-readable dark:text-foreground mb-1 group-hover:text-niger-green dark:group-hover:text-niger-green-light transition-colors">
                              {objectif.text}
                            </h4>
                            <p className="text-sm text-readable-muted dark:text-muted-foreground">
                              {objectif.description}
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            <span className="text-lg font-bold text-niger-orange dark:text-niger-orange-light">
                              {objectif.progress}%
                            </span>
                          </div>
                        </div>
                        
                        {/* Barre de progression */}
                        <div className="w-full bg-gray-200 dark:bg-secondary-600 rounded-full h-3 overflow-hidden">
                          <div 
                            className={`h-full ${getProgressColor(objectif.progress)} transition-all duration-1000 ease-out rounded-full relative`}
                            style={{ width: `${objectif.progress}%` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Liens vers pages connexes */}
            <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg p-8 border border-niger-orange/10">
              <h3 className="text-2xl font-bold text-niger-green dark:text-niger-green-light mb-6 flex items-center gap-3">
                <Eye className="w-6 h-6 text-niger-orange" />
                Explorer davantage
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                  href="/etablissements"
                  className="group flex items-center p-6 rounded-xl hover:bg-niger-orange/10 dark:hover:bg-niger-orange/20 transition-all duration-300 border border-niger-orange/20 hover:border-niger-orange/40"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-niger-orange/20 to-niger-green/20 rounded-xl flex items-center justify-center mr-4">
                    <BookOpen className="w-6 h-6 text-niger-orange" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-2 group-hover:text-niger-orange transition-colors text-niger-green dark:text-niger-green-light">
                      Nos Établissements
                    </h4>
                    <p className="text-readable-muted dark:text-muted-foreground text-sm">
                      Découvrez notre réseau d'enseignement supérieur
                    </p>
                  </div>
                </Link>

                <Link
                  href="/ministere/organisation"
                  className="group flex items-center p-6 rounded-xl hover:bg-niger-green/10 dark:hover:bg-niger-green/20 transition-all duration-300 border border-niger-green/20 hover:border-niger-green/40"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-niger-green/20 to-niger-orange/20 rounded-xl flex items-center justify-center mr-4">
                    <Users className="w-6 h-6 text-niger-green" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-2 group-hover:text-niger-green transition-colors text-niger-green dark:text-niger-green-light">
                      Notre Organisation
                    </h4>
                    <p className="text-readable-muted dark:text-muted-foreground text-sm">
                      Structure et organigramme du ministère
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Statistiques globales */}
            {globalStats && (
              <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg p-8 border border-niger-orange/10">
                <h3 className="text-2xl font-bold text-niger-green dark:text-niger-green-light mb-6 flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-niger-orange" />
                  Impact Global du MESRIT
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {Object.entries(globalStats).map(([key, value]) => (
                    <div key={key} className="text-center p-4 bg-gradient-to-br from-niger-cream/20 to-niger-orange/10 dark:from-secondary-700 dark:to-secondary-600 rounded-xl">
                      <div className="text-2xl font-bold text-niger-orange dark:text-niger-orange-light mb-2">
                        {value}
                      </div>
                      <div className="text-sm font-medium text-readable-muted dark:text-muted-foreground capitalize">
                        {key}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

