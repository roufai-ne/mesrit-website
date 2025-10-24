import React, { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Linkedin,
  ChevronRight,
  Send,
  ExternalLink
} from 'lucide-react';
import Turnstile from 'react-turnstile';
import { useSettings } from '@/contexts/SettingsContext';
import { useTheme } from '@/contexts/ThemeContext';
import toast from 'react-hot-toast';

export default function Footer() {
  const { settings } = useSettings();
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [token, setToken] = useState(null);
  const turnstileRef = useRef(null);

  const menuLinks = {
    ministere: [
      { title: 'À propos', href: '/ministere' },
      { title: 'Organisation', href: '/ministere/organisation' },
      { title: 'Missions', href: '/ministere/missions' },
      { title: 'Direction', href: '/ministere/direction' }
    ],
    services: [
      { title: 'ANAB', href: settings?.external?.anab || 'https://anab.ne', external: true },
      { title: 'OBEECS', href: settings?.external?.bac || 'https://www.obeecsniger.com/', external: true },
      { title: 'ANAQ-SUP', href: settings?.external?.bts || 'https://anaq-sup.ne', external: true }
    ],
    ressources: [
      { title: 'Documentation', href: '/documentation' },
      { title: 'Actualités', href: '/actualites' },
      { title: 'FAQ', href: '/faq' },
      { title: 'Contact', href: '/contact' }
    ]
  };

  const onVerify = useCallback((token) => {
    setToken(token);
  }, []);

  // État pour le message de succès
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setShowSuccess(false);

    try {
      // Validation de l'email
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        throw new Error('Veuillez entrer un email valide');
      }

      // Validation du captcha
      if (!token) {
        throw new Error('Veuillez valider le captcha');
      }

      // Appel API
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          token 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue lors de l\'inscription');
      }

      // Succès
      setStatus('success');
      setEmail('');
      setToken(null);
      setShowSuccess(true);
      
      // Réinitialiser le captcha
      if (turnstileRef.current) {
        turnstileRef.current.reset();
      }

      // Message de succès
      toast.success('Inscription réussie ! Vérifiez votre boîte mail.', {
        duration: 5000,
        icon: '✉️',
      });

      // Cacher le message de succès après 5 secondes
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    } catch (error) {
      setStatus('error');
      toast.error(error.message || 'Une erreur est survenue', { duration: 4000 });
      if (turnstileRef.current) {
        turnstileRef.current.reset();
      }
    } finally {
      setTimeout(() => {
        if (status === 'error') setStatus('idle');
      }, 2000);
    }

  };

  if (!settings) {
    return (
      <div className={clsx(
        'py-16 text-center transition-colors',
        isDark ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-900'
      )}>
        Chargement des paramètres...
      </div>
    );
  }

  return (
    <footer className={clsx(
      'relative transition-all duration-300 border-t overflow-hidden',
      isDark
        ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border-gray-700'
        : 'bg-gradient-to-br from-white via-orange-50 to-green-50 border-orange-200'
    )}>
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 left-0 w-32 h-32 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(255, 140, 0, 0.3)' }} />
        <div className="absolute top-20 right-0 w-40 h-40 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(34, 139, 34, 0.3)' }} />
        <div className="absolute bottom-0 left-1/4 w-24 h-24 rounded-full blur-2xl" style={{ backgroundColor: 'rgba(255, 140, 0, 0.2)' }} />
        <div className="absolute bottom-20 right-1/3 w-28 h-28 rounded-full blur-2xl" style={{ backgroundColor: 'rgba(34, 139, 34, 0.2)' }} />
      </div>

      <div className="relative z-10">
        {/* Newsletter Section */}
        <div className={clsx(
          'py-12 border-b-2',
          isDark ? 'border-orange-500/30' : 'border-orange-300/50'
        )}>
          <div className="container mx-auto px-4 lg:px-6">
            <div className={clsx(
              'rounded-2xl p-6 shadow-2xl border-2 backdrop-blur-sm',
              isDark
                ? 'border-orange-400/40'
                : 'border-orange-300/40'
            )}
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(255, 140, 0, 0.1), rgba(34, 139, 34, 0.1))'
                : 'linear-gradient(135deg, rgba(255, 140, 0, 0.05), rgba(34, 139, 34, 0.05))'
            }}>
              <div className="text-center max-w-3xl mx-auto">
                <h3 className={clsx(
                  'text-2xl font-bold mb-3',
                  isDark ? 'text-white' : 'text-gray-900'
                )}>
                  Restez Informé
                </h3>
                <p className={clsx(
                  'text-base mb-6 leading-relaxed',
                  isDark ? 'text-gray-200' : 'text-gray-700'
                )}>
                  Recevez nos dernières actualités, événements et informations importantes directement dans votre boîte mail.
                </p>

                {showSuccess ? (
                  <div className="flex items-center justify-center text-green-500 bg-green-100 dark:bg-green-900/30 p-4 rounded-lg animate-fade-in">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Merci de votre inscription ! Veuillez vérifier votre boîte mail.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex flex-col gap-3 max-w-lg mx-auto">
                    <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      placeholder="Votre adresse email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={clsx(
                        'flex-1 px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-4 text-sm',
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
        </div>
      </div>

      {/* Main Footer Content with a more modern, centered layout */}
      <div className="py-16">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-12">

            {/* Main Info Card - MESRIT & Contact */}
            <div className={clsx(
              'p-6 rounded-3xl shadow-2xl border-2 w-full lg:w-1/4 flex-shrink-0',
              isDark
                ? 'border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900'
                : 'border-orange-200 bg-gradient-to-br from-white to-gray-50'
            )}>
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/20" /* Reduced size */
                  style={{
                    background: 'linear-gradient(135deg, #ff8c00 0%, #228b22 100%)',
                    boxShadow: '0 8px 25px rgba(255, 140, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <span className="text-2xl font-bold text-white drop-shadow-lg">M</span> 
                </div>
                <div>
                  <h4 className={clsx(
                    'text-xl font-extrabold', 
                    isDark ? 'text-white' : 'text-gray-900'
                  )}>
                    MESRIT
                  </h4>
                  <p className="text-base font-semibold" style={{ color: '#228b22' }}>
                    Ministère de l'Enseignement Supérieur
                  </p>
                </div>
              </div>

              <div className="space-y-4"> {/* Reduced space-y */}
                <div className="flex items-center gap-3 group cursor-pointer transition-all duration-300"> {/* Reduced gap */}
                  <div
                    className="p-3 rounded-xl transition-all shadow-lg border-2" /* Reduced padding */
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 140, 0, 0.2), rgba(255, 140, 0, 0.4))',
                      borderColor: '#ff8c00',
                      boxShadow: '0 6px 20px rgba(255, 140, 0, 0.3)'
                    }}
                  >
                    <Phone className="w-4 h-4" style={{ color: '#ff8c00' }} /> {/* Reduced icon size */}
                  </div>
                  <span className={clsx(
                    'text-sm font-semibold', /* Reduced text size */
                    isDark ? 'text-gray-200' : 'text-gray-800'
                  )}>
                    +227 20 72 29 50
                  </span>
                </div>

                <div className="flex items-center gap-3 group cursor-pointer transition-all duration-300">
                  <div
                    className="p-3 rounded-xl transition-all shadow-lg border-2" /* Reduced padding */
                    style={{
                      background: 'linear-gradient(135deg, rgba(34, 139, 34, 0.2), rgba(34, 139, 34, 0.4))',
                      borderColor: '#228b22',
                      boxShadow: '0 6px 20px rgba(34, 139, 34, 0.3)'
                    }}
                  >
                    <Mail className="w-4 h-4" style={{ color: '#228b22' }} /> {/* Reduced icon size */}
                  </div>
                  <span className={clsx(
                    'text-sm font-semibold', /* Reduced text size */
                    isDark ? 'text-gray-200' : 'text-gray-800'
                  )}>
                    contact@mesrit.gouv.ne
                  </span>
                </div>

                <div className="flex items-center gap-3 group cursor-pointer transition-all duration-300">
                  <div
                    className="p-3 rounded-xl transition-all shadow-lg border-2" /* Reduced padding */
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 140, 0, 0.15), rgba(34, 139, 34, 0.15))',
                      borderColor: '#ff8c00',
                      boxShadow: '0 6px 20px rgba(255, 140, 0, 0.2)'
                    }}
                  >
                    <MapPin className="w-4 h-4" style={{ color: '#ff8c00' }} /> {/* Reduced icon size */}
                  </div>
                  <span className={clsx(
                    'text-sm font-semibold', /* Reduced text size */
                    isDark ? 'text-gray-200' : 'text-gray-800'
                  )}>
                    Niamey, Niger
                  </span>
                </div>
              </div>
            </div>

            {/* Secondary Content - Menus & Socials */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full lg:w-3/4">

              {/* Le Ministère */}
              <div className={clsx(
                'p-6 rounded-2xl border-2 shadow-2xl relative overflow-hidden',
                isDark
                  ? 'border-green-400/40 shadow-green-900/20 bg-gradient-to-br from-gray-800/50 to-gray-900/50'
                  : 'border-green-500/30 shadow-green-500/20 bg-gradient-to-br from-white/50 to-green-50/50'
              )}>
                <h4 className={clsx(
                  'text-lg font-bold mb-6 flex items-center gap-3',
                  isDark ? 'text-white' : 'text-gray-900'
                )}>
                  <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#228b22' }} />
                  Le Ministère
                </h4>

                <ul className="space-y-4">
                  {menuLinks.ministere.map((link, idx) => (
                    <li key={idx}>
                      <Link
                        href={link.href}
                        className={clsx(
                          'text-sm font-medium transition-all hover:translate-x-3 transform flex items-center gap-4 p-2 rounded-xl hover:shadow-lg group border border-transparent hover:border-green-300/50', /* Reduced text size and padding */
                          isDark
                            ? 'text-gray-300 hover:text-white hover:bg-green-600/20'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-green-500/10'
                        )}
                        style={{
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        <div
                          className="w-2 h-2 rounded-full group-hover:scale-150 transition-transform shadow-lg" /* Reduced size */
                          style={{ backgroundColor: '#228b22' }}
                        />
                        <span className="group-hover:font-semibold transition-all">{link.title}</span>
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all ml-auto transform group-hover:translate-x-1" style={{ color: '#228b22' }} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Services & Ressources (combined) */}
              <div className={clsx(
                'p-6 rounded-2xl border-2 shadow-2xl relative overflow-hidden md:col-span-2 lg:col-span-2',
                isDark
                  ? 'border-orange-400/40 shadow-orange-900/20 bg-gradient-to-br from-gray-800/50 to-gray-900/50'
                  : 'border-orange-500/30 shadow-orange-500/20 bg-gradient-to-br from-white/50 to-orange-50/50'
              )}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Services Partenaires */}
                  <div>
                    <h4 className={clsx(
                      'text-lg font-bold mb-4 flex items-center gap-3', 
                      isDark ? 'text-white' : 'text-gray-900'
                    )}>
                      <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#ff8c00' }} />
                      Services Partenaires
                    </h4>
                    <ul className="space-y-3">
                      {menuLinks.services.map((link, idx) => (
                        <li key={idx}>
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={clsx(
                              'text-sm font-medium transition-all hover:translate-x-2 transform flex items-center gap-3 p-2 rounded-lg hover:shadow-md group',
                              isDark
                                ? 'text-gray-400 hover:text-white hover:bg-niger-orange/20'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-niger-orange/10'
                            )}
                          >
                            <ExternalLink className="w-4 h-4 text-niger-orange group-hover:scale-110 transition-transform" />
                            {link.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Ressources */}
                  <div>
                    <h5 className={clsx(
                      'text-lg font-bold mb-4 flex items-center gap-3',
                      isDark ? 'text-white' : 'text-gray-900'
                    )}>
                      <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#228b22' }} />
                      Ressources
                    </h5>
                    <ul className="space-y-2">
                      {menuLinks.ressources.map((link, idx) => (
                        <li key={idx}>
                          <Link
                            href={link.href}
                            className={clsx(
                              'text-sm font-medium transition-all hover:translate-x-2 transform flex items-center gap-2 p-1.5 rounded-lg hover:shadow-md group',
                              isDark
                                ? 'text-gray-400 hover:text-white hover:bg-niger-green/20'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-niger-green/10'
                            )}
                          >
                            <div className="w-2 h-2 rounded-full bg-niger-green group-hover:scale-150 transition-transform" />
                            {link.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media & Hours of Operation - Centered at the bottom */}
          <div className={clsx(
            'p-8 rounded-3xl shadow-2xl border-2 mt-12 w-full mx-auto',
            isDark
              ? 'border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900'
              : 'border-orange-200 bg-gradient-to-br from-white to-gray-50'
          )}>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-8">
              <div>
                <h4 className={clsx(
                  'text-lg font-bold mb-4',
                  isDark ? 'text-white' : 'text-gray-900'
                )}>
                  Suivez-nous
                </h4>
                <p className={clsx(
                  'text-sm mb-6 max-w-sm',
                  isDark ? 'text-gray-400' : 'text-gray-600'
                )}>
                  Restez connecté avec nous sur les réseaux sociaux pour les dernières actualités et événements.
                </p>

                <div className="flex gap-4">
                  {[
                    { name: 'Facebook', url: settings?.social?.facebook || '#', icon: Facebook, color: 'bg-blue-600', hoverColor: 'hover:bg-blue-700' },
                    { name: 'Twitter', url: settings?.social?.twitter || '#', icon: Twitter, color: 'bg-blue-400', hoverColor: 'hover:bg-blue-500' },
                    { name: 'LinkedIn', url: settings?.social?.linkedin || '#', icon: Linkedin, color: 'bg-blue-700', hoverColor: 'hover:bg-blue-800' }
                  ].map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={clsx(
                        'p-3 rounded-full transition-all group hover:scale-110 shadow-lg text-white transform hover:-translate-y-1', /* Reduced padding */
                        social.color,
                        social.hoverColor
                      )}
                      aria-label={`Suivez-nous sur ${social.name}`}
                    >
                      <social.icon className="w-4 h-4" /> {/* Reduced icon size */}
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <div className={clsx(
                  'p-6 rounded-2xl border-2 shadow-inner',
                  isDark
                    ? 'bg-gradient-to-r from-niger-green/10 to-niger-orange/10 border-niger-green/30'
                    : 'bg-gradient-to-r from-niger-green/5 to-niger-orange/5 border-niger-green/20'
                )}>
                  <h5 className={clsx(
                    'font-bold text-lg mb-3 flex items-center gap-2',
                    isDark ? 'text-white' : 'text-gray-900'
                  )}>
                    <div className="w-3 h-3 rounded-full bg-niger-green animate-pulse" />
                    Horaires d'ouverture
                  </h5>
                  <p className={clsx(
                    'text-base',
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  )}>
                    Lundi - Vendredi : 8h00 - 17h00<br />
                    Samedi : 8h00 - 12h00
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section with enhanced colors */}
      <div className={clsx(
        'py-10 border-t-4 relative overflow-hidden',
        isDark ? 'border-orange-400/50' : 'border-orange-300/60'
      )}
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(255, 140, 0, 0.08), rgba(34, 139, 34, 0.08))'
          : 'linear-gradient(135deg, rgba(255, 140, 0, 0.05), rgba(34, 139, 34, 0.05))'
      }}>
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full blur-xl" style={{ backgroundColor: 'rgba(255, 140, 0, 0.3)' }} />
          <div className="absolute bottom-0 right-0 w-16 h-16 rounded-full blur-lg" style={{ backgroundColor: 'rgba(34, 139, 34, 0.3)' }} />
        </div>

        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-6">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl border-2 border-white/20 hover:scale-110 transition-transform cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #ff8c00 0%, #228b22 100%)',
                  boxShadow: '0 8px 25px rgba(255, 140, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                }}
              >
                <span className="text-xl font-bold text-white drop-shadow-lg">M</span>
              </div>

              <div>
                <div className={clsx(
                  'text-lg font-bold',
                  isDark ? 'text-white' : 'text-gray-900'
                )}>
                  © 2024 MESRIT
                </div>
                <div className={clsx(
                  'text-sm font-medium',
                  isDark ? 'text-gray-300' : 'text-gray-700'
                )}>
                  Tous droits réservés • République du Niger
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-end gap-6 text-base">
              {[
                { title: 'Mentions légales', href: '/mentions-legales', color: '#228b22' },
                { title: 'Confidentialité', href: '/politique-confidentialite', color: '#ff8c00' },
                { title: 'Conditions d\'utilisation', href: '/conditions-utilisation', color: '#228b22' },
                { title: 'Plan du site', href: '/sitemap', color: '#ff8c00' }
              ].map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  className={clsx(
                    'font-semibold transition-all hover:underline hover:scale-105 transform px-3 py-1.5 rounded-lg hover:shadow-lg border border-transparent hover:border-current/20',
                    isDark
                      ? 'hover:bg-white/10'
                      : 'hover:bg-white/50'
                  )}
                  style={{
                    color: link.color,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.textShadow = `0 0 10px ${link.color}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.textShadow = 'none';
                  }}
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </div>

          {/* Additional decorative element */}
          <div className="flex justify-center items-center mt-8 gap-4">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, #ff8c00, transparent)' }} />
            <div className={clsx(
              'text-sm font-medium px-4 py-2 rounded-full border shadow-lg',
              isDark
                ? 'text-gray-300 border-gray-700 bg-gray-800/50'
                : 'text-gray-600 border-gray-300 bg-white/50'
            )}>
              Fait avec passion pour l'éducation au Niger
            </div>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, #228b22, transparent)' }} />
          </div>
        </div>
      </div>
    </footer>
  );
}
