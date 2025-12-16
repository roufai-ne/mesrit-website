#!/usr/bin/env node
// scripts/cleanupApplication.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

/**
 * Script de nettoyage automatique de l'application
 * Supprime les fichiers inutiles et dépendances non utilisées
 */
class ApplicationCleaner {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.deletedFiles = [];
    this.removedDependencies = [];
    this.errors = [];
  }

  async cleanup() {
    console.log('🧹 NETTOYAGE AUTOMATIQUE DE L\'APPLICATION');
    console.log('==========================================\n');

    try {
      // 1. Charger le rapport d'audit
      const auditReport = await this.loadAuditReport();

      // 2. Demander confirmation
      const proceed = await this.askConfirmation(auditReport);
      if (!proceed) {
        console.log('❌ Nettoyage annulé par l\'utilisateur');
        return;
      }

      // 3. Supprimer les fichiers inutiles
      await this.removeUnusedFiles(auditReport.unusedFiles);

      // 4. Nettoyer les dépendances
      await this.cleanupDependencies(auditReport.dependencies.unused);

      // 5. Nettoyer les rapports de diagnostic anciens
      await this.cleanupOldReports();

      // 6. Afficher le résumé
      this.displaySummary();

    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error.message);
    } finally {
      this.rl.close();
    }
  }

  /**
   * Charger le rapport d'audit le plus récent
   */
  async loadAuditReport() {
    const auditFiles = fs.readdirSync('.')
      .filter(f => f.startsWith('audit-report-'))
      .sort()
      .reverse();

    if (auditFiles.length === 0) {
      throw new Error('Aucun rapport d\'audit trouvé. Exécutez d\'abord node scripts/auditApplication.js');
    }

    const latestReport = auditFiles[0];
    console.log(`📋 Utilisation du rapport: ${latestReport}\n`);

    return JSON.parse(fs.readFileSync(latestReport, 'utf8'));
  }

  /**
   * Demander confirmation à l'utilisateur
   */
  async askConfirmation(report) {
    console.log('🔍 ACTIONS PRÉVUES:');
    console.log(`  • ${report.unusedFiles.length} fichiers inutiles à supprimer`);
    console.log(`  • ${report.dependencies.unused.length} dépendances à désinstaller`);
    console.log(`  • Nettoyage des anciens rapports de diagnostic\n`);

    if (report.unusedFiles.length > 0) {
      console.log('📁 Fichiers à supprimer:');
      report.unusedFiles.forEach(file => {
        console.log(`  - ${file.path} (${file.reason})`);
      });
      console.log();
    }

    if (report.dependencies.unused.length > 0) {
      console.log('📦 Dépendances à supprimer:');
      report.dependencies.unused.slice(0, 10).forEach(dep => {
        console.log(`  - ${dep}`);
      });
      if (report.dependencies.unused.length > 10) {
        console.log(`  ... et ${report.dependencies.unused.length - 10} autres`);
      }
      console.log();
    }

    const answer = await this.askQuestion('Continuer le nettoyage? (y/N): ');
    return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
  }

  /**
   * Supprimer les fichiers inutiles
   */
  async removeUnusedFiles(unusedFiles) {
    if (unusedFiles.length === 0) {
      console.log('✅ Aucun fichier inutile à supprimer');
      return;
    }

    console.log('🗑️ Suppression des fichiers inutiles...');

    for (const file of unusedFiles) {
      try {
        if (fs.existsSync(file.path)) {
          // Créer une sauvegarde pour les fichiers importants
          if (file.path.includes('.env') || file.path.includes('config')) {
            const backupPath = `${file.path}.backup.${Date.now()}`;
            fs.copyFileSync(file.path, backupPath);
            console.log(`  💾 Sauvegarde créée: ${backupPath}`);
          }

          fs.unlinkSync(file.path);
          console.log(`  ✅ Supprimé: ${file.path}`);
          this.deletedFiles.push(file.path);
        }
      } catch (error) {
        console.log(`  ❌ Erreur suppression ${file.path}: ${error.message}`);
        this.errors.push(`Fichier ${file.path}: ${error.message}`);
      }
    }
  }

  /**
   * Nettoyer les dépendances non utilisées
   */
  async cleanupDependencies(unusedDeps) {
    if (unusedDeps.length === 0) {
      console.log('✅ Aucune dépendance inutile à supprimer');
      return;
    }

    console.log('📦 Nettoyage des dépendances...');

    // Séparer les dépendances critiques qu'il faut garder
    const keepDependencies = [
      '@types/node', '@types/react', '@types/react-dom',  // Types essentiels
      'dotenv', 'zod', 'yup',  // Validation et configuration
      '@testing-library/jest-dom'  // Tests
    ];

    const safeToRemove = unusedDeps.filter(dep => !keepDependencies.includes(dep));

    if (safeToRemove.length === 0) {
      console.log('✅ Toutes les dépendances non utilisées sont critiques, conservation');
      return;
    }

    console.log(`📦 Suppression de ${safeToRemove.length} dépendances sûres...`);

    // Supprimer par lots pour éviter les erreurs
    const batchSize = 5;
    for (let i = 0; i < safeToRemove.length; i += batchSize) {
      const batch = safeToRemove.slice(i, i + batchSize);

      try {
        const command = `npm uninstall ${batch.join(' ')}`;
        console.log(`  📦 npm uninstall ${batch.join(' ')}`);

        execSync(command, {
          stdio: 'pipe',
          timeout: 30000 // 30 secondes timeout
        });

        batch.forEach(dep => {
          console.log(`  ✅ Supprimé: ${dep}`);
          this.removedDependencies.push(dep);
        });
      } catch (error) {
        console.log(`  ⚠️ Erreur suppression lot ${batch.join(', ')}: ${error.message}`);
        this.errors.push(`Dépendances ${batch.join(', ')}: ${error.message}`);
      }
    }
  }

  /**
   * Nettoyer les anciens rapports de diagnostic
   */
  async cleanupOldReports() {
    console.log('🧹 Nettoyage des anciens rapports...');

    const reportTypes = ['diagnostic-report-', 'audit-report-'];

    for (const type of reportTypes) {
      const reports = fs.readdirSync('.')
        .filter(f => f.startsWith(type))
        .sort()
        .reverse();

      // Garder les 2 rapports les plus récents
      const toDelete = reports.slice(2);

      for (const report of toDelete) {
        try {
          fs.unlinkSync(report);
          console.log(`  ✅ Supprimé: ${report}`);
          this.deletedFiles.push(report);
        } catch (error) {
          console.log(`  ❌ Erreur suppression ${report}: ${error.message}`);
        }
      }
    }
  }

  /**
   * Afficher le résumé du nettoyage
   */
  displaySummary() {
    console.log('\n📊 RÉSUMÉ DU NETTOYAGE');
    console.log('======================');

    console.log(`✅ Fichiers supprimés: ${this.deletedFiles.length}`);
    console.log(`📦 Dépendances supprimées: ${this.removedDependencies.length}`);
    console.log(`❌ Erreurs rencontrées: ${this.errors.length}\n`);

    if (this.deletedFiles.length > 0) {
      console.log('📁 Fichiers supprimés:');
      this.deletedFiles.forEach(file => {
        console.log(`  - ${file}`);
      });
      console.log();
    }

    if (this.removedDependencies.length > 0) {
      console.log('📦 Dépendances supprimées:');
      this.removedDependencies.forEach(dep => {
        console.log(`  - ${dep}`);
      });
      console.log();
    }

    if (this.errors.length > 0) {
      console.log('❌ Erreurs rencontrées:');
      this.errors.forEach(error => {
        console.log(`  - ${error}`);
      });
      console.log();
    }

    // Calcul de l'espace libéré (estimation)
    const estimatedSavings = this.removedDependencies.length * 2 + this.deletedFiles.length * 0.1;
    console.log(`💾 Espace libéré estimé: ~${estimatedSavings.toFixed(1)}MB`);

    console.log('\n🎉 Nettoyage terminé!');
    console.log('💡 Recommandation: Relancez npm install pour vous assurer que tout fonctionne');
  }

  /**
   * Poser une question à l'utilisateur
   */
  async askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }
}

// Exécution
async function main() {
  const cleaner = new ApplicationCleaner();
  await cleaner.cleanup();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ApplicationCleaner };