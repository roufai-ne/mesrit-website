import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef(null);
  const slideDuration = 7000; // 7 secondes par slide
  
  const slides = [
    {
      id: 1,
      title: "Ministère de l'Enseignement Supérieur",
      subtitle: "Au service de l'excellence académique et de l'innovation",
      image: "/images/hero/slide1.jpg",
      cta: "Découvrir nos programmes"
    },
    {
      id: 2,
      title: "Formation & Recherche",
      subtitle: "Un environnement propice à l'épanouissement intellectuel",
      image: "/images/hero/slide2.jpg",
      cta: "Nos formations"
    },
    {
      id: 3,
      title: "Innovation Technologique",
      subtitle: "Construire l'avenir de l'enseignement supérieur",
      image: "/images/hero/slide3.png",
      cta: "Nos projets"
    }
  ];

  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      handleSlideChange('next');
    }, slideDuration);
  };

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleSlideChange = (direction) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    resetTimer();
    
    setCurrentSlide((prev) => {
      if (direction === 'next') {
        return (prev + 1) % slides.length;
      }
      return (prev - 1 + slides.length) % slides.length;
    });

    setTimeout(() => {
      setIsTransitioning(false);
    }, 1000);
  };

  return (
    <div className="relative min-h-[300px] md:h-[500px] bg-gradient-to-b from-blue-900 to-blue-800">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-[1200ms] ease-in-out ${
            index === currentSlide 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-105'
          }`}
        >
          {/* Image background */}
          <div className="absolute inset-0">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className={`absolute inset-0 w-full h-full object-cover object-center opacity-60 transition-transform duration-[8000ms] ${
                index === currentSlide ? 'scale-105' : 'scale-100'
              }`}
              priority={index === 0} // Priorité pour le premier slide
            />
          </div>

          {/* Content */}
          <div className="relative h-full container mx-auto px-6">
            <div className="h-full flex flex-col justify-center max-w-2xl">
              <span className={`
                inline-flex items-center px-3 py-1 rounded-full
                bg-blue-800/70 backdrop-blur-sm text-white/90 text-sm mb-4
                transform transition-all duration-700 delay-300
                ${index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
              `}>
                {`${String(index + 1).padStart(2, '0')} / ${slides.length.toString().padStart(2, '0')}`}
              </span>

              <h1 className={`
                text-3xl md:text-4xl font-bold text-white leading-tight mb-4
                transform transition-all duration-700 delay-500
                ${index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
              `}>
                {slide.title}
              </h1>

              <p className={`
                text-base md:text-lg text-gray-100 mb-6
                transform transition-all duration-700 delay-700
                ${index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
              `}>
                {slide.subtitle}
              </p>

              <div className={`
                transform transition-all duration-700 delay-1000
                ${index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
              `}>
                <button className="
                  inline-flex items-center px-6 py-3 bg-white text-blue-900 
                  rounded-lg hover:bg-blue-50 transition-all group
                  font-medium
                ">
                  {slide.cta}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation */}
      <div className="absolute bottom-6 right-6 flex items-center gap-2">
        <button
          onClick={() => handleSlideChange('prev')}
          disabled={isTransitioning}
          className="p-2 rounded-lg bg-white/10 backdrop-blur-sm text-white 
                   hover:bg-white hover:text-blue-900 transition-all group"
          aria-label="Slide précédent"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        </button>
        
        <button
          onClick={() => handleSlideChange('next')}
          disabled={isTransitioning}
          className="p-2 rounded-lg bg-white/10 backdrop-blur-sm text-white 
                   hover:bg-white hover:text-blue-900 transition-all group"
          aria-label="Slide suivant"
        >
          <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div 
          className="h-full bg-white origin-left"
          style={{
            width: `${((currentSlide + 1) / slides.length) * 100}%`,
            transition: `width ${slideDuration}ms linear`
          }}
        />
      </div>
    </div>
  );
}