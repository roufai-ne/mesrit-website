# Requirements Document - Statistiques Secondaires du Ministère

## Introduction

Cette fonctionnalité permet aux administrateurs de configurer et modifier les statistiques secondaires affichées dans les sous-sections de la page ministère via une interface d'administration avec configuration JSON. Ces statistiques apparaissent dans les cartes des sections "Notre Mission", "Organisation", et "Direction" sous forme de petits indicateurs numériques.

## Requirements

### Requirement 1

**User Story:** En tant qu'administrateur, je veux pouvoir configurer les statistiques secondaires affichées dans les sections de la page ministère, afin de maintenir les informations à jour sans intervention technique.

#### Acceptance Criteria

1. WHEN l'administrateur accède à la configuration des statistiques secondaires THEN le système SHALL afficher une interface permettant de modifier les statistiques par section
2. WHEN l'administrateur modifie une statistique secondaire THEN le système SHALL valider les données et sauvegarder la configuration
3. WHEN la configuration est sauvegardée THEN les modifications SHALL être visibles immédiatement sur la page ministère
4. WHEN aucune configuration personnalisée n'existe THEN le système SHALL utiliser des valeurs par défaut

### Requirement 2

**User Story:** En tant qu'administrateur, je veux pouvoir gérer les statistiques par section (Mission, Organisation, Direction), afin d'avoir un contrôle granulaire sur l'affichage.

#### Acceptance Criteria

1. WHEN l'administrateur configure une section THEN le système SHALL permettre d'ajouter, modifier ou supprimer des statistiques pour cette section
2. WHEN une statistique est configurée THEN elle SHALL inclure un libellé, une valeur numérique, et optionnellement une unité
3. WHEN plusieurs statistiques sont configurées pour une section THEN elles SHALL s'afficher dans l'ordre défini
4. WHEN une section n'a pas de statistiques configurées THEN elle SHALL ne pas afficher de zone statistiques

### Requirement 3

**User Story:** En tant qu'administrateur, je veux pouvoir utiliser un éditeur JSON pour des modifications avancées, afin d'avoir plus de flexibilité dans la configuration.

#### Acceptance Criteria

1. WHEN l'administrateur active le mode JSON THEN le système SHALL afficher la configuration complète en format JSON éditable
2. WHEN l'administrateur modifie le JSON THEN le système SHALL valider la syntaxe avant la sauvegarde
3. WHEN le JSON est invalide THEN le système SHALL afficher un message d'erreur et empêcher la sauvegarde
4. WHEN l'administrateur revient au mode visuel THEN les modifications JSON SHALL être reflétées dans l'interface

### Requirement 4

**User Story:** En tant qu'utilisateur du site, je veux voir les statistiques secondaires mises à jour dans les sections du ministère, afin d'avoir accès aux informations les plus récentes.

#### Acceptance Criteria

1. WHEN je visite la page ministère THEN les statistiques secondaires configurées SHALL s'afficher dans les sections appropriées
2. WHEN une section a des statistiques configurées THEN elles SHALL s'afficher sous forme de grille avec libellé et valeur
3. WHEN les statistiques sont mises à jour par un administrateur THEN elles SHALL être visibles sans rechargement de page
4. WHEN aucune statistique n'est configurée pour une section THEN la section SHALL s'afficher normalement sans zone statistiques

### Requirement 5

**User Story:** En tant qu'administrateur, je veux pouvoir réinitialiser la configuration des statistiques secondaires, afin de revenir aux valeurs par défaut en cas de problème.

#### Acceptance Criteria

1. WHEN l'administrateur clique sur réinitialiser THEN le système SHALL demander une confirmation
2. WHEN la réinitialisation est confirmée THEN le système SHALL supprimer la configuration personnalisée
3. WHEN la configuration est réinitialisée THEN le système SHALL revenir aux valeurs par défaut
4. WHEN la réinitialisation est effectuée THEN l'administrateur SHALL recevoir une notification de succès