// src/components/admin/DirectorManager.js
// src/components/admin/DirectorManager.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Edit, 
  Trash, 
  Mail, 
  Phone,
  Image as ImageIcon, 
  X 
} from 'lucide-react';

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




  // Puis modifiez la définition de fetchDirectors en la déplaçant avant le useEffect
  export default function DirectorManager() {
    const [directors, setDirectors] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingDirector, setEditingDirector] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    
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
  setEditingDirector(director._id);
  setFormData(director);
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

    {/* Liste des responsables */}
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
                  <img 
                    src={director.photo || '/images/dir/default.jpg'} 
                    alt={director.nom}
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

    {/* Modal formulaire */}
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

              <div>
                <label className="block text-sm font-medium mb-1">Photo URL</label>
                <input
                  type="text"
                  value={formData.photo}
                  onChange={(e) => setFormData({...formData, photo: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="/images/dir/photo.jpg"
                />
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

    {/* Notification */}
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