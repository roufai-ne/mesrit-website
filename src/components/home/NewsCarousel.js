import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import Image from 'next/image';

const HomeNewsCarousel = ({ news }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto rotation pour le carrousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % 5);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {/* Section Carrousel Principal */}
      <div className="space-y-8">
        {/* Image Principale */}
        <div className="relative h-[500px] rounded-xl overflow-hidden shadow-xl">
          <Image
            src={news[activeIndex]?.image}
            alt={news[activeIndex]?.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            className="w-full h-full object-cover transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Badge Catégorie */}
          <div className="absolute top-6 left-6">
            <span className="inline-block px-3 py-1 text-sm bg-blue-600 text-white rounded-full font-medium shadow-lg">
              {news[activeIndex]?.category}
            </span>
          </div>
          
          {/* Contenu */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-4xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
                {news[activeIndex]?.title}
              </h2>
              <p className="text-white/90 text-lg line-clamp-2 mb-6 max-w-3xl drop-shadow">
                {news[activeIndex]?.summary}
              </p>
              <Link
                href={`/actualites/${news[activeIndex]?._id}`}
                className="inline-block px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 font-medium shadow-lg"
              >
                Lire la suite
              </Link>
            </div>
          </div>
        </div>

        {/* Vignettes Séparées */}
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="grid grid-cols-5 gap-4 max-w-6xl mx-auto">
            {news.slice(0, 5).map((article, index) => (
              <div
                key={article._id}
                onClick={() => setActiveIndex(index)}
                className={`group cursor-pointer rounded-lg overflow-hidden transform transition-all duration-300 ${
                  index === activeIndex 
                    ? 'ring-2 ring-blue-600 scale-[1.02]' 
                    : 'hover:scale-105'
                }`}
              >
                {/* Vignette Image */}
                <div className="relative aspect-video">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
                    index === activeIndex ? 'opacity-0' : 'group-hover:opacity-0'
                  }`} />
                </div>
                
                {/* Titre de la vignette */}
                <div className="p-3 bg-white border-t">
                  <p className={`text-sm font-medium line-clamp-2 transition-colors duration-300 ${
                    index === activeIndex ? 'text-blue-600' : 'text-gray-700 group-hover:text-blue-600'
                  }`}>
                    {article.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section Articles Supplémentaires */}
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        {news.slice(5, 8).map((item) => (
          <article
            key={item._id}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
          >
            <div className="relative h-48">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4">
                <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                  {item.category}
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(item.date).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                {item.summary}
              </p>
              <Link
                href={`/actualites/${item._id}`}
                className="text-blue-600 text-sm font-medium hover:text-blue-800"
              >
                Lire la suite
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default HomeNewsCarousel;