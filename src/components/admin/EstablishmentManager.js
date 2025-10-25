import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Plus, Edit, Trash, X, MapPin, Globe, Building2, Loader, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { secureApi, useApiAction } from '@/lib/secureApi';
import { useAuth } from '@/contexts/AuthContext';
import { usePermission } from '@/hooks/usePermission';
import dynamic from 'next/dynamic';
import { isValidLatLng } from '@/utils/mapUtils';

const REGIONS_NIGER = [
  'Agadez',
  'Diffa',
  'Dosso',
  'Maradi',
  'Niamey',
  'Tahoua',
  'Tillabéri',
  'Zinder'
];

const TYPES_ETABLISSEMENT = [
  'Université',
  'Institut',
  'École'
];

const MapPicker = dynamic(() => import('@/components/maps/MapPicker'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-niger-cream dark:bg-secondary-700 transition-colors">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-niger-orange"></div>
    </div>
  ),
});

export default function EstablishmentManager() {
  const { user } = useAuth();
  const permissions = usePermission();
  const [establishments, setEstablishments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEstablishment, setEditingEstablishment] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Permissions RBAC granulaires pour les établissements
  const canCreateEstablishments = permissions.canManageEstablishments;
  const canEditOwnEstablishments = permissions.canManageEstablishments;
  const canEditAllEstablishments = permissions.isSystemAdmin || permissions.isAdmin;
  const canDeleteEstablishments = permissions.isSystemAdmin || permissions.isAdmin;
  const canPublishEstablishments = permissions.isSystemAdmin || permissions.isAdmin;

  // Fonction pour vérifier si l'utilisateur peut éditer un établissement spécifique
  const canEditEstablishment = (establishment) => {
    if (canEditAllEstablishments) return true;
    if (canEditOwnEstablishments && establishment.createdBy === user?._id) return true;
    return false;
  };

  // Fonction pour vérifier si l'utilisateur peut supprimer un établissement spécifique
  const canDeleteEstablishment = (establishment) => {
    if (canDeleteEstablishments) return true;
    return false;
  };
  const [sortField, setSortField] = useState('nom');
  const [sortDirection, setSortDirection] = useState('asc');
  const [imagePreview, setImagePreview] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, id: null });
  const { execute, loading, error } = useApiAction();

  const initialFormState = {
    nom: '',
    type: '',
    statut: '',
    region: '',
    ville: '',
    dateOuverture: '',
    logo: '',
    website: '',
    description: '',
    coordinates: {
      lat: 13.5137,
      lng: 2.1098
    }
  };

  const [formData, setFormData] = useState(initialFormState);

  const showNotification = (message, type = 'success') => {
    toast[type](message);
  };

  const [filteredEstablishments, setFilteredEstablishments] = useState([]);

  const fetchEstablishments = useCallback(async () => {
    await execute(async () => {
      try {
        const data = await secureApi.get('/api/establishments', true);
        setEstablishments(data);
      } catch (error) {
        toast.error(error.message || 'Erreur lors du chargement des données');
      }
    });
  }, [execute]);

  // Filtrage côté client pour une meilleure performance
  useEffect(() => {
    let filtered = [...establishments];

    // Filtrer par recherche
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(establishment => 
        establishment.nom.toLowerCase().includes(search) ||
        establishment.ville.toLowerCase().includes(search) ||
        establishment.description?.toLowerCase().includes(search)
      );
    }

    // Filtrer par statut
    if (filterStatus !== 'all') {
      filtered = filtered.filter(establishment => establishment.statut === filterStatus);
    }

    // Filtrer par région
    if (filterRegion !== 'all') {
      filtered = filtered.filter(establishment => establishment.region === filterRegion);
    }

    // Filtrer par type
    if (filterType !== 'all') {
      filtered = filtered.filter(establishment => establishment.type === filterType);
    }

    // Trier les résultats
    filtered.sort((a, b) => {
      let aValue = a[sortField] || '';
      let bValue = b[sortField] || '';
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredEstablishments(filtered);
  }, [establishments, searchTerm, filterStatus, filterRegion, filterType, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  useEffect(() => {
    fetchEstablishments();
  }, [fetchEstablishments]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|gif)$/)) {
      toast.error('Format de fichier non supporté. Utilisez JPG, PNG ou GIF');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Le fichier est trop volumineux. Taille maximale : 5MB');
      return;
    }

    setUploading(true);
    setImagePreview(URL.createObjectURL(file));
    
    try {
      const result = await secureApi.uploadFile('/api/upload/establishment', file);
      
      if (result.success) {
        setFormData(prev => ({ ...prev, logo: result.url }));
        toast.success('Logo uploadé avec succès');
      } else {
        toast.error(result.error || 'Erreur lors de l\'upload');
        setImagePreview(null);
      }
    } catch (error) {
      setImagePreview(null);
      toast.error(error.message || 'Erreur lors de l\'upload du logo');
    } finally {
      setUploading(false);
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.nom.trim()) errors.push("Le nom de l'établissement est requis");
    if (!formData.type) errors.push("Le type d'établissement est requis");
    if (!formData.statut) errors.push("Le statut est requis");
    if (!formData.region) errors.push("La région est requise");
    if (!formData.ville.trim()) errors.push("La ville est requise");
    if (!formData.dateOuverture) errors.push("La date d'ouverture est requise");
    if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      errors.push("L'URL du site web doit commencer par http:// ou https://");
    }
    if (!formData.coordinates || 
        formData.coordinates.lat === undefined || 
        formData.coordinates.lng === undefined || 
        isNaN(formData.coordinates.lat) || 
        isNaN(formData.coordinates.lng)) {
      errors.push("Les coordonnées (latitude et longitude) doivent être des nombres valides");
    }
    
    return errors;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }
    
    await execute(async () => {
      try {
        let result;
        
        if (editingEstablishment) {
          result = await secureApi.put(`/api/establishments/${editingEstablishment}`, formData);
        } else {
          result = await secureApi.post('/api/establishments', formData);
        }

        if (result.success) {
          showNotification(
            editingEstablishment 
              ? 'Établissement mis à jour avec succès' 
              : 'Nouvel établissement ajouté avec succès',
            'success'
          );
          setShowForm(false);
          setFormData(initialFormState);
          setEditingEstablishment(null);
          setImagePreview(null);
          await fetchEstablishments();
        } else {
          showNotification(result.error || 'Une erreur est survenue', 'error');
        }
      } catch (error) {
        showNotification(error.message || 'Une erreur est survenue', 'error');
      }
    });
  };

  const handleEdit = (establishment) => {
    setEditingEstablishment(establishment._id);
    setFormData({
      nom: establishment.nom || '',
      type: establishment.type || '',
      statut: establishment.statut || '',
      region: establishment.region || '',
      ville: establishment.ville || '',
      dateOuverture: establishment.dateOuverture 
        ? new Date(establishment.dateOuverture).toISOString().split('T')[0] 
        : '',
      logo: establishment.logo || '',
      website: establishment.website || '',
      description: establishment.description || '',
      coordinates: establishment.coordinates || { lat: 13.5137, lng: 2.1098 }
    });
    setImagePreview(establishment.logo || null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    setDeleteConfirmation({ show: true, id });
  };

  const confirmDelete = async () => {
    const id = deleteConfirmation.id;
    await execute(async () => {
      try {
        const result = await secureApi.delete(`/api/establishments/${id}`);
        if (result.success) {
          showNotification('Établissement supprimé avec succès', 'success');
          setDeleteConfirmation({ show: false, id: null });
          await fetchEstablishments();
        } else {
          showNotification(result.error || 'Erreur lors de la suppression', 'error');
        }
      } catch (error) {
        showNotification(error.message || 'Erreur lors de la suppression', 'error');
      }
    });
  };

  return (
    <div className="p-6">
      {loading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 shadow-md flex items-center dark:bg-secondary-800">
            <Loader className="w-5 h-5 mr-3 animate-spin" />
            <span>Traitement en cours...</span>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-niger-green dark:text-niger-green-light">Gestion des établissements</h2>
        {canCreateEstablishments && (
          <button
            onClick={() => {
              setFormData(initialFormState);
              setEditingEstablishment(null);
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-niger-orange to-niger-green hover:shadow-lg text-white px-4 py-2 rounded-lg flex items-center transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvel établissement
          </button>
        )}
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow border border-niger-orange/10 p-4 mb-6 transition-colors duration-300">
        {/* Barre de recherche */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-readable-muted dark:text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher par nom, ville ou description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-niger-orange/20 focus:border-niger-orange duration-300 placeholder:text-readable-muted dark:placeholder:text-muted-foreground"
            />
          </div>
        </div>
        
        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Statut</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2 border rounded-lg  border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-niger-orange/20 focus:border-niger-orange duration-300"
            >
              <option value="all">Tous les statuts</option>
              <option value="public">Public</option>
              <option value="privé">Privé</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Région</label>
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="w-full p-2 border rounded-lg  border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-niger-orange/20 focus:border-niger-orange duration-300"
            >
              <option value="all">Toutes les régions</option>
              {REGIONS_NIGER.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-niger-green dark:text-niger-green-light mb-1">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full p-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
            >
              <option value="all">Tous les types</option>
              {TYPES_ETABLISSEMENT.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Statistiques et actions */}
        <div className="mt-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap gap-4 text-sm text-readable-muted dark:text-muted-foreground">
            <span>Total: {filteredEstablishments.length} établissement{filteredEstablishments.length > 1 ? 's' : ''}</span>
            {establishments.length > 0 && filteredEstablishments.length !== establishments.length && (
              <span>sur {establishments.length}</span>
            )}
            {searchTerm && (
              <span className="text-niger-orange">
                Recherche: "{searchTerm}"
              </span>
            )}
          </div>
          {(searchTerm || filterStatus !== 'all' || filterRegion !== 'all' || filterType !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterRegion('all');
                setFilterType('all');
                setSortField('nom');
                setSortDirection('asc');
              }}
              className="text-sm px-3 py-1 text-niger-orange hover:bg-niger-orange/10 rounded-lg transition-colors"
            >
              Effacer les filtres
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-niger-orange"></div>
          <p className="mt-4 text-readable-muted dark:text-muted-foreground">Chargement des établissements...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden dark:bg-secondary-800">
          <table className="w-full">
            <thead>
              <tr className="bg-niger-cream dark:bg-secondary-700 border-b border-niger-orange/10">
                <th className="px-6 py-3 text-left text-xs font-medium text-niger-green dark:text-niger-green-light uppercase">Logo</th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-niger-green dark:text-niger-green-light uppercase cursor-pointer hover:bg-niger-orange/10 transition-colors"
                  onClick={() => handleSort('nom')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Nom</span>
                    {sortField === 'nom' && (
                      <span className="text-niger-orange">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-niger-green dark:text-niger-green-light uppercase cursor-pointer hover:bg-niger-orange/10 transition-colors"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Type</span>
                    {sortField === 'type' && (
                      <span className="text-niger-orange">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-niger-green dark:text-niger-green-light uppercase">Statut</th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-niger-green dark:text-niger-green-light uppercase cursor-pointer hover:bg-niger-orange/10 transition-colors"
                  onClick={() => handleSort('region')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Région</span>
                    {sortField === 'region' && (
                      <span className="text-niger-orange">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-niger-green dark:text-niger-green-light uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-secondary-600">
              {filteredEstablishments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Building2 className="w-12 h-12 text-readable-muted dark:text-muted-foreground" />
                      <p className="text-lg font-medium text-niger-green dark:text-niger-green-light">
                        {searchTerm || filterStatus !== 'all' || filterRegion !== 'all' || filterType !== 'all'
                          ? 'Aucun établissement trouvé'
                          : 'Aucun établissement enregistré'
                        }
                      </p>
                      <p className="text-readable-muted dark:text-muted-foreground">
                        {searchTerm || filterStatus !== 'all' || filterRegion !== 'all' || filterType !== 'all'
                          ? 'Essayez de modifier vos critères de recherche ou effacez les filtres'
                          : 'Commencez par ajouter un nouvel établissement en cliquant sur le bouton ci-dessus'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEstablishments.map((establishment) => (
                <tr key={establishment._id} className="hover:bg-niger-cream/50 dark:hover:bg-secondary-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <Image 
                      src={establishment.logo || '/images/logos/default.webp'} 
                      alt={establishment.nom}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-lg object-contain bg-gray-50 dark:bg-secondary-700"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-niger-green dark:text-niger-green-light">{establishment.nom}</div>
                    {establishment.website && (
                      <a 
                        href={establishment.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center mt-1 text-niger-orange dark:text-niger-orange"
                      >
                        <Globe className="w-4 h-4 mr-1" />
                        Site web
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      establishment.type === 'Université' 
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-400'
                        : establishment.type === 'Institut'
                        ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-400'
                        : 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400'
                    }`}>
                      {establishment.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      establishment.statut === 'public' 
                        ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400'
                        : 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-400'
                    }`}>
                      {establishment.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-readable-muted dark:text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-1 text-niger-orange" />
                      {establishment.region}
                    </div>
                    <div className="text-sm text-readable-muted dark:text-muted-foreground">{establishment.ville}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-3">
                      {canEditEstablishment(establishment) && (
                        <button 
                          onClick={() => handleEdit(establishment)}
                          className="p-2 text-niger-green dark:text-niger-green-light hover:text-niger-orange hover:bg-niger-orange/10 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {canDeleteEstablishment(establishment) && (
                        <button 
                          onClick={() => handleDelete(establishment._id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-2/3 max-h-[90vh] overflow-auto dark:bg-secondary-800">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-niger-green dark:text-niger-green-light">
                  {editingEstablishment ? 'Modifier l\'établissement' : 'Nouvel établissement'}
                </h3>
                <button onClick={() => setShowForm(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Nom de l'établissement</label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2  border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2  border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                      required
                    >
                      <option value="">Sélectionner un type</option>
                      {TYPES_ETABLISSEMENT.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Statut</label>
                    <select
                      value={formData.statut}
                      onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2  border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                      required
                    >
                      <option value="">Sélectionner un statut</option>
                      <option value="public">Public</option>
                      <option value="privé">Privé</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Région</label>
                    <select
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2  border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                      required
                    >
                      <option value="">Sélectionner une région</option>
                      {REGIONS_NIGER.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Ville</label>
                    <input
                      type="text"
                      value={formData.ville}
                      onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2  border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Date d'ouverture</label>
                    <input
                      type="date"
                      value={formData.dateOuverture}
                      onChange={(e) => setFormData({ ...formData, dateOuverture: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2  border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Site web</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2  border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                      placeholder="https://..."
                    />
                  </div>

                  {/* Nouveaux champs pour Latitude et Longitude */}
                  <div>
                    <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.coordinates.lat}
                      onChange={(e) => setFormData({
                        ...formData,
                        coordinates: { ...formData.coordinates, lat: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full p-2 border rounded-lg focus:ring-2  border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                      placeholder="ex: 13.5137"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.coordinates.lng}
                      onChange={(e) => setFormData({
                        ...formData,
                        coordinates: { ...formData.coordinates, lng: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full p-2 border rounded-lg focus:ring-2  border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                      placeholder="ex: 2.1098"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 text-niger-green dark:text-niger-green-light">Logo</label>
                  <div className="flex items-center space-x-4">
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={96}
                        height={96}
                        className="w-24 h-24 object-contain rounded-lg border bg-gray-50 dark:bg-secondary-700"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-50 rounded-lg border flex items-center justify-center dark:bg-secondary-700">
                        <Building2 className="w-8 h-8 text-gray-400 dark:text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        onChange={handleImageUpload}
                        accept="image/*"
                        disabled={uploading}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100
                          disabled:opacity-50 disabled:cursor-not-allowed dark:text-muted-foreground"
                      />
                      <p className="mt-1 text-sm text-gray-500 dark:text-muted-foreground">
                        {uploading ? 'Upload en cours...' : 'PNG, JPG ou GIF (max 5MB)'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
  <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Localisation sur la carte</label>
  <div className="h-[400px] mb-4 rounded-lg overflow-hidden border">
    <MapPicker
      position={formData.coordinates && isValidLatLng(formData.coordinates.lat, formData.coordinates.lng) 
        ? { lat: formData.coordinates.lat, lng: formData.coordinates.lng } 
        : null}
      onPositionChange={(latlng) => {
        setFormData({
          ...formData,
          coordinates: {
            lat: latlng.lat,
            lng: latlng.lng
          }
        });
      }}
    />
  </div>
  <p className="text-sm text-gray-500 mt-1 dark:text-muted-foreground">
    Cliquez sur la carte pour définir la position ou déplacez le marqueur (ou saisissez les coordonnées ci-dessus)
  </p>
</div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2  h-32 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                    placeholder="Description de l'établissement..."
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors dark:bg-secondary-700 dark:hover:bg-secondary-700/50 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white rounded-lg bg-gradient-to-r from-niger-orange to-niger-green hover:shadow-lg transition-all duration-300"
                  >
                    {editingEstablishment ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 space-y-6 dark:bg-secondary-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-niger-green-light">Confirmer la suppression</h3>
            <p className="text-gray-600 dark:text-muted-foreground">
              Êtes-vous sûr de vouloir supprimer cet établissement ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteConfirmation({ show: false, id: null })}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors dark:bg-secondary-700 dark:hover:bg-secondary-700/50 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-40 dark:bg-secondary-800">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-muted-foreground">Chargement des établissements...</p>
          </div>
        </div>
      )}
    </div>
  );
}
