// src/components/home/MinisterialAgenda.js
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Loader2 } from 'lucide-react';


export default function MinisterialAgenda() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) throw new Error('Erreur de chargement des événements');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Erreur:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8">Agenda</h2>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="space-y-6">
              {[1, 2, 3].map((index) => (
                <div key={index} className="animate-pulse">
                  <div className="flex items-start space-x-4">
                    <div className="w-16">
                      <div className="h-8 bg-gray-200 rounded mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-6">
          <div className="bg-red-50 text-red-600 rounded-xl p-6">
            <p className="font-medium">Une erreur est survenue</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={fetchEvents}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-6">
        <h2 className="text-2xl font-bold mb-8">Agenda</h2>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {events.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Aucun événement à venir
            </div>
          ) : (
            <div className="divide-y">
              {events.map((event) => (
                <div key={event._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-16 text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {new Date(event.date).getDate()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(event.date).toLocaleString('fr-FR', { month: 'short' })}
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          {event.time}
                        </div>
                        {event.location && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            {event.location}
                          </div>
                        )}
                        {event.participants && (
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            {event.participants}
                          </div>
                        )}
                      </div>
                      
                      {event.description && (
                        <p className="mt-2 text-gray-600 text-sm">
                          {event.description}
                        </p>
                      )}

                      <div className="mt-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                          event.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {event.status === 'upcoming' ? 'À venir' :
                           event.status === 'ongoing' ? 'En cours' :
                           'Terminé'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}