// src/pages/admin/newsletter/config.js
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import PermissionGuard from '@/components/admin/PermissionGuard';
import NewsletterConfigManager from '@/components/admin/NewsletterConfigManager';
import { useAuth } from '@/contexts/AuthContext';

export default function NewsletterConfigPage() {
  const { user } = useAuth();
  
  return (
    <AdminLayout>
      <PermissionGuard permission="canManageNewsletter">
        <div className="min-h-screen bg-gray-50 dark:bg-secondary-900">
          <div className="max-w-6xl mx-auto">
            <NewsletterConfigManager />
          </div>
        </div>
      </PermissionGuard>
    </AdminLayout>
  );
}

// Vérification côté serveur
export async function getServerSideProps(context) {
  // Ici on pourrait ajouter des vérifications supplémentaires
  return {
    props: {}
  };
}