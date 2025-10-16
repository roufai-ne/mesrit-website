// src/pages/admin/documents.js
import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import DocumentManager from '@/components/admin/DocumentManager';

export default function AdminDocumentsPage() {
  return (
    <AdminLayout 
      title="Gestion des documents" 
      subtitle="Bibliothèque documentaire officielle"
      requiredPermission="canManageDocuments"
    >
      <DocumentManager />
    </AdminLayout>
  );
}