# Indexation du Site pour le Chatbot

## 🔍 Problème Identifié

Le chatbot ne retrouve pas les informations du site car **la base de données `PageContent` n'est pas peuplée**.

Le chatbot utilise MongoDB pour chercher du contenu pertinent et répondre aux questions des utilisateurs. Sans contenu indexé, il fonctionne en **mode dégradé** avec seulement des informations générales.

---

## ✅ Solution : Crawler Local

J'ai créé un script de crawling simplifié qui indexe automatiquement toutes les pages du site en local.

### Caractéristiques

- ✅ Crawl de **29 pages publiques** du site
- ✅ Extraction du contenu textuel (sans HTML)
- ✅ Métadonnées (title, description, keywords)
- ✅ Score de pertinence par page (1-10)
- ✅ Gestion d'erreurs robuste
- ✅ Compatible avec serveur local (localhost:3000)
- ✅ Sauvegarde dans MongoDB (collection `pagecontents`)

---

## 🚀 Comment Indexer le Site

### Étape 1 : Vérifier MongoDB

Assurez-vous que MongoDB est configuré et accessible :

```bash
# Vérifier .env
cat .env | grep MONGODB_URI

# Si MongoDB n'est pas installé localement, utiliser MongoDB Atlas
# ou installer MongoDB: https://www.mongodb.com/try/download/community
```

### Étape 2 : Démarrer le Serveur de Développement

Le crawler a besoin que le site soit accessible en local :

```bash
npm run dev
```

Laissez ce terminal ouvert et ouvrez un **nouveau terminal**.

### Étape 3 : Lancer le Crawler

Dans le nouveau terminal :

```bash
npm run crawler:local
```

**Résultat attendu** :
```
═══════════════════════════════════════════
🚀 MESRIT Site Crawler - Local Mode
═══════════════════════════════════════════
📍 Base URL: http://localhost:3000
🗄️  MongoDB: Configured
📊 Pages to crawl: 29
═══════════════════════════════════════════

✅ Connected to MongoDB
✅ Local server is running

[1/29] 📄 Crawling: http://localhost:3000/
[1/29] ✅ Accueil (4532 chars, score: 10)

[2/29] 📄 Crawling: http://localhost:3000/ministere
[2/29] ✅ Le Ministère (3821 chars, score: 10)

...

═══════════════════════════════════════════
📊 CRAWL COMPLETED
═══════════════════════════════════════════
✅ Successful: 29/29
❌ Failed: 0/29
📝 Total content: 125.43 KB

💬 Chatbot is now ready to use with site content!
═══════════════════════════════════════════
```

---

## 📋 Pages Indexées (29 pages)

### 🏛️ Pages Principales (4)
- `/` - Accueil (score: 10)
- `/sitemap` - Plan du Site (score: 5)
- `/support` - Support (score: 6)
- `/services-etudiants` - Services Étudiants (score: 9)

### 🏢 Ministère (5)
- `/ministere` - Le Ministère (score: 10)
- `/ministere/missions` - Missions et Vision (score: 9)
- `/ministere/historique` - Historique (score: 7)
- `/ministere/organisation` - Organisation (score: 8)
- `/ministere/direction` - Directions (score: 8)

### 🎓 Établissements (5)
- `/etablissements` - Établissements (score: 10)
- `/etablissements/universites` - Universités (score: 9)
- `/etablissements/instituts` - Instituts (score: 8)
- `/etablissements/ecoles` - Écoles (score: 8)
- `/etablissements/centres` - Centres Formation (score: 7)

### 📰 Actualités (1)
- `/actualites` - Actualités (score: 9)

### 📚 Documentation (5)
- `/documentation` - Documentation (score: 8)
- `/documentation/lois` - Lois et Décrets (score: 7)
- `/documentation/circulaires` - Circulaires (score: 6)
- `/documentation/rapports` - Rapports (score: 6)
- `/documentation/guides` - Guides (score: 7)

### 💼 Services (1)
- `/services` - Services (score: 9)

### 📞 Contact & Support (3)
- `/contact` - Contact (score: 10)
- `/faq` - FAQ (score: 8)

### 📧 Newsletter (2)
- `/newsletter/confirm-email` - Confirmation (score: 3)
- `/newsletter/unsubscribe` - Désinscription (score: 2)

### ⚖️ Pages Légales (3)
- `/mentions-legales` - Mentions Légales (score: 4)
- `/politique-confidentialite` - Confidentialité (score: 5)
- `/conditions-utilisation` - Conditions (score: 4)

---

## 🧪 Tester le Chatbot

Après avoir indexé le site :

1. **Ouvrir le site** : http://localhost:3000
2. **Cliquer sur le bouton chatbot** (coin bas-droit)
3. **Poser une question** :
   ```
   "Quelle est la mission du MESRIT?"
   "Comment contacter le ministère?"
   "Quels sont les établissements disponibles?"
   ```

**Résultat attendu** : Le chatbot répond avec des informations précises extraites des pages indexées.

---

## 🔄 Mettre à Jour l'Index

Si vous modifiez le contenu du site, relancez le crawler :

```bash
npm run crawler:local
```

Le crawler met à jour automatiquement les pages existantes (upsert).

---

## ⚙️ Configuration Avancée

