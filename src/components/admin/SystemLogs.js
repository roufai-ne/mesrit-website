// src/components/admin/SystemLogs.js
import React, { useState, useEffect } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  XCircle,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  User,
  Globe,
  BarChart3,
  TrendingUp,
  Clock,
  PieChart,
  LineChart,
  AlertOctagon
} from 'lucide-react';
import { secureApi, useApiAction } from '@/lib/secureApi';
import { useToast } from '@/components/ui/toast';

export default function SystemLogs() {
  const permissions = usePermission();
  const { execute, loading } = useApiAction();
  const { toast } = useToast();
  
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    levelStats: {},
    categoryStats: {},
    priorityStats: {},
    criticalUnprocessed: 0,
    total: 0,
    typeStats: [],
    hourlyActivity: [],
    userStats: [],
    trends: {}
  });
  const [filters, setFilters] = useState({
    level: 'all',
    category: 'all',
    priority: 'all',
    dateRange: '7d',
    search: ''
  });
  const [activeTab, setActiveTab] = useState('logs');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(50);
  const [totalLogs, setTotalLogs] = useState(0);

  useEffect(() => {
    const fetchLogsAndStats = async () => {
      try {
        // Fetch logs with pagination
        const logsResponse = await secureApi.get(`/api/admin/logs?page=${currentPage}&limit=${logsPerPage}`, true);
        
        // Fetch basic stats
        const statsResponse = await secureApi.get('/api/admin/logs/stats', true);
        
        if (logsResponse && logsResponse.success && statsResponse && statsResponse.success) {
          setLogs(logsResponse.data.logs || []);
          setTotalLogs(logsResponse.data.total || 0);
          setStats(statsResponse.data);
        } else {
          console.error('Error loading data:', { logsResponse, statsResponse });
          // Fallback avec des données vides
          setLogs([]);
          setTotalLogs(0);
          setStats({
            levelStats: {},
            categoryStats: {},
            priorityStats: {},
            criticalUnprocessed: 0,
            total: 0
          });
        }
      } catch (error) {
        console.error('Error loading logs:', error);
        toast.error('Erreur lors du chargement des logs: ' + (error.message || 'Erreur inconnue'));
      }
    };

    fetchLogsAndStats();
  }, [currentPage]);

  // Filter logs
  const filteredLogs = logs.filter(log => {
    // Filter by level
    if (filters.level !== 'all' && log.level !== filters.level) {
      return false;
    }

    // Filter by category
    if (filters.category !== 'all' && log.category !== filters.category) {
      return false;
    }

    // Filter by priority
    if (filters.priority !== 'all' && log.priority !== filters.priority) {
      return false;
    }

    // Filter by search
    if (filters.search) {
      const search = filters.search.toLowerCase();
      if (!log.message.toLowerCase().includes(search) &&
          !log.username.toLowerCase().includes(search) &&
          !log.type.toLowerCase().includes(search)) {
        return false;
      }
    }

    // Filter by date
    const now = Date.now();
    const dateRanges = {
      '1h': 3600000,
      '24h': 86400000,
      '7d': 604800000,
      '30d': 2592000000
    };

    if (filters.dateRange !== 'all' && dateRanges[filters.dateRange]) {
      const cutoff = now - dateRanges[filters.dateRange];
      if (new Date(log.timestamp).getTime() < cutoff) {
        return false;
      }
    }

    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const startIndex = (currentPage - 1) * logsPerPage;
  const endIndex = startIndex + logsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const getLevelIcon = (level) => {
    switch (level) {
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'debug':
        return <Clock className="w-5 h-5 text-gray-500 dark:text-muted-foreground" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getLevelBadge = (level) => {
    const styles = {
      error: 'bg-red-100 text-red-800 border-red-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      success: 'bg-green-100 text-green-800 border-green-200',
      info: 'bg-blue-100 text-blue-800 border-blue-200',
      debug: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[level] || styles.info}`}>
        {level.toUpperCase()}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };

    return styles[priority] || styles.medium;
  };

  const exportLogs = async () => {
    if (!permissions.canExportData) {
      toast.error('Vous n\'avez pas la permission d\'exporter les logs');
      return;
    }

    try {
      await execute(async () => {
        // Build export parameters
        const params = new URLSearchParams();
        if (filters.level !== 'all') params.append('level', filters.level);
        if (filters.category !== 'all') params.append('category', filters.category);
        if (filters.priority !== 'all') params.append('priority', filters.priority);
        if (filters.dateRange !== 'all') {
          const dateRanges = {
            '1h': 1,
            '24h': 1,
            '7d': 7,
            '30d': 30
          };
          if (dateRanges[filters.dateRange]) {
            const days = dateRanges[filters.dateRange];
            const dateTo = new Date();
            const dateFrom = new Date(dateTo.getTime() - days * 24 * 60 * 60 * 1000);
            params.append('dateFrom', dateFrom.toISOString());
            params.append('dateTo', dateTo.toISOString());
          }
        }
        
        // Download CSV file
        const response = await secureApi.get(`/api/admin/logs/export?${params}&format=csv`, true);
        
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response], { type: 'text/csv' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      });
    } catch (error) {
      console.error('Error exporting logs:', error);
      toast.error('Erreur lors de l\'export des logs');
    }
  };

  const refreshData = async () => {
    try {
      // Fetch logs with pagination
      const logsResponse = await secureApi.get(`/api/admin/logs?page=${currentPage}&limit=${logsPerPage}`, true);
      
      // Fetch basic stats
      const statsResponse = await secureApi.get('/api/admin/logs/stats', true);
      
      if (logsResponse && logsResponse.success && statsResponse && statsResponse.success) {
        setLogs(logsResponse.data.logs || []);
        setTotalLogs(logsResponse.data.total || 0);
        setStats(statsResponse.data);
      } else {
        console.error('Error refreshing data:', { logsResponse, statsResponse });
      }
    } catch (error) {
      console.error('Error refreshing logs:', error);
      toast.error('Erreur lors de l\'actualisation: ' + (error.message || 'Erreur inconnue'));
    }
  };

  // Clear logs functions
  const clearAllLogs = async () => {
    if (!permissions.canDeleteLogs) {
      toast.error('Vous n\'avez pas la permission de supprimer les logs');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer TOUS les logs ? Cette action est irréversible.')) {
      return;
    }

    try {
      await execute(async () => {
        const response = await secureApi.delete('/api/admin/logs/clear', true);
        if (response.success) {
          setLogs([]);
          setTotalLogs(0);
          await refreshData();
          toast.success('Tous les logs ont été supprimés avec succès');
        }
      });
    } catch (error) {
      console.error('Error clearing logs:', error);
      toast.error('Erreur lors de la suppression des logs');
    }
  };

  const clearOldLogs = async (days = 30) => {
    if (!permissions.canDeleteLogs) {
      toast.error('Vous n\'avez pas la permission de supprimer les logs');
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer les logs de plus de ${days} jours ?`)) {
      return;
    }

    try {
      await execute(async () => {
        const response = await secureApi.delete(`/api/admin/logs/clear?days=${days}`, true);
        if (response.success) {
          await refreshData();
          toast.success(`Les logs de plus de ${days} jours ont été supprimés (${response.data.deletedCount} entrées)`);
        }
      });
    } catch (error) {
      console.error('Error clearing old logs:', error);
      toast.error('Erreur lors de la suppression des anciens logs');
    }
  };

  const clearLogsByLevel = async (level) => {
    if (!permissions.canDeleteLogs) {
      toast.error('Vous n\'avez pas la permission de supprimer les logs');
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer tous les logs de niveau "${level}" ?`)) {
      return;
    }

    try {
      await execute(async () => {
        const response = await secureApi.delete(`/api/admin/logs/clear?level=${level}`, true);
        if (response.success) {
          await refreshData();
          toast.success(`Les logs de niveau "${level}" ont été supprimés (${response.data.deletedCount} entrées)`);
        }
      });
    } catch (error) {
      console.error('Error clearing logs by level:', error);
      toast.error('Erreur lors de la suppression des logs');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-niger-orange/20">
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'logs'
              ? 'text-niger-orange border-b-2 border-niger-orange'
              : 'text-readable-muted hover:text-readable dark:text-muted-foreground'
          }`}
        >
          Logs
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'stats'
              ? 'text-niger-orange border-b-2 border-niger-orange'
              : 'text-readable-muted hover:text-readable dark:text-muted-foreground'
          }`}
        >
          Statistiques
        </button>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Level Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-niger-orange" />
              <select
                value={filters.level}
                onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
                className="px-3 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
              >
                <option value="all">Tous les niveaux</option>
                <option value="info">Info</option>
                <option value="success">Succès</option>
                <option value="warning">Avertissements</option>
                <option value="error">Erreurs</option>
                <option value="debug">Debug</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-niger-orange" />
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="px-3 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
              >
                <option value="all">Toutes les catégories</option>
                <option value="auth">Authentification</option>
                <option value="user">Utilisateurs</option>
                <option value="content">Contenu</option>
                <option value="system">Système</option>
                <option value="security">Sécurité</option>
                <option value="performance">Performance</option>
                <option value="api">API</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-niger-orange" />
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="px-3 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
              >
                <option value="1h">Dernière heure</option>
                <option value="24h">Dernières 24h</option>
                <option value="7d">7 derniers jours</option>
                <option value="30d">30 derniers jours</option>
                <option value="all">Toutes les dates</option>
              </select>
            </div>

            {/* Search */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 pr-4 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300 w-full sm:w-64 placeholder:text-readable-muted dark:placeholder:text-muted-foreground"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5 dark:text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={refreshData}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-niger-green text-white rounded-lg hover:bg-niger-green-dark transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>

            {permissions.canExportData && (
              <button
                onClick={exportLogs}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-niger-orange text-white rounded-lg hover:bg-niger-orange-dark transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Exporter</span>
              </button>
            )}

            {permissions.canDeleteLogs && (
              <div className="relative group">
                <button
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Supprimer</span>
                </button>
                
                {/* Dropdown menu */}
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-secondary-800 rounded-lg shadow-lg border border-gray-200 dark:border-secondary-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="py-2">
                    <button
                      onClick={() => clearOldLogs(7)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-700"
                    >
                      Logs &gt; 7 jours
                    </button>
                    <button
                      onClick={() => clearOldLogs(30)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-700"
                    >
                      Logs &gt; 30 jours
                    </button>
                    <button
                      onClick={() => clearOldLogs(90)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-700"
                    >
                      Logs &gt; 90 jours
                    </button>
                    <hr className="my-2 border-gray-200 dark:border-secondary-600" />
                    <button
                      onClick={() => clearLogsByLevel('debug')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-700"
                    >
                      Logs Debug
                    </button>
                    <button
                      onClick={() => clearLogsByLevel('info')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-700"
                    >
                      Logs Info
                    </button>
                    <hr className="my-2 border-gray-200 dark:border-secondary-600" />
                    <button
                      onClick={clearAllLogs}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium"
                    >
                      ⚠️ Tous les logs
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-secondary-800 rounded-xl border border-niger-orange/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-niger-cream dark:bg-secondary-700 border-b border-niger-orange/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-niger-green dark:text-niger-green-light">
                    Niveau
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-niger-green dark:text-niger-green-light">
                    Catégorie
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-niger-green dark:text-niger-green-light">
                    Timestamp
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-niger-green dark:text-niger-green-light">
                    Message
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-niger-green dark:text-niger-green-light">
                    Utilisateur
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-niger-green dark:text-niger-green-light">
                    IP
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-niger-green dark:text-niger-green-light">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-niger-orange/10">
                {paginatedLogs.map((log) => (
                  <tr key={log._id || log.id} className="hover:bg-niger-cream/50 dark:hover:bg-secondary-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getLevelIcon(log.level)}
                        {getLevelBadge(log.level)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm capitalize">{log.category || 'system'}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-readable-muted dark:text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate">
                      <div className="text-sm">{log.message}</div>
                      {log.details && (
                        <div className="text-xs text-readable-muted dark:text-muted-foreground truncate">
                          {JSON.stringify(log.details).substring(0, 50)}...
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4 text-readable-muted dark:text-muted-foreground" />
                        <span className="text-sm">{log.username || 'system'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <Globe className="w-4 h-4 text-readable-muted dark:text-muted-foreground" />
                        <span className="text-sm">{log.ip || 'localhost'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono bg-gray-100 dark:bg-secondary-700 px-2 py-1 rounded">
                        {log.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredLogs.length > 0 && (
            <div className="px-6 py-4 border-t border-niger-orange/10 bg-niger-cream/30 dark:bg-secondary-700/30">
              <div className="flex items-center justify-between">
                <div className="text-sm text-readable-muted dark:text-muted-foreground">
                  Affichage de {startIndex + 1} à {Math.min(endIndex, filteredLogs.length)} sur {filteredLogs.length} logs
                  {totalLogs > filteredLogs.length && ` (${totalLogs} total)`}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-niger-orange/20 rounded-lg hover:bg-niger-orange/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 text-sm rounded-lg ${
                            currentPage === pageNum
                              ? 'bg-niger-orange text-white'
                              : 'border border-niger-orange/20 hover:bg-niger-orange/10'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-niger-orange/20 rounded-lg hover:bg-niger-orange/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            </div>
          )}

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-readable-muted dark:text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-niger-green dark:text-niger-green-light mb-2">
                Aucun log trouvé
              </h3>
              <p className="text-readable-muted dark:text-muted-foreground">
                Aucun log ne correspond aux critères de filtrage sélectionnés.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                  <Info className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                    {stats.levelStats.info || 0}
                  </div>
                  <div className="text-sm text-readable-muted dark:text-muted-foreground">Info</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                    {stats.levelStats.warning || 0}
                  </div>
                  <div className="text-sm text-readable-muted dark:text-muted-foreground">Avertissements</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                    {stats.levelStats.error || 0}
                  </div>
                  <div className="text-sm text-readable-muted dark:text-muted-foreground">Erreurs</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-niger-orange/20 rounded-lg">
                  <Activity className="w-6 h-6 text-niger-orange" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                    {stats.total || 0}
                  </div>
                  <div className="text-sm text-readable-muted dark:text-muted-foreground">Total</div>
                </div>
              </div>
            </div>
          </div>

          {/* Critical Alerts */}
          <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
            <h3 className="text-lg font-semibold text-niger-green dark:text-niger-green-light mb-4 flex items-center">
              <AlertOctagon className="w-5 h-5 mr-2 text-red-500" />
              Alertes Critiques
            </h3>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-niger-orange mb-2">{stats.criticalUnprocessed || 0}</div>
                <div className="text-readable-muted dark:text-muted-foreground">Logs critiques non traités</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}