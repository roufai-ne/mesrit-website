// src/pages/admin/content/index.js
import React from 'react';
import { Plus, Edit, Trash } from 'lucide-react';
import AccessControl from '@/components/admin/AccessControl';
import SideNav from '@/components/admin/SideNav';

export default function AdminContent() {
  const contentItems = [
    { id: 1, title: 'Communiqué ministériel', type: 'communique', date: '2024-12-10', status: 'published' },
    { id: 2, title: 'À propos du ministère', type: 'page', date: '2024-12-09', status: 'draft' }
  ];

  return (
    <AccessControl>
      <div className="flex min-h-screen bg-gray-100 dark:bg-secondary-700">
        <SideNav />
        <main className="flex-1">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-niger-green dark:text-niger-green-light">Gestion du contenu</h1>
              <button className="bg-blue-600 text-white px-4 py-2 rounded flex items-center bg-gradient-to-r from-niger-orange to-niger-green">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau contenu
              </button>
            </div>

            <div className="bg-white rounded-lg shadow dark:bg-secondary-800">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Titre</th>
                    <th className="text-left p-4">Type</th>
                    <th className="text-left p-4">Date</th>
                    <th className="text-left p-4">Statut</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contentItems.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50 dark:bg-secondary-700 dark:hover:bg-secondary-700/50">
                      <td className="p-4">{item.title}</td>
                      <td className="p-4">{item.type}</td>
                      <td className="p-4">{item.date}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-sm ${
                          item.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <button className="p-1 hover:text-blue-600 text-niger-orange dark:text-niger-orange">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 hover:text-red-600">
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
