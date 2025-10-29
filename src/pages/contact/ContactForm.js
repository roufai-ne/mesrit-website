// src/pages/contact/ContactForm.js
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, AlertCircle, XCircle, CheckCircle } from 'lucide-react';
import { secureApi, useApiAction } from '@/lib/secureApi';
import Turnstile from 'react-turnstile';
import { validators } from '@/lib/validation';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    subject: false,
    message: false
  });

  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isEmailValid, setIsEmailValid] = useState(false);
  const [token, setToken] = useState(null);
  const [notification, setNotification] = useState(null);
  const [serverErrors, setServerErrors] = useState([]);
  const { execute, loading } = useApiAction();
  const turnstileRef = useRef(null);

  // Validation en temps réel de l'email
  useEffect(() => {
    if (!formData.email) {
      setIsEmailValid(false);
      setFieldErrors(prev => ({ ...prev, email: '' }));
      // Réinitialiser le captcha si l'email est vidé
      if (token) {
        setToken(null);
        if (turnstileRef.current) {
          turnstileRef.current.reset();
        }
      }
      return;
    }

    try {
      validators.email(formData.email);
      setIsEmailValid(true);
      setFieldErrors(prev => ({ ...prev, email: '' }));
    } catch (error) {
      setIsEmailValid(false);
      setFieldErrors(prev => ({ ...prev, email: error.message }));
      // Réinitialiser le captcha si l'email devient invalide
      if (token) {
        setToken(null);
        if (turnstileRef.current) {
          turnstileRef.current.reset();
        }
      }
    }
  }, [formData.email, token]);

  // Validation en temps réel des autres champs
  useEffect(() => {
    const newErrors = { ...fieldErrors };

    // Nom
    if (touched.name && formData.name) {
      if (!formData.name.trim()) {
        newErrors.name = 'Le nom est requis';
      } else {
        newErrors.name = '';
      }
    }

    // Sujet
    if (touched.subject && formData.subject) {
      if (!formData.subject.trim()) {
        newErrors.subject = 'Le sujet est requis';
      } else {
        newErrors.subject = '';
      }
    }

    // Message
    if (touched.message && formData.message) {
      if (!formData.message.trim()) {
        newErrors.message = 'Le message est requis';
      } else if (formData.message.trim().length < 10) {
        newErrors.message = 'Le message doit contenir au moins 10 caractères';
      } else {
        newErrors.message = '';
      }
    }

    setFieldErrors(newErrors);
  }, [formData.name, formData.subject, formData.message, touched]);

  const onVerify = (verificationToken) => {
    setToken(verificationToken);
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!isEmailValid) {
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

    setFieldErrors(newErrors);
    setTouched({ name: true, email: true, subject: true, message: true });

    return Object.keys(newErrors).every(key => !newErrors[key]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showNotification('Veuillez corriger les erreurs dans le formulaire', 'error');
      return;
    }

    if (!token) {
      showNotification('Veuillez compléter la vérification de sécurité', 'error');
      return;
    }

    // Réinitialiser les erreurs serveur
    setServerErrors([]);

    try {
      await execute(async () => {
        // Utiliser secureApi
        const result = await secureApi.post('/api/contact', {
          ...formData,
          turnstileToken: token
        }, false);

        if (result.success) {
          showNotification('Message envoyé avec succès', 'success');
          setFormData({
            name: '',
            email: '',
            subject: '',
            message: ''
          });
          setTouched({
            name: false,
            email: false,
            subject: false,
            message: false
          });
          setToken(null);
          setIsEmailValid(false);
          if (turnstileRef.current) {
            turnstileRef.current.reset();
          }
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

    // Effacer les erreurs serveur lors de la modification
    if (serverErrors.length > 0) {
      setServerErrors([]);
    }
  };

  const handleBlur = (fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
  };

  // Vérifier si tous les champs sont valides
  const isFormValid =
    formData.name.trim() &&
    isEmailValid &&
    formData.subject.trim() &&
    formData.message.trim().length >= 10 &&
    !fieldErrors.name &&
    !fieldErrors.email &&
    !fieldErrors.subject &&
    !fieldErrors.message;

  // Désactiver le bouton si le formulaire n'est pas valide ou si le captcha n'est pas vérifié
  const isSubmitDisabled = !isFormValid || !token || loading;

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
              Nom complet <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={() => handleBlur('name')}
                className={`
                  w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all duration-200
                  focus:ring-2 focus:ring-niger-orange/20
                  ${!touched.name || !formData.name
                    ? 'border-niger-orange/20 hover:border-niger-orange/40 focus:border-niger-orange bg-white dark:bg-secondary-700 text-readable dark:text-foreground'
                    : fieldErrors.name
                    ? 'border-red-500 bg-red-50/50 dark:bg-red-900/20 focus:border-red-500'
                    : 'border-green-500 bg-green-50/50 dark:bg-green-900/20 focus:border-green-500'
                  }
                `}
                placeholder="Nom Prénom"
              />
              {/* Icône de validation */}
              {touched.name && formData.name && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {!fieldErrors.name ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {touched.name && fieldErrors.name && (
              <div className="flex items-center mt-1.5 text-red-500 text-sm">
                <XCircle className="w-4 h-4 mr-1" />
                <span>{fieldErrors.name}</span>
              </div>
            )}
            {touched.name && formData.name && !fieldErrors.name && (
              <div className="flex items-center mt-1.5 text-green-600 text-sm">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span>Nom valide</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-niger-green dark:text-niger-green-light mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                className={`
                  w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all duration-200
                  focus:ring-2 focus:ring-niger-orange/20
                  ${!touched.email || !formData.email
                    ? 'border-niger-orange/20 hover:border-niger-orange/40 focus:border-niger-orange bg-white dark:bg-secondary-700 text-readable dark:text-foreground'
                    : isEmailValid
                    ? 'border-green-500 bg-green-50/50 dark:bg-green-900/20 focus:border-green-500'
                    : 'border-red-500 bg-red-50/50 dark:bg-red-900/20 focus:border-red-500'
                  }
                `}
                placeholder="mail@exemple.com"
              />
              {/* Icône de validation */}
              {touched.email && formData.email && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {isEmailValid ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {touched.email && !isEmailValid && formData.email && (
              <div className="flex items-center mt-1.5 text-red-500 text-sm">
                <XCircle className="w-4 h-4 mr-1" />
                <span>{fieldErrors.email || 'Email invalide'}</span>
              </div>
            )}
            {touched.email && isEmailValid && (
              <div className="flex items-center mt-1.5 text-green-600 text-sm">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span>Email valide</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-niger-green dark:text-niger-green-light mb-2">
            Sujet <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              onBlur={() => handleBlur('subject')}
              className={`
                w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all duration-200
                focus:ring-2 focus:ring-niger-orange/20
                ${!touched.subject || !formData.subject
                  ? 'border-niger-orange/20 hover:border-niger-orange/40 focus:border-niger-orange bg-white dark:bg-secondary-700 text-readable dark:text-foreground'
                  : fieldErrors.subject
                  ? 'border-red-500 bg-red-50/50 dark:bg-red-900/20 focus:border-red-500'
                  : 'border-green-500 bg-green-50/50 dark:bg-green-900/20 focus:border-green-500'
                }
              `}
              placeholder="Le sujet de votre message"
            />
            {/* Icône de validation */}
            {touched.subject && formData.subject && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {!fieldErrors.subject ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            )}
          </div>
          {touched.subject && fieldErrors.subject && (
            <div className="flex items-center mt-1.5 text-red-500 text-sm">
              <XCircle className="w-4 h-4 mr-1" />
              <span>{fieldErrors.subject}</span>
            </div>
          )}
          {touched.subject && formData.subject && !fieldErrors.subject && (
            <div className="flex items-center mt-1.5 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4 mr-1" />
              <span>Sujet valide</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-niger-green dark:text-niger-green-light mb-2">
            Message <span className="text-red-500">*</span>
            {formData.message && (
              <span className="text-xs text-gray-500 ml-2">
                ({formData.message.length} caractères{formData.message.length < 10 ? `, minimum 10` : ''})
              </span>
            )}
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            onBlur={() => handleBlur('message')}
            rows="6"
            className={`
              w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
              focus:ring-2 focus:ring-niger-orange/20 resize-vertical
              ${!touched.message || !formData.message
                ? 'border-niger-orange/20 hover:border-niger-orange/40 focus:border-niger-orange bg-white dark:bg-secondary-700 text-readable dark:text-foreground'
                : fieldErrors.message
                ? 'border-red-500 bg-red-50/50 dark:bg-red-900/20 focus:border-red-500'
                : 'border-green-500 bg-green-50/50 dark:bg-green-900/20 focus:border-green-500'
              }
            `}
            placeholder="Écrivez votre message ici..."
          ></textarea>
          {touched.message && fieldErrors.message && (
            <div className="flex items-center mt-1.5 text-red-500 text-sm">
              <XCircle className="w-4 h-4 mr-1" />
              <span>{fieldErrors.message}</span>
            </div>
          )}
          {touched.message && formData.message && !fieldErrors.message && (
            <div className="flex items-center mt-1.5 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4 mr-1" />
              <span>Message valide</span>
            </div>
          )}
        </div>

        {/* Captcha - Affiché seulement si TOUS les champs sont valides */}
        {isFormValid && (
          <div className="flex justify-center animate-fade-in">
            <Turnstile
              ref={turnstileRef}
              sitekey={process.env.NEXT_PUBLIC_CLOUDFLARE_SITE_KEY || process.env.DISABLED_CLOUDFLARE_SITE_KEY}
              onVerify={onVerify}
              theme="light"
              options={{
                size: "normal",
                tabIndex: 0
              }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="
            w-full px-6 py-3.5 bg-gradient-to-r from-niger-orange to-niger-green
            text-white text-lg font-medium rounded-xl
            hover:from-niger-orange-dark hover:to-niger-green-dark
            focus:ring-4 focus:ring-niger-orange/20
            transform transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-niger-orange disabled:hover:to-niger-green
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

        {/* Info sur les champs requis */}
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          <span className="text-red-500">*</span> Champs obligatoires
        </p>
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
            max-w-md z-50
          `}
        >
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
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

// Forcer SSR pour éviter les erreurs durant le SSG
export async function getServerSideProps() {
  return {
    props: {}
  };
}
