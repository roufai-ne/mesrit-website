#!/usr/bin/env node
// scripts/setupV2.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

/**
 * Script de configuration automatique pour le système V2
 * Gère la configuration complète du nouveau système
 */
class SetupV2 {
  constructor() {
    this.config = {
      environment: 'development',
      features: {
        analytics: true,
        seo: true,
        monitoring: true,
        cache: true
      },
      database: {},
      performance: {}
    };

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Configuration interactive complète
   */
  async setup() {
    console.log(`
🚀 CONFIGURATION SYSTÈME D'ACTUALITÉS V2
=======================================

Ce script va configurer automatiquement :
✅ Base de données et index optimisés
✅ Variables d'environnement
✅ Cache intelligent
✅ Monitoring et alertes
✅ SEO automatique
✅ Analytics V2
✅ Scripts de maintenance

`);

    try {
      // 1. Vérifier les prérequis
      await this.checkPrerequisites();

      // 2. Configuration environnement
      await this.configureEnvironment();

      // 3. Configuration base de données
      await this.configureDatabase();

      // 4. Configuration des fonctionnalités
      await this.configureFeatures();

      // 5. Installation et configuration
      await this.installAndConfigure();

      // 6. Tests de validation
      await this.runValidationTests();

      console.log('\n🎉 Configuration V2 terminée avec succès !');
      console.log('\n📚 Prochaines étapes :');
      console.log('1. Exécuter: npm run migrate:v2');
      console.log('2. Démarrer: npm run dev');
      console.log('3. Tester: npm run test:integration');

    } catch (error) {
      console.error('\n❌ Erreur configuration:', error.message);
      process.exit(1);
    } finally {
      this.rl.close();
    }
  }

  /**
   * Vérifier les prérequis système
   */
  async checkPrerequisites() {
    console.log('🔍 Vérification des prérequis...');

    // Vérifier Node.js
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));

    if (majorVersion < 18) {
      throw new Error(`Node.js ${majorVersion} détecté. Version ≥18 requise.`);
    }
    console.log(`✅ Node.js ${nodeVersion}`);

    // Vérifier npm
    try {
      const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
      console.log(`✅ npm ${npmVersion}`);
    } catch (error) {
      throw new Error('npm non trouvé');
    }

    // Vérifier MongoDB
    try {
      execSync('mongod --version', { stdio: 'pipe' });
      console.log('✅ MongoDB installé');
    } catch (error) {
      console.log('⚠️ MongoDB non détecté localement');

      const useRemote = await this.question('Utiliser MongoDB distant ? (y/n): ');
      if (useRemote.toLowerCase() !== 'y') {
        throw new Error('MongoDB requis pour le système V2');
      }
    }

