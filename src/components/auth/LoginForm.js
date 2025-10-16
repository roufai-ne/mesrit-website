/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/auth/LoginForm.js
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { User, Lock, ArrowLeft, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiCall, AppError, ERROR_TYPES } from '@/lib/errorHandler';
import { useToast } from '@/components/ui/toast';

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    
    if (!credentials.username.trim()) {
      errors.username = 'Le nom d\'utilisateur est obligatoire';
    }
    
    if (!credentials.password) {
      errors.password = 'Le mot de passe est obligatoire';
    } else if (credentials.password.length < 3) {
      errors.password = 'Le mot de passe doit contenir au moins 3 caractères';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setValidationErrors({});

    // Validation côté client
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      await login(credentials);
      setSuccess('Connexion réussie ! Redirection en cours...');
      // Redirection après un court délai pour montrer le message de succès
      setTimeout(() => {
        router.push('/admin/Dashboard');
      }, 1000);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      let toastMsg = '';
      if (error instanceof AppError) {
        switch (error.type) {
          case ERROR_TYPES.AUTHENTICATION:
            toastMsg = error.message;
            break;
          case ERROR_TYPES.VALIDATION:
            toastMsg = 'Veuillez vérifier vos informations de connexion';
            break;
          case ERROR_TYPES.NETWORK:
            toastMsg = 'Problème de connexion. Vérifiez votre connexion internet.';
            break;
          default:
            toastMsg = 'Une erreur inattendue s\'est produite. Veuillez réessayer.';
        }
      } else {
        toastMsg = error.message || 'Nom d\'utilisateur ou mot de passe incorrect';
      }
      toast.error(toastMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 to-blue-800">
      {/* Bouton retour */}
      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center text-white hover:text-blue-200 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Retour à l&apos;accueil
      </Link>

      {/* Logo ou titre */}
      <div className="text-center mt-12 text-white">
        <h1 className="text-3xl font-bold">MESRIT</h1>
        <p className="text-blue-200">Portail d&apos;administration</p>
      </div>

      {/* Formulaire */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 transform transition-all duration-200 hover:shadow-2xl">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Administration</h2>
              <p className="mt-2 text-gray-600">Connectez-vous à votre compte</p>
            </div>

            {/* Les erreurs sont maintenant affichées via toast, plus de message inline */}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 p-4 rounded-lg flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom d&apos;utilisateur
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    autoComplete="username"
                    required
                    className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      validationErrors.username 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                    value={credentials.username}
                    onChange={(e) => {
                      setCredentials({
                        ...credentials,
                        username: e.target.value
                      });
                      // Effacer l'erreur de validation quand l'utilisateur tape
                      if (validationErrors.username) {
                        setValidationErrors(prev => ({
                          ...prev,
                          username: undefined
                        }));
                      }
                    }}
                    placeholder="Entrez votre nom d'utilisateur"
                  />
                </div>
                {validationErrors.username && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.username}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    autoComplete="current-password"
                    required
                    className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      validationErrors.password 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                    value={credentials.password}
                    onChange={(e) => {
                      setCredentials({
                        ...credentials,
                        password: e.target.value
                      });
                      // Effacer l'erreur de validation quand l'utilisateur tape
                      if (validationErrors.password) {
                        setValidationErrors(prev => ({
                          ...prev,
                          password: undefined
                        }));
                      }
                    }}
                    placeholder="Entrez votre mot de passe"
                  />
                </div>
                {validationErrors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all transform active:scale-95 flex items-center justify-center disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-white/60 text-sm">
        © {new Date().getFullYear()} MESRIT. Tous droits réservés.
      </div>
    </div>
  );
}