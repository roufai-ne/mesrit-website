import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { usePermission } from '@/hooks/usePermission';
import {
  Newspaper, Building, BarChart2, FileText, Users,
  GitFork, Settings, Home, LogOut, CalendarClock, BarChart4,
  User, Key, Bell, Mail, HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import ChangePasswordModal from '@/components/admin/ChangePasswordModal';

export default function SideNav() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { canManageUsers } = usePermission();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const baseMenuItems = [
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
      id: 'organigramme',
      label: 'Organigramme',
      icon: <GitFork className="w-5 h-5" />,
      path: '/admin/organigramme'
    },
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: <BarChart2 className="w-5 h-5" />,
      path: '/admin/dashboard'
    }
  ];

  const adminOnlyItems = [
    {
      id: 'stat',
      label: 'Statistiques',
      icon: <BarChart4 className="w-5 h-5" />,
      path: '/admin/Statistiques',
      requiresAdmin: true
    },
    {
      id: 'faq',
      label: 'FAQ',
      icon: <HelpCircle className="w-5 h-5" />,
      path: '/admin/faq',
      requiresAdmin: true
    },
    
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      path: '/admin/notifications',
      requiresAdmin: true
    },
    {
      id: 'newsletter',
      label: 'Newsletter',
      icon: <Mail className="w-5 h-5" />,
      path: '/admin/newsletter',
      requiresAdmin: true
    },
    {
      id: 'users',
      label: 'Utilisateurs',
      icon: <Users className="w-5 h-5" />,
      path: '/admin/users',
      requiresAdmin: true
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: <Settings className="w-5 h-5" />,
      path: '/admin/settings',
      requiresAdmin: true
    }

  ];

  // Filtrer les éléments du menu en fonction des permissions
  const menuItems = [
    ...baseMenuItems,
    ...(canManageUsers ? adminOnlyItems : [])
  ];

  return (
    <div className="w-64 min-h-screen bg-blue-900 text-white flex flex-col">
      {/* En-tête avec profil utilisateur */}
      <div className="p-4 border-b border-blue-800">
        <h2 className="text-xl font-bold">Administration</h2>
        <div className="mt-2 flex items-center space-x-2">
          <User className="w-4 h-4" />
          <span className="text-sm">{user?.username}</span>
          <span className="text-xs px-2 py-1 bg-blue-800 rounded-full">
            {user?.role === 'admin' ? 'Administrateur' : 'Éditeur'}
          </span>
        </div>
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

      {/* Boutons de navigation et actions utilisateur */}
      <div className="border-t border-blue-800 p-4 space-y-2">
        <Link 
          href="/"
          className="flex items-center space-x-3 px-4 py-3 hover:bg-blue-800 rounded transition-colors duration-200"
        >
          <Home className="w-5 h-5" />
          <span>Retour au site</span>
        </Link>

        {/* Bouton changement mot de passe */}
        <button 
          onClick={() => setShowPasswordModal(true)}
          className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-blue-800 rounded text-left transition-colors duration-200"
        >
          <Key className="w-5 h-5" />
          <span>Changer le mot de passe</span>
        </button>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-blue-800 rounded text-left transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>

      {/* Modal de changement de mot de passe */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        isFirstLogin={false}
      />

      {/* Modal pour la première connexion */}
      {user?.isFirstLogin && (
        <ChangePasswordModal
          isOpen={true}
          onClose={() => {}} // Ne peut pas être fermé
          isFirstLogin={true}
        />
      )}
    </div>
  );
}