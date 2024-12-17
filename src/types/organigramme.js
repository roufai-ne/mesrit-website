// types/organigramme.js
export const structureMinistere = {
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
      },
      organismes_rattaches: [
        "Agence Nationale d'Allocation des Bourses (ANAB)",
        "Commission Nationale UNESCO",
        "Pôle des Bibliothèques Universitaires",
        "ANAQ-SUP"
      ]
    }
  };