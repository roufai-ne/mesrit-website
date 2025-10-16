// src/pages/services-etudiants.js
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { 
  Users, 
  ChevronRight, 
  GraduationCap, 
  Heart,
  Home,
  Utensils,
  MapPin,
  CreditCard,
  BookOpen,
  Award,
  Shield,
  Clock,
  Phone,
  Mail
} from 'lucide-react';
import Link from 'next/link';

// Fonction utilitaire pour les couleurs
const getColorClasses = (color, variant = 'default') => {
  const colorMap = {
    'niger-orange': {
      default: 'bg-niger-orange text-white',
      light: 'bg-niger-orange-light text-niger-orange-dark',
      dark: 'bg-niger-orange-dark text-white'
    },
    'niger-green': {
      default: 'bg-niger-green text-white',
      light: 'bg-niger-green-light text-niger-green-dark',
      dark: 'bg-niger-green-dark text-white'
    },
    'blue': {
      default: 'bg-blue-600 text-white',
      light: 'bg-blue-100 text-blue-800',
      dark: 'bg-blue-800 text-white'
    },
    'green': {
      default: 'bg-emerald-600 text-white',
      light: 'bg-emerald-100 text-emerald-800',
      dark: 'bg-emerald-800 text-white'
    },
    'orange': {
      default: 'bg-orange-600 text-white',
      light: 'bg-orange-100 text-orange-800',
      dark: 'bg-orange-800 text-white'
    },
    'red': {
      default: 'bg-red-600 text-white',
      light: 'bg-red-100 text-red-800',
      dark: 'bg-red-800 text-white'
    },
    'purple': {
      default: 'bg-purple-600 text-white',
      light: 'bg-purple-100 text-purple-800',
      dark: 'bg-purple-800 text-white'
    }
  };
  
  return colorMap[color]?.[variant] || colorMap['niger-orange'].default;
};

