import React from 'react';
import AccessControl from '@/components/admin/AccessControl';
import UserManager from '@/components/admin/UserManager';
import SideNav from '@/components/admin/SideNav';

export default function AdminUsers() {
  return (
    <AccessControl>
      <div className="flex min-h-screen bg-gray-100">
        <SideNav />
        <main className="flex-1">
          <UserManager />
        </main>
      </div>
    </AccessControl>
  );
}
