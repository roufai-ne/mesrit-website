import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { clsx } from 'clsx';
import { secureApi, useApiAction } from '@/lib/secureApi';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/layout/AdminLayout';

export default function CreateService() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    longDescription: '',
    icon: 'Settings',
    category: 'etudiants',
    status: 'draft',
    url: '',
    isExternal: false,
    isPopular: false,
    priority: 0,
    tags: [],
    image: ''
  });

  const [features, setFeatures] = useState([
    { title: '', description: '' }
  ]);

  const { execute } = useApiAction();

  const categories = [
    { value: 'etudiants', label: 'Étudiants' },
    { value: 'etablissements', label: 'Établissements' },
    { value: 'recherche', label: 'Recherche' },
    { value: 'administration', label: 'Administration' },
    { value: 'formation', label: 'Formation' }
  ];

  const icons = [
    'Settings', 'GraduationCap', 'Users', 'FileText', 'Search', 
    'BookOpen', 'Award', 'Calendar', 'Mail', 'Phone', 
    'MapPin', 'Globe', 'Database', 'Shield', 'TrendingUp', 'Lightbulb'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFeatureChange = (index, field, value) => {
    const newFeatures = [...features];
    newFeatures[index][field] = value;
    setFeatures(newFeatures);
  };

  const addFeature = () => {
    setFeatures([...features, { title: '', description: '' }]);
  };

  const removeFeature = (index) => {
    if (features.length > 1) {
      setFeatures(features.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Filtrer les features vides
      const validFeatures = features.filter(f => f.title.trim() && f.description.trim());
      
      const serviceData = {
        ...formData,
        features: validFeatures,
        tags: formData.tags.filter(tag => tag.trim())
      };

      await execute(async () => {
        await secureApi.post('/api/admin/services', serviceData, true);
        router.push('/admin/services');
      });
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      setError('Erreur lors de la création du service');
    } finally {
      setLoading(false);
    }
  };

  const handleTagsChange = (e) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({ ...prev, tags: tagsArray }));
  };

  // Handle authentication redirect in useEffect to avoid SSR issues
  useEffect(() => {
    if (user && !['super-admin', 'system-admin', 'content-admin'].includes(user.role)) {
      router.push('/admin');
    }
  }, [user, router]);

  // Don't render if user is not authenticated or doesn't have the right role
  if (!user || !['super-admin', 'system-admin', 'content-admin'].includes(user.role)) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Créer un Service - Administration MESRIT</title>
        <meta name="description" content="Créer un nouveau service en ligne" />
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
                  Créer un Service
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400 dark:text-muted-foreground dark:text-muted-foreground">
                  Ajoutez un nouveau service au ministère
                </p>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                {/* Titre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-niger-green dark:text-niger-green-light">
                    Titre du service *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-niger-orange focus:ring-4 focus:ring-niger-orange/20 transition-all duration-300 dark:border-secondary-600"
                    placeholder="Ex: Inscription en ligne"
                  />
                </div>

                {/* Catégorie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-niger-green dark:text-niger-green-light">
                    Catégorie *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-niger-orange focus:ring-4 focus:ring-niger-orange/20 transition-all duration-300 dark:border-secondary-600"
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Icône */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-niger-green dark:text-niger-green-light">
                    Icône
                  </label>
                  <select
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-niger-orange focus:ring-4 focus:ring-niger-orange/20 transition-all duration-300 dark:border-secondary-600"
                  >
                    {icons.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Statut */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-niger-green dark:text-niger-green-light">
                    Statut
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-niger-orange focus:ring-4 focus:ring-niger-orange/20 transition-all duration-300 dark:border-secondary-600"
                  >
                    <option value="draft">Brouillon</option>
                    <option value="published">Publié</option>
                  </select>
                </div>

                {/* URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-niger-green dark:text-niger-green-light">
                    URL du service
                  </label>
                  <input
                    type="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-niger-orange focus:ring-4 focus:ring-niger-orange/20 transition-all duration-300 dark:border-secondary-600"
                    placeholder="https://exemple.com"
                  />
                </div>

                {/* Priorité */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-niger-green dark:text-niger-green-light">
                    Priorité d'affichage
                  </label>
                  <input
                    type="number"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-niger-orange focus:ring-4 focus:ring-niger-orange/20 transition-all duration-300 dark:border-secondary-600"
                  />
                </div>
              </div>

              {/* Description courte */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-niger-green dark:text-niger-green-light">
                  Description courte *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-niger-orange focus:ring-4 focus:ring-niger-orange/20 transition-all duration-300 dark:border-secondary-600"
                  placeholder="Description courte du service (visible dans la liste)"
                />
              </div>

              {/* Description longue */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-niger-green dark:text-niger-green-light">
                  Description longue *
                </label>
                <textarea
                  name="longDescription"
                  value={formData.longDescription}
                  onChange={handleInputChange}
                  required
                  rows="5"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-niger-orange focus:ring-4 focus:ring-niger-orange/20 transition-all duration-300 dark:border-secondary-600"
                  placeholder="Description détaillée du service"
                />
              </div>

              {/* Tags */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-niger-green dark:text-niger-green-light">
                  Tags (séparés par des virgules)
                </label>
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={handleTagsChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-niger-orange focus:ring-4 focus:ring-niger-orange/20 transition-all duration-300 dark:border-secondary-600"
                  placeholder="inscription, formation, en ligne"
                />
              </div>

              {/* Options */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isExternal"
                      checked={formData.isExternal}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-niger-orange border-gray-300 rounded focus:ring-niger-orange dark:border-secondary-600"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 dark:text-niger-green-light">
                      Service externe
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isPopular"
                      checked={formData.isPopular}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-niger-orange border-gray-300 rounded focus:ring-niger-orange dark:border-secondary-600"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 dark:text-niger-green-light">
                      Service populaire
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Fonctionnalités */}
            <div className={clsx(
              'p-6 rounded-2xl border-2',
              isDark 
                ? 'bg-niger-white-glass/20 border-niger-orange/20' 
                : 'bg-white border-gray-200 shadow-lg'
            )}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white dark:text-niger-green-light">
                  Fonctionnalités du service
                </h2>
                <Button
                  type="button"
                  onClick={addFeature}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter</span>
                </Button>
              </div>

              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 border-2 border-gray-200 rounded-xl dark:border-secondary-600">
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        value={feature.title}
                        onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                        placeholder="Titre de la fonctionnalité"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-niger-orange focus:ring-2 focus:ring-niger-orange/20 dark:border-secondary-600"
                      />
                      <textarea
                        value={feature.description}
                        onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                        placeholder="Description de la fonctionnalité"
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-niger-orange focus:ring-2 focus:ring-niger-orange/20 dark:border-secondary-600"
                      />
                    </div>
                    {features.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeFeature(index)}
                        variant="ghost"
                        size="sm"
                        className="p-2 text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Image */}
            <div className={clsx(
              'p-6 rounded-2xl border-2',
              isDark 
                ? 'bg-niger-white-glass/20 border-niger-orange/20' 
                : 'bg-white border-gray-200 shadow-lg'
            )}>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white dark:text-niger-green-light">
                Image du service
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-niger-green dark:text-niger-green-light">
                  URL de l'image
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-niger-orange focus:ring-4 focus:ring-niger-orange/20 transition-all duration-300 dark:border-secondary-600"
                  placeholder="https://exemple.com/image.jpg"
                />
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex items-center justify-end space-x-4">
              <Button
                type="button"
                onClick={() => router.back()}
                variant="outline"
                className="px-6 py-3"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-niger-orange hover:bg-niger-orange/90 text-white font-semibold"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Créer le service
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Affichage des erreurs */}
          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>
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