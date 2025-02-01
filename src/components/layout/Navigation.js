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
    { 
      label: 'Accueil', 
      path: '/', 
      icon: HomeIcon,
      iconColor: 'text-emerald-500 group-hover:text-emerald-600'
    },
    { 
      label: 'Le Ministère', 
      path: '/ministere', 
      icon: Building2Icon,
      iconColor: 'text-blue-500 group-hover:text-blue-600'
    },
    { 
      label: 'Établissements', 
      path: '/etablissements', 
      icon: GraduationCapIcon,
      iconColor: 'text-purple-500 group-hover:text-purple-600'
    },
    { 
      label: 'Documentation', 
      path: '/documentation', 
      icon: BookOpenIcon,
      iconColor: 'text-amber-500 group-hover:text-amber-600'
    },
    { 
      label: 'Actualités', 
      path: '/actualites', 
      icon: NewspaperIcon,
      iconColor: 'text-rose-500 group-hover:text-rose-600'
    },
    { 
      label: 'Contact', 
      path: '/contact', 
      icon: MessageCircleIcon,
      iconColor: 'text-cyan-500 group-hover:text-cyan-600'
    }
  ];

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-20">
      <div className="container mx-auto px-6">
        <ul className="flex flex-wrap">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = router.pathname === item.path;
            
            return (
              <li key={index}>
                <Link 
                  href={item.path}
                  className={`
                    flex items-center space-x-2 px-6 py-5 font-medium
                    group relative transition-all duration-200
                    ${isActive 
                      ? 'text-gray-900 bg-gray-50/80' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/50'}
                  `}
                >
                  {/* Indicator line */}
                  <div className={`
                    absolute bottom-0 left-0 right-0 h-0.5
                    transition-all duration-200 ease-out
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 opacity-100' 
                      : 'opacity-0 group-hover:opacity-100 bg-gray-200'}
                  `} />
                  
                  {/* Icon */}
                  <div className="relative">
                    <Icon className={`
                      w-5 h-5 transition-all duration-200
                      ${isActive ? item.iconColor : 'text-gray-400 ' + item.iconColor}
                      group-hover:scale-110
                    `} />
                    
                    {/* Subtle glow effect */}
                    <div className={`
                      absolute inset-0 rounded-full blur-sm -z-10 transition-opacity
                      ${isActive ? 'opacity-20' : 'opacity-0'}
                      ${item.iconColor.split(' ')[0]}
                    `} />
                  </div>

                  {/* Label */}
                  <span className="relative">
                    {item.label}
                    {/* Underline effect */}
                    <span className={`
                      absolute bottom-0 left-0 w-0 h-px
                      transition-all duration-200
                      ${item.iconColor.split(' ')[0].replace('text-', 'bg-')}
                      group-hover:w-full
                    `} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}