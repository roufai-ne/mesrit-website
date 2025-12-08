import React, { useState, useRef, useEffect } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Composant vidéo optimisé avec lazy loading et placeholder
 * @param {string} src - URL de la vidéo
 * @param {string} poster - URL de l'image de prévisualisation
 * @param {string} title - Titre de la vidéo
 * @param {boolean} autoPlay - Lecture automatique (défaut: false)
 * @param {boolean} controls - Afficher les contrôles (défaut: true)
 * @param {boolean} muted - Vidéo muette (défaut: false)
 * @param {boolean} loop - Boucle vidéo (défaut: false)
 * @param {string} className - Classes CSS additionnelles
 */
export default function LazyVideo({
  src,
  poster,
  title = 'Vidéo',
  autoPlay = false,
  controls = true,
  muted = false,
  loop = false,
  className = '',
  onPlay,
  onPause,
  onEnded
}) {
  const { isDark } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    // Intersection Observer pour charger la vidéo uniquement quand elle est visible
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isLoaded) {
            setIsLoaded(true);
          }
        });
      },
      {
        rootMargin: '50px', // Charger 50px avant que la vidéo ne soit visible
        threshold: 0.1
      }
    );

    if (videoRef.current) {
      observerRef.current.observe(videoRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isLoaded]);

  const handlePlay = () => {
    setIsPlaying(true);
    if (onPlay) onPlay();
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (onPause) onPause();
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (onEnded) onEnded();
  };

  const handleError = (e) => {
    console.error('Erreur de chargement vidéo:', e);
    setHasError(true);
  };

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  return (
    <div
      ref={videoRef}
      className={clsx(
        'relative rounded-xl overflow-hidden shadow-lg',
        className
      )}
    >
      {/* Placeholder avant chargement */}
      {!isLoaded && (
        <div
          className={clsx(
            'absolute inset-0 flex items-center justify-center',
            isDark ? 'bg-gray-800' : 'bg-gray-200'
          )}
        >
          {poster ? (
            <img
              src={poster}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <Loader2
                className={clsx(
                  'w-12 h-12 animate-spin',
                  isDark ? 'text-gray-600' : 'text-gray-400'
                )}
              />
              <span
                className={clsx(
                  'text-sm font-medium',
                  isDark ? 'text-gray-400' : 'text-gray-600'
                )}
              >
                Chargement de la vidéo...
              </span>
            </div>
          )}
        </div>
      )}

      {/* Message d'erreur */}
      {hasError && (
        <div
          className={clsx(
            'absolute inset-0 flex items-center justify-center',
            isDark ? 'bg-gray-900' : 'bg-gray-100'
          )}
        >
          <div className="text-center px-4">
            <p
              className={clsx(
                'text-sm font-medium mb-2',
                isDark ? 'text-red-400' : 'text-red-600'
              )}
            >
              Impossible de charger la vidéo
            </p>
            <p
              className={clsx(
                'text-xs',
                isDark ? 'text-gray-500' : 'text-gray-600'
              )}
            >
              Veuillez réessayer plus tard
            </p>
          </div>
        </div>
      )}

      {/* Vidéo */}
      {isLoaded && !hasError && (
        <>
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            poster={poster}
            controls={controls}
            autoPlay={autoPlay}
            muted={muted}
            loop={loop}
            preload="metadata"
            playsInline
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleEnded}
            onError={handleError}
          >
            <source src={src} type="video/mp4" />
            <p>
              Votre navigateur ne supporte pas les vidéos HTML5.{' '}
              <a href={src} download className="underline text-blue-500">
                Télécharger la vidéo
              </a>
            </p>
          </video>

          {/* Bouton play overlay (si pas de controls) */}
          {!controls && !isPlaying && (
            <button
              onClick={handlePlayClick}
              className={clsx(
                'absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-all duration-300 group',
                'focus:outline-none focus:ring-4 focus:ring-orange-500/50'
              )}
              aria-label="Lire la vidéo"
            >
              <div className="p-6 rounded-full bg-gradient-to-r from-orange-500 to-green-500 shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                <Play className="w-12 h-12 text-white fill-white" />
              </div>
            </button>
          )}
        </>
      )}
    </div>
  );
}
