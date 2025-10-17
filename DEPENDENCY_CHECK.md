# Vérification des Dépendances - Système V2

## 📋 Statut des Dépendances

### ✅ Nouvelles Dépendances V2

| Dépendance | Version | Type | Statut | Description |
|------------|---------|------|--------|-------------|
| `events` | Built-in | Core | ✅ OK | EventEmitter pour système d'événements |
| `chart.js` | ^4.4.0 | Frontend | ✅ OK | Graphiques pour dashboard analytics |
| `react-chartjs-2` | ^5.2.0 | Frontend | ✅ OK | Intégration Chart.js pour React |

### 📦 Dépendances Existantes Utilisées

| Dépendance | Version Actuelle | Compatible V2 | Notes |
|------------|------------------|---------------|-------|
| `mongoose` | ^8.0.0 | ✅ Oui | Utilisé pour nouveaux modèles |
| `next` | ^15.5.4 | ✅ Oui | Compatible avec nouveaux hooks |
| `react` | ^18.0.0 | ✅ Oui | Hook patterns utilisés |
| `mongodb` | ^6.0.0 | ✅ Oui | Driver pour agrégations avancées |

### 🔧 Dépendances Optionnelles

| Dépendance | Version | Utilité | Installation |
|------------|---------|---------|--------------|
| `redis` | ^4.6.0 | Cache distribué | `npm install redis` |
| `@sentry/node` | ^7.0.0 | Monitoring avancé | `npm install @sentry/node` |
| `prom-client` | ^15.0.0 | Métriques Prometheus | `npm install prom-client` |

## 🔍 Vérification Automatique

```bash
# Exécuter la vérification des dépendances
node -e "
const pkg = require('./package.json');
const fs = require('fs');

console.log('🔍 Vérification dépendances V2...');

// Vérifier événements (built-in)
try {
  require('events');
  console.log('✅ events: OK');
} catch(e) {
  console.log('❌ events: ERREUR -', e.message);
}

// Vérifier Chart.js si présent
try {
  require('chart.js');
  console.log('✅ chart.js: OK');
} catch(e) {
  console.log('⚠️ chart.js: Non installé (optionnel pour dashboard)');
}

// Vérifier mongoose
try {
  const mongoose = require('mongoose');
  console.log('✅ mongoose:', mongoose.version);
} catch(e) {
  console.log('❌ mongoose: ERREUR -', e.message);
}

// Vérifier que les nouveaux fichiers existent
const requiredFiles = [
  'src/lib/eventBus.js',
  'src/lib/newsAnalyticsV2.js',
  'src/lib/intelligentCache.js',
  'src/lib/newsErrors.js',
  'src/models/ViewEvent.js',
  'src/models/ShareEvent.js',
  'src/models/DailyNewsStats.js'
];

let missingFiles = 0;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log('✅', file);
  } else {
    console.log('❌', file, '- MANQUANT');
    missingFiles++;
  }
});

if (missingFiles === 0) {
  console.log('\\n🎉 Toutes les dépendances V2 sont disponibles!');
} else {
  console.log('\\n⚠️ ', missingFiles, 'fichiers manquants détectés');
}
"
```

## 📦 Installation des Dépendances Manquantes

### Dépendances Obligatoires

Si des dépendances sont manquantes :

```bash
# Installer les dépendances Chart.js (pour dashboard)
npm install chart.js react-chartjs-2

# Vérifier la version de mongoose
npm list mongoose

# Mettre à jour si nécessaire
npm update mongoose
```

### Dépendances Optionnelles Recommandées

```bash
# Pour cache Redis distribué
npm install redis
npm install ioredis  # Alternative client Redis

# Pour monitoring avancé
npm install @sentry/node @sentry/tracing

# Pour métriques Prometheus
npm install prom-client

# Pour tests de performance
npm install --save-dev artillery clinic
```

## 🔧 Configuration Post-Installation

### 1. Configuration Chart.js

Si vous installez Chart.js pour le dashboard :

```javascript
// Dans next.config.js, ajouter si nécessaire :
module.exports = {
  // ... config existante
  webpack: (config) => {
    config.externals = {
      ...config.externals,
      'chart.js': 'Chart'
    };
    return config;
  }
};
```

### 2. Configuration Redis (Optionnel)

```javascript
// Dans .env
REDIS_URL=redis://localhost:6379
CACHE_PROVIDER=redis

// Dans src/lib/intelligentCache.js - modification pour Redis
import Redis from 'redis';

class IntelligentCache {
  constructor() {
    if (process.env.CACHE_PROVIDER === 'redis') {
      this.redis = Redis.createClient({
        url: process.env.REDIS_URL
      });
    }
    // ... reste de la configuration
  }
}
```

### 3. Configuration Monitoring Avancé

