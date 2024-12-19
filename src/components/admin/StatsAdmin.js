import { useState, useEffect } from 'react';

export default function StatsAdmin() {
  const [activeType, setActiveType] = useState('students');
  const [stats, setStats] = useState([]); // Initialisation avec un tableau vide
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, [activeType]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stats/${activeType}`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des données');
      }
      const data = await response.json();
      setStats(Array.isArray(data) ? data : []); // Assure que stats est toujours un tableau
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setError(error.message);
      setStats([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const method = editingData._id ? 'PUT' : 'POST';
    const url = `/api/stats/${activeType}${editingData._id ? `/${editingData._id}` : ''}`;
    
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingData)
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }
      
      setIsEditing(false);
      fetchStats();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde des données');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ces statistiques ?')) return;
    
    try {
      const response = await fetch(`/api/stats/${activeType}/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }
      
      fetchStats();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex space-x-4 mb-6">
        {['students', 'teachers', 'institutions'].map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeType === type
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 hover:bg-gray-100'
            }`}
          >
            {type === 'students' && 'Étudiants'}
            {type === 'teachers' && 'Enseignants'}
            {type === 'institutions' && 'Établissements'}
          </button>
        ))}
      </div>

      <button
        onClick={() => {
          setEditingData({});
          setIsEditing(true);
        }}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Ajouter
      </button>

      {loading ? (
        <div className="text-center py-4">Chargement...</div>
      ) : error ? (
        <div className="text-center text-red-600 py-4">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Année
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.length > 0 ? (
                stats.map((stat) => (
                  <tr key={stat._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{stat.year}</td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <button
                        onClick={() => {
                          setEditingData(stat);
                          setIsEditing(true);
                        }}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(stat._id)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="px-6 py-4 text-center text-gray-500">
                    Aucune donnée disponible
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {editingData?._id ? 'Modifier les statistiques' : 'Ajouter des statistiques'}
              </h2>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
  {activeType === 'students' && (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Année</label>
        <input
          type="number"
          value={editingData?.year || ''}
          onChange={(e) => setEditingData({
            ...editingData,
            year: parseInt(e.target.value)
          })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Nombre total d'étudiants
        </label>
        <input
          type="number"
          value={editingData?.totalStudents || ''}
          onChange={(e) => setEditingData({
            ...editingData,
            totalStudents: parseInt(e.target.value)
          })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Étudiants pour 100k habitants
        </label>
        <input
          type="number"
          value={editingData?.studentsPerCapita || ''}
          onChange={(e) => setEditingData({
            ...editingData,
            studentsPerCapita: parseInt(e.target.value)
          })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Hommes</label>
          <input
            type="number"
            value={editingData?.genderDistribution?.male || ''}
            onChange={(e) => setEditingData({
              ...editingData,
              genderDistribution: {
                ...editingData?.genderDistribution,
                male: parseInt(e.target.value)
              }
            })}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Femmes</label>
          <input
            type="number"
            value={editingData?.genderDistribution?.female || ''}
            onChange={(e) => setEditingData({
              ...editingData,
              genderDistribution: {
                ...editingData?.genderDistribution,
                female: parseInt(e.target.value)
              }
            })}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <fieldset className="border p-4 rounded-md">
        <legend className="text-sm font-medium px-2">Secteur Public</legend>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Total Public</label>
            <input
              type="number"
              value={editingData?.sectorDistribution?.public?.total || ''}
              onChange={(e) => {
                const total = parseInt(e.target.value);
                setEditingData({
                  ...editingData,
                  sectorDistribution: {
                    ...editingData?.sectorDistribution,
                    public: {
                      ...editingData?.sectorDistribution?.public,
                      total
                    }
                  }
                });
              }}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Universités</label>
              <input
                type="number"
                value={editingData?.sectorDistribution?.public?.universities || ''}
                onChange={(e) => {
                  const universities = parseInt(e.target.value);
                  const grandesEcoles = editingData?.sectorDistribution?.public?.grandesEcoles || 0;
                  setEditingData({
                    ...editingData,
                    sectorDistribution: {
                      ...editingData?.sectorDistribution,
                      public: {
                        ...editingData?.sectorDistribution?.public,
                        universities,
                        total: universities + grandesEcoles
                      }
                    }
                  });
                }}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Grandes Écoles</label>
              <input
                type="number"
                value={editingData?.sectorDistribution?.public?.grandesEcoles || ''}
                onChange={(e) => {
                  const grandesEcoles = parseInt(e.target.value);
                  const universities = editingData?.sectorDistribution?.public?.universities || 0;
                  setEditingData({
                    ...editingData,
                    sectorDistribution: {
                      ...editingData?.sectorDistribution,
                      public: {
                        ...editingData?.sectorDistribution?.public,
                        grandesEcoles,
                        total: universities + grandesEcoles
                      }
                    }
                  });
                }}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset className="border p-4 rounded-md">
        <legend className="text-sm font-medium px-2">Secteur Privé</legend>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Total Privé</label>
            <input
              type="number"
              value={editingData?.sectorDistribution?.private?.total || ''}
              onChange={(e) => {
                const total = parseInt(e.target.value);
                setEditingData({
                  ...editingData,
                  sectorDistribution: {
                    ...editingData?.sectorDistribution,
                    private: {
                      ...editingData?.sectorDistribution?.private,
                      total
                    }
                  }
                });
              }}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Universités</label>
              <input
                type="number"
                value={editingData?.sectorDistribution?.private?.universities || ''}
                onChange={(e) => {
                  const universities = parseInt(e.target.value);
                  const grandesEcoles = editingData?.sectorDistribution?.private?.grandesEcoles || 0;
                  setEditingData({
                    ...editingData,
                    sectorDistribution: {
                      ...editingData?.sectorDistribution,
                      private: {
                        ...editingData?.sectorDistribution?.private,
                        universities,
                        total: universities + grandesEcoles
                      }
                    }
                  });
                }}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Grandes Écoles</label>
              <input
                type="number"
                value={editingData?.sectorDistribution?.private?.grandesEcoles || ''}
                onChange={(e) => {
                  const grandesEcoles = parseInt(e.target.value);
                  const universities = editingData?.sectorDistribution?.private?.universities || 0;
                  setEditingData({
                    ...editingData,
                    sectorDistribution: {
                      ...editingData?.sectorDistribution,
                      private: {
                        ...editingData?.sectorDistribution?.private,
                        grandesEcoles,
                        total: universities + grandesEcoles
                      }
                    }
                  });
                }}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>
      </fieldset>
    </div>
  )}
{/* Ajoutez cette partie après la condition activeType === 'students' */}

{activeType === 'teachers' && (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium mb-1">Année</label>
      <input
        type="number"
        value={editingData?.year || ''}
        onChange={(e) => setEditingData({
          ...editingData,
          year: parseInt(e.target.value)
        })}
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
    </div>

    <div className="space-y-4">
      <h3 className="font-medium">Universités Publiques</h3>
      {editingData?.publicUniversities?.map((grade, index) => (
        <div key={index} className="border p-4 rounded-md space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Grade {index + 1}</h4>
            <button
              type="button"
              onClick={() => {
                const newPublicUniversities = [...(editingData.publicUniversities || [])];
                newPublicUniversities.splice(index, 1);
                setEditingData({
                  ...editingData,
                  publicUniversities: newPublicUniversities
                });
              }}
              className="text-red-600 hover:text-red-700"
            >
              Supprimer
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Grade</label>
            <input
              type="text"
              value={grade.grade || ''}
              onChange={(e) => {
                const newPublicUniversities = [...(editingData.publicUniversities || [])];
                newPublicUniversities[index] = {
                  ...newPublicUniversities[index],
                  grade: e.target.value
                };
                setEditingData({
                  ...editingData,
                  publicUniversities: newPublicUniversities
                });
              }}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Total</label>
            <input
              type="number"
              value={grade.total || ''}
              onChange={(e) => {
                const newPublicUniversities = [...(editingData.publicUniversities || [])];
                newPublicUniversities[index] = {
                  ...newPublicUniversities[index],
                  total: parseInt(e.target.value)
                };
                setEditingData({
                  ...editingData,
                  publicUniversities: newPublicUniversities
                });
              }}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Hommes</label>
              <input
                type="number"
                value={grade.genderDistribution?.male || ''}
                onChange={(e) => {
                  const newPublicUniversities = [...(editingData.publicUniversities || [])];
                  newPublicUniversities[index] = {
                    ...newPublicUniversities[index],
                    genderDistribution: {
                      ...newPublicUniversities[index].genderDistribution,
                      male: parseInt(e.target.value)
                    }
                  };
                  setEditingData({
                    ...editingData,
                    publicUniversities: newPublicUniversities
                  });
                }}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Femmes</label>
              <input
                type="number"
                value={grade.genderDistribution?.female || ''}
                onChange={(e) => {
                  const newPublicUniversities = [...(editingData.publicUniversities || [])];
                  newPublicUniversities[index] = {
                    ...newPublicUniversities[index],
                    genderDistribution: {
                      ...newPublicUniversities[index].genderDistribution,
                      female: parseInt(e.target.value)
                    }
                  };
                  setEditingData({
                    ...editingData,
                    publicUniversities: newPublicUniversities
                  });
                }}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => {
          setEditingData({
            ...editingData,
            publicUniversities: [
              ...(editingData.publicUniversities || []),
              {
                grade: '',
                total: 0,
                genderDistribution: { male: 0, female: 0 }
              }
            ]
          });
        }}
        className="w-full px-4 py-2 text-sm border border-dashed border-gray-300 rounded-md hover:border-gray-400 hover:bg-gray-50"
      >
        + Ajouter un grade
      </button>
    </div>

    <fieldset className="border p-4 rounded-md">
      <legend className="text-sm font-medium px-2">Institutions Privées</legend>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Total</label>
          <input
            type="number"
            value={editingData?.privateInstitutions?.total || ''}
            onChange={(e) => setEditingData({
              ...editingData,
              privateInstitutions: {
                ...editingData.privateInstitutions,
                total: parseInt(e.target.value)
              }
            })}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Hommes</label>
            <input
              type="number"
              value={editingData?.privateInstitutions?.genderDistribution?.male || ''}
              onChange={(e) => setEditingData({
                ...editingData,
                privateInstitutions: {
                  ...editingData.privateInstitutions,
                  genderDistribution: {
                    ...editingData?.privateInstitutions?.genderDistribution,
                    male: parseInt(e.target.value)
                  }
                }
              })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Femmes</label>
            <input
              type="number"
              value={editingData?.privateInstitutions?.genderDistribution?.female || ''}
              onChange={(e) => setEditingData({
                ...editingData,
                privateInstitutions: {
                  ...editingData.privateInstitutions,
                  genderDistribution: {
                    ...editingData?.privateInstitutions?.genderDistribution,
                    female: parseInt(e.target.value)
                  }
                }
              })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
      </div>
    </fieldset>
  </div>
)}

{activeType === 'institutions' && (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium mb-1">Année</label>
      <input
        type="number"
        value={editingData?.year || ''}
        onChange={(e) => setEditingData({
          ...editingData,
          year: parseInt(e.target.value)
        })}
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Total Public</label>
      <input
        type="number"
        value={editingData?.totalPublic || ''}
        onChange={(e) => setEditingData({
          ...editingData,
          totalPublic: parseInt(e.target.value)
        })}
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Total Privé</label>
      <input
        type="number"
        value={editingData?.totalPrivate || ''}
        onChange={(e) => setEditingData({
          ...editingData,
          totalPrivate: parseInt(e.target.value)
        })}
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
    </div>

    <div className="space-y-4">
      <h3 className="font-medium">Liste des établissements</h3>
      {editingData?.institutions?.map((institution, index) => (
        <div key={index} className="border p-4 rounded-md space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Établissement {index + 1}</h4>
            <button
              type="button"
              onClick={() => {
                const newInstitutions = [...(editingData.institutions || [])];
                newInstitutions.splice(index, 1);
                setEditingData({
                  ...editingData,
                  institutions: newInstitutions
                });
              }}
              className="text-red-600 hover:text-red-700"
            >
              Supprimer
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <input
              type="text"
              value={institution.type || ''}
              onChange={(e) => {
                const newInstitutions = [...(editingData.institutions || [])];
                newInstitutions[index] = {
                  ...newInstitutions[index],
                  type: e.target.value
                };
                setEditingData({
                  ...editingData,
                  institutions: newInstitutions
                });
              }}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Secteur</label>
            <select
              value={institution.sector || ''}
              onChange={(e) => {
                const newInstitutions = [...(editingData.institutions || [])];
                newInstitutions[index] = {
                  ...newInstitutions[index],
                  sector: e.target.value
                };
                setEditingData({
                  ...editingData,
                  institutions: newInstitutions
                });
              }}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Sélectionner un secteur</option>
              <option value="public">Public</option>
              <option value="private">Privé</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="number"
              value={institution.count || ''}
              onChange={(e) => {
                const newInstitutions = [...(editingData.institutions || [])];
                newInstitutions[index] = {
                  ...newInstitutions[index],
                  count: parseInt(e.target.value)
                };
                setEditingData({
                  ...editingData,
                  institutions: newInstitutions
                });
              }}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => {
          setEditingData({
            ...editingData,
            institutions: [
              ...(editingData.institutions || []),
              { type: '', sector: '', count: 0 }
            ]
          });
        }}
        className="w-full px-4 py-2 text-sm border border-dashed border-gray-300 rounded-md hover:border-gray-400 hover:bg-gray-50"
      >
        + Ajouter un établissement
      </button>
    </div>
  </div>
)}
  <div className="flex justify-end space-x-2 pt-4 border-t">
    <button
      type="button"
      onClick={() => setIsEditing(false)}
      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
    >
      Annuler
    </button>
    <button
      type="submit"
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
    >
      {editingData?._id ? 'Mettre à jour' : 'Créer'}
    </button>
  </div>
</form>
          </div>
        </div>
      )}
    </div>
  );
}