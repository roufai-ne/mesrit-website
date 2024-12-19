import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, Share2, Calendar, Printer, ChevronLeft, ChevronRight, NewspaperIcon  } from 'lucide-react';

const HomeNewsCarousel = ({ news }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);

  // Auto rotation pour le carrousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % 5);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const openModal = (article) => {
    setSelectedNews(article);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedNews(null);
  };

  const handlePrevious = () => {
    const currentIndex = news.findIndex(article => article._id === selectedNews._id);
    const newIndex = (currentIndex - 1 + news.length) % news.length;
    setSelectedNews(news[newIndex]);
  };

  const handleNext = () => {
    const currentIndex = news.findIndex(article => article._id === selectedNews._id);
    const newIndex = (currentIndex + 1) % news.length;
    setSelectedNews(news[newIndex]);
  };

  return (
    <div className="space-y-4">
      {/* Section Carrousel Principal */}
      {/* Main Carousel Section */}
<div className="space-y-8">
  {/* Image Principale */}
  <div className="relative h-[500px] rounded-xl overflow-hidden shadow-xl">
    <img
      src={news[activeIndex]?.image}
      alt={news[activeIndex]?.title}
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
        <button
          onClick={() => openModal(news[activeIndex])}
          className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 font-medium shadow-lg"
        >
          Lire la suite
        </button>
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
            <img
              src={article.image}
              alt={article.title}
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
      

{/* Fenêtre Modale */}
{showModal && (
  <Dialog open={showModal} onOpenChange={closeModal}>
    <DialogContent className="p-0 bg-white shadow-2xl max-w-7xl mx-auto">
      <div className="flex h-[90vh] relative">
        {/* Zone de Contenu Principal */}
        <div className="flex-1 overflow-y-auto bg-white relative">
          {selectedNews && (
            <>
              {/* En-tête Fixe */}
              <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
                <div className="flex justify-between items-center px-6 py-4 border-b bg-white">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handlePrevious}
                      className="group p-2 hover:bg-blue-50 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="group p-2 hover:bg-blue-50 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => window.print()}
                      className="group p-2 hover:bg-blue-50 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      title="Imprimer l'article"
                    >
                      <Printer className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        // Vous pouvez ajouter une notification de succès ici
                      }}
                      className="group p-2 hover:bg-blue-50 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      title="Partager l'article"
                    >
                      <Share2 className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                    </button>
                    <div className="w-px h-6 bg-gray-200 mx-2"></div>
                    <button
                      onClick={closeModal}
                      className="group p-2 hover:bg-red-50 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      title="Fermer"
                    >
                      <X className="w-6 h-6 text-gray-600 group-hover:text-red-600 transition-colors" />
                    </button>
                  </div>
                </div>

                <div className="px-8 py-6 bg-white border-b">
                  <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <time>
                          {new Date(selectedNews.date).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </time>
                      </div>
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                      <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium tracking-wide uppercase">
                        {selectedNews.category}
                      </span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                      {selectedNews.title}
                    </h1>
                  </div>
                </div>
              </div>

              {/* Corps de l'Article */}
              <div className="p-8 bg-white min-h-full">
                <div className="max-w-4xl mx-auto">
                  <div className="relative mb-8 group">
                    <img
                      src={selectedNews.image}
                      alt={selectedNews.title}
                      className="w-full aspect-video object-cover rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/10"></div>
                  </div>
                  
                  <div className="prose prose-lg max-w-none">
                    <p className="text-xl text-gray-600 mb-8 leading-relaxed first-letter:text-5xl first-letter:font-bold first-letter:text-blue-600 first-letter:mr-3 first-letter:float-left">
                      {selectedNews.summary}
                    </p>
                    <div className="text-gray-800 leading-relaxed space-y-6">
                      {selectedNews.content}
                    </div>
                  </div>

                  {selectedNews.tags && selectedNews.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t">
                      {selectedNews.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Barre Latérale */}
        <div className="w-72 border-l bg-gray-50/80 backdrop-blur-sm overflow-y-auto">
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-6 flex items-center">
              <NewspaperIcon className="w-5 h-5 mr-2 text-blue-600" />
              Autres actualités
            </h3>
            <div className="space-y-4">
              {news.map((item) => (
                <button
                  key={item._id}
                  onClick={() => setSelectedNews(item)}
                  className={`w-full text-left p-4 rounded-lg transition-all duration-300 hover:bg-white hover:shadow-md ${
                    item._id === selectedNews._id 
                      ? 'bg-white shadow-md ring-2 ring-blue-500'
                      : 'hover:ring-1 hover:ring-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-medium text-gray-500">
                      {new Date(item.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </span>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-sm font-medium line-clamp-2 text-gray-900">
                    {item.title}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
)}

      {/* Section Articles Supplémentaires */}
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        {news.slice(5, 8).map((item) => (
          <article
            key={item._id}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
          >
            <div className="relative h-48">
              <img
                src={item.image}
                alt={item.title}
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
              <button
                onClick={() => openModal(item)}
                className="text-blue-600 text-sm font-medium hover:text-blue-800"
              >
                Lire la suite
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default HomeNewsCarousel;