// src/pages/admin/establishments.js
import React from 'react';
import AccessControl from '@/components/admin/AccessControl';
import EstablishmentManager from '@/components/admin/EstablishmentManager';
import SideNav from '@/components/admin/SideNav';

export default function AdminEstablishments() {
  return (
    <AccessControl>
      <div className="flex min-h-screen bg-gray-100">
        <SideNav />
        <main className="flex-1">
          <EstablishmentManager />
        </main>
      </div>
    </AccessControl>
  );
}