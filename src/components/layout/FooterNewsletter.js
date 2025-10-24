// components/layout/FooterNewsletter.js
import React, { useState, useRef } from 'react';
import { clsx } from 'clsx';
import { Mail } from 'lucide-react';
import Turnstile from 'react-turnstile';
import toast from 'react-hot-toast';

export default function FooterNewsletter({ isDark }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [token, setToken] = useState(null);
  const turnstileRef = useRef(null);

  const onVerify = (verificationToken) => {
    setToken(verificationToken);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !token) {
      toast.error('Veuillez compléter tous les champs');
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

  return (
    <div className="py-16 relative overflow-hidden bg-gradient-to-br from-niger-orange/95 via-niger-orange-dark to-niger-green/90">
      <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-10" />
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
              <div className="flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre adresse email"
                  required
                  disabled={status === 'loading'}
                  className={clsx(
                    'w-full px-6 py-4 rounded-xl border-2 focus:ring-4 focus:outline-none transition-all duration-300 text-base shadow-lg',
                    isDark
                      ? 'bg-gray-800 border-orange-500/50 text-white placeholder-gray-400 focus:border-orange-400 focus:ring-orange-500/30'
                      : 'bg-white border-orange-400/60 text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-orange-400/30'
                  )}
                />
              </div>
              <div className="mx-auto">
                <Turnstile
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
              <button
                type="submit"
                disabled={status === 'loading'}
                className={clsx(
                  'px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm',
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
