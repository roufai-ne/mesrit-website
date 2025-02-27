/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Twitter, 
  Linkedin,
  ChevronRight,
  Send 
} from 'lucide-react';

export default function Footer() {
  const menuLinks = {
    ministere: [
      { title: 'À propos', href: '/ministere' },
      { title: 'Organisation', href: '/ministere/organisation' },
      { title: 'Missions', href: '/ministere/missions' },
      { title: 'Direction', href: '/ministere/direction' }
    ],
    services: [
      { title: 'ANAB', href: 'https://anab.ne' },
      { title: 'OBEECS', href: 'https://www.obeecsniger.com/' },
      { title: 'ANAQ-SUP', href: 'https://anaq-sup.ne' }
    ],
    ressources: [
      { title: 'Documentation', href: '/documentation' },
      { title: 'Actualités', href: '/actualites' },
      { title: 'FAQ', href: '/faq' },
      { title: 'Contact', href: '/contact' }
    ]
  };

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubscribe = async (e) => {
    // ... logique existante
  };

  return (
    <footer className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 text-white">
    {/* Overlay pattern et glassmorphism */}
    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:3rem_3rem]" />
    <div className="absolute inset-0 bg-gradient-to-b from-blue-900/50 to-blue-950/50 backdrop-blur-sm" />
  
    <div className="relative container mx-auto px-6 py-16">
      {/* Newsletter Section */}
      <div className="max-w-2xl mx-auto mb-16">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8">
          <h3 className="text-xl font-bold mb-2">Newsletter</h3>
          <p className="text-gray-300 mb-6">
            Restez informé des dernières actualités du ministère
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre email"
              className="flex-1 px-4 py-2 bg-white/10 rounded-lg border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:bg-white/20 transition-all"
              required
            />
            <button 
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-2 bg-blue-700 hover:bg-blue-600 rounded-lg transition-colors"
            >
              {status === 'loading' ? 'Envoi...' : 'S\'abonner'}
            </button>
          </form>
        </div>
      </div>
  
      {/* Grid des liens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Section Contact */}
        <div className="space-y-6">
          <h4 className="text-lg font-semibold relative pb-2 before:absolute before:bottom-0 before:left-0 before:w-12 before:h-0.5 before:bg-blue-500">
            Contact
          </h4>
          <div className="space-y-4">
            {[
              { icon: MapPin, text: 'Niamey, Niger' },
              { icon: Phone, text: '+227 XX XX XX XX' },
              { icon: Mail, text: 'contact@mesrit.ne' }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <a 
                  key={index}
                  href="#" 
                  className="flex items-center space-x-3 group"
                >
                  <div className="p-2 bg-white/5 group-hover:bg-white/10 rounded-lg transition-colors">
                    <Icon className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                  </div>
                  <span className="text-gray-300 group-hover:text-white transition-colors">
                    {item.text}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
  
        {/* Sections des liens */}
        {Object.entries(menuLinks).map(([key, links]) => (
          <div key={key} className="space-y-6">
            <h4 className="text-lg font-semibold relative pb-2 before:absolute before:bottom-0 before:left-0 before:w-12 before:h-0.5 before:bg-blue-500">
              {key === 'ministere' ? 'Le Ministère' :
               key === 'services' ? 'Services' : 'Ressources'}
            </h4>
            <ul className="space-y-3">
              {links.map((link, idx) => (
                <li key={idx}>
                  <Link 
                    href={link.href}
                    className="group flex items-center text-gray-300 hover:text-white transition-all duration-300"
                  >
                    <ChevronRight className="w-4 h-4 mr-2 transform group-hover:translate-x-1 transition-transform text-blue-400 group-hover:text-blue-300" />
                    <span className="border-b border-transparent group-hover:border-white/30">
                      {link.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
  
      {/* Footer bas */}
      <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} MESRIT. Tous droits réservés.
        </p>
        <div className="flex gap-4">
          {[
            { icon: Facebook, href: '#' },
            { icon: Twitter, href: '#' },
            { icon: Linkedin, href: '#' }
          ].map((social, index) => {
            const Icon = social.icon;
            return (
              <a 
                key={index}
                href={social.href}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  </footer>
  );
}