### Crawler d'un Site Distant

Pour crawler le site en production (non recommandé en dev) :

```bash
# Dans .env
CRAWLER_BASE_URL=https://votre-site.mesrit.com

# Puis
npm run crawler:local
```

### Crawler Incrémental

Pour re-crawler uniquement les pages anciennes (>7 jours) :

```bash
npm run crawler:incremental
```

---

## 📊 Base de Données MongoDB

### Collection : `pagecontents`

Structure d'un document :

```javascript
{
  _id: ObjectId("..."),
  url: "http://localhost:3000/ministere",
  title: "Le Ministère",
  content: "Texte extrait de la page...",
  section: "ministere",
  description: "Description courte...",
  keywords: ["ministère", "enseignement", "supérieur"],
  relevanceScore: 10,
  isActive: true,
  lastCrawled: ISODate("2025-12-08T..."),
  crawlMeta: {
    statusCode: 200,
    crawlDuration: 523,
    contentLength: 3821
  },
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

### Index Full-Text

Le crawler crée automatiquement un index full-text MongoDB sur :
- `title` (poids: 10)
- `keywords` (poids: 8)
- `description` (poids: 5)
- `content` (poids: 1)

Cela permet des recherches rapides et pertinentes.

---

## 🔧 Dépannage

### Erreur : "Local server is not accessible"

**Cause** : Le serveur de développement n'est pas démarré

**Solution** :
```bash
# Terminal 1
npm run dev

# Terminal 2 (nouveau)
npm run crawler:local
```

---

### Erreur : "MONGODB_URI not configured"

**Cause** : Variable d'environnement manquante

**Solution** :
```bash
# Vérifier .env
cat .env | grep MONGODB_URI

# Si absent, ajouter :
echo "MONGODB_URI=mongodb://localhost:27017/mesrit_db" >> .env
```

---

### Erreur : "Page not found (404)"

**Cause** : La page n'existe pas sur le site

**Solution** : C'est normal pour certaines pages non implémentées. Le crawler marque ces pages comme `isActive: false` et continue.

---

### Pages Crawlées = 0

**Cause** : Problème de connexion ou serveur down

**Solutions** :
1. Vérifier que `npm run dev` fonctionne
2. Ouvrir http://localhost:3000 dans le navigateur
3. Vérifier les logs du crawler pour des erreurs spécifiques

---

## 📈 Impact sur le Chatbot

### Avant Indexation (Mode Dégradé)

```
User: "Quelle est la mission du MESRIT?"
Bot: "Je dispose d'informations limitées.
      Je vous suggère de consulter la page /ministere
      ou de contacter le ministère via /contact."
```

### Après Indexation (Mode Complet)

```
User: "Quelle est la mission du MESRIT?"
Bot: "Le MESRIT a pour mission de promouvoir
      l'enseignement supérieur, la recherche scientifique
      et l'innovation technologique. Il supervise les
      universités, instituts et centres de formation.

      Plus d'infos sur /ministere/missions"
```

---

## 🎯 Scores de Pertinence

Les scores déterminent la priorité des résultats dans le chatbot :

| Score | Signification | Exemples |
|-------|---------------|----------|
| 10 | Critique | Accueil, Ministère, Établissements, Contact |
| 9 | Très important | Services, Actualités, Universités |
| 8 | Important | Organisation, Documentation, FAQ |
| 7 | Utile | Historique, Guides, Instituts |
| 6 | Secondaire | Support, Circulaires |
| 5 | Tertiaire | Plan du site, Confidentialité |
| 4 | Faible | Mentions légales |
| 2-3 | Très faible | Newsletter confirm/unsubscribe |

---

## 📝 Maintenance

### Crawler Automatique (Recommandé)

Pour garder l'index à jour automatiquement, créer un cron job :

```bash
# Fichier: crontab -e
# Re-crawler toutes les 24h à 2h du matin
0 2 * * * cd /path/to/project && npm run crawler:local >> /var/log/crawler.log 2>&1
```

Ou utiliser un service comme **Vercel Cron** ou **GitHub Actions**.

---

## 🔗 Fichiers Concernés

- **Crawler** : [scripts/crawlLocal.js](scripts/crawlLocal.js)
- **Service ChatBot** : [src/lib/aiChatService.js](src/lib/aiChatService.js)
- **Service Recherche** : [src/services/search.js](src/services/search.js)
- **Modèle MongoDB** : [src/models/PageContent.js](src/models/PageContent.js)

---

## ✅ Checklist de Déploiement

Avant de déployer en production :

- [ ] Crawler exécuté avec succès (29/29 pages)
- [ ] Base de données MongoDB accessible
- [ ] Index full-text créé (voir [scripts/createSearchIndexes.js](scripts/createSearchIndexes.js))
- [ ] Chatbot testé avec plusieurs questions
- [ ] Variables d'environnement configurées en production
- [ ] Cron job configuré pour re-crawling automatique

---

## 🆘 Besoin d'Aide ?

Consultez les logs du crawler pour diagnostiquer les problèmes :

```bash
npm run crawler:local 2>&1 | tee crawler.log
```

Ensuite, vérifier `crawler.log` pour les erreurs détaillées.

---

**Date** : 08/12/2025
**Version** : 1.0
