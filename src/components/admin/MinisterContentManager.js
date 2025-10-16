// src/components/admin/MinisterContentManager.js
import React, { useState, useEffect } from 'react';
import { 
  Save, 
  RefreshCw, 
  Eye, 
  Edit3, 
  Plus, 
  Trash2, 
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { secureApi, useApiAction } from '@/lib/secureApi';
import toast from 'react-hot-toast';

const MinisterContentManager = () => {
  const [content, setContent] = useState(null);
  const [missions, setMissions] = useState(null);
  const [activeTab, setActiveTab] = useState('content');
  const [editMode, setEditMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { execute, loading } = useApiAction();

  useEffect(() => {
    loadContent();
    loadMissions();
  }, []);

  const loadContent = async () => {
    try {
      await execute(async () => {
        const data = await secureApi.get('/api/ministere/content', false);
        setContent(data.data);
      });
    } catch (error) {
      toast.error('Erreur lors du chargement du contenu');
    }
  };

  const loadMissions = async () => {
    try {
      await execute(async () => {
        const data = await secureApi.get('/api/ministere/missions', false);
        setMissions(data.data);
      });
    } catch (error) {
      toast.error('Erreur lors du chargement des missions');
    }
  };

  const saveContent = async () => {
    try {
      await execute(async () => {
        await secureApi.post('/api/admin/ministere/content', content);
        setHasChanges(false);
        setEditMode(false);
        toast.success('Contenu sauvegardé avec succès');
      });
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const saveMissions = async () => {
    try {
      await execute(async () => {
        await secureApi.post('/api/admin/ministere/missions', missions);
        setHasChanges(false);
        setEditMode(false);
        toast.success('Missions sauvegardées avec succès');
      });
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const updateHeroContent = (field, value) => {
    setContent(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const updateSection = (index, field, value) => {
    setContent(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === index ? { ...section, [field]: value } : section
      )
    }));
    setHasChanges(true);
  };

  const updateMissionObjective = (missionIndex, objectiveIndex, field, value) => {
    setMissions(prev => ({
      ...prev,
      missions: prev.missions.map((mission, i) => 
        i === missionIndex ? {
          ...mission,
          objectifs: mission.objectifs.map((obj, j) => 
            j === objectiveIndex ? { ...obj, [field]: value } : obj
          )
        } : mission
      )
    }));
    setHasChanges(true);
  };

  const exportContent = () => {
    const dataStr = JSON.stringify({ content, missions }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `minister-content-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('Contenu exporté avec succès');
  };

  if (loading && !content) {
    return (
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-secondary-600 rounded w-1/3"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-secondary-600 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-secondary-600 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
              Gestion du Contenu Ministère
            </h2>
            <p className="text-readable-muted dark:text-muted-foreground">
              Modifier le contenu des pages ministère en temps réel
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {hasChanges && (
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Modifications non sauvegardées</span>
              </div>
            )}
            
            <button
              onClick={exportContent}
              className="px-4 py-2 bg-gray-100 dark:bg-secondary-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-secondary-600 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter
            </button>
            
            <button
              onClick={() => {
                loadContent();
                loadMissions();
              }}
              disabled={loading}
              className="px-4 py-2 bg-niger-orange/10 text-niger-orange rounded-lg hover:bg-niger-orange/20 transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
            
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                editMode 
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' 
                  : 'bg-niger-green/10 text-niger-green'
              }`}
            >
              {editMode ? <Eye className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              {editMode ? 'Aperçu' : 'Modifier'}
            </button>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'content'
                ? 'bg-niger-orange text-white'
                : 'bg-gray-100 dark:bg-secondary-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-secondary-600'
            }`}
          >
            Contenu Principal
          </button>
          <button
            onClick={() => setActiveTab('missions')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'missions'
                ? 'bg-niger-orange text-white'
                : 'bg-gray-100 dark:bg-secondary-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-secondary-600'
            }`}
          >
            Missions & Objectifs
          </button>
        </div>
      </div>

      {/* Contenu Principal */}
      {activeTab === 'content' && content && (
        <div className="space-y-6">
          {/* Hero Section */}
          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-niger-green dark:text-niger-green-light mb-4">
              Section Hero
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-readable dark:text-foreground mb-2">
                  Titre Principal
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={content.hero?.title || ''}
                    onChange={(e) => updateHeroContent('title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-niger-orange focus:border-niger-orange bg-white dark:bg-secondary-700 text-readable dark:text-foreground"
                  />
                ) : (
                  <p className="text-readable dark:text-foreground p-2 bg-gray-50 dark:bg-secondary-700 rounded">
                    {content.hero?.title}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-readable dark:text-foreground mb-2">
                  Sous-titre
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={content.hero?.subtitle || ''}
                    onChange={(e) => updateHeroContent('subtitle', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-niger-orange focus:border-niger-orange bg-white dark:bg-secondary-700 text-readable dark:text-foreground"
                  />
                ) : (
                  <p className="text-readable dark:text-foreground p-2 bg-gray-50 dark:bg-secondary-700 rounded">
                    {content.hero?.subtitle}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-readable dark:text-foreground mb-2">
                  Description
                </label>
                {editMode ? (
                  <textarea
                    value={content.hero?.description || ''}
                    onChange={(e) => updateHeroContent('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-niger-orange focus:border-niger-orange bg-white dark:bg-secondary-700 text-readable dark:text-foreground"
                  />
                ) : (
                  <p className="text-readable dark:text-foreground p-2 bg-gray-50 dark:bg-secondary-700 rounded">
                    {content.hero?.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-niger-green dark:text-niger-green-light mb-4">
              Sections Principales
            </h3>
            
            <div className="space-y-6">
              {content.sections?.map((section, index) => (
                <div key={index} className="border border-gray-200 dark:border-secondary-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-readable dark:text-foreground">
                      Section {index + 1}: {section.title}
                    </h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-readable dark:text-foreground mb-1">
                        Contenu
                      </label>
                      {editMode ? (
                        <textarea
                          value={section.content || ''}
                          onChange={(e) => updateSection(index, 'content', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-600 rounded focus:ring-2 focus:ring-niger-orange focus:border-niger-orange bg-white dark:bg-secondary-700 text-readable dark:text-foreground text-sm"
                        />
                      ) : (
                        <p className="text-readable dark:text-foreground p-2 bg-gray-50 dark:bg-secondary-700 rounded text-sm">
                          {section.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {editMode && hasChanges && (
            <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <AlertCircle className="w-5 h-5" />
                  <span>Vous avez des modifications non sauvegardées</span>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      loadContent();
                      setHasChanges(false);
                      setEditMode(false);
                    }}
                    className="px-4 py-2 bg-gray-100 dark:bg-secondary-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-secondary-600 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={saveContent}
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-niger-orange to-niger-green text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    Sauvegarder
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Missions & Objectifs */}
      {activeTab === 'missions' && missions && (
        <div className="space-y-6">
          {missions.missions?.map((mission, missionIndex) => (
            <div key={mission.id || missionIndex} className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-niger-green dark:text-niger-green-light">
                  Mission: {mission.title}
                </h3>
                <div className="text-sm text-readable-muted dark:text-muted-foreground">
                  {mission.objectifs?.length || 0} objectifs
                </div>
              </div>

              {/* Objectifs avec barres de progression */}
              <div className="space-y-4">
                <h4 className="font-semibold text-readable dark:text-foreground flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-niger-orange" />
                  Objectifs et Progression
                </h4>
                
                {mission.objectifs?.map((objectif, objIndex) => (
                  <div key={objIndex} className="border border-gray-200 dark:border-secondary-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        {editMode ? (
                          <input
                            type="text"
                            value={objectif.text || ''}
                            onChange={(e) => updateMissionObjective(missionIndex, objIndex, 'text', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-600 rounded focus:ring-2 focus:ring-niger-orange focus:border-niger-orange bg-white dark:bg-secondary-700 text-readable dark:text-foreground"
                          />
                        ) : (
                          <h5 className="font-medium text-readable dark:text-foreground">
                            {objectif.text}
                          </h5>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 ml-4">
                        {editMode ? (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={objectif.progress || 0}
                            onChange={(e) => updateMissionObjective(missionIndex, objIndex, 'progress', parseInt(e.target.value))}
                            className="w-16 px-2 py-1 border border-gray-300 dark:border-secondary-600 rounded focus:ring-2 focus:ring-niger-orange focus:border-niger-orange bg-white dark:bg-secondary-700 text-readable dark:text-foreground text-sm"
                          />
                        ) : (
                          <span className="text-lg font-bold text-niger-orange">
                            {objectif.progress}%
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Barre de progression */}
                    <div className="w-full bg-gray-200 dark:bg-secondary-600 rounded-full h-2 mb-3">
                      <div 
                        className={`h-full transition-all duration-500 rounded-full ${
                          objectif.progress >= 80 ? 'bg-green-500' :
                          objectif.progress >= 60 ? 'bg-yellow-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${objectif.progress || 0}%` }}
                      />
                    </div>
                    
                    {editMode ? (
                      <textarea
                        value={objectif.description || ''}
                        onChange={(e) => updateMissionObjective(missionIndex, objIndex, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-600 rounded focus:ring-2 focus:ring-niger-orange focus:border-niger-orange bg-white dark:bg-secondary-700 text-readable dark:text-foreground text-sm"
                        placeholder="Description de l'objectif..."
                      />
                    ) : (
                      <p className="text-readable-muted dark:text-muted-foreground text-sm">
                        {objectif.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Actions pour missions */}
          {editMode && hasChanges && (
            <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <AlertCircle className="w-5 h-5" />
                  <span>Modifications des missions non sauvegardées</span>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      loadMissions();
                      setHasChanges(false);
                      setEditMode(false);
                    }}
                    className="px-4 py-2 bg-gray-100 dark:bg-secondary-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-secondary-600 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={saveMissions}
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-niger-orange to-niger-green text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    Sauvegarder Missions
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Statistiques d'utilisation */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-niger-green dark:text-niger-green-light mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-niger-orange" />
          Statistiques d'Utilisation
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-niger-cream/20 dark:bg-secondary-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-niger-orange mb-1">
              {content?.version || '1.0'}
            </div>
            <div className="text-sm text-readable-muted dark:text-muted-foreground">
              Version Contenu
            </div>
          </div>
          
          <div className="bg-niger-green/20 dark:bg-niger-green/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-niger-green mb-1">
              {content?.sections?.length || 0}
            </div>
            <div className="text-sm text-readable-muted dark:text-muted-foreground">
              Sections Actives
            </div>
          </div>
          
          <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {missions?.missions?.length || 0}
            </div>
            <div className="text-sm text-readable-muted dark:text-muted-foreground">
              Missions Définies
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinisterContentManager;