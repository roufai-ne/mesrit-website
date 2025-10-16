// src/pages/admin/security.js
import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import SecurityDashboard from '@/components/admin/SecurityDashboard';
import TwoFactorSetup from '@/components/admin/TwoFactorSetup';
import CSPManager from '@/components/admin/CSPManager';
import { Shield, Smartphone, Activity, Key, Code } from 'lucide-react';

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    {
      id: 'dashboard',
      name: 'Dashboard Sécurité',
      icon: Shield,
      component: SecurityDashboard
    },
    {
      id: 'csp',
      name: 'Content Security Policy',
      icon: Code,
      component: CSPManager
    },
    {
      id: '2fa',
      name: 'Authentification 2FA',
      icon: Smartphone,
      component: TwoFactorSetup
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || SecurityDashboard;

  return (
    <AdminLayout 
      title="Sécurité" 
      subtitle="Gestion et monitoring de la sécurité système"
      requiredPermission="canManageSystem"
    >
      <div className="space-y-6">
        {/* Navigation par onglets */}
        <div className="bg-white dark:bg-secondary-800 rounded-xl border border-niger-orange/10 p-1">
          <nav className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-niger-orange to-niger-green text-white shadow-lg'
                      : 'text-readable-muted dark:text-muted-foreground hover:bg-niger-cream/50 dark:hover:bg-secondary-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenu de l'onglet actif */}
        <div className="min-h-[600px]">
          <ActiveComponent />
        </div>
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps() {
  return {
    props: {}
  };
}