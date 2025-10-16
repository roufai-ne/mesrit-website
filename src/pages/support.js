// src/pages/support.js
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { 
  HelpCircle, 
  ChevronRight, 
  Mail, 
  Phone, 
  MessageCircle,
  Book,
  FileText,
  Users,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function SupportPage() {
  const [selectedCategory, setSelectedCategory] = useState('general');

  const supportCategories = [
    {
      id: 'general',
      title: 'Questions Générales',
      description: 'Informations générales sur le ministère et ses services',
      icon: HelpCircle,
      color: 'blue'
    },
    {
      id: 'students',
      title: 'Support Étudiants',
      description: 'Aide aux étudiants et procédures académiques',
      icon: Users,
      color: 'green'
    },
    {
      id: 'technical',
      title: 'Support Technique',
      description: 'Assistance technique et problèmes informatiques',
      icon: FileText,
      color: 'purple'
    },
    {
      id: 'documents',
      title: 'Documents & Formulaires',
      description: 'Aide pour les documents et démarches administratives',
      icon: Book,
      color: 'orange'
    }
  ];

  const contactMethods = [
    {
      title: 'Email',
      description: 'Contactez-nous par email pour toute question',
      icon: Mail,
      contact: 'support@mesrit.gov.ne',
      responseTime: '24-48 heures',
      color: 'blue'
    },
    {
      title: 'Téléphone',
      description: 'Appelez-nous directement pour une assistance immédiate',
      icon: Phone,
      contact: '+227 20 72 29 42',
      responseTime: 'Immédiat',
      color: 'green'
    },
    {
      title: 'Chat en Ligne',
      description: 'Discutez avec notre équipe de support',
      icon: MessageCircle,
      contact: 'Disponible sur le site',
      responseTime: '5-10 minutes',
      color: 'purple'
    }
  ];

  const faqQuestions = {
    general: [
      {
        question: 'Comment contacter le ministère ?',
        answer: 'Vous pouvez nous contacter par email à contact@mesrit.gov.ne, par téléphone au +227 20 72 29 42, ou en visitant nos bureaux à Niamey.'
      },
      {
        question: 'Quels sont les horaires d\'ouverture ?',
        answer: 'Nos bureaux sont ouverts du lundi au vendredi de 8h00 à 17h00. Le service client est disponible de 8h30 à 16h30.'
      },
      {
        question: 'Où se trouvent vos bureaux ?',
        answer: 'Le siège du ministère se trouve au Boulevard Mali Béro, Niamey, Niger. Nous avons également des représentations dans toutes les régions.'
      }
    ],
    students: [
      {
        question: 'Comment faire une demande de bourse ?',
        answer: 'Les demandes de bourses se font via l\'ANAB (Agence Nigérienne des Allocations et des Bourses). Consultez leur site web ou visitez leurs bureaux.'
      },
      {
        question: 'Comment s\'inscrire à l\'université ?',
        answer: 'Les inscriptions se font directement auprès des universités. Consultez notre section établissements pour les contacts des différentes universités.'
      },
      {
        question: 'Où trouver les résultats du baccalauréat ?',
        answer: 'Les résultats du baccalauréat sont publiés sur le site de l\'OBEECS. Vous pouvez également les consulter dans les centres d\'examen.'
      }
    ],
    technical: [
      {
        question: 'Problème de connexion au site ?',
        answer: 'Vérifiez votre connexion internet et réessayez. Si le problème persiste, contactez notre support technique.'
      },
      {
        question: 'Comment télécharger les documents ?',
        answer: 'Cliquez sur le bouton de téléchargement à côté du document. Assurez-vous d\'avoir un lecteur PDF installé.'
      },
      {
        question: 'Le formulaire ne fonctionne pas ?',
        answer: 'Vérifiez que tous les champs obligatoires sont remplis. Utilisez un navigateur récent comme Chrome, Firefox ou Safari.'
      }
    ],
    documents: [
      {
        question: 'Où trouver les formulaires officiels ?',
        answer: 'Tous les formulaires sont disponibles dans la section Documentation de notre site web.'
      },
      {
        question: 'Comment authentifier un diplôme ?',
        answer: 'Contactez le service de l\'authentification de l\'université qui a délivré le diplôme ou l\'ANAQ-SUP pour les procédures.'
      },
      {
        question: 'Délai de traitement des dossiers ?',
        answer: 'Les délais varient selon le type de dossier. Généralement entre 15 à 30 jours ouvrables pour les demandes complètes.'
      }
    ]
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[color] || colors.blue;
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-niger-green to-niger-orange text-white py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-center text-sm mb-4">
            <Link href="/" className="hover:text-niger-orange-light transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span>Support</span>
          </div>
          
          <div className="flex items-center mb-6">
            <HelpCircle className="w-10 h-10 mr-4" />
            <h1 className="text-4xl font-bold">Centre de Support</h1>
          </div>
          
          <p className="text-xl text-white/90 max-w-3xl">
            Nous sommes là pour vous aider. Trouvez rapidement des réponses à vos questions 
            ou contactez notre équipe de support pour une assistance personnalisée.
          </p>
        </div>
      </div>

      <div className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-6">
          {/* Méthodes de contact */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-8">Comment nous contacter</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {contactMethods.map((method, index) => {
                const Icon = method.icon;
                return (
                                  <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 text-center hover:shadow-xl transition-all duration-300">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${getColorClasses(method.color)}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{method.title}</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">{method.description}</p>
                  <div className="text-niger-orange font-medium mb-2">{method.contact}</div>
                  <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4 mr-1" />
                    {method.responseTime}
                  </div>
                </div>
                );
              })}
            </div>
          </div>

          {/* Catégories de support */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-center mb-8">Choisissez votre catégorie</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {supportCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`p-4 rounded-xl transition-all text-center ${
                      selectedCategory === category.id
                        ? 'bg-niger-orange text-white shadow-lg'
                        : 'bg-white dark:bg-gray-800 hover:bg-niger-orange/10 dark:hover:bg-niger-orange/20 shadow border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex justify-center mb-3">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-sm mb-1">{category.title}</h3>
                    <p className="text-xs opacity-90">{category.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Questions fréquentes par catégorie */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Questions fréquentes - {supportCategories.find(cat => cat.id === selectedCategory)?.title}
            </h2>
            <div className="space-y-4">
              {faqQuestions[selectedCategory]?.map((faq, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                    <CheckCircle className="w-5 h-5 text-niger-orange mr-2" />
                    {faq.question}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 ml-7">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ressources utiles */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Book className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-xl font-bold">Documentation</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Consultez notre documentation complète pour trouver des guides détaillés.
              </p>
              <Link
                href="/documentation"
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                Voir la documentation <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <HelpCircle className="w-6 h-6 text-green-600 mr-3" />
                <h3 className="text-xl font-bold">FAQ</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Trouvez rapidement des réponses dans notre foire aux questions.
              </p>
              <Link
                href="/faq"
                className="text-green-600 hover:text-green-800 font-medium flex items-center"
              >
                Consulter la FAQ <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Mail className="w-6 h-6 text-purple-600 mr-3" />
                <h3 className="text-xl font-bold">Contact Direct</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Contactez-nous directement pour toute question spécifique.
              </p>
              <Link
                href="/contact"
                className="text-purple-600 hover:text-purple-800 font-medium flex items-center"
              >
                Nous contacter <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          {/* Alerte de support d'urgence */}
          <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-yellow-900 mb-2">Support d'urgence</h3>
                <p className="text-yellow-800 mb-3">
                  Pour les problèmes urgents nécessitant une assistance immédiate, 
                  contactez-nous directement par téléphone au +227 20 72 29 42.
                </p>
                <p className="text-sm text-yellow-700">
                  Horaires d'urgence : Du lundi au vendredi de 8h00 à 20h00
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}