import React from 'react';
import { ExternalLink, GraduationCap, Award, FileCheck, ArrowRight } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { clsx } from 'clsx';

export default function ExternalServices() {
  const { settings } = useSettings();
  const { isDark } = useTheme();

  const services = [
    {
      title: "ANAB",
      description: "Agence Nationale des Allocations et Bourses",
      longDesc: "Gérez vos demandes de bourses et suivez leur état d'avancement",
      url: settings.external.anab,
      icon: <Award className="w-8 h-8" />,
      color: "blue"
    },
    {
      title: "OBEECS",
      description: "Office du Baccalauréat et des Examens et Concours du Supérieur",
      longDesc: "Consultez les résultats et informations sur le baccalauréat et le BTS",
      url: settings.external.bac,
      icon: <GraduationCap className="w-8 h-8" />,
      color: "green"
    },
    {
      title: "ANAQ-SUP",
      description: "Agence Nationale d'Assurance Qualité de l'Enseignement Supérieur",
      longDesc: "Evaluation et accréditation des établissements et des programmes",
      url: settings.external.bts,
      icon: <FileCheck className="w-8 h-8" />,
      color: "purple"
    }
  ];

  const getColorClasses = (color) => {
    if (isDark) {
      const colors = {
        blue: "bg-niger-green-glass/30 border-niger-green/40 hover:border-niger-green/60 text-niger-green-light",
        green: "bg-niger-orange-glass/30 border-niger-orange/40 hover:border-niger-orange/60 text-niger-orange-light",
        purple: "bg-niger-green-glass/30 border-niger-green/40 hover:border-niger-green/60 text-niger-green-light"
      };
      return colors[color];
    } else {
      const colors = {
        blue: "bg-white border-gray-200 hover:border-niger-green/40 text-niger-green",
        green: "bg-white border-gray-200 hover:border-niger-orange/40 text-niger-orange",
        purple: "bg-white border-gray-200 hover:border-niger-green/40 text-niger-green"
      };
      return colors[color];
    }
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-16">
          <h2 className={clsx(
            'text-4xl font-bold mb-4',
            isDark ? 'text-white' : 'text-gray-900'
          )}>Services Externes</h2>
          <p className={clsx(
            'text-lg max-w-3xl mx-auto',
            isDark ? 'text-white/90' : 'text-gray-600'
          )}>
            Accédez rapidement aux services et plateformes externes du ministère
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className={clsx(
                'group relative p-6 rounded-2xl border transition-all duration-300 transform hover:-translate-y-2 backdrop-blur-md',
                isDark 
                  ? 'bg-niger-white-glass/50 border-white/20 hover:border-white/40 hover:shadow-glass' 
                  : 'bg-white border-gray-200 hover:border-niger-orange/30 hover:shadow-lg shadow-md'
              )}
            >
              <div className={clsx(
                'p-3 rounded-xl w-fit mb-4 border',
                isDark 
                  ? 'bg-niger-white-glass/50 border-white/20 shadow-glass' 
                  : 'bg-gray-50 border-gray-200 shadow-sm'
              )}>
                {React.cloneElement(service.icon, {
                  className: clsx(
                    'w-8 h-8',
                    isDark ? 'text-white' : 'text-niger-green'
                  )
                })}
              </div>
              
              <h3 className={clsx(
                'text-xl font-bold mb-2',
                isDark ? 'text-white' : 'text-gray-900'
              )}>{service.title}</h3>
              <p className={clsx(
                'text-sm mb-2',
                isDark ? 'text-white/80' : 'text-gray-600'
              )}>{service.description}</p>
              <p className={clsx(
                'mb-6 flex-grow',
                isDark ? 'text-white/90' : 'text-gray-700'
              )}>{service.longDesc}</p>
              
              <div className="flex items-center justify-between">
                <span className={clsx(
                  'text-xs px-2 py-1 rounded-full',
                  isDark 
                    ? 'text-white/60 bg-white/10' 
                    : 'text-gray-500 bg-gray-100'
                )}>
                  Service
                </span>
                
                <a
                  href={service.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={clsx(
                    'inline-flex items-center font-medium text-sm group-hover:underline',
                    isDark 
                      ? 'text-niger-orange hover:text-niger-orange-light' 
                      : 'text-niger-orange hover:text-niger-orange-dark'
                  )}
                >
                  Accéder
                  <ExternalLink className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}