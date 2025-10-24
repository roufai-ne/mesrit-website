// src/pages/etablissements/[id].js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Building2, 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  Calendar,
  Users,
  BookOpen,
  Award,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Shield,
  GraduationCap
} from 'lucide-react';
import { secureApi } from '@/lib/secureApi';

const EstablishmentDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [establishment, setEstablishment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchEstablishment();
    }
  }, [id]);

  const fetchEstablishment = async () => {
    try {
      setLoading(true);
      const data = await secureApi.get(`/api/establishments/${id}`, false);
      setEstablishment(data);
    } catch (err) {
      setError('Établissement non trouvé');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWebsiteClick = () => {
    if (establishment?.website) {
      window.open(establishment.website, '_blank', 'noopener,noreferrer');
    }
  };

  const getAccreditationStatus = (accreditation) => {
    if (!accreditation?.isAccredited) {
      return {
        status: 'Non accrédité',
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200',
        icon: <AlertCircle className="w-5 h-5 text-red-600" />
      };
    }

    const now = new Date();
    const expiry = new Date(accreditation.accreditationExpiry);
    const isExpired = expiry < now;
    const isExpiringSoon = (expiry - now) / (1000 * 60 * 60 * 24) < 90; // 90 jours

    if (isExpired) {
      return {
        status: 'Accréditation expirée',
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200',
        icon: <AlertCircle className="w-5 h-5 text-red-600" />
      };
    }

    if (isExpiringSoon) {
      return {
        status: 'Accréditation expire bientôt',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 border-orange-200',
        icon: <Clock className="w-5 h-5 text-orange-600" />
      };
    }

    return {
      status: 'Accrédité',
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />
    };
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="bg-gray-200 h-64 rounded-lg"></div>
            <div className="space-y-4">
              <div className="bg-gray-200 h-8 rounded w-3/4"></div>
              <div className="bg-gray-200 h-4 rounded w-1/2"></div>
              <div className="bg-gray-200 h-32 rounded"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !establishment) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <Building2 className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Établissement non trouvé'}
            </h2>
            <p className="text-gray-600 mb-8">
              L'établissement que vous recherchez n'existe pas ou a été supprimé.
            </p>
            <Link
              href="/etablissements"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-niger-orange to-niger-green text-white rounded-xl hover:shadow-lg transition-all duration-300"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Retour aux établissements
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const accreditationInfo = getAccreditationStatus(establishment.accreditation);

  return (
    <MainLayout>
      {/* Breadcrumb */}
      <div className="bg-gray-50 dark:bg-secondary-900 py-4">
        <div className="container mx-auto px-6">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Link href="/" className="hover:text-niger-orange transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href="/etablissements" className="hover:text-niger-orange transition-colors">
              Établissements
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-niger-green font-medium">{establishment.nom}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-niger-orange via-niger-orange-dark to-niger-green text-white py-16">
        <div className="absolute inset-0 bg-niger-white/[0.05] bg-[size:20px_20px] opacity-30" />
        <div className="container mx-auto px-6 relative">
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Logo et informations principales */}
            <div className="flex items-start gap-6">
              <div className="relative w-24 h-24 bg-white rounded-2xl p-4 shadow-xl">
                <Image
                  src={establishment.logo || '/images/logos/default.webp'}
                  alt={`Logo ${establishment.nom}`}
                  fill
                  sizes="96px"
                  className="object-contain"
                />
              </div>
              <div>
                <div className="flex flex-wrap gap-3 mb-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    establishment.statut === 'public' 
                      ? 'bg-niger-green/20 text-niger-cream border border-niger-green/30' 
                      : 'bg-niger-orange/20 text-niger-cream border border-niger-orange/30'
                  }`}>
                    {establishment.statut === 'public' ? 'Public' : 'Privé'}
                  </span>
                  <span className="bg-niger-white/20 text-niger-cream px-4 py-2 rounded-full text-sm font-medium border border-niger-white/30">
                    {establishment.type}
                  </span>
                  {establishment.statut === 'privé' && establishment.accreditation?.isAccredited && (
                    <span className={`px-4 py-2 rounded-full text-sm font-medium border ${accreditationInfo.bgColor} ${accreditationInfo.color}`}>
                      <div className="flex items-center gap-2">
                        {accreditationInfo.icon}
                        {accreditationInfo.status}
                      </div>
                    </span>
                  )}
                </div>
                <h1 className="text-4xl font-bold mb-3">{establishment.nom}</h1>
                <div className="flex items-center text-niger-cream/90 text-lg">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{establishment.ville}, {establishment.region}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 ml-auto">
              {establishment.website && (
                <button
                  onClick={handleWebsiteClick}
                  className="flex items-center gap-3 px-6 py-3 bg-niger-white/20 hover:bg-niger-white/30 backdrop-blur-sm rounded-xl transition-all duration-300 text-white font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Globe className="w-5 h-5" />
                  <span>Visiter le site web</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
              <Link
                href="/etablissements"
                className="flex items-center gap-3 px-6 py-3 bg-niger-white/10 hover:bg-niger-white/20 backdrop-blur-sm rounded-xl transition-all duration-300 text-white font-medium border border-niger-white/20"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Retour à la liste</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg p-8 border border-niger-orange/10">
              <h2 className="text-2xl font-bold text-niger-green dark:text-niger-green-light mb-6 flex items-center">
                <BookOpen className="w-6 h-6 mr-3" />
                À propos
              </h2>
              <p className="text-readable dark:text-foreground leading-relaxed text-lg">
                {establishment.description || "Aucune description disponible pour cet établissement."}
              </p>
            </div>

            {/* Informations d'accréditation (pour les établissements privés) */}
            {establishment.statut === 'privé' && establishment.accreditation && (
              <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg p-8 border border-niger-orange/10">
                <h2 className="text-2xl font-bold text-niger-green dark:text-niger-green-light mb-6 flex items-center">
                  <Shield className="w-6 h-6 mr-3" />
                  Informations d'accréditation
                </h2>
                
                <div className={`p-6 rounded-xl border-2 ${accreditationInfo.bgColor} mb-6`}>
                  <div className="flex items-center gap-3 mb-4">
                    {accreditationInfo.icon}
                    <span className={`text-lg font-semibold ${accreditationInfo.color}`}>
                      {accreditationInfo.status}
                    </span>
                  </div>
                </div>

                {establishment.accreditation.isAccredited && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-niger-green dark:text-niger-green-light mb-2">
                        Numéro d'accréditation
                      </h4>
                      <p className="text-readable dark:text-foreground">
                        {establishment.accreditation.accreditationNumber || 'Non spécifié'}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-niger-green dark:text-niger-green-light mb-2">
                        Niveau d'accréditation
                      </h4>
                      <p className="text-readable dark:text-foreground">
                        {establishment.accreditation.accreditationLevel || 'Non spécifié'}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-niger-green dark:text-niger-green-light mb-2">
                        Date d'accréditation
                      </h4>
                      <p className="text-readable dark:text-foreground">
                        {establishment.accreditation.accreditationDate 
                          ? new Date(establishment.accreditation.accreditationDate).toLocaleDateString('fr-FR')
                          : 'Non spécifiée'
                        }
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-niger-green dark:text-niger-green-light mb-2">
                        Date d'expiration
                      </h4>
                      <p className="text-readable dark:text-foreground">
                        {establishment.accreditation.accreditationExpiry 
                          ? new Date(establishment.accreditation.accreditationExpiry).toLocaleDateString('fr-FR')
                          : 'Non spécifiée'
                        }
                      </p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <h4 className="font-semibold text-niger-green dark:text-niger-green-light mb-2">
                        Organisme d'accréditation
                      </h4>
                      <p className="text-readable dark:text-foreground">
                        {establishment.accreditation.accreditingBody || 'MESRIT Niger'}
                      </p>
                    </div>

                    {establishment.accreditation.specializations && establishment.accreditation.specializations.length > 0 && (
                      <div className="md:col-span-2">
                        <h4 className="font-semibold text-niger-green dark:text-niger-green-light mb-3">
                          Spécialisations accréditées
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {establishment.accreditation.specializations.map((spec, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-niger-orange/10 text-niger-orange-dark rounded-full text-sm font-medium border border-niger-orange/20"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informations générales */}
            <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg p-6 border border-niger-orange/10">
              <h3 className="text-xl font-bold text-niger-green dark:text-niger-green-light mb-6">
                Informations générales
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-niger-orange" />
                  <div>
                    <p className="text-sm text-readable-muted dark:text-muted-foreground">Ouverture</p>
                    <p className="font-medium text-readable dark:text-foreground">
                      {new Date(establishment.dateOuverture).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long'
                      })}
                    </p>
                  </div>
                </div>

                {establishment.numberOfStudents > 0 && (
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-niger-orange" />
                    <div>
                      <p className="text-sm text-readable-muted dark:text-muted-foreground">Étudiants</p>
                      <p className="font-medium text-readable dark:text-foreground">
                        {establishment.numberOfStudents.toLocaleString()} étudiants
                      </p>
                    </div>
                  </div>
                )}

                {establishment.numberOfPrograms > 0 && (
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-niger-orange" />
                    <div>
                      <p className="text-sm text-readable-muted dark:text-muted-foreground">Programmes</p>
                      <p className="font-medium text-readable dark:text-foreground">
                        {establishment.numberOfPrograms} programmes
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact */}
            {establishment.contact && (
              <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg p-6 border border-niger-orange/10">
                <h3 className="text-xl font-bold text-niger-green dark:text-niger-green-light mb-6">
                  Contact
                </h3>
                
                <div className="space-y-4">
                  {establishment.contact.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-niger-orange" />
                      <div>
                        <p className="text-sm text-readable-muted dark:text-muted-foreground">Téléphone</p>
                        <a 
                          href={`tel:${establishment.contact.phone}`}
                          className="font-medium text-readable dark:text-foreground hover:text-niger-orange transition-colors"
                        >
                          {establishment.contact.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {establishment.contact.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-niger-orange" />
                      <div>
                        <p className="text-sm text-readable-muted dark:text-muted-foreground">Email</p>
                        <a 
                          href={`mailto:${establishment.contact.email}`}
                          className="font-medium text-readable dark:text-foreground hover:text-niger-orange transition-colors"
                        >
                          {establishment.contact.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {establishment.contact.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-niger-orange mt-1" />
                      <div>
                        <p className="text-sm text-readable-muted dark:text-muted-foreground">Adresse</p>
                        <p className="font-medium text-readable dark:text-foreground">
                          {establishment.contact.address}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EstablishmentDetail;

// Forcer SSR pour éviter les erreurs durant le SSG
export async function getServerSideProps() {
  return {
    props: {}
  };
}
