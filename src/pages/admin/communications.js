import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import CommunicationsManager from '@/components/admin/CommunicationsManager';

export default function CommunicationsPage() {
  return (
    <AdminLayout 
      title="Gestion des communications" 
      subtitle="Communications officielles et annonces"
      requiredPermission="canManageCommunications"
    >
      <CommunicationsManager />
    </AdminLayout>
  );
}

// Forcer SSR pour éviter les erreurs durant le SSG
export async function getServerSideProps() {
  return {
    props: {}
  };
}
