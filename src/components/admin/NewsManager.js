// src/components/admin/NewsManager.js
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash, 
  Calendar, 
  Tag, 
  Image as ImageIcon, 
  X, 
  Search,
  Filter 
} from 'lucide-react';
import { useRouter } from 'next/router';

export default function NewsManager() {
  const router = useRouter();
  const [news, setNews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // État initial du formulaire
  const initialFormState = {
    title: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    status: 'draft',
    image: '',
    content: '',
    tags: [],
    summary: ''
  };
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [newTag, setNewTag] = useState('');

  // Charger les actualités au montage
  useEffect(() => {
    fetchNews();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000); // Disparaît après 3 secondes
  };
  // Récupérer les actualités
  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news');
      if (response.ok) {
        const data = await response.json();
        setNews(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des actualités:', error);
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
  setEditingNews(item._id); // Utiliser _id de MongoDB
  setFormData({
    title: item.title,
    date: new Date(item.date).toISOString().split('T')[0], // Formatage correct de la date
    category: item.category,
    status: item.status,
    image: item.image,
    content: item.content,
    summary: item.summary || '',
    tags: item.tags || []
  });
  setShowForm(true);
};

  // Supprimer une actualité
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette actualité ?')) {
      try {
        const response = await fetch(`/api/news/${id}`, {
          method: 'DELETE',
        });
  
        if (response.ok) {
          // Mettre à jour l'état local après suppression
          setNews(prevNews => prevNews.filter(item => item._id !== id));
          showNotification('Actualité supprimée avec succès');
        } else {
          showNotification('Erreur lors de la suppression', 'error');
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        showNotification('Erreur lors de la suppression', 'error');
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
      if (editingNews) {
        // Mise à jour
        const response = await fetch(`/api/news/${editingNews}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            date: new Date(formData.date).toISOString() // Format de date correct
          }),
        });
  
        if (response.ok) {
          const updatedNews = await response.json();
          setNews(prevNews => 
            prevNews.map(item => 
              item._id === editingNews ? updatedNews : item
            )
          );
          showNotification('Actualité mise à jour avec succès');
          setShowForm(false);
        } else {
          showNotification('Erreur lors de la mise à jour', 'error');
        }
      } else {
        // Création
        const response = await fetch('/api/news', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            date: new Date(formData.date).toISOString()
          }),
        });
  
        if (response.ok) {
          const newNews = await response.json();
          setNews(prevNews => [...prevNews, newNews]);
          showNotification('Actualité créée avec succès');
          setShowForm(false);
        } else {
          showNotification('Erreur lors de la création', 'error');
        }
      }
  
      // Rafraîchir la liste après modification
      const refreshResponse = await fetch('/api/news');
      if (refreshResponse.ok) {
        const refreshedNews = await refreshResponse.json();
        setNews(refreshedNews);
      }
  
    } catch (error) {
      console.error('Erreur:', error);
      showNotification('Une erreur est survenue', 'error');
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

  // Obtenir les catégories uniques
  const categories = ['all', ...new Set(news.map(item => item.category))];

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
              cat !== 'all' && <option key={index} value={cat}>{cat}</option>
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
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-16 h-12 object-cover rounded"
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
                      onClick={() => handleDelete(item.id)}
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
                  <label className="block text-sm font-medium mb-1">Image URL</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
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

   {/* Aperçu en temps réel lorsqu'on édite */}
   {showForm && (
     <div className="fixed bottom-0 right-0 bg-white shadow-lg rounded-tl-lg p-4 m-4 w-1/3">
       <div className="flex justify-between items-center mb-4">
         <h4 className="font-bold">Aperçu</h4>
         <button
           onClick={() => document.querySelector('.preview').classList.toggle('hidden')}
           className="text-gray-500 hover:text-gray-700"
         >
           <X className="w-4 h-4" />
         </button>
       </div>
       <div className="preview overflow-auto max-h-60">
         <h3 className="text-xl font-bold mb-2">{formData.title}</h3>
         {formData.image && (
           <img
             src={formData.image}
             alt="Aperçu"
             className="w-full h-32 object-cover rounded mb-2"
           />
         )}
         <p className="text-sm text-gray-600 mb-2">{formData.summary}</p>
         <div className="flex flex-wrap gap-2">
           {formData.tags.map((tag, index) => (
             <span
               key={index}
               className="px-2 py-1 bg-gray-100 rounded-full text-xs"
             >
               {tag}
             </span>
           ))}
         </div>
       </div>
     </div>
   )}

   {/* Notification de succès/erreur */}
   {notification && (
     <div
       className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
         notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
       } text-white`}
     >
       {notification.message}
     </div>
   )}
 </div>
);
}

// Propriétés par défaut
NewsManager.defaultProps = {
categories: ['Actualités', 'Événements', 'Communiqués', 'Annonces'],
maxImageSize: 2 * 1024 * 1024, // 2MB
allowedImageTypes: ['image/jpeg', 'image/png'],
};

