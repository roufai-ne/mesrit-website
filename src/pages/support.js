// src/pages/support.js
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import {
  HelpCircle, ChevronRight, Mail, Phone, MessageCircle,
  Book, FileText, Users, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import SeoHead from '@/components/seo/SeoHead';

export default function SupportPage() {
  const [selectedCategory, setSelectedCategory] = useState('general');

  const supportCategories = [
    { id: 'general', title: 'Questions Générales', description: 'Informations générales sur le ministère et ses services', icon: HelpCircle },
    { id: 'students', title: 'Support Étudiants', description: 'Aide aux étudiants et procédures académiques', icon: Users },
    { id: 'technical', title: 'Support Technique', description: 'Assistance technique et problèmes informatiques', icon: FileText },
    { id: 'documents', title: 'Documents & Formulaires', description: 'Aide pour les documents et démarches administratives', icon: Book }
  ];

  const contactMethods = [
    { title: 'Email', description: 'Contactez-nous par email pour toute question', icon: Mail, contact: 'support@mesrit.gov.ne', responseTime: '24-48 heures' },
    { title: 'Téléphone', description: 'Appelez-nous directement pour une assistance immédiate', icon: Phone, contact: '+227 20 72 29 42', responseTime: 'Immédiat' },
    { title: 'Chat en Ligne', description: 'Discutez avec notre équipe de support', icon: MessageCircle, contact: 'Disponible sur le site', responseTime: '5-10 minutes' }
  ];

  const faqQuestions = {
    general: [
      { question: 'Comment contacter le ministère ?', answer: 'Vous pouvez nous contacter par email à contact@mesrit.gov.ne, par téléphone au +227 20 72 29 42, ou en visitant nos bureaux à Niamey.' },
      { question: "Quels sont les horaires d'ouverture ?", answer: 'Nos bureaux sont ouverts du lundi au vendredi de 8h00 à 17h00. Le service client est disponible de 8h30 à 16h30.' },
      { question: 'Où se trouvent vos bureaux ?', answer: 'Le siège du ministère se trouve au Boulevard Mali Béro, Niamey, Niger. Nous avons également des représentations dans toutes les régions.' }
    ],
    students: [
      { question: 'Comment faire une demande de bourse ?', answer: "Les demandes de bourses se font via l'ANAB (Agence Nigérienne des Allocations et des Bourses). Consultez leur site web ou visitez leurs bureaux." },
      { question: "Comment s'inscrire à l'université ?", answer: "Les inscriptions se font directement auprès des universités. Consultez notre section établissements pour les contacts des différentes universités." },
      { question: 'Où trouver les résultats du baccalauréat ?', answer: "Les résultats du baccalauréat sont publiés sur le site de l'OBEECS. Vous pouvez également les consulter dans les centres d'examen." }
    ],
    technical: [
      { question: 'Problème de connexion au site ?', answer: 'Vérifiez votre connexion internet et réessayez. Si le problème persiste, contactez notre support technique.' },
      { question: 'Comment télécharger les documents ?', answer: "Cliquez sur le bouton de téléchargement à côté du document. Assurez-vous d'avoir un lecteur PDF installé." },
      { question: 'Le formulaire ne fonctionne pas ?', answer: 'Vérifiez que tous les champs obligatoires sont remplis. Utilisez un navigateur récent comme Chrome, Firefox ou Safari.' }
    ],
    documents: [
      { question: 'Où trouver les formulaires officiels ?', answer: 'Tous les formulaires sont disponibles dans la section Documentation de notre site web.' },
      { question: 'Comment authentifier un diplôme ?', answer: "Contactez le service de l'authentification de l'université qui a délivré le diplôme ou l'ANAQ-SUP pour les procédures." },
      { question: 'Délai de traitement des dossiers ?', answer: 'Les délais varient selon le type de dossier. Généralement entre 15 à 30 jours ouvrables pour les demandes complètes.' }
    ]
  };

  return (
    <MainLayout>
      <SeoHead title="Support" description="Centre d'aide et de support du site officiel du MESRIT Niger." url="/support" />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-niger-orange via-niger-orange-dark to-niger-green text-white py-14 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="container mx-auto px-6 relative">
          <div className="flex items-center text-sm mb-3 opacity-80">
            <Link href="/" className="hover:opacity-100 transition-opacity">Accueil</Link>
            <ChevronRight className="w-4 h-4 mx-1.5" />
            <span className="font-medium">Support</span>
          </div>
          <div className="flex items-center gap-4">
            <HelpCircle className="w-10 h-10 flex-shrink-0" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Centre de Support</h1>
              <p className="text-white/80 mt-1">Nous sommes là pour vous aider</p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12 bg-gray-50 dark:bg-secondary-900">
        <div className="container mx-auto px-6">

          {/* Méthodes de contact */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light text-center mb-6">Comment nous contacter</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {contactMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <div key={method.title} className="bg-white dark:bg-secondary-800 rounded-2xl border border-gray-100 dark:border-secondary-700 p-6 text-center hover:shadow-lg transition-all duration-300">
                    <div className="w-14 h-14 bg-niger-orange/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-niger-orange" />
                    </div>
                    <h3 className="text-lg font-semibold text-niger-green dark:text-niger-green-light mb-2">{method.title}</h3>
                    <p className="text-readable-muted dark:text-muted-foreground mb-3 text-sm">{method.description}</p>
                    <div className="text-niger-orange font-medium mb-2 text-sm">{method.contact}</div>
                    <div className="flex items-center justify-center gap-1.5 text-xs text-readable-muted dark:text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {method.responseTime}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Catégories */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light text-center mb-6">Choisissez votre catégorie</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {supportCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`p-4 rounded-xl transition-all text-center border ${
                      selectedCategory === category.id
                        ? 'bg-niger-orange text-white border-niger-orange shadow-lg'
                        : 'bg-white dark:bg-secondary-800 hover:bg-niger-orange/10 dark:hover:bg-niger-orange/20 border-gray-200 dark:border-secondary-600 text-readable dark:text-foreground'
                    }`}
                  >
                    <div className="flex justify-center mb-2.5">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{category.title}</h3>
                    <p className="text-xs opacity-80">{category.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* FAQ par catégorie */}
          <div className="bg-white dark:bg-secondary-800 rounded-2xl border border-gray-100 dark:border-secondary-700 p-8 mb-8">
            <h2 className="text-lg font-semibold text-niger-green dark:text-niger-green-light mb-6">
              Questions fréquentes — {supportCategories.find(cat => cat.id === selectedCategory)?.title}
            </h2>
            <div className="space-y-3">
              {faqQuestions[selectedCategory]?.map((faq, index) => (
                <div key={index} className="border border-gray-100 dark:border-secondary-600 rounded-xl p-4 bg-white dark:bg-secondary-700">
                  <h3 className="font-semibold text-niger-green dark:text-niger-green-light mb-2 flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-niger-orange flex-shrink-0" />
                    {faq.question}
                  </h3>
                  <p className="text-readable-muted dark:text-muted-foreground ml-6 text-sm">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ressources */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Book, title: 'Documentation', desc: 'Consultez notre documentation complète pour trouver des guides détaillés.', link: '/documentation', linkLabel: 'Voir la documentation' },
              { icon: HelpCircle, title: 'FAQ', desc: 'Trouvez rapidement des réponses dans notre foire aux questions.', link: '/faq', linkLabel: 'Consulter la FAQ' },
              { icon: Mail, title: 'Contact Direct', desc: 'Contactez-nous directement pour toute question spécifique.', link: '/contact', linkLabel: 'Nous contacter' },
            ].map(({ icon: Icon, title, desc, link, linkLabel }) => (
              <div key={title} className="bg-white dark:bg-secondary-800 rounded-2xl border border-gray-100 dark:border-secondary-700 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-niger-orange/10 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-niger-orange" />
                  </div>
                  <h3 className="font-semibold text-niger-green dark:text-niger-green-light">{title}</h3>
                </div>
                <p className="text-readable-muted dark:text-muted-foreground mb-4 text-sm">{desc}</p>
                <Link href={link} className="flex items-center gap-1 text-niger-orange hover:text-niger-orange-dark transition-colors font-medium text-sm">
                  {linkLabel} <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>

          {/* Alerte urgence */}
          <div className="mt-10 bg-niger-orange/10 dark:bg-niger-orange/20 border border-niger-orange/30 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-niger-orange flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-niger-green dark:text-niger-green-light mb-1">Support d'urgence</h3>
                <p className="text-readable dark:text-foreground text-sm mb-1">
                  Pour les problèmes urgents nécessitant une assistance immédiate, contactez-nous au <strong>+227 20 72 29 42</strong>.
                </p>
                <p className="text-xs text-readable-muted dark:text-muted-foreground">
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

export async function getStaticProps() {
  return { props: {}, revalidate: 86400 };
}
