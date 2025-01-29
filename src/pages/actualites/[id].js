import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import { Calendar, ArrowLeft, ArrowRight, Tag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';

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

  useEffect(() => {
    const fetchActualite = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/news/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Actualité non trouvée');
        }

        if (data.news) {
          setActualite(data.news);
          setNavigation(data.navigation);
        } else {
          throw new Error('Format de données invalide');
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
        <title>{actualite.title} | MESRIT</title>
        <meta name="description" content={actualite.summary} />
        <meta property="og:title" content={actualite.title} />
        <meta property="og:image" content={actualite.image} />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <article className="max-w-3xl mx-auto">
          {/* Retour aux actualités */}
          <Link 
            href="/actualites"
            className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux actualités
          </Link>

          {/* En-tête */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{actualite.title}</h1>
            <div className="flex items-center text-gray-600 flex-wrap gap-2">
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
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {actualite.category}
                  </span>
                </>
              )}
            </div>
          </header>

          {/* Image principale */}
          {actualite.image && (
            <div className="mb-8">
              <div className="aspect-video relative rounded-lg overflow-hidden">
              <Image
                src={actualite.image || '/images/placeholder.jpg'}
                alt={actualite.title}
                fill
                sizes="100vw"
                priority
                className="object-cover"
              />
              </div>
            </div>
          )}

          {/* Contenu */}
          <div className="prose prose-lg max-w-none mb-8">
            {actualite.summary && (
              <p className="text-xl text-gray-600 mb-8 leading-relaxed first-letter:text-5xl first-letter:font-bold first-letter:text-blue-600 first-letter:mr-3 first-letter:float-left">
                {actualite.summary}
              </p>
            )}
            <div className="text-gray-800 leading-relaxed space-y-6">
              {actualite.content}
            </div>
          </div>

          {/* Tags */}
          {actualite.tags && actualite.tags.length > 0 && (
            <div className="flex items-center gap-2 mt-8 pt-4 border-t">
              <Tag className="w-4 h-4 text-gray-500" />
              <div className="flex flex-wrap gap-2">
                {actualite.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Navigation entre articles */}
          <div className="border-t mt-12 pt-8 flex justify-between items-start gap-4">
            {navigation.previous && (
              <Link 
                href={`/actualites/${navigation.previous._id}`}
                className="flex items-start group max-w-[45%]"
              >
                <ArrowLeft className="mr-2 w-4 h-4 mt-1 flex-shrink-0" />
                <div>
                  <div className="text-sm text-gray-500">Article précédent</div>
                  <div className="font-medium group-hover:text-blue-600 text-left">
                    {navigation.previous.title}
                  </div>
                </div>
              </Link>
            )}
            
            {navigation.next && (
              <Link 
                href={`/actualites/${navigation.next._id}`}
                className="flex items-start text-right group ml-auto max-w-[45%]"
              >
                <div>
                  <div className="text-sm text-gray-500">Article suivant</div>
                  <div className="font-medium group-hover:text-blue-600 text-right">
                    {navigation.next.title}
                  </div>
                </div>
                <ArrowRight className="ml-2 w-4 h-4 mt-1 flex-shrink-0" />
              </Link>
            )}
          </div>
        </article>
      </div>
    </MainLayout>
  );
}