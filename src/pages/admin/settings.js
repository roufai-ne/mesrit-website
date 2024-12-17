import React from 'react';
import AccessControl from '@/components/admin/AccessControl';
import Settings from '@/components/admin/Settings';
import SideNav from '@/components/admin/SideNav';

export default function AdminSettings() {
  return (
    <AccessControl>
      <div className="flex min-h-screen bg-gray-100">
        <SideNav />
        <main className="flex-1">
          <Settings />
        </main>
      </div>
    </AccessControl>
  );
}