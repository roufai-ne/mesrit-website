// src/components/admin/DocumentManager.js
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash, 
  FileText, 
  X, 
  Search,
  Download,
  Upload
 
} from 'lucide-react';


export default function DocumentManager() {
  const [documents, setDocuments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notification, setNotification] = useState(null);
  const [file, setFile] = useState(null);

  // État initial du formulaire
  const initialFormState = {
    title: '',
    description: '',
    category: 'regulatory',
    status: 'draft',
    publicationDate: new Date().toISOString().split('T')[0],
    type: 'pdf',
    size: '',
    url: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
      showNotification('Erreur lors du chargement des documents', 'error');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFormData(prev => ({
        ...prev,
        type: selectedFile.type.split('/')[1],
        size: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
      }));
    }
  };

  const handleAdd = () => {
    setEditingDocument(null);
    setFormData(initialFormState);
    setFile(null);
    setShowForm(true);
  };

  const handleEdit = (doc) => {
    setEditingDocument(doc._id);
    setFormData({
      title: doc.title,
      description: doc.description,
      category: doc.category,
      status: doc.status,
      publicationDate: new Date(doc.publicationDate).toISOString().split('T')[0],
      type: doc.type,
      size: doc.size,
      url: doc.url
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      try {
        const response = await fetch(`/api/documents/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setDocuments(prev => prev.filter(doc => doc._id !== id));
          showNotification('Document supprimé avec succès');
        } else {
          showNotification('Erreur lors de la suppression', 'error');
        }
      } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur lors de la suppression', 'error');
      }
    }
  };

  // Mettre à jour la fonction handleSave dans DocumentManager.js
const handleSave = async (e) => {
  e.preventDefault();
  
  try {
    let fileUrl = formData.url;
    let fileSize = formData.size;
    let fileType = formData.type;

    if (file) {
      // Vérifier le type de fichier
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        showNotification('Type de fichier non autorisé. Utilisez PDF ou Word.', 'error');
        return;
      }

      // Vérifier la taille du fichier
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        showNotification('Le fichier est trop volumineux (max 10MB)', 'error');
        return;
      }

      // Créer le FormData
      const formDataFile = new FormData();
      formDataFile.append('file', file);

      // Upload du fichier
      try {
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formDataFile
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || "Erreur lors de l'upload du fichier");
        }

        const uploadResult = await uploadResponse.json();
        fileUrl = uploadResult.url;
        fileSize = `${(uploadResult.size / (1024 * 1024)).toFixed(2)} MB`;
        fileType = uploadResult.type.split('/')[1];
      } catch (uploadError) {
        console.error('Erreur upload:', uploadError);
        showNotification(uploadError.message, 'error');
        return;
      }
    }

    // Préparer les données du document
    const documentData = {
      ...formData,
      url: fileUrl,
      size: fileSize,
      type: fileType
    };

    // Créer ou mettre à jour le document
    const response = await fetch(
      editingDocument 
        ? `/api/documents/${editingDocument}`
        : '/api/documents',
      {
        method: editingDocument ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(documentData)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erreur lors de la sauvegarde du document");
    }

    showNotification(
      editingDocument 
        ? 'Document mis à jour avec succès'
        : 'Document créé avec succès'
    );
    setShowForm(false);
    fetchDocuments();
  } catch (error) {
    console.error('Erreur:', error);
    showNotification(error.message, 'error');
  }
};

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestion des Documents</h2>
        <button 
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ajouter un document
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un document..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 p-2 border rounded-lg"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 border rounded-lg"
          >
            <option value="all">Toutes les catégories</option>
            <option value="regulatory">Textes réglementaires</option>
            <option value="policy">Politiques</option>
            <option value="reports">Rapports</option>
            <option value="guides">Guides</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border rounded-lg"
          >
            <option value="all">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="published">Publié</option>
          </select>
        </div>
      </div>

      {/* Liste des documents */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4">Titre</th>
              <th className="text-left p-4">Catégorie</th>
              <th className="text-left p-4">Date</th>
              <th className="text-left p-4">Type</th>
              <th className="text-left p-4">Statut</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredDocuments.map((doc) => (
              <tr key={doc._id} className="hover:bg-gray-50">
                <td className="p-4">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <div className="font-medium">{doc.title}</div>
                      <div className="text-sm text-gray-500">{doc.size}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    doc.category === 'regulatory' ? 'bg-purple-100 text-purple-700' :
                    doc.category === 'policy' ? 'bg-blue-100 text-blue-700' :
                    doc.category === 'reports' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {doc.category}
                  </span>
                </td>
                <td className="p-4 text-sm">
                  {new Date(doc.publicationDate).toLocaleDateString('fr-FR')}
                </td>
                <td className="p-4 text-sm uppercase">{doc.type}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    doc.status === 'published' 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {doc.status === 'published' ? 'Publié' : 'Brouillon'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(doc)}
                      className="p-1 hover:text-blue-600 rounded-full hover:bg-blue-50"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:text-green-600 rounded-full hover:bg-green-50"
                      title="Télécharger"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="p-1 hover:text-red-600 rounded-full hover:bg-red-50"
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
          <div className="bg-white rounded-xl shadow-xl w-2/3 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">
                  {editingDocument ? 'Modifier le document' : 'Nouveau document'}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Titre</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Catégorie</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="regulatory">Textes réglementaires</option>
                      <option value="policy">Politiques</option>
                      <option value="reports">Rapports</option>
                      <option value="guides">Guides</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Date de publication</label>
                    <input
                      type="date"
                      value={formData.publicationDate}
                      onChange={(e) => setFormData({ ...formData, publicationDate: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Document</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                      id="document-upload"
                    />
                    <label
                      htmlFor="document-upload"
                      className="flex items-center justify-center w-full px-4 py-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500"
                    >
                      <Upload className="w-5 h-5 mr-2 text-gray-400" />
                      <span className="text-gray-600">
                        {file ? file.name : 
                         formData.url ? 'Modifier le document' : 
                         'Cliquer pour sélectionner un document'}
                      </span>
                    </label>
                    {formData.url && !file && (
                      <div className="mt-2 text-sm text-gray-500 flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        Document actuel: {formData.url.split('/').pop()}
                      </div>
                    )}
                    {file && (
                      <div className="mt-2 text-sm text-gray-500 flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        Nouveau document: {file.name} ({formData.size})
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Statut</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="draft">Brouillon</option>
                    <option value="published">Publié</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingDocument ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {notification && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white animate-fade-in`}>
          {notification.message}
        </div>
      )}
    </div>
  );
}