// scripts/runCrawler.js
// Wrapper CommonJS pour exécuter le crawler ES module

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Démarrage du crawler...\n');

// Déterminer le mode (all ou incremental)
const mode = process.argv[2] || 'all';
const days = process.argv[3] || '7';

// Chemin vers le crawler
const crawlerPath = path.join(__dirname, '..', 'src', 'services', 'crawler.js');

// Commande à exécuter avec node --loader
const command = `node --loader ${crawlerPath} ${mode} ${days}`;

try {
  // Utiliser Next.js pour exécuter le script avec son loader ES modules
  const nextCommand = process.platform === 'win32'
    ? `npx cross-env NODE_OPTIONS="--experimental-loader @next/env/dist/load-dotenv" node -r dotenv/config "${crawlerPath}" ${mode} ${days}`
    : `NODE_OPTIONS="--experimental-loader @next/env/dist/load-dotenv" node -r dotenv/config "${crawlerPath}" ${mode} ${days}`;

  console.log(`Exécution: ${nextCommand}\n`);

  execSync(nextCommand, {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  console.log('\n✅ Crawler terminé avec succès!');

} catch (error) {
  console.error('\n❌ Erreur lors de l\'exécution du crawler:');
  console.error(error.message);
  process.exit(1);
}
