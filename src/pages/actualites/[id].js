//src/pages/actualités/[id].js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import { Calendar, ArrowLeft, ArrowRight, Tag, ImageIcon, ChevronRight, Play, Video, Share2, Facebook, Twitter, Linkedin, Copy } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
// import { secureApi } from '@/lib/secureApi'; // REMOVED
import { fetchAPI, endpoints } from '@/lib/strapi';
import { mapArticleToNews } from '@/utils/strapiMapper';
import { toast } from 'react-hot-toast';

import ImageSlideshow from '@/components/ImageSlideshow';
import VideoPlayer from '@/components/communication/VideoPlayer';

export default function ActualiteDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [actualite, setActualite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [navigation, setNavigation] = useState({
    previous: null,
    next: null
  });
  const [showSlideshow, setShowSlideshow] = useState(false);

  // Analytics removed





  useEffect(() => {
    const fetchActualite = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Strapi Logic
        let strapiArticle;

        // Détection slug vs id (Strapi IDs sont numériques ou UIDs)
        // Mais notre mapper convertit Strapi ID -> _id.
        // Si ancien ID mongo (24 chars hex), ça ne marchera pas direct dans Strapi sans migration d'ID.
        // MAIS l'importation a créé des nouveaux IDs Strapi (1, 2, 3...).
        // LE PROBLEME: Les URLs partagées utilisent peut-être des Slugs. Le slug est conservé.
        // Donc la recherche par Slug est la plus fiable.

        // Stratégie de détection de l'identifiant dans l'URL :
        //  - slug humain    : "mon-article-2024"    → isNaN=true, contient tirets
        //  - documentId S5  : "abc123def456ghi789"  → isNaN=true, 20+ chars alphanum sans tirets
        //  - ID numérique   : "10"                  → isNaN=false
        const isNumericId = !isNaN(id);
        const isDocumentId = !isNumericId && /^[a-z0-9]{20,}$/i.test(id) && !id.includes('-');
        const isSlug = !isNumericId && !isDocumentId;

        if (isSlug) {
          // Cas le plus courant après la migration — le mapper renvoie maintenant le slug comme _id
          const response = await fetchAPI(endpoints.articles, {
            filters: { slug: id },
            populate: ['cover', 'videos']
          });
          if (response.data && response.data.length > 0) {
            strapiArticle = response.data[0];
          }
        } else if (isDocumentId) {
          // Strapi 5 documentId — fetch direct par chemin
          try {
            const response = await fetchAPI(`${endpoints.articles}/${id}`, {
              populate: ['cover', 'videos']
            });
            strapiArticle = response.data;
          } catch (_) { /* introuvable */ }
        } else {
          // ID numérique — tentative directe puis fallback slug
          try {
            const response = await fetchAPI(`${endpoints.articles}/${id}`, {
              populate: ['cover', 'videos']
            });
            strapiArticle = response.data;
          } catch (e) {
            try {
              const fallback = await fetchAPI(endpoints.articles, {
                filters: { slug: id },
                populate: ['cover', 'videos']
              });
              if (fallback.data && fallback.data.length > 0) {
                strapiArticle = fallback.data[0];
              }
            } catch (_) { /* introuvable */ }
          }
        }

        if (strapiArticle) {
          const news = mapArticleToNews(strapiArticle);
          setActualite(news);
          // Navigation temporairement désactivée
          setNavigation({ previous: null, next: null });
        } else {
          throw new Error('Article non trouvé');
        }
      } catch (error) {
        console.error('Erreur:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActualite();
  }, [id]);

  // États pour le partage social
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Fonction de partage social
  const handleShare = async (platform) => {
    const url = `${window.location.origin}/actualites/${actualite.slug || actualite._id}`;
    const title = actualite.title;
    const text = actualite.summary || actualite.metaDescription || '';

    try {
      switch (platform) {
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
          break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
          break;
        case 'linkedin':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
          break;
        case 'copy':
          await navigator.clipboard.writeText(url);
          toast.success('Lien copié dans le presse-papiers');
          break;
        default:
          if (navigator.share) {
            await navigator.share({ title, text, url });
          }
      }

      // Tracking removed

      setShowShareMenu(false);
    } catch (error) {
      console.error('Erreur partage:', error);
      if (platform === 'copy') {
        toast.error('Erreur lors de la copie du lien');
      }
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="h-64 bg-gray-200 rounded mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !actualite) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">
              {error || 'Actualité non trouvée'}
            </h1>
            <Link
              href="/actualites"
              className="text-blue-600 hover:text-blue-800 flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux actualités
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Head>
        <title>{actualite.metaTitle || actualite.title} | MESRIT</title>
        <meta name="description" content={actualite.metaDescription || actualite.summary || ''} />
        <meta property="og:locale" content="fr_FR" />
        {actualite.status === 'draft' && (
          <meta name="robots" content="noindex, nofollow" />
        )}

        {/* Open Graph */}
        <meta property="og:title" content={actualite.metaTitle || actualite.title} />
        <meta property="og:description" content={actualite.metaDescription || actualite.summary || ''} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://mesri.ne'}/actualites/${actualite.slug || actualite._id}`} />
        {actualite.image && <meta property="og:image" content={actualite.image} />}
        <meta property="og:site_name" content="MESRI Niger" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={actualite.metaTitle || actualite.title} />
        <meta name="twitter:description" content={actualite.metaDescription || actualite.summary || ''} />
        {actualite.image && <meta name="twitter:image" content={actualite.image} />}

        {/* Article meta */}
        <meta property="article:published_time" content={(actualite.publishedAt || actualite.createdAt)} />
        <meta property="article:modified_time" content={actualite.updatedAt} />
        <meta property="article:section" content={actualite.category} />
        {actualite.tags && actualite.tags.map((tag, index) => (
          <meta key={index} property="article:tag" content={tag} />
        ))}

        {/* Canonical URL */}
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://mesri.ne'}/actualites/${actualite.slug || actualite._id}`} />
        {navigation?.previous?.slug && (
          <link rel="prev" href={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://mesri.ne'}/actualites/${navigation.previous.slug}`} />
        )}
        {navigation?.next?.slug && (
          <link rel="next" href={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://mesri.ne'}/actualites/${navigation.next.slug}`} />
        )}

        {/* Données structurées */}
        {actualite && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "NewsArticle",
                "headline": actualite.title,
                "description": actualite.metaDescription || actualite.summary,
                "datePublished": (actualite.publishedAt || actualite.createdAt),
                "dateModified": actualite.updatedAt,
                "author": {
                  "@type": "Organization",
                  "name": "Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation du Niger"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "MESRI Niger",
                  "logo": {
                    "@type": "ImageObject",
                    "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://mesri.ne'}/images/logo-mesri.png`
                  }
                },
                ...(actualite.image && {
                  "image": {
                    "@type": "ImageObject",
                    "url": actualite.image.startsWith('http') ? actualite.image : `${process.env.NEXT_PUBLIC_BASE_URL || 'https://mesri.ne'}${actualite.image}`
                  }
                }),
                "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://mesri.ne'}/actualites/${actualite.slug || actualite._id}`,
                ...(actualite.category && { "articleSection": actualite.category }),
                ...(actualite.tags && actualite.tags.length > 0 && { "keywords": actualite.tags.join(', ') })
              })
            }}
          />
        )}
      </Head>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-niger-orange via-niger-orange-dark to-niger-green text-white py-20 overflow-hidden">
        {/* Image de couverture en arrière-plan */}
        {actualite.image && (
          <Image
            src={actualite.image}
            alt={actualite.title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        )}
        {/* Overlay dégradé renforcé si image présente */}
        <div className={`absolute inset-0 ${actualite.image ? 'bg-gradient-to-br from-niger-orange/80 via-niger-orange-dark/85 to-niger-green/80' : 'bg-gradient-to-br from-niger-orange via-niger-orange-dark to-niger-green'}`} />
        <div className="absolute inset-0 bg-niger-white/[0.05] bg-[size:20px_20px] opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="container mx-auto px-6 relative">
          <div className="flex items-center text-sm mb-4">
            <Link href="/" className="hover:text-niger-cream transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href="/actualites" className="hover:text-niger-cream transition-colors">
              Actualités
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-niger-cream font-medium">Article</span>
          </div>

          <div className="max-w-4xl">
            <div className="flex items-center mb-6">
              <Calendar className="w-12 h-12 mr-4 text-niger-cream" />
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold leading-tight">{actualite.title}</h1>
                <div className="flex items-center text-niger-cream/80 mt-4 flex-wrap gap-2">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <time dateTime={actualite.date}>
                      {new Date(actualite.date).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                  </div>
                  {actualite.category && (
                    <>
                      <span className="w-1.5 h-1.5 bg-niger-cream/60 rounded-full"></span>
                      <span className="bg-niger-white/20 backdrop-blur-sm text-niger-cream px-3 py-1 rounded-full text-sm border border-niger-white/20">
                        {actualite.category}
                      </span>
                    </>
                  )}

                  {/* Badge vidéo disponible */}
                  {actualite.mainVideo && (
                    <>
                      <span className="w-1.5 h-1.5 bg-niger-cream/60 rounded-full"></span>
                      <a
                        href="#media-principal"
                        className="inline-flex items-center gap-1.5 bg-black/30 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm border border-white/20 hover:bg-black/50 transition-colors"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        Vidéo disponible
                      </a>
                    </>
                  )}

                  {/* Bouton de partage */}
                  <div className="relative ml-auto">
                    <button
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="flex items-center space-x-2 bg-niger-white/20 hover:bg-niger-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl transition-all duration-300 border border-niger-white/20"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Partager</span>
                    </button>

                    {showShareMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-secondary-700 rounded-lg shadow-lg border border-gray-200 dark:border-secondary-600 z-10">
                        <div className="py-2">
                          <button
                            onClick={() => handleShare('facebook')}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-600"
                          >
                            <Facebook className="w-4 h-4 mr-3 text-blue-600" />
                            Facebook
                          </button>
                          <button
                            onClick={() => handleShare('twitter')}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-600"
                          >
                            <Twitter className="w-4 h-4 mr-3 text-blue-400" />
                            Twitter
                          </button>
                          <button
                            onClick={() => handleShare('linkedin')}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-600"
                          >
                            <Linkedin className="w-4 h-4 mr-3 text-blue-700" />
                            LinkedIn
                          </button>
                          <button
                            onClick={() => handleShare('copy')}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-600"
                          >
                            <Copy className="w-4 h-4 mr-3 text-gray-500" />
                            Copier le lien
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Retour aux actualités */}
            <Link
              href="/actualites"
              className="inline-flex items-center bg-niger-white/20 hover:bg-niger-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl transition-all duration-300 border border-niger-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux actualités
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="bg-gradient-to-b from-niger-cream to-white dark:from-secondary-900 dark:to-secondary-800 shadow-2xl relative -mt-12 rounded-2xl mx-auto container px-6 transition-colors duration-300">
        <div className="p-8">
          <article className="max-w-4xl mx-auto">



            {/* Média principal (vidéo ou image) */}
            <div className="mb-8" id="media-principal">
              <div className="aspect-video relative rounded-2xl overflow-hidden shadow-xl border border-niger-orange/10">
                {actualite.mainVideo ? (
                  <VideoPlayer
                    src={actualite.mainVideo}
                    poster={actualite.videos?.find(v => v.isMain)?.thumbnail || actualite.image}
                    title={actualite.title}
                    newsId={actualite._id}
                    className="w-full h-full"
                    controls={true}
                    autoPlay={false}
                  />
                ) : actualite.image ? (
                  <Image
                    src={actualite.image || '/images/news-placeholder.jpg'}
                    alt={actualite.title}
                    fill
                    sizes="100vw"
                    priority
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 dark:bg-secondary-700 flex items-center justify-center">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <ImageIcon className="w-16 h-16 mx-auto mb-4" />
                      <p>Aucun média disponible</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {actualite.images && actualite.images.length > 0 && (
              <div className="mt-8 mb-12">
                <button
                  onClick={() => setShowSlideshow(true)}
                  className="w-full group relative overflow-hidden rounded-xl border bg-gray-50 hover:bg-gray-100"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-4">
                    {actualite.images.slice(0, 4).map((img, index) => (
                      <div
                        key={index}
                        className={`relative aspect-video ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                          }`}
                      >
                        <Image
                          src={img.url}
                          alt={img.description || ''}
                          fill
                          className="object-cover rounded-lg"
                        />
                        {index === 3 && actualite.images.length > 4 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                            <span className="text-white text-xl font-medium">
                              +{actualite.images.length - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="text-center py-4 text-gray-600 flex items-center justify-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    <span>Voir toutes les photos ({actualite.images.length})</span>
                  </div>
                </button>

                {showSlideshow && (
                  <ImageSlideshow
                    images={actualite.images}
                    onClose={() => setShowSlideshow(false)}
                  />
                )}
              </div>
            )}

            {/* Vidéos supplémentaires */}
            {actualite.videos && actualite.videos.filter(v => !v.isMain).length > 0 && (
              <div className="mt-8 mb-12">
                <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg p-6 border border-niger-orange/10">
                  <div className="flex items-center gap-2 mb-6">
                    <Video className="w-5 h-5 text-niger-orange" />
                    <h3 className="text-lg font-semibold text-niger-green dark:text-niger-green-light">
                      Vidéos supplémentaires ({actualite.videos.filter(v => !v.isMain).length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {actualite.videos.filter(v => !v.isMain).map((video, index) => (
                      <div key={index} className="space-y-3">
                        <div className="aspect-video rounded-lg overflow-hidden">
                          <VideoPlayer
                            src={video.url}
                            poster={video.thumbnail}
                            title={video.title}
                            newsId={actualite._id}
                            className="w-full h-full"
                            controls={true}
                            autoPlay={false}
                          />
                        </div>
                        {(video.title || video.description) && (
                          <div className="space-y-1">
                            {video.title && (
                              <h4 className="font-medium text-niger-green dark:text-niger-green-light">
                                {video.title}
                              </h4>
                            )}
                            {video.description && (
                              <p className="text-sm text-readable-muted dark:text-muted-foreground">
                                {video.description}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Contenu */}
            <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg p-8 border border-niger-orange/10 mb-8">
              {actualite.summary && (
                <p className="text-xl text-readable dark:text-foreground mb-8 leading-relaxed first-letter:text-5xl first-letter:font-bold first-letter:text-niger-orange first-letter:mr-3 first-letter:float-left">
                  {actualite.summary}
                </p>
              )}
              <div className="prose prose-lg max-w-none text-readable dark:text-foreground leading-relaxed space-y-6">
                {actualite.content}
              </div>
            </div>





            {/* Tags */}
            {actualite.tags && actualite.tags.length > 0 && (
              <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg p-6 border border-niger-orange/10 mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-5 h-5 text-niger-orange" />
                  <h3 className="text-lg font-semibold text-niger-green dark:text-niger-green-light">Mots-clés</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {actualite.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-niger-cream dark:bg-secondary-700 text-niger-green dark:text-niger-green-light px-4 py-2 rounded-xl text-sm font-medium border border-niger-orange/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation entre articles */}
            <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg p-6 border border-niger-orange/10 flex justify-between items-start gap-4">
              {navigation.previous && (
                <Link
                  href={`/actualites/${navigation.previous._id}`}
                  className="flex items-start group max-w-[45%] p-4 rounded-xl hover:bg-niger-orange/10 dark:hover:bg-niger-orange/20 transition-all duration-300"
                >
                  <ArrowLeft className="mr-3 w-5 h-5 mt-1 flex-shrink-0 text-niger-orange" />
                  <div>
                    <div className="text-sm text-readable-muted dark:text-muted-foreground mb-1">Article précédent</div>
                    <div className="font-medium group-hover:text-niger-orange text-left text-niger-green dark:text-niger-green-light">
                      {navigation.previous.title}
                    </div>
                  </div>
                </Link>
              )}

              {navigation.next && (
                <Link
                  href={`/actualites/${navigation.next._id}`}
                  className="flex items-start text-right group ml-auto max-w-[45%] p-4 rounded-xl hover:bg-niger-orange/10 dark:hover:bg-niger-orange/20 transition-all duration-300"
                >
                  <div>
                    <div className="text-sm text-readable-muted dark:text-muted-foreground mb-1">Article suivant</div>
                    <div className="font-medium group-hover:text-niger-orange text-right text-niger-green dark:text-niger-green-light">
                      {navigation.next.title}
                    </div>
                  </div>
                  <ArrowRight className="ml-3 w-5 h-5 mt-1 flex-shrink-0 text-niger-orange" />
                </Link>
              )}
            </div>
          </article>
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
