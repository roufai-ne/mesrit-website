import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Plus, Edit, Trash, X, Loader, Search, Users, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { secureApi, useApiAction } from '@/lib/secureApi';

const POSTES_DIRECTION = [
  // Haute direction
  { value: 'ministre', label: 'Ministre', category: 'cabinet' },
  { value: 'sg', label: 'Secrétaire Général', category: 'cabinet' },
  { value: 'sga', label: 'Secrétaire Général Adjoint', category: 'cabinet' },
  { value: 'dges', label: 'Directeur Général de l\'Enseignement Supérieur', category: 'cabinet' },
  { value: 'dgr', label: 'Directrice Général de la Recherche', category: 'cabinet' },
  { value: 'igs', label: 'Inspecteur Général des Services', category: 'cabinet' },

  // Directions nationales SG
  { value: 'daf', label: 'Direction des Affaires Financières et du Matériel', category: 'sg' },
  { value: 'drh', label: 'Direction des Ressources Humaines', category: 'sg' },
  { value: 'dmp', label: 'Direction des Marchés Publics et Délégation des Services', category: 'sg' },
  { value: 'dsi', label: 'Direction des Statistiques et de l\'Informatique', category: 'sg' },
  { value: 'daidrp', label: 'Direction des Archives, de l\'Information, de la Documentation et des Relations Publiques', category: 'sg' },

  // Directions DGES
  { value: 'desp', label: 'Direction de l\'Enseignement Supérieur Public', category: 'dges' },
  { value: 'despri', label: 'Direction de l\'Enseignement Supérieur Privé', category: 'dges' },
  { value: 'dbau', label: 'Direction des Bourses et Aides Universitaires', category: 'dges' },
  
  // Directions DGR
  { value: 'dr', label: 'Direction de la Recherche', category: 'dgr' },
  { value: 'dit', label: 'Direction de l\'Innovation Technologique', category: 'dgr' }
];

