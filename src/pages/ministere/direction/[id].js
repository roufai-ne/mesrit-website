import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import { 
  ChevronRight, 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Users, 
  Building, 
  Award, 
  Loader,
  Share2,
  Download,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { secureApi } from '@/lib/secureApi';
import toast from 'react-hot-toast';

const Breadcrumb = ({ directorName }) => (
  <div className="flex items-center text-sm text-readable-muted dark:text-muted-foreground mb-8">
    <Link href="/" className="hover:text-niger-orange dark:hover:text-niger-orange-light transition-colors">Accueil</Link>
    <ChevronRight className="w-4 h-4 mx-2" />
    <Link href="/ministere" className="hover:text-niger-orange dark:hover:text-niger-orange-light transition-colors">Le Ministère</Link>
    <ChevronRight className="w-4 h-4 mx-2" />
    <Link href="/ministere/direction" className="hover:text-niger-orange dark:hover:text-niger-orange-light transition-colors">Direction</Link>
    <ChevronRight className="w-4 h-4 mx-2" />
    <span className="text-niger-green dark:text-niger-green-light font-medium">{directorName}</span>
  </div>
);

const DirectorProfile = ({ director }) => {
  const shareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `${director.nom} - ${director.titre}`,
        text: `Découvrez le profil de ${director.nom}, ${director.titre} au MESRIT`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papiers');
    }
  };

  const exportProfile = () => {
    toast.success('Export du profil en cours...');
    // Export PDF sera implémenté avec react-pdf ou puppeteer
  };

  return (
    <div className="space-y-8">
      {/* Header Profile */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* Photo */}
          <div className="relative h-[400px] lg:h-[500px]">
            <Image
              src={director.photo || '/images/dir/default.jpg'}
              alt={director.nom}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 33vw"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            
            {/* Badge */}
            {director.key && (
              <div className="absolute top-4 left-4">
                <div className="bg-gradient-to-r from-niger-orange to-niger-green px-4 py-2 rounded-full shadow-lg">
                  <span className="text-white font-medium text-sm">{director.key}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Informations */}
          <div className="lg:col-span-2 p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-niger-green dark:text-niger-green-light mb-2">
                  {director.nom}
                </h1>
                <p className="text-xl text-niger-orange dark:text-niger-orange-light mb-4">
                  {director.titre}
                </p>
                {director.nomComplet && director.nomComplet !== director.titre && (
                  <p className="text-readable-muted dark:text-muted-foreground">
                    {director.nomComplet}
                  </p>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={shareProfile}
                  className="p-2 bg-niger-orange/10 dark:bg-niger-orange/20 text-niger-orange rounded-lg hover:bg-niger-orange/20 transition-all duration-300"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={exportProfile}
                  className="p-2 bg-niger-green/10 dark:bg-niger-green/20 text-niger-green rounded-lg hover:bg-niger-green/20 transition-all duration-300"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Mission */}
            {director.mission && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-niger-green dark:text-niger-green-light mb-3">
                  Mission
                </h3>
                <p className="text-readable-muted dark:text-muted-foreground leading-relaxed">
                  {director.mission}
                </p>
              </div>
            )}
            
            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {director.email && (
                <div className="flex items-center gap-3 p-4 bg-niger-cream/20 dark:bg-secondary-700 rounded-lg">
                  <div className="w-10 h-10 bg-niger-orange/20 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-niger-orange" />
                  </div>
                  <div>
                    <p className="text-sm text-readable-muted dark:text-muted-foreground">Email</p>
                    <p className="font-medium text-readable dark:text-foreground">{director.email}</p>
                  </div>
                </div>
              )}
              
              {director.telephone && (
                <div className="flex items-center gap-3 p-4 bg-niger-cream/20 dark:bg-secondary-700 rounded-lg">
                  <div className="w-10 h-10 bg-niger-green/20 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-niger-green" />
                  </div>
                  <div>
                    <p className="text-sm text-readable-muted dark:text-muted-foreground">Téléphone</p>
                    <p className="font-medium text-readable dark:text-foreground">{director.telephone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Message du directeur */}
      {director.message && (
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-niger-green dark:text-niger-green-light mb-6">
            Message du {director.titre.includes('Ministre') ? 'Ministre' : 'Directeur'}
          </h2>
          <div className="prose prose-lg max-w-none text-readable-muted dark:text-muted-foreground">
            <p className="italic leading-relaxed text-justify">
              {director.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default function DirectorPage() {
  const router = useRouter();
  const { id } = router.query;
  const [director, setDirector] = useState(null);
  const [relatedDirectors, setRelatedDirectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchDirector = async () => {
      try {
        setLoading(true);
        // Récupérer le directeur spécifique
        const directorData = await secureApi.get(`/api/directors/${id}`, false);
        setDirector(directorData.data || directorData);
        
        // Récupérer les directeurs liés (même direction ou niveau)
        const allDirectors = await secureApi.get('/api/directors', false);
        const related = allDirectors.filter(d => 
          d._id !== id && 
          (d.direction === directorData.direction || d.key === directorData.key)
        ).slice(0, 3);
        setRelatedDirectors(related);
        
        toast.success('Profil chargé avec succès');
      } catch (error) {
        console.error('Erreur:', error);
        setError(error.message || 'Erreur lors du chargement du profil');
        toast.error('Erreur lors du chargement du profil');
      } finally {
        setLoading(false);
      }
    };

    fetchDirector();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="py-12 bg-gradient-to-b from-niger-cream to-white dark:from-secondary-900 dark:to-secondary-800 min-h-screen">
          <div className="container mx-auto px-4">
            <div className="animate-pulse space-y-8">
              <div className="flex items-center gap-2 mb-8">
                <div className="h-4 bg-niger-orange/20 rounded w-32"></div>
                <div className="h-4 bg-niger-orange/20 rounded w-4"></div>
                <div className="h-4 bg-niger-orange/20 rounded w-24"></div>
              </div>
              
              <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                  <div className="h-[400px] lg:h-[500px] bg-niger-orange/10 dark:bg-secondary-700"></div>
                  <div className="lg:col-span-2 p-8 space-y-4">
                    <div className="h-8 bg-niger-orange/20 rounded w-2/3"></div>
                    <div className="h-6 bg-niger-green/20 rounded w-1/2"></div>
                    <div className="h-4 bg-niger-cream/40 rounded w-full"></div>
                    <div className="h-4 bg-niger-cream/40 rounded w-3/4"></div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="h-16 bg-niger-cream/20 rounded-lg"></div>
                      <div className="h-16 bg-niger-cream/20 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="py-12 bg-gradient-to-b from-niger-cream to-white dark:from-secondary-900 dark:to-secondary-800 min-h-screen">
          <div className="container mx-auto px-4">
            <div className="text-center py-12 bg-white dark:bg-secondary-800 rounded-xl">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-red-500 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-readable dark:text-foreground mb-2">
                Profil non trouvé
              </h3>
              <div className="text-red-500 dark:text-red-400 mb-4">{error}</div>
              <Link
                href="/ministere/direction"
                className="bg-gradient-to-r from-niger-orange to-niger-green text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 font-medium inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à l'équipe dirigeante
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!director) {
    return (
      <MainLayout>
        <div className="py-12 bg-gradient-to-b from-niger-cream to-white dark:from-secondary-900 dark:to-secondary-800 min-h-screen">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">
              <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-niger-orange" />
              <p className="text-readable-muted dark:text-muted-foreground">Chargement du profil...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="py-12 bg-gradient-to-b from-niger-cream to-white dark:from-secondary-900 dark:to-secondary-800 min-h-screen">
        <div className="container mx-auto px-4">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Breadcrumb directorName={director.nom} />
            <Link
              href="/ministere/direction"
              className="flex items-center gap-2 text-niger-orange hover:text-niger-orange-dark transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'équipe
            </Link>
          </div>
          
          {/* Profil principal */}
          <DirectorProfile director={director} />
          
          {/* Directeurs liés */}
          {relatedDirectors.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-niger-green dark:text-niger-green-light mb-6">
                Autres membres de l'équipe
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedDirectors.map((relatedDirector) => (
                  <Link
                    key={relatedDirector._id}
                    href={`/ministere/direction/${relatedDirector._id}`}
                    className="group bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16">
                        <Image
                          src={relatedDirector.photo || '/images/dir/default.jpg'}
                          alt={relatedDirector.nom}
                          fill
                          className="rounded-full object-cover border-2 border-niger-orange/20"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-niger-green dark:text-niger-green-light group-hover:text-niger-orange transition-colors">
                          {relatedDirector.nom}
                        </h3>
                        <p className="text-sm text-readable-muted dark:text-muted-foreground">
                          {relatedDirector.titre}
                        </p>
                      </div>
                      <ExternalLink className="w-5 h-5 text-niger-orange opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}