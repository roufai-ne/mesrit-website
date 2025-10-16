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
        {['students', 'teachers', 'institutions', 'publications'].map((type) => (
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
            {type === 'publications' && 'Publications Scientifiques'}
          </button>
        ))}
      </div>

      <button
        onClick={() => {
          setEditingData({});
          setIsEditing(true);
        }}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors bg-gradient-to-r from-niger-orange to-niger-green hover:shadow-lg transition-all duration-300"
      >
        Ajouter
      </button>

      {loading ? (
        <div className="text-center py-4">Chargement...</div>
      ) : error ? (
        <div className="text-center text-red-600 py-4">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-secondary-600">
            <thead className="bg-gray-50 dark:bg-secondary-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-muted-foreground">
                  Année
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-secondary-800 dark:divide-secondary-600">
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
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition-colors dark:bg-secondary-700 dark:border-secondary-600 dark:hover:bg-secondary-700/50"
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
                  <td colSpan="2" className="px-6 py-4 text-center text-gray-500 dark:text-muted-foreground">
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
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto dark:bg-secondary-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-niger-green dark:text-niger-green-light">
                {editingData?._id ? 'Modifier les statistiques' : 'Ajouter des statistiques'}
              </h2>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-niger-green-light dark:text-muted-foreground"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
  {activeType === 'students' && (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Année</label>
        <input
          type="number"
          value={editingData?.year || ''}
          onChange={(e) => setEditingData({
            ...editingData,
            year: parseInt(e.target.value)
          })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">
          Nombre total d'étudiants
        </label>
        <input
          type="number"
          value={editingData?.totalStudents || ''}
          onChange={(e) => setEditingData({
            ...editingData,
            totalStudents: parseInt(e.target.value)
          })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">
          Étudiants pour 100k habitants
        </label>
        <input
          type="number"
          value={editingData?.studentsPerCapita || ''}
          onChange={(e) => setEditingData({
            ...editingData,
            studentsPerCapita: parseInt(e.target.value)
          })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Hommes</label>
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
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Femmes</label>
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
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
            required
          />
        </div>
      </div>

      <fieldset className="border p-4 rounded-md">
        <legend className="text-sm font-medium px-2">Secteur Public</legend>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Total Public</label>
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
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Universités</label>
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
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Grandes Écoles</label>
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
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
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
            <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Total Privé</label>
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
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Universités</label>
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
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Grandes Écoles</label>
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
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
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
      <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Année</label>
      <input
        type="number"
        value={editingData?.year || ''}
        onChange={(e) => setEditingData({
          ...editingData,
          year: parseInt(e.target.value)
        })}
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
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
            <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Grade</label>
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
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Total</label>
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
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Hommes</label>
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
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Femmes</label>
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
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
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
        className="w-full px-4 py-2 text-sm border border-dashed border-gray-300 rounded-md hover:border-gray-400 hover:bg-gray-50 dark:bg-secondary-700 dark:border-secondary-600 dark:hover:bg-secondary-700/50"
      >
        + Ajouter un grade
      </button>
    </div>

    <fieldset className="border p-4 rounded-md">
      <legend className="text-sm font-medium px-2">Institutions Privées</legend>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Total</label>
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
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Hommes</label>
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
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Femmes</label>
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
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
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
      <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Année</label>
      <input
        type="number"
        value={editingData?.year || ''}
        onChange={(e) => setEditingData({
          ...editingData,
          year: parseInt(e.target.value)
        })}
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Total Public</label>
      <input
        type="number"
        value={editingData?.totalPublic || ''}
        onChange={(e) => setEditingData({
          ...editingData,
          totalPublic: parseInt(e.target.value)
        })}
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Total Privé</label>
      <input
        type="number"
        value={editingData?.totalPrivate || ''}
        onChange={(e) => setEditingData({
          ...editingData,
          totalPrivate: parseInt(e.target.value)
        })}
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
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
            <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Type</label>
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
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Secteur</label>
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
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
              required
            >
              <option value="">Sélectionner un secteur</option>
              <option value="public">Public</option>
              <option value="private">Privé</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Nombre</label>
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
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
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
        className="w-full px-4 py-2 text-sm border border-dashed border-gray-300 rounded-md hover:border-gray-400 hover:bg-gray-50 dark:bg-secondary-700 dark:border-secondary-600 dark:hover:bg-secondary-700/50"
      >
        + Ajouter un établissement
      </button>
    </div>
  </div>
)}

{activeType === 'publications' && (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Année</label>
      <input
        type="number"
        value={editingData?.year || ''}
        onChange={(e) => setEditingData({
          ...editingData,
          year: parseInt(e.target.value)
        })}
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Total Publications</label>
      <input
        type="number"
        value={editingData?.totalPublications || ''}
        onChange={(e) => setEditingData({
          ...editingData,
          totalPublications: parseInt(e.target.value)
        })}
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
        required
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Publications Internationales</label>
        <input
          type="number"
          value={editingData?.publicationsByScope?.international || ''}
          onChange={(e) => setEditingData({
            ...editingData,
            publicationsByScope: {
              ...editingData?.publicationsByScope,
              international: parseInt(e.target.value)
            }
          })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Publications Nationales</label>
        <input
          type="number"
          value={editingData?.publicationsByScope?.national || ''}
          onChange={(e) => setEditingData({
            ...editingData,
            publicationsByScope: {
              ...editingData?.publicationsByScope,
              national: parseInt(e.target.value)
            }
          })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
        />
      </div>
    </div>

    <div className="space-y-4">
      <h3 className="font-medium">Métriques de Qualité</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Publications Indexées</label>
          <input
            type="number"
            value={editingData?.qualityMetrics?.indexedPublications || ''}
            onChange={(e) => setEditingData({
              ...editingData,
              qualityMetrics: {
                ...editingData?.qualityMetrics,
                indexedPublications: parseInt(e.target.value)
              }
            })}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Publications avec Comité de Lecture</label>
          <input
            type="number"
            value={editingData?.qualityMetrics?.peerReviewedPublications || ''}
            onChange={(e) => setEditingData({
              ...editingData,
              qualityMetrics: {
                ...editingData?.qualityMetrics,
                peerReviewedPublications: parseInt(e.target.value)
              }
            })}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Total Citations</label>
          <input
            type="number"
            value={editingData?.qualityMetrics?.citationsTotal || ''}
            onChange={(e) => setEditingData({
              ...editingData,
              qualityMetrics: {
                ...editingData?.qualityMetrics,
                citationsTotal: parseInt(e.target.value)
              }
            })}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Moyenne Publications/Chercheur</label>
          <input
            type="number"
            step="0.1"
            value={editingData?.averagePublicationsPerResearcher || ''}
            onChange={(e) => setEditingData({
              ...editingData,
              averagePublicationsPerResearcher: parseFloat(e.target.value)
            })}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
          />
        </div>
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Notes</label>
      <textarea
        value={editingData?.notes || ''}
        onChange={(e) => setEditingData({
          ...editingData,
          notes: e.target.value
        })}
        rows={3}
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
        placeholder="Notes ou commentaires sur les données..."
      />
    </div>
  </div>
)}

  <div className="flex justify-end space-x-2 pt-4 border-t">
    <button
      type="button"
      onClick={() => setIsEditing(false)}
      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors dark:bg-secondary-700 dark:border-secondary-600 dark:hover:bg-secondary-700/50"
    >
      Annuler
    </button>
    <button
      type="submit"
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors bg-gradient-to-r from-niger-orange to-niger-green hover:shadow-lg transition-all duration-300"
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