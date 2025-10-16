import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Play, Pause, GraduationCap, Users, BookOpen, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { clsx } from 'clsx';
import { useSettings } from '../../contexts/SettingsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAccessibleIds, useReducedMotion, screenReader, useAccessibleAnnouncement } from '@/lib/accessibility';

// Fallback image for error handling
const FALLBACK_IMAGE = '/images/hero/Slide1.jpg';

export default function Hero() {
  const { settings } = useSettings();
  const { isDark } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [focusedSlide, setFocusedSlide] = useState(null);
  const [imageErrors, setImageErrors] = useState(new Set());
  const timerRef = useRef(null);
  const baseSlideDuration = 6000; // Augmenté à 6s pour une meilleure lisibilité
  
  // Timing intelligent basé sur le contenu
  const getSlideDuration = (slide) => {
    if (!slide) return baseSlideDuration;
    const textLength = (slide.title + (slide.subtitle || '') + (slide.description || '')).length;
    return Math.max(baseSlideDuration, Math.min(textLength * 40, 10000)); // 40ms par caractère, max 10s
  };
  const prefersReducedMotion = useReducedMotion();
  const ids = useAccessibleIds('hero');
  const { announce } = useAccessibleAnnouncement();
  
  // Demo slides if none provided
  const defaultSlides = [
    {
      id: 1,
      title: "Excellence en Enseignement Supérieur",
      subtitle: "Découvrez nos programmes d'excellence et nos initiatives pour l'avenir de l'éducation en Mauritanie.",
      description: "Le Ministère de l'Enseignement Supérieur et de la Recherche Scientifique s'engage à offrir une éducation de qualité mondiale.",
      cta: "Découvrir nos programmes",
      ctaSecondary: "En savoir plus",
      image: "/images/hero/Slide1.jpg",
      category: "Éducation",
      stats: { students: "25,000+", institutions: "15", programs: "120+" }
    },
    {
      id: 2,
      title: "Innovation et Recherche Scientifique",
      subtitle: "Nos centres de recherche mènent des projets innovants pour répondre aux défis contemporains.",
      description: "Explorez nos laboratoires de pointe et découvrez comment nous contribuons au progrès scientifique national et international.",
      cta: "Voir nos recherches",
      ctaSecondary: "Laboratoires",
      image: "/images/hero/Slide2.jpg",
      category: "Recherche",
      stats: { projects: "50+", researchers: "200+", publications: "300+" }
    },
    {
      id: 3,
      title: "Campus Modernes et Équipements",
      subtitle: "Des infrastructures modernes conçues pour offrir le meilleur environnement d'apprentissage.",
      description: "Visitez nos campus dotés d'équipements de dernière génération et d'espaces d'étude collaboratifs.",
      cta: "Visiter les campus",
      ctaSecondary: "Infrastructure",
      image: "/images/hero/Slide3.png",
      category: "Campus",
      stats: { libraries: "12", labs: "45", capacity: "30,000" }
    }
  ];
  
  const slides = settings?.heroSlides?.length > 0 ? settings.heroSlides : defaultSlides;

  // Mapping des CTA vers les vraies actions/liens
  const ctaActions = {
    "Découvrir nos programmes": "/formations",
    "Nos formations": "/formations", 
    "Nos projets": "/recherche",
    "Voir nos recherches": "/recherche",
    "Visiter les campus": "/etablissements",
    "En savoir plus": "/ministere",
    "Laboratoires": "/recherche/laboratoires",
    "Infrastructure": "/etablissements"
  };

  const getCtaLink = (ctaText) => {
    return ctaActions[ctaText] || "/";
  };

  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (isPlaying) {
      const currentSlideDuration = getSlideDuration(slides[currentSlide]);
      timerRef.current = setInterval(() => {
        handleSlideChange('next', true);
      }, currentSlideDuration);
    }
  };

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying]);
  
  // Announce slide changes to screen readers
  useEffect(() => {
    if (slides[currentSlide]) {
      const slide = slides[currentSlide];
      announce(`Diapositive ${currentSlide + 1} sur ${slides.length}: ${slide.title}`);
    }
  }, [currentSlide, announce, slides]);

  const handleSlideChange = (direction, autoPlay = false) => {
    if (isTransitioning || slides.length === 0) return;

    setIsTransitioning(true);
    if (!autoPlay) {
      resetTimer(); // Reset timer on manual navigation
    }

    setCurrentSlide((prev) => {
      if (direction === 'next') {
        return (prev + 1) % slides.length;
      }
      return (prev - 1 + slides.length) % slides.length;
    });

    setTimeout(() => {
      setIsTransitioning(false);
    }, prefersReducedMotion ? 0 : 1000);
  };
  
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    announce(isPlaying ? 'Diaporama mis en pause' : 'Diaporama en cours de lecture');
  };
  
  const goToSlide = (index) => {
    if (index !== currentSlide && !isTransitioning) {
      setCurrentSlide(index);
      setIsTransitioning(true);
      resetTimer();
      setTimeout(() => {
        setIsTransitioning(false);
      }, prefersReducedMotion ? 0 : 1000);
    }
  };
  
  // Handle image load errors
  const handleImageError = (imageSrc) => {
    setImageErrors(prev => new Set([...prev, imageSrc]));
  };
  
  // Get safe image source with fallback
  const getSafeImageSrc = (originalSrc) => {
    return imageErrors.has(originalSrc) ? FALLBACK_IMAGE : originalSrc;
  };
  
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        handleSlideChange('prev');
        break;
      case 'ArrowRight':
        e.preventDefault();
        handleSlideChange('next');
        break;
      case ' ':
        e.preventDefault();
        togglePlayPause();
        break;
      case 'Home':
        e.preventDefault();
        goToSlide(0);
        break;
      case 'End':
        e.preventDefault();
        goToSlide(slides.length - 1);
        break;
    }
  };

  if (slides.length === 0) {
    return (
      <div className="min-h-[400px] bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-700 dark:to-primary-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Contenu en chargement...</h2>
          <p className="text-primary-100">Les informations seront bientôt disponibles.</p>
        </div>
      </div>
    );
  }
  
  const currentSlideData = slides[currentSlide];

  return (
    <section 
      className="relative min-h-[400px] md:min-h-[500px] lg:h-[600px] xl:h-[650px] bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-800 dark:to-primary-950 overflow-hidden"
      role="region"
      aria-label="Carrousel principal"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Background slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={clsx(
            'absolute inset-0 transition-all duration-1000 ease-in-out',
            index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105',
            prefersReducedMotion && 'transition-none'
          )}
          aria-hidden={index !== currentSlide}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70 md:from-black/60 md:via-black/40 md:to-black/60 z-10" />
            {slide.image ? (
              <Image
                src={getSafeImageSrc(slide.image)}
                alt={`Background image for ${slide.title}`}
                fill
                sizes="100vw"
                className={clsx(
                  'object-cover object-center transition-transform duration-3000', // Réduit de 8000ms à 3000ms
                  index === currentSlide && !prefersReducedMotion ? 'scale-105' : 'scale-100'
                )}
                priority={slide.image === "/images/hero/Slide1.jpg" || slide.image === "/images/hero/Slide2.jpg" || slide.image === "/images/hero/Slide3.png" || index === 0}
                onError={() => handleImageError(slide.image)}
                onLoad={() => {
                  // Remove from error set if image loads successfully
                  if (imageErrors.has(slide.image)) {
                    setImageErrors(prev => {
                      const newSet = new Set([...prev]);
                      newSet.delete(slide.image);
                      return newSet;
                    });
                  }
                }}
              />
            ) : (
              // Fallback gradient background when no image is available
              <div className={clsx(
                'absolute inset-0 transition-all duration-3000', // Réduit de 8000ms à 3000ms
                'bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800',
                index === currentSlide && !prefersReducedMotion ? 'scale-105' : 'scale-100'
              )} />
            )}
          </div>
          
          {/* Content */}
          <div className="relative z-20 h-full container mx-auto px-4 lg:px-6">
            <div className="grid lg:grid-cols-12 gap-8 h-full items-center">
              {/* Main Content */}
              <div className="lg:col-span-7 xl:col-span-6">
                <div className="space-y-4 md:space-y-6">
                  {/* Category Badge */}
                  <div className={clsx(
                    'transform transition-all duration-500 delay-200', // Réduit de 700ms à 500ms
                    index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
                    prefersReducedMotion && 'transition-none'
                  )}>
                    <span className={clsx(
                      'inline-flex items-center px-4 py-2 rounded-full backdrop-blur-sm border text-sm font-medium',
                      isDark 
                        ? 'bg-white/10 border-white/20 text-white' 
                        : 'bg-white/90 border-gray-200/80 text-gray-800 shadow-lg'
                    )}>
                      {slide.category}
                      <span className={clsx(
                        'ml-2 text-xs',
                        isDark ? 'opacity-75' : 'opacity-60'
                      )}>
                        {String(index + 1).padStart(2, '0')} / {slides.length.toString().padStart(2, '0')}
                      </span>
                    </span>
                  </div>

                  {/* Title */}
                  <h1 className={clsx(
                    'text-hero-title', // Utilise la nouvelle classe typography
                    'transform transition-all duration-500 delay-300', // Réduit de 700ms à 500ms
                    index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
                    prefersReducedMotion && 'transition-none',
                    isDark ? 'text-white' : 'text-gray-900 drop-shadow-lg'
                  )}>
                    {slide.title}
                  </h1>

                  {/* Subtitle */}
                  <p className={clsx(
                    'text-body-large max-w-2xl', // Utilise la nouvelle classe typography
                    'transform transition-all duration-500 delay-400', // Réduit de 700ms à 500ms
                    index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
                    prefersReducedMotion && 'transition-none',
                    isDark ? 'text-gray-100' : 'text-gray-700 drop-shadow-md'
                  )}>
                    {slide.subtitle}
                  </p>
                  
                  {/* Description */}
                  {slide.description && (
                    <p className={clsx(
                      'text-body max-w-xl', // Utilise la nouvelle classe typography
                      'transform transition-all duration-500 delay-500', // Réduit de 700ms à 500ms
                      index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
                      prefersReducedMotion && 'transition-none',
                      isDark ? 'text-gray-200' : 'text-gray-600 drop-shadow-sm'
                    )}>
                      {slide.description}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className={clsx(
                    'flex flex-col sm:flex-row gap-4',
                    'transform transition-all duration-500 delay-600', // Réduit de 700ms à 500ms
                    index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
                    prefersReducedMotion && 'transition-none'
                  )}>
                    <Button
                      asChild
                      size="lg"
                      className={clsx(
                        'shadow-lg transition-all duration-300 hover:scale-105',
                        isDark 
                          ? 'bg-white text-primary-600 hover:bg-gray-100' 
                          : 'bg-niger-orange text-white hover:bg-niger-orange-dark shadow-niger'
                      )}
                    >
                      <Link href={getCtaLink(slide.cta)} className="flex items-center gap-2">
                        {slide.cta}
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    </Button>
                    {slide.ctaSecondary && (
                      <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className={clsx(
                          'border-2 transition-all duration-300 hover:scale-105',
                          isDark 
                            ? 'border-white/30 text-white hover:bg-white hover:text-primary-600' 
                            : 'border-niger-green text-niger-green hover:bg-niger-green hover:text-white shadow-niger-green'
                        )}
                      >
                        <Link href={getCtaLink(slide.ctaSecondary)}>
                          {slide.ctaSecondary}
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Stats Cards */}
              {slide.stats && (
                <div className="lg:col-span-5 xl:col-span-6">
                  <div className={clsx(
                    'grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-4',
                    'transform transition-all duration-500 delay-700', // Réduit de 700ms à 500ms
                    index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
                    prefersReducedMotion && 'transition-none'
                  )}>
                    {Object.entries(slide.stats).map(([key, value], statIndex) => {
                      const icons = {
                        students: Users,
                        institutions: GraduationCap,
                        programs: BookOpen,
                        projects: TrendingUp,
                        researchers: Users,
                        publications: BookOpen,
                        libraries: BookOpen,
                        labs: TrendingUp,
                        capacity: Users
                      };
                      const Icon = icons[key] || TrendingUp;
                      
                      const labels = {
                        students: 'Étudiants',
                        institutions: 'Institutions',
                        programs: 'Programmes',
                        projects: 'Projets',
                        researchers: 'Chercheurs',
                        publications: 'Publications',
                        libraries: 'Bibliothèques',
                        labs: 'Laboratoires',
                        capacity: 'Capacité'
                      };
                      
                      return (
                        <Card 
                          key={key} 
                          className={clsx(
                            'p-6 transition-all duration-300 hover:scale-105',
                            isDark 
                              ? 'bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/15' 
                              : 'bg-white/95 backdrop-blur-sm border-gray-200/50 text-gray-800 hover:bg-white shadow-lg hover:shadow-xl'
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className={clsx(
                              'w-8 h-8',
                              isDark ? 'text-white/80' : 'text-niger-green'
                            )} aria-hidden="true" />
                            <div>
                              <div className="text-2xl font-bold">{value}</div>
                              <div className={clsx(
                                'text-sm',
                                isDark ? 'text-white/80' : 'text-gray-600'
                              )}>{labels[key]}</div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Controls - Optimisés pour mobile */}
      <div className="absolute bottom-4 md:bottom-6 right-4 md:right-6 flex items-center gap-2 md:gap-3">
        {/* Play/Pause */}
        <button
          onClick={togglePlayPause}
          className={clsx(
            'p-2 md:p-3 rounded-lg backdrop-blur-sm transition-all group focus:outline-none focus:ring-2 touch-manipulation',
            isDark 
              ? 'bg-white/10 text-white hover:bg-white hover:text-primary-600 focus:ring-white/50' 
              : 'bg-white/90 text-gray-700 hover:bg-white hover:text-niger-orange focus:ring-niger-orange/50 shadow-lg'
          )}
          aria-label={isPlaying ? 'Mettre en pause' : 'Reprendre'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 md:w-5 md:h-5" />
          ) : (
            <Play className="w-4 h-4 md:w-5 md:h-5" />
          )}
        </button>
        
        {/* Previous */}
        <button
          onClick={() => handleSlideChange('prev')}
          disabled={isTransitioning}
          className={clsx(
            'p-2 md:p-3 rounded-lg backdrop-blur-sm transition-all group disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 touch-manipulation',
            isDark 
              ? 'bg-white/10 text-white hover:bg-white hover:text-primary-600 focus:ring-white/50' 
              : 'bg-white/90 text-gray-700 hover:bg-white hover:text-niger-orange focus:ring-niger-orange/50 shadow-lg'
          )}
          aria-label="Diapositive précédente"
        >
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-0.5 transition-transform" />
        </button>
        
        {/* Next */}
        <button
          onClick={() => handleSlideChange('next')}
          disabled={isTransitioning}
          className={clsx(
            'p-2 md:p-3 rounded-lg backdrop-blur-sm transition-all group disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 touch-manipulation',
            isDark 
              ? 'bg-white/10 text-white hover:bg-white hover:text-primary-600 focus:ring-white/50' 
              : 'bg-white/90 text-gray-700 hover:bg-white hover:text-niger-orange focus:ring-niger-orange/50 shadow-lg'
          )}
          aria-label="Diapositive suivante"
        >
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
      
      {/* Slide Indicators - Optimisés pour mobile */}
      <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 flex items-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            onFocus={() => setFocusedSlide(index)}
            onBlur={() => setFocusedSlide(null)}
            className={clsx(
              'w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all focus:outline-none focus:ring-2 touch-manipulation',
              index === currentSlide 
                ? clsx(
                    'scale-125',
                    isDark ? 'bg-white' : 'bg-niger-orange'
                  )
                : clsx(
                    'hover:scale-110',
                    isDark 
                      ? 'bg-white/40 hover:bg-white/70 focus:ring-white/50' 
                      : 'bg-gray-400/60 hover:bg-gray-600 focus:ring-niger-orange/50'
                  ),
              focusedSlide === index && clsx(
                'ring-2',
                isDark ? 'ring-white/50' : 'ring-niger-orange/50'
              )
            )}
            aria-label={`Aller à la diapositive ${index + 1}`}
            aria-current={index === currentSlide ? 'true' : 'false'}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className={clsx(
        'absolute bottom-0 left-0 right-0 h-1',
        isDark ? 'bg-white/20' : 'bg-gray-300/60'
      )} aria-hidden="true">
        <div
          className={clsx(
            'h-full origin-left transition-all',
            isDark ? 'bg-white' : 'bg-niger-orange',
            isPlaying && !prefersReducedMotion ? 'duration-linear' : 'duration-300'
          )}
          style={{
            width: `${((currentSlide + 1) / slides.length) * 100}%`,
            ...(isPlaying && !prefersReducedMotion && {
              transition: `width ${getSlideDuration(slides[currentSlide])}ms linear`
            })
          }}
        />
      </div>
      
      {/* Bordure inférieure décorative */}
      <div className={clsx(
        'absolute bottom-0 left-0 w-full h-2',
        isDark 
          ? 'bg-gradient-to-r from-niger-green/50 via-niger-orange/50 to-niger-green/50' 
          : 'bg-gradient-to-r from-niger-green/30 via-niger-orange/30 to-niger-green/30'
      )} />
      
      {/* Screen Reader Live Region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {currentSlideData && (
          `Diapositive ${currentSlide + 1} sur ${slides.length}: ${currentSlideData.title}. ${currentSlideData.subtitle}`
        )}
      </div>
      
      {/* Keyboard Instructions */}
      <div className="sr-only" id={ids.instructions}>
        Utilisez les flèches gauche et droite pour naviguer, espace pour mettre en pause, origine pour aller au début, fin pour aller à la fin.
      </div>
    </section>
  );
}