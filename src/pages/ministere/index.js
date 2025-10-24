import React, { useMemo, Suspense } from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  Users,
  Building,
  Target,
  ChevronRight,
  Mail,
  BookOpen,
  GraduationCap,
  Loader,
  RefreshCw,
  Clock,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { useMinisterContent } from "@/hooks/useMinisterContent";
import { useSettings } from "@/contexts/SettingsContext";
import SectionStatsDisplay from "@/components/ministry/SectionStatsDisplay";

// Lazy loading de la section stats qui est plus lourde
const StatsSection = React.lazy(() => import("@/components/home/StatsSection"));

const LoadingFallback = () => (
  <div className="flex justify-center items-center p-8">
    <Loader className="w-8 h-8 animate-spin text-niger-orange" />
  </div>
);

export default function MinisterePage() {
  const { content, loading, error, lastUpdated, refresh, isStale } = useMinisterContent();
  const { settings } = useSettings();

  // Icônes mapping
  const iconMap = {
    Target,
    Building,
    Users,
    Mail,
    BookOpen,
    GraduationCap
  };

  // Données par défaut en cas d'erreur
  const fallbackSections = useMemo(
    () => [
      {
        title: "Notre Mission",
        icon: Target,
        content: "Promouvoir l'excellence dans l'enseignement supérieur et la recherche au Niger par des programmes innovants et une vision stratégique claire pour l'avenir de l'éducation.",
        link: "/ministere/missions",
        color: "bg-blue-50 text-blue-600",
      },
      {
        title: "Organisation", 
        icon: Building,
        content: "Découvrez notre structure organisationnelle, nos différentes directions et services, et comment nous travaillons ensemble pour atteindre nos objectifs.",
        link: "/ministere/organisation",
        color: "bg-purple-50 text-purple-600",
      },
      {
        title: "Direction",
        icon: Users,
        content: "Notre équipe de direction, composée d'experts dévoués, guide le ministère vers l'excellence et l'innovation dans l'enseignement supérieur.",
        link: "/ministere/direction",
        color: "bg-emerald-50 text-emerald-600",
      },
    ],
    []
  );

  const fallbackQuickLinks = useMemo(
    () => [
      {
        title: "Nous contacter",
        icon: Mail,
        link: "/contact",
        description: "Pour toute question ou demande d'information",
      },
      {
        title: "Documentation",
        icon: BookOpen,
        link: "/documentation", 
        description: "Accédez à nos ressources et publications",
      },
      {
        title: "Établissements",
        icon: GraduationCap,
        link: "/etablissements",
        description: "Explorer nos institutions d'enseignement",
      },
    ],
    []
  );

  // Utiliser le contenu dynamique ou les données par défaut
  const sections = content?.sections || fallbackSections;
  const quickLinks = content?.quickLinks || fallbackQuickLinks;
  const heroContent = content?.hero || {
    title: "Le Ministère",
    subtitle: "Enseignement Supérieur, Recherche et Innovation",
    description: "Au service de l'excellence académique et de l'innovation pour construire l'avenir de l'enseignement supérieur au Niger avec une vision moderne et inclusive."
  };

  // Mapper les titres de sections aux clés des statistiques
  const getSectionStatsKey = (sectionTitle) => {
    const titleMap = {
      "Notre Mission": "mission",
      "Organisation": "organisation", 
      "Direction": "direction"
    };
    return titleMap[sectionTitle];
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
            <span className="text-niger-cream font-medium">Le Ministère</span>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center mb-6">
                <Building className="w-12 h-12 mr-4 text-niger-cream" />
                <div>
                  <h1 className="text-5xl font-bold">{heroContent.title}</h1>
                  <p className="text-niger-cream/80 text-lg mt-2">
                    {heroContent.subtitle}
                  </p>
                </div>
              </div>
              <p className="text-xl text-niger-cream max-w-3xl leading-relaxed mb-6">
                {heroContent.description}
              </p>
              
              {/* Indicateur de mise à jour */}
              {lastUpdated && (
                <div className="flex items-center gap-4 text-niger-cream/70 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Mis à jour: {lastUpdated.toLocaleTimeString('fr-FR')}</span>
                  </div>
                  {isStale && (
                    <div className="flex items-center gap-2 text-yellow-300">
                      <TrendingUp className="w-4 h-4" />
                      <span>Actualisation recommandée</span>
                    </div>
                  )}
                </div>
              )}

              {/* Stats avec lazy loading */}
              <div className="mt-8">
                <Suspense fallback={<LoadingFallback />}>
                  <StatsSection />
                </Suspense>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <button 
                onClick={refresh}
                disabled={loading}
                className="px-8 py-4 bg-niger-white/20 hover:bg-niger-white/30 backdrop-blur-sm rounded-xl transition-all duration-300 flex items-center gap-3 text-white font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50"
              >
                <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualiser le contenu</span>
              </button>
              
              {error && (
                <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-4 text-red-100 text-sm">
                  <p>⚠️ {error}</p>
                  <p className="mt-1 opacity-75">Contenu par défaut affiché</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Main Content Section */}
      <div className="bg-gradient-to-b from-niger-cream to-white dark:from-secondary-900 dark:to-secondary-800 shadow-2xl relative -mt-12 rounded-2xl mx-auto container px-6 transition-colors duration-300">
        <div className="p-8">
          {/* Sections principales */}
          <section aria-labelledby="main-sections" className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 id="main-sections" className="text-3xl font-bold text-niger-green dark:text-niger-green-light">
                Découvrir le Ministère
              </h2>
              {content && !error && (
                <div className="flex items-center gap-2 text-sm text-readable-muted dark:text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Contenu dynamique</span>
                </div>
              )}
            </div>
            
            {loading && !content ? (
              <div className="grid md:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg p-8 animate-pulse">
                    <div className="w-16 h-16 bg-niger-orange/20 rounded-xl mb-6"></div>
                    <div className="h-6 bg-niger-green/20 rounded mb-4"></div>
                    <div className="space-y-2 mb-6">
                      <div className="h-4 bg-gray-200 dark:bg-secondary-600 rounded"></div>
                      <div className="h-4 bg-gray-200 dark:bg-secondary-600 rounded w-3/4"></div>
                    </div>
                    <div className="h-4 bg-niger-orange/20 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-8">
                {sections.map((section) => {
                  const Icon = iconMap[section.icon] || Building;
                  return (
                    <Link href={section.link} key={section.title} className="group">
                      <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-niger-orange/10 hover:border-niger-orange/30 transform hover:-translate-y-1 p-8 h-full">
                        <div className="relative w-16 h-16 bg-gradient-to-br from-niger-orange/10 to-niger-green/10 dark:from-niger-orange/20 dark:to-niger-green/20 rounded-xl flex-shrink-0 p-3 mb-6 border border-niger-orange/20">
                          <Icon
                            className="w-8 h-8 text-niger-orange"
                            aria-hidden="true"
                          />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 group-hover:text-niger-orange dark:group-hover:text-niger-orange-light transition-colors text-niger-green dark:text-niger-green-light">
                          {section.title}
                        </h3>
                        <p className="text-readable-muted dark:text-muted-foreground mb-6 line-clamp-3">
                          {section.content}
                        </p>
                        
                        {/* Statistiques secondaires */}
                        <SectionStatsDisplay 
                          sectionKey={getSectionStatsKey(section.title)}
                          stats={settings?.ministryStats?.[getSectionStatsKey(section.title)]}
                          className="mb-4"
                        />
                        
                        <div className="flex items-center text-niger-orange font-medium group-hover:text-niger-orange-dark">
                          <span>En savoir plus</span>
                          <ChevronRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Liens rapides */}
          <section
            aria-labelledby="quick-links"
            className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg p-8 border border-niger-orange/10"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Mail className="w-6 h-6 text-niger-orange" />
                <h2
                  id="quick-links"
                  className="text-2xl font-bold text-niger-green dark:text-niger-green-light"
                >
                  Liens rapides
                </h2>
              </div>
              
              {lastUpdated && (
                <div className="text-xs text-readable-muted dark:text-muted-foreground">
                  Dernière mise à jour: {lastUpdated.toLocaleDateString('fr-FR')}
                </div>
              )}
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {quickLinks.map((link) => {
                const Icon = iconMap[link.icon] || Mail;
                return (
                  <Link
                    key={link.title}
                    href={link.link}
                    className="group flex items-start p-6 rounded-xl hover:bg-niger-orange/10 dark:hover:bg-niger-orange/20 transition-all duration-300 border border-niger-orange/10 hover:border-niger-orange/30"
                  >
                    <div className="relative w-12 h-12 bg-gradient-to-br from-niger-orange/10 to-niger-green/10 dark:from-niger-orange/20 dark:to-niger-green/20 rounded-xl flex-shrink-0 p-2 mr-4 border border-niger-orange/20">
                      <Icon
                        className="w-6 h-6 text-niger-orange"
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold mb-2 group-hover:text-niger-orange transition-colors text-niger-green dark:text-niger-green-light">
                        {link.title}
                      </h3>
                      <p className="text-readable-muted dark:text-muted-foreground text-sm">
                        {link.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}


// Forcer SSR pour éviter les erreurs durant le SSG
export async function getServerSideProps() {
  return {
    props: {}
  };
}
