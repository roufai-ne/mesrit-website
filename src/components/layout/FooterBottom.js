// components/layout/FooterBottom.js
import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Facebook, Twitter, Linkedin, ExternalLink } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

export default function FooterBottom() {
  const { settings } = useSettings();

  const socialLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: settings?.social?.facebook || 'https://facebook.com',
      color: 'hover:text-blue-500'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: settings?.social?.twitter || 'https://twitter.com',
      color: 'hover:text-sky-400'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: settings?.social?.linkedin || 'https://linkedin.com',
      color: 'hover:text-blue-600'
    }
  ];

  return (
    <div className="border-t border-niger-orange/10 dark:border-niger-orange/20 py-8">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-bold text-niger-green dark:text-niger-green-light text-lg mb-4">
              Contactez-nous
            </h4>
            <div className="flex items-start gap-3 text-readable-muted dark:text-muted-foreground group">
              <MapPin className="w-5 h-5 mt-1 flex-shrink-0 text-niger-orange group-hover:scale-110 transition-transform" />
              <span className="text-sm leading-relaxed">
                {settings?.contact?.address || 'Niamey, Niger'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-readable-muted dark:text-muted-foreground group">
              <Phone className="w-5 h-5 flex-shrink-0 text-niger-orange group-hover:scale-110 transition-transform" />
              <a
                href={`tel:${settings?.contact?.phone}`}
                className="text-sm hover:text-niger-orange dark:hover:text-niger-orange-light transition-colors"
              >
                {settings?.contact?.phone || '+227 XX XX XX XX'}
              </a>
            </div>
            <div className="flex items-center gap-3 text-readable-muted dark:text-muted-foreground group">
              <Mail className="w-5 h-5 flex-shrink-0 text-niger-orange group-hover:scale-110 transition-transform" />
              <a
                href={`mailto:${settings?.contact?.email}`}
                className="text-sm hover:text-niger-orange dark:hover:text-niger-orange-light transition-colors"
              >
                {settings?.contact?.email || 'contact@mesrit.gov.ne'}
              </a>
            </div>
          </div>

          {/* Horaires */}
          <div className="space-y-4">
            <h4 className="font-bold text-niger-green dark:text-niger-green-light text-lg mb-4">
              Horaires d'ouverture
            </h4>
            <div className="space-y-2 text-readable-muted dark:text-muted-foreground text-sm">
              <div className="flex justify-between items-center py-2 border-b border-niger-orange/10 dark:border-niger-orange/20">
                <span className="font-medium">Lundi - Jeudi</span>
                <span>08:00 - 17:30</span>
               </div>
              <div className="flex justify-between items-center py-2 border-b border-niger-orange/10 dark:border-niger-orange/20">
                <span className="font-medium">Vendredi</span>
                <span>08:00 - 12:00</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-medium">Samedi - Dimanche</span>
                <span className="text-readable-muted/60 dark:text-muted-foreground/60">Fermé</span>
              </div>
            </div>
          </div>

          {/* Réseaux Sociaux */}
          <div className="space-y-4">
            <h4 className="font-bold text-niger-green dark:text-niger-green-light text-lg mb-4">
              Suivez-nous
            </h4>
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-12 h-12 rounded-full bg-niger-cream/10 dark:bg-secondary-700 flex items-center justify-center text-readable dark:text-foreground ${social.color} transition-all duration-300 hover:scale-110 hover:shadow-lg`}
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
            <div className="pt-4">
              <Link
                href="/sitemap"
                className="inline-flex items-center gap-2 text-sm text-niger-orange hover:text-niger-orange-dark dark:text-niger-orange-light dark:hover:text-niger-orange transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Plan du site
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-niger-orange/10 dark:border-niger-orange/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-readable-muted dark:text-muted-foreground">
            <p>
              © {new Date().getFullYear()} {settings?.site?.name || 'MESRIT'}. Tous droits réservés.
            </p>
            <p className="text-xs opacity-75">
              Développé avec ❤️ pour l'éducation au Niger
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
