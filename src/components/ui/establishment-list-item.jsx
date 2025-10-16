// src/components/ui/establishment-list-item.jsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Users, ChevronRight, Globe, CheckCircle, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

const EstablishmentListItem = ({ establishment, className }) => {
  const {
    _id,
    nom,
    type,
    statut,
    region,
    ville,
    logo,
    numberOfStudents,
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

  const getAccreditationIcon = () => {
    if (statut !== 'privé' || !accreditation?.isAccredited) return null;

    const now = new Date();
    const expiry = new Date(accreditation.accreditationExpiry);
    const isExpired = expiry < now;
    const isExpiringSoon = (expiry - now) / (1000 * 60 * 60 * 24) < 90;

    if (isExpired) {
      return <AlertCircle className="w-3 h-3 text-red-500" title="Accréditation expirée" />;
    }

    if (isExpiringSoon) {
      return <AlertCircle className="w-3 h-3 text-orange-500" title="Accréditation expire bientôt" />;
    }

    return <CheckCircle className="w-3 h-3 text-green-500" title="Accrédité" />;
  };

  return (
    <div 
      className={clsx(
        'bg-white dark:bg-secondary-800 rounded-lg border border-gray-200 dark:border-secondary-700',
        'transition-all duration-200 cursor-pointer hover:shadow-md hover:border-niger-orange/40',
        'group relative',
        className
      )}
    >
      <div className="p-3">
        <div className="flex items-center gap-3">
          {/* Logo compact */}
          <div className="relative w-10 h-10 bg-gray-50 dark:bg-secondary-700 rounded-lg flex-shrink-0 p-1.5 border border-gray-200 dark:border-secondary-600">
            <Image
              src={logo || '/images/logos/default.webp'}
              alt={`Logo ${nom}`}
              fill
              sizes="40px"
              className="object-contain"
            />
          </div>

          {/* Informations principales */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm text-niger-green dark:text-niger-green-light group-hover:text-niger-orange transition-colors truncate">
                  {nom}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-600 dark:text-gray-400">{type}</span>
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                    statut === 'public' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                  }`}>
                    {statut === 'public' ? 'Public' : 'Privé'}
                  </span>
                  {getAccreditationIcon()}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{ville}, {region}</span>
              </div>
              {numberOfStudents > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{numberOfStudents.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions compactes */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {website && (
              <button
                onClick={handleWebsiteClick}
                className="p-1.5 text-gray-400 hover:text-niger-orange transition-colors rounded"
                title="Site web"
              >
                <Globe className="w-3.5 h-3.5" />
              </button>
            )}
            
            <Link
              href={`/etablissements/${_id}`}
              className="inline-flex items-center gap-1 px-2 py-1 bg-niger-orange/10 text-niger-orange hover:bg-niger-orange/20 transition-colors text-xs font-medium rounded"
            >
              <span>Détails</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstablishmentListItem;