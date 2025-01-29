import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Plus, Edit, Trash, PhotoIcon, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const POSTES_DIRECTION = [
  // Haute direction
  { value: 'ministre', label: 'Ministre', category: 'cabinet' },
  { value: 'sg', label: 'Secrétaire Général', category: 'cabinet' },
  { value: 'sga', label: 'Secrétaire Général Adjoint', category: 'cabinet' },
  { value: 'dges', label: 'Directeur Général de l\'Enseignement Supérieur', category: 'cabinet' },
  { value: 'dgr', label: 'Directeur Général de la Recherche', category: 'cabinet' },
  { value: 'igs', label: 'Inspecteur Général des Services', category: 'cabinet' },

  // Directions nationales SG
  { value: 'daf', label: 'Direction des Affaires Financières', category: 'sg' },
  { value: 'drh', label: 'Direction des Ressources Humaines', category: 'sg' },
  { value: 'dmp', label: 'Direction des Marchés Publics', category: 'sg' },
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
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [uploading, setUploading] = useState(false);

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
  const [imagePreview, setImagePreview] = useState(formData.photo || null);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  }, []);

  const fetchDirectors = useCallback(async () => {
    try {
      const response = await fetch('/api/directors');
      if (response.ok) {
        const data = await response.json();
        const sortedData = data.sort((a, b) => {
          const posteA = POSTES_DIRECTION.find(p => p.label === a.titre);
          const posteB = POSTES_DIRECTION.find(p => p.label === b.titre);
          return POSTES_DIRECTION.indexOf(posteA) - POSTES_DIRECTION.indexOf(posteB);
        });
        setDirectors(sortedData);
      }
    } catch (error) {
      console.error('Erreur:', error);
      showNotification('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

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
  
    // Vérifications de base
    if (!file.type.match(/^image\/(jpeg|png|gif)$/)) {
      toast.error('Format de fichier non supporté. Utilisez JPG, PNG ou GIF');
      return;
    }
  
    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('Le fichier est trop volumineux. Taille maximale : 5MB');
      return;
    }
  
    const formData = new FormData();
    formData.append('file', file);
  
    setUploading(true);
    try {
      console.log('Envoi du fichier :', file); // Log pour déboguer
      const response = await fetch('/api/upload/dir', {
        method: 'POST',
        body: formData
      });
  
      console.log('Réponse de l\'API :', response); // Log pour déboguer
  
      if (!response.ok) {
        const error = await response.json();
        console.error('Erreur de l\'API :', error); // Log pour déboguer
        throw new Error(error.message || 'Erreur lors de l\'upload');
      }
  
      const data = await response.json();
      console.log('Données reçues :', data); // Log pour déboguer
      setFormData(prev => ({ ...prev, photo: data.url }));
      setImagePreview(URL.createObjectURL(file));
      toast.success('Photo uploadée avec succès');
    } catch (error) {
      toast.error(error.message);
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingDirector 
        ? `/api/directors/${editingDirector}` 
        : '/api/directors';
      
      const response = await fetch(url, {
        method: editingDirector ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showNotification(
          editingDirector 
            ? 'Responsable mis à jour avec succès' 
            : 'Nouveau responsable ajouté avec succès'
        );
        setShowForm(false);
        setFormData(initialFormState);
        setEditingDirector(null);
        fetchDirectors();
      }
    } catch (error) {
      console.error('Erreur:', error);
      showNotification('Une erreur est survenue', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce responsable ?')) {
      try {
        const response = await fetch(`/api/directors/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          showNotification('Responsable supprimé avec succès');
          fetchDirectors();
        }
      } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur lors de la suppression', 'error');
      }
    }
  };

  const handleEdit = (director) => {
    console.log('Directeur à éditer :', director); // Log pour déboguer
    if (!director || !director._id) {
      console.error('Directeur invalide :', director);
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestion des responsables</h2>
        <button 
          onClick={() => {
            setFormData(initialFormState);
            setEditingDirector(null);
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau responsable
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4">Chargement...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Photo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Poste</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {directors.map((director) => (
                <tr key={director._id} className="border-t hover:bg-gray-50">
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
                    <span className="inline-flex items-center">
                      {director.titre}
                      {getDirectionCategory(director.titre) !== 'cabinet' && (
                        <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {getDirectionCategory(director.titre).toUpperCase()}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4">{director.nom}</td>
                  <td className="px-6 py-4">{director.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(director)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(director._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-2/3 max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">
                  {editingDirector ? 'Modifier le responsable' : 'Nouveau responsable'}
                </h3>
                <button onClick={() => setShowForm(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Poste</label>
                  <select
                    value={formData.titre}
                    onChange={(e) => setFormData({...formData, titre: e.target.value})}
                    className="w-full p-2 border rounded"
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
                  <label className="block text-sm font-medium mb-1">Nom complet</label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">Photo</label>
                  <div className="flex items-center space-x-4">
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={96}
                        height={96}
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-50 rounded-lg border flex items-center justify-center">
                        <PhotoIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        onChange={handleImageUpload}
                        accept="image/jpeg,image/png,image/gif"
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
                        {uploading ? 'Upload en cours...' : 'Formats acceptés : JPG, PNG ou GIF (max 5MB)'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Téléphone</label>
                    <input
                      type="text"
                      value={formData.telephone}
                      onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>

                {formData.titre === 'Ministre' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Message</label>
                    <textarea
                      value={formData.message || ''}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full p-2 border rounded h-24"
                      placeholder="Message du Ministre"
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border rounded hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {editingDirector ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
}