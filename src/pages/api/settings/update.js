import fs from 'fs';
import path from 'path';
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';

const updateSettings = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vérifier l'authentification (déjà fait par le middleware)
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const settings = req.body;
    
    // Validation basique
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Données de paramètres invalides' });
    }

    // Structure par défaut
    const defaultSettings = {
      site: { title: "", description: "", email: "", phone: "", address: "" },
      social: { facebook: "", twitter: "", linkedin: "" },
      external: { anab: "", bac: "", bts: "" },
      header: { 
        backgroundImage: "/images/hero/Slide1.jpg", 
        opacity: 5, 
        logo: "", 
        logoSize: "medium", 
        logoPosition: "left" 
      },
      services: {
        categories: ["etudiants", "etablissements", "recherche", "administration", "formation"],
        defaultIcon: "Settings",
        maxFeatures: 3
      },
      ministryStats: {
        mission: {
          enabled: true,
          stats: [
            { id: "programs", label: "Programmes", value: 25, unit: "", order: 1 },
            { id: "partnerships", label: "Partenariats", value: 12, unit: "", order: 2 },
            { id: "initiatives", label: "Initiatives", value: 8, unit: "", order: 3 }
          ]
        },
        organisation: {
          enabled: true,
          stats: [
            { id: "directions", label: "Directions", value: 8, unit: "", order: 1 },
            { id: "services", label: "Services", value: 24, unit: "", order: 2 },
            { id: "departments", label: "Départements", value: 15, unit: "", order: 3 }
          ]
        },
        direction: {
          enabled: true,
          stats: [
            { id: "executives", label: "Cadres", value: 15, unit: "", order: 1 },
            { id: "experience", label: "Années d'exp.", value: 180, unit: "+", order: 2 },
            { id: "projects", label: "Projets menés", value: 45, unit: "", order: 3 }
          ]
        }
      }
    };

    // Fusionner avec les paramètres par défaut
    const mergedSettings = {
      ...defaultSettings,
      ...settings,
      site: { ...defaultSettings.site, ...settings.site },
      social: { ...defaultSettings.social, ...settings.social },
      external: { ...defaultSettings.external, ...settings.external },
      header: { ...defaultSettings.header, ...settings.header },
      services: { ...defaultSettings.services, ...settings.services },
      ministryStats: {
        ...defaultSettings.ministryStats,
        ...settings.ministryStats,
        mission: { 
          ...defaultSettings.ministryStats.mission, 
          ...settings.ministryStats?.mission,
          stats: settings.ministryStats?.mission?.stats || defaultSettings.ministryStats.mission.stats
        },
        organisation: { 
          ...defaultSettings.ministryStats.organisation, 
          ...settings.ministryStats?.organisation,
          stats: settings.ministryStats?.organisation?.stats || defaultSettings.ministryStats.organisation.stats
        },
        direction: { 
          ...defaultSettings.ministryStats.direction, 
          ...settings.ministryStats?.direction,
          stats: settings.ministryStats?.direction?.stats || defaultSettings.ministryStats.direction.stats
        }
      }
    };

    // Chemin vers le fichier de paramètres
    const filePath = path.join(process.cwd(), 'data', 'settings.json');
    
    // Créer le dossier data s'il n'existe pas
    const dataDir = path.dirname(filePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Sauvegarder les paramètres
    fs.writeFileSync(filePath, JSON.stringify(mergedSettings, null, 2), 'utf8');

    console.log('[SETTINGS] Paramètres sauvegardés avec succès');

    return res.status(200).json({ 
      success: true, 
      message: 'Paramètres sauvegardés avec succès',
      settings: mergedSettings
    });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des paramètres:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de la sauvegarde des paramètres' 
    });
  }
};

export default apiHandler(
  { POST: updateSettings },
  { POST: ROUTE_TYPES.PROTECTED }
);