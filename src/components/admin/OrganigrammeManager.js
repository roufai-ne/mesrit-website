// src/components/admin/OrganigrammeManager.js
import React, { useState } from 'react';
import { Edit, Save } from 'lucide-react';

export default function OrganigrammeManager() {
  // Structure de l'organigramme
  const structureMinistere = {
    ministre: {
      titre: "Ministre de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique (MESRIT)",
      entites_rattachees: [
        "Inspection Générale des Services",
        "Secrétariat Particulier",
        "CCAJ",
        "Direction du Protocol",
        "Chargé de Mission",
        "Attaché de Presse"
      ]
    },
    secretariat_general: {
      titre: "Secrétariat Général",
      directions: [
        "Direction des Ressources Humaines",
        "Direction des Archives et de la Documentation",
        "Direction des Affaires Financières",
        "Direction de l'Informatique",
        "Direction des Marchés Publics"
      ],
      directions_generales: {
        dgerpf: {
          titre: "Direction Générale des Études, de la Réglementation et de la Promotion de la Formation (DGERPF)",
          sous_directions: [
            "Direction de la Formation Initiale et Continue",
            "Direction de la Règlementation et du Contentieux",
            "Direction de la Promotion et de l'orientation",
            "Direction des Bourses et Aides",
            "Direction de l'Innovation Pédagogique",
            "Direction des Établissements"
          ]
        },
        dgers: {
          titre: "Direction Générale des Enseignements et de la Recherche Scientifique (DGERS)",
          sous_directions: [
            "Direction de la Recherche",
            "Direction de l'Innovation",
            "Direction de la Coopération",
            "Direction des Sciences",
            "Direction de la Valorisation",
            "Direction de l'Assurance Qualité"
          ]
        }
      }
    }
  };

  const [editMode, setEditMode] = useState(false);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestion de l&apos;Organigramme</h2>
        <button 
          onClick={() => setEditMode(!editMode)}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"
        >
          {editMode ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder
            </>
          ) : (
            <>
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </>
          )}
        </button>
      </div>

      <div className="grid gap-6">
        {/* Section Ministre */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Cabinet du Ministre</h3>
          <div className="space-y-4">
            {structureMinistere.ministre.entites_rattachees.map((entite, index) => (
              <div key={index} className="p-2 border rounded">
                <input
                  type="text"
                  value={entite}
                  disabled={!editMode}
                  className="w-full p-2 disabled:bg-gray-50"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Sections Directions Générales */}
        {Object.entries(structureMinistere.secretariat_general.directions_generales)
          .map(([key, direction]) => (
            <div key={key} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">{direction.titre}</h3>
              <div className="space-y-4">
                {direction.sous_directions.map((sousDir, index) => (
                  <div key={index} className="p-2 border rounded">
                    <input
                      type="text"
                      value={sousDir}
                      disabled={!editMode}
                      className="w-full p-2 disabled:bg-gray-50"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}