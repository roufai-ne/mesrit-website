// src/components/communication/VideoPlayer.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  SkipBack,
  SkipForward
} from 'lucide-react';
import { useNewsAnalyticsV2 } from '@/hooks/useNewsV2';

export default function VideoPlayer({ 
  src, 
  poster, 
  title, 
  newsId,
  className = '',
  autoPlay = false,
  controls = true,
  width = '100%',
  height = 'auto'
}) {
  const videoRef = useRef(null);
  const progressRef = useRef(null);
  const { trackView } = useNewsAnalyticsV2();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Analytics tracking
  const [viewStartTime] = useState(Date.now());
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const [lastTrackingTime, setLastTrackingTime] = useState(0);
  const [videoInteractions, setVideoInteractions] = useState([]);

  // Fonction pour tracker les interactions vidéo
  const trackVideoInteraction = (type, value = null) => {
    if (!newsId) return;
    
    const interaction = {
      type,
      timestamp: Date.now(),
      value,
      currentTime: videoRef.current?.currentTime || 0
    };
    
    setVideoInteractions(prev => [...prev, interaction]);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
      
      // Tracker les métadonnées de la vidéo
      if (newsId) {
        trackVideoInteraction('metadata_loaded', {
          duration: video.duration,
          videoSrc: src
        });
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      
      // Tracker la vue après 5 secondes de visionnage
      if (!hasTrackedView && video.currentTime > 5 && newsId) {
        const watchTime = Math.round((Date.now() - viewStartTime) / 1000);
        trackView(newsId, { 
          readingTime: watchTime, 
          scrollDepth: 0,
          videoWatched: true,
          videoCurrentTime: video.currentTime,
          videoTotalDuration: video.duration,
          videoWatchPercentage: (video.currentTime / video.duration) * 100
        });
        setHasTrackedView(true);
      }

      // Tracker les jalons de visionnage (25%, 50%, 75%, 100%)
      const watchPercentage = (video.currentTime / video.duration) * 100;
      const milestones = [25, 50, 75, 90];
      
      milestones.forEach(milestone => {
        if (watchPercentage >= milestone && lastTrackingTime < milestone) {
          trackVideoInteraction('milestone', {
            percentage: milestone,
            currentTime: video.currentTime,
            duration: video.duration
          });
          setLastTrackingTime(milestone);
        }
      });
    };

    const handlePlay = () => {
      setIsPlaying(true);
      trackVideoInteraction('play', video.currentTime);
    };
    
    const handlePause = () => {
      setIsPlaying(false);
      trackVideoInteraction('pause', video.currentTime);
    };
    
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
      trackVideoInteraction('volume_change', video.volume);
    };

    const handleSeeking = () => {
      trackVideoInteraction('seek', video.currentTime);
    };

    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
    };

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [newsId, trackView, viewStartTime, hasTrackedView]);

  // Masquer les contrôles après inactivité
  useEffect(() => {
    let timeout;
    
    const resetTimeout = () => {
      clearTimeout(timeout);
      setShowControls(true);
      timeout = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    };

    if (isPlaying) {
      resetTimeout();
    } else {
      setShowControls(true);
    }

    return () => clearTimeout(timeout);
  }, [isPlaying]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
    }
  };

  const handleProgressClick = (e) => {
    const video = videoRef.current;
    const progressBar = progressRef.current;
    
    if (video && progressBar) {
      const rect = progressBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * duration;
      video.currentTime = newTime;
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
    }
  };

  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    if (video) {
      video.volume = parseFloat(e.target.value);
    }
  };

  const skip = (seconds) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
    }
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    
    if (!document.fullscreenElement) {
      // Entrer en plein écran
      if (container?.requestFullscreen) {
        container.requestFullscreen();
      } else if (container?.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container?.mozRequestFullScreen) {
        container.mozRequestFullScreen();
      }
      setIsFullscreen(true);
      trackVideoInteraction('fullscreen', 'enter');
    } else {
      // Sortir du plein écran
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      }
      setIsFullscreen(false);
      trackVideoInteraction('fullscreen', 'exit');
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  if (hasError) {
    return (
      <div className={`relative bg-gray-100 dark:bg-secondary-700 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Erreur lors du chargement de la vidéo
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Vérifiez que le fichier existe et est dans un format supporté
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative bg-black rounded-lg overflow-hidden group ${className}`}
      style={{ width, height }}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Vidéo */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        autoPlay={autoPlay}
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
      />

      {/* Overlay de chargement */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {/* Contrôles personnalisés */}
      {controls && (
        <div 
          className={`absolute inset-0 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Bouton play central */}
          {!isPlaying && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={togglePlay}
                className="bg-niger-orange hover:bg-niger-orange-dark text-white rounded-full p-4 transition-colors shadow-lg"
              >
                <Play className="w-8 h-8 ml-1" />
              </button>
            </div>
          )}

          {/* Barre de contrôles */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Barre de progression */}
            <div 
              ref={progressRef}
              className="w-full h-2 bg-white/30 rounded-full cursor-pointer mb-4"
              onClick={handleProgressClick}
            >
              <div 
                className="h-full bg-niger-orange rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Contrôles */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-4">
                {/* Play/Pause */}
                <button onClick={togglePlay} className="hover:text-niger-orange transition-colors">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>

                {/* Skip */}
                <button 
                  onClick={() => skip(-10)} 
                  className="hover:text-niger-orange transition-colors"
                  title="Reculer de 10s"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => skip(10)} 
                  className="hover:text-niger-orange transition-colors"
                  title="Avancer de 10s"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                {/* Volume */}
                <div className="flex items-center space-x-2">
                  <button onClick={toggleMute} className="hover:text-niger-orange transition-colors">
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-white/30 rounded-lg appearance-none slider"
                  />
                </div>

                {/* Temps */}
                <span className="text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {/* Titre */}
                {title && (
                  <span className="text-sm font-medium max-w-xs truncate">
                    {title}
                  </span>
                )}

                {/* Plein écran */}
                <button 
                  onClick={toggleFullscreen} 
                  className="hover:text-niger-orange transition-colors"
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styles pour le slider de volume */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #e97317;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #e97317;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
