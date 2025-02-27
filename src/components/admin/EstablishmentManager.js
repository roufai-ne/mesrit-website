import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Plus, Edit, Trash, X, MapPin, Globe, Building2, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { secureApi, useApiAction } from '@/lib/secureApi';
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
    <div className="w-full h-full flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ),
});

export default function EstablishmentManager() {
  const [establishments, setEstablishments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEstablishment, setEditingEstablishment] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
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

  const fetchEstablishments = useCallback(async () => {
    await execute(async () => {
      try {
        let url = '/api/establishments';
        const params = new URLSearchParams();
        
        if (filterStatus !== 'all') params.append('statut', filterStatus);
        if (filterRegion !== 'all') params.append('region', filterRegion);
        
        if (params.toString()) url += `?${params.toString()}`;
        
        const data = await secureApi.get(url, true);
        setEstablishments(data);
      } catch (error) {
        toast.error(error.message || 'Erreur lors du chargement des données');
      }
    });
  }, [filterStatus, filterRegion, execute]);
  
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
          fetchEstablishments();
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
          fetchEstablishments();
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
          <div className="bg-white rounded-lg p-4 shadow-md flex items-center">
            <Loader className="w-5 h-5 mr-3 animate-spin" />
            <span>Traitement en cours...</span>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestion des établissements</h2>
        <button 
          onClick={() => {
            setFormData(initialFormState);
            setEditingEstablishment(null);
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvel établissement
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="public">Public</option>
              <option value="privé">Privé</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Région</label>
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Toutes les régions</option>
              {REGIONS_NIGER.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement des établissements...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Logo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Région</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {establishments.map((establishment) => (
                <tr key={establishment._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <Image 
                      src={establishment.logo || '/images/logos/default.webp'} 
                      alt={establishment.nom}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-lg object-contain bg-gray-50"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{establishment.nom}</div>
                    {establishment.website && (
                      <a 
                        href={establishment.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center mt-1"
                      >
                        <Globe className="w-4 h-4 mr-1" />
                        Site web
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {establishment.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      establishment.statut === 'public' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {establishment.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                      {establishment.region}
                    </div>
                    <div className="text-sm text-gray-500">{establishment.ville}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => handleEdit(establishment)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(establishment._id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Supprimer"
                      >
                        <Trash className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-2/3 max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">
                  {editingEstablishment ? 'Modifier l\'établissement' : 'Nouvel établissement'}
                </h3>
                <button onClick={() => setShowForm(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nom de l'établissement</label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Sélectionner un type</option>
                      {TYPES_ETABLISSEMENT.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Statut</label>
                    <select
                      value={formData.statut}
                      onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Sélectionner un statut</option>
                      <option value="public">Public</option>
                      <option value="privé">Privé</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Région</label>
                    <select
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Sélectionner une région</option>
                      {REGIONS_NIGER.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Ville</label>
                    <input
                      type="text"
                      value={formData.ville}
                      onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Date d'ouverture</label>
                    <input
                      type="date"
                      value={formData.dateOuverture}
                      onChange={(e) => setFormData({ ...formData, dateOuverture: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Site web</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://..."
                    />
                  </div>

                  {/* Nouveaux champs pour Latitude et Longitude */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.coordinates.lat}
                      onChange={(e) => setFormData({
                        ...formData,
                        coordinates: { ...formData.coordinates, lat: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="ex: 13.5137"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.coordinates.lng}
                      onChange={(e) => setFormData({
                        ...formData,
                        coordinates: { ...formData.coordinates, lng: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="ex: 2.1098"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">Logo</label>
                  <div className="flex items-center space-x-4">
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={96}
                        height={96}
                        className="w-24 h-24 object-contain rounded-lg border bg-gray-50"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-50 rounded-lg border flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-gray-400" />
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
                          disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        {uploading ? 'Upload en cours...' : 'PNG, JPG ou GIF (max 5MB)'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
  <label className="block text-sm font-medium mb-1">Localisation sur la carte</label>
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
  <p className="text-sm text-gray-500 mt-1">
    Cliquez sur la carte pour définir la position ou déplacez le marqueur (ou saisissez les coordonnées ci-dessus)
  </p>
</div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                    placeholder="Description de l'établissement..."
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
          <div className="bg-white rounded-lg p-6 w-96 space-y-6">
            <h3 className="text-lg font-bold text-gray-900">Confirmer la suppression</h3>
            <p className="text-gray-600">
              Êtes-vous sûr de vouloir supprimer cet établissement ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteConfirmation({ show: false, id: null })}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
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
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-40">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Chargement des établissements...</p>
          </div>
        </div>
      )}
    </div>
  );
}