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