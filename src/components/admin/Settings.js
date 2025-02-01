// src/components/admin/Settings.js
import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Globe, Mail, Phone, MapPin, Facebook} from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    site: {
      title: "MESRIT Niger",
      description: "Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique",
      email: "contact@mesrit.ne",
      phone: "+227 XX XX XX XX",
      address: "Niamey, Niger"
    },
    social: {
      facebook: "",
      twitter: "",
      linkedin: ""
    },
    external: {
      anab: "https://anab.ne",
      bac: "https://bac.ne",
      bts: "https://bts.ne"
    }
  });

  const handleSave = async () => {
    try {
      const response = await fetch('/api/settings/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        // Afficher une notification de succès
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <SettingsIcon className="w-6 h-6 mr-2" />
              Paramètres du site
            </h2>
            <button
              onClick={handleSave}
              className="btn btn-primary"
            >
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </button>
          </div>

          <div className="space-y-8">
            {/* Informations générales */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Informations générales
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Titre du site</label>
                  <input
                    type="text"
                    value={settings.site.title}
                    onChange={(e) => setSettings({
                      ...settings,
                      site: { ...settings.site, title: e.target.value }
                    })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <input
                    type="text"
                    value={settings.site.description}
                    onChange={(e) => setSettings({
                      ...settings,
                      site: { ...settings.site, description: e.target.value }
                    })}
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* Coordonnées */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Coordonnées</h3>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={settings.site.email}
                      onChange={(e) => setSettings({
                        ...settings,
                        site: { ...settings.site, email: e.target.value }
                      })}
                      className="input pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={settings.site.phone}
                      onChange={(e) => setSettings({
                        ...settings,
                        site: { ...settings.site, phone: e.target.value }
                      })}
                      className="input pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Adresse</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={settings.site.address}
                      onChange={(e) => setSettings({
                        ...settings,
                        site: { ...settings.site, address: e.target.value }
                      })}
                      className="input pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Réseaux sociaux */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Réseaux sociaux</h3>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Facebook</label>
                  <div className="relative">
                    <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="url"
                      value={settings.social.facebook}
                      onChange={(e) => setSettings({
                        ...settings,
                        social: { ...settings.social, facebook: e.target.value }
                      })}
                      className="input pl-10"
                      placeholder="URL Facebook"
                    />
                  </div>
                </div>
                {/* Répéter pour Twitter et LinkedIn */}
              </div>
            </div>

            {/* Services externes */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Services externes</h3>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">ANAB</label>
                  <input
                    type="url"
                    value={settings.external.anab}
                    onChange={(e) => setSettings({
                      ...settings,
                      external: { ...settings.external, anab: e.target.value }
                    })}
                    className="input"
                    placeholder="URL ANAB"
                  />
                </div>
                {/* Répéter pour BAC et BTS */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}