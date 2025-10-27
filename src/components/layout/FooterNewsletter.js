// components/layout/FooterNewsletter.js
import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { Mail, CheckCircle, XCircle } from 'lucide-react';
import Turnstile from 'react-turnstile';
import toast from 'react-hot-toast';
import { validators } from '@/lib/validation';

export default function FooterNewsletter({ isDark }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [token, setToken] = useState(null);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailError, setEmailError] = useState('');
  const turnstileRef = useRef(null);

  // Validation en temps réel de l'email (pas besoin de isMounted car composant client-only)
  useEffect(() => {
    if (!email) {
      setIsEmailValid(false);
      setEmailError('');
      // Réinitialiser le token du captcha si l'email est vidé
      if (token) {
        setToken(null);
        if (turnstileRef.current) {
          turnstileRef.current.reset();
        }
      }
      return;
    }

    try {
      validators.email(email);
      setIsEmailValid(true);
      setEmailError('');
    } catch (error) {
      setIsEmailValid(false);
      setEmailError(error.message);
      // Réinitialiser le token si l'email devient invalide
      if (token) {
        setToken(null);
        if (turnstileRef.current) {
          turnstileRef.current.reset();
        }
      }
    }
  }, [email, token]);

  const onVerify = (verificationToken) => {
    setToken(verificationToken);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (!emailTouched) {
      setEmailTouched(true);
    }
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation finale avant envoi
    if (!isEmailValid) {
      toast.error('Veuillez entrer une adresse email valide');
      setEmailTouched(true);
      return;
    }

    if (!token) {
      toast.error('Veuillez compléter la vérification de sécurité');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, turnstileToken: token }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Inscription réussie! Vérifiez votre email.');
        setStatus('success');
        setEmail('');
        setToken(null);
        setEmailTouched(false);
        setIsEmailValid(false);
        if (turnstileRef.current) {
          turnstileRef.current.reset();
        }
      } else {
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }
    } catch (error) {
      console.error('Erreur newsletter:', error);
      toast.error(error.message || 'Une erreur est survenue');
      setStatus('error');
    } finally {
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  // Désactiver le bouton si l'email n'est pas valide ou si le captcha n'est pas vérifié
  const isSubmitDisabled = !isEmailValid || !token || status === 'loading';

  return (
    <div className="py-16 relative overflow-hidden bg-gradient-to-br from-niger-orange/95 via-niger-orange-dark to-niger-green/90">
      {/* Pattern SVG directement en CSS au lieu d'une image */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
              Restez informé des dernières actualités
            </h3>
            <p className="text-lg text-niger-cream/90 max-w-2xl mx-auto leading-relaxed">
              Inscrivez-vous à notre newsletter pour recevoir les dernières nouvelles du Ministère
            </p>
          </div>

          {status === 'success' ? (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
              <div className="text-6xl mb-4">✓</div>
              <h4 className="text-2xl font-bold text-white mb-2">
                Inscription réussie!
              </h4>
              <p className="text-niger-cream/90">
                Vérifiez votre email pour confirmer votre inscription
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex-1 relative">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                    placeholder="Votre adresse email"
                    disabled={status === 'loading'}
                    className={clsx(
                      'w-full px-6 py-4 pr-12 rounded-xl border-2 focus:ring-4 focus:outline-none transition-all duration-300 text-base shadow-lg',
                      // Couleurs de base
                      isDark ? 'bg-gray-800 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500',
                      // Bordures conditionnelles
                      !emailTouched || !email
                        ? (isDark ? 'border-orange-500/50 focus:border-orange-400 focus:ring-orange-500/30' : 'border-orange-400/60 focus:border-orange-500 focus:ring-orange-400/30')
                        : isEmailValid
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500/30'
                        : 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                    )}
                  />
                  {/* Icône de validation */}
                  {emailTouched && email && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {isEmailValid ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {/* Message d'erreur */}
                {emailTouched && !isEmailValid && email && (
                  <p className="mt-2 text-sm text-red-300 flex items-center gap-1">
                    <XCircle className="w-4 h-4" />
                    {emailError || 'Adresse email invalide'}
                  </p>
                )}
                {/* Message de succès */}
                {emailTouched && isEmailValid && (
                  <p className="mt-2 text-sm text-green-300 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Email valide
                  </p>
                )}
              </div>

              {/* Captcha - Affiché seulement si l'email est valide ET que l'utilisateur a interagi */}
              {emailTouched && email && isEmailValid && (
                <div className="mx-auto flex justify-center animate-fade-in">
                  <Turnstile
                    ref={turnstileRef}
                    sitekey={process.env.NEXT_PUBLIC_CLOUDFLARE_SITE_KEY || process.env.DISABLED_CLOUDFLARE_SITE_KEY}
                    onVerify={onVerify}
                    theme={isDark ? "dark" : "light"}
                    options={{
                      size: "normal",
                      tabIndex: 0,
                      appearance: isDark ? "dark" : "light"
                    }}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitDisabled}
                className={clsx(
                  'w-full px-6 py-4 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-white text-base',
                  isDark ? 'bg-orange-500 hover:bg-orange-600' : 'bg-orange-600 hover:bg-orange-700'
                )}
              >
                <div className="relative flex items-center justify-center">
                  <span className={`transition-opacity duration-200 ${status === 'loading' ? 'opacity-0' : 'opacity-100'}`}>
                    <Mail className="w-5 h-5 mr-2" />
                    S'inscrire
                  </span>
                  {status === 'loading' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="ml-2">Inscription...</span>
                    </div>
                  )}
                </div>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
