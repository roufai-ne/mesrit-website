// src/pages/contact/ContactForm.js
import React, { useState } from 'react';
import { Send, Loader, AlertCircle, XCircle } from 'lucide-react';
import { secureApi, useApiAction } from '@/lib/secureApi';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [serverErrors, setServerErrors] = useState([]);
  const { execute, loading } = useApiAction();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }
    if (!formData.subject.trim()) {
      newErrors.subject = 'Le sujet est requis';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Le message est requis';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Le message doit contenir au moins 10 caractères';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Réinitialiser les erreurs serveur
    setServerErrors([]);

    try {
      await execute(async () => {
        // Utiliser secureApi
        const result = await secureApi.post('/api/contact', formData, false);
        
        if (result.success) {
          showNotification('Message envoyé avec succès', 'success');
          setFormData({
            name: '',
            email: '',
            subject: '',
            message: ''
          });
        } else {
          // Gestion des erreurs de validation du serveur
          if (result.validationErrors && Array.isArray(result.validationErrors)) {
            setServerErrors(result.validationErrors);
          } else {
            showNotification(result.error || 'Erreur lors de l\'envoi du message', 'error');
          }
        }
      });
    } catch (error) {
      console.error('Erreur contact:', error);
      
      // Gestion différenciée des erreurs réseau
      if (!navigator.onLine) {
        showNotification('Pas de connexion internet. Veuillez vérifier votre connexion.', 'error');
      } else if (error.message?.includes('timeout')) {
        showNotification('Le serveur met trop de temps à répondre. Veuillez réessayer.', 'error');
      } else {
        showNotification(error.message || 'Une erreur est survenue lors de l\'envoi', 'error');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur correspondante
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Effacer les erreurs serveur lors de la modification
    if (serverErrors.length > 0) {
      setServerErrors([]);
    }
  };

  return (
    <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg border border-niger-orange/10 p-8">
      <div className="flex items-center gap-2 mb-6">
        <Send className="w-6 h-6 text-niger-orange" />
        <h2 className="text-2xl font-bold text-niger-green dark:text-niger-green-light">Envoyez-nous un message</h2>
      </div>
      <p className="text-readable-muted dark:text-muted-foreground mb-8">Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.</p>
      
      {/* Afficher les erreurs serveur en haut du formulaire */}
      {serverErrors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
          <div className="flex items-center text-red-600 dark:text-red-400 font-medium mb-2">
            <AlertCircle className="w-5 h-5 mr-2" />
            Veuillez corriger les erreurs suivantes:
          </div>
          <ul className="list-disc list-inside text-red-600 dark:text-red-400 text-sm space-y-1">
            {serverErrors.map((err, index) => (
              <li key={index}>{err}</li>
            ))}
          </ul>
        </div>
      )}      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-niger-green dark:text-niger-green-light mb-2">
              Nom complet
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`
                w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
                focus:ring-2 focus:ring-niger-orange/20
                ${errors.name 
                  ? 'border-red-200 bg-red-50/50 dark:bg-red-900/20 dark:border-red-800' 
                  : 'border-niger-orange/20 hover:border-niger-orange/40 focus:border-niger-orange bg-white dark:bg-secondary-700 text-readable dark:text-foreground'}
              `}
              placeholder="Nom Prénom"
            />
            {errors.name && (
              <div className="flex items-center mt-1.5 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                <span>{errors.name}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-niger-green dark:text-niger-green-light mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`
                w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
                focus:ring-2 focus:ring-niger-orange/20
                ${errors.email
                  ? 'border-red-200 bg-red-50/50 dark:bg-red-900/20 dark:border-red-800'
                  : 'border-niger-orange/20 hover:border-niger-orange/40 focus:border-niger-orange bg-white dark:bg-secondary-700 text-readable dark:text-foreground'}
              `}
              placeholder="mail@exemple.com"
            />
            {errors.email && (
              <div className="flex items-center mt-1.5 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                <span>{errors.email}</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-niger-green dark:text-niger-green-light mb-2">
            Sujet
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className={`
              w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
              focus:ring-2 focus:ring-niger-orange/20
              ${errors.subject
                ? 'border-red-200 bg-red-50/50 dark:bg-red-900/20 dark:border-red-800'
                : 'border-niger-orange/20 hover:border-niger-orange/40 focus:border-niger-orange bg-white dark:bg-secondary-700 text-readable dark:text-foreground'}
            `}
            placeholder="Le sujet de votre message"
          />
          {errors.subject && (
            <div className="flex items-center mt-1.5 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              <span>{errors.subject}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-niger-green dark:text-niger-green-light mb-2">
            Message
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="6"
            className={`
              w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
              focus:ring-2 focus:ring-niger-orange/20 resize-vertical
              ${errors.message
                ? 'border-red-200 bg-red-50/50 dark:bg-red-900/20 dark:border-red-800'
                : 'border-niger-orange/20 hover:border-niger-orange/40 focus:border-niger-orange bg-white dark:bg-secondary-700 text-readable dark:text-foreground'}
            `}
            placeholder="Écrivez votre message ici..."
          ></textarea>
          {errors.message && (
            <div className="flex items-center mt-1.5 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              <span>{errors.message}</span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="
            w-full px-6 py-3.5 bg-gradient-to-r from-niger-orange to-niger-green
            text-white text-lg font-medium rounded-xl
            hover:from-niger-orange-dark hover:to-niger-green-dark
            focus:ring-4 focus:ring-niger-orange/20
            transform transition-all duration-200
            disabled:opacity-70 disabled:cursor-not-allowed
            flex items-center justify-center shadow-lg hover:shadow-xl
          "
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 mr-3 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-3" />
              Envoyer le message
            </>
          )}
        </button>
      </form>

      {/* Notification */}
      {notification && (
        <div 
          className={`
            fixed bottom-4 right-4 px-6 py-4 rounded-xl shadow-lg
            animate-slide-in-from-top flex items-center justify-between
            ${notification.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'}
            max-w-md
          `}
        >
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <div className="w-2 h-2 rounded-full bg-white mr-3 animate-pulse" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="ml-4 text-white hover:text-white/70"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}