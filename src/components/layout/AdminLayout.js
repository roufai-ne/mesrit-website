// src/components/layout/AdminLayout.js
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { usePermission } from '@/hooks/usePermission';
import SideNav from '@/components/admin/SideNav';
import PermissionGuard, { RoleIndicator } from '@/components/admin/PermissionGuard';

import { 
  Menu, 
  X, 
  Bell, 
  Settings, 
  User, 
  Moon, 
  Sun,
  Shield,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function AdminLayout({ 
  children, 
  title = "Administration", 
  subtitle = "",
  requiredPermission = null,
  requiredPermissions = [],
  requireAll = false,
  showRoleIndicator = false 
}) {
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const permissions = usePermission();
  const { isDark, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirection si pas d'utilisateur (seulement après que le loading soit terminé)
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // Fermer la sidebar sur changement de route
  useEffect(() => {
    setSidebarOpen(false);
  }, [router.pathname]);



  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-niger-orange via-niger-orange-dark to-niger-green">
        <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-niger-orange border-t-transparent mx-auto mb-4"></div>
          <p className="text-niger-green dark:text-niger-green-light font-medium">
            Vérification de l'authentification...
          </p>
        </div>
      </div>
    );
  }

  // Show loading state if user is not authenticated (will redirect)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-niger-orange via-niger-orange-dark to-niger-green">
        <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-niger-orange border-t-transparent mx-auto mb-4"></div>
          <p className="text-niger-green dark:text-niger-green-light font-medium">
            Redirection vers la connexion...
          </p>
        </div>
      </div>
    );
  }

  const content = (
    <div className="flex min-h-screen bg-gradient-to-br from-niger-cream to-white dark:from-secondary-900 dark:to-secondary-800 transition-colors duration-300">
      {/* Sidebar Desktop */}
      <div className="hidden lg:block">
        <SideNav />
      </div>

      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full">
            <SideNav />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white dark:bg-secondary-800 shadow-lg border-b border-niger-orange/10 transition-colors duration-300">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left Section */}
              <div className="flex items-center space-x-4">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-xl bg-niger-orange/10 hover:bg-niger-orange/20 transition-colors"
                >
                  <Menu className="w-6 h-6 text-niger-orange" />
                </button>

                {/* Page Title */}
                <div>
                  <h1 className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-readable-muted dark:text-muted-foreground text-sm mt-1">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center space-x-4">
                {/* Role Indicator */}
                {showRoleIndicator && (
                  <div className="hidden md:flex items-center space-x-2 bg-niger-cream dark:bg-secondary-700 rounded-xl px-3 py-2 border border-niger-orange/20">
                    <Shield className={`w-4 h-4 ${
                      permissions.isAdmin ? 'text-niger-orange' : 'text-niger-green'
                    }`} />
                    <span className="text-sm font-medium text-niger-green dark:text-niger-green-light">
                      {permissions.isAdmin ? 'Admin' : 'Éditeur'}
                    </span>
                  </div>
                )}

                {/* Notifications */}
                {permissions.canManageNotifications && (
                  <div className="relative">
                    <button className="p-2 rounded-xl bg-niger-orange/10 hover:bg-niger-orange/20 transition-colors relative">
                      <Bell className="w-5 h-5 text-niger-orange" />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        2
                      </span>
                    </button>
                  </div>
                )}

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-xl bg-niger-orange/10 hover:bg-niger-orange/20 transition-colors"
                >
                  {isDark ? (
                    <Sun className="w-5 h-5 text-niger-orange" />
                  ) : (
                    <Moon className="w-5 h-5 text-niger-orange" />
                  )}
                </button>

                {/* Settings */}
                {permissions.canManageSettings && (
                  <button
                    onClick={() => router.push('/admin/settings')}
                    className="p-2 rounded-xl bg-niger-orange/10 hover:bg-niger-orange/20 transition-colors"
                  >
                    <Settings className="w-5 h-5 text-niger-orange" />
                  </button>
                )}

                {/* User Menu */}
                <div className="flex items-center space-x-2 bg-niger-cream dark:bg-secondary-700 rounded-xl px-3 py-2 border border-niger-orange/20">
                  <div className="w-8 h-8 bg-niger-orange rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-niger-green dark:text-niger-green-light hidden sm:block">
                    {user.username}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Role Indicator Mobile */}
          {showRoleIndicator && (
            <div className="md:hidden mb-6">
              <RoleIndicator showPermissions={false} />
            </div>
          )}

          {/* Content */}
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-secondary-800 border-t border-niger-orange/10 px-6 py-4 transition-colors duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-readable-muted dark:text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span>© 2024 MESRIT Niger</span>
              <span>•</span>
              <span>Administration</span>
              {permissions.canViewLogs && (
                <>
                  <span>•</span>
                  <button 
                    onClick={() => router.push('/admin/logs')}
                    className="flex items-center space-x-1 hover:text-niger-orange transition-colors"
                  >
                    <Activity className="w-4 h-4" />
                    <span>Logs système</span>
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center space-x-2 mt-2 sm:mt-0">
              <span>Connecté en tant que</span>
              <span className="font-medium text-niger-green dark:text-niger-green-light">
                {user.username}
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );

  // Si des permissions sont requises, les vérifier
  if (requiredPermission || requiredPermissions.length > 0) {
    return (
      <PermissionGuard
        permission={requiredPermission}
        permissions={requiredPermissions}
        requireAll={requireAll}
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-niger-orange via-niger-orange-dark to-niger-green">
            <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-2xl p-8 text-center max-w-md">
              <div className="p-4 bg-red-100 dark:bg-red-900/40 rounded-full w-fit mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-niger-green dark:text-niger-green-light mb-2">
                Accès restreint
              </h2>
              <p className="text-readable-muted dark:text-muted-foreground mb-6">
                Vous n'avez pas les permissions nécessaires pour accéder à cette page.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/admin/Dashboard')}
                  className="w-full px-4 py-2 bg-gradient-to-r from-niger-orange to-niger-green text-white rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  Retour au tableau de bord
                </button>
                <button
                  onClick={logout}
                  className="w-full px-4 py-2 border border-niger-orange/20 text-niger-orange rounded-xl hover:bg-niger-orange/10 transition-all duration-300"
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        }
      >
        {content}
      </PermissionGuard>
    );
  }

  return content;
}