// src/pages/admin/documents.js
import React from 'react';
import AccessControl from '@/components/admin/AccessControl';
import DocumentManager from '@/components/admin/DocumentManager';
import SideNav from '@/components/admin/SideNav';

export default function AdminDocumentsPage() {

  return (
    <AccessControl>
      <div className="flex min-h-screen bg-gray-100">
        <SideNav />
        <main className="flex-1">
          <DocumentManager />
        </main>
      </div>
    </AccessControl>
  );
}