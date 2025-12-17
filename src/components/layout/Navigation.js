import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { clsx } from 'clsx';
import {
  HomeIcon,
  Building2Icon,
  GraduationCapIcon,
  BookOpenIcon,
  NewspaperIcon,
  MessageCircleIcon,
  MenuIcon,
  XIcon,
  ChevronDownIcon,
  ExternalLinkIcon,
  UserIcon,
  LogOutIcon,
  SettingsIcon,
  ShieldIcon
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

import { useFocusTrap, useKeyboardNavigation, useAccessibleIds } from '@/lib/accessibility';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';

export default function Navigation() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const mobileMenuRef = useFocusTrap(isMobileMenuOpen);
  const userDropdownRef = useRef(null);
  const ids = useAccessibleIds('navigation');

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Styles neumorphiques - DÉPLACÉ ICI AVANT UTILISATION
  const neumorph = {
    light: {
      button: 'shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff]',
      panel: 'shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]',
      inset: 'shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff]'
    },
    dark: {
      button: 'shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:shadow-[2px_2px_4px_#0f172a,-2px_-2px_4px_#334155] active:shadow-[inset_2px_2px_4px_#0f172a,inset_-2px_-2px_4px_#334155]',
      panel: 'shadow-[8px_8px_16px_#0f172a,-8px_-8px_16px_#334155]',
      inset: 'shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155]'
    }
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [router.pathname]);

  // Close dropdowns when clicking outside - CORRIGÉ
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Gestion du dropdown de navigation
      if (!e.target.closest('[data-dropdown]')) {
        setActiveDropdown(null);
      }

      // Gestion du dropdown utilisateur
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const menuItems = [
    {
      label: 'Accueil',
      path: '/',
      icon: HomeIcon,
      description: 'Page d\'accueil du site',
      color: '#ff8c00',
      bgColor: 'rgba(255, 140, 0, 0.1)'
    },
    {
      label: 'Le Ministère',
      path: '/ministere',
      icon: Building2Icon,
      description: 'Informations sur le ministère',
      color: '#228b22',
      bgColor: 'rgba(34, 139, 34, 0.1)',
      hasDropdown: true,
      dropdownItems: [
        { label: 'Organisation', path: '/ministere/organisation', description: 'Structure organisationnelle' },
        { label: 'Mission & Vision', path: '/ministere/missions', description: 'Notre mission et vision' },
        { label: 'Direction', path: '/ministere/direction', description: 'L\'équipe dirigeante' },
        { label: 'Historique', path: '/ministere/historique', description: 'Notre histoire' }
      ]
    },
    {
      label: 'Établissements',
      path: '/etablissements',
      icon: GraduationCapIcon,
      description: 'Tous nos établissements d\'enseignement supérieur',
      color: '#ff8c00',
      bgColor: 'rgba(255, 140, 0, 0.1)'
    },
    {
      label: 'Documentation',
      path: '/documentation',
      icon: BookOpenIcon,
      description: 'Tous nos documents officiels',
      color: '#228b22',
      bgColor: 'rgba(34, 139, 34, 0.1)'
    },
    {
      label: 'Actualités',
      path: '/actualites',
      icon: NewspaperIcon,
      description: 'Toutes nos actualités et événements',
      color: '#ff8c00',
      bgColor: 'rgba(255, 140, 0, 0.1)'
    },
    {
      label: 'Services',
      path: '/services',
      icon: SettingsIcon,
      description: 'Tous nos services en ligne',
      color: '#228b22',
      bgColor: 'rgba(34, 139, 34, 0.1)'
    },
    {
      label: 'Contact',
      path: '/contact',
      icon: MessageCircleIcon,
      description: 'Contactez-nous',
      color: '#228b22',
      bgColor: 'rgba(34, 139, 34, 0.1)'
    }
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setActiveDropdown(null);
  };

  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };



  return (
    <nav
      className={clsx(
        'sticky top-0 z-50 transition-all duration-300',
        isDark
          ? 'bg-gray-900/95 backdrop-blur-lg border-b border-gray-800'
          : 'bg-white/95 backdrop-blur-lg border-b border-gray-200',
        isScrolled && (isDark ? 'shadow-2xl shadow-gray-900/50' : 'shadow-2xl shadow-gray-500/20')
      )}
      role="navigation"
      aria-label="Navigation principale"
    >
      <div className="container mx-auto px-4 lg:px-6">
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center justify-between h-18 py-3">
          <div className="flex items-center space-x-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.path ||
                (item.hasDropdown && item.dropdownItems?.some(subItem => router.pathname === subItem.path));

              return (
                <div key={index} className="relative" data-dropdown>
                  {item.hasDropdown ? (
                    <>
                      <div
                        className={clsx(
                          'group relative flex items-center rounded-xl font-semibold text-sm transition-all duration-300 border-2',
                          'transform hover:scale-[1.02] focus-within:ring-4',
                          isActive
                            ? isDark
                              ? `bg-gray-800 border-transparent text-white ${neumorph.dark.inset}`
                              : `bg-gray-100 border-transparent text-gray-900 ${neumorph.light.inset}`
                            : isDark
                              ? `border-gray-700 text-gray-200 hover:text-white ${neumorph.dark.button}`
                              : `border-gray-200 text-gray-800 hover:text-gray-900 ${neumorph.light.button}`,
                          isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'
                        )}
                        style={{
                          background: isActive
                            ? `linear-gradient(135deg, ${item.color}20, ${item.color}40)`
                            : isDark
                              ? 'linear-gradient(135deg, #374151, #1f2937)'
                              : 'linear-gradient(135deg, #f9fafb, #e5e7eb)',
                          borderColor: isActive ? `${item.color}60` : undefined
                        }}
                      >
                        {/* Lien principal vers la page */}
                        <Link
                          href={item.path}
                          className="flex items-center space-x-2 px-4 py-3 flex-1 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-l-xl"
                          style={{
                            focusRingColor: `${item.color}40`
                          }}
                        >
                          <Icon className={clsx(
                            'w-4 h-4 transition-all duration-300',
                            isActive ? 'text-white' : 'group-hover:scale-110'
                          )}
                            style={{
                              color: isActive ? 'white' : item.color
                            }} />
                          <span>{item.label}</span>
                        </Link>

                        {/* Bouton pour le dropdown */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleDropdown(index);
                          }}
                          onKeyDown={(e) => handleKeyDown(e, () => toggleDropdown(index))}
                          className="px-2 py-3 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-r-xl"
                          style={{
                            focusRingColor: `${item.color}40`
                          }}
                          aria-expanded={activeDropdown === index}
                          aria-haspopup="true"
                          aria-label={`Ouvrir le menu ${item.label}`}
                        >
                          <ChevronDownIcon
                            className={clsx(
                              'w-4 h-4 transition-transform duration-300',
                              activeDropdown === index && 'rotate-180'
                            )}
                          />
                        </button>

                        {/* Subtle pulse for active items */}
                        {isActive && (
                          <div className="absolute inset-0 rounded-xl animate-pulse opacity-30 pointer-events-none"
                            style={{ background: item.color }} />
                        )}
                      </div>

                      {/* Dropdown Menu */}
                      {activeDropdown === index && (
                        <div className={clsx(
                          'absolute top-full left-0 mt-2 w-72 rounded-2xl shadow-2xl border-2 py-3 z-50 backdrop-blur-lg',
                          isDark
                            ? 'bg-gray-800/95 border-gray-600'
                            : 'bg-white/95 border-gray-200'
                        )}
                          style={{
                            borderColor: `${item.color}40`
                          }}>
                          {/* Lien principal vers la page ministère */}
                          <Link
                            href={item.path}
                            className={clsx(
                              'flex items-start px-4 py-3 text-sm transition-all duration-200 group mx-2 rounded-xl border-b',
                              isDark
                                ? 'hover:bg-gray-700 text-gray-300 hover:text-white border-gray-600'
                                : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900 border-gray-200'
                            )}
                            style={{
                              '&:hover': {
                                backgroundColor: item.bgColor
                              }
                            }}
                          >
                            <div className="flex-1">
                              <div className="font-bold group-hover:scale-105 transition-transform text-base">
                                {item.label}
                              </div>
                              <div className={clsx(
                                'text-xs mt-1 leading-tight',
                                isDark ? 'text-gray-400' : 'text-gray-500'
                              )}>
                                {item.description}
                              </div>
                            </div>
                            <ExternalLinkIcon className={clsx(
                              'w-4 h-4 mt-1 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:scale-110',
                              isDark ? 'text-gray-500' : 'text-gray-400'
                            )}
                              style={{
                                color: item.color
                              }} />
                          </Link>

                          {/* Sous-pages */}
                          {item.dropdownItems?.map((subItem, subIndex) => (
                            <Link
                              key={subIndex}
                              href={subItem.path}
                              className={clsx(
                                'flex items-start px-4 py-3 text-sm transition-all duration-200 group mx-2 rounded-xl',
                                isDark
                                  ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
                                  : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                              )}
                              style={{
                                '&:hover': {
                                  backgroundColor: item.bgColor
                                }
                              }}
                            >
                              <div className="flex-1">
                                <div className="font-semibold group-hover:scale-105 transition-transform">
                                  {subItem.label}
                                </div>
                                <div className={clsx(
                                  'text-xs mt-1 leading-tight',
                                  isDark ? 'text-gray-400' : 'text-gray-500'
                                )}>
                                  {subItem.description}
                                </div>
                              </div>
                              <ExternalLinkIcon className={clsx(
                                'w-4 h-4 mt-1 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:scale-110',
                                isDark ? 'text-gray-500' : 'text-gray-400'
                              )}
                                style={{
                                  color: item.color
                                }} />
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.path}
                      className={clsx(
                        'group relative flex items-center space-x-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 border-2',
                        'hover:scale-105 hover:shadow-lg transform focus:outline-none focus:ring-4',
                        isActive
                          ? 'text-white border-transparent shadow-lg'
                          : isDark
                            ? 'text-gray-300 border-gray-700 hover:text-white hover:border-gray-600 hover:bg-gray-800/50'
                            : 'text-gray-700 border-gray-200 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                      )}
                      style={{
                        background: isActive ? `linear-gradient(135deg, ${item.color}, ${item.color}cc)` : 'transparent',
                        focusRingColor: `${item.color}40`
                      }}
                    >
                      <Icon className={clsx(
                        'w-4 h-4 transition-all duration-300',
                        isActive ? 'text-white' : 'group-hover:scale-110'
                      )}
                        style={{
                          color: isActive ? 'white' : item.color
                        }} />
                      <span>{item.label}</span>

                      {/* Subtle pulse for active items */}
                      {isActive && (
                        <div className="absolute inset-0 rounded-xl animate-pulse opacity-30"
                          style={{ background: item.color }} />
                      )}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="flex items-center space-x-4">
            <ThemeToggle
              variant="ghost"
              className={clsx(
                'p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105',
                isDark
                  ? 'text-gray-300 border-gray-700 hover:text-white hover:border-gray-600 hover:bg-gray-800'
                  : 'text-gray-600 border-gray-200 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50'
              )}
            />

            {/* Auth Buttons - Client Side Only to prevent hydration mismatch */}
            {hasMounted && (
              user ? (
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className={clsx(
                      'flex items-center space-x-2 px-4 py-2 rounded-xl border-2 transition-all duration-300',
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-white hover:border-gray-500'
                        : 'bg-white border-gray-200 text-gray-900 hover:border-gray-400'
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-green-600 p-0.5">
                      <div className={clsx(
                        "w-full h-full rounded-full flex items-center justify-center text-xs font-bold text-white",
                        isDark ? "bg-gray-900" : "bg-white text-gray-900"
                      )}>
                        U
                      </div>
                    </div>
                    <span className="font-medium text-sm">Mon Espace</span>
                    <ChevronDownIcon className="w-4 h-4 ml-1" />
                  </button>

                  {isUserDropdownOpen && (
                    <div className={clsx(
                      'absolute right-0 mt-2 w-48 rounded-xl shadow-2xl border py-2 z-50',
                      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    )}>
                      <Link
                        href="/admin"
                        className={clsx(
                          'flex items-center px-4 py-2 text-sm space-x-2',
                          isDark ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        )}
                      >
                        <UserIcon className="w-4 h-4" />
                        <span>Tableau de bord</span>
                      </Link>
                      <button
                        onClick={logout}
                        className={clsx(
                          'w-full flex items-center px-4 py-2 text-sm space-x-2 text-red-500',
                          isDark ? 'hover:bg-gray-700' : 'hover:bg-red-50'
                        )}
                      >
                        <LogOutIcon className="w-4 h-4" />
                        <span>Déconnexion</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/admin"
                  className={clsx(
                    'hidden lg:flex items-center px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 border-2',
                    'hover:scale-105 hover:shadow-lg transform focus:outline-none focus:ring-4',
                    isDark
                      ? 'border-green-600 text-green-500 hover:bg-green-600 hover:text-white'
                      : 'border-green-600 text-green-700 hover:bg-green-600 hover:text-white'
                  )}
                  style={{
                    focusRingColor: '#228b2240'
                  }}
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  <span>Se connecter</span>
                </Link>
              )
            )}
          </div>
        </div>

        {/* Mobile Navigation Header */}
        <div className="lg:hidden flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleMobileMenu}
              className={clsx(
                'p-2 rounded-xl border-2 transition-all duration-300 focus:outline-none hover:scale-105',
                isDark
                  ? 'text-gray-300 border-gray-700 hover:text-white hover:border-gray-600 hover:bg-gray-800'
                  : 'text-gray-600 border-gray-200 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50'
              )}
              aria-expanded={isMobileMenuOpen}
              aria-controls={ids.mobileMenu}
              aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {isMobileMenuOpen ? (
                <XIcon className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>

            <span className={clsx(
              'font-bold text-lg',
              isDark ? 'text-white' : 'text-gray-900'
            )}>
              MESRIT
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <ThemeToggle
              variant="ghost"
              size="sm"
              className={clsx(
                'p-2 rounded-lg border transition-colors',
                isDark
                  ? 'text-gray-300 border-gray-700 hover:text-white hover:border-gray-600 hover:bg-gray-800'
                  : 'text-gray-600 border-gray-200 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50'
              )}
            />

            {/* Mobile Auth Button */}
            {hasMounted && !user && (
              <Link
                href="/admin"
                className="p-2 rounded-lg bg-green-600 text-white shadow-md active:scale-95 transition-all"
              >
                <UserIcon className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            id={ids.mobileMenu}
            className={clsx(
              'lg:hidden border-t py-4 backdrop-blur-lg',
              isDark
                ? 'bg-gray-900/95 border-gray-800'
                : 'bg-white/95 border-gray-200'
            )}
          >
            <div className="space-y-3">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = router.pathname === item.path ||
                  (item.hasDropdown && item.dropdownItems?.some(subItem => router.pathname === subItem.path));

                return (
                  <div key={index}>
                    {item.hasDropdown ? (
                      <>
                        {/* Conteneur flex pour le lien principal et le bouton dropdown */}
                        <div className="flex items-center gap-2">
                          {/* Lien principal vers la page (ex: /ministere) */}
                          <Link
                            href={item.path}
                            className={clsx(
                              'flex-1 flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 border-2',
                              'hover:scale-[1.02] transform',
                              isActive
                                ? 'text-white border-transparent shadow-lg'
                                : isDark
                                  ? 'text-gray-300 border-gray-700 hover:text-white hover:border-gray-600 hover:bg-gray-800'
                                  : 'text-gray-700 border-gray-200 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                            )}
                            style={{
                              background: isActive ? `linear-gradient(135deg, ${item.color}, ${item.color}cc)` : 'transparent'
                            }}
                          >
                            <Icon className="w-5 h-5"
                              style={{ color: isActive ? 'white' : item.color }} />
                            <span>{item.label}</span>
                          </Link>

                          {/* Bouton pour ouvrir/fermer le dropdown */}
                          <button
                            onClick={() => toggleDropdown(index)}
                            className={clsx(
                              'px-3 py-3 rounded-xl transition-all duration-300 border-2',
                              isActive
                                ? 'text-white border-transparent shadow-lg'
                                : isDark
                                  ? 'text-gray-300 border-gray-700 hover:text-white hover:border-gray-600 hover:bg-gray-800'
                                  : 'text-gray-700 border-gray-200 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                            )}
                            style={{
                              background: isActive ? `linear-gradient(135deg, ${item.color}, ${item.color}cc)` : 'transparent'
                            }}
                            aria-expanded={activeDropdown === index}
                            aria-label={`${activeDropdown === index ? 'Fermer' : 'Ouvrir'} le menu ${item.label}`}
                          >
                            <ChevronDownIcon
                              className={clsx(
                                'w-5 h-5 transition-transform duration-300',
                                activeDropdown === index && 'rotate-180'
                              )}
                            />
                          </button>
                        </div>

                        {/* Liste des sous-pages */}
                        {activeDropdown === index && (
                          <div className="mt-3 ml-6 space-y-2">
                            {item.dropdownItems?.map((subItem, subIndex) => (
                              <Link
                                key={subIndex}
                                href={subItem.path}
                                className={clsx(
                                  'block px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium border',
                                  isDark
                                    ? 'text-gray-400 hover:text-white hover:bg-gray-800 border-gray-700'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-gray-200'
                                )}
                              >
                                {subItem.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        href={item.path}
                        className={clsx(
                          'flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 border-2',
                          'hover:scale-[1.02] transform',
                          isActive
                            ? 'text-white border-transparent shadow-lg'
                            : isDark
                              ? 'text-gray-300 border-gray-700 hover:text-white hover:border-gray-600 hover:bg-gray-800'
                              : 'text-gray-700 border-gray-200 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                        )}
                        style={{
                          background: isActive ? `linear-gradient(135deg, ${item.color}, ${item.color}cc)` : 'transparent'
                        }}
                      >
                        <Icon className="w-5 h-5"
                          style={{ color: isActive ? 'white' : item.color }} />
                        <span>{item.label}</span>
                      </Link>
                    )}
                  </div>
                );
              })}

              {/* Mobile Authentication Section */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                {hasMounted && (
                  user ? (
                    <div className="space-y-3">
                      <div className="flex items-center px-4 space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-green-600 p-0.5">
                          <div className={clsx(
                            "w-full h-full rounded-full flex items-center justify-center font-bold text-white",
                            isDark ? "bg-gray-900" : "bg-white text-gray-900"
                          )}>
                            U
                          </div>
                        </div>
                        <div>
                          <p className={clsx("font-semibold", isDark ? "text-white" : "text-gray-900")}>Mon Compte</p>
                          <p className={clsx("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>Connecté</p>
                        </div>
                      </div>
                      <Link
                        href="/admin"
                        className={clsx(
                          "flex items-center space-x-3 px-4 py-3 mx-2 rounded-xl transition-colors",
                          isDark ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-50 text-gray-700"
                        )}
                      >
                        <UserIcon className="w-5 h-5" />
                        <span>Tableau de bord</span>
                      </Link>
                      <button
                        onClick={logout}
                        className={clsx(
                          "w-full flex items-center space-x-3 px-4 py-3 mx-2 rounded-xl text-red-500 transition-colors",
                          isDark ? "hover:bg-gray-800" : "hover:bg-red-50"
                        )}
                      >
                        <LogOutIcon className="w-5 h-5" />
                        <span>Déconnexion</span>
                      </button>
                    </div>
                  ) : (
                    <div className="px-2">
                      <Link
                        href="/admin"
                        className="flex items-center justify-center w-full px-4 py-3 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all"
                        style={{
                          background: 'linear-gradient(135deg, #228b22 0%, #006400 100%)'
                        }}
                      >
                        <UserIcon className="w-5 h-5 mr-2" />
                        <span>Se connecter à l'espace membre</span>
                      </Link>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}