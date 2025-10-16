// src/components/social/ShareButtons.js
import React, { useState } from 'react';
import { 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Copy, 
  Mail,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { useNewsAnalytics } from '@/hooks/useNewsAnalytics';
import { toast } from 'react-hot-toast';

export default function ShareButtons({ 
  article, 
  variant = 'dropdown', // 'dropdown' | 'inline' | 'floating'
  size = 'md', // 'sm' | 'md' | 'lg'
  showLabels = true,
  className = ''
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const { trackShare } = useNewsAnalytics();

  const url = `${window.location.origin}/actualites/${article.slug || article._id}`;
  const title = article.title;
  const text = article.summary || article.metaDescription || '';

  const handleShare = async (platform) => {
    try {
      switch (platform) {
        case 'facebook':
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            '_blank',
            'width=600,height=400'
          );
          break;
          
        case 'twitter':
          window.open(
            `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
            '_blank',
            'width=600,height=400'
          );
          break;
          
        case 'linkedin':
          window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            '_blank',
            'width=600,height=400'
          );
          break;
          
        case 'whatsapp':
          window.open(
            `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
            '_blank'
          );
          break;
          
        case 'email':
          window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\nLire l'article complet: ${url}`)}`;
          break;
          
        case 'copy':
          await navigator.clipboard.writeText(url);
          toast.success('Lien copié dans le presse-papiers');
          break;
          
        case 'native':
          if (navigator.share) {
            await navigator.share({ title, text, url });
          } else {
            // Fallback vers copie
            await navigator.clipboard.writeText(url);
            toast.success('Lien copié dans le presse-papiers');
          }
          break;
          
        default:
          console.warn('Plateforme de partage non supportée:', platform);
          return;
      }

      // Tracker le partage
      await trackShare(article._id, platform);
      
      if (variant === 'dropdown') {
        setShowDropdown(false);
      }
      
    } catch (error) {
      console.error('Erreur partage:', error);
      if (platform === 'copy' || platform === 'native') {
        toast.error('Erreur lors de la copie du lien');
      } else {
        toast.error('Erreur lors du partage');
      }
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  const getButtonClasses = () => {
    const base = 'flex items-center transition-colors';
    switch (size) {
      case 'sm':
        return `${base} px-2 py-1 text-sm`;
      case 'lg':
        return `${base} px-4 py-3 text-lg`;
      default:
        return `${base} px-3 py-2`;
    }
  };

  const shareButtons = [
    {
      platform: 'facebook',
      icon: Facebook,
      label: 'Facebook',
      color: 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
    },
    {
      platform: 'twitter',
      icon: Twitter,
      label: 'Twitter',
      color: 'text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
    },
    {
      platform: 'linkedin',
      icon: Linkedin,
      label: 'LinkedIn',
      color: 'text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20'
    },
    {
      platform: 'whatsapp',
      icon: MessageCircle,
      label: 'WhatsApp',
      color: 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
    },
    {
      platform: 'email',
      icon: Mail,
      label: 'Email',
      color: 'text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/20'
    },
    {
      platform: 'copy',
      icon: Copy,
      label: 'Copier le lien',
      color: 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900/20'
    }
  ];

  if (variant === 'inline') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {showLabels && (
          <span className="text-sm text-readable-muted dark:text-muted-foreground mr-2">
            Partager:
          </span>
        )}
        {shareButtons.map(({ platform, icon: Icon, label, color }) => (
          <button
            key={platform}
            onClick={() => handleShare(platform)}
            className={`${getButtonClasses()} ${color} rounded-lg`}
            title={label}
          >
            <Icon className={getSizeClasses()} />
            {showLabels && size !== 'sm' && (
              <span className="ml-2">{label}</span>
            )}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'floating') {
    return (
      <div className={`fixed right-4 top-1/2 transform -translate-y-1/2 z-40 ${className}`}>
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg border border-gray-200 dark:border-secondary-600 p-2 space-y-2">
          {shareButtons.slice(0, 4).map(({ platform, icon: Icon, label, color }) => (
            <button
              key={platform}
              onClick={() => handleShare(platform)}
              className={`${getButtonClasses()} ${color} rounded-lg w-full justify-center`}
              title={label}
            >
              <Icon className={getSizeClasses()} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Dropdown variant (default)
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`${getButtonClasses()} text-niger-green dark:text-niger-green-light hover:text-niger-orange transition-colors rounded-lg`}
      >
        <Share2 className={getSizeClasses()} />
        {showLabels && <span className="ml-2">Partager</span>}
      </button>
      
      {showDropdown && (
        <>
          {/* Overlay pour fermer le dropdown */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Menu dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-secondary-700 rounded-lg shadow-lg border border-gray-200 dark:border-secondary-600 z-20">
            <div className="py-2">
              {/* Partage natif si disponible */}
              {navigator.share && (
                <>
                  <button
                    onClick={() => handleShare('native')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-600"
                  >
                    <ExternalLink className="w-4 h-4 mr-3 text-niger-orange" />
                    Partager...
                  </button>
                  <div className="border-t border-gray-200 dark:border-secondary-600 my-1" />
                </>
              )}
              
              {shareButtons.map(({ platform, icon: Icon, label, color }) => (
                <button
                  key={platform}
                  onClick={() => handleShare(platform)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-600"
                >
                  <Icon className={`w-4 h-4 mr-3 ${color.split(' ')[0]}`} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}