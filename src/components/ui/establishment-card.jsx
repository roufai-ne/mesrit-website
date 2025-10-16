// src/components/ui/establishment-card.jsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Users, ChevronRight, Globe, ExternalLink, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

const EstablishmentCard = ({ establishment, className }) => {
  const {
    _id,
    nom,
    type,
    statut,
    region,
    ville,
    logo,
    numberOfStudents,
    description,
    website,
    accreditation
  } = establishment;

  const handleWebsiteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (website) {
      window.open(website, '_blank', 'noopener,noreferrer');
    }
  };

  const getAccreditationBadge = () => {
    if (statut !== 'privé' || !accreditation?.isAccredited) return null;

    const now = new Date();
    const expiry = new Date(accreditation.accreditationExpiry);
    const isExpired = expiry < now;
    const isExpiringSoon = (expiry - now) / (1000 * 60 * 60 * 24) < 90;

    if (isExpired) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-full text-xs border border-red-200">
          <AlertCircle className="w-3 h-3" />
          <span>Accréditation expirée</span>
        </div>
      );
    }

    if (isExpiringSoon) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-600 rounded-full text-xs border border-orange-200">
          <AlertCircle className="w-3 h-3" />
          <span>Expire bientôt</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs border border-green-200">
        <CheckCircle className="w-3 h-3" />
        <span>Accrédité</span>
      </div>
    );
  };

  return (
    <div 
      className={clsx(
        'bg-white dark:bg-secondary-800 rounded-2xl border border-niger-orange/20 shadow-lg',
        'transition-all duration-300 cursor-pointer hover:shadow-xl transform hover:-translate-y-2',
        'hover:border-niger-orange/40 group relative overflow-hidden',
        className
      )}
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-niger-orange/5 to-niger-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative z-10 p-4">
        {/* Header avec logo et badges */}
        <div className="flex items-start justify-between mb-3">
          <div className="relative w-12 h-12 bg-gradient-to-br from-niger-orange/10 to-niger-green/10 rounded-lg flex-shrink-0 p-2 border border-niger-orange/20">
            <Image
              src={logo || '/images/logos/default.webp'}
              alt={`Logo ${nom}`}
              fill
              sizes="48px"
              className="object-contain"
            />
          </div>
          <div className="flex flex-col gap-1 items-end">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              statut === 'public' 
                ? 'bg-niger-green/20 text-niger-green-dark border border-niger-green/30' 
                : 'bg-niger-orange/20 text-niger-orange-dark border border-niger-orange/30'
            }`}>
              {statut === 'public' ? 'Public' : 'Privé'}
            </span>
            <span className="bg-niger-cream dark:bg-secondary-700 text-niger-green dark:text-niger-green-light px-2 py-1 rounded-full text-xs font-medium border border-niger-green/20">
              {type}
            </span>
          </div>
        </div>

        {/* Nom de l'établissement */}
        <h3 className="font-bold text-base text-niger-green dark:text-niger-green-light mb-2 group-hover:text-niger-orange dark:group-hover:text-niger-orange-light transition-colors line-clamp-2">
          {nom}
        </h3>

        {/* Localisation et statistiques */}
        <div className="flex items-center justify-between text-readable-muted dark:text-muted-foreground text-sm mb-2">
          <div className="flex items-center">
            <MapPin className="w-3 h-3 mr-1 text-niger-orange" />
            <span className="truncate">{ville}, {region}</span>
          </div>
          {numberOfStudents > 0 && (
            <div className="flex items-center">
              <Users className="w-3 h-3 mr-1 text-niger-green" />
              <span>{numberOfStudents.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Badge d'accréditation pour les établissements privés */}
        {getAccreditationBadge() && (
          <div className="mb-2">
            {getAccreditationBadge()}
          </div>
        )}

        {/* Description */}
        <p className="text-readable-muted dark:text-muted-foreground text-sm mb-3 line-clamp-2">
          {description || "Aucune description disponible"}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link
            href={`/etablissements/${_id}`}
            className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-niger-orange/10 to-niger-green/10 text-niger-green dark:text-niger-green-light rounded-lg hover:from-niger-orange/20 hover:to-niger-green/20 transition-all duration-300 text-sm font-medium border border-niger-orange/20"
          >
            Détails
            <ChevronRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" />
          </Link>

          {website && (
            <button
              onClick={handleWebsiteClick}
              className="inline-flex items-center px-2 py-2 text-niger-orange hover:text-niger-orange-dark dark:text-niger-orange-light transition-colors text-sm rounded-lg hover:bg-niger-orange/10"
              title="Visiter le site web"
            >
              <Globe className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Hover indicator */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-8 h-8 bg-niger-orange rounded-full flex items-center justify-center">
          <ChevronRight className="w-4 h-4 text-white" />
        </div>
      </div>
    </div>
  );
};

export default EstablishmentCard;
