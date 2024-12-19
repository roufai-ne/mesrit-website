// src/pages/admin/documents.js
import React from 'react';
import AccessControl from '@/components/admin/AccessControl';
import StatsAdmin from '@/components/admin/StatsAdmin';
import SideNav from '@/components/admin/SideNav';


export default function AdminStats() {

  return (
    <AccessControl>
      <div className="flex min-h-screen bg-gray-100">
        <SideNav />
        <main className="flex-1">
          <StatsAdmin />
        </main>
      </div>
    </AccessControl>
  );
}