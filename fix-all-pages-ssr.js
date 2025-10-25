#!/usr/bin/env node
/**
 * Script pour ajouter getServerSideProps à TOUTES les pages qui n'en ont pas
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const SSR_CODE = `

// Forcer SSR pour éviter les erreurs durant le SSG
export async function getServerSideProps() {
  return {
    props: {}
  };
}
`;

console.log('🔧 Correction automatique de TOUTES les pages...\n');

// Trouver toutes les pages (sauf API routes, _app, _document)
const pagesPattern = 'src/pages/**/*.js';
const allPages = glob.sync(pagesPattern, {
  ignore: [
    '**/api/**',
    '**/_app.js',
    '**/_document.js'
  ]
});

console.log(`📄 ${allPages.length} pages trouvées\n`);

let fixed = 0;
let skipped = 0;

allPages.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Vérifier si une méthode de data fetching existe déjà
    if (
      content.includes('getServerSideProps') ||
      content.includes('getStaticProps') ||
      content.includes('getStaticPaths')
    ) {
      console.log(`⏭️  ${filePath.replace('src/pages/', '')} - Déjà configuré`);
      skipped++;
      return;
    }

    // Ajouter getServerSideProps
    content += SSR_CODE;
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${filePath.replace('src/pages/', '')} - Corrigé`);
    fixed++;
  } catch (error) {
    console.error(`❌ Erreur sur ${filePath}:`, error.message);
  }
});

console.log(`\n${'='.repeat(60)}`);
console.log(`📊 RÉSUMÉ:`);
console.log(`   ✅ Corrigés:  ${fixed}`);
console.log(`   ⏭️  Ignorés:   ${skipped}`);
console.log(`   📄 Total:     ${allPages.length}`);
console.log(`${'='.repeat(60)}\n`);

if (fixed > 0) {
  console.log('🎉 Corrections appliquées! Vous pouvez maintenant lancer `npm run build`\n');
} else {
  console.log('ℹ️  Aucune correction nécessaire\n');
}
