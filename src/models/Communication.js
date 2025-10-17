// src/models/Communication.js
// Ce modèle fait le lien entre Alert et Event pour le middleware RBAC
import Alert from './Alert.js';
import Event from './Event.js';

// Ce module n'est pas un vrai modèle Mongoose, mais permet d'unifier l'accès
// pour le middleware RBAC qui importe '@/models/Communication'

const CommunicationModels = {
  Alert,
  Event
};

export default CommunicationModels;
