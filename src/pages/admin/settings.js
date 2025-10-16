import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import Settings from '@/components/admin/Settings';

export default function AdminSettings() {
  return (
    <AdminLayout 
      title="Paramètres système" 
      subtitle="Configuration générale de l'application"
      requiredPermission="canManageSettings"
    >
      <Settings />
    </AdminLayout>
  );
}