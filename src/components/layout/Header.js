import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import {
  SearchIcon,
  X,
  Phone,
  Mail,
  MapPin,
  Clock,
  Building2,
  GraduationCap,
  FileText,
  Calendar,
  BookOpen,
  TrendingUp,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { clsx } from "clsx";
import { useTheme } from "@/contexts/ThemeContext";
import { useSettings } from "@/contexts/SettingsContext";
import Navigation from "./Navigation";
import { secureApi } from "../../lib/secureApi";
import { checkApiKeyConfiguration } from "../../utils/checkApiKey";

// Fallback search data for offline mode
const fallbackSearchData = [
  {
    _id: "1",
    title: "Bourses d'études 2024-2025",
    type: "document",
    category: "Bourses",
    url: "/bourses/2024-2025",
    description:
      "Informations sur les bourses disponibles pour l'année académique 2024-2025",
  },
  {
    _id: "2",
    title: "Inscription en Master",
    type: "news",
    category: "Formations",
    url: "/formations/master",
    description: "Procédures d'inscription pour les programmes de Master",
  },
  {
    _id: "3",
    title: "Résultats examens Licence",
    type: "document",
    category: "Résultats",
    url: "/resultats/licence",
    description: "Publication des résultats des examens de Licence",
  },
  {
    _id: "4",
    title: "Programme de recherche en IA",
    type: "news",
    category: "Recherche",
    url: "/recherche/ia",
    description: "Nouveau programme de recherche en Intelligence Artificielle",
  },
  {
    _id: "5",
    title: "Conférence internationale sur l'innovation",
    type: "news",
    category: "Événements",
    url: "/events/conference-innovation",
    description: "Conférence sur l'innovation technologique et la recherche",
  },
];

export default function Header() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { settings } = useSettings();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
        setSearchTerm("");
        setSearchResults([]);
      }
    };

    if (isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchOpen]);

  // Perform search with debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim()) {
        performSearch(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  // Perform search with fallback
  const performSearch = async (query) => {
    setIsSearching(true);

    try {
      // Vérifier la configuration de la clé API en développement
      if (process.env.NODE_ENV === 'development') {
        const apiKeyStatus = checkApiKeyConfiguration();
        if (!apiKeyStatus.isValid) {
          console.warn('⚠️ Clé API manquante ou invalide:', apiKeyStatus);
        }
      }

      // Use secureApi for search with API key (public endpoint but requires key)
      const data = await secureApi.get(
        `/api/search?q=${encodeURIComponent(query)}&type=all&limit=5`,
        false
      );
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("Search error:", error);
      
      // Log plus détaillé en développement
      if (process.env.NODE_ENV === 'development') {
        console.error("Détails de l'erreur de recherche:", {
          message: error.message,
          query: query,
          apiKeyConfigured: !!process.env.NEXT_PUBLIC_API_KEY
        });
      }
      
      // Fallback to local search on network error
      performLocalSearch(query);
    } finally {
      setIsSearching(false);
      setSelectedIndex(-1);
    }
  };

  const performLocalSearch = (query) => {
    const filtered = fallbackSearchData.filter(
      (item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(query.toLowerCase()))
    );
    setSearchResults(filtered);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isSearchOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > -1 ? prev - 1 : -1));
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        navigateToResult(searchResults[selectedIndex]);
      } else if (e.key === "Escape") {
        setIsSearchOpen(false);
        setSearchTerm("");
        setSearchResults([]);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, selectedIndex, searchResults]);

  const navigateToResult = (result) => {
    // If it's a quick navigation, go directly to the URL
    if (result.url) {
      router.push(result.url);
    } else {
      // For "View all results", go to search page
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
    setIsSearchOpen(false);
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleViewAllResults = () => {
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
      setIsSearchOpen(false);
      setSearchTerm("");
      setSearchResults([]);
    }
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchTerm("");
      setSearchResults([]);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case "document":
        return <FileText className="w-4 h-4" />;
      case "event":
        return <Calendar className="w-4 h-4" />;
      case "news":
        return <TrendingUp className="w-4 h-4" />;
      case "article":
        return <BookOpen className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      Bourses: "text-blue-500",
      Formations: "text-green-500",
      Résultats: "text-purple-500",
      Recherche: "text-orange-500",
      Événements: "text-red-500",
      Actualités: "text-indigo-500",
      Actualité: "text-indigo-500",
      Guides: "text-yellow-500",
      Administration: "text-gray-500",
      Stages: "text-pink-500",
      Document: "text-teal-500",
      News: "text-blue-600",
    };
    return colors[category] || "text-gray-500";
  };

  return (
    <>
      {/* Top Information Bar */}
      <div
        className={clsx(
          "py-2 transition-all duration-300 border-b",
          isDark
            ? "bg-gray-900 border-gray-800"
            : "bg-gradient-to-r from-green-600 to-orange-500 border-green-400/20"
        )}
      >
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex justify-between items-center">
            {/* Contact Information */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2 group">
                <div
                  className={clsx(
                    "p-1.5 rounded-full transition-all duration-200",
                    isDark
                      ? "bg-gray-800 group-hover:bg-gray-700"
                      : "bg-white/20 group-hover:bg-white/30 backdrop-blur-sm"
                  )}
                >
                  <Phone className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium text-white">
                  +227 20 72 29 50
                </span>
              </div>
              <div className="flex items-center space-x-2 group">
                <div
                  className={clsx(
                    "p-1.5 rounded-full transition-all duration-200",
                    isDark
                      ? "bg-gray-800 group-hover:bg-gray-700"
                      : "bg-white/20 group-hover:bg-white/30 backdrop-blur-sm"
                  )}
                >
                  <Mail className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium text-white">
                  contact@mesrit.gouv.ne
                </span>
              </div>
              <div className="flex items-center space-x-2 group">
                <div
                  className={clsx(
                    "p-1.5 rounded-full transition-all duration-200",
                    isDark
                      ? "bg-gray-800 group-hover:bg-gray-700"
                      : "bg-white/20 group-hover:bg-white/30 backdrop-blur-sm"
                  )}
                >
                  <MapPin className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium text-white">
                  Niamey, Niger
                </span>
              </div>
            </div>

            {/* Hours & Republic Info */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Building2 className="w-3 h-3 text-white" />
                <span className="text-sm font-semibold text-white">
                  République du Niger
                </span>
              </div>
              <div className="hidden lg:flex items-center space-x-2">
                <div
                  className={clsx(
                    "flex items-center space-x-2 px-3 py-1 rounded-full",
                    isDark ? "bg-gray-800/80" : "bg-white/20 backdrop-blur-sm"
                  )}
                >
                  <Clock className="w-3 h-3 text-white" />
                  <span className="text-xs font-medium text-white">
                    Lun-Ven 8h-17h
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={clsx(
          "relative transition-all duration-300 shadow-lg overflow-hidden",
          isDark ? "bg-gray-950" : "bg-white"
        )}
      >
        {/* Image de fond subtile */}
        <div 
          className={clsx(
            "absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-300",
            `opacity-${settings.header?.opacity || 5}`
          )}
          style={{
            backgroundImage: `url('${settings.header?.backgroundImage || '/images/hero/Slide1.jpg'}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            filter: isDark ? 'blur(1px) contrast(0.8) brightness(0.4)' : 'blur(0.5px) contrast(1.2) brightness(1.1)'
          }}
        />
        
        {/* Overlay pour améliorer la lisibilité */}
        <div className={clsx(
          "absolute inset-0 transition-all duration-300",
          isDark 
            ? "bg-gradient-to-r from-gray-950/97 via-gray-950/95 to-gray-950/97" 
            : "bg-gradient-to-r from-white/97 via-white/92 to-white/97"
        )} />
        
        {/* Pattern overlay subtil pour texture */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${isDark ? 'ffffff' : '000000'}' fill-opacity='0.02'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px'
          }}
        />
        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="flex items-center justify-between py-6">
            {/* Logo & Brand Section */}
            <Link href="/" className="flex items-center gap-4 group">
              {/* Logo */}
              <div className="relative">
                {settings.header?.logo ? (
                  <div className={clsx(
                    "relative rounded-2xl overflow-hidden shadow-xl border-2 transform group-hover:scale-105 transition-all duration-300",
                    settings.header?.logoSize === 'small' ? 'w-16 h-16' : 
                    settings.header?.logoSize === 'large' ? 'w-28 h-28' : 'w-20 h-20'
                  )}
                  style={{
                    borderColor: isDark ? "#ff8c0080" : "#ff8c0060",
                    boxShadow: "0 8px 25px rgba(255, 140, 0, 0.3)"
                  }}>
                    <Image
                      src={settings.header.logo}
                      alt="Logo MESRIT"
                      fill
                      className="object-contain p-1 bg-white"
                      sizes="112px"
                    />
                  </div>
                ) : (
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl border-2 transform group-hover:scale-105 transition-all duration-300"
                    style={{
                      background:
                        "linear-gradient(135deg, #ff8c00 0%, #228b22 100%)",
                      borderColor: isDark ? "#ff8c0080" : "#ff8c0060",
                      boxShadow:
                        "0 8px 25px rgba(255, 140, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    <span className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">
                      M
                    </span>
                  </div>
                )}
                <div
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full animate-pulse shadow-lg"
                  style={{
                    backgroundColor: "#228b22",
                    border: `2px solid ${isDark ? "#0f1419" : "#ffffff"}`,
                    boxShadow: "0 0 10px rgba(34, 139, 34, 0.6)",
                  }}
                />
              </div>

              {/* Brand Text */}
              <div className="flex flex-col">
                <h2
                  className={clsx(
                    "text-lg lg:text-xl font-semibold leading-tight mb-1",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}
                >
                  Ministère de l'Enseignement Supérieur
                </h2>
                <h1
                  className={clsx(
                    "text-xl lg:text-2xl font-bold leading-tight",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  de la Recherche et de l'Innovation Technologique
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    <GraduationCap
                      className="w-4 h-4"
                      style={{ color: "#ff8c00" }}
                    />
                    <span
                      className="text-sm font-medium"
                      style={{ color: "#ff8c00" }}
                    >
                      Excellence Académique
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Search Section */}
            <div className="relative z-[60]" ref={searchRef}>
              <div className="flex items-center gap-3">
                {/* Search Input Container */}
                <div
                  className={clsx(
                    "absolute right-12 top-1/2 -translate-y-1/2 transition-all duration-300",
                    isSearchOpen
                      ? "opacity-100 visible translate-x-0"
                      : "opacity-0 invisible translate-x-10"
                  )}
                >
                  <div className="relative">
                    <input
                      ref={searchInputRef}
                      type="search"
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={clsx(
                        "w-80 px-4 py-2.5 pr-10 rounded-xl border-2 text-sm transition-all focus:outline-none focus:ring-2 shadow-lg",
                        isDark
                          ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-orange-500/20"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-orange-400/20"
                      )}
                    />
                    {isSearching && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                      </div>
                    )}
                  </div>

                  {/* Search Results Dropdown */}
                  {(searchResults.length > 0 ||
                    (searchTerm && !isSearching)) && (
                    <div
                      className={clsx(
                        "absolute top-full mt-2 w-full max-h-96 overflow-y-auto rounded-xl shadow-2xl border z-[200]",
                        isDark
                          ? "bg-gray-800 border-gray-700"
                          : "bg-white border-gray-200"
                      )}
                    >
                      {searchResults.length > 0 ? (
                        <div>
                          <div className="py-2">
                            {/* Quick autocomplete suggestions */}
                            {/* The original code had autocompleteSuggestions which is not defined.
                                Assuming it's meant to be searchResults or a placeholder.
                                For now, removing it as it's not part of the new_code. */}

                            {/* Search results */}
                            {searchResults.map((result, index) => (
                              <button
                                key={result._id || result.id || index}
                                onClick={() => navigateToResult(result)}
                                onMouseEnter={() => setSelectedIndex(index)}
                                className={clsx(
                                  "w-full px-4 py-3 flex items-center gap-3 transition-colors text-left",
                                  selectedIndex === index
                                    ? isDark
                                      ? "bg-gray-700"
                                      : "bg-gray-100"
                                    : "hover:" +
                                        (isDark
                                          ? "bg-gray-700/50"
                                          : "bg-gray-50")
                                )}
                              >
                                <div
                                  className={clsx(
                                    "p-2 rounded-lg",
                                    isDark ? "bg-gray-900" : "bg-gray-100"
                                  )}
                                >
                                  {getIconForType(result.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={clsx(
                                      "font-medium truncate",
                                      isDark ? "text-white" : "text-gray-900"
                                    )}
                                  >
                                    {result.title}
                                  </p>
                                  {(result.description ||
                                    result.summary ||
                                    result.content) && (
                                    <p
                                      className={clsx(
                                        "text-xs truncate mt-1",
                                        isDark
                                          ? "text-gray-400"
                                          : "text-gray-500"
                                      )}
                                    >
                                      {result.description ||
                                        result.summary ||
                                        (result.content &&
                                          result.content.substring(0, 100) +
                                            "...")}
                                    </p>
                                  )}
                                  <p
                                    className={clsx(
                                      "text-xs mt-1",
                                      getCategoryColor(result.category)
                                    )}
                                  >
                                    {result.category}
                                  </p>
                                </div>
                                <ChevronRight
                                  className={clsx(
                                    "w-4 h-4 flex-shrink-0",
                                    isDark ? "text-gray-400" : "text-gray-500"
                                  )}
                                />
                              </button>
                            ))}
                          </div>

                          {/* View all results button */}
                          <div
                            className={clsx(
                              "px-4 py-3 border-t",
                              isDark
                                ? "border-gray-700 bg-gray-900/50"
                                : "border-gray-200 bg-gray-50"
                            )}
                          >
                            <button
                              onClick={handleViewAllResults}
                              className={clsx(
                                "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                                "hover:scale-[1.02] transform",
                                isDark
                                  ? "bg-gray-700 text-white hover:bg-gray-600"
                                  : "bg-white text-gray-900 hover:bg-gray-100 border border-gray-300"
                              )}
                            >
                              <SearchIcon className="w-4 h-4" />
                              <span>
                                Voir tous les résultats pour "{searchTerm}"
                              </span>
                              {/* ArrowRight is not imported, assuming it's a placeholder or typo */}
                              {/* <ArrowRight className="w-4 h-4" /> */}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={clsx(
                            "px-4 py-8 text-center",
                            isDark ? "text-gray-400" : "text-gray-500"
                          )}
                        >
                          <SearchIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p className="font-medium">Aucun résultat trouvé</p>
                          <p className="text-sm mt-1">
                            Essayez avec d'autres mots-clés
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Search Toggle Button */}
                <button
                  onClick={toggleSearch}
                  aria-label={
                    isSearchOpen ? "Fermer la recherche" : "Ouvrir la recherche"
                  }
                  className="relative p-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 transform hover:scale-105 active:scale-95 group shadow-xl z-50"
                  style={{
                    background:
                      "linear-gradient(135deg, #ff8c00 0%, #228b22 100%)",
                    boxShadow: "0 6px 20px rgba(255, 140, 0, 0.3)",
                  }}
                >
                  {isSearchOpen ? (
                    <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" />
                  ) : (
                    <SearchIcon className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" />
                  )}

                  {/* Subtle pulse animation when closed */}
                  {!isSearchOpen && (
                    <div
                      className="absolute inset-0 rounded-xl animate-ping pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(135deg, #ff8c00 0%, #228b22 100%)",
                        opacity: 0.4,
                      }}
                    />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Accent line */}
        <div className="h-1 bg-gradient-to-r from-orange-500 via-green-500 to-orange-500 shadow-lg" />
      </header>

      {/* Navigation Component */}
      <Navigation />
    </>
  );
}
