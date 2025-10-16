import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import dynamic from 'next/dynamic';

const ChangePasswordModal = dynamic(() => import('@/components/admin/ChangePasswordModal'), { ssr: false });
const TwoFactorSetup = dynamic(() => import('@/components/admin/TwoFactorSetup'), { ssr: false });

export default function ProfilePage() {
  const { user, sessionInfo } = useAuth();
  const router = require('next/router').useRouter();
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [show2FAForm, setShow2FAForm] = React.useState(false);

  if (!user) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Profil utilisateur</h2>
        <p>Vous devez être connecté pour voir votre profil.</p>
        <button
          className="mt-6 px-4 py-2 bg-niger-orange text-white rounded-lg hover:bg-niger-green transition-all"
          onClick={() => router.back()}
        >
          Retour
        </button>
      </div>
    );
  }



  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-3xl font-extrabold mb-8 text-niger-green dark:text-niger-green-light text-center tracking-tight">Mon Profil</h2>
      <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-xl p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="text-xs text-gray-400 uppercase tracking-widest">Nom d'utilisateur</div>
          <div className="text-xl font-bold text-niger-green dark:text-niger-green-light break-all">{user.username || <span className='text-gray-400'>Non défini</span>}</div>
        </div>
        <div className="space-y-2">
          <div className="text-xs text-gray-400 uppercase tracking-widest">Email</div>
          <div className="text-xl font-bold break-all">{user.email || <span className='text-gray-400'>Non défini</span>}</div>
        </div>
        <div className="space-y-2">
          <div className="text-xs text-gray-400 uppercase tracking-widest">Rôle</div>
          <div className="inline-block px-3 py-1 rounded-full bg-niger-orange/10 text-niger-orange font-semibold capitalize">{user.role || <span className='text-gray-400'>Non défini</span>}</div>
        </div>
        <div className="space-y-2">
          <div className="text-xs text-gray-400 uppercase tracking-widest">Statut</div>
          <div className={`inline-block px-3 py-1 rounded-full font-semibold capitalize ${user.status === 'active' ? 'bg-green-100 text-green-800' : user.status === 'inactive' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-400'}`}>{user.status || <span className='text-gray-400'>Non défini</span>}</div>
        </div>
        <div className="space-y-2">
          <div className="text-xs text-gray-400 uppercase tracking-widest">Première connexion</div>
          <div className="text-base font-medium">{typeof user.isFirstLogin !== 'undefined' ? (user.isFirstLogin ? <span className="text-yellow-600">Oui</span> : <span className="text-green-700">Non</span>) : <span className='text-gray-400'>Non défini</span>}</div>
        </div>
        <div className="space-y-2">
          <div className="text-xs text-gray-400 uppercase tracking-widest">Dernière connexion</div>
          <div className="text-base font-medium">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : <span className='text-gray-400'>Non défini</span>}</div>
        </div>
        <div className="space-y-2">
          <div className="text-xs text-gray-400 uppercase tracking-widest">Nombre de connexions</div>
          <div className="text-base font-medium">{typeof user.loginCount !== 'undefined' ? user.loginCount : <span className='text-gray-400'>Non défini</span>}</div>
        </div>
        <div className="space-y-2">
          <div className="text-xs text-gray-400 uppercase tracking-widest">Créé le</div>
          <div className="text-base font-medium">{user.createdAt ? new Date(user.createdAt).toLocaleString() : <span className='text-gray-400'>Non défini</span>}</div>
        </div>
        <div className="space-y-2">
          <div className="text-xs text-gray-400 uppercase tracking-widest">Dernière modification</div>
          <div className="text-base font-medium">{user.updatedAt ? new Date(user.updatedAt).toLocaleString() : <span className='text-gray-400'>Non défini</span>}</div>
        </div>
        <div className="space-y-2 md:col-span-2">
          <div className="text-xs text-gray-400 uppercase tracking-widest">Dernière activité</div>
          <div className="text-base font-medium">{sessionInfo && sessionInfo.lastActivity ? new Date(sessionInfo.lastActivity).toLocaleString() : <span className='text-gray-400'>Non défini</span>}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row gap-4 mt-8">
        <button
          className="px-4 py-2 bg-niger-orange text-white rounded-lg hover:bg-niger-green transition-all"
          onClick={() => setShowPasswordModal(true)}
        >
          Changer le mot de passe
        </button>
        <button
          className="px-4 py-2 bg-niger-green text-white rounded-lg hover:bg-niger-orange transition-all"
          onClick={() => setShow2FAForm(true)}
        >
          Gérer le 2FA
        </button>
        <button
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
          onClick={() => router.back()}
        >
          Retour
        </button>
      </div>

      {/* Modals */}
      {showPasswordModal && (
        <ChangePasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} isFirstLogin={user.isFirstLogin} />
      )}
      {show2FAForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6 max-w-2xl w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-niger-orange" onClick={() => setShow2FAForm(false)}>
              <span className="text-2xl">×</span>
            </button>
            <TwoFactorSetup />
          </div>
        </div>
      )}

      {/* Les formulaires inline sont remplacés par les composants dédiés */}
    </div>
  );
}
