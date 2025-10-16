import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { clsx } from 'clsx';
import { secureApi, useApiAction } from '@/lib/secureApi';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/layout/AdminLayout';

export default function ViewService() {
  const router = useRouter();
  const { id } = router.query;
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [service, setService] = useState(null);
  
  const { execute } = useApiAction();

  useEffect(() => {
    if (id && user) {
      fetchService();
    }
  }, [id, user]);

  const fetchService = async () => {
    try {
      setLoading(true);
      await execute(async () => {
        const data = await secureApi.get(`/api/admin/services/${id}`, true);
        if (data) {
          setService(data);
        }
      });
    } catch (error) {
      console.error('Erreur lors du chargement du service:', error);
      setError('Erreur lors du chargement du service');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/admin/services/${id}/edit`);
  };

  const handleDelete = async () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      try {
        await execute(async () => {
          await secureApi.delete(`/api/admin/services/${id}`, true);
          router.push('/admin/services');
        });
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  if (!user || user.role !== 'admin') {
    router.push('/admin');
    return null;
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-niger-orange mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 dark:text-muted-foreground dark:text-muted-foreground">Chargement du service...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !service) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <h3 className="text-xl font-semibold mb-2">Erreur de chargement</h3>
          <p className="mb-4">{error || 'Service non trouvé'}</p>
          <Button onClick={fetchService} variant="outline">
            Réessayer
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Head>
        <title>{service.title} - Administration MESRIT</title>
        <meta name="description" content={`Détails du service ${service.title}`} />
      </Head>

      <AdminLayout>
        <div className="space-y-6">
          {/* En-tête */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => router.back()}
                variant="ghost"
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white dark:text-niger-green-light">
                  {service.title}
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400 dark:text-muted-foreground dark:text-muted-foreground">
                  Détails du service
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleEdit}
                variant="outline"
                className="px-4 py-2"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
              <Button
                onClick={handleDelete}
                variant="destructive"
                className="px-4 py-2"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>

          {/* Informations principales */}
          <div className={clsx(
            'p-6 rounded-2xl border-2',
            isDark 
              ? 'bg-niger-white-glass/20 border-niger-orange/20' 
              : 'bg-white border-gray-200 shadow-lg'
          )}>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white dark:text-niger-green-light">
              Informations générales
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 dark:text-muted-foreground dark:text-muted-foreground text-niger-green dark:text-niger-green-light">
                  Titre
                </label>
                <p className="text-lg font-medium text-gray-900 dark:text-white dark:text-niger-green-light">
                  {service.title}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 dark:text-muted-foreground dark:text-muted-foreground text-niger-green dark:text-niger-green-light">
                  Catégorie
                </label>
                <p className="text-lg font-medium text-gray-900 dark:text-white capitalize dark:text-niger-green-light">
                  {service.category}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 dark:text-muted-foreground dark:text-muted-foreground text-niger-green dark:text-niger-green-light">
                  Statut
                </label>
                <span className={clsx(
                  'px-3 py-1 rounded-full text-sm font-medium',
                  service.status === 'published'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                )}>
                  {service.status === 'published' ? 'Publié' : 'Brouillon'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 dark:text-muted-foreground dark:text-muted-foreground text-niger-green dark:text-niger-green-light">
                  Icône
                </label>
                <p className="text-lg font-medium text-gray-900 dark:text-white dark:text-niger-green-light">
                  {service.icon}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 dark:text-muted-foreground dark:text-muted-foreground text-niger-green dark:text-niger-green-light">
                Description
              </label>
              <p className="text-gray-900 dark:text-white dark:text-niger-green-light">
                {service.description}
              </p>
            </div>

            {/* Options */}
            <div className="mt-6 flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={service.isExternal}
                  disabled
                  className="w-4 h-4 text-niger-orange border-gray-300 rounded dark:border-secondary-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 dark:text-niger-green-light">
                  Service externe
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={service.isPopular}
                  disabled
                  className="w-4 h-4 text-niger-orange border-gray-300 rounded dark:border-secondary-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 dark:text-niger-green-light">
                  Service populaire
                </span>
              </div>
            </div>
          </div>

          {/* Fonctionnalités */}
          {service.features && service.features.length > 0 && (
            <div className={clsx(
              'p-6 rounded-2xl border-2',
              isDark 
                ? 'bg-niger-white-glass/20 border-niger-orange/20' 
                : 'bg-white border-gray-200 shadow-lg'
            )}>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white dark:text-niger-green-light">
                Fonctionnalités ({service.features.length})
              </h2>
              
              <div className="space-y-3">
                {service.features.map((feature, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg dark:border-secondary-600">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1 dark:text-niger-green-light">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-muted-foreground dark:text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statistiques */}
          <div className={clsx(
            'p-6 rounded-2xl border-2',
            isDark 
              ? 'bg-niger-white-glass/20 border-niger-orange/20' 
              : 'bg-white border-gray-200 shadow-lg'
          )}>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white dark:text-niger-green-light">
              Statistiques
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white text-niger-green dark:text-niger-green-light">
                  {service.usageCount || 0}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-muted-foreground dark:text-muted-foreground">
                  Utilisateurs
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white text-niger-green dark:text-niger-green-light">
                  {new Date(service.createdAt).toLocaleDateString('fr-FR')}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-muted-foreground dark:text-muted-foreground">
                  Date de création
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
// Fonction pour éviter le pré-rendu côté serveur pour les pages admin
export async function getServerSideProps(context) {
  // Cette page nécessite une authentification côté client
  // Nous retournons des props vides pour permettre le rendu côté client
  return {
    props: {}
  };
}