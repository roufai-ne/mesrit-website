// src/pages/admin/logs.js
import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import SystemLogs from '@/components/admin/SystemLogs';

export default function AdminLogsPage() {
  return (
    <AdminLayout 
      title="Journaux système" 
      subtitle="Surveillance et audit des activités"
      requiredPermission="canViewLogs"
    >
      <SystemLogs />
    </AdminLayout>
  );
}