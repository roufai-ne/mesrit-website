// src/pages/ministere/missions.js
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Target, ChevronRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function MissionsPage() {
  const missions = [
    {
      title: "Enseignement Supérieur",
      content: "Assurer le développement et la qualité de l'enseignement supérieur au Niger",
      objectifs: [
        "Améliorer l'accès à l'enseignement supérieur",
        "Garantir la qualité des formations",
        "Renforcer les capacités des établissements"
      ]
    },
    {
      title: "Recherche",
      content: "Promouvoir la recherche scientifique et l'innovation",
      objectifs: [
        "Développer les infrastructures de recherche",
        "Soutenir les projets de recherche",
        "Favoriser les partenariats internationaux"
      ]
    },
    {
      title: "Innovation",
      content: "Stimuler l'innovation technologique et le transfert de connaissances",
      objectifs: [
        "Encourager les initiatives innovantes",
        "Faciliter le transfert technologique",
        "Soutenir les startups universitaires"
      ]
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
            <span>Nos Missions</span>
          </div>

          <div className="flex items-center mb-8">
            <Target className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold">Nos Missions</h1>
          </div>

          <div className="space-y-12">
            {missions.map((mission, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">{mission.title}</h2>
                <p className="text-gray-600 mb-6">{mission.content}</p>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-bold mb-4">Objectifs</h3>
                  <ul className="space-y-3">
                    {mission.objectifs.map((objectif, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                        <span>{objectif}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

