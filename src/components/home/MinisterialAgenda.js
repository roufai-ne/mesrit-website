import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Users, X, AlertCircle, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { clsx } from 'clsx';
import { fetchWithApiKey } from '@/lib/publicApi';

export default function MinisterialAgenda({ compact = false }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const { isDark } = useTheme();

  const [fetchAttempted, setFetchAttempted] = useState(false);

  // États pour les événements (mode normal)
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(null);

  useEffect(() => {
    if (compact && !fetchAttempted) {
      fetchAnnouncements();
    } else if (!compact) {
      fetchEvents();
    }
  }, [fetchAttempted, compact]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    setFetchAttempted(true);
    try {
      const response = await fetchWithApiKey('/api/alerts');
      
      if (!response.ok) {
        // Gestion spécifique des erreurs
        if (response.status === 404) {
          setAnnouncements([]);
          return;
        }
        
        let message = `Erreur de chargement des annonces (${response.status})`;
        if (response.status === 429) message = 'Trop de requêtes, veuillez patienter.';
        if (response.status === 401) message = 'Accès non autorisé.';
        if (response.status === 403) message = 'Accès interdit.';
        
        // Essayer de récupérer le message d'erreur du serveur
        try {
          const errorData = await response.json();
          message = errorData.error || message;
        } catch (e) {
          // Ignorer l'erreur de parsing JSON
        }
        
        throw new Error(message);
      }
      
      const data = await response.json();
      setAnnouncements(Array.isArray(data) ? data.filter(item => item.status === 'active') : []);
    } catch (error) {
      console.error('Erreur fetchAnnouncements:', error);
      setError(error.message);
      
      // En cas d'erreur, utiliser des données de fallback
      setAnnouncements([
        {
          _id: 'fallback-announcement-1',
          title: 'Bienvenue sur le portail MESRIT',
          description: 'Découvrez les services et actualités du Ministère de l\'Enseignement Supérieur.',
          priority: 'medium',
          status: 'active',
          startDate: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      const response = await fetchWithApiKey('/api/events');
      
      if (!response.ok) {
        // Gestion spécifique des erreurs
        if (response.status === 404) {
          setEvents([]);
          return;
        }
        
        // Essayer de récupérer le message d'erreur du serveur
        let errorMessage = `Erreur de chargement des événements (${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Ignorer l'erreur de parsing JSON
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur fetchEvents:', error);
      setEventsError(error.message);
      setEvents([]);
      
      // En cas d'erreur, utiliser des données de fallback
      setEvents([
        {
          _id: 'fallback-1',
          title: 'Événements à venir',
          description: 'Consultez prochainement notre agenda pour les événements du MESRIT',
          date: new Date(),
          time: '09:00',
          location: 'MESRIT Niger',
          status: 'upcoming'
        }
      ]);
    } finally {
      setEventsLoading(false);
    }
  };

  // Si le composant est masqué, on ne rend rien
  if (!isVisible) return null;

  // En mode compact, si pas d'annonces (et chargement terminé), on ne rend rien
  if (compact && !loading && announcements.length === 0 && !error) return null;

  if ((compact && loading) || (!compact && eventsLoading)) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className={clsx(
                'text-2xl font-bold',
                isDark 
                  ? 'bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800' 
                  : 'text-gray-900'
              )}>
                Agenda
              </h2>
              <p className={clsx(
                isDark ? 'text-gray-600' : 'text-gray-600'
              )}>Consultez les prochains événements du Ministère</p>
            </div>
            <button 
              onClick={() => setIsVisible(false)} 
              className={clsx(
                'p-2 hover:bg-gray-100 rounded-full transition-colors',
                isDark ? 'hover:bg-gray-100' : 'hover:bg-gray-200'
              )}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((index) => (
              <div key={index} className={clsx(
                'animate-pulse rounded-xl p-4 border',
                isDark 
                  ? 'bg-white border-gray-100' 
                  : 'bg-white border-gray-200 shadow-sm'
              )}>
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

  if ((compact && error) || (!compact && eventsError)) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-6">
          <div className={clsx(
            'border rounded-xl p-4',
            isDark 
              ? 'bg-red-50 border-red-100 text-red-600' 
              : 'bg-red-50 border-red-200 text-red-700'
          )}>
            <p className="font-medium">Une erreur est survenue</p>
            <p className="text-sm mt-1">{compact ? error : eventsError}</p>
            {/* Fallback anti-boucle : aucune redirection, bouton manuel uniquement */}
            <button
              onClick={() => { 
                if (compact) {
                  setFetchAttempted(false); 
                  setError(null);
                } else {
                  setEventsError(null);
                  fetchEvents();
                }
              }}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Mode compact pour la colonne droite (20% de largeur)
  if (compact) {
    return (
      <div className="p-4 lg:p-5 h-full flex flex-col">
        <div className="text-center mb-5">
          <h2 className={clsx(
            'text-base lg:text-lg font-bold',
            isDark ? 'text-white' : 'text-gray-900'
          )}>Annonces</h2>
          <p className={clsx(
            'text-sm',
            isDark ? 'text-white/70' : 'text-gray-600'
          )}>Dernières informations</p>
        </div>

        {loading ? (
          <div className="space-y-4 flex-1">
            {[...Array(3)].map((_, index) => (
              <div key={index} className={clsx(
                'animate-pulse p-4 rounded-lg border',
                isDark 
                  ? 'bg-gray-800/50 border-gray-700' 
                  : 'bg-gray-100 border-gray-200'
              )}>
                <div className="flex items-center space-x-3">
                  <div className={clsx(
                    'w-10 h-10 rounded-lg',
                    isDark ? 'bg-gray-700' : 'bg-gray-200'
                  )} />
                  <div className="flex-1 space-y-2">
                    <div className={clsx(
                      'h-4 rounded',
                      isDark ? 'bg-gray-700' : 'bg-gray-200'
                    )}></div>
                    <div className={clsx(
                      'h-3 rounded w-2/3',
                      isDark ? 'bg-gray-700' : 'bg-gray-200'
                    )}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className={clsx(
            'text-center py-8 px-4 rounded-lg border',
            isDark 
              ? 'bg-red-900/20 border-red-800 text-red-400' 
              : 'bg-red-50 border-red-200 text-red-600'
          )}>
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Erreur de chargement</p>
            <button
              onClick={() => { setFetchAttempted(false); setError(null); }}
              className="mt-2 text-xs underline hover:no-underline"
            >
              Réessayer
            </button>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-8 flex-1 flex flex-col justify-center">
            <AlertCircle className={clsx(
              'w-12 h-12 mx-auto mb-3',
              isDark ? 'text-gray-600' : 'text-gray-400'
            )} />
            <p className={clsx(
              'text-sm',
              isDark ? 'text-white/60' : 'text-gray-500'
            )}>Aucune annonce disponible</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 flex-1 overflow-y-auto max-h-96">
              {announcements.slice(0, 5).map((announcement) => (
                <div
                  key={announcement._id}
                  onClick={() => setSelectedAnnouncement(announcement)}
                  className={clsx(
                    'p-4 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer',
                    isDark 
                      ? 'bg-gray-800/30 border-gray-700 hover:bg-gray-800/50 hover:border-gray-600' 
                      : 'bg-gray-50 border-gray-200 hover:bg-white hover:border-gray-300'
                  )}
                >
                  <div className="space-y-2">
                    {/* Badge de priorité */}
                    <div className="flex justify-between items-start">
                      <span className={clsx(
                        'text-xs px-2 py-1 rounded-full font-medium',
                        announcement.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                        announcement.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                      )}>
                        {announcement.priority === 'high' ? 'URGENT' :
                         announcement.priority === 'medium' ? 'Important' : 'Info'}
                      </span>
                      
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(announcement.startDate).toLocaleDateString('fr-FR', { 
                          day: '2-digit', 
                          month: '2-digit' 
                        })}
                      </span>
                    </div>
                    
                    {/* Titre */}
                    <h4 className={clsx(
                      'font-medium text-sm line-clamp-2 leading-tight',
                      isDark ? 'text-white' : 'text-gray-900'
                    )}>
                      {announcement.title}
                    </h4>
                    
                    {/* Description tronquée */}
                    <p className={clsx(
                      'text-xs line-clamp-2 leading-relaxed',
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    )}>
                      {announcement.description}
                    </p>
                    
                    {/* Indicateur "Cliquer pour lire" */}
                    <div className="text-xs text-niger-orange font-medium">
                      Cliquer pour lire →
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {announcements.length > 5 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href="/admin/ministere?tab=announcements"
                  className={clsx(
                    'block text-center text-sm font-medium py-2 px-4 rounded-lg transition-colors',
                    isDark 
                      ? 'text-niger-orange hover:bg-niger-orange/10' 
                      : 'text-niger-orange hover:bg-niger-orange/10'
                  )}
                >
                  Voir toutes les annonces ({announcements.length})
                </Link>
              </div>
            )}
          </>
        )}
        
        {/* Modal pour lire l'annonce complète */}
        {selectedAnnouncement && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={clsx(
              'max-w-md w-full rounded-xl p-6 max-h-[80vh] overflow-y-auto',
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            )}>
              <div className="flex justify-between items-start mb-4">
                <span className={clsx(
                  'text-xs px-2 py-1 rounded-full font-medium',
                  selectedAnnouncement.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                  selectedAnnouncement.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400' :
                  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                )}>
                  {selectedAnnouncement.priority === 'high' ? 'URGENT' :
                   selectedAnnouncement.priority === 'medium' ? 'Important' : 'Info'}
                </span>
                
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className={clsx(
                    'p-2 rounded-lg transition-colors',
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  )}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <h3 className={clsx(
                'text-lg font-bold mb-3',
                isDark ? 'text-white' : 'text-gray-900'
              )}>
                {selectedAnnouncement.title}
              </h3>
              
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Du {new Date(selectedAnnouncement.startDate).toLocaleDateString('fr-FR')} 
                au {new Date(selectedAnnouncement.endDate).toLocaleDateString('fr-FR')}
              </div>
              
              <div className={clsx(
                'text-sm leading-relaxed',
                isDark ? 'text-gray-300' : 'text-gray-700'
              )}>
                {selectedAnnouncement.description}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Mode normal (pleine largeur) - Affichage des événements
  return (
    <section className="py-8">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-12">
          <h2 className={clsx(
            'text-2xl font-bold',
            isDark ? 'text-white' : 'text-gray-900'
          )}>Agenda Ministériel</h2>
          <p className={clsx(
            isDark ? 'text-white/90' : 'text-gray-600'
          )}>Consultez les prochains événements du Ministère</p>
        </div>

        {eventsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className={clsx(
                'animate-pulse rounded-xl p-4 border backdrop-blur-md',
                isDark 
                  ? 'bg-niger-white-glass/30 border-niger-orange/20' 
                  : 'bg-white border-gray-200 shadow-sm'
              )}>
                <div className="flex items-center space-x-4">
                  <div className={clsx(
                    'flex-shrink-0 w-14 h-14 rounded-lg border',
                    isDark 
                      ? 'bg-niger-green-glass/50 border-niger-green/40' 
                      : 'bg-gray-100 border-gray-200'
                  )} />
                  <div className="flex-1 space-y-2">
                    <div className={clsx(
                      'h-4 rounded',
                      isDark ? 'bg-niger-white-glass/40' : 'bg-gray-200'
                    )}></div>
                    <div className={clsx(
                      'h-3 rounded w-3/4',
                      isDark ? 'bg-niger-white-glass/30' : 'bg-gray-200'
                    )}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : eventsError ? (
          <div className="text-center py-12">
            <div className={clsx(
              'mb-4',
              isDark ? 'text-red-400' : 'text-red-500'
            )}>
              <AlertCircle className="w-16 h-16 mx-auto" />
            </div>
            <h3 className={clsx(
              'text-xl font-semibold mb-2',
              isDark ? 'text-white' : 'text-gray-900'
            )}>Erreur de chargement</h3>
            <p className={clsx(
              isDark ? 'text-white/80' : 'text-gray-600'
            )}>{eventsError}</p>
            <button
              onClick={fetchEvents}
              className="mt-4 px-4 py-2 bg-niger-orange text-white rounded-lg hover:bg-niger-orange-dark transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <div className={clsx(
              'mb-4',
              isDark ? 'text-niger-orange' : 'text-niger-orange'
            )}>
              <Calendar className="w-16 h-16 mx-auto" />
            </div>
            <h3 className={clsx(
              'text-xl font-semibold mb-2',
              isDark ? 'text-white' : 'text-gray-900'
            )}>Aucun événement</h3>
            <p className={clsx(
              isDark ? 'text-white/80' : 'text-gray-600'
            )}>Aucun événement n'est prévu pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.slice(0, 6).map((event) => (
              <div
                key={event._id}
                className={clsx(
                  'group p-4 rounded-xl border transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-md',
                  isDark 
                    ? 'bg-niger-white-glass/30 border-niger-orange/20 hover:border-niger-orange/40 hover:shadow-glass' 
                    : 'bg-white border-gray-200 hover:border-niger-orange/30 hover:shadow-lg shadow-md'
                )}
              >
                <div className="flex items-start space-x-4">
                  <div className={clsx(
                    'flex-shrink-0 w-14 h-14 rounded-lg border flex items-center justify-center',
                    isDark 
                      ? 'bg-niger-green-glass/50 border-niger-green/40' 
                      : 'bg-niger-green-glass/20 border-niger-green/30'
                  )}>
                    <Calendar className={clsx(
                      'w-6 h-6',
                      isDark ? 'text-niger-green-light' : 'text-niger-green'
                    )} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={clsx(
                      'font-semibold mb-1 line-clamp-2',
                      isDark ? 'text-white' : 'text-gray-900'
                    )}>
                      {event.title}
                    </h3>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center text-niger-orange">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{new Date(event.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      
                      {event.location && (
                        <div className={clsx(
                          'flex items-center',
                          isDark ? 'text-white/70' : 'text-gray-600'
                        )}>
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      )}
                      
                      {event.participants && (
                        <div className={clsx(
                          'flex items-center',
                          isDark ? 'text-white/70' : 'text-gray-600'
                        )}>
                          <Users className="w-4 h-4 mr-2" />
                          <span>{event.participants} participants</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {event.description && (
                  <p className={clsx(
                    'mt-3 text-sm line-clamp-2',
                    isDark ? 'text-white/80' : 'text-gray-600'
                  )}>
                    {event.description}
                  </p>
                )}
                
                <div className="mt-4 flex items-center justify-between">
                  <span className={clsx(
                    'text-xs px-2 py-1 rounded-full',
                    isDark 
                      ? 'bg-white/10 text-white/60' 
                      : 'bg-gray-100 text-gray-600'
                  )}>
                    {event.category || 'Événement'}
                  </span>
                  
                  <Link
                    href={`/evenements/${event._id}`}
                    className={clsx(
                      'inline-flex items-center text-sm font-medium group-hover:underline',
                      isDark 
                        ? 'text-niger-orange hover:text-niger-orange-light' 
                        : 'text-niger-orange hover:text-niger-orange-dark'
                    )}
                  >
                    Détails
                    <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {events.length > 0 && (
          <div className="text-center mt-8">
            <Link
              href="/evenements"
              className={clsx(
                'inline-flex items-center px-6 py-3 rounded-lg transition-all group shadow-lg',
                isDark 
                  ? 'bg-gradient-to-r from-niger-orange to-niger-green text-white hover:from-niger-orange-dark hover:to-niger-green-dark shadow-glass' 
                  : 'bg-niger-green text-white hover:bg-niger-green-dark shadow-niger-green'
              )}
            >
              Voir tous les événements
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}