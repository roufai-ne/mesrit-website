#!/usr/bin/env node
// scripts/auditApplication.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Audit complet de l'application
 * Détecte les fichiers inutiles, anomalies, et problèmes
 */
class ApplicationAuditor {
  constructor() {
    this.issues = [];
    this.unusedFiles = [];
    this.duplicateFiles = [];
    this.largeFiles = [];
    this.dependencies = {
      used: new Set(),
      unused: [],
      missing: []
    };
    this.stats = {};
  }

  async audit() {
    console.log('🔍 AUDIT COMPLET DE L\'APPLICATION');
    console.log('==================================\n');

    try {
      // 1. Analyser la structure des fichiers
      await this.analyzeFileStructure();

      // 2. Détecter les fichiers inutiles
      await this.detectUnusedFiles();

      // 3. Analyser les dépendances
      await this.analyzeDependencies();

      // 4. Détecter les duplicatas
      await this.detectDuplicates();

      // 5. Vérifier les gros fichiers
      await this.checkLargeFiles();

      // 6. Analyser les imports
      await this.analyzeImports();

      // 7. Vérifier les configurations
      await this.checkConfigurations();

      // 8. Générer le rapport
      await this.generateReport();

    } catch (error) {
      console.error('❌ Erreur audit:', error.message);
      this.addIssue('CRITICAL', 'Échec de l\'audit', error.message);
    }
  }

  /**
   * Analyser la structure des fichiers
   */
  async analyzeFileStructure() {
    console.log('📁 Analyse de la structure des fichiers...');

    const excludeDirs = ['node_modules', '.git', '.next', 'dist', 'build', 'coverage'];
    const fileTypes = {};
    let totalFiles = 0;
    let totalSize = 0;

    const analyzeDir = (dir) => {
      const items = fs.readdirSync(dir, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(dir, item.name);

        if (item.isDirectory() && !excludeDirs.includes(item.name)) {
          analyzeDir(fullPath);
        } else if (item.isFile()) {
          const ext = path.extname(item.name);
          const stats = fs.statSync(fullPath);

          fileTypes[ext] = (fileTypes[ext] || 0) + 1;
          totalFiles++;
          totalSize += stats.size;

          // Détecter les fichiers suspects
          if (stats.size > 5 * 1024 * 1024) { // > 5MB
            this.largeFiles.push({
              path: fullPath.replace(process.cwd() + path.sep, ''),
              size: Math.round(stats.size / 1024 / 1024 * 100) / 100
            });
          }

          // Fichiers potentiellement inutiles
          if (item.name.includes('.backup') || item.name.includes('.old') ||
              item.name.includes('temp') || item.name.includes('TODO')) {
            this.unusedFiles.push({
              path: fullPath.replace(process.cwd() + path.sep, ''),
              reason: 'Fichier temporaire/backup détecté'
            });
          }
        }
      }
    };

    analyzeDir(process.cwd());

    this.stats.files = {
      total: totalFiles,
      totalSize: Math.round(totalSize / 1024 / 1024 * 100) / 100,
      types: fileTypes
    };

    console.log(`  📊 ${totalFiles} fichiers analysés (${this.stats.files.totalSize}MB)`);
  }

  /**
   * Détecter les fichiers inutiles
   */
  async detectUnusedFiles() {
    console.log('🗑️ Détection des fichiers inutiles...');

    // Fichiers de diagnostic temporaires
    const diagnosticFiles = fs.readdirSync('.').filter(f => f.startsWith('diagnostic-report-'));
    for (const file of diagnosticFiles) {
      this.unusedFiles.push({
        path: file,
        reason: 'Rapport de diagnostic temporaire'
      });
    }

    // Fichiers de backup package.json
    const packageBackups = fs.readdirSync('.').filter(f => f.startsWith('package.json.backup'));
    for (const file of packageBackups) {
      this.unusedFiles.push({
        path: file,
        reason: 'Backup package.json'
      });
    }

    // Fichiers de test obsolètes
    if (fs.existsSync('test-cookies.js')) {
      this.unusedFiles.push({
        path: 'test-cookies.js',
        reason: 'Fichier de test temporaire'
      });
    }

    // Vérifier les fichiers .md temporaires
    const tempDocs = ['.dependency-check.md', '.deployment-guide.md',
                     'DEPENDENCY_CHECK_V2.md', 'DEPLOYMENT_GUIDE_V2.md',
                     'MIGRATION_GUIDE_V2.md'];
    for (const doc of tempDocs) {
      if (fs.existsSync(doc)) {
        this.unusedFiles.push({
          path: doc,
          reason: 'Documentation temporaire générée'
        });
      }
    }

    // Vérifier les fichiers de production
    if (fs.existsSync('production.config.js')) {
      // Vérifier s'il est utilisé
      const isUsed = this.searchInFiles('production.config.js');
      if (!isUsed) {
        this.unusedFiles.push({
          path: 'production.config.js',
          reason: 'Fichier de config non utilisé'
        });
      }
    }

    console.log(`  🗑️ ${this.unusedFiles.length} fichiers potentiellement inutiles détectés`);
  }

