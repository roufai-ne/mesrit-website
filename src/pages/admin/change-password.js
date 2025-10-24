// src/pages/admin/news.js
import React from 'react';
import AccessControl from '@/components/admin/AccessControl';
import ChangePasswordModal from '@/components/admin/ChangePasswordModal';
import SideNav from '@/components/admin/SideNav';

export default function ChangePassword() {
  return (
    <AccessControl>
      <div className="flex min-h-screen bg-gray-100 dark:bg-secondary-700">
        <SideNav />
        <main className="flex-1">
          <ChangePasswordModal />
        </main>
      </div>
    </AccessControl>
  );
}

// Forcer SSR pour éviter les erreurs durant le SSG
export async function getServerSideProps() {
  return {
    props: {}
  };
}
