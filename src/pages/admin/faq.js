import React from 'react';
import AccessControl from '@/components/admin/AccessControl';
import SideNav from '@/components/admin/SideNav';
import FAQManager from '@/components/admin/FAQManager';

export default function FAQPage() {
  return (
    <AccessControl>
      <div className="flex min-h-screen bg-gray-100 dark:bg-secondary-700">
        <SideNav />
        <main className="flex-1">
          <FAQManager />
        </main>
      </div>
    </AccessControl>
  );
}