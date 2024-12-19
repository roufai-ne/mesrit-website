// src/pages/ministere/index.js
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { 
  Users, 
  Building, 
  Target, 
  ChevronRight, 
  ExternalLink,
  Mail,
  Clock,
  Calendar,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import StatsSection from './StatsSection';

export default function MinisterePage() {
  const sections = [
    {
      title: "Notre Mission",
      icon: Target,
      content: "Promouvoir l'excellence dans l'enseignement supérieur et la recherche au Niger par des programmes innovants et une vision stratégique claire pour l'avenir de l'éducation.",
      link: "/ministere/missions",
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: "Organisation",
      icon: Building,
      content: "Découvrez notre structure organisationnelle, nos différentes directions et services, et comment nous travaillons ensemble pour atteindre nos objectifs.",
      link: "/ministere/organisation",
      color: "bg-purple-50 text-purple-600"
    },
    {
      title: "Direction",
      icon: Users,
      content: "Notre équipe de direction, composée d'experts dévoués, guide le ministère vers l'excellence et l'innovation dans l'enseignement supérieur.",
      link: "/ministere/direction",
      color: "bg-emerald-50 text-emerald-600"
    }
  ];

  const quickLinks = [
    {
      title: "Nous contacter",
      icon: Mail,
      link: "/contact",
      description: "Pour toute question ou demande d'information"
    },
    {
      title: "Documentation",
      icon: BookOpen,
      link: "/documentation",
      description: "Accédez à nos ressources et publications"
    },
    {
      title: "Établissements",
      icon: GraduationCap,
      link: "/etablissements",
      description: "Explorer nos institutions d'enseignement"
    }
  ];


  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-900 to-blue-800 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="flex items-center text-sm mb-4">
            <Link href="/" className="hover:text-blue-200 transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span>Le Ministère</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Le Ministère de l'Enseignement Supérieur
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Au service de l'excellence académique et de l'innovation pour construire 
            l'avenir de l'enseignement supérieur au Niger.
          </p>

          {/* Stats */}
          <div >
          <StatsSection />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          {/* Sections principales */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <Link 
                  href={section.link} 
                  key={index}
                  className="group"
                >
                  <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 h-full transform hover:-translate-y-1">
                    <div className={`inline-flex rounded-lg p-3 ${section.color} mb-6`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4 group-hover:text-blue-600 transition-colors">
                      {section.title}
                    </h2>
                    <p className="text-gray-600 mb-6 line-clamp-3">
                      {section.content}
                    </p>
                    <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                      <span>En savoir plus</span>
                      <ChevronRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Liens rapides */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-8">Liens rapides</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {quickLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <Link 
                    key={index}
                    href={link.link} 
                    className="group flex items-start p-6 rounded-xl hover:bg-gray-50 transition-all duration-300"
                  >
                    <div className="bg-blue-50 rounded-lg p-3 mr-4">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-2 group-hover:text-blue-600 transition-colors">
                        {link.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {link.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}