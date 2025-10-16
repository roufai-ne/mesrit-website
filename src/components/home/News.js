import React, { useState, useEffect } from 'react';
import { ArrowRight, AlertCircle, Newspaper, Play } from 'lucide-react';
import Link from 'next/link';
import HomeNewsCarousel from './NewsCarousel';
import { secureApi, useApiAction } from '@/lib/secureApi';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import Image from 'next/image';
import VideoPlayer from '@/components/communication/VideoPlayer';
import { useTheme } from '@/contexts/ThemeContext';
import { clsx } from 'clsx';

export default function News() {
  const [news, setNews] = useState([]);
  const { execute, loading, error } = useApiAction();
  const { isDark } = useTheme();

  useEffect(() => {
    fetchNews();
  }, []);

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
          .slice(0, 4);
        setNews(publishedNews);
      });
    } catch (error) {
      let message = error.message;
      if (message.includes('429')) message = 'Trop de requêtes, veuillez patienter.';
      if (message.includes('401')) message = 'Accès non autorisé.';
      if (message.includes('403')) message = 'Accès interdit.';
      setNews([]);
      setError(message);
      console.error('Erreur lors du chargement des actualités:', message);
    }
  };

  const retry = () => {
    fetchNews();
  };

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className={clsx(
            'text-section-title', // Utilise la nouvelle classe typography
            isDark ? 'text-white' : 'text-gray-900'
          )}>Actualités</h2>
          <p className={clsx(
            'text-body-large', // Utilise la nouvelle classe typography
            isDark ? 'text-white/90' : 'text-gray-600'
          )}>Restez informé des dernières nouvelles du ministère</p>
        </div>

        {loading ? (
          <div className="grid-news-home">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className={clsx(
                  'rounded-xl h-32 mb-3',
                  isDark 
                    ? 'bg-niger-white-glass/30' 
                    : 'bg-gray-200'
                )} />
                <div className="space-y-2">
                  <div className={clsx(
                    'h-3 rounded w-3/4',
                    isDark 
                      ? 'bg-niger-white-glass/30' 
                      : 'bg-gray-200'
                  )} />
                  <div className={clsx(
                    'h-3 rounded w-1/2',
                    isDark 
                      ? 'bg-niger-white-glass/30' 
                      : 'bg-gray-200'
                  )} />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <AlertCircle className="w-16 h-16 mx-auto" />
            </div>
            <h3 className={clsx(
              'text-card-title', // Utilise la nouvelle classe typography
              isDark ? 'text-white' : 'text-gray-900'
            )}>Erreur de chargement</h3>
            <p className={clsx(
              'text-body mb-6', // Utilise la nouvelle classe typography
              isDark ? 'text-white/80' : 'text-gray-600'
            )}>{error}</p>
            <Button onClick={retry} className="button-spacing">
              Réessayer
            </Button>
          </div>
        ) : news.length > 0 ? (
          <>
            <div className="grid-news-home mb-8">
              {news.map((item, index) => (
                <Link href={`/actualites/${item._id}`} key={item._id}>
                  <article
                    className={clsx(
                      'group relative overflow-hidden rounded-xl border transition-all duration-300 transform hover:-translate-y-1 cursor-pointer',
                      'shadow-md hover:shadow-lg flex flex-col h-full',
                      isDark 
                        ? 'bg-niger-white-glass/30 border-niger-orange/20 hover:border-niger-orange/40 hover:bg-niger-white-glass/50' 
                        : 'bg-white border-gray-200 hover:border-niger-orange/30 hover:shadow-xl'
                    )}
                  >
                  {/* Média (Vidéo ou Image) */}
                  <div className="relative h-32 overflow-hidden">
                    {item.mainVideo ? (
                      <div className="relative w-full h-full">
                        <VideoPlayer
                          src={item.mainVideo}
                          poster={item.videos?.find(v => v.isMain)?.thumbnail || item.image}
                          title={item.title}
                          newsId={item._id}
                          className="w-full h-full"
                          controls={true}
                          autoPlay={false}
                        />
                        <div className="absolute top-1.5 right-1.5 bg-niger-orange text-white px-1.5 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                          <Play className="w-2.5 h-2.5" />
                          Vidéo
                        </div>
                      </div>
                    ) : item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className={clsx(
                        'w-full h-full flex items-center justify-center',
                        isDark ? 'bg-niger-white-glass/20' : 'bg-gray-100'
                      )}>
                        <Newspaper className={clsx(
                          'w-12 h-12',
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        )} />
                      </div>
                    )}
                    
                    {item.image && !item.mainVideo && (
                      <div className={clsx(
                        'absolute inset-0 bg-gradient-to-t',
                        isDark ? 'from-black/60 to-transparent' : 'from-black/40 to-transparent'
                      )} />
                    )}
                  </div>

                  {/* Contenu - Plus compact */}
                  <div className="p-3 flex flex-col flex-grow">
                    {/* Catégorie et date - Plus compactes */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={clsx(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        isDark 
                          ? 'bg-niger-orange-glass/50 text-niger-orange-light' 
                          : 'bg-niger-orange/10 text-niger-orange-dark'
                      )}>
                        {item.category || 'Actualité'}
                      </span>
                      <time className={clsx(
                        'text-xs',
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      )}>
                        {formatDate(item.createdAt)}
                      </time>
                    </div>

                    {/* Titre - Plus compact */}
                    <h3 className={clsx(
                      'text-sm font-semibold line-clamp-2 mb-2',
                      isDark ? 'text-white' : 'text-gray-900'
                    )}>
                      {item.title}
                    </h3>

                    {/* Extrait - Plus court */}
                    <p className={clsx(
                      'text-xs line-clamp-2 mb-3',
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    )}>
                      {item.excerpt || item.content?.substring(0, 80) + '...'}
                    </p>

                    {/* Call-to-action - Plus compact */}
                    <div className="flex items-center justify-between">
                      <span className={clsx(
                        'text-xs font-medium',
                        isDark ? 'text-niger-orange-light' : 'text-niger-orange'
                      )}>
                        Lire la suite
                      </span>
                      <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                  </article>
                </Link>
              ))}
            </div>

            {/* Call-to-action vers toutes les actualités */}
            <div className="text-center mt-6">
              <Button
                asChild
                variant="outline"
                className="hover:bg-niger-orange hover:text-white hover:border-niger-orange transition-all duration-300"
              >
                <Link href="/actualites" className="inline-flex items-center gap-2">
                  Voir toutes les actualités
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className={clsx(
              'w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center',
              isDark ? 'bg-niger-white-glass/30' : 'bg-gray-100'
            )}>
              <Newspaper className={clsx(
                'w-8 h-8',
                isDark ? 'text-gray-400' : 'text-gray-500'
              )} />
            </div>
            <h3 className={clsx(
              'text-card-title', // Utilise la nouvelle classe typography
              isDark ? 'text-white' : 'text-gray-900'
            )}>Aucune actualité disponible</h3>
            <p className={clsx(
              'text-body', // Utilise la nouvelle classe typography
              isDark ? 'text-white/80' : 'text-gray-600'
            )}>
              Revenez plus tard pour découvrir les dernières nouvelles
            </p>
          </div>
        )}
      </div>
    </section>
  );
}