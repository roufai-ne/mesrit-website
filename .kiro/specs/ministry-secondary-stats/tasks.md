# Implementation Plan - Statistiques Secondaires du Ministère

- [x] 1. Étendre le fichier settings.json avec les statistiques secondaires

  - Ajouter la section `ministryStats` dans `data/settings.json`
  - Définir la structure par défaut pour les sections Mission, Organisation, Direction
  - Créer les valeurs par défaut pour chaque section avec statistiques d'exemple
  - Tester la lecture des nouvelles données via l'API settings existante
  - _Requirements: 1.1, 1.4_

- [x] 2. Créer le composant d'affichage des statistiques secondaires

  - Développer `SectionStatsDisplay` dans `src/components/ministry/SectionStatsDisplay.js`
  - Implémenter l'affichage en grille responsive des statistiques
  - Ajouter le formatage des valeurs numériques avec unités optionnelles
  - Gérer l'affichage conditionnel selon la configuration des sections
  - _Requirements: 4.1, 4.2, 4.4_

- [x] 3. Intégrer l'affichage dans la page ministère existante

  - Modifier `src/pages/ministere/index.js` pour charger les settings
  - Intégrer `SectionStatsDisplay` dans les sections Mission, Organisation, Direction
  - Utiliser le contexte SettingsContext existant pour récupérer les données
  - Ajouter la gestion d'erreurs avec fallback gracieux
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 4. Étendre l'interface d'administration des paramètres

  - Modifier `src/components/admin/Settings.js` pour inclure les statistiques secondaires
  - Ajouter une nouvelle section "Statistiques du Ministère" dans l'interface

  - Créer des onglets pour chaque section (Mission, Organisation, Direction)
  - Implémenter les formulaires pour ajouter/modifier/supprimer des statistiques
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3_

- [-] 5. Ajouter la gestion des statistiques par section

  - Créer les contrôles pour activer/désactiver chaque section
  - Implémenter l'ajout dynamique de nouvelles statistiques
  - Ajouter la réorganisation par glisser-déposer ou boutons ordre
  - Créer la validation des champs (libellé, valeur, unité)
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 6. Implémenter le mode JSON avancé

  - Ajouter un bouton "Mode JSON" dans la section statistiques
  - Créer un éditeur JSON avec textarea et validation syntaxique
  - Implémenter la synchronisation bidirectionnelle visuel ↔ JSON
  - Ajouter les messages d'erreur pour JSON invalide
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 7. Ajouter la fonctionnalité de réinitialisation


  - Créer un bouton "Réinitialiser les statistiques" avec confirmation
  - Implémenter la restauration des valeurs par défaut
  - Utiliser l'API settings/update existante pour la sauvegarde

  - Ajouter les notifications de succès/erreur avec toast
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 8. Améliorer la validation et la sécurité

  - Étendre la validation dans `src/pages/api/settings/update.js`
  - Ajouter la validation des statistiques secondaires côté serveur
  - Implémenter la sanitisation des données utilisateur
  - Vérifier les permissions admin existantes
  - _Requirements: 1.2, 1.3_

- [ ] 9. Optimiser l'interface utilisateur

  - Ajouter des icônes appropriées pour chaque type de statistique
  - Implémenter la prévisualisation en temps réel des modifications
  - Créer des tooltips d'aide pour guider l'utilisateur
  - Ajouter l'état de chargement pendant les sauvegardes
  - _Requirements: 1.1, 2.1_

- [ ] 10. Gérer les cas d'erreur et fallbacks

  - Implémenter les valeurs par défaut si settings.json est corrompu
  - Ajouter la gestion d'erreurs pour l'affichage public
  - Créer le mode dégradé sans statistiques en cas de problème
  - Ajouter les logs appropriés pour le debugging
  - _Requirements: 1.4, 4.4_

- [ ]\* 11. Créer les tests unitaires

  - Tester le composant SectionStatsDisplay avec différentes configurations
  - Tester la validation des données de statistiques
  - Créer les tests pour l'interface d'administration étendue
  - Tester les cas d'erreur et les fallbacks
  - _Requirements: 1.2, 2.1, 4.1_

- [ ]\* 12. Développer les tests d'intégration

  - Tester le flux complet de modification des statistiques
  - Vérifier l'intégration avec l'API settings existante
  - Tester la persistance dans le fichier JSON
  - Valider l'affichage sur la page ministère après modification
  - _Requirements: 1.1, 1.3, 4.1_

- [ ] 13. Finaliser et documenter
  - Créer la documentation utilisateur pour la gestion des statistiques
  - Ajouter des exemples de configuration dans les commentaires
  - Tester l'ensemble du système en conditions réelles
  - Optimiser les performances d'affichage
  - _Requirements: 1.4, 4.3_
