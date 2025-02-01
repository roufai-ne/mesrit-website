/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/layout/Footer.js
import React, { useState } from 'react';
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
import { toast } from 'react-hot-toast';

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
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email || !email.trim()) {
      toast.error('Veuillez entrer un email valide');
      return;
    }
  
    setStatus('loading');
    
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        toast.error(data.error);
        setStatus('error');
        return;
      }
  
      toast.success(data.message || 'Inscription réussie !');
      setStatus('success');
      setEmail('');
    } catch (error) {
      toast.error('Une erreur est survenue');
      setStatus('error');
    }
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
        <div className="py-8 border-t border-gray-800">
          <div className="max-w-md">
            <h3 className="text-xl font-semibold mb-4">Newsletter</h3>
            <p className="text-gray-400 mb-4">
              Restez informé des dernières actualités du ministère
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre email"
                className="flex-1 px-4 py-2 bg-gray-800 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
                required
              />
              <button 
                type="submit"
                disabled={status === 'loading'}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  status === 'loading' 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {status === 'loading' ? 'Envoi...' : 'S\'abonner'}
              </button>
            </form>
          </div>
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
    </footer>
  );
}
      