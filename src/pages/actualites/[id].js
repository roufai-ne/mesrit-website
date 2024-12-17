// src/pages/actualites/[id].js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import { Calendar, ArrowLeft, Tag } from 'lucide-react';
import Link from 'next/link';

export default function ActualiteDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [actualite, setActualite] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchActualite();
    }
  }, [id]);

  const fetchActualite = async () => {
    try {
      const response = await fetch(`/api/news/${id}`);
      if (response.ok) {
        const data = await response.json();
        setActualite(data);
      } else {
        console.error('Actualité non trouvée');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
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

  if (!actualite) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Actualité non trouvée</h1>
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
      <div className="container mx-auto px-4 py-8">
        <article className="max-w-3xl mx-auto">
          {/* Retour et navigation */}
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
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(actualite.date).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
              {actualite.category && (
                <>
                  <span className="mx-2">•</span>
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
              <img
                src={actualite.image}
                alt={actualite.title}
                className="w-full h-[400px] object-cover rounded-lg"
              />
            </div>
          )}

          {/* Contenu */}
          <div className="prose max-w-none mb-8">
            {actualite.content}
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
        </article>
      </div>
    </MainLayout>
  );
}