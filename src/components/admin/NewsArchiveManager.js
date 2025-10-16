// src/components/admin/NewsArchiveManager.js
import React from 'react';
import { Archive } from 'lucide-react';

export default function NewsArchiveManager() {
  return (
    <div className="p-6 text-center">
      <Archive className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        Gestionnaire d'Archives
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        Interface de gestion des archives en cours de développement
      </p>
    </div>
  );
}