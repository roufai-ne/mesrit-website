// scripts/import-images-direct.mjs
// Importe les images directement dans Strapi (copie fichiers + insertion DB)
// sans passer par l'API upload (qui nécessite des permissions spéciales)

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// better-sqlite3 est dans backend/node_modules
const Database = require(path.join(__root, 'backend', 'node_modules', 'better-sqlite3'));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BACKEND = path.join(ROOT, 'backend');
const UPLOADS_DIR = path.join(BACKEND, 'public', 'uploads');
const MIGRATION_FILE = path.join(ROOT, 'data', 'migration-export', 'news.json');

// Mapping MIME types
const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif' };

function generateDocumentId() {
  return crypto.randomBytes(12).toString('hex').slice(0, 24);
}

function getImageSize(filePath) {
  // Taille en KB
  const stat = fs.statSync(filePath);
  return Math.round(stat.size / 1024 * 100) / 100;
}

function getImageDimensions(filePath) {
  // Lecture basique des dimensions PNG/JPEG sans librairie externe
  const buf = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();

  try {
    if (ext === '.png') {
      const width = buf.readUInt32BE(16);
      const height = buf.readUInt32BE(20);
      return { width, height };
    } else if (ext === '.jpg' || ext === '.jpeg') {
      let i = 2;
      while (i < buf.length) {
        if (buf[i] !== 0xFF) break;
        const marker = buf[i + 1];
        if (marker >= 0xC0 && marker <= 0xC3) {
          return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
        }
        i += 2 + buf.readUInt16BE(i + 2);
      }
    }
  } catch {}
  return { width: null, height: null };
}

async function main() {
  console.log('🚀 Import direct images → Strapi\n');

  const newsData = JSON.parse(fs.readFileSync(MIGRATION_FILE, 'utf8'));
  const db = new Database(path.join(BACKEND, '.tmp', 'data.db'));
  const now = new Date().toISOString();

  // Récupérer tous les articles
  const articles = db.prepare('SELECT id, document_id, title FROM articles').all();
  console.log(`📋 ${newsData.length} articles en migration, ${articles.length} dans Strapi\n`);

  let copied = 0;
  let linked = 0;
  let skipped = 0;
  let errors = 0;

  // Préparer les requêtes
  const insertFile = db.prepare(`
    INSERT INTO files (document_id, name, alternative_text, width, height, formats, hash, ext, mime, size, url, provider, folder_path, created_at, updated_at, published_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'local', '/', ?, ?, ?)
  `);

  const insertLink = db.prepare(`
    INSERT INTO files_related_mph (file_id, related_id, related_type, field, "order")
    VALUES (?, ?, 'api::article.article', 'cover', 1)
  `);

  const checkLink = db.prepare(`
    SELECT id FROM files_related_mph WHERE related_id = ? AND field = 'cover'
  `);

  const getMaxFileId = db.prepare('SELECT MAX(id) as max FROM files');

  for (const news of newsData) {
    if (!news.image) { skipped++; continue; }

    const srcPath = path.join(ROOT, 'public', news.image);
    if (!fs.existsSync(srcPath)) {
      console.warn(`⚠️  Introuvable: ${news.image}`);
      skipped++;
      continue;
    }

    // Trouver l'article Strapi correspondant
    const article = articles.find(a =>
      a.title.trim().toLowerCase() === news.title.trim().toLowerCase()
    );

    if (!article) {
      console.warn(`⚠️  Article non trouvé: "${news.title.slice(0, 50)}"`);
      skipped++;
      continue;
    }

    // Vérifier si déjà lié
    const existingLink = checkLink.get(article.id);
    if (existingLink) {
      console.log(`✓  Déjà lié: "${news.title.slice(0, 45)}"`);
      skipped++;
      continue;
    }

    try {
      const ext = path.extname(news.image).toLowerCase();
      const filename = path.basename(news.image);
      const hash = path.basename(news.image, ext);
      const destPath = path.join(UPLOADS_DIR, filename);

      // Copier le fichier
      if (!fs.existsSync(destPath)) {
        fs.copyFileSync(srcPath, destPath);
        process.stdout.write(`📁 Copié: ${filename}\n`);
      } else {
        process.stdout.write(`📁 Existe déjà: ${filename}\n`);
      }
      copied++;

      const { width, height } = getImageDimensions(srcPath);
      const size = getImageSize(srcPath);
      const mime = MIME[ext] || 'image/jpeg';
      const url = `/uploads/${filename}`;
      const documentId = generateDocumentId();

      // Insérer dans files
      const result = insertFile.run(
        documentId, filename, news.title, width, height,
        JSON.stringify({}), hash, ext, mime, size,
        url, now, now, now
      );

      const fileId = result.lastInsertRowid;

      // Lier à l'article
      insertLink.run(fileId, article.id);
      linked++;

      console.log(`🔗 "${news.title.slice(0, 45)}" → file#${fileId}`);

    } catch (err) {
      console.error(`❌ Erreur pour "${news.title.slice(0, 40)}": ${err.message}`);
      errors++;
    }
  }

  db.close();

  console.log('\n─────────────────────────');
  console.log(`📁 Copiés    : ${copied}`);
  console.log(`🔗 Liés      : ${linked}`);
  console.log(`⏭  Ignorés   : ${skipped}`);
  console.log(`❌ Erreurs   : ${errors}`);
  console.log('\n✅ Redémarrez Strapi pour voir les images dans la Media Library');
}

main().catch(console.error);
