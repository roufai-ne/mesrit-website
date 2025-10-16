// src/pages/ministere/historique.js
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Clock, ChevronRight, Calendar, Award, Building } from 'lucide-react';
import Link from 'next/link';

export default function HistoriquePage() {
  const milestones = [
    {
      year: "1962",
      title: "Création du Ministère de l'Éducation Nationale",
      content: "Après l'indépendance du Niger, création du premier ministère en charge de l'éducation.",
      icon: Building,
      color: "bg-blue-500"
    },
    {
      year: "1975",
      title: "Création de l'Université de Niamey",
      content: "Fondation de la première université du Niger, qui deviendra plus tard l'Université Abdou Moumouni.",
      icon: Award,
      color: "bg-green-500"
    },
    {
      year: "1992",
      title: "Réorganisation du système éducatif",
      content: "Restructuration majeure avec la séparation entre l'enseignement de base et l'enseignement supérieur.",
      icon: Building,
      color: "bg-purple-500"
    },
    {
      year: "2000",
      title: "Expansion universitaire",
      content: "Lancement du programme d'expansion avec la création de nouvelles universités régionales.",
      icon: Award,
      color: "bg-orange-500"
    },
    {
      year: "2010",
      title: "Modernisation technologique",
      content: "Introduction des TIC dans l'enseignement supérieur et développement de l'e-learning.",
      icon: Building,
      color: "bg-cyan-500"
    },
    {
      year: "2020",
      title: "Création du MESRIT",
      content: "Formation du Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique.",
      icon: Award,
      color: "bg-red-500"
    }
  ];

  const achievements = [
    {
      title: "60 ans d'excellence",
      description: "Plus de six décennies au service de l'éducation nationale",
      stats: "1962-2024"
    },
    {
      title: "10 universités",
      description: "Un réseau national d'établissements d'enseignement supérieur",
      stats: "Toutes les régions"
    },
    {
      title: "100,000+ diplômés",
      description: "Générations de cadres formés pour le développement du Niger",
      stats: "Depuis 1975"
    }
  ];

  return (
    <MainLayout>
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Fil d'Ariane */}
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-blue-600">Accueil</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href="/ministere" className="hover:text-blue-600">Le Ministère</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span>Historique</span>
          </div>

          {/* En-tête */}
          <div className="flex items-center mb-8">
            <Clock className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold">Notre Historique</h1>
          </div>

          {/* Introduction */}
          <div className="bg-white rounded-lg shadow p-6 mb-12">
            <p className="text-lg text-gray-700 leading-relaxed">
              Depuis l'indépendance du Niger, notre ministère a évolué pour devenir un acteur majeur 
              du développement de l'enseignement supérieur et de la recherche. Découvrez les étapes 
              marquantes de notre parcours et les réalisations qui ont façonné l'éducation supérieure nigérienne.
            </p>
          </div>

          {/* Timeline */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-8 text-center">Chronologie</h2>
            <div className="relative">
              {/* Ligne verticale */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-300"></div>
              
              <div className="space-y-12">
                {milestones.map((milestone, index) => {
                  const Icon = milestone.icon;
                  const isEven = index % 2 === 0;
                  
                  return (
                    <div key={index} className={`flex items-center ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
                      <div className={`w-1/2 ${isEven ? 'pr-8 text-right' : 'pl-8'}`}>
                        <div className="bg-white rounded-lg shadow-lg p-6">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-medium mb-3 ${milestone.color}`}>
                            <Calendar className="w-4 h-4 mr-2" />
                            {milestone.year}
                          </div>
                          <h3 className="text-xl font-bold mb-3">{milestone.title}</h3>
                          <p className="text-gray-600">{milestone.content}</p>
                        </div>
                      </div>
                      
                      {/* Point central */}
                      <div className="relative z-10">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${milestone.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                      </div>
                      
                      <div className="w-1/2"></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Réalisations clés */}
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold mb-8 text-center">Nos Réalisations</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {achievements.map((achievement, index) => (
                <div key={index} className="text-center p-6 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{achievement.stats}</div>
                  <h3 className="text-xl font-bold mb-3">{achievement.title}</h3>
                  <p className="text-gray-600">{achievement.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Vision d'avenir */}
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Vers l'Avenir</h2>
            <p className="text-lg mb-6">
              Fort de notre riche histoire, nous continuons à innover et à nous adapter aux défis 
              de l'enseignement supérieur moderne pour former les leaders de demain.
            </p>
            <Link 
              href="/ministere/missions"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Découvrir nos missions
              <ChevronRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}