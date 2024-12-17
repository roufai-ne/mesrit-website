// src/pages/admin/dashboard.js
import React from 'react';
import AccessControl from '@/components/admin/AccessControl';
import Dashboard from '@/components/admin/Dashboard';
import SideNav from '@/components/admin/SideNav';

export default function AdminDashboard() {
  return (
    <AccessControl>
      <div className="flex min-h-screen bg-gray-100">
        <SideNav />
        <main className="flex-1">
          <Dashboard />
        </main>
      </div>
    </AccessControl>
  );
}