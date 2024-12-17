// src/components/admin/NewsletterManager.js
import React, { useState } from 'react';
import { Send, Users } from 'lucide-react';

export default function NewsletterManager() {
  const [subscribers, setSubscribers] = useState([
    { email: "example@mail.com", dateSubscribed: "2024-01-01" }
  ]);

  const [newsletters, setNewsletters] = useState([
    {
      id: 1,
      subject: "Newsletter Janvier 2024",
      dateSent: "2024-01-01",
      recipients: 150
    }
  ]);

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6">Gestion des newsletters</h2>

          {/* Statistiques */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900">Total abonnés</h3>
              <p className="text-2xl font-bold text-blue-600">{subscribers.length}</p>
            </div>
            {/* Ajoutez d'autres statistiques */}
          </div>

          {/* Liste des newsletters */}
          <div className="mt-8">
            <h3 className="font-medium mb-4">Newsletters envoyées</h3>
            <div className="space-y-4">
              {newsletters.map((newsletter) => (
                <div 
                  key={newsletter.id}
                  className="border rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-medium">{newsletter.subject}</h4>
                    <p className="text-sm text-gray-500">
                      Envoyée le {newsletter.dateSent} • {newsletter.recipients} destinataires
                    </p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800">
                    Voir les détails
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}