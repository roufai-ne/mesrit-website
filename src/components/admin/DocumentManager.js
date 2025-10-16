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
import { secureApi, useApiAction } from '@/lib/secureApi';
import { useAuth } from '@/contexts/AuthContext';
import { usePermission } from '@/hooks/usePermissionRBAC';

export default function DocumentManager() {
  const { user } = useAuth();
  const permissions = usePermission();
  const [documents, setDocuments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notification, setNotification] = useState(null);
  const [file, setFile] = useState(null);
  const { execute, loading } = useApiAction();

  // Permissions RBAC granulaires pour les documents
  const canCreateDocuments = permissions.canManageDocuments;
  const canEditOwnDocuments = permissions.canManageDocuments;
  const canEditAllDocuments = permissions.isContentAdmin || permissions.isAdmin;
  const canDeleteDocuments = permissions.isContentAdmin || permissions.isAdmin;
  const canPublishDocuments = permissions.isContentAdmin || permissions.isAdmin;

  // Fonction pour vérifier si l'utilisateur peut éditer un document spécifique
  const canEditDocument = (document) => {
    if (canEditAllDocuments) return true;
    if (canEditOwnDocuments && document.uploadedBy === user?._id) return true;
    return false;
  };

  // Fonction pour vérifier si l'utilisateur peut supprimer un document spécifique
  const canDeleteDocument = (document) => {
    if (canDeleteDocuments) return true;
    return false;
  };

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
      // Utiliser l'API sécurisée avec authentification requise (true)
      const data = await secureApi.get('/api/documents', true);
      setDocuments(data);
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
        await execute(async () => {
          await secureApi.delete(`/api/documents/${id}`);
          setDocuments(prev => prev.filter(doc => doc._id !== id));
          showNotification('Document supprimé avec succès');
        });
      } catch (error) {
        showNotification(error.message || 'Erreur lors de la suppression', 'error');
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      await execute(async () => {
        let fileUrl = formData.url;
        let fileSize = formData.size;
        let fileType = formData.type;

        if (file) {
          // Upload du fichier si présent
          const uploadResult = await secureApi.uploadFile('/api/upload', file);
          fileUrl = uploadResult.url;
          fileSize = `${(uploadResult.size / (1024 * 1024)).toFixed(2)} MB`;
          fileType = uploadResult.type.split('/')[1];
        }

        // Préparer les données du document
        const documentData = {
          ...formData,
          url: fileUrl,
          size: fileSize,
          type: fileType
        };

        // Créer ou mettre à jour le document
        if (editingDocument) {
          await secureApi.put(`/api/documents/${editingDocument}`, documentData);
          showNotification('Document mis à jour avec succès');
        } else {
          await secureApi.post('/api/documents', documentData);
          showNotification('Document créé avec succès');
        }
        
        setShowForm(false);
        fetchDocuments();
      });
    } catch (error) {
      showNotification(error.message || 'Erreur lors de la sauvegarde', 'error');
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
        <h2 className="text-2xl font-bold text-niger-green dark:text-niger-green-light">Gestion des Documents</h2>
        {canCreateDocuments && (
          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-niger-orange to-niger-green text-white rounded-lg hover:shadow-lg transition-all duration-300"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter un document
          </button>
        )}
      </div>

      {/* Filtres */}
  <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg border border-niger-orange/10 p-4 mb-6 transition-colors duration-300">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-readable-muted dark:text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un document..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 p-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-niger-orange/20 focus:border-niger-orange duration-300 placeholder:text-readable-muted dark:placeholder:text-muted-foreground"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-niger-orange/20 focus:border-niger-orange duration-300"
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
            className="p-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-niger-orange/20 focus:border-niger-orange duration-300"
          >
            <option value="all">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="published">Publié</option>
          </select>
        </div>
      </div>

      {/* Liste des documents */}
  <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg border border-niger-orange/10 overflow-hidden transition-colors duration-300">
        <table className="w-full">
          <thead className="bg-niger-cream dark:bg-secondary-700 border-b border-niger-orange/10">
            <tr>
              <th className="text-left p-4 text-niger-green dark:text-niger-green-light font-semibold">Titre</th>
              <th className="text-left p-4 text-niger-green dark:text-niger-green-light font-semibold">Catégorie</th>
              <th className="text-left p-4 text-niger-green dark:text-niger-green-light font-semibold">Date</th>
              <th className="text-left p-4 text-niger-green dark:text-niger-green-light font-semibold">Type</th>
              <th className="text-left p-4 text-niger-green dark:text-niger-green-light font-semibold">Statut</th>
              <th className="text-left p-4 text-niger-green dark:text-niger-green-light font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-niger-orange/10">
            {filteredDocuments.map((doc) => (
              <tr key={doc._id} className="hover:bg-niger-cream/50 dark:hover:bg-secondary-700/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-niger-orange mr-3" />
                    <div>
                      <div className="font-medium text-niger-green dark:text-niger-green-light">{doc.title}</div>
                      <div className="text-sm text-readable-muted dark:text-muted-foreground">{doc.size}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      doc.category === 'regulatory'
                        ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400'
                        : doc.category === 'policy'
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
                        : doc.category === 'reports'
                        ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {doc.category}
                  </span>
                </td>
                <td className="p-4 text-sm text-readable-muted dark:text-muted-foreground">{new Date(doc.publicationDate).toLocaleDateString('fr-FR')}</td>
                <td className="p-4 text-sm uppercase text-readable-muted dark:text-muted-foreground">{doc.type}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      doc.status === 'published' 
                        ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {doc.status === 'published' ? 'Publié' : 'Brouillon'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    {canEditDocument(doc) && (
                      <button
                        onClick={() => handleEdit(doc)}
                        className="p-1 text-niger-green dark:text-niger-green-light hover:text-niger-orange rounded-full hover:bg-niger-orange/10 transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                      title="Télécharger"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    {canDeleteDocument(doc) && (
                      <button
                        onClick={() => handleDelete(doc._id)}
                        className="p-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Supprimer"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-xl border border-niger-orange/10 w-2/3 max-h-[90vh] overflow-y-auto transition-colors duration-300">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-niger-green dark:text-niger-green-light">
                  {editingDocument ? 'Modifier le document' : 'Nouveau document'}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-readable-muted dark:text-muted-foreground hover:text-niger-orange transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Titre</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Catégorie</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                    >
                      <option value="regulatory">Textes réglementaires</option>
                      <option value="policy">Politiques</option>
                      <option value="reports">Rapports</option>
                      <option value="guides">Guides</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Date de publication</label>
                    <input
                      type="date"
                      value={formData.publicationDate}
                      onChange={(e) => setFormData({ ...formData, publicationDate: e.target.value })}
                      className="w-full px-4 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Document</label>
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
                      className="flex items-center justify-center w-full px-4 py-4 border-2 border-dashed border-niger-orange/30 dark:border-secondary-600 rounded-lg cursor-pointer hover:border-niger-orange bg-niger-cream/20 dark:bg-secondary-700/50 transition-colors"
                    >
                      <Upload className="w-5 h-5 mr-2 text-niger-orange" />
                      <span className="text-niger-green dark:text-niger-green-light">
                        {file
                          ? file.name
                          : formData.url
                          ? 'Modifier le document (<15Mo)'
                          : 'Cliquer pour sélectionner un document (<15Mo)'}
                      </span>
                    </label>
                    {formData.url && !file && (
                      <div className="mt-2 text-sm text-readable-muted dark:text-muted-foreground flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-niger-orange" />
                        Document actuel: {formData.url.split('/').pop()}
                      </div>
                    )}
                    {file && (
                      <div className="mt-2 text-sm text-readable-muted dark:text-muted-foreground flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-niger-orange" />
                        Nouveau document: {file.name} ({formData.size})
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">Statut</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    disabled={!canPublishDocuments && formData.status === 'published'}
                    className="w-full px-4 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300 disabled:opacity-50"
                  >
                    <option value="draft">Brouillon</option>
                    {canPublishDocuments && <option value="published">Publié</option>}
                  </select>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-niger-orange/10">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-niger-orange/20 text-niger-orange rounded-lg hover:bg-niger-orange/10 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-niger-orange to-niger-green text-white rounded-lg hover:shadow-lg transition-all duration-300"
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
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
            notification.type === 'success' 
              ? 'bg-green-500 dark:bg-green-600' 
              : 'bg-red-500 dark:bg-red-600'
          } text-white animate-fade-in z-50`}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
}