export default function DirectorManager() {
  const [directors, setDirectors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDirector, setEditingDirector] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const { execute, loading: actionLoading } = useApiAction();
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortField, setSortField] = useState('titre');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filteredDirectors, setFilteredDirectors] = useState([]);

  const initialFormState = {
    titre: '',
    nom: '',
    photo: '',
    email: '',
    telephone: '',
    message: '',
    key: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // Fonction pour fermer le formulaire et réinitialiser les états
  const closeForm = () => {
    setShowForm(false);
    setFormData(initialFormState);
    setEditingDirector(null);
    setImagePreview(null);
  };
  

  const fetchDirectors = useCallback(async () => {
    try {
      const data = await secureApi.get('/api/directors', true);
      setDirectors(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors du chargement des données');
    }
  }, []);

  // Filtrage et tri côté client
  useEffect(() => {
    let filtered = [...directors];

    // Filtrer par recherche
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(director => 
        director.nom.toLowerCase().includes(search) ||
        director.titre.toLowerCase().includes(search) ||
        director.email?.toLowerCase().includes(search) ||
        director.message?.toLowerCase().includes(search)
      );
    }

    // Filtrer par catégorie
    if (filterCategory !== 'all') {
      filtered = filtered.filter(director => {
        const poste = POSTES_DIRECTION.find(p => p.label === director.titre);
        return poste && poste.category === filterCategory;
      });
    }

    // Trier les résultats
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      if (sortField === 'titre') {
        // Tri hiérarchique pour les titres
        const posteA = POSTES_DIRECTION.find(p => p.label === a.titre);
        const posteB = POSTES_DIRECTION.find(p => p.label === b.titre);
        const indexA = posteA ? POSTES_DIRECTION.indexOf(posteA) : 999;
        const indexB = posteB ? POSTES_DIRECTION.indexOf(posteB) : 999;
        
        if (sortDirection === 'asc') {
          return indexA - indexB;
        } else {
          return indexB - indexA;
        }
      } else {
        aValue = (a[sortField] || '').toLowerCase();
        bValue = (b[sortField] || '').toLowerCase();
        
        if (sortDirection === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      }
    });

    setFilteredDirectors(filtered);
  }, [directors, searchTerm, filterCategory, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  useEffect(() => {
    fetchDirectors();
  }, [fetchDirectors]);

  useEffect(() => {
    if (formData.titre) {
      const poste = POSTES_DIRECTION.find(p => p.label === formData.titre);
      if (poste) {
        setFormData(prev => ({
          ...prev,
          key: poste.value.toUpperCase()
        }));
      }
    }
  }, [formData.titre]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérifications côté client
    if (!file.type.match(/^image\/(jpeg|png|gif)$/)) {
      toast.error('Format de fichier non supporté. Utilisez JPG, PNG ou GIF');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('Le fichier est trop volumineux. Taille maximale : 5MB');
      return;
    }

    const formDataFile = new FormData();
    formDataFile.append('file', file);

    setUploading(true);
    setImagePreview(URL.createObjectURL(file));
    
    try {
      const result = await secureApi.uploadFile('/api/upload/dir', file);
      
      if (result.success) {
        setFormData(prev => ({ ...prev, photo: result.url }));
        toast.success('Photo uploadée avec succès');
      } else {
        toast.error(result.error || 'Erreur lors de l\'upload');
        setImagePreview(null);
      }
    } catch (error) {
      setImagePreview(null);
      toast.error(error.message || 'Erreur lors de l\'upload');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    await execute(async () => {
      try {
        // Validation côté client
        if (!formData.titre || !formData.nom) {
          toast.error('Le titre et le nom sont requis');
          return;
        }
        
        let result;
        if (editingDirector) {
          result = await secureApi.put(`/api/directors/${editingDirector}`, formData);
        } else {
          result = await secureApi.post('/api/directors', formData);
        }

        if (result.success) {
          toast.success(result.message || (editingDirector 
            ? 'Responsable mis à jour avec succès' 
            : 'Nouveau responsable ajouté avec succès')
          );
          closeForm();
          await fetchDirectors();
        } else {
          // Gestion des erreurs spécifiques
          handleApiError(result);
        }
      } catch (error) {
        // Gestion des erreurs de réseau ou autres
        if (error.response && error.response.data) {
          handleApiError(error.response.data);
        } else {
          toast.error(error.message || 'Une erreur de connexion est survenue');
        }
      }
    });
  };

  // Fonction pour gérer les erreurs API de manière spécifique
  const handleApiError = (errorData) => {
    const { error, code, field, existing } = errorData;
    
    switch (code) {
      case 'DUPLICATE_KEY':
        toast.error(`Erreur : ${error}`, {
          duration: 5000,
          icon: '⚠️'
        });
        break;
        
      case 'DUPLICATE_TITLE':
        toast.error(
          <div>
            <div className="font-medium">{error}</div>
            {existing && (
              <div className="text-sm mt-1 opacity-75">
                Responsable actuel : {existing.nom}
              </div>
            )}
          </div>,
          {
            duration: 6000,
            icon: '👥'
          }
        );
        break;
        
      case 'MONGODB_DUPLICATE':
        toast.error(`Doublon détecté : Cette valeur existe déjà pour "${field}"`, {
          duration: 5000,
          icon: '🔄'
        });
        break;
        
      case 'VALIDATION_ERROR':
        if (errorData.details && Array.isArray(errorData.details)) {
          errorData.details.forEach(detail => {
            toast.error(`${detail.field}: ${detail.message}`, {
              duration: 4000
            });
          });
        } else {
          toast.error(error || 'Erreur de validation des données');
        }
        break;
        
      case 'NOT_FOUND':
        toast.error('Le responsable que vous essayez de modifier n\'existe plus', {
          duration: 5000,
          icon: '❌'
        });
        // Rafraîchir la liste
        fetchDirectors();
        closeForm();
        break;
        
      default:
        toast.error(error || 'Une erreur est survenue');
    }
  };


  const handleDelete = async (id) => {
    // Trouver le responsable pour afficher son nom dans la confirmation
    const director = directors.find(d => d._id === id);
    const confirmMessage = director 
      ? `Êtes-vous sûr de vouloir supprimer ${director.nom} (${director.titre}) ?`
      : 'Êtes-vous sûr de vouloir supprimer ce responsable ?';
      
    if (window.confirm(confirmMessage)) {
      await execute(async () => {
        try {
          const result = await secureApi.delete(`/api/directors/${id}`);
          
          if (result.success) {
            toast.success(result.message || 'Responsable supprimé avec succès');
            await fetchDirectors();
          } else {
            handleApiError(result);
          }
        } catch (error) {
          if (error.response && error.response.data) {
            handleApiError(error.response.data);
          } else {
            toast.error(error.message || 'Erreur lors de la suppression');
          }
        }
      });
    }
  };

  const handleEdit = (director) => {
    if (!director || !director._id) {
      console.error('Directeur invalide:', director);
      return;
    }
    
    setEditingDirector(director._id);
    setFormData({
      titre: director.titre || '',
      nom: director.nom || '',
      photo: director.photo || '',
      email: director.email || '',
      telephone: director.telephone || '',
      message: director.message || '',
      key: director.key || ''
    });
    setImagePreview(director.photo || null);
    setShowForm(true);
  };

  const getDirectionCategory = (titre) => {
    const poste = POSTES_DIRECTION.find(p => p.label === titre);
    return poste ? poste.category : '';
  };

  return (
    <div className="p-6">
      {actionLoading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 shadow-md flex items-center dark:bg-secondary-800">
            <Loader className="w-5 h-5 mr-3 animate-spin" />
            <span>Traitement en cours...</span>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-niger-green dark:text-niger-green-light">Gestion des responsables</h2>
        <button 
          onClick={() => {
            setFormData(initialFormState);
            setEditingDirector(null);
            setImagePreview(null); // Réinitialiser l'aperçu photo
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-niger-orange to-niger-green text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau responsable
        </button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow border border-niger-orange/10 p-4 mb-6 transition-colors duration-300">
        {/* Barre de recherche */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-readable-muted dark:text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher par nom, poste, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300 placeholder:text-readable-muted dark:placeholder:text-muted-foreground"
            />
          </div>
        </div>
        
        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-niger-green dark:text-niger-green-light mb-1">Catégorie</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full p-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
            >
              <option value="all">Toutes les catégories</option>
              <option value="cabinet">Cabinet ministériel</option>
              <option value="sg">Secrétariat Général</option>
              <option value="dges">DGES</option>
              <option value="dgr">DGR</option>
            </select>
          </div>
        </div>
        
        {/* Statistiques et actions */}
        <div className="mt-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap gap-4 text-sm text-readable-muted dark:text-muted-foreground">
            <span>Total: {filteredDirectors.length} responsable{filteredDirectors.length > 1 ? 's' : ''}</span>
            {directors.length > 0 && filteredDirectors.length !== directors.length && (
              <span>sur {directors.length}</span>
            )}
            {searchTerm && (
              <span className="text-niger-orange">
                Recherche: "{searchTerm}"
              </span>
            )}
          </div>
          {(searchTerm || filterCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('all');
                setSortField('titre');
                setSortDirection('asc');
              }}
              className="text-sm px-3 py-1 text-niger-orange hover:bg-niger-orange/10 rounded-lg transition-colors"
            >
              Effacer les filtres
            </button>
          )}
        </div>
      </div>

      {actionLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-niger-orange"></div>
          <p className="mt-4 text-readable-muted dark:text-muted-foreground">Chargement des responsables...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow border border-niger-orange/10 overflow-hidden transition-colors duration-300">
          <table className="w-full">
            <thead>
              <tr className="bg-niger-cream dark:bg-secondary-700 border-b border-niger-orange/10">
                <th className="px-6 py-3 text-left text-xs font-medium text-niger-green dark:text-niger-green-light uppercase">Photo</th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-niger-green dark:text-niger-green-light uppercase cursor-pointer hover:bg-niger-orange/10 transition-colors"
                  onClick={() => handleSort('titre')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Poste</span>
                    {sortField === 'titre' && (
                      <span className="text-niger-orange">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-niger-green dark:text-niger-green-light uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-niger-green dark:text-niger-green-light uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-niger-orange/10">
              {filteredDirectors.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Users className="w-12 h-12 text-readable-muted dark:text-muted-foreground" />
                      <p className="text-lg font-medium text-niger-green dark:text-niger-green-light">
                        {searchTerm || filterCategory !== 'all'
                          ? 'Aucun responsable trouvé'
                          : 'Aucun responsable enregistré'
                        }
                      </p>
                      <p className="text-readable-muted dark:text-muted-foreground">
                        {searchTerm || filterCategory !== 'all'
                          ? 'Essayez de modifier vos critères de recherche ou effacez les filtres'
                          : 'Commencez par ajouter un nouveau responsable en cliquant sur le bouton ci-dessus'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDirectors.map((director) => (
                <tr key={director._id} className="hover:bg-niger-cream/50 dark:hover:bg-secondary-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <Image 
                      src={director.photo || '/images/dir/default.jpg'} 
                      alt={director.nom}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-niger-green dark:text-niger-green-light">{director.titre}</span>
                      {getDirectionCategory(director.titre) !== 'cabinet' && (
                        <span className={`mt-1 inline-flex w-fit px-2 py-1 text-xs rounded-full font-medium ${
                          getDirectionCategory(director.titre) === 'sg'
                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-400'
                            : getDirectionCategory(director.titre) === 'dges'
                            ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-400'
                            : 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400'
                        }`}>
                          {getDirectionCategory(director.titre).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-niger-green dark:text-niger-green-light font-medium">{director.nom}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-readable-muted dark:text-muted-foreground">{director.email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(director)}
                        className="p-2 text-niger-green dark:text-niger-green-light hover:text-niger-orange hover:bg-niger-orange/10 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(director._id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-2/3 max-h-[90vh] overflow-auto dark:bg-secondary-800">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-niger-green dark:text-niger-green-light">
                  {editingDirector ? 'Modifier le responsable' : 'Nouveau responsable'}
                </h3>
                <button onClick={closeForm}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Poste</label>
                  <select
                    value={formData.titre}
                    onChange={(e) => setFormData({...formData, titre: e.target.value})}
                    className="w-full p-2 border rounded border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                    required
                  >
                    <option value="">Sélectionner un poste</option>
                    <optgroup label="Cabinet">
                      {POSTES_DIRECTION
                        .filter(poste => poste.category === 'cabinet')
                        .map((poste) => (
                          <option key={poste.value} value={poste.label}>
                            {poste.label}
                          </option>
                        ))
                      }
                    </optgroup>
                    <optgroup label="Directions sous SG">
                      {POSTES_DIRECTION
                        .filter(poste => poste.category === 'sg')
                        .map((poste) => (
                          <option key={poste.value} value={poste.label}>
                            {poste.label}
                          </option>
                        ))
                      }
                    </optgroup>
                    <optgroup label="Directions sous DGES">
                      {POSTES_DIRECTION
                        .filter(poste => poste.category === 'dges')
                        .map((poste) => (
                          <option key={poste.value} value={poste.label}>
                            {poste.label}
                          </option>
                        ))
                      }
                    </optgroup>
                    <optgroup label="Directions sous DGR">
                      {POSTES_DIRECTION
                        .filter(poste => poste.category === 'dgr')
                        .map((poste) => (
                          <option key={poste.value} value={poste.label}>
                            {poste.label}
                          </option>
                        ))
                      }
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Nom complet</label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    className="w-full p-2 border rounded border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                    required
                  />
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-niger-green dark:text-niger-green-light">Photo</label>
                  <div className="flex items-start space-x-4">
                    {/* Aperçu de la photo */}
                    <div className="relative">
                      {imagePreview ? (
                        <div className="relative">
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            width={96}
                            height={96}
                            className="w-24 h-24 object-cover rounded-lg border"
                          />
                          {/* Bouton pour supprimer la photo */}
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setFormData(prev => ({ ...prev, photo: '' }));
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors"
                            title="Supprimer la photo"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-gray-50 dark:bg-secondary-700 rounded-lg border flex items-center justify-center">
                          <User className="w-8 h-8 text-gray-400 dark:text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    {/* Contrôles d'upload */}
                    <div className="flex-1 space-y-2">
                      <input
                        type="file"
                        onChange={handleImageUpload}
                        accept="image/jpeg,image/png,image/gif"
                        disabled={uploading}
                        className="block w-full text-sm text-gray-500 dark:text-muted-foreground
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-niger-orange/10 file:text-niger-orange
                          hover:file:bg-niger-orange/20
                          disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 dark:text-muted-foreground">
                        {uploading ? (
                          <span className="flex items-center">
                            <div className="animate-spin rounded-full h-3 w-3 border border-niger-orange border-t-transparent mr-2"></div>
                            Upload en cours...
                          </span>
                        ) : (
                          'Formats acceptés : JPG, PNG ou GIF (max 5MB)'
                        )}
                      </p>
                      {imagePreview && (
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData(prev => ({ ...prev, photo: '' }));
                          }}
                          className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Supprimer la photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full p-2 border rounded border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Téléphone</label>
                    <input
                      type="text"
                      value={formData.telephone}
                      onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                      className="w-full p-2 border rounded border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                    />
                  </div>
                </div>

                {formData.titre === 'Ministre' && (
                  <div>
                    <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Message</label>
                    <textarea
                      value={formData.message || ''}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full p-2 border rounded h-24 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                      placeholder="Message du Ministre"
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="px-4 py-2 border rounded hover:bg-gray-50 dark:bg-secondary-700 dark:hover:bg-secondary-700/50 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 bg-gradient-to-r from-niger-orange to-niger-green hover:shadow-lg transition-all duration-300"
                  >
                    {editingDirector ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
}