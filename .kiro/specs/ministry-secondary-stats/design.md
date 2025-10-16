# Design Document - Statistiques Secondaires du Ministère

## Overview

Ce système permet la gestion des statistiques secondaires affichées dans les sections de la page ministère via une interface d'administration. Les statistiques sont stockées en base de données et peuvent être configurées par section (Mission, Organisation, Direction) avec un éditeur visuel ou JSON.

## Architecture

### Structure des données

```json
{
  "type": "ministry_secondary_stats",
  "sections": {
    "mission": {
      "enabled": true,
      "stats": [
        {
          "id": "programs",
          "label": "Programmes",
          "value": 25,
          "unit": "",
          "order": 1
        },
        {
          "id": "partnerships",
          "label": "Partenariats",
          "value": 12,
          "unit": "",
          "order": 2
        }
      ]
    },
    "organisation": {
      "enabled": true,
      "stats": [
        {
          "id": "directions",
          "label": "Directions",
          "value": 8,
          "unit": "",
          "order": 1
        },
        {
          "id": "services",
          "label": "Services",
          "value": 24,
          "unit": "",
          "order": 2
        }
      ]
    },
    "direction": {
      "enabled": true,
      "stats": [
        {
          "id": "executives",
          "label": "Cadres",
          "value": 15,
          "unit": "",
          "order": 1
        },
        {
          "id": "experience",
          "label": "Années d'exp.",
          "value": 180,
          "unit": "+",
          "order": 2
        }
      ]
    }
  },
  "lastUpdated": "2024-01-15T10:30:00Z",
  "updatedBy": "admin@mesrit.ne"
}
```

### Flux de données

1. **Chargement** : La page ministère récupère la configuration via l'API
2. **Affichage** : Les statistiques sont injectées dans les sections appropriées
3. **Modification** : L'interface d'admin permet la modification via API
4. **Sauvegarde** : Les changements sont persistés en base MongoDB

## Components and Interfaces

### API Endpoints

#### GET /api/admin/ministry/secondary-stats
- **Description** : Récupère la configuration des statistiques secondaires
- **Auth** : Admin requis
- **Response** : Configuration complète ou valeurs par défaut

#### POST /api/admin/ministry/secondary-stats
- **Description** : Sauvegarde la configuration des statistiques
- **Auth** : Admin requis
- **Body** : Configuration JSON validée
- **Response** : Configuration sauvegardée avec métadonnées

#### DELETE /api/admin/ministry/secondary-stats
- **Description** : Réinitialise la configuration aux valeurs par défaut
- **Auth** : Admin requis
- **Response** : Confirmation de réinitialisation

#### GET /api/ministry/secondary-stats (Public)
- **Description** : Récupère les statistiques pour affichage public
- **Auth** : API Key publique
- **Response** : Statistiques formatées par section

### Composants React

#### MinistrySecondaryStatsManager
- **Localisation** : `src/components/admin/MinistrySecondaryStatsManager.js`
- **Responsabilité** : Interface d'administration complète
- **Features** :
  - Onglets par section (Mission, Organisation, Direction)
  - Mode visuel avec formulaires
  - Mode JSON avec éditeur
  - Validation en temps réel
  - Prévisualisation des changements

#### SectionStatsDisplay
- **Localisation** : `src/components/ministry/SectionStatsDisplay.js`
- **Responsabilité** : Affichage des statistiques dans les sections
- **Props** :
  - `sectionKey` : Clé de la section (mission, organisation, direction)
  - `stats` : Array des statistiques à afficher
  - `className` : Classes CSS personnalisées

### Hook personnalisé

#### useMinistrySecondaryStats
- **Localisation** : `src/hooks/useMinistrySecondaryStats.js`
- **Responsabilité** : Gestion de l'état et des appels API
- **Features** :
  - Cache des données
  - Rechargement automatique
  - Gestion des erreurs
  - État de chargement

## Data Models

### Collection MongoDB : `ministry_secondary_stats`

```javascript
{
  _id: ObjectId,
  type: "ministry_secondary_stats", // Identifiant unique
  sections: {
    mission: {
      enabled: Boolean,
      stats: [{
        id: String,        // Identifiant unique de la stat
        label: String,     // Libellé affiché
        value: Number,     // Valeur numérique
        unit: String,      // Unité optionnelle (%, +, etc.)
        order: Number      // Ordre d'affichage
      }]
    },
    organisation: { /* même structure */ },
    direction: { /* même structure */ }
  },
  lastUpdated: Date,
  updatedBy: String,     // Email de l'utilisateur
  createdAt: Date,
  version: Number        // Pour la gestion des versions
}
```

### Validation Schema

```javascript
const sectionStatsSchema = {
  enabled: { type: Boolean, default: true },
  stats: [{
    id: { type: String, required: true, match: /^[a-z_]+$/ },
    label: { type: String, required: true, maxLength: 50 },
    value: { type: Number, required: true, min: 0, max: 999999 },
    unit: { type: String, maxLength: 10 },
    order: { type: Number, required: true, min: 1 }
  }]
};
```

## Error Handling

### Validation côté client
- Validation des champs en temps réel
- Vérification de la syntaxe JSON
- Contrôle des valeurs numériques
- Messages d'erreur contextuels

### Validation côté serveur
- Schema validation avec Joi ou similaire
- Vérification des permissions
- Sanitisation des données
- Gestion des erreurs de base de données

### Gestion des erreurs d'affichage
- Fallback vers valeurs par défaut
- Affichage gracieux en cas d'erreur
- Logs détaillés pour le debugging
- Mode dégradé sans statistiques

## Testing Strategy

### Tests unitaires
- Validation des schémas de données
- Logique de formatage des statistiques
- Fonctions utilitaires
- Hooks personnalisés

### Tests d'intégration
- API endpoints avec base de données
- Flux complet de modification
- Gestion des permissions
- Cache et invalidation

### Tests E2E
- Parcours administrateur complet
- Modification et sauvegarde
- Affichage sur la page publique
- Réinitialisation des données

### Tests de performance
- Temps de chargement des statistiques
- Impact sur la page ministère
- Optimisation des requêtes
- Cache efficace

## Security Considerations

### Authentification et autorisation
- Vérification des permissions admin
- Validation des tokens JWT
- Audit trail des modifications
- Rate limiting sur les APIs

### Validation des données
- Sanitisation des entrées utilisateur
- Validation stricte des types
- Prévention des injections
- Limitation des tailles de données

### Sécurité de l'affichage
- Échappement des données affichées
- Validation côté client et serveur
- Protection contre XSS
- CSP headers appropriés

## Performance Optimizations

### Cache Strategy
- Cache Redis pour les statistiques publiques
- TTL de 5 minutes pour les données
- Invalidation lors des modifications
- Cache navigateur avec headers appropriés

### Base de données
- Index sur le champ `type`
- Requêtes optimisées avec projection
- Connection pooling
- Monitoring des performances

### Frontend
- Lazy loading du composant admin
- Debouncing des saisies utilisateur
- Optimistic updates
- Compression des données JSON

## Migration Strategy

### Phase 1 : Infrastructure
- Création des APIs et modèles
- Tests unitaires et d'intégration
- Documentation technique

### Phase 2 : Interface d'administration
- Composant de gestion
- Interface utilisateur
- Validation et tests

### Phase 3 : Intégration frontend
- Modification de la page ministère
- Affichage des statistiques
- Tests E2E complets

### Phase 4 : Déploiement
- Migration des données existantes
- Formation des administrateurs
- Monitoring et optimisations