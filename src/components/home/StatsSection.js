import { useState, useEffect, useCallback, useRef } from "react";
import {
  Users,
  Building2,
  GraduationCap,
  BookOpen,
  RefreshCw,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { fetchAPI, endpoints } from '@/lib/strapi';
import { mapStrapiList, mapStatistic } from '@/utils/strapiMapper';
import toast from "react-hot-toast";

export default function StatsSection() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [animatedStats, setAnimatedStats] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const { isDark } = useTheme();
  const rafRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    fetchStats();

    // Actualisation automatique toutes les 5 minutes
    const interval = setInterval(() => {
      fetchStats(true); // Actualisation silencieuse
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
      // Annuler l'animation en cours au démontage
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionnellement vide - fetchStats ne doit s'exécuter qu'au montage

  const fetchStats = useCallback(
    async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        const response = await fetchAPI(endpoints.statistics, {
          sort: ['order:asc'],
          pagination: { limit: 10 }
        });

        const dataList = mapStrapiList(response, mapStatistic);

        // Transform list to object with keys
        const statsObject = {};
        dataList.forEach(stat => {
          statsObject[stat.key] = stat;
        });

        // Use defaults if empty
        if (Object.keys(statsObject).length === 0) {
          throw new Error("No stats found in Strapi");
        }

        setStats((prevStats) => {
          setError(null);
          setLastUpdated(new Date());
          return statsObject;
        });

      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
        setError(error.message);

        if (!silent) {
          // toast.error("Erreur lors du chargement des statistiques");
        }

        // Utilise les stats par défaut seulement si on n'a pas encore de données
        setStats((prevStats) => {
          if (!prevStats) {
            const defaultStats = {
              students: { value: 25000, label: "Étudiants", color: "blue", suffix: "+" },
              institutions: {
                value: 15,
                label: "Établissements",
                color: "green",
              },
              teachers: { value: 1500, label: "Enseignants", color: "purple", suffix: "+" },
              publications: {
                value: 120,
                label: "Publications Scientifiques",
                color: "orange",
              }
            };

            return defaultStats;
          }
          return prevStats;
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    // Enlever 'stats' des dépendances pour éviter les re-créations
    []
  );

  const animateCounters = useCallback((statsToAnimate) => {
    if (!statsToAnimate) return;

    // Pas d'animation si l'utilisateur préfère le mouvement réduit
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      const final = {};
      Object.entries(statsToAnimate).forEach(([key, stat]) => {
        final[key] = stat.value;
      });
      setAnimatedStats(final);
      return;
    }

    // Annuler tout RAF précédent
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const targets = Object.fromEntries(
      Object.entries(statsToAnimate).map(([k, s]) => [k, s.value])
    );
    const DURATION = 2000;
    const startTime = performance.now();

    setAnimatedStats({});

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / DURATION, 1);
      // ease-out cubic — plus naturel qu'un incrément linéaire
      const eased = 1 - Math.pow(1 - progress, 3);

      const frame = {};
      Object.entries(targets).forEach(([key, target]) => {
        frame[key] = Math.floor(target * eased);
      });
      setAnimatedStats(frame);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
  }, []);

  const handleRefresh = async () => {
    await fetchStats(false);
    toast.success("Statistiques actualisées !", {
      icon: "✅",
    });
  };

  const formatNumber = (number) => {
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + "M";
    }
    if (number >= 1000) {
      return (number / 1000).toFixed(1) + "k";
    }
    return number.toLocaleString("fr-FR");
  };

  const getIcon = (key) => {
    const icons = {
      students: Users,
      institutions: Building2,
      teachers: GraduationCap,
      publications: BookOpen,
    };
    return icons[key] || Users;
  };

  const getColorClasses = (color) => {
    if (isDark) {
      const colors = {
        blue: "bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30",
        green:
          "bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30",
        purple:
          "bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30",
        orange:
          "bg-orange-500/20 text-orange-300 border-orange-500/30 hover:bg-orange-500/30",
        red: "bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30",
        indigo:
          "bg-indigo-500/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/30",
      };
      return colors[color] || colors.blue;
    } else {
      const colors = {
        blue: "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100",
        green: "bg-green-50 text-green-600 border-green-200 hover:bg-green-100",
        purple:
          "bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100",
        orange:
          "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100",
        red: "bg-red-50 text-red-600 border-red-200 hover:bg-red-100",
        indigo:
          "bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100",
      };
      return colors[color] || colors.blue;
    }
  };

  // Déclencher l'animation uniquement quand la section entre dans le viewport
  // Placé avant tout return conditionnel pour respecter les règles des hooks
  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && stats) {
          animateCounters(stats);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [stats, animateCounters]);

  if (loading) {
    return (
      <section className="py-8 relative overflow-hidden">
        {/* Arrière-plan avec gradient */}
        <div
          className={`absolute inset-0 ${isDark
              ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
              : "bg-gradient-to-br from-blue-50 via-white to-orange-50"
            }`}
        >
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-80 animate-pulse"></div>
              <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            </div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-gray-200/50 dark:bg-gray-700/50 rounded-xl p-4 animate-pulse backdrop-blur-sm"
              >
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-xl mx-auto mb-4"></div>
                <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-16 mx-auto mb-3"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20 mx-auto mb-1"></div>
                <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-12 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="py-8 relative overflow-hidden">
      {/* Arrière-plan avec gradient */}
      <div
        className={`absolute inset-0 ${isDark
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            : "bg-gradient-to-br from-blue-50 via-white to-orange-50"
          }`}
      >
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark
                    ? "bg-orange-500/20 text-orange-400"
                    : "bg-orange-100 text-orange-600"
                  }`}
              >
                <Users className="w-4 h-4" aria-hidden="true" />
              </div>
              <h2
                className={`text-2xl font-bold bg-gradient-to-r ${isDark
                    ? "from-white to-gray-300"
                    : "from-gray-900 to-gray-600"
                  } bg-clip-text text-transparent`}
              >
                MESRIT en Chiffres
              </h2>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading || refreshing}
              aria-label="Actualiser les statistiques"
              className={`p-3 rounded-full border transition-[border-color,color,background-color,box-shadow,transform] duration-300 hover:scale-110 ${isDark
                  ? "border-orange-500/30 text-orange-400 hover:bg-orange-500/20 hover:shadow-orange-500/20"
                  : "border-orange-200 text-orange-600 hover:bg-orange-50 hover:shadow-orange-500/20"
                } ${loading || refreshing
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:shadow-xl"
                }`}
            >
              <RefreshCw
                className={`w-5 h-5 ${loading || refreshing ? "animate-spin" : ""
                  }`}
                aria-hidden="true"
              />
            </button>
          </div>

          {/* Status et dernière mise à jour */}
          <div className="mt-4 flex items-center justify-center gap-4 text-sm">
            {refreshing && (
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                Actualisation en cours...
              </div>
            )}

            {lastUpdated && (
              <div className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Dernière mise à jour: {lastUpdated.toLocaleTimeString("fr-FR")}
              </div>
            )}

            {error && (
              <div className="text-yellow-600 dark:text-yellow-400">
                ⚠️ Données par défaut (erreur: {error})
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {stats &&
            Object.entries(stats).map(([key, stat], index) => {
              const Icon = getIcon(key);
              const animatedValue =
                animatedStats[key] !== undefined
                  ? animatedStats[key]
                  : stat.value;

              return (
                <div
                  key={key}
                  className={`stats-card relative group rounded-xl p-4 cursor-pointer backdrop-blur-sm ${getColorClasses(
                    stat.color
                  )} shadow-lg`}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animation: "fadeInUp 0.6s ease-out both",
                  }}
                >
                  {/* Icône avec effet de background */}
                  <div className="relative mb-4">
                    <div
                      className={`stats-icon size-12 mx-auto rounded-xl flex items-center justify-center ${isDark ? "bg-white/10" : "bg-white/80"
                        } shadow-lg`}
                    >
                      <Icon className="w-6 h-6" aria-hidden="true" />
                    </div>
                    {/* Effet de halo */}
                    <div
                      className={`absolute inset-0 size-12 mx-auto rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-xl ${stat.color === "blue"
                          ? "bg-blue-500"
                          : stat.color === "green"
                            ? "bg-green-500"
                            : stat.color === "purple"
                              ? "bg-purple-500"
                              : "bg-orange-500"
                        }`}
                    ></div>
                  </div>

                  {/* Chiffre principal */}
                  <div className="text-center mb-3">
                    <div className="text-2xl lg:text-3xl font-bold mb-1 tabular-nums bg-gradient-to-r from-current to-current/70 bg-clip-text">
                      {formatNumber(animatedValue)}
                      {stat.suffix && (
                        <span className="text-lg opacity-70">
                          {stat.suffix}
                        </span>
                      )}
                    </div>

                    <div className="text-sm font-semibold opacity-90 tracking-wide">
                      {stat.label}
                    </div>

                    {/* Année */}
                    {stat.year && (
                      <div className="text-xs opacity-60 mt-1 font-medium">
                        Année {stat.year}
                      </div>
                    )}
                  </div>

                  {/* Détails supplémentaires */}
                  {stat.breakdown && (
                    <div className="mt-4 pt-4 border-t border-current/20">
                      {key === "institutions" && (
                        <div className="flex justify-between text-sm opacity-75">
                          <span>
                            Public: <strong>{stat.breakdown.public}</strong>
                          </span>
                          <span>
                            Privé: <strong>{stat.breakdown.private}</strong>
                          </span>
                        </div>
                      )}

                      {key === "publications" && (
                        <div className="space-y-1 text-sm opacity-75">
                          <div className="flex justify-between">
                            <span>International:</span>
                            <strong>{stat.breakdown.international}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>National:</span>
                            <strong>{stat.breakdown.national}</strong>
                          </div>
                          {stat.breakdown.indexed > 0 && (
                            <div className="flex justify-between">
                              <span>Indexées:</span>
                              <strong>{stat.breakdown.indexed}</strong>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Barre de progression décorative */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-current/20 to-current/40 rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

                  {/* Effet de brillance moderne */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                </div>
              );
            })}
        </div>

        {/* Note sur les données avec style amélioré */}
        <div className="text-center mt-12">
          <div
            className={`inline-flex items-center gap-4 px-6 py-3 rounded-full ${isDark ? "bg-gray-800/50" : "bg-white/50"
              } backdrop-blur-sm border ${isDark ? "border-gray-700" : "border-gray-200"
              } shadow-lg`}
          >
            <p
              className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-600"
                }`}
            >
              Données officielles MESRIT • 2024-2025
            </p>
            {!error && (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span
                  className={`text-sm font-semibold ${isDark ? "text-green-400" : "text-green-600"
                    }`}
                >
                  Temps réel
                </span>
              </>
            )}
            {error && (
              <>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span
                  className={`text-sm font-semibold ${isDark ? "text-yellow-400" : "text-yellow-600"
                    }`}
                >
                  Mode dégradé
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
