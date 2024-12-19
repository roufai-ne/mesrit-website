// src/components/admin/SideNav.js
import React from 'react';
import { useRouter } from 'next/router';
import {Newspaper, Building, BarChart2, FileText, Image, Users, GitFork, Settings, Home, LogOut, CalendarClock, BarChart4 } from 'lucide-react';
import Link from 'next/link';

export default function SideNav() {
  const router = useRouter();

  const handleLogout = () => {
    // Supprimer le token
    localStorage.removeItem('token');
    // Rediriger vers la page de login
    router.push('/login');
  };

  const menuItems = [
    {
      id: 'news',
      label: 'Actualités',
      icon: <Newspaper className="w-5 h-5" />,
      path: '/admin/news'
    },
    {
      id: 'Communications',
      label: 'Communications',
      icon: <CalendarClock className="w-5 h-5" />,
      path: '/admin/communications'
    },
    {
      id: 'ministere',
      label: 'Page Ministère',
      icon: <Building className="w-5 h-5" />,
      path: '/admin/ministere'
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: <FileText className="w-5 h-5" />,
      path: '/admin/documents'
    },
    {
      id: 'directors',
      label: 'Responsables',
      icon: <Users className="w-5 h-5" />,
      path: '/admin/directors'
    },
    { 
      id: 'stat', 
      label: 'Statistiques', 
      icon: <BarChart4 className="w-5 h-5" />,
      path: '/admin/Statistiques'
    },
    
    { 
      id: 'dashboard', 
      label: 'Tableau de bord', 
      icon: <BarChart2 className="w-5 h-5" />,
      path: '/admin/dashboard'
    },
     { 
      id: 'organigramme', 
      label: 'Organigramme', 
      icon: <GitFork className="w-5 h-5" />,
      path: '/admin/organigramme'
    },
    { 
      id: 'users', 
      label: 'Utilisateurs', 
      icon: <Users className="w-5 h-5" />,
      path: '/admin/users'
    },
    { 
      id: 'settings', 
      label: 'Paramètres', 
      icon: <Settings className="w-5 h-5" />,
      path: '/admin/settings'
    }
  ];

  return (
    <div className="w-64 min-h-screen bg-blue-900 text-white flex flex-col">
      <div className="p-4">
        <h2 className="text-xl font-bold">Administration</h2>
      </div>
      
      <nav className="flex-1 mt-4">
        {menuItems.map(item => (
          <Link 
            href={item.path} 
            key={item.id}
            className={`flex items-center space-x-3 px-4 py-3 
              ${router.pathname === item.path ? 'bg-blue-800' : 'hover:bg-blue-800'}
              transition-colors duration-200`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Boutons accueil et déconnexion */}
      <div className="border-t border-blue-800 p-4 space-y-2">
        <Link 
          href="/"
          className="flex items-center space-x-3 px-4 py-3 hover:bg-blue-800 rounded transition-colors duration-200"
        >
          <Home className="w-5 h-5" />
          <span>Retour au site</span>
        </Link>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-blue-800 rounded text-left transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
}