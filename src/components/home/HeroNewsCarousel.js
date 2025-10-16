import React, { useState, useEffect } from 'react';
import { Play, Newspaper, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { secureApi, useApiAction } from '@/lib/secureApi';
import { useTheme } from '@/contexts/ThemeContext';
import { formatDate } from '@/lib/utils';
import VideoPlayer from '@/components/communication/VideoPlayer';
import { clsx } from 'clsx';

export default function HeroNewsCarousel() {
  const [news, setNews] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const { execute, loading, error } = useApiAction();
  const { isDark } = useTheme();

  useEffect(() => {
    fetchNews();
  }, []);

  // Auto rotation pour le carrousel
  useEffect(() => {
    if (news.length === 0) return;
    
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % Math.min(news.length, 8));
    }, 6000); // 6 secondes pour laisser le temps de lire
    
    return () => clearInterval(interval);
  }, [news.length]);

  const fetchNews = async () => {
    try {
      await execute(async () => {
        const data = await secureApi.get('/api/news', false);
        if (!Array.isArray(data)) {
          throw new Error('Format de données invalide');
        }
        const publishedNews = data
          .filter(item => item.status === 'published')
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 8); // Récupérer 8 actualités pour le carrousel
        setNews(publishedNews);
      });
    } catch (error) {
      console.error('Erreur lors du chargement des actualités:', error);
      setNews([]);
    }
  };

  const retry = () => {
    fetchNews();
  };

  if (loading) {
    return (
      <section className="relative min-h-[600px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-niger-orange" />
          <p className="text-gray-600 dark:text-gray-400">Chargement des actualités...</p>
        </div>
      </section>
    );
  }

  if (error || news.length === 0) {
    return (
      <section className="relative min-h-[400px] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {error ? 'Erreur de chargement' : 'Aucune actualité disponible'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error ? error : 'Il n\'y a actuellement aucune actualité à afficher.'}
          </p>
          {error && (
            <button
              onClick={retry}
              className="px-4 py-2 bg-niger-orange text-white rounded-lg hover:bg-niger-orange/90 transition-colors"
            >
              Réessayer
            </button>
          )}
        </div>
      </section>
    );
  }

  const currentNews = news[activeIndex];

  return (
    <div className="relative">
      {/* Carrousel Principal sans conteneur (déjà dans parent) */}
      <div className="hero-news-carousel relative h-[400px] sm:h-[450px] md:h-[500px] lg:h-[550px] xl:h-[600px] overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl">
        {/* Image/Vidéo Principale */}
        <div className="absolute inset-0">
          {currentNews?.mainVideo ? (
            <VideoPlayer
              src={currentNews.mainVideo}
              poster={currentNews.videos?.find(v => v.isMain)?.thumbnail || currentNews.image}
              title={currentNews.title}
              newsId={currentNews._id}
              className="w-full h-full object-cover"
              controls={false}
              autoPlay={false}
              muted={true}
            />
          ) : currentNews?.image ? (
            <Image
              src={currentNews.image}
              alt={currentNews.title}
              fill
              sizes="100vw"
              className="object-cover object-center transition-transform duration-1000 ease-out"
              style={{ objectPosition: 'center 25%' }}
              priority={activeIndex === 0}
              loading={activeIndex === 0 ? "eager" : "lazy"}
            />
          ) : (
            <Image
              src="/images/news-placeholder.svg"
              alt="Actualité MESRIT"
              fill
              sizes="100vw"
              className="object-contain opacity-60"
              priority={activeIndex === 0}
              loading={activeIndex === 0 ? "eager" : "lazy"}
            />
          )}
        </div>

        {/* Overlay gradiant */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 sm:from-black/80 via-black/30 sm:via-black/40 to-black/10 sm:to-black/20" />

        {/* Badge Catégorie et Vidéo */}
        <div className="absolute top-3 sm:top-4 md:top-6 left-3 sm:left-4 md:left-6 flex flex-wrap gap-2 sm:gap-3">
          {currentNews?.category && (
            <span className="inline-block px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-niger-orange text-white rounded-full font-medium shadow-lg">
              {currentNews.category}
            </span>
          )}
          {currentNews?.mainVideo && (
            <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-black/50 text-white rounded-full font-medium shadow-lg backdrop-blur-sm">
              <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Vidéo</span>
              <span className="sm:hidden">▶</span>
            </span>
          )}
        </div>

        {/* Contenu Principal */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
          <div className="container mx-auto max-w-6xl">
            <div className="max-w-4xl hero-news-content">
              <div className="mb-2 sm:mb-3 text-xs sm:text-sm text-white/80">
                {formatDate(currentNews?.createdAt)}
              </div>
              
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-3 sm:mb-4 leading-tight drop-shadow-lg">
                {currentNews?.title}
              </h1>
              
              <p className="text-white/90 text-xs sm:text-sm md:text-base lg:text-lg line-clamp-2 mb-4 sm:mb-6 max-w-3xl drop-shadow leading-relaxed">
                {currentNews?.excerpt || currentNews?.summary}
              </p>
              
              <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
                <Link
                  href={`/actualites/${currentNews?._id}`}
                  className="inline-flex items-center gap-1 sm:gap-1.5 md:gap-2 px-2.5 sm:px-3 md:px-4 lg:px-6 py-1.5 sm:py-2 md:py-2.5 lg:py-3 bg-white text-niger-orange rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg text-xs sm:text-sm md:text-base"
                >
                  <span className="hidden xs:inline">Lire l'article</span>
                  <span className="xs:hidden">Lire</span>
                  <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                </Link>
                
                <Link
                  href="/actualites"
                  className="inline-flex items-center gap-1 sm:gap-1.5 md:gap-2 px-2.5 sm:px-3 md:px-4 lg:px-6 py-1.5 sm:py-2 md:py-2.5 lg:py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300 backdrop-blur-sm font-medium border border-white/20 text-xs sm:text-sm md:text-base"
                >
                  <span className="hidden md:inline">Toutes les actualités</span>
                  <span className="hidden sm:inline md:hidden">Toutes</span>
                  <span className="sm:hidden">+</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Contrôles de Navigation */}
        {news.length > 1 && (
          <>
            {/* Indicateurs */}
            <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 right-3 sm:right-4 md:right-6 flex gap-1.5 sm:gap-2">
              {news.slice(0, 8).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={clsx(
                    'transition-all duration-300 rounded-full',
                    index === activeIndex
                      ? 'w-6 sm:w-8 h-1.5 sm:h-2 bg-white shadow-lg'
                      : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/50 hover:bg-white/75'
                  )}
                  aria-label={`Aller à l'actualité ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Vignettes de Navigation Améliorées */}
      {news.length > 1 && (
        <div className="bg-white dark:bg-gray-900 shadow-lg border-t border-gray-100 dark:border-gray-800 rounded-b-2xl">
          <div className="px-6 py-8">
            {/* Titre de section */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Actualités récentes
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cliquez sur une vignette pour voir l'article
              </p>
            </div>
            
            {/* Grille fixe - 5 vignettes occupant toute la largeur */}
            <div className="grid grid-cols-5 gap-3 lg:gap-4">
              {news.slice(0, 5).map((article, index) => (
                <div
                  key={article._id}
                  onClick={() => setActiveIndex(index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveIndex(index);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Voir l'actualité: ${article.title}`}
                  aria-pressed={index === activeIndex}
                  className={clsx(
                    'news-thumbnail group cursor-pointer rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-md hover:shadow-xl relative touch-manipulation focus:outline-none focus:ring-2 focus:ring-niger-orange focus:ring-offset-2',
                    index === activeIndex 
                      ? 'active ring-3 ring-niger-orange shadow-2xl shadow-niger-orange/20' 
                      : ''
                  )}
                >
                  {/* Vignette Image/Vidéo - Plus grande et mieux proportionnée */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {article.mainVideo ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={article.videos?.find(v => v.isMain)?.thumbnail || article.image || '/images/news-placeholder.svg'}
                          alt={article.title}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="news-thumbnail-image object-cover object-center"
                          style={{ objectPosition: 'center 25%' }}
                        />
                        {/* Badge vidéo plus visible */}
                        <div className="absolute top-2 right-2">
                          <div className="w-8 h-8 bg-niger-orange/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg badge-animate">
                            <Play className="w-4 h-4 text-white ml-0.5" />
                          </div>
                        </div>
                        {/* Overlay vidéo */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                            <Play className="w-6 h-6 text-niger-orange ml-1" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Image
                        src={article.image || '/images/news-placeholder.svg'}
                        alt={article.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="news-thumbnail-image object-cover object-center"
                        style={{ objectPosition: 'center 25%' }}
                      />
                    )}
                    
                    {/* Overlay avec gradient */}
                    <div className={clsx(
                      'absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent transition-opacity duration-300',
                      index === activeIndex ? 'opacity-60' : 'opacity-0 group-hover:opacity-40'
                    )} />
                    
                    {/* Badge catégorie si disponible */}
                    {article.category && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 text-xs font-medium bg-niger-orange text-white rounded-full shadow-lg">
                          {article.category}
                        </span>
                      </div>
                    )}
                    
                    {/* Indicateur article actif */}
                    {index === activeIndex && (
                      <div className="absolute bottom-2 left-2">
                        <div className="w-3 h-3 bg-niger-orange rounded-full animate-pulse shadow-lg"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Contenu de la vignette - Optimisé pour 5 colonnes */}
                  <div className="p-4">
                    <h4 className={clsx(
                      'text-sm font-semibold line-clamp-3 transition-colors duration-300 mb-3 leading-tight',
                      index === activeIndex 
                        ? 'text-niger-orange' 
                        : 'text-gray-800 dark:text-gray-200 group-hover:text-niger-orange'
                    )}>
                      {article.title}
                    </h4>
                    
                    {/* Date */}
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {formatDate(article.createdAt)}
                    </div>
                    
                    {/* Extrait - Toujours visible pour 5 colonnes */}
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-3">
                      {article.excerpt || article.summary || 'Cliquez pour lire l\'article complet...'}
                    </p>
                    
                    {/* Indicateur de lecture */}
                    <div className={clsx(
                      'text-xs sm:text-sm font-medium transition-colors duration-300',
                      index === activeIndex 
                        ? 'text-niger-orange' 
                        : 'text-gray-400 group-hover:text-niger-orange'
                    )}>
                      {index === activeIndex ? '● En cours' : 'Voir'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Navigation supplémentaire si plus de 6 articles */}
            {news.length > 6 && (
              <div className="text-center mt-8">
                <Link
                  href="/actualites"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-niger-orange text-white rounded-lg hover:bg-niger-orange/90 transition-all duration-300 transform hover:scale-105 font-medium shadow-lg"
                >
                  Voir toutes les actualités
                  <Play className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
