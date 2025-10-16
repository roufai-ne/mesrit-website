import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { usePermission } from '@/hooks/usePermission';
import {
  Newspaper, Building, BarChart2, FileText, Users,
  GitFork, Settings, Home, LogOut, CalendarClock, BarChart4,
  User, Key, Bell, Mail, HelpCircle, Shield, Eye, EyeOff,
  Database, Activity, Wrench
} from 'lucide-react';
import Link from 'next/link';
import ChangePasswordModal from '@/components/admin/ChangePasswordModal';

export default function SideNav() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const permissions = usePermission();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Définition des sections du menu avec permissions
  const menuSections = [
    {
      title: 'Tableau de bord',
      items: [
        {
          id: 'dashboard',
          label: 'Vue d\'ensemble',
          icon: <BarChart2 className="w-5 h-5" />,
          path: '/admin/Dashboard',
          permission: 'canAccessDashboard'
        }
      ]
    },
    {
      title: 'Gestion du contenu',
      items: [
        {
          id: 'news',
          label: 'Actualités',
          icon: <Newspaper className="w-5 h-5" />,
          path: '/admin/news',
          permission: 'canCreateContent'
        },
        {
          id: 'documents',
          label: 'Documents',
          icon: <FileText className="w-5 h-5" />,
          path: '/admin/documents',
          permission: 'canManageDocuments'
        },
        {
          id: 'communications',
          label: 'Communications',
          icon: <CalendarClock className="w-5 h-5" />,
          path: '/admin/communications',
          permission: 'canManageCommunications',
          viewPermission: 'canViewCommunications'
        }
      ]
    },
    {
      title: 'Gestion des entités',
      items: [
        {
          id: 'establishments',
          label: 'Établissements',
          icon: <Building className="w-5 h-5" />,
          path: '/admin/establishments',
          permission: 'canManageEstablishments',
          viewPermission: 'canViewEstablishments'
        },
        {
          id: 'services',
          label: 'Services',
          icon: <Wrench className="w-5 h-5" />,
          path: '/admin/services',
          permission: 'canManageServices',
          viewPermission: 'canViewServices'
        },
        {
          id: 'directors',
          label: 'Responsables',
          icon: <Users className="w-5 h-5" />,
          path: '/admin/directors',
          permission: 'canManageDirectors',
          viewPermission: 'canViewDirectors'
        }
      ]
    },
    {
      title: 'Communication',
      items: [
        {
          id: 'notifications',
          label: 'Notifications',
          icon: <Bell className="w-5 h-5" />,
          path: '/admin/notifications',
          permission: 'canManageNotifications'
        },
        {
          id: 'newsletter',
          label: 'Newsletter',
          icon: <Mail className="w-5 h-5" />,
          path: '/admin/newsletter',
          permission: 'canManageNewsletter',
          subItems: [
            {
              id: 'newsletter-manage',
              label: 'Gestion',
              path: '/admin/newsletter',
              permission: 'canManageNewsletter'
            },
            {
              id: 'newsletter-config',
              label: 'Configuration Auto',
              path: '/admin/newsletter/config',
              permission: 'canManageNewsletter'
            }
          ]
        },
        {
          id: 'faq',
          label: 'FAQ',
          icon: <HelpCircle className="w-5 h-5" />,
          path: '/admin/faq',
          permission: 'canManageFAQ',
          viewPermission: 'canViewFAQ'
        }
      ]
    },
    {
      title: 'Statistiques',
      items: [
        {
          id: 'stats',
          label: 'Statistiques avancées',
          icon: <BarChart4 className="w-5 h-5" />,
          path: '/admin/Statistiques',
          permission: 'canAccessAdvancedStats'
        }
      ]
    },
    {
      title: 'Administration système',
      items: [
        {
          id: 'users',
          label: 'Utilisateurs',
          icon: <Users className="w-5 h-5" />,
          path: '/admin/users',
          permission: 'canManageUsers'
        },
        {
          id: 'settings',
          label: 'Paramètres',
          icon: <Settings className="w-5 h-5" />,
          path: '/admin/settings',
          permission: 'canManageSettings'
        },
        {
          id: 'security',
          label: 'Sécurité',
          icon: <Shield className="w-5 h-5" />,
          path: '/admin/security',
          permission: 'canManageSystem'
        },
        {
          id: 'logs',
          label: 'Journaux système',
          icon: <Activity className="w-5 h-5" />,
          path: '/admin/logs',
          permission: 'canViewLogs'
        }
      ]
    }
  ];

  // Filtrer les éléments du menu en fonction des permissions
  const getVisibleMenuItems = () => {
    return menuSections.map(section => ({
      ...section,
      items: section.items.filter(item => {
        // Si l'item a une permission spécifique, la vérifier
        if (item.permission) {
          // Si l'utilisateur a la permission de gestion, l'autoriser
          if (permissions[item.permission]) {
            return true;
          }
          // Sinon, vérifier s'il a au moins la permission de vue
          if (item.viewPermission && permissions[item.viewPermission]) {
            return true;
          }
          return false;
        }
        // Si l'item a seulement une permission de vue, la vérifier
        if (item.viewPermission) {
          return permissions[item.viewPermission] || false;
        }
        // Par défaut, afficher l'item
        return true;
      })
    })).filter(section => section.items.length > 0); // Supprimer les sections vides
  };

  const visibleMenuSections = getVisibleMenuItems();

  return (
    <div className="w-72 min-h-screen bg-gradient-to-b from-niger-green via-niger-green-dark to-niger-orange text-white flex flex-col shadow-2xl">
      {/* En-tête avec profil utilisateur */}
      <div className="p-6 border-b border-niger-white/20 bg-niger-white/10 backdrop-blur-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-niger-orange rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-niger-green dark:text-niger-green-light">Administration</h2>
            <p className="text-niger-cream/80 text-sm">MESRIT Niger</p>
          </div>
        </div>
        
        <div className="bg-niger-white/10 backdrop-blur-sm rounded-xl p-4 border border-niger-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-niger-orange/20 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-niger-cream" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-niger-cream">{user?.username}</p>
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  permissions.isSuperAdmin ? 'bg-niger-orange text-white' : 
                  permissions.isSystemAdmin ? 'bg-niger-orange/80 text-white' : 
                  permissions.isContentAdmin ? 'bg-niger-green-light text-niger-green-dark' : 'bg-niger-green-light text-niger-green-dark'
                }`}>
                  {permissions.isSuperAdmin ? 'Super Admin' : permissions.isSystemAdmin ? 'Admin Système' : permissions.isContentAdmin ? 'Admin Contenu' : 'Éditeur'}
                </span>
                {(permissions.isSuperAdmin || permissions.isSystemAdmin) && (
                  <Shield className="w-3 h-3 text-niger-orange" title="Accès administrateur complet" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation par sections */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {visibleMenuSections.map((section, sectionIndex) => (
          <div key={section.title} className="mb-6">
            <h3 className="px-6 py-2 text-xs font-semibold text-niger-cream/60 uppercase tracking-wider">
              {section.title}
            </h3>
            <div className="space-y-1 px-3">
              {section.items.map(item => {
                const isActive = router.pathname === item.path;
                const hasFullPermission = !item.permission || permissions[item.permission] || false;
                const hasViewPermission = item.viewPermission && (permissions[item.viewPermission] || false);
                const isReadOnly = !hasFullPermission && hasViewPermission;
                
                return (
                  <Link 
                    href={item.path} 
                    key={item.id}
                    className={`flex items-center space-x-3 px-3 py-3 mx-2 rounded-xl transition-all duration-200 group ${
                      isActive 
                        ? 'bg-niger-white/20 backdrop-blur-sm border border-niger-white/30 shadow-lg' 
                        : 'hover:bg-niger-white/10 hover:backdrop-blur-sm'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-niger-orange text-white shadow-md' 
                        : 'bg-niger-white/10 text-niger-cream group-hover:bg-niger-orange/20'
                    }`}>
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <span className={`font-medium ${
                        isActive ? 'text-white' : 'text-niger-cream'
                      }`}>
                        {item.label}
                      </span>
                      {isReadOnly && (
                        <div className="flex items-center space-x-1 mt-1">
                          <Eye className="w-3 h-3 text-niger-cream/60" />
                          <span className="text-xs text-niger-cream/60">Lecture seule</span>
                        </div>
                      )}
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 bg-niger-orange rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Actions utilisateur */}
      <div className="border-t border-niger-white/20 p-4 space-y-2 bg-niger-white/5 backdrop-blur-sm">
        <Link 
          href="/"
          className="flex items-center space-x-3 px-4 py-3 hover:bg-niger-white/10 rounded-xl transition-all duration-200 group"
        >
          <div className="p-2 rounded-lg bg-niger-white/10 group-hover:bg-niger-orange/20 transition-all duration-200">
            <Home className="w-4 h-4" />
          </div>
          <span className="font-medium">Retour au site</span>
        </Link>

        {/* Bouton changement mot de passe */}
        <button 
          onClick={() => setShowPasswordModal(true)}
          className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-niger-white/10 rounded-xl text-left transition-all duration-200 group"
        >
          <div className="p-2 rounded-lg bg-niger-white/10 group-hover:bg-niger-orange/20 transition-all duration-200">
            <Key className="w-4 h-4" />
          </div>
          <span className="font-medium">Changer le mot de passe</span>
        </button>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-500/20 rounded-xl text-left transition-all duration-200 group border border-red-500/20"
        >
          <div className="p-2 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-all duration-200">
            <LogOut className="w-4 h-4 text-red-400" />
          </div>
          <span className="font-medium text-red-400">Déconnexion</span>
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