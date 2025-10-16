// src/components/communication/NewsVideoUpload.js
import React, { useState } from 'react';
import { Video, Upload, X, Play, Pause, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { secureApi } from '@/lib/secureApi';

export default function NewsVideoUpload({ value, onChange, required }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewPlaying, setPreviewPlaying] = useState(false);

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation côté client
    const allowedTypes = ['video/mp4', 'video/webm', 'video/avi', 'video/mov', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Format non supporté. Utilisez MP4, WebM, AVI ou MOV');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Vidéo trop volumineuse (max 50MB)');
      return;
    }

    // Vérification de durée (estimation basique)
    const video = document.createElement('video');
    const objectUrl = URL.createObjectURL(file);
    
    video.onloadedmetadata = async () => {
      URL.revokeObjectURL(objectUrl);
      
      if (video.duration > 600) { // 10 minutes
        toast.error('Durée trop longue (max 10 minutes)');
        return;
      }

      // Procéder à l'upload
      await performUpload(file);
    };

    video.src = objectUrl;
  };

  const performUpload = async (file) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulation de progression (à améliorer avec vraie progression)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await secureApi.uploadFile('/api/upload/video', file, true);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Structurer les données vidéo
      const videoData = {
        url: response.url,
        thumbnail: response.thumbnail,
        title: file.name.replace(/\.[^/.]+$/, ""), // Nom sans extension
        description: '',
        duration: 0, // Sera calculé côté serveur
        format: response.metadata.format,
        size: response.metadata.size,
        uploadedAt: new Date(),
        isMain: !value // Première vidéo = principale
      };

      onChange(videoData);
      toast.success('Vidéo téléchargée avec succès');
      
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      toast.error(error.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeVideo = () => {
    onChange(null);
    toast.success('Vidéo supprimée');
  };

  const togglePreview = () => {
    const video = document.getElementById('video-preview');
    if (video) {
      if (previewPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setPreviewPlaying(!previewPlaying);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-niger-green dark:text-niger-green-light">
        Vidéo {required && '*'}
      </label>
      
      {!value ? (
        <div 
          className="border-2 border-dashed border-niger-orange/30 dark:border-secondary-600 rounded-lg p-8 text-center cursor-pointer hover:border-niger-orange bg-niger-cream/20 dark:bg-secondary-700/50 transition-colors"
          onClick={() => document.getElementById('videoInput').click()}
        >
          {uploading ? (
            <div className="space-y-4">
              <div className="animate-spin mx-auto">
                <Upload className="w-12 h-12 text-niger-orange" />
              </div>
              <div>
                <div className="text-lg font-medium text-niger-green dark:text-niger-green-light">
                  Upload en cours... {uploadProgress}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-niger-orange h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Video className="mx-auto h-12 w-12 text-niger-orange mb-4" />
              <div>
                <span className="text-lg font-medium text-niger-green dark:text-niger-green-light">
                  Cliquez pour ajouter une vidéo
                </span>
                <div className="text-sm text-readable-muted dark:text-muted-foreground mt-2">
                  Formats acceptés: MP4, WebM, AVI, MOV
                </div>
                <div className="text-sm text-readable-muted dark:text-muted-foreground">
                  Taille max: 50MB • Durée max: 10 minutes
                </div>
              </div>
            </>
          )}
          
          <input
            id="videoInput"
            type="file"
            onChange={handleVideoUpload}
            className="hidden"
            accept="video/mp4,video/webm,video/avi,video/mov,video/quicktime"
            required={required && !value}
            disabled={uploading}
          />
        </div>
      ) : (
        <div className="border border-niger-orange/20 dark:border-secondary-600 rounded-lg p-4 bg-white dark:bg-secondary-700">
          <div className="flex items-start space-x-4">
            {/* Miniature/Prévisualisation */}
            <div className="relative flex-shrink-0">
              <div className="w-32 h-20 bg-gray-100 dark:bg-secondary-600 rounded-lg overflow-hidden">
                <video
                  id="video-preview"
                  src={value.url}
                  className="w-full h-full object-cover"
                  onPlay={() => setPreviewPlaying(true)}
                  onPause={() => setPreviewPlaying(false)}
                />
              </div>
              <button
                type="button"
                onClick={togglePreview}
                className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/70 transition-colors rounded-lg"
              >
                {previewPlaying ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white ml-1" />
                )}
              </button>
            </div>

            {/* Informations vidéo */}
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-niger-green dark:text-niger-green-light">
                    {value.title || 'Vidéo sans titre'}
                  </h4>
                  <div className="text-sm text-readable-muted dark:text-muted-foreground">
                    Format: {value.format?.toUpperCase()} • Taille: {formatFileSize(value.size)}
                  </div>
                  {value.duration > 0 && (
                    <div className="text-sm text-readable-muted dark:text-muted-foreground">
                      Durée: {Math.floor(value.duration / 60)}:{String(value.duration % 60).padStart(2, '0')}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={removeVideo}
                  className="p-1 text-red-500 hover:text-red-700 transition-colors"
                  title="Supprimer la vidéo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Champs éditables */}
              <div className="space-y-2">
                <input
                  type="text"
                  value={value.title || ''}
                  onChange={(e) => onChange({ ...value, title: e.target.value })}
                  placeholder="Titre de la vidéo"
                  className="w-full p-2 text-sm border border-niger-orange/20 dark:border-secondary-600 rounded bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20"
                />
                <textarea
                  value={value.description || ''}
                  onChange={(e) => onChange({ ...value, description: e.target.value })}
                  placeholder="Description de la vidéo"
                  rows={2}
                  className="w-full p-2 text-sm border border-niger-orange/20 dark:border-secondary-600 rounded bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages d'aide */}
      <div className="flex items-start space-x-2 text-sm text-readable-muted dark:text-muted-foreground">
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div>
          <p>Formats supportés: MP4 (recommandé), WebM, AVI, MOV</p>
          <p>Pour une meilleure compatibilité, privilégiez le format MP4 avec codec H.264</p>
        </div>
      </div>
    </div>
  );
}