```javascript
// Dans src/lib/monitoringV2.js - ajout Sentry
import * as Sentry from '@sentry/node';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    integrations: [
      new Sentry.Integrations.Mongo()
    ]
  });
}
```

## 🧪 Tests de Compatibilité

### Test des Imports

```bash
# Créer un script de test
cat > test-imports.js << EOF
console.log('🧪 Test des imports V2...');

try {
  // Core V2
  const eventBus = require('./src/lib/eventBus.js');
  const analyticsV2 = require('./src/lib/newsAnalyticsV2.js');
  const cache = require('./src/lib/intelligentCache.js');
  const errors = require('./src/lib/newsErrors.js');

  // Modèles
  const ViewEvent = require('./src/models/ViewEvent.js');
  const ShareEvent = require('./src/models/ShareEvent.js');
  const DailyNewsStats = require('./src/models/DailyNewsStats.js');

  console.log('✅ Tous les imports V2 fonctionnent');

  // Test EventBus
  console.log('🧪 Test EventBus...');
  eventBus.default.emitEvent('test', { data: 'test' });
  console.log('✅ EventBus OK');

  // Test Cache
  console.log('🧪 Test Cache...');
  cache.default.set('test', 'value');
  const value = cache.default.get('test');
  console.log('✅ Cache OK');

} catch (error) {
  console.log('❌ Erreur import:', error.message);
  process.exit(1);
}
EOF

# Exécuter le test
node test-imports.js
rm test-imports.js
```

### Test de Performance

```bash
# Test rapide de performance
node -e "
const start = Date.now();

// Test import speed
require('./src/lib/newsAnalyticsV2.js');
require('./src/lib/intelligentCache.js');
require('./src/lib/eventBus.js');

const loadTime = Date.now() - start;
console.log('⚡ Temps de chargement modules V2:', loadTime, 'ms');

if (loadTime < 1000) {
  console.log('✅ Performance imports: OK');
} else {
  console.log('⚠️ Performance imports: Lent');
}
"
```

## 🔄 Migration des Dépendances

### Suppression des Anciennes Dépendances (Optionnel)

Une fois V2 stable, vous pouvez supprimer les anciennes dépendances non utilisées :

```bash
# Analyser les dépendances inutilisées
npx depcheck

# Supprimer les dépendances obsolètes (après vérification)
# npm uninstall old-package-name
```

### Mise à Jour du package.json

```json
{
  "dependencies": {
    "chart.js": "^4.4.0",
    "react-chartjs-2": "^5.2.0"
  },
  "optionalDependencies": {
    "redis": "^4.6.0",
    "@sentry/node": "^7.0.0",
    "prom-client": "^15.0.0"
  },
  "scripts": {
    "check-deps": "node scripts/check-dependencies.js",
    "setup:indexes": "node src/scripts/createOptimizedIndexes.js",
    "migrate:v2": "node src/scripts/migrateToV2Analytics.js",
    "test:integration": "node src/scripts/integrationTestsV2.js",
    "optimize": "node src/scripts/performanceOptimizerV2.js",
    "maintenance": "node src/scripts/autoMaintenanceV2.js"
  }
}
```

## 🚨 Résolution des Problèmes

### Problèmes Fréquents

**1. Erreur "Cannot find module 'events'"**
```bash
# events est built-in Node.js, vérifier version Node
node --version
# Doit être ≥ 14.0.0
```

**2. Erreur Chart.js dans Next.js**
```bash
# Installer les dépendances Chart.js
npm install chart.js react-chartjs-2

# Ajouter au next.config.js :
transpilePackages: ['chart.js']
```

**3. Erreur MongoDB/Mongoose**
```bash
# Vérifier la connexion
node -e "
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test')
  .then(() => console.log('✅ MongoDB OK'))
  .catch(err => console.log('❌ MongoDB:', err.message));
"
```

**4. Conflits de versions**
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

## 📊 Monitoring des Dépendances

### Vérification Continue

```bash
# Ajouter au crontab pour vérification hebdomadaire
0 9 * * 1 cd /var/www/mesrit-website && npm audit --audit-level moderate
```

### Alertes de Sécurité

```bash
# Configurer les alertes npm
npm audit --audit-level high

# Installer snyk pour monitoring continu
npm install -g snyk
snyk auth
snyk monitor
```

## ✅ Checklist de Validation

- [ ] Node.js ≥ 18.0.0 installé
- [ ] MongoDB ≥ 5.0 installé et configuré
- [ ] Tous les nouveaux fichiers V2 présents
- [ ] Dépendances npm installées sans erreur
- [ ] Tests d'imports réussis
- [ ] Performance de chargement acceptable
- [ ] Configuration optionnelle selon besoins
- [ ] Scripts de maintenance configurés
- [ ] Monitoring de sécurité activé

---

**Note** : Cette vérification doit être exécutée avant chaque déploiement et après chaque mise à jour majeure du système.

**Dernière mise à jour** : Décembre 2024