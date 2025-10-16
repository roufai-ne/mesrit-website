// src/pages/admin/ministere.js
import React from 'react';
import AccessControl from '@/components/admin/AccessControl';
import MinistereManager from '@/components/admin/MinistereManager';
import SideNav from '@/components/admin/SideNav';

export default function AdminMinistere() {
  return (
    <AccessControl>
      <div className="flex min-h-screen bg-gray-100 dark:bg-secondary-700">
        <SideNav />
        <main className="flex-1">
          <MinistereManager />
        </main>
      </div>
    </AccessControl>
  );
}