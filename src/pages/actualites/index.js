// src/pages/actualites/index.js
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Calendar, ArrowRight, Tag } from 'lucide-react';
import Link from 'next/link';

export default function Actualites() {
  // État pour stocker les actualités
  const [actualites, setActualites] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Simuler la récupération des données (à remplacer par un appel API réel)
  useEffect(() => {
    const fetchActualites = async () => {
      try {
        const response = await fetch('/api/news');
        if (response.ok) {
          const data = await response.json();
          // Ne filtrer que les actualités publiées
          setActualites(data.filter(actu => actu.status === 'published'));
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    };
  
    fetchActualites();
  }, []);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = actualites.slice(indexOfFirstItem, indexOfLastItem);
  const pageCount = Math.ceil(actualites.length / itemsPerPage);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-3xl font-bold mb-8">Actualités</h1>

        {currentItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Aucune actualité disponible pour le moment.
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              {currentItems.map((actu) => (
                <article key={actu.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <img 
                    src={actu.image}
                    alt={actu.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Calendar className="w-4 h-4 mr-2" />
                      {actu.date}
                      <span className="mx-2">•</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {actu.category}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold mb-2">{actu.title}</h2>
                    <p className="text-gray-600 mb-4">
                      {actu.content.substring(0, 150)}...
                    </p>
                    {actu.tags && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {actu.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <Link 
                      href={`/actualites/${actu.id}`}
                      className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                    >
                      Lire la suite
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {pageCount > 1 && (
              <div className="flex justify-center space-x-2">
                {Array.from({ length: pageCount }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === index + 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}