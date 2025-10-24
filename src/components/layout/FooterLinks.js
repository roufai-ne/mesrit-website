// components/layout/FooterLinks.js
import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function FooterLinks() {
  const menuLinks = {
    ministere: [
      { title: 'À propos', href: '/ministere' },
      { title: 'Organisation', href: '/ministere/organisation' },
      { title: 'Missions', href: '/ministere/missions' },
      { title: 'Historique', href: '/ministere/historique' },
    ],
    services: [
      { title: 'Établissements', href: '/etablissements' },
      { title: 'Services en ligne', href: '/services' },
      { title: 'Documentation', href: '/documentation' },
      { title: 'FAQ', href: '/faq' },
    ],
    ressources: [
      { title: 'Actualités', href: '/actualites' },
      { title: 'Contact', href: '/contact' },
      { title: 'Support', href: '/support' },
    ],
    legal: [
      { title: 'Mentions légales', href: '/mentions-legales' },
      { title: 'Politique de confidentialité', href: '/politique-confidentialite' },
      { title: 'Conditions d\'utilisation', href: '/conditions-utilisation' },
    ],
  };

  return (
    <div className="py-16">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Ministère */}
          <div>
            <h4 className="font-bold text-niger-green dark:text-niger-green-light mb-6 text-lg">
              Le Ministère
            </h4>
            <ul className="space-y-3">
              {menuLinks.ministere.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="group flex items-center text-readable dark:text-foreground hover:text-niger-orange dark:hover:text-niger-orange-light transition-all duration-300"
                  >
                    <ChevronRight className="w-4 h-4 mr-2 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {link.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold text-niger-green dark:text-niger-green-light mb-6 text-lg">
              Services
            </h4>
            <ul className="space-y-3">
              {menuLinks.services.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="group flex items-center text-readable dark:text-foreground hover:text-niger-orange dark:hover:text-niger-orange-light transition-all duration-300"
                  >
                    <ChevronRight className="w-4 h-4 mr-2 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {link.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ressources */}
          <div>
            <h4 className="font-bold text-niger-green dark:text-niger-green-light mb-6 text-lg">
              Ressources
            </h4>
            <ul className="space-y-3">
              {menuLinks.ressources.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="group flex items-center text-readable dark:text-foreground hover:text-niger-orange dark:hover:text-niger-orange-light transition-all duration-300"
                  >
                    <ChevronRight className="w-4 h-4 mr-2 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {link.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="font-bold text-niger-green dark:text-niger-green-light mb-6 text-lg">
              Informations légales
            </h4>
            <ul className="space-y-3">
              {menuLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="group flex items-center text-readable dark:text-foreground hover:text-niger-orange dark:hover:text-niger-orange-light transition-all duration-300"
                  >
                    <ChevronRight className="w-4 h-4 mr-2 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {link.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
