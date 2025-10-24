// src/pages/admin/news.js
import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import NewsManager from '@/components/admin/NewsManager';

export default function AdminNews() {
  return (
    <AdminLayout 
      title="Gestion des actualités" 
      subtitle="Création et publication d'actualités"
      requiredPermission="canCreateContent"
    >
      <NewsManager />
    </AdminLayout>
  );
}

// Forcer SSR pour éviter les erreurs durant le SSG
export async function getServerSideProps() {
  return {
    props: {}
  };
}
