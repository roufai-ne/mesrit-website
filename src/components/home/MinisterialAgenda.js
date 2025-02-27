import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Users, X } from 'lucide-react';

export default function MinisterialAgenda() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) throw new Error('Erreur de chargement des événements');
      const data = await response.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Si le composant est masqué ou s'il n'y a pas d'événements (et qu'on a fini de charger), on ne rend rien
  if (!isVisible || (!loading && events.length === 0)) return null;

  if (loading) {
    return (
      <section className="py-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
                Agenda
              </h2>
              <p className="text-gray-600">Consultez les prochains événements du Ministère</p>
            </div>
            <button onClick={() => setIsVisible(false)} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((index) => (
              <div key={index} className="animate-pulse bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-16 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-4">
            <p className="font-medium">Une erreur est survenue</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={fetchEvents}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
              Agenda
            </h2>
            <p className="text-gray-600">Consultez les prochains événements du Ministère</p>
          </div>
          <button onClick={() => setIsVisible(false)} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-xl border border-gray-100 hover:border-blue-200 
                       p-4 transition-all duration-300 transform hover:-translate-y-1 
                       hover:shadow-md group relative"
            >
              <div className="absolute top-4 right-4">
                <span className={`
                  px-3 py-1 rounded-full text-xs font-medium
                  ${event.status === 'upcoming' 
                    ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                    : event.status === 'ongoing'
                    ? 'bg-green-50 text-green-700 border border-green-100'
                    : 'bg-gray-50 text-gray-700 border border-gray-100'
                  }
                `}>
                  {event.status === 'upcoming' ? 'À venir' :
                   event.status === 'ongoing' ? 'En cours' :
                   'Terminé'}
                </span>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-14 text-center p-2 bg-blue-50 rounded-lg 
                            group-hover:bg-white transition-colors border border-blue-100">
                  <div className="text-2xl font-bold text-blue-600">
                    {new Date(event.date).getDate()}
                  </div>
                  <div className="text-xs text-blue-600/70">
                    {new Date(event.date).toLocaleString('fr-FR', { month: 'short' })}
                  </div>
                </div>

                <div className="flex-1 pt-1">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 
                             transition-colors mb-2">
                    {event.title}
                  </h3>

                  <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-1 text-blue-500" />
                      <span className="text-sm">{event.time}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                        <span className="text-sm">{event.location}</span>
                      </div>
                    )}
                    {event.participants && (
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-1 text-blue-500" />
                        <span className="text-sm">{event.participants}</span>
                      </div>
                    )}
                  </div>

                  {event.description && (
                    <p className="text-gray-600 text-sm mt-2">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}