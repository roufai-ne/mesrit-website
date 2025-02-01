// src/pages/contact/ContactForm.js
import React, { useState } from 'react';
import { Send, Loader, AlertCircle } from 'lucide-react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [errors, setErrors] = useState({});


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

    setLoading(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showNotification('Message envoyé avec succès', 'success');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        showNotification('Erreur lors de l\'envoi du message', 'error');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showNotification('Erreur lors de l\'envoi du message', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-8 animate-slide-in-from-top">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Envoyez-nous un message</h2>
      <p className="text-gray-600 mb-8">Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nom complet
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`
                w-full px-4 py-3 bg-white rounded-xl border-2 
                focus:ring-2 focus:ring-blue-100 transition-all duration-200
                ${errors.name 
                  ? 'border-red-200 bg-red-50/50' 
                  : 'border-gray-100 hover:border-gray-200 focus:border-blue-200'}
              `}
              placeholder="Jean Dupont"
            />
            {errors.name && (
              <div className="flex items-center mt-1.5 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                <span>{errors.name}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`
                w-full px-4 py-3 bg-white rounded-xl border-2 
                focus:ring-2 focus:ring-blue-100 transition-all duration-200
                ${errors.email 
                  ? 'border-red-200 bg-red-50/50' 
                  : 'border-gray-100 hover:border-gray-200 focus:border-blue-200'}
              `}
              placeholder="jean@exemple.com"
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
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Sujet
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className={`
              w-full px-4 py-3 bg-white rounded-xl border-2 
              focus:ring-2 focus:ring-blue-100 transition-all duration-200
              ${errors.subject 
                ? 'border-red-200 bg-red-50/50' 
                : 'border-gray-100 hover:border-gray-200 focus:border-blue-200'}
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
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Message
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="6"
            className={`
              w-full px-4 py-3 bg-white rounded-xl border-2 
              focus:ring-2 focus:ring-blue-100 transition-all duration-200
              ${errors.message 
                ? 'border-red-200 bg-red-50/50' 
                : 'border-gray-100 hover:border-gray-200 focus:border-blue-200'}
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
            w-full px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700
            text-white text-lg font-medium rounded-xl
            hover:from-blue-700 hover:to-blue-800
            focus:ring-4 focus:ring-blue-100
            transform transition-all duration-200
            disabled:opacity-70 disabled:cursor-not-allowed
            flex items-center justify-center
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
            animate-slide-in-from-top flex items-center
            ${notification.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'}
          `}
        >
          {notification.type === 'success' ? (
            <div className="w-2 h-2 rounded-full bg-white mr-3 animate-pulse" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-3" />
          )}
          {notification.message}
        </div>
      )}
    </div>
  );
}