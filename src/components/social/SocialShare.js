// src/components/social/SocialShare.js
import React from 'react';
import { Facebook, Twitter, Linkedin } from 'lucide-react';

export default function SocialShare() {
  const shareUrl = encodeURIComponent(window.location.href);
  const title = encodeURIComponent("MESRIT Niger - Ministère de l'Enseignement Supérieur");

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm text-gray-600">Partager :</span>
      <div className="flex space-x-2">
        
          href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
        <a>
          <Facebook className="w-5 h-5" />
        </a>
        
          href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${title}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-blue-400 hover:bg-blue-50 rounded-full"
        <a>
          <Twitter className="w-5 h-5" />
        </a>
        
          href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${title}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-blue-700 hover:bg-blue-50 rounded-full"
        <a>
          <Linkedin className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}