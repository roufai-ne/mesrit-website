// pages/ministere/organisation.js
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';

const OrganisationPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Titre et Téléchargement */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Organigramme du MESRIT</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Télécharger l'organigramme
          </button>
        </div>

        {/* Structure Ministre */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="text-center border-b pb-4 mb-4">
            <h2 className="text-xl font-bold">
              Ministre de l'Enseignement Supérieur, de la Recherche 
              et de l'Innovation Technologique
            </h2>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1 border-r">
              <h3 className="font-bold mb-3">Entités Rattachées</h3>
              <ul className="space-y-2">
                <li>• Inspection Générale des Services</li>
                <li>• Secrétariat Particulier</li>
                <li>• CCAJ</li>
                <li>• Direction du Protocol</li>
                <li>• Chargé de Mission</li>
                <li>• Attaché de Presse</li>
              </ul>
            </div>
            
            <div className="col-span-2 pl-4">
              <h3 className="font-bold mb-3">Secrétariat Général</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Directions</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Direction des Ressources Humaines</li>
                    <li>• Direction des Archives et Documentation</li>
                    <li>• Direction des Affaires Financières</li>
                    <li>• Direction de l'Informatique</li>
                    <li>• Direction des Marchés Publics</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Organismes Rattachés</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• ANAB</li>
                    <li>• Commission Nationale UNESCO</li>
                    <li>• Pôle des Bibliothèques Universitaires</li>
                    <li>• ANAQ-SUP</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Directions Générales */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* DGERPF */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="font-bold mb-4 text-center">
              Direction Générale des Études, de la Réglementation 
              et de la Promotion de la Formation (DGERPF)
            </h3>
            <ul className="space-y-2">
              <li>• Direction de la Formation Initiale et Continue</li>
              <li>• Direction de la Règlementation et du Contentieux</li>
              <li>• Direction de la Promotion et de l'orientation</li>
              <li>• Direction des Bourses et Aides</li>
              <li>• Direction de l'Innovation Pédagogique</li>
              <li>• Direction des Établissements</li>
            </ul>
          </div>

          {/* DGERS */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="font-bold mb-4 text-center">
              Direction Générale des Enseignements et de la Recherche 
              Scientifique (DGERS)
            </h3>
            <ul className="space-y-2">
              <li>• Direction de la Recherche</li>
              <li>• Direction de l'Innovation</li>
              <li>• Direction de la Coopération</li>
              <li>• Direction des Sciences</li>
              <li>• Direction de la Valorisation</li>
              <li>• Direction de l'Assurance Qualité</li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrganisationPage;