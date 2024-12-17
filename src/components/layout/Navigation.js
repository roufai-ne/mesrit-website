// src/components/layout/Navigation.js
import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  HomeIcon, 
  Building2Icon, 
  GraduationCapIcon, 
  BookOpenIcon, 
  NewspaperIcon, 
  MessageCircleIcon 
} from 'lucide-react';

export default function Navigation() {
  const router = useRouter();
  
  const menuItems = [
    { label: 'Accueil', path: '/', icon: HomeIcon },
    { label: 'Le Ministère', path: '/ministere', icon: Building2Icon },
    { label: 'Établissements', path: '/etablissements', icon: GraduationCapIcon },
    { label: 'Documentation', path: '/documentation', icon: BookOpenIcon },
    { label: 'Actualités', path: '/actualites', icon: NewspaperIcon },
    { label: 'Contact', path: '/contact', icon: MessageCircleIcon }
  ];

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <ul className="flex flex-wrap">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <li key={index}>
                <Link 
                  href={item.path}
                  className={`flex items-center space-x-2 px-6 py-5 font-medium group transition-all duration-200
                    ${router.pathname === item.path 
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`}
                >
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 
                    ${router.pathname === item.path ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}`} 
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}