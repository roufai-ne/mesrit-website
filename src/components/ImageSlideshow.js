// components/ImageSlideshow.js
import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import Image from 'next/image';

export default function ImageSlideshow({ images, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const autoPlayIntervalRef = useRef(null);
  const progressIntervalRef = useRef(null);

  const SLIDE_DURATION = 5000; // 5 secondes par slide
  const PROGRESS_UPDATE_INTERVAL = 50; // Mise à jour de la barre toutes les 50ms

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, []);

  const startAutoPlay = () => {
    if (!isAutoPlaying) return;
    
    // Démarrer le défilement automatique
    autoPlayIntervalRef.current = setInterval(() => {
      handleNext();
    }, SLIDE_DURATION);

    // Démarrer la barre de progression
    let timeElapsed = 0;
    progressIntervalRef.current = setInterval(() => {
      timeElapsed += PROGRESS_UPDATE_INTERVAL;
      setProgress((timeElapsed / SLIDE_DURATION) * 100);
      if (timeElapsed >= SLIDE_DURATION) {
        timeElapsed = 0;
      }
    }, PROGRESS_UPDATE_INTERVAL);
  };

  const stopAutoPlay = () => {
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current);
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    setProgress(0);
  };

  const toggleAutoPlay = () => {
    if (isAutoPlaying) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
    setIsAutoPlaying(!isAutoPlaying);
  };

  // Mettre à jour le comportement des boutons existants
  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setTimeout(() => setIsTransitioning(false), 300);
    
    // Réinitialiser l'autoplay
    stopAutoPlay();
    startAutoPlay();
  };

  const handlePrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setTimeout(() => setIsTransitioning(false), 300);
    
    // Réinitialiser l'autoplay
    stopAutoPlay();
    startAutoPlay();
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50">
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Bouton fermeture */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
        >
          <X className="w-8 h-8" />
        </button>
   
        {/* Navigation */}
        {images.length > 1 && (
          <>
            <button 
              onClick={handlePrevious}
              className="absolute left-4 text-white hover:text-gray-300 transition-colors"
              disabled={isTransitioning}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-4 text-white hover:text-gray-300 transition-colors"
              disabled={isTransitioning}
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </>
        )}
   
        {/* Contenu principal */}
        <div className="relative w-full max-w-6xl mx-auto">
          <div
            className={`aspect-video transition-opacity duration-300 ${
              isTransitioning ? 'opacity-0' : 'opacity-100'
            }`}
          >
            
            <Image
              src={images[currentIndex].url}
              alt={images[currentIndex].description}
              fill
              className="object-contain"
            />
          
            {/* Description de l'image */}
            {images[currentIndex].description && (
              <div className="absolute bottom-16 left-0 right-0 px-4">
                <p className="bg-black/75 text-white p-4 rounded-lg text-center max-w-2xl mx-auto">
                  {images[currentIndex].description}
                </p>
              </div>
            )}
          </div>
   
          {/* Indicateurs de slides */}
          <div className="absolute -bottom-12 left-0 right-0 flex justify-center items-center gap-4">
            {/* Compteur de slides */}
            <span className="text-white text-sm">
              {currentIndex + 1} / {images.length}
            </span>
   
            {/* Points de navigation */}
            <div className="flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (!isTransitioning) {
                      setIsTransitioning(true);
                      setCurrentIndex(index);
                      setTimeout(() => setIsTransitioning(false), 300);
                      // Réinitialiser l'autoplay
                      stopAutoPlay();
                      startAutoPlay();
                    }
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex 
                      ? 'bg-white w-4' 
                      : 'bg-gray-500 hover:bg-gray-300'
                  }`}
                  aria-label={`Image ${index + 1}`}
                />
              ))}
            </div>
   
            {/* Contrôle lecture automatique */}
            <button
              onClick={toggleAutoPlay}
              className="text-white hover:text-gray-300 transition-colors bg-black/50 p-2 rounded-full"
            >
              {isAutoPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
   
        {/* Barre de progression */}
        {isAutoPlaying && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
            <div 
              className="h-full bg-white transition-all duration-50"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
   );
}