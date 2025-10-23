import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Calendar, ArrowRight, Copy, X, ChevronRight, AlertCircle, Play, Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import VideoPlayer from '@/components/communication/VideoPlayer';
import { useNewsCache } from '@/hooks/useNewsCache';
import NewsSearchBar from '@/components/search/NewsSearchBar';
import NewsFilters from '@/components/search/NewsFilters';

const Toast = ({ message }) => (
  <div className="fixed bottom-4 right-4 bg-gradient-to-r from-niger-orange to-niger-green text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500 ease-in-out animate-slide-in z-50">
    {message}
  </div>
);

export default function Actualites() {
  const { fetchNews, getCachedData, loading } = useNewsCache();

  const [actualites, setActualites] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareTitle, setShareTitle] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const categories = ['Communiqués', 'Événements', 'Annonces'];
  const status = 'published'; // Page publique : seulement les articles publiés

  const displayToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  useEffect(() => {
    let isMounted = true;
    const loadNews = async () => {
      if (!isMounted) return;

      try {
        setIsSearching(true);
        const cachedData = getCachedData(filter, currentPage, searchTerm, status);
        if (cachedData && isMounted) {
          setActualites(cachedData);
        }

        const data = await fetchNews(filter, currentPage, searchTerm, status);
        if (isMounted) {
          setActualites(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          displayToast('Erreur lors du chargement des actualités');
        }
      } finally {
        if (isMounted) {
          setIsSearching(false);
        }
      }
    };

    const timer = setTimeout(loadNews, searchTerm ? 300 : 0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [currentPage, filter, searchTerm, fetchNews, getCachedData]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
    displayToast(`Filtrage par : ${newFilter === 'all' ? 'Tout' : newFilter}`);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleShare = (actualite) => {
    if (typeof window === 'undefined') {
      displayToast('Le partage n\'est pas disponible dans cet environnement.', 'error');
      return;
    }

    const url = `${window.location.origin}/actualites/${actualite._id}`;
    setShareUrl(url);
    setShareTitle(actualite.title);
    setShowModal(true);

    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = url;
    tempTextarea.style.position = 'fixed';
    tempTextarea.style.opacity = '0';
    document.body.appendChild(tempTextarea);
    tempTextarea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        displayToast('Lien copié dans le presse-papier !');
      } else {
        displayToast('Échec de la copie, utilisez les options ci-dessous.');
      }
    } catch (err) {
      displayToast('Échec de la copie, utilisez les options ci-dessous.');
    } finally {
      document.body.removeChild(tempTextarea);
    }
  };

  const handleCopyClick = () => {
    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = shareUrl;
    tempTextarea.style.position = 'fixed';
    tempTextarea.style.opacity = '0';
    document.body.appendChild(tempTextarea);
    tempTextarea.select();

    try {
      document.execCommand('copy');
      displayToast('Lien copié dans le presse-papier !');
    } catch (err) {
      displayToast('Erreur lors de la copie, veuillez copier manuellement.', 'error');
    } finally {
      document.body.removeChild(tempTextarea);
    }
  };

  const getTwitterShareUrl = () => {
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`;
  };

  const getFacebookShareUrl = () => {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  };

  const getLinkedInShareUrl = () => {
    return `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`;
  };

  const getWhatsAppShareUrl = () => {
    return `https://wa.me/?text=${encodeURIComponent(`${shareTitle} - ${shareUrl}`)}`;
  };

  if (loading && actualites.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-4">
          <div className="animate-pulse space-y-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-48 rounded-lg"></div>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  const filteredActualites = actualites.filter(actu => {
    // Filtre par terme de recherche
    const matchesSearch = searchTerm === '' ||
      actu.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      actu.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      actu.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtre par date
    let matchesDate = true;
    if (dateRange.from || dateRange.to) {
      const articleDate = new Date(actu.date || actu.createdAt);
      
      if (dateRange.from) {
        const fromDate = new Date(dateRange.from);
        matchesDate = matchesDate && articleDate >= fromDate;
      }
      
      if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999); // Inclure toute la journée
        matchesDate = matchesDate && articleDate <= toDate;
      }
    }
    
    return matchesSearch && matchesDate;
  });

  // Pagination visible
  const PAGE_SIZE = 12;
  const totalPages = Math.ceil(filteredActualites.length / PAGE_SIZE) || 1;
  const paginatedActualites = filteredActualites.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Mécanisme discret pour afficher archives/corbeille dans la barre de recherche
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
            <span className="text-niger-cream font-medium">Actualités</span>
          </div>
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center mb-6">
                <Calendar className="w-12 h-12 mr-4 text-niger-cream" />
                <div>
                  <h1 className="text-5xl font-bold">Actualités</h1>
                  <p className="text-niger-cream/80 text-lg mt-2">Dernières Nouvelles du Ministère</p>
                </div>
              </div>
              <p className="text-xl text-niger-cream max-w-3xl leading-relaxed mb-6">
                Restez informé des dernières actualités, événements et annonces du Ministère de l'Enseignement Supérieur, 
                de la Recherche et de l'Innovation Technologique du Niger.
              </p>
              
              {/* Barre de recherche améliorée */}
              <div className="max-w-2xl flex items-center gap-4 relative">
                <NewsSearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  onSearch={handleSearch}
                  placeholder="Rechercher une actualité..."
                  enableSuggestions={true}
                  className="flex-1"
                />
                
                {/* Bouton de recherche avancée */}
                <Link
                  href="/search"
                  className="px-4 py-4 rounded-xl bg-niger-white/10 hover:bg-niger-white/20 backdrop-blur-sm text-white border border-niger-white/20 transition-all duration-300 flex items-center"
                  title="Recherche avancée"
                >
                  <Search className="w-5 h-5" />
                </Link>
              </div>
              
              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-niger-cream">
                <div className="bg-niger-white/10 backdrop-blur-sm rounded-xl p-4 border border-niger-white/20">
                  <span className="text-3xl font-bold block">{filteredActualites.length}</span>
                  <span className="text-sm opacity-90">Article{filteredActualites.length > 1 ? 's' : ''}</span>
                </div>
                <div className="bg-niger-white/10 backdrop-blur-sm rounded-xl p-4 border border-niger-white/20">
                  <span className="text-3xl font-bold block">{actualites.filter(a => a.category === 'Communiqués').length}</span>
                  <span className="text-sm opacity-90">Communiqués</span>
                </div>
                <div className="bg-niger-white/10 backdrop-blur-sm rounded-xl p-4 border border-niger-white/20">
                  <span className="text-3xl font-bold block">{actualites.filter(a => a.category === 'Événements').length}</span>
                  <span className="text-sm opacity-90">Événements</span>
                </div>
                <div className="bg-niger-white/10 backdrop-blur-sm rounded-xl p-4 border border-niger-white/20">
                  <span className="text-3xl font-bold block">{actualites.filter(a => a.category === 'Annonces').length}</span>
                  <span className="text-sm opacity-90">Annonces</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="bg-gradient-to-b from-niger-cream to-white dark:from-secondary-900 dark:to-secondary-800 shadow-2xl relative -mt-12 rounded-2xl mx-auto container px-6 transition-colors duration-300">
        <div className="p-8">
          {/* Filtres de recherche améliorés */}
          <NewsFilters
            categories={categories}
            selectedCategory={filter}
            onCategoryChange={handleFilterChange}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            showAdvanced={showAdvancedFilters}
            onToggleAdvanced={() => setShowAdvancedFilters(!showAdvancedFilters)}
          />

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-xl border border-red-200 dark:border-red-800 mb-6 flex items-center">
              <AlertCircle className="w-6 h-6 mr-3" />
              {error}
            </div>
          )}

          <div className="space-y-4 md:grid md:grid-cols-2 md:gap-6 md:space-y-0 lg:grid-cols-3">
            {paginatedActualites.map((actu) => (
              <article
                key={actu._id}
                className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-niger-orange/10 hover:border-niger-orange/30 group overflow-hidden
                  flex md:flex-col gap-4 md:gap-0"
              >
                {/* Image - À gauche sur mobile, en haut sur tablette+ */}
                <div className="relative w-32 h-32 md:w-full md:h-48 flex-shrink-0 group">
                  {actu.mainVideo ? (
                    <div className="relative w-full h-full">
                      <VideoPlayer
                        src={actu.mainVideo}
                        poster={actu.videos?.find(v => v.isMain)?.thumbnail || actu.image}
                        title={actu.title}
                        newsId={actu._id}
                        className="w-full h-full rounded-l-2xl md:rounded-l-none md:rounded-t-2xl"
                        controls={true}
                        autoPlay={false}
                      />
                      <div className="absolute top-2 right-2 bg-niger-orange text-white px-2 py-1 rounded text-xs font-medium">
                        <Play className="w-3 h-3 inline mr-1" />
                        Vidéo
                      </div>
                    </div>
                  ) : (
                    <>
                      <Image
                        src={actu.image || '/images/placeholder.jpg'}
                        alt={actu.title}
                        fill
                        sizes="(max-width: 768px) 128px, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105 rounded-l-2xl md:rounded-l-none md:rounded-t-2xl"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-2xl md:rounded-l-none md:rounded-t-2xl"/>
                    </>
                  )}
                </div>

                {/* Contenu - À droite sur mobile, en bas sur tablette+ */}
                <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center text-xs md:text-sm text-readable-muted dark:text-muted-foreground mb-2 md:mb-3 gap-2">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-niger-orange" />
                        <time dateTime={actu.date}>
                          {new Date(actu.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </time>
                      </div>
                      <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${
                        actu.category === 'Communiqués' ? 'bg-niger-orange/20 text-niger-orange-dark border border-niger-orange/30' :
                        actu.category === 'Événements' ? 'bg-niger-green/20 text-niger-green-dark border border-niger-green/30' :
                        'bg-niger-cream dark:bg-secondary-700 text-niger-green dark:text-niger-green-light border border-niger-orange/20'
                      }`}>
                        {actu.category}
                      </span>
                    </div>
                    <h2 className="text-base md:text-xl font-bold mb-2 md:mb-3 line-clamp-2 group-hover:text-niger-orange dark:group-hover:text-niger-orange-light transition-colors text-niger-green dark:text-niger-green-light">
                      {actu.title}
                    </h2>
                    <p className="text-sm md:text-base text-readable-muted dark:text-muted-foreground mb-3 md:mb-4 line-clamp-2 md:line-clamp-3">
                      {actu.summary || actu.content.substring(0, 150)}...
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <Link
                      href={`/actualites/${actu._id}`}
                      className="text-niger-orange hover:text-niger-orange-dark inline-flex items-center group font-medium text-sm md:text-base"
                    >
                      Lire
                      <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <button
                      onClick={() => handleShare(actu)}
                      className="text-readable-muted dark:text-muted-foreground hover:text-niger-orange transition-colors p-2 rounded-lg hover:bg-niger-orange/10"
                      title="Partager"
                    >
                      <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg border bg-white dark:bg-secondary-800 text-niger-green dark:text-niger-green-light font-semibold transition-all ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-niger-orange/10'}`}
              >
                Précédent
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-lg border font-semibold transition-all mx-1 ${page === currentPage ? 'bg-niger-orange text-white border-niger-orange' : 'bg-white dark:bg-secondary-800 text-niger-green dark:text-niger-green-light hover:bg-niger-orange/10 border-niger-orange/20'}`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-lg border bg-white dark:bg-secondary-800 text-niger-green dark:text-niger-green-light font-semibold transition-all ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-niger-orange/10'}`}
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modale de partage */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-secondary-800 rounded-2xl p-6 w-full max-w-md shadow-xl border border-niger-orange/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-niger-green dark:text-niger-green-light">Partager cet article</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-readable-muted dark:text-muted-foreground hover:text-niger-orange transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-readable-muted dark:text-muted-foreground mb-4">
              Copiez le lien ou partagez directement sur vos réseaux sociaux :
            </p>
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="w-full p-3 border border-niger-orange/20 rounded-xl bg-niger-cream dark:bg-secondary-700 text-readable dark:text-foreground focus:outline-none"
              />
              <button
                onClick={handleCopyClick}
                className="bg-gradient-to-r from-niger-orange to-niger-green text-white p-3 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center"
                title="Copier le lien"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <a
                href={getTwitterShareUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-400 text-white px-4 py-3 rounded-xl hover:bg-blue-500 transition-colors text-center font-medium"
              >
                Twitter
              </a>
              <a
                href={getFacebookShareUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors text-center font-medium"
              >
                Facebook
              </a>
              <a
                href={getLinkedInShareUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-800 text-white px-4 py-3 rounded-xl hover:bg-blue-900 transition-colors text-center font-medium"
              >
                LinkedIn
              </a>
              <a
                href={getWhatsAppShareUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 text-white px-4 py-3 rounded-xl hover:bg-green-600 transition-colors text-center font-medium"
              >
                WhatsApp
              </a>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 border border-niger-orange/20 rounded-xl text-niger-green dark:text-niger-green-light hover:bg-niger-orange/10 dark:hover:bg-niger-orange/20 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && <Toast message={toastMessage} />}
    </MainLayout>
  );
}