    // Vérifier les fichiers V2
    const requiredFiles = [
      'src/lib/eventBus.js',
      'src/lib/newsAnalyticsV2.js',
      'src/lib/intelligentCache.js',
      'src/models/ViewEvent.js'
    ];

    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`Fichier manquant: ${file}`);
      }
    }
    console.log('✅ Fichiers V2 présents');
  }

  /**
   * Configuration de l'environnement
   */
  async configureEnvironment() {
    console.log('\n⚙️ Configuration environnement...');

    // Déterminer l'environnement
    const env = await this.question('Environnement (development/staging/production) [development]: ');
    this.config.environment = env || 'development';

    // Configurer le domaine
    if (this.config.environment === 'production') {
      const domain = await this.question('Nom de domaine: ');
      this.config.domain = domain;
    } else {
      this.config.domain = 'http://localhost:3000';
    }

    console.log(`✅ Environnement: ${this.config.environment}`);
    console.log(`✅ Domaine: ${this.config.domain}`);
  }

  /**
   * Configuration base de données
   */
  async configureDatabase() {
    console.log('\n🗄️ Configuration base de données...');

    const useLocal = await this.question('Utiliser MongoDB local ? (y/n) [y]: ');

    if ((useLocal || 'y').toLowerCase() === 'y') {
      // Configuration locale
      this.config.database = {
        uri: 'mongodb://localhost:27017/mesrit_website',
        name: 'mesrit_website'
      };

      // Tester la connexion
      try {
        await this.testDatabaseConnection();
        console.log('✅ Connexion MongoDB locale OK');
      } catch (error) {
        console.log('⚠️ Échec connexion locale, configuration manuelle requise');
      }
    } else {
      // Configuration distante
      const host = await this.question('Host MongoDB: ');
      const port = await this.question('Port [27017]: ') || '27017';
      const database = await this.question('Nom base de données [mesrit_website]: ') || 'mesrit_website';
      const username = await this.question('Utilisateur: ');
      const password = await this.question('Mot de passe: ');

      this.config.database = {
        uri: `mongodb://${username}:${password}@${host}:${port}/${database}`,
        name: database
      };

      try {
        await this.testDatabaseConnection();
        console.log('✅ Connexion MongoDB distante OK');
      } catch (error) {
        console.log('⚠️ Échec connexion distante:', error.message);
        const proceed = await this.question('Continuer malgré l\'erreur ? (y/n): ');
        if (proceed.toLowerCase() !== 'y') {
          throw new Error('Configuration base de données requise');
        }
      }
    }
  }

  /**
   * Configuration des fonctionnalités
   */
  async configureFeatures() {
    console.log('\n🎛️ Configuration des fonctionnalités...');

    // Analytics
    const enableAnalytics = await this.question('Activer Analytics V2 ? (y/n) [y]: ');
    this.config.features.analytics = (enableAnalytics || 'y').toLowerCase() === 'y';

    // SEO
    const enableSEO = await this.question('Activer SEO automatique ? (y/n) [y]: ');
    this.config.features.seo = (enableSEO || 'y').toLowerCase() === 'y';

    // Monitoring
    const enableMonitoring = await this.question('Activer monitoring ? (y/n) [y]: ');
    this.config.features.monitoring = (enableMonitoring || 'y').toLowerCase() === 'y';

    // Cache intelligent
    const enableCache = await this.question('Activer cache intelligent ? (y/n) [y]: ');
    this.config.features.cache = (enableCache || 'y').toLowerCase() === 'y';

    // Configuration cache
    if (this.config.features.cache) {
      const cacheSize = await this.question('Taille max cache [2000]: ') || '2000';
      const cacheTTL = await this.question('TTL par défaut (ms) [300000]: ') || '300000';

      this.config.performance.cacheSize = parseInt(cacheSize);
      this.config.performance.cacheTTL = parseInt(cacheTTL);
    }

    console.log('\n✅ Fonctionnalités configurées:');
    Object.entries(this.config.features).forEach(([feature, enabled]) => {
      console.log(`  ${enabled ? '✅' : '❌'} ${feature}`);
    });
  }

  /**
   * Installation et configuration
   */
  async installAndConfigure() {
    console.log('\n📦 Installation et configuration...');

    // 1. Installer les dépendances
    console.log('📥 Installation des dépendances...');
    try {
      execSync('npm install chart.js react-chartjs-2', { stdio: 'inherit' });
      console.log('✅ Dépendances Chart.js installées');
    } catch (error) {
      console.log('⚠️ Échec installation Chart.js');
    }

    // 2. Créer le fichier .env
    await this.createEnvironmentFile();

    // 3. Configurer les index MongoDB
    console.log('🔧 Configuration des index MongoDB...');
    try {
      execSync('node src/scripts/createOptimizedIndexes.js', { stdio: 'inherit' });
      console.log('✅ Index MongoDB créés');
    } catch (error) {
      console.log('⚠️ Échec création index:', error.message);
    }

    // 4. Configurer les scripts package.json
    await this.updatePackageScripts();

    // 5. Créer les dossiers nécessaires
    await this.createDirectories();

    console.log('✅ Installation et configuration terminées');
  }

  /**
   * Créer le fichier d'environnement
   */
  async createEnvironmentFile() {
    console.log('📝 Création fichier .env...');

    const envFile = this.config.environment === 'production' ? '.env.production' : '.env.local';

    const envContent = this.generateEnvironmentContent();

    // Backup de l'ancien fichier s'il existe
    if (fs.existsSync(envFile)) {
      const backup = `${envFile}.backup.${Date.now()}`;
      fs.copyFileSync(envFile, backup);
      console.log(`📋 Backup créé: ${backup}`);
    }

    fs.writeFileSync(envFile, envContent);
    console.log(`✅ Fichier ${envFile} créé`);
  }

  /**
   * Générer le contenu du fichier .env
   */
  generateEnvironmentContent() {
    const secrets = this.generateSecrets();

    return `# Configuration Système V2 - Généré automatiquement
# Environnement: ${this.config.environment}
# Date: ${new Date().toISOString()}

# Application
NODE_ENV=${this.config.environment}
NEXT_PUBLIC_BASE_URL=${this.config.domain}
PORT=3000

# Base de données
MONGODB_URI=${this.config.database.uri}
MONGODB_TEST_URI=mongodb://localhost:27017/mesrit_test

# Sécurité
JWT_SECRET=${secrets.jwt}
ENCRYPTION_KEY=${secrets.encryption}
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Cache intelligent
CACHE_ENABLED=${this.config.features.cache}
CACHE_DEFAULT_TTL=${this.config.performance.cacheTTL || 300000}
CACHE_MAX_SIZE=${this.config.performance.cacheSize || 2000}
CACHE_CLEANUP_INTERVAL=60000

# Analytics V2
ANALYTICS_ENABLED=${this.config.features.analytics}
ANALYTICS_BATCH_SIZE=100
ANALYTICS_RETENTION_DAYS=730
ANALYTICS_AUTO_CLEANUP=true

# SEO automatique
SEO_ENABLED=${this.config.features.seo}
SEO_AUTO_GENERATION=${this.config.features.seo}
SEO_BASE_URL=${this.config.domain}

# Monitoring
MONITORING_ENABLED=${this.config.features.monitoring}
MONITORING_ALERTS_ENABLED=${this.config.features.monitoring}
MONITORING_PERFORMANCE_THRESHOLD=1000

# Logs
LOG_LEVEL=${this.config.environment === 'production' ? 'info' : 'debug'}
LOG_MAX_FILES=30
LOG_MAX_SIZE=100m

# Email (à configurer manuellement)
# SMTP_HOST=smtp.votre-fournisseur.com
# SMTP_PORT=587
# SMTP_USER=alerts@votre-domaine.com
# SMTP_PASS=your_email_password

# Sauvegardes (à configurer manuellement)
# BACKUP_ENABLED=true
# BACKUP_RETENTION_DAYS=30
# BACKUP_S3_BUCKET=votre-bucket-backup
`;
  }

  /**
   * Générer les secrets sécurisés
   */
  generateSecrets() {
    const crypto = require('crypto');

    return {
      jwt: crypto.randomBytes(64).toString('hex'),
      encryption: crypto.randomBytes(16).toString('hex')
    };
  }

  /**
   * Mettre à jour les scripts package.json
   */
  async updatePackageScripts() {
    console.log('📝 Mise à jour package.json...');

    const packagePath = 'package.json';
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    // Ajouter les nouveaux scripts V2
    const newScripts = {
      'setup:v2': 'node scripts/setupV2.js',
      'check-deps:v2': 'node -e "require(\'./DEPENDENCY_CHECK_V2.md\')"',
      'setup:indexes': 'node src/scripts/createOptimizedIndexes.js',
      'migrate:v2': 'node src/scripts/migrateToV2Analytics.js',
      'test:integration:v2': 'node src/scripts/integrationTestsV2.js',
      'optimize:v2': 'node src/scripts/performanceOptimizerV2.js',
      'maintenance:daily': 'node src/scripts/autoMaintenanceV2.js daily',
      'maintenance:weekly': 'node src/scripts/autoMaintenanceV2.js weekly',
      'maintenance:monthly': 'node src/scripts/autoMaintenanceV2.js monthly',
      'diagnose:v2': 'node scripts/diagnoseV2.js'
    };

    packageContent.scripts = {
      ...packageContent.scripts,
      ...newScripts
    };

    // Backup et sauvegarde
    fs.copyFileSync(packagePath, `${packagePath}.backup.${Date.now()}`);
    fs.writeFileSync(packagePath, JSON.stringify(packageContent, null, 2));

    console.log('✅ Scripts package.json mis à jour');
  }

  /**
   * Créer les dossiers nécessaires
   */
  async createDirectories() {
    console.log('📁 Création des dossiers...');

    const directories = [
      'logs',
      'backups',
      'tmp',
      'public/uploads/analytics',
      'public/uploads/seo'
    ];

    for (const dir of directories) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Dossier créé: ${dir}`);
      }
    }
  }

  /**
   * Tests de validation
   */
  async runValidationTests() {
    console.log('\n🧪 Tests de validation...');

    // Test 1: Import des modules V2
    try {
      console.log('📦 Test imports modules V2...');
      require('./src/lib/eventBus.js');
      require('./src/lib/newsAnalyticsV2.js');
      require('./src/lib/intelligentCache.js');
      console.log('✅ Imports V2 OK');
    } catch (error) {
      console.log('❌ Erreur imports:', error.message);
    }

    // Test 2: Connexion base de données
    try {
      console.log('🗄️ Test connexion base de données...');
      await this.testDatabaseConnection();
      console.log('✅ Connexion DB OK');
    } catch (error) {
      console.log('❌ Erreur DB:', error.message);
    }

    // Test 3: Configuration cache
    if (this.config.features.cache) {
      try {
        console.log('⚡ Test cache intelligent...');
        const cache = require('./src/lib/intelligentCache.js').default;
        await cache.set('test', 'value');
        const value = await cache.get('test');
        if (value === 'value') {
          console.log('✅ Cache OK');
        } else {
          console.log('❌ Cache non fonctionnel');
        }
      } catch (error) {
        console.log('❌ Erreur cache:', error.message);
      }
    }
  }

  /**
   * Tester la connexion à la base de données
   */
  async testDatabaseConnection() {
    const mongoose = require('mongoose');

    try {
      await mongoose.connect(this.config.database.uri, {
        serverSelectionTimeoutMS: 5000
      });
      await mongoose.connection.close();
      return true;
    } catch (error) {
      throw new Error(`Connexion DB échouée: ${error.message}`);
    }
  }

  /**
   * Poser une question interactive
   */
  question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }
}

// Script exécutable
async function main() {
  const setup = new SetupV2();
  await setup.setup();
}

// Exécuter si appelé directement
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { SetupV2 };