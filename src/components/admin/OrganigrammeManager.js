// src/components/admin/OrganigrammeManager.js
import React, { useState, useEffect } from 'react';
import { 
  Edit, 
  Save, 
  Users, 
  Building, 
  ChevronDown, 
  ChevronRight,
  Plus,
  Trash,
  Eye,
  Download,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { secureApi, useApiAction } from '@/lib/secureApi';
import toast from 'react-hot-toast';

export default function OrganigrammeManager() {
  const [directors, setDirectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState(new Set(['ministre', 'sg']));
  const [editMode, setEditMode] = useState(false);
  const { execute, loading: apiLoading } = useApiAction();

  useEffect(() => {
    fetchDirectors();
  }, []);

  const fetchDirectors = async () => {
    try {
      setLoading(true);
      const data = await secureApi.get('/api/directors', false);
      setDirectors(Array.isArray(data) ? data : []);
      toast.success('Organigramme chargé avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement de l\'organigramme');
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const exportOrganigramme = async () => {
    try {
      toast.success('Export de l\'organigramme en cours...');
      // Export PDF sera implémenté avec react-pdf ou jspdf
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    }
  };

  const renderDirectorNode = (director, level = 0) => {
    const hasSubDirections = directors.some(d => d.direction === director.key);
    const subDirections = directors.filter(d => d.direction === director.key);
    const isExpanded = expandedNodes.has(director.key);

    return (
      <div key={director._id} className={`ml-${level * 6}`}>
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 mb-4 border border-niger-orange/10 hover:border-niger-orange/30">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {hasSubDirections && (
                  <button
                    onClick={() => toggleNode(director.key)}
                    className="p-1 hover:bg-niger-orange/10 rounded transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-niger-orange" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-niger-orange" />
                    )}
                  </button>
                )}
                
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  director.key === 'ministre' ? 'bg-niger-orange/20' :
                  ['sg', 'sga'].includes(director.key?.toLowerCase()) ? 'bg-niger-green/20' :
                  ['dges', 'dgr'].includes(director.key?.toLowerCase()) ? 'bg-blue-500/20' :
                  'bg-gray-500/20'
                }`}>
                  <Users className={`w-5 h-5 ${
                    director.key === 'ministre' ? 'text-niger-orange' :
                    ['sg', 'sga'].includes(director.key?.toLowerCase()) ? 'text-niger-green' :
                    ['dges', 'dgr'].includes(director.key?.toLowerCase()) ? 'text-blue-500' :
                    'text-gray-500'
                  }`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-niger-green dark:text-niger-green-light">
                      {director.nom}
                    </h3>
                    {director.key && (
                      <span className="px-2 py-1 bg-niger-orange/10 text-niger-orange text-xs font-medium rounded-full">
                        {director.key}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-readable-muted dark:text-muted-foreground">
                    {director.titre}
                  </p>
                  {hasSubDirections && (
                    <p className="text-xs text-niger-orange mt-1">
                      {subDirections.length} sous-direction(s)
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  className="p-2 text-niger-green hover:bg-niger-green/10 rounded-lg transition-colors"
                  title="Voir le profil"
                >
                  <Eye className="w-4 h-4" />
                </button>
                {editMode && (
                  <>
                    <button 
                      className="p-2 text-niger-orange hover:bg-niger-orange/10 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Sous-directions */}
        {hasSubDirections && isExpanded && (
          <div className="ml-8 space-y-2">
            {subDirections.map((subDir) => (
              <div key={subDir._id} className="bg-niger-cream/10 dark:bg-secondary-700 rounded-lg p-3 border-l-4 border-niger-orange/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-niger-green dark:text-niger-green-light text-sm">
                      {subDir.nom}
                    </h4>
                    <p className="text-xs text-readable-muted dark:text-muted-foreground">
                      {subDir.nomComplet || subDir.titre}
                    </p>
                    {subDir.responsable && (
                      <p className="text-xs text-niger-orange mt-1">
                        Responsable: {subDir.responsable}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button 
                      className="p-1 text-niger-green hover:bg-niger-green/10 rounded transition-colors"
                      title="Voir"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    {editMode && (
                      <button 
                        className="p-1 text-niger-orange hover:bg-niger-orange/10 rounded transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderHierarchy = () => {
    const ministre = directors.find(d => d.titre?.toLowerCase().includes('ministre'));
    const sg = directors.find(d => d.key === 'SG');
    const sga = directors.find(d => d.key === 'SGA');
    const dgs = directors.filter(d => ['DGES', 'DGR'].includes(d.key));

    return (
      <div className="space-y-6">
        {/* Niveau Ministre */}
        {ministre && (
          <div>
            <h3 className="text-lg font-semibold text-niger-green dark:text-niger-green-light mb-4 flex items-center gap-2">
              <Building className="w-5 h-5" />
              Cabinet du Ministre
            </h3>
            {renderDirectorNode(ministre, 0)}
          </div>
        )}
        
        {/* Niveau Secrétariat Général */}
        {sg && (
          <div>
            <h3 className="text-lg font-semibold text-niger-green dark:text-niger-green-light mb-4 flex items-center gap-2">
              <Building className="w-5 h-5" />
              Secrétariat Général
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>{renderDirectorNode(sg, 0)}</div>
              {sga && <div>{renderDirectorNode(sga, 0)}</div>}
            </div>
          </div>
        )}
        
        {/* Niveau Directions Générales */}
        {dgs.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-niger-green dark:text-niger-green-light mb-4 flex items-center gap-2">
              <Building className="w-5 h-5" />
              Directions Générales
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {dgs.map((dg) => (
                <div key={dg._id}>{renderDirectorNode(dg, 0)}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-8 bg-niger-orange/20 rounded w-1/3"></div>
            <div className="h-10 bg-niger-green/20 rounded w-32"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-niger-cream/20 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-niger-green dark:text-niger-green-light">
            Organigramme du Ministère
          </h2>
          <p className="text-readable-muted dark:text-muted-foreground mt-1">
            Structure hiérarchique basée sur les données du DirectorManager
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
              editMode 
                ? 'bg-gradient-to-r from-niger-orange to-niger-green text-white shadow-lg' 
                : 'bg-white dark:bg-secondary-800 border border-niger-orange/30 text-niger-orange hover:bg-niger-orange/10'
            }`}
          >
            {editMode ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
            {editMode ? 'Sauvegarder' : 'Modifier'}
          </button>
          
          <button
            onClick={exportOrganigramme}
            className="px-4 py-2 bg-niger-green/10 text-niger-green rounded-lg hover:bg-niger-green/20 transition-all duration-300 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
          
          <button
            onClick={fetchDirectors}
            disabled={loading}
            className="p-2 bg-white dark:bg-secondary-800 border border-niger-orange/30 text-niger-orange rounded-lg hover:bg-niger-orange/10 transition-all duration-300"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-secondary-800 rounded-xl p-4 shadow-lg border border-niger-orange/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-readable-muted dark:text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-niger-green dark:text-niger-green-light">{directors.length}</p>
            </div>
            <Users className="w-6 h-6 text-niger-orange" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-secondary-800 rounded-xl p-4 shadow-lg border border-niger-green/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-readable-muted dark:text-muted-foreground">Cabinet</p>
              <p className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                {directors.filter(d => ['ministre', 'sg', 'sga'].includes(d.key?.toLowerCase())).length}
              </p>
            </div>
            <Building className="w-6 h-6 text-niger-green" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-secondary-800 rounded-xl p-4 shadow-lg border border-niger-orange/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-readable-muted dark:text-muted-foreground">Dir. Générales</p>
              <p className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                {directors.filter(d => ['dges', 'dgr'].includes(d.key?.toLowerCase())).length}
              </p>
            </div>
            <Building className="w-6 h-6 text-niger-orange" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-secondary-800 rounded-xl p-4 shadow-lg border border-niger-green/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-readable-muted dark:text-muted-foreground">Directions</p>
              <p className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                {directors.filter(d => d.direction).length}
              </p>
            </div>
            <Users className="w-6 h-6 text-niger-green" />
          </div>
        </div>
      </div>
      
      {/* Organigramme */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-6">
        {directors.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-readable-muted dark:text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold text-readable dark:text-foreground mb-2">
              Aucune donnée disponible
            </h3>
            <p className="text-readable-muted dark:text-muted-foreground mb-4">
              L'organigramme sera généré automatiquement à partir des données du DirectorManager.
            </p>
            <button
              onClick={fetchDirectors}
              className="bg-gradient-to-r from-niger-orange to-niger-green text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Recharger les données
            </button>
          </div>
        ) : (
          renderHierarchy()
        )}
      </div>
    </div>
  );
}