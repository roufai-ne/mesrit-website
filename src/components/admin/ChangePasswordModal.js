// components/admin/ChangePasswordModal.js
// components/admin/ChangePasswordModal.js
import React, { useState } from 'react';
import { X, Lock, EyeOff, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ChangePasswordModal({ isOpen, onClose, isFirstLogin }) {
 const [showPassword, setShowPassword] = useState({
   current: false,
   new: false,
   confirm: false
 });
 const [passwords, setPasswords] = useState({
   currentPassword: '',
   newPassword: '', 
   confirmPassword: ''
 });
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);
 const [successMessage, setSuccessMessage] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (passwords.newPassword.length < 8) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    // Vérifier la complexité du mot de passe
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(passwords.newPassword)) {
      setError('Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        })
      });
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }
  
      if (response.ok) {
        toast.success('Mot de passe modifié avec succès', {
          duration: 3000,
          position: 'top-right',
          style: {
            background: '#10B981',
            color: 'white',
          }
        });
      
        setTimeout(() => {
          if (isFirstLogin) {
            window.location.href = '/admin/dashboard';
          } else {
            onClose();
          }
        }, 1500);
      }
  
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-xl w-full max-w-md relative">
          {!isFirstLogin && (
            <button 
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          
          <div className="p-6">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-blue-100 rounded-full p-3">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
 
            <h2 className="text-xl font-bold text-center mb-2">
              {isFirstLogin ? 'Premier changement de mot de passe' : 'Changer le mot de passe'}
            </h2>
            
            {isFirstLogin && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-sm">
                Pour des raisons de sécurité, vous devez changer votre mot de passe lors de votre première connexion.
              </div>
            )}
 
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isFirstLogin ? 'Mot de passe actuel (Admin@2024)' : 'Mot de passe actuel'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword.current ? "text" : "password"}
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({
                      ...passwords,
                      currentPassword: e.target.value
                    })}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-4 pr-10 text-gray-900 placeholder-gray-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => ({...prev, current: !prev.current}))}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
 
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword.new ? "text" : "password"}
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({
                      ...passwords,
                      newPassword: e.target.value
                    })}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-4 pr-10 text-gray-900 placeholder-gray-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => ({...prev, new: !prev.new}))}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <ul className="mt-2 space-y-1 text-sm text-gray-500">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                    8 caractères minimum
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                    Au moins une majuscule
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                    Au moins une minuscule
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                    Au moins un chiffre
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                    Au moins un caractère spécial (@$!%*?&)
                  </li>
                </ul>
              </div>
 
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({
                      ...passwords,
                      confirmPassword: e.target.value
                    })}
                    placeholder="••••••••" 
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-4 pr-10 text-gray-900 placeholder-gray-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => ({...prev, confirm: !prev.confirm}))}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
 
              {error && (
                <div className="p-4 text-sm bg-red-50 border border-red-200 text-red-600 rounded-lg">
                  {error}
                </div>
              )}
 
              <div className="flex justify-end space-x-4 pt-4">
                {!isFirstLogin && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors"
                    disabled={loading}
                  >
                    Annuler
                  </button>
                )}
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 font-medium transition-colors flex items-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Chargement...
                    </>
                  ) : 'Changer le mot de passe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
 }