  /**
   * Analyser les dépendances
   */
  async analyzeDependencies() {
    console.log('📦 Analyse des dépendances...');

    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const allDeps = {
        ...packageJson.dependencies || {},
        ...packageJson.devDependencies || {}
      };

      // Vérifier les dépendances utilisées
      for (const dep of Object.keys(allDeps)) {
        const isUsed = this.searchInFiles(`require('${dep}')`) ||
                      this.searchInFiles(`require("${dep}")`) ||
                      this.searchInFiles(`import`) && this.searchInFiles(dep) ||
                      this.searchInFiles(`from '${dep}'`) ||
                      this.searchInFiles(`from "${dep}"`);

        if (isUsed) {
          this.dependencies.used.add(dep);
        } else {
          this.dependencies.unused.push(dep);
        }
      }

      // Détecter les dépendances suspectes
      const suspiciousDeps = ['lodash', 'moment', 'jquery'];
      for (const dep of suspiciousDeps) {
        if (allDeps[dep]) {
          this.addIssue('MEDIUM', `Dépendance lourde détectée: ${dep}`,
            'Considérer des alternatives plus légères');
        }
      }

      // Vérifier les versions
      for (const [dep, version] of Object.entries(allDeps)) {
        if (version.includes('^') && version.includes('.0.0')) {
          this.addIssue('LOW', `Version instable: ${dep}@${version}`,
            'Version majeure .0.0 potentiellement instable');
        }
      }

    } catch (error) {
      this.addIssue('HIGH', 'Erreur analyse dépendances', error.message);
    }

