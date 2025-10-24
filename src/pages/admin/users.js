import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import EnhancedUserManager from '@/components/admin/EnhancedUserManager';

export default function AdminUsers() {
  return (
    <AdminLayout 
      title="Gestion des utilisateurs" 
      subtitle="Administration des comptes et des rôles"
      requiredPermission="canManageUsers"
    >
      <EnhancedUserManager />
    </AdminLayout>
  );
}


// Forcer SSR pour éviter les erreurs durant le SSG
export async function getServerSideProps() {
  return {
    props: {}
  };
}
