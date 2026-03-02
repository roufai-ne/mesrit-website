// scripts/import-images-to-strapi.mjs
// Upload les images des articles depuis public/images/news/ vers Strapi
// et les lie aux articles correspondants via l'API

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import fetch from 'node-fetch';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const STRAPI_URL = 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_ADMIN_TOKEN;
const IMAGES_DIR = path.join(ROOT, 'public', 'images', 'news');
const MIGRATION_FILE = path.join(ROOT, 'data', 'migration-export', 'news.json');

if (!STRAPI_TOKEN) {
  console.error('❌ Définissez STRAPI_ADMIN_TOKEN dans votre environnement');
  console.error('   Exemple: STRAPI_ADMIN_TOKEN=xxx node scripts/import-images-to-strapi.mjs');
  process.exit(1);
}

const headers = { Authorization: `Bearer ${STRAPI_TOKEN}` };

async function uploadFile(filePath) {
  const filename = path.basename(filePath);
  const stream = fs.createReadStream(filePath);
  const form = new FormData();
  form.append('files', stream, filename);

  const res = await fetch(`${STRAPI_URL}/api/upload`, {
    method: 'POST',
    headers: { ...form.getHeaders(), Authorization: `Bearer ${STRAPI_TOKEN}` },
    body: form,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Upload failed for ${filename}: ${err}`);
  }

  const data = await res.json();
  return data[0]; // Strapi renvoie un tableau
}

async function getArticleByTitle(title) {
  const encoded = encodeURIComponent(title);
  const res = await fetch(
    `${STRAPI_URL}/api/articles?filters[title][$eq]=${encoded}&populate=cover`,
    { headers }
  );
  const data = await res.json();
  return data?.data?.[0] || null;
}

async function linkCoverToArticle(articleDocumentId, fileId) {
  const res = await fetch(`${STRAPI_URL}/api/articles/${articleDocumentId}`, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: { cover: fileId } }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Link failed for article ${articleDocumentId}: ${err}`);
  }

  return res.json();
}

async function main() {
  console.log('🚀 Import images → Strapi\n');

  // Charger la migration
  const newsData = JSON.parse(fs.readFileSync(MIGRATION_FILE, 'utf8'));
  console.log(`📋 ${newsData.length} articles dans la migration\n`);

  let uploaded = 0;
  let linked = 0;
  let skipped = 0;
  let errors = 0;

  for (const news of newsData) {
    if (!news.image) { skipped++; continue; }

    // Chemin local de l'image
    const imagePath = path.join(ROOT, 'public', news.image);
    const filename = path.basename(news.image);

    if (!fs.existsSync(imagePath)) {
      console.warn(`⚠️  Image introuvable: ${news.image}`);
      skipped++;
      continue;
    }

    // Trouver l'article dans Strapi
    const article = await getArticleByTitle(news.title);
    if (!article) {
      console.warn(`⚠️  Article non trouvé: "${news.title.slice(0, 50)}"`);
      skipped++;
      continue;
    }

    // Vérifier si déjà un cover
    if (article.cover) {
      console.log(`✓  Déjà lié: "${news.title.slice(0, 50)}"`);
      skipped++;
      continue;
    }

    try {
      // Upload
      process.stdout.write(`📤 Upload ${filename}...`);
      const file = await uploadFile(imagePath);
      uploaded++;
      process.stdout.write(` ✓ (id: ${file.id})\n`);

      // Lier à l'article
      process.stdout.write(`🔗 Liaison à "${news.title.slice(0, 40)}"...`);
      await linkCoverToArticle(article.documentId, file.id);
      linked++;
      process.stdout.write(` ✓\n`);

    } catch (err) {
      console.error(`\n❌ Erreur: ${err.message}`);
      errors++;
    }

    // Pause pour ne pas surcharger Strapi
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('\n─────────────────────────');
  console.log(`✅ Uploadés  : ${uploaded}`);
  console.log(`🔗 Liés      : ${linked}`);
  console.log(`⏭  Ignorés   : ${skipped}`);
  console.log(`❌ Erreurs   : ${errors}`);
}

main().catch(console.error);
