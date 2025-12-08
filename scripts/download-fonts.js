const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🔤 Téléchargement des polices Inter...\n');

// URLs mises à jour depuis Google Webfonts Helper
const fonts = [
  {
    weight: '400',
    name: 'Regular',
    url: 'https://gwfh.mranftl.com/api/fonts/inter?download=zip&subsets=latin&variants=regular',
    filename: 'inter-v12-latin-regular.woff2',
    // Fallback: utiliser une URL directe depuis googleapis
    fallbackUrl: 'https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2'
  },
  {
    weight: '500',
    name: 'Medium',
    url: 'https://gwfh.mranftl.com/api/fonts/inter?download=zip&subsets=latin&variants=500',
    filename: 'inter-v12-latin-500.woff2',
    fallbackUrl: 'https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa2JL7.woff2'
  },
  {
    weight: '600',
    name: 'SemiBold',
    url: 'https://gwfh.mranftl.com/api/fonts/inter?download=zip&subsets=latin&variants=600',
    filename: 'inter-v12-latin-600.woff2',
    fallbackUrl: 'https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa5ZP7.woff2'
  },
  {
    weight: '700',
    name: 'Bold',
    url: 'https://gwfh.mranftl.com/api/fonts/inter?download=zip&subsets=latin&variants=700',
    filename: 'inter-v12-latin-700.woff2',
    fallbackUrl: 'https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa25P7.woff2'
  }
];

const fontDir = path.join(__dirname, '..', 'public', 'fonts');

// Créer le dossier s'il n'existe pas
if (!fs.existsSync(fontDir)) {
  fs.mkdirSync(fontDir, { recursive: true });
  console.log('✓ Dossier public/fonts créé\n');
}

let completed = 0;
let failed = 0;

fonts.forEach((font, index) => {
  const filePath = path.join(fontDir, font.filename);

  // Vérifier si le fichier existe déjà
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    console.log(`⏭️  Inter ${font.name} (${font.weight}) - Déjà téléchargé (${sizeKB} KB)`);
    completed++;

    if (completed + failed === fonts.length) {
      printSummary();
    }
    return;
  }

  const file = fs.createWriteStream(filePath);

  console.log(`⬇️  Téléchargement Inter ${font.name} (${font.weight})...`);

  // Utiliser directement le fallbackUrl (plus fiable)
  const downloadUrl = font.fallbackUrl || font.url;

  https.get(downloadUrl, (response) => {
    if (response.statusCode !== 200) {
      console.error(`✗ Erreur HTTP ${response.statusCode} pour ${font.filename}`);
      fs.unlink(filePath, () => {});
      failed++;

      if (completed + failed === fonts.length) {
        printSummary();
      }
      return;
    }

    response.pipe(file);

    file.on('finish', () => {
      file.close();
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(1);
      console.log(`✓ Inter ${font.name} (${font.weight}) téléchargé (${sizeKB} KB)`);
      completed++;

      if (completed + failed === fonts.length) {
        printSummary();
      }
    });

    file.on('error', (err) => {
      fs.unlink(filePath, () => {});
      console.error(`✗ Erreur d'écriture pour ${font.filename}:`, err.message);
      failed++;

      if (completed + failed === fonts.length) {
        printSummary();
      }
    });
  }).on('error', (err) => {
    fs.unlink(filePath, () => {});
    console.error(`✗ Erreur réseau pour ${font.filename}:`, err.message);
    failed++;

    if (completed + failed === fonts.length) {
      printSummary();
    }
  });
});

function printSummary() {
  console.log('\n' + '='.repeat(50));

  if (failed === 0) {
    console.log('✅ SUCCÈS - Toutes les polices sont prêtes !');
    console.log('='.repeat(50));
    console.log(`\n📁 Polices installées dans: ${fontDir}`);

    // Lister les fichiers
    const files = fs.readdirSync(fontDir);
    let totalSize = 0;

    console.log('\nFichiers téléchargés:');
    files.forEach(file => {
      const stats = fs.statSync(path.join(fontDir, file));
      const sizeKB = (stats.size / 1024).toFixed(1);
      totalSize += stats.size;
      console.log(`  - ${file} (${sizeKB} KB)`);
    });

    console.log(`\nTaille totale: ${(totalSize / 1024).toFixed(1)} KB`);
    console.log('\n✅ Les polices sont maintenant configurées pour:');
    console.log('   • RGPD compliant (pas d\'appel externe)');
    console.log('   • Performances optimales (cache 30 jours)');
    console.log('   • Fonctionnement offline');
    console.log('\n🚀 Prochaine étape:');
    console.log('   npm run dev (pour tester)');
    console.log('   npm run build (pour production)');
  } else {
    console.log(`⚠️  ATTENTION - ${failed} échec(s), ${completed} réussite(s)`);
    console.log('='.repeat(50));
    console.log('\nVeuillez vérifier votre connexion internet et réessayer:');
    console.log('  node scripts/download-fonts.js');
  }

  console.log('');
}
