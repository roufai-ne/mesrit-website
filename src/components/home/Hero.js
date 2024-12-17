// src/components/home/Hero.js
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const navigate = (direction) => {
    setCurrentSlide((prev) => {
      if (direction === 'next') {
        return (prev + 1) % slides.length;
      }
      return (prev - 1 + slides.length) % slides.length;
    });
  };

  return (
    <div className="relative h-[600px] overflow-hidden bg-gray-900">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-transform duration-700 ease-in-out ${
            index === currentSlide 
              ? 'translate-x-0 opacity-100' 
              : index < currentSlide 
                ? '-translate-x-full opacity-0' 
                : 'translate-x-full opacity-0'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-black/50" />
          
          <div className="relative h-full container mx-auto px-6 flex items-center">
            <div className="max-w-3xl text-white space-y-6">
              <h1 className="text-5xl font-bold leading-tight animate-fade-down">
                {slide.title}
              </h1>
              <p className="text-xl text-gray-200 animate-fade-up">
                {slide.subtitle}
              </p>
              <button className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors animate-fade-up">
                {slide.cta}
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation */}
      <button
        onClick={() => navigate('prev')}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all group"
      >
        <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
      </button>
      
      <button
        onClick={() => navigate('next')}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all group"
      >
        <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-3">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`transition-all duration-300 ${
              idx === currentSlide
                ? 'w-12 h-1.5 bg-blue-600'
                : 'w-2.5 h-1.5 bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}