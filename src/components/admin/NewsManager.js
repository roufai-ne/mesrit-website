// components/admin/NewsManager.js
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit, Trash, X, Search } from 'lucide-react';
import NewsImageUpload from '../communication/NewsImageUpload';
import { toast } from 'react-hot-toast';
import { secureApi, useApiAction } from '@/lib/secureApi';

const NewsManager = ({
  categories = ['Actualités', 'Événements', 'Communiqués', 'Annonces'],
}) => {
  const [news, setNews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const { execute, loading } = useApiAction();

  // État initial du formulaire
  const initialFormState = {
    title: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    status: 'draft',
    image: '',
    content: '',
    tags: [],
    summary: '',
    images: []
  };
  const [formData, setFormData] = useState(initialFormState);
  const [newTag, setNewTag] = useState('');

  // Charger les actualités au montage
  useEffect(() => {
    fetchNews();
  }, []);

  // Récupérer les actualités
  const fetchNews = async () => {
    try {
      // Utiliser secureApi avec authentification (true)
      const data = await secureApi.get('/api/news', true);
      setNews(data);
    } catch (error) {
      console.error('Erreur lors du chargement des actualités:', error);
      toast.error(error.message || 'Erreur lors du chargement des actualités');
    }
  };

  // Ouvrir le formulaire pour ajouter
  const handleAdd = () => {
    setEditingNews(null);
    setFormData(initialFormState);
    setShowForm(true);
  };

  // Ouvrir le formulaire pour éditer
  const handleEdit = (item) => {
    setEditingNews(item._id);
    setFormData({
      title: item.title,
      date: new Date(item.date).toISOString().split('T')[0],
      category: item.category,
      status: item.status,
      image: item.image,
      content: item.content,
      summary: item.summary || '',
      tags: item.tags || [],
      images: item.images || []
    });
    setShowForm(true);
  };

  // Supprimer une actualité
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette actualité ?')) {
      try {
        await execute(async () => {
          await secureApi.delete(`/api/news/${id}`);
          setNews(prevNews => prevNews.filter(item => item._id !== id));
          toast.success('Actualité supprimée avec succès');
        });
      } catch (error) {
        toast.error(error.message || 'Erreur lors de la suppression');
      }
    }
  };

  // Ajouter un tag
  const handleAddTag = (e) => {
    e.preventDefault();
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  // Supprimer un tag
  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Sauvegarder les modifications
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      await execute(async () => {
        const formattedData = {
          ...formData,
          date: new Date(formData.date).toISOString() // Format de date correct
        };

        if (editingNews) {
          // Mise à jour
          const updatedNews = await secureApi.put(`/api/news/${editingNews}`, formattedData);
          setNews(prevNews =>
            prevNews.map(item =>
              item._id === editingNews ? updatedNews : item
            )
          );
          toast.success('Actualité mise à jour avec succès');
        } else {
          // Création
          const newNews = await secureApi.post('/api/news', formattedData);
          setNews(prevNews => [...prevNews, newNews]);
          toast.success('Actualité créée avec succès');
        }

        setShowForm(false);
        // Rafraîchir la liste après modification
        await fetchNews();
      });
    } catch (error) {
      toast.error(error.message || 'Une erreur est survenue');
    }
  };

  // Filtrer les actualités
  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestion des actualités</h2>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle actualité
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 p-2 border rounded"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map((cat, index) => (
              <option key={`cat-${index}`} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="all">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="published">Publié</option>
          </select>
        </div>
      </div>

      {/* Liste des actualités */}
      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4">Image</th>
              <th className="text-left p-4">Titre</th>
              <th className="text-left p-4">Date</th>
              <th className="text-left p-4">Catégorie</th>
              <th className="text-left p-4">Statut</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredNews.map((item) => (
               <tr key={item._id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={64}
                    height={48}
                    className="object-cover rounded"
                  />
                </td>
                <td className="p-4">{item.title}</td>
                <td className="p-4">{item.date}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {item.category}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-sm ${
                    item.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1 hover:text-blue-600"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-1 hover:text-red-600"
                      title="Supprimer"
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

      {/* Modal de formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-2/3 max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">
                  {editingNews ? 'Modifier l\'actualité' : 'Nouvelle actualité'}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                {/* Titre */}
                <div>
                  <label className="block text-sm font-medium mb-1">Titre</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                {/* Date et Catégorie */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Catégorie</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                </div>

                {/* Image */}
                <div>
                  <NewsImageUpload 
                    value={formData.image}
                    onChange={(url) => setFormData({...formData, image: url})}
                    required
                  />
                </div>
                <div className="space-y-4">
                <label className="block text-sm font-medium">Images supplémentaires</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={img.url}
                        alt={img.description}
                        width={500}
                        height={300}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <input
                        type="text"
                        value={img.description}
                        onChange={(e) => {
                          const newImages = [...formData.images];
                          newImages[index].description = e.target.value;
                          setFormData({...formData, images: newImages});
                        }}
                        className="mt-2 w-full p-2 border rounded"
                        placeholder="Description"
                      />
                      <button
                        onClick={() => {
                          const newImages = formData.images.filter((_, i) => i !== index);
                          setFormData({...formData, images: newImages});
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <div 
                    className="h-48 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500"
                    onClick={() => document.getElementById('additionalImages').click()}
                  >
                    <input
                      id="additionalImages"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        for (let file of e.target.files) {
                          const formData = new FormData();
                          formData.append('file', file);

                          try {
                            const response = await secureApi.uploadFile('/api/upload/news', file, true);

                            if (response.ok) {
                              const { url } = await response.json();
                              setFormData(prev => ({
                                ...prev,
                                images: [...prev.images, { url, description: '' }]
                              }));
                            }
                          } catch (error) {
                            toast.error(`Erreur lors de l'upload de ${file.name}`);
                          }
                        }
                      }}
                    />
                    <Plus className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
                </div>
                {/* Résumé */}
                <div>
                  <label className="block text-sm font-medium mb-1">Résumé</label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => setFormData({...formData, summary: e.target.value})}
                    className="w-full p-2 border rounded h-20"
                    required
                  />
                </div>

                {/* Contenu */}
                <div>
                  <label className="block text-sm font-medium mb-1">Contenu</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full p-2 border rounded h-32"
                    required
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium mb-1">Tags</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="flex-1 p-2 border rounded"
                      placeholder="Ajouter un tag"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      Ajouter
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 rounded-full flex items-center"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 text-gray-500 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Statut */}
                <div>
                  <label className="block text-sm font-medium mb-1">Statut</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full p-2 border rounded"
                  >
                    <option value="draft">Brouillon</option>
                    <option value="published">Publié</option>
                  </select>
                </div>

                {/* Boutons */}
                <div className="flex justify-end space-x-4 pt-4">
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
                    {editingNews ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsManager;