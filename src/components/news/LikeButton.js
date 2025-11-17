/**
 * Composant Like Button pour les articles de news
 * Affiche un bouton cœur avec le compteur de likes
 * Permet de liker/unliker un article
 */
import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useNewsAnalyticsV2 } from '@/hooks/useNewsV2';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';

export default function LikeButton({ newsId, initialLikesCount = 0, initialLiked = false, size = 'md' }) {
  const { trackLike, getLikeStats } = useNewsAnalyticsV2();
  const { user } = useAuth();
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Charger les stats au montage
  useEffect(() => {
    if (!newsId) return;

    const loadLikeStats = async () => {
      try {
        const stats = await getLikeStats(newsId);
        setLikesCount(stats.likesCount);
        setIsLiked(stats.hasLiked);
      } catch (error) {
        console.error('Erreur lors du chargement des likes:', error);
      }
    };

    loadLikeStats();
  }, [newsId, getLikeStats]);

  // Gérer le click sur le bouton like
  const handleLike = async (e) => {
    e.preventDefault();
    
    // Vérifier si l'utilisateur est connecté
    if (!user) {
      toast.error('Veuillez vous connecter pour liker un article');
      return;
    }
    
    if (!newsId || loading) return;

    try {
      setLoading(true);
      setIsAnimating(true);

      const result = await trackLike(newsId);

      // Mettre à jour l'état local
      if (result.action === 'liked') {
        setIsLiked(true);
        setLikesCount(result.likesCount);
        toast.success('Article ajouté à vos favoris ❤️');
      } else {
        setIsLiked(false);
        setLikesCount(result.likesCount);
        toast.success('Article retiré de vos favoris');
      }

      // Animation
      setTimeout(() => {
        setIsAnimating(false);
      }, 600);
    } catch (error) {
      console.error('Erreur lors du like:', error);
      
      // Vérifier si c'est une erreur d'authentification
      if (error.status === 401 || error.message?.includes('authentif')) {
        toast.error('Veuillez vous connecter pour liker cet article');
      } else {
        toast.error('Erreur lors de la mise à jour du like');
      }
      setIsAnimating(false);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  // Si l'utilisateur n'est pas connecté, afficher un bouton "Connexion requise"
  if (!user) {
    return (
      <Link href="/auth/login">
        <button
          className={clsx(
            'relative flex items-center justify-center gap-2 rounded-full transition-all duration-300',
            'hover:scale-110 active:scale-95',
            sizeClasses[size],
            'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
            'hover:bg-blue-50 dark:hover:bg-blue-900/20'
          )}
          title="Connectez-vous pour liker"
        >
          <div className="relative">
            <Heart className={clsx(iconSizes[size], 'transition-all duration-300')} />
          </div>
          {(size === 'md' || size === 'lg') && (
            <span className="text-xs font-semibold">Login</span>
          )}
        </button>
      </Link>
    );
  }

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={clsx(
        'relative flex items-center justify-center gap-2 rounded-full transition-all duration-300',
        'hover:scale-110 active:scale-95',
        sizeClasses[size],
        isLiked
          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
          : 'bg-gray-100 dark:bg-secondary-700 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20',
        loading && 'opacity-70 cursor-not-allowed'
      )}
      title={isLiked ? 'Retirer de vos favoris' : 'Ajouter à vos favoris'}
    >
      <div className={clsx(
        'relative',
        isAnimating && 'animate-pulse'
      )}>
        <Heart
          className={clsx(
            iconSizes[size],
            'transition-all duration-300',
            isLiked && 'fill-current',
            isAnimating && 'scale-125'
          )}
        />
      </div>

      {/* Compteur de likes (optionnel, affiché en md et lg) */}
      {(size === 'md' || size === 'lg') && likesCount > 0 && (
        <span className="text-xs font-semibold">
          {likesCount > 999 ? `${(likesCount / 1000).toFixed(1)}k` : likesCount}
        </span>
      )}
    </button>
  );
}