export default function ServicesEtudiantsPage() {
  const [activeService, setActiveService] = useState('all');

  const services = [
    {
      id: 'bourses',
      title: 'Bourses et Aides Financières',
      description: 'Informations sur les bourses nationales et internationales disponibles',
      icon: Award,
      color: 'blue',
      details: [
        'Bourses d\'excellence académique',
        'Aides sociales pour étudiants en difficulté',
        'Bourses de mobilité internationale',
        'Prêts étudiants à taux préférentiel'
      ],
      contact: 'ANAB - Agence Nationale des Allocations et Bourses',
      phone: '+227 20 72 35 48',
      email: 'info@anab.ne'
    },
    {
      id: 'logement',
      title: 'Logement Universitaire',
      description: 'Hébergement dans les cités universitaires et logements privés',
      icon: Home,
      color: 'green',
      details: [
        'Cités universitaires publiques',
        'Résidences privées conventionnées',
        'Aide à la recherche de logement',
        'Médiation locataire-propriétaire'
      ],
      contact: 'CROU - Centre Régional des Œuvres Universitaires',
      phone: '+227 20 73 42 15',
      email: 'logement@crou.ne'
    },
    {
      id: 'restauration',
      title: 'Restauration Universitaire',
      description: 'Services de restauration dans les campus et restaurants universitaires',
      icon: Utensils,
      color: 'orange',
      details: [
        'Restaurants universitaires subventionnés',
        'Tickets restaurant à tarif étudiant',
        'Cafétérias sur les campus',
        'Services de catering pour événements'
      ],
      contact: 'CROU - Centre Régional des Œuvres Universitaires',
      phone: '+227 20 73 42 15',
      email: 'restauration@crou.ne'
    },
    {
      id: 'sante',
      title: 'Santé et Bien-être',
      description: 'Services médicaux et de bien-être pour les étudiants',
      icon: Heart,
      color: 'red',
      details: [
        'Centres de santé universitaires',
        'Consultations médicales gratuites',
        'Pharmacie universitaire',
        'Soutien psychologique et conseil'
      ],
      contact: 'Service de Santé Universitaire',
      phone: '+227 20 73 28 94',
      email: 'sante@mesrit.gov.ne'
    },
    {
      id: 'transport',
      title: 'Transport et Mobilité',
      description: 'Solutions de transport pour faciliter les déplacements étudiants',
      icon: MapPin,
      color: 'purple',
      details: [
        'Bus universitaires gratuits',
        'Réductions sur les transports publics',
        'Covoiturage étudiant organisé',
        'Stationnement vélos sécurisé'
      ],
      contact: 'Service des Transports Universitaires',
      phone: '+227 20 73 51 67',
      email: 'transport@mesrit.gov.ne'
    },
    {
      id: 'orientation',
      title: 'Orientation et Conseil',
      description: 'Accompagnement dans les choix d\'études et l\'insertion professionnelle',
      icon: BookOpen,
      color: 'teal',
      details: [
        'Conseil d\'orientation académique',
        'Aide à l\'insertion professionnelle',
        'Ateliers de développement personnel',
        'Mentorat par des anciens étudiants'
      ],
      contact: 'DOSCE - Direction de l\'Orientation et du Suivi du Cursus',
      phone: '+227 20 73 19 83',
      email: 'orientation@mesrit.gov.ne'
    }
  ];

  const etablissements = [
    {
      nom: 'CROU Niamey',
      services: ['Logement', 'Restauration', 'Activités culturelles'],
      adresse: 'Campus Universitaire de Niamey',
      telephone: '+227 20 73 42 15'
    },
    {
      nom: 'ANAB',
      services: ['Bourses nationales', 'Bourses internationales', 'Aides sociales'],
      adresse: 'Boulevard Mali Béro, Niamey',
      telephone: '+227 20 72 35 48'
    },
    {
      nom: 'Centre de Santé UAM',
      services: ['Consultations', 'Pharmacie', 'Urgences'],
      adresse: 'Université Abdou Moumouni',
      telephone: '+227 20 73 28 94'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      teal: 'bg-teal-100 text-teal-800 border-teal-200'
    };
    return colors[color] || colors.blue;
  };

  const filteredServices = activeService === 'all' ? services : services.filter(s => s.id === activeService);

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-niger-orange via-niger-orange-dark to-niger-green text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-niger-white/[0.05] bg-[size:20px_20px] opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="container mx-auto px-6 relative">
          <div className="flex items-center text-sm mb-4">
            <Link href="/" className="hover:text-niger-cream transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-niger-cream font-medium">Services aux Étudiants</span>
          </div>
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center mb-6">
                <Users className="w-12 h-12 mr-4 text-niger-cream" />
                <div>
                  <h1 className="text-5xl font-bold">Services aux Étudiants</h1>
                  <p className="text-niger-cream/80 text-lg mt-2">Accompagnement et Bien-être Étudiant</p>
                </div>
              </div>
              <p className="text-xl text-niger-cream max-w-3xl leading-relaxed mb-6">
                Découvrez tous les services disponibles pour accompagner les étudiants 
                dans leur parcours académique et leur bien-être au Niger avec un accompagnement personnalisé.
              </p>
              
              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-niger-cream">
                <div className="bg-niger-white/10 backdrop-blur-sm rounded-xl p-4 border border-niger-white/20">
                  <span className="text-3xl font-bold block">{services.length}</span>
                  <span className="text-sm opacity-90">Services</span>
                </div>
                <div className="bg-niger-white/10 backdrop-blur-sm rounded-xl p-4 border border-niger-white/20">
                  <span className="text-3xl font-bold block">{etablissements.length}</span>
                  <span className="text-sm opacity-90">Établissements</span>
                </div>
                <div className="bg-niger-white/10 backdrop-blur-sm rounded-xl p-4 border border-niger-white/20">
                  <span className="text-3xl font-bold block">24h/7j</span>
                  <span className="text-sm opacity-90">Assistance</span>
                </div>
                <div className="bg-niger-white/10 backdrop-blur-sm rounded-xl p-4 border border-niger-white/20">
                  <span className="text-3xl font-bold block">100%</span>
                  <span className="text-sm opacity-90">Gratuit</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="bg-gradient-to-b from-niger-cream to-white dark:from-secondary-900 dark:to-secondary-800 shadow-2xl relative -mt-12 rounded-2xl mx-auto container px-6 transition-colors duration-300">
        <div className="p-8">
          {/* Navigation des services */}
          <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg p-6 border border-niger-orange/10 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-niger-orange" />
              <h3 className="text-lg font-semibold text-niger-green dark:text-niger-green-light">Catégories de services</h3>
            </div>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => setActiveService('all')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                  activeService === 'all'
                    ? 'bg-gradient-to-r from-niger-orange to-niger-green text-white shadow-lg'
                    : 'bg-white dark:bg-secondary-700 hover:bg-niger-orange/10 dark:hover:bg-niger-orange/20 shadow-md border border-niger-orange/20 text-niger-green dark:text-niger-green-light'
                }`}
              >
                Tous les services
              </button>
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setActiveService(service.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                    activeService === service.id
                      ? 'bg-gradient-to-r from-niger-orange to-niger-green text-white shadow-lg'
                      : 'bg-white dark:bg-secondary-700 hover:bg-niger-orange/10 dark:hover:bg-niger-orange/20 shadow-md border border-niger-orange/20 text-niger-green dark:text-niger-green-light'
                  }`}
                >
                  {service.title}
                </button>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {filteredServices.map((service) => {
              const Icon = service.icon;
              return (
                <div key={service.id} className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-niger-orange/10 hover:border-niger-orange/30 transform hover:-translate-y-1 group p-6">
                  <div className="flex items-center mb-4">
                    <div className="relative w-16 h-16 bg-gradient-to-br from-niger-orange/10 to-niger-green/10 dark:from-niger-orange/20 dark:to-niger-green/20 rounded-xl flex-shrink-0 p-3 mr-4 border border-niger-orange/20 group-hover:scale-110 transition-all duration-300">
                      <Icon className="w-8 h-8 text-niger-orange" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-niger-green dark:text-niger-green-light group-hover:text-niger-orange dark:group-hover:text-niger-orange-light transition-colors">{service.title}</h3>
                      <p className="text-readable-muted dark:text-muted-foreground text-sm">{service.description}</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="font-medium text-niger-green dark:text-niger-green-light mb-3">Services proposés:</h4>
                    <ul className="space-y-2">
                      {service.details.map((detail, index) => (
                        <li key={index} className="flex items-start text-sm text-readable dark:text-foreground">
                          <div className="w-2 h-2 bg-niger-orange rounded-full mr-3 mt-2 flex-shrink-0"></div>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-niger-cream dark:bg-secondary-700 rounded-xl p-4 border border-niger-orange/10">
                    <div className="text-sm text-readable dark:text-foreground mb-3">
                      <strong className="text-niger-green dark:text-niger-green-light">Contact:</strong> {service.contact}
                    </div>
                    <div className="flex flex-col space-y-2 text-sm">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-niger-orange" />
                        <span className="text-readable-muted dark:text-muted-foreground">{service.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-niger-orange" />
                        <span className="text-readable-muted dark:text-muted-foreground">{service.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Établissements et contacts */}
          <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg border border-niger-orange/10 p-8 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="w-6 h-6 text-niger-orange" />
              <h2 className="text-2xl font-bold text-niger-green dark:text-niger-green-light">Établissements de services</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {etablissements.map((etablissement, index) => (
                <div key={index} className="bg-niger-cream dark:bg-secondary-700 rounded-xl p-6 border border-niger-orange/10 hover:border-niger-orange/30 transition-all duration-300 hover:shadow-lg">
                  <h3 className="font-bold text-lg text-niger-green dark:text-niger-green-light mb-3">{etablissement.nom}</h3>
                  <div className="mb-4">
                    <h4 className="font-medium text-sm text-niger-green dark:text-niger-green-light mb-2">Services:</h4>
                    <div className="flex flex-wrap gap-2">
                      {etablissement.services.map((service, idx) => (
                        <span key={idx} className="px-3 py-1 bg-niger-orange/20 text-niger-orange-dark border border-niger-orange/30 rounded-full text-xs font-medium">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-readable-muted dark:text-muted-foreground space-y-2">
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 mr-2 text-niger-orange mt-0.5 flex-shrink-0" />
                      <span>{etablissement.adresse}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-niger-orange flex-shrink-0" />
                      <span>{etablissement.telephone}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Informations pratiques */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg border border-niger-orange/10 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-6 h-6 text-niger-orange" />
                <h3 className="text-xl font-bold text-niger-green dark:text-niger-green-light">Horaires d'ouverture</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-3 bg-niger-cream dark:bg-secondary-700 rounded-xl">
                  <span className="text-readable dark:text-foreground">Lundi - Vendredi:</span>
                  <span className="font-medium text-niger-green dark:text-niger-green-light">8h00 - 17h00</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-niger-cream dark:bg-secondary-700 rounded-xl">
                  <span className="text-readable dark:text-foreground">Samedi:</span>
                  <span className="font-medium text-niger-green dark:text-niger-green-light">8h00 - 12h00</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-niger-cream dark:bg-secondary-700 rounded-xl">
                  <span className="text-readable dark:text-foreground">Dimanche:</span>
                  <span className="font-medium text-red-600">Fermé</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg border border-niger-orange/10 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-6 h-6 text-niger-orange" />
                <h3 className="text-xl font-bold text-niger-green dark:text-niger-green-light">Urgences</h3>
              </div>
              <div className="space-y-4 text-sm">
                <div className="p-3 bg-niger-cream dark:bg-secondary-700 rounded-xl">
                  <strong className="text-niger-green dark:text-niger-green-light">Urgences médicales:</strong><br />
                  <span className="text-readable-muted dark:text-muted-foreground">Centre de Santé UAM: +227 20 73 28 94</span>
                </div>
                <div className="p-3 bg-niger-cream dark:bg-secondary-700 rounded-xl">
                  <strong className="text-niger-green dark:text-niger-green-light">Assistance 24h/24:</strong><br />
                  <span className="text-readable-muted dark:text-muted-foreground">Numéro d'urgence: +227 20 72 29 42</span>
                </div>
                <div className="p-3 bg-niger-cream dark:bg-secondary-700 rounded-xl">
                  <strong className="text-niger-green dark:text-niger-green-light">Sécurité campus:</strong><br />
                  <span className="text-readable-muted dark:text-muted-foreground">Gardiennage: +227 96 85 43 21</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ressources utiles */}
          <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg border border-niger-orange/10 p-8">
            <div className="flex items-center gap-2 mb-8 justify-center">
              <BookOpen className="w-6 h-6 text-niger-orange" />
              <h2 className="text-2xl font-bold text-niger-green dark:text-niger-green-light">Ressources utiles</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="relative w-20 h-20 bg-gradient-to-br from-niger-orange/10 to-niger-green/10 dark:from-niger-orange/20 dark:to-niger-green/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-niger-orange/20 group-hover:scale-110 transition-all duration-300">
                  <BookOpen className="w-10 h-10 text-niger-orange" />
                </div>
                <h3 className="font-bold text-niger-green dark:text-niger-green-light mb-3 group-hover:text-niger-orange transition-colors">Guides et Documentation</h3>
                <p className="text-readable-muted dark:text-muted-foreground mb-4 text-sm leading-relaxed">
                  Consultez nos guides pour étudiants et la documentation officielle
                </p>
                <Link
                  href="/documentation/guides"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-niger-orange/20 to-niger-green/20 text-niger-orange hover:from-niger-orange hover:to-niger-green hover:text-white rounded-xl transition-all duration-300 font-medium"
                >
                  Voir les guides →
                </Link>
              </div>
              <div className="text-center group">
                <div className="relative w-20 h-20 bg-gradient-to-br from-niger-orange/10 to-niger-green/10 dark:from-niger-orange/20 dark:to-niger-green/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-niger-orange/20 group-hover:scale-110 transition-all duration-300">
                  <CreditCard className="w-10 h-10 text-niger-orange" />
                </div>
                <h3 className="font-bold text-niger-green dark:text-niger-green-light mb-3 group-hover:text-niger-orange transition-colors">Formulaires en ligne</h3>
                <p className="text-readable-muted dark:text-muted-foreground mb-4 text-sm leading-relaxed">
                  Téléchargez et soumettez vos demandes en ligne
                </p>
                <Link
                  href="/documentation"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-niger-orange/20 to-niger-green/20 text-niger-orange hover:from-niger-orange hover:to-niger-green hover:text-white rounded-xl transition-all duration-300 font-medium"
                >
                  Accéder aux formulaires →
                </Link>
              </div>
              <div className="text-center group">
                <div className="relative w-20 h-20 bg-gradient-to-br from-niger-orange/10 to-niger-green/10 dark:from-niger-orange/20 dark:to-niger-green/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-niger-orange/20 group-hover:scale-110 transition-all duration-300">
                  <Users className="w-10 h-10 text-niger-orange" />
                </div>
                <h3 className="font-bold text-niger-green dark:text-niger-green-light mb-3 group-hover:text-niger-orange transition-colors">Support personnalisé</h3>
                <p className="text-readable-muted dark:text-muted-foreground mb-4 text-sm leading-relaxed">
                  Contactez notre équipe pour une assistance adaptée à vos besoins
                </p>
                <Link
                  href="/support"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-niger-orange/20 to-niger-green/20 text-niger-orange hover:from-niger-orange hover:to-niger-green hover:text-white rounded-xl transition-all duration-300 font-medium"
                >
                  Contacter le support →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}