#!/usr/bin/env node
/**
 * Script pour ajouter getServerSideProps aux pages qui causent des erreurs SSG
 */

const fs = require('fs');
const path = require('path');

const SSR_CODE = `

// Forcer SSR pour éviter les erreurs durant le SSG
export async function getServerSideProps() {
  return {
    props: {}
  };
}
`;

const pagesToFix = [
  'src/pages/contact/index.js',
  'src/pages/documentation/index.js',
  'src/pages/documentation/guides.js',
  'src/pages/documentation/rapports.js',
  'src/pages/etablissements/centres.js',
  'src/pages/etablissements/ecoles.js',
  'src/pages/etablissements/instituts.js',
  'src/pages/etablissements/universites.js',
  'src/pages/actualites/[id].js'
];

console.log('🔧 Correction des pages SSG...\n');

let fixed = 0;
let skipped = 0;

pagesToFix.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Fichier non trouvé: ${filePath}`);
    skipped++;
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');

  // Vérifier si getServerSideProps ou getStaticProps existe déjà
  if (content.includes('getServerSideProps') || content.includes('getStaticProps')) {
    console.log(`✅ Déjà corrigé: ${filePath}`);
    skipped++;
    return;
  }

  // Ajouter getServerSideProps à la fin
  content += SSR_CODE;

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✅ Corrigé: ${filePath}`);
  fixed++;
});

console.log(`\n📊 Résumé:`);
console.log(`   Corrigés: ${fixed}`);
console.log(`   Ignorés:  ${skipped}`);
console.log(`   Total:    ${pagesToFix.length}\n`);

if (fixed > 0) {
  console.log('✅ Corrections appliquées! Vous pouvez maintenant lancer `npm run build`');
} else {
  console.log('ℹ️  Aucune correction nécessaire');
}
