// src/components/layout/Footer.js
import React from 'react';
import Link from 'next/link';
import { 
  MapPinIcon, 
  PhoneIcon, 
  MailIcon, 
  FacebookIcon, 
  TwitterIcon, 
  LinkedinIcon, 
  ChevronRightIcon 
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

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-blue-900 text-gray-300">
      <div className="container mx-auto py-16 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-white font-bold text-xl relative pb-4 before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-12 before:h-1 before:bg-blue-500">
              Contact
            </h3>
            <div className="space-y-4">
              <a href="#" className="flex items-start space-x-3 group">
                <MapPinIcon className="w-5 h-5 mt-1 text-blue-400 group-hover:text-blue-300 transition-colors" />
                <p className="group-hover:text-white transition-colors">Niamey, Niger</p>
              </a>
              <a href="tel:+227XXXXXXXX" className="flex items-start space-x-3 group">
                <PhoneIcon className="w-5 h-5 mt-1 text-blue-400 group-hover:text-blue-300 transition-colors" />
                <p className="group-hover:text-white transition-colors">+227 XX XX XX XX</p>
              </a>
              <a href="mailto:contact@mesrit.ne" className="flex items-start space-x-3 group">
                <MailIcon className="w-5 h-5 mt-1 text-blue-400 group-hover:text-blue-300 transition-colors" />
                <p className="group-hover:text-white transition-colors">contact@mesrit.ne</p>
              </a>
            </div>
          </div>

          {/* Ministry Links */}
          <div className="space-y-6">
            <h3 className="text-white font-bold text-xl relative pb-4 before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-12 before:h-1 before:bg-blue-500">
              Le Ministère
            </h3>
            <ul className="space-y-3">
              {menuLinks.ministere.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    className="group flex items-center hover:text-white transition-all duration-300"
                  >
                    <ChevronRightIcon className="w-4 h-4 mr-2 transform group-hover:translate-x-1 transition-transform" />
                    <span className="border-b border-transparent group-hover:border-white">
                      {link.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div className="space-y-6">
            <h3 className="text-white font-bold text-xl relative pb-4 before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-12 before:h-1 before:bg-blue-500">
              Services
            </h3>
            <ul className="space-y-3">
              {menuLinks.services.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    className="group flex items-center hover:text-white transition-all duration-300"
                  >
                    <ChevronRightIcon className="w-4 h-4 mr-2 transform group-hover:translate-x-1 transition-transform" />
                    <span className="border-b border-transparent group-hover:border-white">
                      {link.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div className="space-y-6">
            <h3 className="text-white font-bold text-xl relative pb-4 before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-12 before:h-1 before:bg-blue-500">
              Ressources
            </h3>
            <ul className="space-y-3">
              {menuLinks.ressources.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    className="group flex items-center hover:text-white transition-all duration-300"
                  >
                    <ChevronRightIcon className="w-4 h-4 mr-2 transform group-hover:translate-x-1 transition-transform" />
                    <span className="border-b border-transparent group-hover:border-white">
                      {link.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} MESRIT. Tous droits réservés.
          </div>
          <div className="flex space-x-4">
            {[
              { icon: FacebookIcon, href: '#' },
              { icon: TwitterIcon, href: '#' },
              { icon: LinkedinIcon, href: '#' }
            ].map((social, index) => {
              const Icon = social.icon;
              return (
                <a 
                  key={index}
                  href={social.href}
                  className="p-2 hover:text-white transition-all duration-300 hover:bg-blue-800/30 rounded-lg"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}