    console.log(`  📦 ${this.dependencies.used.size} dépendances utilisées, ${this.dependencies.unused.length} non utilisées`);
  }

  /**
   * Détecter les duplicatas
   */
  async detectDuplicates() {
    console.log('🔍 Détection des duplicatas...');

    const fileHashes = new Map();
    const checkDir = (dir) => {
      const items = fs.readdirSync(dir, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(dir, item.name);

        if (item.isDirectory() && !['node_modules', '.git', '.next'].includes(item.name)) {
          checkDir(fullPath);
        } else if (item.isFile()) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const size = content.length;
            const key = `${size}-${item.name}`;

            if (fileHashes.has(key)) {
              fileHashes.get(key).push(fullPath);
            } else {
              fileHashes.set(key, [fullPath]);
            }
          } catch (error) {
            // Ignorer les fichiers binaires
          }
        }
      }
    };

    checkDir('src');

    // Identifier les duplicatas potentiels
    for (const [key, files] of fileHashes) {
      if (files.length > 1) {
        // Vérifier si ce sont vraiment des duplicatas
        const contents = files.map(f => {
          try {
            return fs.readFileSync(f, 'utf8');
          } catch (error) {
            return '';
          }
        });

        const firstContent = contents[0];
        const areDuplicates = contents.every(content => content === firstContent);

        if (areDuplicates && firstContent.length > 100) {
          this.duplicateFiles.push({
            files: files.map(f => f.replace(process.cwd() + path.sep, '')),
            size: firstContent.length
          });
        }
      }
    }

    console.log(`  🔍 ${this.duplicateFiles.length} groupes de duplicatas détectés`);
  }

  /**
   * Vérifier les gros fichiers
   */
  async checkLargeFiles() {
    console.log('📏 Vérification des gros fichiers...');

    for (const file of this.largeFiles) {
      if (file.size > 10) {
        this.addIssue('HIGH', `Fichier très volumineux: ${file.path}`,
          `${file.size}MB - Considérer l'optimisation`);
      } else if (file.size > 5) {
        this.addIssue('MEDIUM', `Fichier volumineux: ${file.path}`,
          `${file.size}MB - Vérifier si nécessaire`);
      }
    }

    console.log(`  📏 ${this.largeFiles.length} gros fichiers identifiés`);
  }

  /**
   * Analyser les imports
   */
  async analyzeImports() {
    console.log('🔗 Analyse des imports...');

    const unusedImports = [];
    const missingImports = [];

    // Analyser les fichiers JavaScript/JSX
    const analyzeFile = (filePath) => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');

        // Détecter les imports non utilisés
        const importRegex = /import\s+(?:\{([^}]+)\}|\*\s+as\s+(\w+)|(\w+))\s+from\s+['"]([^'"]+)['"]/g;
        let match;

        while ((match = importRegex.exec(content)) !== null) {
          const imported = match[1] || match[2] || match[3];
          if (imported && !content.includes(imported.trim())) {
            unusedImports.push({
              file: filePath.replace(process.cwd() + path.sep, ''),
              import: imported.trim()
            });
          }
        }

        // Détecter les références non importées
        const reactHooks = ['useState', 'useEffect', 'useCallback', 'useMemo'];
        for (const hook of reactHooks) {
          if (content.includes(hook) && !content.includes(`import`) && !content.includes(hook)) {
            missingImports.push({
              file: filePath.replace(process.cwd() + path.sep, ''),
              missing: hook,
              from: 'react'
            });
          }
        }

      } catch (error) {
        // Ignorer les erreurs de lecture
      }
    };

    // Parcourir les fichiers src
    const scanFiles = (dir) => {
      const items = fs.readdirSync(dir, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(dir, item.name);

        if (item.isDirectory()) {
          scanFiles(fullPath);
        } else if (['.js', '.jsx', '.ts', '.tsx'].includes(path.extname(item.name))) {
          analyzeFile(fullPath);
        }
      }
    };

    if (fs.existsSync('src')) {
      scanFiles('src');
    }

    this.stats.imports = {
      unusedImports: unusedImports.length,
      missingImports: missingImports.length
    };

    console.log(`  🔗 ${unusedImports.length} imports inutiles, ${missingImports.length} imports manquants détectés`);
  }

  /**
   * Vérifier les configurations
   */
  async checkConfigurations() {
    console.log('⚙️ Vérification des configurations...');

    // Vérifier les fichiers de config redondants
    const configFiles = [
      'next.config.js', 'next.config.mjs',
      'tailwind.config.js', 'tailwind.config.ts',
      'jest.config.js', 'jest.config.json',
      '.eslintrc.json', '.eslintrc.js',
      'tsconfig.json'
    ];

    const existingConfigs = configFiles.filter(f => fs.existsSync(f));

    // Détecter les configs multiples pour le même outil
    const configGroups = {
      next: existingConfigs.filter(f => f.startsWith('next.config')),
      tailwind: existingConfigs.filter(f => f.startsWith('tailwind.config')),
      jest: existingConfigs.filter(f => f.startsWith('jest.config')),
      eslint: existingConfigs.filter(f => f.startsWith('.eslintrc'))
    };

    for (const [tool, configs] of Object.entries(configGroups)) {
      if (configs.length > 1) {
        this.addIssue('MEDIUM', `Configurations multiples pour ${tool}`,
          `${configs.join(', ')} - Choisir une seule configuration`);
      }
    }

    // Vérifier .env vs .env.local
    const envFiles = ['.env', '.env.local', '.env.development', '.env.production'];
    const existingEnvs = envFiles.filter(f => fs.existsSync(f));

    if (existingEnvs.length > 2) {
      this.addIssue('LOW', 'Nombreux fichiers .env',
        `${existingEnvs.join(', ')} - Vérifier la nécessité`);
    }

    console.log(`  ⚙️ ${existingConfigs.length} fichiers de configuration vérifiés`);
  }

  /**
   * Rechercher dans les fichiers
   */
  searchInFiles(pattern) {
    try {
      const result = execSync(`grep -r "${pattern}" src/ --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx"`,
        { encoding: 'utf8', stdio: 'pipe' });
      return result.trim().length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Ajouter un problème
   */
  addIssue(severity, title, description) {
    this.issues.push({
      severity,
      title,
      description,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Générer le rapport
   */
  async generateReport() {
    console.log('📋 Génération du rapport d\'audit...');

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalIssues: this.issues.length,
        criticalIssues: this.issues.filter(i => i.severity === 'CRITICAL').length,
        highIssues: this.issues.filter(i => i.severity === 'HIGH').length,
        mediumIssues: this.issues.filter(i => i.severity === 'MEDIUM').length,
        lowIssues: this.issues.filter(i => i.severity === 'LOW').length,
        unusedFiles: this.unusedFiles.length,
        duplicateFiles: this.duplicateFiles.length,
        largeFiles: this.largeFiles.length,
        unusedDependencies: this.dependencies.unused.length
      },
      stats: this.stats,
      issues: this.issues,
      unusedFiles: this.unusedFiles,
      duplicateFiles: this.duplicateFiles,
      largeFiles: this.largeFiles,
      dependencies: {
        unused: this.dependencies.unused,
        used: Array.from(this.dependencies.used)
      },
      recommendations: this.generateRecommendations()
    };

    // Sauvegarder le rapport
    const reportPath = `audit-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Afficher le résumé
    this.displaySummary(report);

    console.log(`\n📄 Rapport d'audit sauvegardé: ${reportPath}`);
  }

  /**
   * Générer des recommandations
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.unusedFiles.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        title: 'Nettoyer les fichiers inutiles',
        action: `Supprimer ${this.unusedFiles.length} fichiers inutiles identifiés`
      });
    }

    if (this.dependencies.unused.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        title: 'Nettoyer les dépendances',
        action: `npm uninstall ${this.dependencies.unused.slice(0, 5).join(' ')}`
      });
    }

    if (this.largeFiles.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        title: 'Optimiser les gros fichiers',
        action: 'Vérifier et optimiser les fichiers volumineux'
      });
    }

    if (this.duplicateFiles.length > 0) {
      recommendations.push({
        priority: 'LOW',
        title: 'Éliminer les duplicatas',
        action: 'Fusionner ou supprimer les fichiers dupliqués'
      });
    }

    return recommendations;
  }

  /**
   * Afficher le résumé
   */
  displaySummary(report) {
    console.log(`\n📊 RÉSUMÉ DE L'AUDIT
====================

🏥 Santé globale: ${report.summary.totalIssues === 0 ? '✅ EXCELLENT' :
  report.summary.criticalIssues > 0 ? '🚨 CRITIQUE' :
  report.summary.highIssues > 0 ? '⚠️ ATTENTION' : '✅ BON'}

📁 Fichiers:
  • Total: ${report.stats.files?.total || 0} fichiers (${report.stats.files?.totalSize || 0}MB)
  • Inutiles: ${report.summary.unusedFiles}
  • Duplicatas: ${report.summary.duplicateFiles}
  • Volumineux: ${report.summary.largeFiles}

📦 Dépendances:
  • Utilisées: ${report.dependencies.used.length}
  • Non utilisées: ${report.summary.unusedDependencies}

🚨 Problèmes détectés:
  • Critiques: ${report.summary.criticalIssues}
  • Élevés: ${report.summary.highIssues}
  • Moyens: ${report.summary.mediumIssues}
  • Faibles: ${report.summary.lowIssues}

🔧 Actions recommandées:`);

    report.recommendations
      .filter(r => r.priority === 'HIGH')
      .slice(0, 3)
      .forEach(rec => {
        console.log(`  • ${rec.title}`);
        console.log(`    → ${rec.action}`);
      });

    if (report.summary.totalIssues === 0 && report.summary.unusedFiles === 0) {
      console.log('\n🎉 Application propre! Aucun problème majeur détecté.');
    } else {
      console.log('\n🔧 Nettoyage recommandé:');
      console.log('1. Supprimer les fichiers inutiles');
      console.log('2. Désinstaller les dépendances non utilisées');
      console.log('3. Optimiser les gros fichiers');
    }
  }
}

// Exécution
async function main() {
  const auditor = new ApplicationAuditor();
  await auditor.audit();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ApplicationAuditor };