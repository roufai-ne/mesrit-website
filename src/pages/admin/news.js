// src/pages/admin/news.js
import React from 'react';
import AccessControl from '@/components/admin/AccessControl';
import NewsManager from '@/components/admin/NewsManager';
import SideNav from '@/components/admin/SideNav';

export default function AdminNews() {
  return (
    <AccessControl>
      <div className="flex min-h-screen bg-gray-100">
        <SideNav />
        <main className="flex-1">
          <NewsManager />
        </main>
      </div>
    </AccessControl>
  );
}