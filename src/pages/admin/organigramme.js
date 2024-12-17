import React from 'react';
import AccessControl from '@/components/admin/AccessControl';
import OrganigrammeManager from '@/components/admin/OrganigrammeManager';
import SideNav from '@/components/admin/SideNav';

export default function AdminOrganigramme() {
  return (
    <AccessControl>
      <div className="flex min-h-screen bg-gray-100">
        <SideNav />
        <main className="flex-1">
          <OrganigrammeManager />
        </main>
      </div>
    </AccessControl>
  );
}