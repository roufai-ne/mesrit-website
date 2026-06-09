import React, { useState, useEffect } from 'react';
import { Play, Newspaper, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { formatDate } from '@/lib/utils';
import VideoPlayer from '@/components/communication/VideoPlayer';
import { clsx } from 'clsx';
import { fetchAPI, endpoints } from '@/lib/strapi';
import { mapStrapiList, mapArticleToNews } from '@/utils/strapiMapper';

export default function HeroNewsCarousel({ initialNews = [] }) {
  const [news, setNews] = useState(initialNews);
  const [activeIndex, setActiveIndex] = useState(0);
  const [thumbnailMediaView, setThumbnailMediaView] = useState({}); // Track which view (photos/videos) for each thumbnail
  const [isCarouselPaused, setIsCarouselPaused] = useState(false); // Pause carousel on hover
  const [hoveredVideoIndex, setHoveredVideoIndex] = useState(null); // Track which video is hovered in mini-previews
  const [isPlayingHeroVideo, setIsPlayingHeroVideo] = useState(false); // Play video inline in hero
  const [loading, setLoading] = useState(initialNews.length === 0);
  const [error, setError] = useState(null);
  const { isDark } = useTheme();

  useEffect(() => {
    // Si des données initiales SSR sont disponibles, pas besoin de refetch immédiatement
    if (initialNews.length === 0) {
      fetchNews();
    }
  }, []);

  // Réinitialiser la lecture vidéo hero au changement d'article
  useEffect(() => {
    setIsPlayingHeroVideo(false);
  }, [activeIndex]);

  // Auto rotation pour le carrousel
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (news.length === 0 || isCarouselPaused || prefersReducedMotion) return;

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % Math.min(news.length, 8));
    }, 6000); // 6 secondes pour laisser le temps de lire

    return () => clearInterval(interval);
  }, [news.length, isCarouselPaused]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetchAPI(endpoints.articles, {
        sort: ['publishedAt:desc'],
        pagination: { limit: 8 },
        populate: ['cover', 'videos']
      });
      const publishedNews = mapStrapiList(response, mapArticleToNews);
      setNews(publishedNews);
      setError(null);
    } catch (error) {
      console.warn('Strapi indisponible — actualités:', error.message);
      setError('Impossible de charger les actualités');
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const retry = () => {
    fetchNews();
  };

  // Helper: Get thumbnail image based on view preference and available media
  const getThumbnailImage = (article, articleId) => {
    const showVideos = thumbnailMediaView[articleId];

    if (showVideos && article.videos?.length > 0) {
      // Show video thumbnail if available, fallback to image
      const mainVideo = article.videos.find(v => v.isMain);
      return mainVideo?.thumbnail || article.videos[0]?.thumbnail || article.image || '/images/news-placeholder.svg';
    } else {
      // Show image by default
      return article.images?.[0]?.url || article.image || '/images/news-placeholder.svg';
    }
  };

  // Helper: Get count of images and videos
  const getMediaCounts = (article) => {
    return {
      imagesCount: article.images?.length || (article.image ? 1 : 0),
      videosCount: article.videos?.length || 0
    };
  };

  // Toggle between photos and videos view for a thumbnail
  const toggleThumbnailView = (articleId, e) => {
    e.stopPropagation();
    setThumbnailMediaView(prev => ({
      ...prev,
      [articleId]: !prev[articleId]
    }));
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
          {isPlayingHeroVideo && currentNews?.mainVideo ? (
            /* Lecture vidéo inline dans le hero */
            <VideoPlayer
              src={currentNews.mainVideo}
              poster={currentNews.videos?.find(v => v.isMain)?.thumbnail || currentNews.images?.[0]?.url || currentNews.image || '/images/news-placeholder.svg'}
              title={currentNews.title}
              newsId={currentNews._id}
              className="w-full h-full object-cover"
              controls={true}
              autoPlay={true}
              muted={false}
            />
          ) : (() => {
            const hasImages = currentNews?.images?.length > 0 || currentNews?.image;

            // Priorité : images → vidéo principale → première vidéo → placeholder
            if (hasImages) {
              return (
                <Image
                  src={currentNews.images?.[0]?.url || currentNews.image || '/images/news-placeholder.svg'}
                  alt={currentNews.title}
                  fill
                  sizes="100vw"
                  className="object-cover object-center transition-transform duration-1000 ease-out"
                  style={{ objectPosition: 'center 25%' }}
                  priority={activeIndex === 0}
                />
              );
            } else if (currentNews?.mainVideo) {
              return (
                <VideoPlayer
                  src={currentNews.mainVideo}
                  poster={currentNews.videos?.find(v => v.isMain)?.thumbnail || '/images/news-placeholder.svg'}
                  title={currentNews.title}
                  newsId={currentNews._id}
                  className="w-full h-full object-cover"
                  controls={false}
                  autoPlay={false}
                  muted={true}
                />
              );
            } else if (currentNews?.videos?.length > 0) {
              const firstVideo = currentNews.videos[0];
              return (
                <VideoPlayer
                  src={firstVideo.url}
                  poster={firstVideo.thumbnail || '/images/news-placeholder.svg'}
                  title={currentNews.title}
                  newsId={currentNews._id}
                  className="w-full h-full object-cover"
                  controls={false}
                  autoPlay={false}
                  muted={true}
                />
              );
            } else {
              return (
                <Image
                  src="/images/news-placeholder.svg"
                  alt="Actualité MESRIT"
                  fill
                  sizes="100vw"
                  className="object-contain opacity-60"
                  priority={activeIndex === 0}
                  loading={activeIndex === 0 ? "eager" : "lazy"}
                />
              );
            }
          })()}
        </div>

        {/* Overlay gradiant */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 sm:from-black/80 via-black/30 sm:via-black/40 to-black/10 sm:to-black/20" />

        {/* Badge Catégorie et Médias */}
        <div className="absolute top-3 sm:top-4 md:top-6 left-3 sm:left-4 md:left-6 flex flex-wrap gap-2 sm:gap-3">
          {currentNews?.category && (
            <span className="inline-block px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-niger-orange text-white rounded-full font-medium shadow-lg">
              {currentNews.category}
            </span>
          )}
          {(() => {
            const { imagesCount, videosCount } = getMediaCounts(currentNews);
            // Show media badge if there's more content than what's displayed
            const displayingImage = currentNews?.images?.length > 0 || currentNews?.image;

            if (displayingImage && videosCount > 0) {
              // Displaying image but has videos
              return (
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-black/50 text-white rounded-full font-medium shadow-lg backdrop-blur-sm">
                  <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span className="hidden sm:inline">{videosCount} vidéo{videosCount > 1 ? 's' : ''}</span>
                  <span className="sm:hidden">🎥 {videosCount}</span>
                </span>
              );
            } else if ((currentNews?.mainVideo || videosCount > 0) && imagesCount > 0) {
              // Displaying video but has images
              return (
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-black/50 text-white rounded-full font-medium shadow-lg backdrop-blur-sm">
                  <span className="hidden sm:inline">📷 {imagesCount} photo{imagesCount > 1 ? 's' : ''}</span>
                  <span className="sm:hidden">📷 {imagesCount}</span>
                </span>
              );
            } else if (currentNews?.mainVideo || videosCount > 0) {
              // Only has video
              return (
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-black/50 text-white rounded-full font-medium shadow-lg backdrop-blur-sm">
                  <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span className="hidden sm:inline">Vidéo</span>
                  <span className="sm:hidden">▶</span>
                </span>
              );
            }
            return null;
          })()}
        </div>

        {/* Contenu Principal */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
          <div className="container mx-auto max-w-6xl">
            <div className="max-w-4xl hero-news-content">
              <div className="mb-2 sm:mb-3 text-xs sm:text-sm text-white/80">
                {formatDate(currentNews?.createdAt)}
              </div>

              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-3 sm:mb-4 leading-tight drop-shadow-lg text-shadow-lg">
                {currentNews?.title}
              </h1>

              <p className="text-white/90 text-xs sm:text-sm md:text-base lg:text-lg line-clamp-2 mb-4 sm:mb-6 max-w-3xl drop-shadow text-shadow leading-relaxed">
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

                {/* Bouton lecture vidéo dans le hero */}
                {currentNews?.mainVideo && (
                  isPlayingHeroVideo ? (
                    <button
                      onClick={() => {
                        setIsPlayingHeroVideo(false);
                        setIsCarouselPaused(false);
                      }}
                      className="inline-flex items-center gap-1 sm:gap-1.5 md:gap-2 px-2.5 sm:px-3 md:px-4 lg:px-6 py-1.5 sm:py-2 md:py-2.5 lg:py-3 bg-niger-orange/90 text-white rounded-lg hover:bg-niger-orange transition-all duration-300 font-medium border border-niger-orange/50 text-xs sm:text-sm md:text-base"
                    >
                      <span className="hidden sm:inline">Fermer la vidéo</span>
                      <span className="sm:hidden">✕</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsPlayingHeroVideo(true);
                        setIsCarouselPaused(true);
                      }}
                      className="inline-flex items-center gap-1 sm:gap-1.5 md:gap-2 px-2.5 sm:px-3 md:px-4 lg:px-6 py-1.5 sm:py-2 md:py-2.5 lg:py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300 backdrop-blur-sm font-medium border border-white/20 text-xs sm:text-sm md:text-base"
                    >
                      <Play className="w-3 h-3 sm:w-4 sm:h-4 fill-white" />
                      <span className="hidden sm:inline">Regarder la vidéo</span>
                      <span className="sm:hidden">▶</span>
                    </button>
                  )
                )}

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

        {/* Mini Previews des Vidéos - Empilées verticalement en haut à droite */}
        {currentNews?.videos && currentNews.videos.length > 0 && (
          <div
            className="absolute top-3 sm:top-4 md:top-6 right-3 sm:right-4 md:right-6 flex flex-col gap-3"
            onMouseEnter={() => setIsCarouselPaused(true)}
            onMouseLeave={() => {
              setIsCarouselPaused(false);
              setHoveredVideoIndex(null);
            }}
          >
            {currentNews.videos.slice(0, 3).map((video, videoIdx) => (
              <div
                key={videoIdx}
                onMouseEnter={() => setHoveredVideoIndex(videoIdx)}
                onMouseLeave={() => setHoveredVideoIndex(null)}
                className={clsx(
                  'relative rounded-lg overflow-hidden shadow-xl transition-all duration-300 cursor-pointer',
                  'w-32 sm:w-40 md:w-48 aspect-video',
                  hoveredVideoIndex === videoIdx
                    ? 'ring-3 ring-niger-orange scale-110 z-20 shadow-2xl shadow-niger-orange/50'
                    : 'hover:ring-2 hover:ring-white/70 hover:scale-105'
                )}
              >
                {/* Vidéo Aperçu - Toujours visible, avec play overlay */}
                <div className="absolute inset-0">
                  <VideoPlayer
                    src={video.url}
                    poster={video.thumbnail}
                    title={video.title || `Vidéo ${videoIdx + 1}`}
                    newsId={currentNews._id}
                    className="w-full h-full object-cover"
                    controls={false}
                    autoPlay={hoveredVideoIndex === videoIdx}
                    muted={true}
                  />
                </div>

                {/* Badge Play Icon - Visible quand pas survolé */}
                {hoveredVideoIndex !== videoIdx && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-all duration-300 pointer-events-none">
                    <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1 drop-shadow-lg" />
                  </div>
                )}

                {/* Overlay indicateur si survolé */}
                {hoveredVideoIndex === videoIdx && (
                  <div className="absolute inset-0 bg-gradient-to-t from-niger-orange/60 via-transparent to-transparent pointer-events-none" />
                )}

                {/* Numéro vidéo */}
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs sm:text-sm px-2 py-1 rounded-full font-medium">
                  {videoIdx + 1}/{currentNews.videos.length}
                </div>

                {/* Titre vidéo au survol */}
                {hoveredVideoIndex === videoIdx && video.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2">
                    <p className="text-white text-xs sm:text-sm line-clamp-2">{video.title}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

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

            {/* Liste responsive - Horizontal sur mobile, grille sur tablette+ */}
            <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-3 xl:grid-cols-5">
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
                  onMouseEnter={() => setIsCarouselPaused(true)}
                  onMouseLeave={() => setIsCarouselPaused(false)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Voir l'actualité: ${article.title}`}
                  aria-pressed={index === activeIndex}
                  className={clsx(
                    'news-thumbnail group cursor-pointer rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-md hover:shadow-xl relative touch-manipulation focus:outline-none focus:ring-2 focus:ring-niger-orange focus:ring-offset-2',
                    'flex md:flex-col gap-3 md:gap-0',
                    index === activeIndex
                      ? 'active ring-3 ring-niger-orange shadow-2xl shadow-niger-orange/20'
                      : ''
                  )}
                >
                  {/* Vignette Image/Vidéo - Largeur fixe sur mobile, aspect ratio sur tablette+ */}
                  <div className="relative w-28 h-28 md:w-full md:aspect-[4/3] flex-shrink-0 overflow-hidden">
                    {/* Image/Vidéo principale */}
                    <Image
                      src={getThumbnailImage(article, article._id)}
                      alt={article.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="news-thumbnail-image object-cover object-center"
                      style={{ objectPosition: 'center 25%' }}
                    />

                    {/* Badge vidéo cliquable si des vidéos disponibles */}
                    {article.videos && article.videos.length > 0 && (
                      <button
                        onClick={(e) => toggleThumbnailView(article._id, e)}
                        className={clsx(
                          'absolute top-2 right-2 transition-all duration-300',
                          'w-8 h-8 rounded-full flex items-center justify-center shadow-lg',
                          'backdrop-blur-sm font-medium text-xs',
                          thumbnailMediaView[article._id]
                            ? 'bg-niger-orange/90 text-white'
                            : 'bg-black/50 text-white hover:bg-niger-orange/80'
                        )}
                        title={thumbnailMediaView[article._id] ? 'Voir les photos' : 'Voir les vidéos'}
                        aria-label={thumbnailMediaView[article._id] ? 'Voir les photos' : 'Voir les vidéos'}
                      >
                        {thumbnailMediaView[article._id] ? (
                          <span className="text-sm">🎥</span>
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </button>
                    )}

                    {/* Badge de comptage de médias */}
                    {(() => {
                      const { imagesCount, videosCount } = getMediaCounts(article);
                      if (imagesCount > 0 || videosCount > 0) {
                        return (
                          <div className="absolute bottom-2 left-2 text-xs font-medium bg-black/60 text-white px-2 py-1 rounded-full backdrop-blur-sm">
                            {imagesCount > 0 && <span>📷 {imagesCount}</span>}
                            {imagesCount > 0 && videosCount > 0 && <span> • </span>}
                            {videosCount > 0 && <span>🎥 {videosCount}</span>}
                          </div>
                        );
                      }
                      return null;
                    })()}

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

                  {/* Contenu de la vignette - Compact sur mobile, détaillé sur tablette+ */}
                  <div className="flex-1 p-3 md:p-4 flex flex-col justify-between">
                    <div>
                      <h4 className={clsx(
                        'text-sm md:text-sm font-semibold line-clamp-2 md:line-clamp-3 transition-colors duration-300 mb-2 md:mb-3 leading-tight',
                        index === activeIndex
                          ? 'text-niger-orange'
                          : 'text-gray-800 dark:text-gray-200 group-hover:text-niger-orange'
                      )}>
                        {article.title}
                      </h4>

                      {/* Date - Plus compact sur mobile */}
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {formatDate(article.createdAt)}
                      </div>

                      {/* Extrait - Caché sur mobile, visible sur tablette+ */}
                      <p className="hidden md:block text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-3">
                        {article.excerpt || article.summary || 'Cliquez pour lire l\'article complet...'}
                      </p>
                    </div>

                    {/* Indicateur de lecture */}
                    <div className={clsx(
                      'text-xs font-medium transition-colors duration-300 mt-1 md:mt-0',
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
