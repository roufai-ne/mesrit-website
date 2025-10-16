// src/components/admin/NewsVersionManager.js
import React, { useState, useEffect } from 'react';
import { useNewsVersions } from '@/hooks/useNewsArchive';
import { 
  History, 
  RotateCcw, 
  Calendar, 
  User, 
  FileText, 
  Eye, 
  X,
  Clock,
  GitBranch,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function NewsVersionManager({ newsId, onClose }) {
  const { loading, error, getVersions, revertToVersion } = useNewsVersions();
  const [versions, setVersions] = useState([]);
  const [article, setArticle] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [showConfirmRevert, setShowConfirmRevert] = useState(null);

  useEffect(() => {
    if (newsId) {
      loadVersions();
    }
  }, [newsId]);

  const loadVersions = async () => {
    try {
      const data = await getVersions(newsId);
      setVersions(data.versions);
      setArticle(data.article);
    } catch (error) {
      console.error('Erreur chargement versions:', error);
    }
  };

  const handleRevert = async (version) => {
    try {
      await revertToVersion(newsId, version.version);
      await loadVersions();
      setShowConfirmRevert(null);
    } catch (error) {
      console.error('Erreur retour version:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVersionStatus = (version) => {
    if (version.isCurrent) {
      return { color: 'text-green-600', bg: 'bg-green-100', label: 'Actuelle' };
    }
    return { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Archivée' };
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-secondary-800 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <History className="w-6 h-6 animate-spin text-niger-orange" />
            <span className="text-niger-green dark:text-niger-green-light">
              Chargement des versions...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-secondary-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-secondary-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-niger-orange/10 rounded-lg">
              <History className="w-6 h-6 text-niger-orange" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-niger-green dark:text-niger-green-light">
                Historique des Versions
              </h2>
              {article && (
                <p className="text-readable-muted dark:text-muted-foreground">
                  {article.title}
                </p>
              )}
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Liste des versions */}
          <div className="w-1/2 border-r border-gray-200 dark:border-secondary-700 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-niger-green dark:text-niger-green-light mb-4">
                Versions ({versions.length})
              </h3>
              
              <div className="space-y-3">
                {versions.map((version) => {
                  const status = getVersionStatus(version);
                  
                  return (
                    <div
                      key={version.version}
                      onClick={() => setSelectedVersion(version)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedVersion?.version === version.version
                          ? 'border-niger-orange bg-niger-orange/5'
                          : 'border-gray-200 dark:border-secondary-600 hover:border-niger-orange/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <GitBranch className="w-4 h-4 text-niger-orange" />
                          <span className="font-semibold text-niger-green dark:text-niger-green-light">
                            Version {version.version}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        
                        {!version.isCurrent && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowConfirmRevert(version);
                            }}
                            className="p-1 hover:bg-niger-orange/10 rounded transition-colors"
                            title="Revenir à cette version"
                          >
                            <RotateCcw className="w-4 h-4 text-niger-orange" />
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm text-readable-muted dark:text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(version.modifiedAt)}</span>
                        </div>
                        
                        {version.modifiedBy && (
                          <div className="flex items-center space-x-2">
                            <User className="w-3 h-3" />
                            <span>{version.modifiedBy.username}</span>
                          </div>
                        )}
                        
                        {version.changeNote && (
                          <div className="flex items-start space-x-2">
                            <FileText className="w-3 h-3 mt-0.5" />
                            <span className="italic">{version.changeNote}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Aperçu de la version sélectionnée */}
          <div className="w-1/2 overflow-y-auto">
            {selectedVersion ? (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-niger-green dark:text-niger-green-light">
                    Aperçu - Version {selectedVersion.version}
                  </h3>
                  
                  {selectedVersion.isCurrent && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Version actuelle</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-6">
                  {/* Titre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Titre
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-secondary-700 rounded-lg">
                      <h4 className="text-lg font-semibold text-niger-green dark:text-niger-green-light">
                        {selectedVersion.title}
                      </h4>
                    </div>
                  </div>
                  
                  {/* Résumé */}
                  {selectedVersion.summary && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Résumé
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-secondary-700 rounded-lg">
                        <p className="text-readable-muted dark:text-muted-foreground">
                          {selectedVersion.summary}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Contenu */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contenu
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-secondary-700 rounded-lg max-h-64 overflow-y-auto">
                      <div 
                        className="prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: selectedVersion.content }}
                      />
                    </div>
                  </div>
                  
                  {/* Métadonnées */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Catégorie
                      </label>
                      <div className="p-2 bg-gray-50 dark:bg-secondary-700 rounded">
                        <span className="px-2 py-1 bg-niger-orange/10 text-niger-orange rounded-full text-sm">
                          {selectedVersion.category}
                        </span>
                      </div>
                    </div>
                    
                    {selectedVersion.tags && selectedVersion.tags.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Tags
                        </label>
                        <div className="p-2 bg-gray-50 dark:bg-secondary-700 rounded">
                          <div className="flex flex-wrap gap-1">
                            {selectedVersion.tags.map((tag, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 bg-niger-green/10 text-niger-green rounded-full text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center">
                <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Sélectionnez une version
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Cliquez sur une version pour voir son aperçu
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialog de confirmation de retour de version */}
      {showConfirmRevert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
          <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-niger-green dark:text-niger-green-light">
                Confirmer le Retour
              </h3>
            </div>
            
            <p className="text-readable-muted dark:text-muted-foreground mb-6">
              Êtes-vous sûr de vouloir revenir à la version {showConfirmRevert.version} ? 
              Cela créera une nouvelle version avec le contenu de la version sélectionnée.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmRevert(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-secondary-600 rounded-lg hover:bg-gray-50 dark:hover:bg-secondary-700 transition-colors"
              >
                Annuler
              </button>
              
              <button
                onClick={() => handleRevert(showConfirmRevert)}
                className="flex-1 px-4 py-2 bg-niger-orange text-white rounded-lg hover:bg-niger-orange-dark transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}