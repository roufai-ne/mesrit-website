import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Plus, Search, Edit, Trash2, Eye, Star } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePermission } from '@/hooks/usePermission';
import { clsx } from 'clsx';
import { secureApi, useApiAction } from '@/lib/secureApi';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/layout/AdminLayout';
import { ReadOnlyGuard } from '@/components/admin/PermissionGuard';

export default function AdminServices() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const permissions = usePermission();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { execute } = useApiAction();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      await execute(async () => {
        const data = await secureApi.get('/api/admin/services', true);
        if (data && data.services) {
          setServices(data.services);
        } else {
          throw new Error('Format de données invalide');
        }
      });
    } catch (error) {
      console.error('Erreur lors du chargement des services:', error);
      setError('Erreur lors du chargement des services');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = () => {
    if (!permissions.canManageServices) {
      alert('Vous n\'avez pas les permissions pour créer un service');
      return;
    }
    router.push('/admin/services/create');
  };

  const handleEditService = (serviceId) => {
    if (!permissions.canManageServices) {
      alert('Vous n\'avez pas les permissions pour modifier un service');
      return;
    }
    router.push(`/admin/services/${serviceId}/edit`);
  };

  const handleViewService = (serviceId) => {
    router.push(`/admin/services/${serviceId}`);
  };

  const handleDeleteService = async (serviceId) => {
    if (!permissions.canManageServices) {
      alert('Vous n\'avez pas les permissions pour supprimer un service');
      return;
    }
    
    if (confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      try {
        await execute(async () => {
          await secureApi.delete(`/api/admin/services/${serviceId}`, true);
          await fetchServices();
        });
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <h3 className="text-xl font-semibold mb-2">Erreur de chargement</h3>
          <p className="mb-4">{error}</p>
          <Button onClick={fetchServices} variant="outline">
            Réessayer
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Gestion des Services - Administration MESRIT</title>
        <meta name="description" content="Gestion des services en ligne du ministère" />
      </Head>

      <AdminLayout 
        title="Gestion des services" 
        subtitle={permissions.canManageServices ? "Gestion complète des services" : "Consultation des services"}
        requiredPermissions={['canManageServices', 'canViewServices']}
        requireAll={false}
      >
        {permissions.canManageServices ? (
          <div className="space-y-6">
            {/* En-tête */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white dark:text-niger-green-light">
                  Gestion des Services
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400 dark:text-muted-foreground dark:text-muted-foreground">
                  Gérez tous les services en ligne du ministère
                </p>
              </div>
              <Button
                onClick={handleCreateService}
                className="mt-4 sm:mt-0 px-6 py-3 bg-niger-orange hover:bg-niger-orange/90 text-white font-semibold rounded-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nouveau Service
              </Button>
            </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={clsx(
              'p-6 rounded-2xl border-2',
              isDark 
                ? 'bg-niger-white-glass/20 border-niger-orange/20' 
                : 'bg-white border-gray-200 shadow-lg'
            )}>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white dark:text-niger-green-light">
                  {services.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 dark:text-muted-foreground dark:text-muted-foreground">
                  Total Services
                </div>
              </div>
            </div>

            <div className={clsx(
              'p-6 rounded-2xl border-2',
              isDark 
                ? 'bg-niger-white-glass/20 border-niger-orange/20' 
                : 'bg-white border-gray-200 shadow-lg'
            )}>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white dark:text-niger-green-light">
                  {services.filter(s => s.status === 'published').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 dark:text-muted-foreground dark:text-muted-foreground">
                  Services Publiés
                </div>
              </div>
            </div>

            <div className={clsx(
              'p-6 rounded-2xl border-2',
              isDark 
                ? 'bg-niger-white-glass/20 border-niger-orange/20' 
                : 'bg-white border-gray-200 shadow-lg'
            )}>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white dark:text-niger-green-light">
                  {services.filter(s => s.isPopular).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 dark:text-muted-foreground dark:text-muted-foreground">
                  Services Populaires
                </div>
              </div>
            </div>
          </div>

          {/* Recherche */}
          <div className={clsx(
            'p-6 rounded-2xl border-2',
            isDark 
              ? 'bg-niger-white-glass/20 border-niger-orange/20' 
              : 'bg-white border-gray-200 shadow-lg'
          )}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher un service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-niger-orange focus:ring-4 focus:ring-niger-orange/20 dark:border-secondary-600"
              />
            </div>
          </div>

          {/* Tableau des services */}
          <div className={clsx(
            'rounded-2xl border-2 overflow-hidden',
            isDark 
              ? 'bg-niger-white-glass/20 border-niger-orange/20' 
              : 'bg-white border-gray-200 shadow-lg'
          )}>
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-niger-orange mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400 dark:text-muted-foreground dark:text-muted-foreground">Chargement des services...</p>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="p-8 text-center">
                <h3 className="text-xl font-semibold mb-2">Aucun service trouvé</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 dark:text-muted-foreground dark:text-muted-foreground">
                  Essayez de modifier vos critères de recherche ou créez un nouveau service.
                </p>
                <Button onClick={handleCreateService} variant="outline">
                  Créer un service
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={clsx(
                    'border-b-2',
                    isDark ? 'border-gray-700' : 'border-gray-200'
                  )}>
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider dark:text-muted-foreground dark:text-muted-foreground">
                        Service
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider dark:text-muted-foreground dark:text-muted-foreground">
                        Catégorie
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider dark:text-muted-foreground dark:text-muted-foreground">
                        Statut
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider dark:text-muted-foreground dark:text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-gray-200 dark:divide-gray-700 dark:divide-secondary-600">
                    {filteredServices.map((service) => (
                      <tr key={service._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-secondary-700 dark:hover:bg-secondary-700/50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white dark:text-niger-green-light">
                              {service.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-muted-foreground dark:text-muted-foreground">
                              {service.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full capitalize dark:bg-secondary-700 dark:text-niger-green-light">
                            {service.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={clsx(
                            'px-2 py-1 text-xs font-medium rounded-full',
                            service.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          )}>
                            {service.status === 'published' ? 'Publié' : 'Brouillon'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => handleViewService(service._id)}
                              variant="ghost"
                              size="sm"
                              className="p-2 text-blue-600 hover:text-blue-700 text-niger-orange dark:text-niger-orange"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {permissions.canManageServices && (
                              <Button
                                onClick={() => handleEditService(service._id)}
                                variant="ghost"
                                size="sm"
                                className="p-2 text-green-600 hover:text-green-700"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                            {permissions.canManageServices && (
                              <Button
                                onClick={() => handleDeleteService(service._id)}
                                variant="ghost"
                                size="sm"
                                className="p-2 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        ) : (
          <ReadOnlyGuard
            editPermission="canManageServices"
            viewPermission="canViewServices"
            readOnlyMessage="Consultation des services - Mode lecture seule"
          >
            <div className="space-y-6">
              {/* En-tête lecture seule */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white dark:text-niger-green-light">
                    Consultation des Services
                  </h1>
                  <p className="mt-2 text-gray-600 dark:text-gray-400 dark:text-muted-foreground dark:text-muted-foreground">
                    Consultez les services en ligne du ministère
                  </p>
                </div>
              </div>

              {/* Statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={clsx(
                  'p-6 rounded-2xl border-2',
                  isDark 
                    ? 'bg-niger-white-glass/20 border-niger-orange/20' 
                    : 'bg-white border-gray-200 shadow-lg'
                )}>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white dark:text-niger-green-light">
                      {services.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 dark:text-muted-foreground dark:text-muted-foreground">
                      Total Services
                    </div>
                  </div>
                </div>

                <div className={clsx(
                  'p-6 rounded-2xl border-2',
                  isDark 
                    ? 'bg-niger-white-glass/20 border-niger-orange/20' 
                    : 'bg-white border-gray-200 shadow-lg'
                )}>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white dark:text-niger-green-light">
                      {services.filter(s => s.status === 'published').length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 dark:text-muted-foreground dark:text-muted-foreground">
                      Services Publiés
                    </div>
                  </div>
                </div>

                <div className={clsx(
                  'p-6 rounded-2xl border-2',
                  isDark 
                    ? 'bg-niger-white-glass/20 border-niger-orange/20' 
                    : 'bg-white border-gray-200 shadow-lg'
                )}>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white dark:text-niger-green-light">
                      {services.filter(s => s.isPopular).length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 dark:text-muted-foreground dark:text-muted-foreground">
                      Services Populaires
                    </div>
                  </div>
                </div>
              </div>

              {/* Recherche */}
              <div className={clsx(
                'p-6 rounded-2xl border-2',
                isDark 
                  ? 'bg-niger-white-glass/20 border-niger-orange/20' 
                  : 'bg-white border-gray-200 shadow-lg'
              )}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Rechercher un service..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-niger-orange focus:ring-4 focus:ring-niger-orange/20 dark:border-secondary-600"
                  />
                </div>
              </div>

              {/* Tableau des services en lecture seule */}
              <div className={clsx(
                'rounded-2xl border-2 overflow-hidden',
                isDark 
                  ? 'bg-niger-white-glass/20 border-niger-orange/20' 
                  : 'bg-white border-gray-200 shadow-lg'
              )}>
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-niger-orange mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400 dark:text-muted-foreground dark:text-muted-foreground">Chargement des services...</p>
                  </div>
                ) : filteredServices.length === 0 ? (
                  <div className="p-8 text-center">
                    <h3 className="text-xl font-semibold mb-2">Aucun service trouvé</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 dark:text-muted-foreground dark:text-muted-foreground">
                      Essayez de modifier vos critères de recherche.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className={clsx(
                        'border-b-2',
                        isDark ? 'border-gray-700' : 'border-gray-200'
                      )}>
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider dark:text-muted-foreground dark:text-muted-foreground">
                            Service
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider dark:text-muted-foreground dark:text-muted-foreground">
                            Catégorie
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider dark:text-muted-foreground dark:text-muted-foreground">
                            Statut
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider dark:text-muted-foreground dark:text-muted-foreground">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-gray-200 dark:divide-gray-700 dark:divide-secondary-600">
                        {filteredServices.map((service) => (
                          <tr key={service._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-secondary-700 dark:hover:bg-secondary-700/50">
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white dark:text-niger-green-light">
                                  {service.title}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-muted-foreground dark:text-muted-foreground">
                                  {service.description}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full capitalize dark:bg-secondary-700 dark:text-niger-green-light">
                                {service.category}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={clsx(
                                'px-2 py-1 text-xs font-medium rounded-full',
                                service.status === 'published'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              )}>
                                {service.status === 'published' ? 'Publié' : 'Brouillon'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <Button
                                  onClick={() => handleViewService(service._id)}
                                  variant="ghost"
                                  size="sm"
                                  className="p-2 text-blue-600 hover:text-blue-700 text-niger-orange dark:text-niger-orange"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </ReadOnlyGuard>
        )}
      </AdminLayout>
    </>
  );
}
// Fonction pour éviter le pré-rendu côté serveur pour les pages admin
export async function getServerSideProps(context) {
  // Cette page nécessite une authentification côté client
  return {
    props: {}
  };
}