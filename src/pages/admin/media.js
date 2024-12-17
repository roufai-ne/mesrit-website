import React from 'react';
import AccessControl from '@/components/admin/AccessControl';
import MediaManager from '@/components/admin/MediaManager';
import SideNav from '@/components/admin/SideNav';

export default function AdminMedia() {
  return (
    <AccessControl>
      <div className="flex min-h-screen bg-gray-100">
        <SideNav />
        <main className="flex-1">
          <MediaManager />
        </main>
      </div>
    </AccessControl>
  );
}