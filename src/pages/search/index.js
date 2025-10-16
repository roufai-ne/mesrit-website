import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import {
  Search,
  FileText,
  Calendar,
  TrendingUp,
  BookOpen,
  Filter,
  ChevronRight,
  Clock,
  User,
  Tag,
  Loader2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { secureApi } from "@/lib/secureApi";

export default function SearchResultsPage() {
  const router = useRouter();
  const { q, type = "all", page = 1 } = router.query;

  const [searchQuery, setSearchQuery] = useState(q || "");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(parseInt(page) || 1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedType, setSelectedType] = useState(type);
  const [suggestions, setSuggestions] = useState([]);

  const resultsPerPage = 10;

  // Fetch search results
  useEffect(() => {
    if (q && q.trim()) {
      performSearch(q, selectedType, currentPage);
    }
  }, [q, selectedType, currentPage]);

  const performSearch = async (query, searchType, pageNum) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await secureApi.get(
        `/api/search?q=${encodeURIComponent(
          query
        )}&type=${searchType}&limit=${resultsPerPage}&page=${pageNum}`,
        false
      );

      setSearchResults(data.results || []);
      setTotalResults(data.total || 0);
      setTotalPages(data.totalPages || 0);
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error("Search error:", err);
      setError(`Une erreur est survenue lors de la recherche: ${err.message}`);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/search?q=${encodeURIComponent(searchQuery)}&type=${selectedType}`
      );
      setCurrentPage(1);
    }
  };

  const handleTypeChange = (newType) => {
    setSelectedType(newType);
    setCurrentPage(1);
    router.push(
      `/search?q=${encodeURIComponent(searchQuery)}&type=${newType}&page=1`
    );
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    router.push(
      `/search?q=${encodeURIComponent(
        searchQuery
      )}&type=${selectedType}&page=${newPage}`
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getIconForType = (type) => {
    switch (type) {
      case "document":
        return <FileText className="w-5 h-5 text-niger-green" />;
      case "news":
        return <TrendingUp className="w-5 h-5 text-niger-orange" />;
      case "event":
        return <Calendar className="w-5 h-5 text-niger-orange" />;
      default:
        return <BookOpen className="w-5 h-5 text-niger-green" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const highlightSearchTerm = (text, term) => {
    if (!text || !term) return text;

    const regex = new RegExp(
      `(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          className="bg-niger-orange/20 text-niger-orange-dark px-1 rounded"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <MainLayout>
      <Head>
        <title>{q ? `Recherche : ${q}` : "Recherche"} | MESRIT Niger</title>
        <meta
          name="description"
          content={`Résultats de recherche pour : ${q}`}
        />
      </Head>

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
            <span className="text-niger-cream font-medium">Recherche</span>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center mb-6">
                <Search className="w-12 h-12 mr-4 text-niger-cream" />
                <div>
                  <h1 className="text-5xl font-bold">Recherche</h1>
                  <p className="text-niger-cream/80 text-lg mt-2">
                    Moteur de Recherche Intelligent
                  </p>
                </div>
              </div>
              <p className="text-xl text-niger-cream max-w-3xl leading-relaxed mb-6">
                Trouvez rapidement les informations, documents, actualités et
                services dont vous avez besoin grâce à notre moteur de recherche
                avancé avec filtres intelligents et suggestions automatiques.
              </p>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="max-w-2xl">
                <div className="relative">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher dans tout le site..."
                    className="w-full pl-12 pr-16 py-4 rounded-xl border border-niger-white/20 focus:ring-2 focus:ring-niger-white focus:border-niger-white transition-all duration-300 bg-niger-white/10 backdrop-blur-sm text-white placeholder-niger-cream/70 text-lg"
                    autoFocus
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-niger-cream w-5 h-5" />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-niger-white/20 hover:bg-niger-white/30 backdrop-blur-sm rounded-xl transition-all duration-300 text-white hover:scale-110"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </form>

              {/* Results Count */}
              {!isLoading && searchQuery && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-niger-cream">
                  <div className="bg-niger-white/10 backdrop-blur-sm rounded-xl p-4 border border-niger-white/20">
                    <span className="text-3xl font-bold block">
                      {totalResults}
                    </span>
                    <span className="text-sm opacity-90">
                      {totalResults > 0 ? (
                        <>
                          Résultat{totalResults > 1 ? "s" : ""} trouvé
                          {totalResults > 1 ? "s" : ""}
                        </>
                      ) : (
                        <>Aucun résultat</>
                      )}
                    </span>
                  </div>
                  <div className="bg-niger-white/10 backdrop-blur-sm rounded-xl p-4 border border-niger-white/20">
                    <span className="text-3xl font-bold block">
                      {searchResults.filter((r) => r.type === "news").length}
                    </span>
                    <span className="text-sm opacity-90">Actualités</span>
                  </div>
                  <div className="bg-niger-white/10 backdrop-blur-sm rounded-xl p-4 border border-niger-white/20">
                    <span className="text-3xl font-bold block">
                      {
                        searchResults.filter((r) => r.type === "document")
                          .length
                      }
                    </span>
                    <span className="text-sm opacity-90">Documents</span>
                  </div>
                  <div className="bg-niger-white/10 backdrop-blur-sm rounded-xl p-4 border border-niger-white/20">
                    <span className="text-3xl font-bold block">
                      {currentPage}
                    </span>
                    <span className="text-sm opacity-90">Page actuelle</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="bg-gradient-to-b from-niger-cream to-white dark:from-secondary-900 dark:to-secondary-800 shadow-2xl relative -mt-12 rounded-2xl mx-auto container px-6 transition-colors duration-300">
        <div className="p-8">
          {/* Filter Tabs */}
          <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg p-6 border border-niger-orange/10 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-niger-orange" />
              <h3 className="text-lg font-semibold text-niger-green dark:text-niger-green-light">
                Filtres de recherche
              </h3>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              {[
                {
                  value: "all",
                  label: "Tout",
                  icon: <Filter className="w-4 h-4" />,
                },
                {
                  value: "news",
                  label: "Actualités",
                  icon: <TrendingUp className="w-4 h-4" />,
                },
                {
                  value: "document",
                  label: "Documents",
                  icon: <FileText className="w-4 h-4" />,
                },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => handleTypeChange(filter.value)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                    selectedType === filter.value
                      ? "bg-gradient-to-r from-niger-orange to-niger-green text-white shadow-lg"
                      : "bg-white dark:bg-secondary-700 hover:bg-niger-orange/10 dark:hover:bg-niger-orange/20 shadow-md border border-niger-orange/20 text-niger-green dark:text-niger-green-light"
                  }`}
                >
                  {filter.icon}
                  <span>{filter.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto">
            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-niger-orange mb-4" />
                <p className="text-lg font-medium text-niger-green dark:text-niger-green-light">
                  Recherche en cours...
                </p>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-xl border border-niger-orange/10 p-8 text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                <h3 className="text-lg font-semibold mb-2 text-niger-green dark:text-niger-green-light">
                  Erreur de recherche
                </h3>
                <p className="text-sm text-readable-muted dark:text-muted-foreground">
                  {error}
                </p>
                <button
                  onClick={() =>
                    performSearch(searchQuery, selectedType, currentPage)
                  }
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-niger-orange to-niger-green text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  Réessayer
                </button>
              </div>
            )}

            {/* Search Results */}
            {!isLoading && !error && searchResults.length > 0 && (
              <div className="space-y-6">
                {/* Suggestions */}
                {suggestions.length > 0 && currentPage === 1 && (
                  <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg p-6 border border-niger-orange/10 mb-6">
                    <p className="text-sm font-medium mb-4 text-niger-green dark:text-niger-green-light">
                      Recherches suggérées :
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {suggestions.map((suggestion, idx) => (
                        <Link
                          key={idx}
                          href={`/search?q=${encodeURIComponent(suggestion)}`}
                          className="px-4 py-2 bg-niger-cream dark:bg-secondary-700 text-niger-green dark:text-niger-green-light rounded-xl hover:bg-niger-orange/10 dark:hover:bg-niger-orange/20 transition-all duration-300 hover:scale-105 border border-niger-orange/20"
                        >
                          {suggestion}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Results List */}
                {searchResults.map((result) => (
                  <div
                    key={result._id || result.id}
                    className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-niger-orange/10 hover:border-niger-orange/30 transform hover:-translate-y-1 group cursor-pointer p-6"
                    onClick={() => router.push(result.url)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="relative w-16 h-16 bg-gradient-to-br from-niger-orange/10 to-niger-green/10 dark:from-niger-orange/20 dark:to-niger-green/20 rounded-xl flex-shrink-0 p-3 mr-4 border border-niger-orange/20 group-hover:scale-110 transition-all duration-300">
                        {getIconForType(result.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Title */}
                        <h3 className="text-lg font-semibold mb-2 group-hover:text-niger-orange dark:group-hover:text-niger-orange-light transition-colors text-niger-green dark:text-niger-green-light">
                          {highlightSearchTerm(result.title, q)}
                        </h3>

                        {/* Description */}
                        {(result.excerpt || result.description) && (
                          <p className="text-sm mb-3 line-clamp-2 text-readable-muted dark:text-muted-foreground">
                            {highlightSearchTerm(
                              result.excerpt || result.description,
                              q
                            )}
                          </p>
                        )}

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-4 text-xs">
                          {/* Type Badge */}
                          <span
                            className={`px-3 py-1 rounded-full font-medium ${
                              result.type === "news"
                                ? "bg-niger-orange/20 text-niger-orange-dark border border-niger-orange/30"
                                : "bg-niger-green/20 text-niger-green-dark border border-niger-green/30"
                            }`}
                          >
                            {result.type === "news" ? "Actualité" : "Document"}
                          </span>

                          {/* Date */}
                          {result.createdAt && (
                            <div className="flex items-center gap-1 text-readable-muted dark:text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{formatDate(result.createdAt)}</span>
                            </div>
                          )}

                          {/* Author */}
                          {result.author && (
                            <div className="flex items-center gap-1 text-readable-muted dark:text-muted-foreground">
                              <User className="w-3 h-3" />
                              <span>{result.author}</span>
                            </div>
                          )}

                          {/* Tags */}
                          {result.tags && result.tags.length > 0 && (
                            <div className="flex items-center gap-1 text-readable-muted dark:text-muted-foreground">
                              <Tag className="w-3 h-3" />
                              <span>{result.tags.slice(0, 3).join(", ")}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <ChevronRight className="w-5 h-5 flex-shrink-0 transition-transform group-hover:translate-x-1 text-readable-muted dark:text-muted-foreground" />
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-secondary-800 text-niger-green dark:text-niger-green-light hover:bg-niger-orange/10 dark:hover:bg-niger-orange/20 border border-niger-orange/20 disabled:hover:bg-white dark:disabled:hover:bg-secondary-800"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-2">
                      {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = idx + 1;
                        } else if (currentPage <= 3) {
                          pageNum = idx + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + idx;
                        } else {
                          pageNum = currentPage - 2 + idx;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`min-w-[48px] h-12 px-4 rounded-xl font-medium transition-all ${
                              currentPage === pageNum
                                ? "bg-gradient-to-r from-niger-orange to-niger-green text-white shadow-lg"
                                : "bg-white dark:bg-secondary-800 text-niger-green dark:text-niger-green-light hover:bg-niger-orange/10 dark:hover:bg-niger-orange/20 border border-niger-orange/20"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-secondary-800 text-niger-green dark:text-niger-green-light hover:bg-niger-orange/10 dark:hover:bg-niger-orange/20 border border-niger-orange/20 disabled:hover:bg-white dark:disabled:hover:bg-secondary-800"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* No Results State */}
            {!isLoading &&
              !error &&
              searchResults.length === 0 &&
              searchQuery && (
                <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-xl border border-niger-orange/10 p-12 text-center">
                  <Search className="w-20 h-20 mx-auto mb-6 text-niger-orange/60" />
                  <h3 className="text-2xl font-bold text-niger-green dark:text-niger-green-light mb-4">
                    Aucun résultat trouvé
                  </h3>
                  <p className="text-readable-muted dark:text-muted-foreground max-w-md mx-auto mb-6">
                    Nous n'avons trouvé aucun résultat pour "{q}"
                  </p>
                  <div className="text-left max-w-md mx-auto space-y-2 text-readable dark:text-foreground">
                    <p className="font-medium mb-2">Suggestions :</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Vérifiez l'orthographe de vos mots-clés</li>
                      <li>Essayez des mots-clés plus généraux</li>
                      <li>Utilisez moins de mots-clés</li>
                      <li>Essayez des synonymes</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedType("all");
                    }}
                    className="mt-6 px-6 py-3 bg-gradient-to-r from-niger-orange to-niger-green text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Réinitialiser la recherche
                  </button>
                </div>
              )}

            {/* Empty State - No query */}
            {!searchQuery && !isLoading && (
              <div className="text-center py-20">
                <Search className="w-20 h-20 mx-auto mb-6 text-niger-orange/60" />
                <h2 className="text-2xl font-bold mb-4 text-niger-green dark:text-niger-green-light">
                  Rechercher sur MESRIT Niger
                </h2>
                <p className="text-lg mb-8 max-w-2xl mx-auto text-readable-muted dark:text-muted-foreground">
                  Trouvez rapidement les informations, documents, actualités et
                  services dont vous avez besoin.
                </p>

                {/* Quick Search Suggestions */}
                <div className="max-w-2xl mx-auto">
                  <p className="text-sm font-medium mb-4 text-readable-muted dark:text-muted-foreground">
                    Recherches populaires :
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {[
                      "Bourses d'études",
                      "Inscriptions",
                      "Résultats examens",
                      "Formations disponibles",
                      "Documents administratifs",
                      "Calendrier académique",
                    ].map((term) => (
                      <Link
                        key={term}
                        href={`/search?q=${encodeURIComponent(term)}`}
                        className="px-4 py-2 bg-niger-cream dark:bg-secondary-700 text-niger-green dark:text-niger-green-light rounded-xl hover:bg-niger-orange/10 dark:hover:bg-niger-orange/20 transition-all duration-300 hover:scale-105 border border-niger-orange/20"
                      >
                        {term}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
