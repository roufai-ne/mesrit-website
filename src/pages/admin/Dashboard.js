// src/pages/admin/Dashboard.js
import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import RoleDashboard from '@/components/admin/RoleDashboard';

export default function AdminDashboard() {
  return (
    <AdminLayout 
      title="Tableau de bord" 
      subtitle="Vue d'ensemble de l'administration"
      requiredPermission="canAccessDashboard"
      showRoleIndicator={true}
    >
      <RoleDashboard />
    </AdminLayout>
  );
}

// Forcer SSR pour éviter les erreurs durant le SSG
export async function getServerSideProps() {
  return {
    props: {}
  };
}
