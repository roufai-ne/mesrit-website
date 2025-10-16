// src/components/admin/MinistereManager.js
import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Plus, 
  Trash, 
  Edit, 
  FileText, 
  Calendar, 
  Users, 
  Building, 
  Settings,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  AlertCircle
} from 'lucide-react';
import { secureApi, useApiAction } from '@/lib/secureApi';
import toast from 'react-hot-toast';

export default function MinistereManager() {
  // États pour les différentes sections
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const { execute, loading: apiLoading } = useApiAction();
  
  // États pour les données
  const [ministryContent, setMinistryContent] = useState({
    mission: '',
    vision: '',
    objectifs: [],
    histoire: ''
  });
  const [documents, setDocuments] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [stats, setStats] = useState({});
  
  // États pour les filtres et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // États pour les formulaires
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDocuments(),
        fetchEvents(),
        fetchAnnouncements(),
        fetchDirectors(),
        fetchStats()
      ]);
      toast.success('Données chargées avec succès');
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const data = await secureApi.get('/api/documents', true);
      // Filtrer les documents du ministère
      const ministryDocs = data.filter(doc => 
        doc.category === 'policy' || 
        doc.title.toLowerCase().includes('ministère') ||
        doc.title.toLowerCase().includes('mesrit')
      );
      setDocuments(ministryDocs);
    } catch (error) {
      console.error('Erreur documents:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const data = await secureApi.get('/api/events', true);
      // Filtrer les événements ministériels
      const ministryEvents = data.filter(event => 
        event.title.toLowerCase().includes('ministère') ||
        event.title.toLowerCase().includes('ministre') ||
        event.location?.toLowerCase().includes('ministère')
      );
      setEvents(ministryEvents);
    } catch (error) {
      console.error('Erreur événements:', error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      // Utiliser l'API des alertes pour les annonces publiques
      const data = await secureApi.get('/api/alerts', false);
      // Filtrer les annonces publiques (pas les alertes techniques)
      const publicAnnouncements = data.filter(alert => 
        alert.status === 'active' && 
        (alert.type === 'announcement' || alert.type === 'public_notice')
      );
      setAnnouncements(publicAnnouncements);
    } catch (error) {
      console.error('Erreur annonces:', error);
      setAnnouncements([]); // Fallback en cas d'erreur
    }
  };

  const fetchDirectors = async () => {
    try {
      const data = await secureApi.get('/api/directors', false);
      setDirectors(data);
    } catch (error) {
      console.error('Erreur directeurs:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await secureApi.get('/api/stats/homepage', false);
      setStats(data.stats || {});
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  };

  const handleSaveContent = async () => {
    try {
      await execute(async () => {
        // TODO: Créer API pour sauvegarder le contenu ministère
        // await secureApi.post('/api/ministry/content', ministryContent);
        toast.success('Contenu sauvegardé avec succès');
        setEditMode(false);
      });
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;
    
    try {
      await execute(async () => {
        await secureApi.delete(`/api/documents/${docId}`);
        setDocuments(documents.filter(doc => doc._id !== docId));
        toast.success('Document supprimé avec succès');
      });
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;
    
    try {
      await execute(async () => {
        await secureApi.delete(`/api/events/${eventId}`);
        setEvents(events.filter(event => event._id !== eventId));
        toast.success('Événement supprimé avec succès');
      });
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchTerm || 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || doc.category === filterType;
    return matchesSearch && matchesFilter;
  });

  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchTerm || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Composants de rendu
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 shadow-lg border border-niger-orange/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-readable-muted dark:text-muted-foreground">Documents</p>
              <p className="text-2xl font-bold text-niger-green dark:text-niger-green-light">{documents.length}</p>
            </div>
            <FileText className="w-8 h-8 text-niger-orange" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 shadow-lg border border-niger-green/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-readable-muted dark:text-muted-foreground">Événements</p>
              <p className="text-2xl font-bold text-niger-green dark:text-niger-green-light">{events.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-niger-green" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 shadow-lg border border-niger-orange/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-readable-muted dark:text-muted-foreground">Annonces</p>
              <p className="text-2xl font-bold text-niger-green dark:text-niger-green-light">{announcements.length}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-niger-orange" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 shadow-lg border border-niger-orange/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-readable-muted dark:text-muted-foreground">Directeurs</p>
              <p className="text-2xl font-bold text-niger-green dark:text-niger-green-light">{directors.length}</p>
            </div>
            <Users className="w-8 h-8 text-niger-orange" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 shadow-lg border border-niger-green/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-readable-muted dark:text-muted-foreground">Étudiants</p>
              <p className="text-2xl font-bold text-niger-green dark:text-niger-green-light">{stats.students?.value || 0}</p>
            </div>
            <Building className="w-8 h-8 text-niger-green" />
          </div>
        </div>
      </div>
      
      {/* Actions rapides */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-niger-green dark:text-niger-green-light mb-4">Actions rapides</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <button
            onClick={() => setShowAnnouncementForm(true)}
            className="flex flex-col items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors border border-red-200 dark:border-red-800"
          >
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mb-2" />
            <span className="text-sm font-medium text-red-600 dark:text-red-400">Annonce Urgente</span>
          </button>
          
          <button
            onClick={() => setActiveTab('announcements')}
            className="flex flex-col items-center p-4 bg-niger-orange/10 dark:bg-niger-orange/20 rounded-lg hover:bg-niger-orange/20 transition-colors"
          >
            <AlertCircle className="w-6 h-6 text-niger-orange mb-2" />
            <span className="text-sm font-medium text-niger-orange">Gérer Annonces</span>
          </button>
          
          <button
            onClick={() => setActiveTab('events')}
            className="flex flex-col items-center p-4 bg-niger-green/10 dark:bg-niger-green/20 rounded-lg hover:bg-niger-green/20 transition-colors"
          >
            <Calendar className="w-6 h-6 text-niger-green mb-2" />
            <span className="text-sm font-medium text-niger-green">Gérer Agenda</span>
          </button>
          
          <button
            onClick={() => setActiveTab('documents')}
            className="flex flex-col items-center p-4 bg-niger-orange/10 dark:bg-niger-orange/20 rounded-lg hover:bg-niger-orange/20 transition-colors"
          >
            <FileText className="w-6 h-6 text-niger-orange mb-2" />
            <span className="text-sm font-medium text-niger-orange">Gérer Documents</span>
          </button>
          
          <button
            onClick={() => setActiveTab('directors')}
            className="flex flex-col items-center p-4 bg-niger-green/10 dark:bg-niger-green/20 rounded-lg hover:bg-niger-green/20 transition-colors"
          >
            <Users className="w-6 h-6 text-niger-green mb-2" />
            <span className="text-sm font-medium text-niger-green">Gérer Équipe</span>
          </button>
        </div>
      </div>

      {/* Aperçu temps réel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dernières annonces */}
        <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-niger-green dark:text-niger-green-light">Dernières Annonces</h3>
            <button
              onClick={() => setActiveTab('announcements')}
              className="text-niger-orange hover:text-niger-green transition-colors text-sm font-medium"
            >
              Voir tout →
            </button>
          </div>
          <div className="space-y-3">
            {announcements.slice(0, 3).map((announcement) => (
              <div key={announcement._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-secondary-700 rounded-lg hover:bg-gray-100 dark:hover:bg-secondary-600 transition-colors">
                <div className={`w-2 h-2 rounded-full ${
                  announcement.priority === 'high' ? 'bg-red-500' :
                  announcement.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-niger-green dark:text-niger-green-light truncate">
                    {announcement.title}
                  </p>
                  <p className="text-xs text-readable-muted dark:text-muted-foreground">
                    {new Date(announcement.startDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
            {announcements.length === 0 && (
              <p className="text-sm text-readable-muted dark:text-muted-foreground text-center py-4">
                Aucune annonce récente
              </p>
            )}
          </div>
        </div>

        {/* Prochains événements */}
        <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-niger-green dark:text-niger-green-light">Prochains Événements</h3>
            <button
              onClick={() => setActiveTab('events')}
              className="text-niger-orange hover:text-niger-green transition-colors text-sm font-medium"
            >
              Voir tout →
            </button>
          </div>
          <div className="space-y-3">
            {events.slice(0, 5).map((event) => (
              <div key={event._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-secondary-700 rounded-lg hover:bg-gray-100 dark:hover:bg-secondary-600 transition-colors">
                <Calendar className="w-4 h-4 text-niger-green flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-niger-green dark:text-niger-green-light truncate">
                    {event.title}
                  </p>
                  <p className="text-xs text-readable-muted dark:text-muted-foreground">
                    {new Date(event.date).toLocaleDateString('fr-FR')} - {event.location}
                  </p>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <p className="text-sm text-readable-muted dark:text-muted-foreground text-center py-4">
                Aucun événement programmé
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      {/* Barre de recherche et actions */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-niger-green dark:text-niger-green-light">Documents du Ministère</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDocumentForm(true)}
              className="bg-gradient-to-r from-niger-orange to-niger-green text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouveau Document
            </button>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-readable-muted dark:text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher des documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange bg-white dark:bg-secondary-700"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange bg-white dark:bg-secondary-700"
          >
            <option value="all">Toutes catégories</option>
            <option value="policy">Politiques</option>
            <option value="regulatory">Réglementaire</option>
            <option value="reports">Rapports</option>
            <option value="guides">Guides</option>
          </select>
        </div>
      </div>
      
      {/* Liste des documents */}
      <div className="space-y-4">
        {filteredDocuments.map((doc) => (
          <div key={doc._id} className="bg-white dark:bg-secondary-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-niger-orange/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-niger-orange" />
                </div>
                <div>
                  <h3 className="font-semibold text-niger-green dark:text-niger-green-light">{doc.title}</h3>
                  <p className="text-sm text-readable-muted dark:text-muted-foreground">{doc.description}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-readable-muted dark:text-muted-foreground">
                    <span className="px-2 py-1 bg-niger-cream/20 dark:bg-secondary-700 rounded">{doc.type?.toUpperCase()}</span>
                    <span>{doc.size}</span>
                    <span>•</span>
                    <span>{new Date(doc.publicationDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-2 text-niger-green hover:bg-niger-green/10 rounded-lg transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-niger-orange hover:bg-niger-orange/10 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteDocument(doc._id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredDocuments.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-secondary-800 rounded-xl">
            <FileText className="w-12 h-12 mx-auto mb-4 text-readable-muted dark:text-muted-foreground opacity-50" />
            <p className="text-readable-muted dark:text-muted-foreground">
              {searchTerm ? `Aucun document trouvé pour "${searchTerm}"` : 'Aucun document disponible'}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderAnnouncements = () => (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-niger-green dark:text-niger-green-light">Annonces Publiques</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAnnouncementForm(true)}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              Annonce Urgente
            </button>
            <button
              onClick={() => setShowAnnouncementForm(true)}
              className="bg-gradient-to-r from-niger-orange to-niger-green text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouvelle Annonce
            </button>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-readable-muted dark:text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher des annonces..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange bg-white dark:bg-secondary-700"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange bg-white dark:bg-secondary-700"
          >
            <option value="all">Tous les types</option>
            <option value="urgent">Urgentes</option>
            <option value="info">Informatives</option>
            <option value="scholarship">Bourses</option>
            <option value="registration">Inscriptions</option>
          </select>
        </div>
      </div>
      
      {/* Liste des annonces */}
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div key={announcement._id} className="bg-white dark:bg-secondary-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  announcement.priority === 'high' ? 'bg-red-100 dark:bg-red-900/40' :
                  announcement.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/40' :
                  'bg-blue-100 dark:bg-blue-900/40'
                }`}>
                  <AlertCircle className={`w-6 h-6 ${
                    announcement.priority === 'high' ? 'text-red-600 dark:text-red-400' :
                    announcement.priority === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-blue-600 dark:text-blue-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-niger-green dark:text-niger-green-light">{announcement.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      announcement.priority === 'high' ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400' :
                      announcement.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-400' :
                      'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-400'
                    }`}>
                      {announcement.priority === 'high' ? 'URGENT' :
                       announcement.priority === 'medium' ? 'Important' : 'Info'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      announcement.status === 'active' 
                        ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    }`}>
                      {announcement.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-readable-muted dark:text-muted-foreground mb-3">{announcement.description}</p>
                  <div className="flex items-center gap-4 text-xs text-readable-muted dark:text-muted-foreground">
                    <span>📅 Du: {new Date(announcement.startDate).toLocaleDateString('fr-FR')}</span>
                    <span>📅 Au: {new Date(announcement.endDate).toLocaleDateString('fr-FR')}</span>
                    <span>👁️ Vues: {announcement.views || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-2 text-niger-green hover:bg-niger-green/10 rounded-lg transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-niger-orange hover:bg-niger-orange/10 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {announcements.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-secondary-800 rounded-xl">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-readable-muted dark:text-muted-foreground opacity-50" />
            <p className="text-readable-muted dark:text-muted-foreground">
              {searchTerm ? `Aucune annonce trouvée pour "${searchTerm}"` : 'Aucune annonce disponible'}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-niger-green dark:text-niger-green-light">Agenda Ministériel</h2>
          <button
            onClick={() => setShowEventForm(true)}
            className="bg-gradient-to-r from-niger-green to-niger-orange text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvel Événement
          </button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-readable-muted dark:text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher des événements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange bg-white dark:bg-secondary-700"
          />
        </div>
      </div>
      
      {/* Liste des événements */}
      <div className="space-y-4">
        {filteredEvents.map((event) => (
          <div key={event._id} className="bg-white dark:bg-secondary-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-niger-green/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-niger-green" />
                </div>
                <div>
                  <h3 className="font-semibold text-niger-green dark:text-niger-green-light">{event.title}</h3>
                  <p className="text-sm text-readable-muted dark:text-muted-foreground">{event.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-readable-muted dark:text-muted-foreground">
                    <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                    <span>⏰ {event.time}</span>
                    <span>📍 {event.location}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-2 text-niger-green hover:bg-niger-green/10 rounded-lg transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-niger-orange hover:bg-niger-orange/10 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteEvent(event._id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredEvents.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-secondary-800 rounded-xl">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-readable-muted dark:text-muted-foreground opacity-50" />
            <p className="text-readable-muted dark:text-muted-foreground">
              {searchTerm ? `Aucun événement trouvé pour "${searchTerm}"` : 'Aucun événement disponible'}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-niger-green dark:text-niger-green-light">Gestion du Ministère</h1>
          <p className="text-readable-muted dark:text-muted-foreground mt-1">Tableau de bord centralisé pour la gestion du contenu ministériel</p>
        </div>
        
        <div className="flex items-center gap-3">
          {loading && (
            <div className="flex items-center gap-2 text-niger-orange">
              <div className="w-4 h-4 border-2 border-niger-orange border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Chargement...</span>
            </div>
          )}
          
          <button
            onClick={fetchAllData}
            disabled={loading}
            className="p-2 bg-white dark:bg-secondary-800 border border-niger-orange/30 text-niger-orange rounded-lg hover:bg-niger-orange/10 transition-all duration-300"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Onglets */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg">
        <div className="border-b border-niger-orange/10 dark:border-secondary-600">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: Building },
              { id: 'announcements', label: 'Annonces', icon: AlertCircle },
              { id: 'events', label: 'Agenda', icon: Calendar },
              { id: 'documents', label: 'Documents', icon: FileText },
              { id: 'directors', label: 'Équipe', icon: Users },
              { id: 'content', label: 'Contenu', icon: Edit }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-niger-orange text-niger-orange'
                      : 'border-transparent text-readable-muted dark:text-muted-foreground hover:text-niger-green hover:border-niger-green/30'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'announcements' && renderAnnouncements()}
          {activeTab === 'events' && renderEvents()}
          {activeTab === 'documents' && renderDocuments()}
          {activeTab === 'directors' && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-readable-muted dark:text-muted-foreground opacity-50" />
              <p className="text-readable-muted dark:text-muted-foreground mb-4">
                La gestion de l'équipe dirigeante se fait via le DirectorManager dédié.
              </p>
              <button className="bg-gradient-to-r from-niger-orange to-niger-green text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300">
                Accéder au DirectorManager
              </button>
            </div>
          )}
          {activeTab === 'content' && (
            <div className="text-center py-12">
              <Edit className="w-12 h-12 mx-auto mb-4 text-readable-muted dark:text-muted-foreground opacity-50" />
              <p className="text-readable-muted dark:text-muted-foreground mb-4">
                Édition du contenu des pages missions, historique, etc.
              </p>
              <p className="text-sm text-readable-muted dark:text-muted-foreground">
                Fonctionnalité en cours de développement...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}