import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Calendar, ArrowRight} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useNewsCache } from '@/hooks/useNewsCache';

const Toast = ({ message }) => (
  <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500 ease-in-out animate-slide-in z-50">
    {message}
  </div>
);

export default function Actualites() {
  const {
    fetchNews,
    
    getCachedData,
    loading,
    
  } = useNewsCache();

  const [actualites, setActualites] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const categories = ['Communiqués', 'Événements', 'Annonces'];

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
        // Vérifier d'abord le cache
        const cachedData = getCachedData(filter, currentPage, searchTerm);
        if (cachedData && isMounted) {
          setActualites(cachedData);
        }

        // Charger les données fraîches
        const data = await fetchNews(filter, currentPage, searchTerm);
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

  const handleShare = async (actualite) => {
    try {
      await navigator.share({
        title: actualite.title,
        text: actualite.summary,
        url: `/actualites/${actualite._id}`
      });
      displayToast('Article partagé avec succès !');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      navigator.clipboard.writeText(window.location.origin + `/actualites/${actualite._id}`);
      displayToast('Lien copié dans le presse-papier !');
    }
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

  const filteredActualites = actualites.filter(actu =>
    searchTerm === '' ||
    actu.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    actu.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-4 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Actualités</h1>
          <p className="text-gray-600">
            {filteredActualites.length} article{filteredActualites.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <button 
            onClick={() => handleFilterChange('all')}
            className={`${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100'} 
              px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-md`}
          >
            Tout
          </button>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => handleFilterChange(cat)}
              className={`${filter === cat ? 'bg-blue-600 text-white' : 'bg-gray-100'} 
                px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-md`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative mb-8">
          <input
            type="search"
            placeholder="Rechercher une actualité..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full p-3 border rounded-lg pr-10 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {filteredActualites.map((actu) => (
            <article 
              key={actu._id} 
              className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="relative h-48 group">
              <Image
                src={actu.image || '/images/placeholder.jpg'}
                alt={actu.title}
                fill
                sizes="(max-width: 768px) 100vw, 
                      (max-width: 1200px) 50vw, 
                      33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
              </div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  <time dateTime={actu.date}>
                    {new Date(actu.date).toLocaleDateString('fr-FR')}
                  </time>
                  <span className="mx-2">•</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {actu.category}
                  </span>
                </div>
                <h2 className="text-xl font-bold mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                  {actu.title}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {actu.summary || actu.content.substring(0, 150)}...
                </p>
                <div className="flex justify-between items-center mt-4">
                  <Link
                    href={`/actualites/${actu._id}`}
                    className="text-blue-600 hover:text-blue-800 inline-flex items-center group"
                  >
                    Lire la suite
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <button
                    onClick={() => handleShare(actu)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    title="Partager"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {showToast && <Toast message={toastMessage} />}
      </div>
    </MainLayout>
  );
}