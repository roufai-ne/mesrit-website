/**
 * upload-to-strapi.mjs
 * Upload les fichiers de public/ vers la Media Library Strapi 5
 * en recréant la structure de dossiers.
 *
 * Usage :
 *   node scripts/upload-to-strapi.mjs
 *
 * Variables d'environnement requises (dans .env.local ou définies avant la commande) :
 *   STRAPI_URL          — ex: http://localhost:1337 (optionnel, défaut ci-dessous)
 *   STRAPI_ADMIN_EMAIL  — email admin Strapi
 *   STRAPI_ADMIN_PASS   — mot de passe admin Strapi
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// FormData, Blob et fetch sont natifs en Node 20+

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─────────────────────────── CONFIG ────────────────────────────────────────
const STRAPI_URL   = process.env.STRAPI_URL         || 'http://localhost:1337';
const ADMIN_EMAIL  = process.env.STRAPI_ADMIN_EMAIL || 'dsi.mesri@gmail.com';
const ADMIN_PASS   = process.env.STRAPI_ADMIN_PASS  || 'Admin@2024!';
const PUBLIC_DIR   = path.resolve(__dirname, '../public');

// Dossiers à uploader (relatifs à public/) → nom du dossier Strapi parent
const UPLOAD_DIRS = [
  { localPath: 'images/dir',    strapiPath: 'images/dir'    },
  { localPath: 'images/hero',   strapiPath: 'images/hero'   },
  { localPath: 'images/logos',  strapiPath: 'images/logos'  },
  { localPath: 'images/news',   strapiPath: 'images/news'   },
  { localPath: 'images',        strapiPath: 'images',        rootOnly: true }, // fichiers à la racine de images/
  { localPath: 'documents',     strapiPath: 'documents'     },
  { localPath: 'videos',        strapiPath: 'videos'        },
];

// Extensions acceptées
const ALLOWED_EXT = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx',
  '.mp4', '.webm', '.mov',
]);

// ──────────────────────── MIME TYPES ───────────────────────────────────────
const MIME = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.gif': 'image/gif',  '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime',
};

// ──────────────────────── HELPERS ──────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function apiCall(token, method, endpoint, body = null, isForm = false) {
  const headers = { Authorization: `Bearer ${token}` };
  if (!isForm) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${STRAPI_URL}${endpoint}`, {
    method,
    headers,
    body: isForm ? body : (body ? JSON.stringify(body) : undefined),
  });

  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, data: JSON.parse(text) };
  } catch {
    return { ok: res.ok, status: res.status, data: text };
  }
}

// ──────────────────────── AUTH ─────────────────────────────────────────────
async function login() {
  console.log(`\n🔐 Connexion à Strapi (${STRAPI_URL})…`);
  const res = await fetch(`${STRAPI_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASS }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Échec de connexion : ${json?.error?.message || res.status}`);
  }
  console.log('✅ Connecté');
  return json.data.token;
}

// ──────────────────────── FOLDER MANAGEMENT ────────────────────────────────

// Cache : strapiPath → folderId
const folderCache = {};

async function getOrCreateFolder(token, strapiPath) {
  if (folderCache[strapiPath]) return folderCache[strapiPath];

  const parts      = strapiPath.split('/');
  const name       = parts[parts.length - 1];
  const parentPath = parts.slice(0, -1).join('/');

  // Assurer que le parent existe d'abord
  let parentId = null;
  if (parentPath) {
    parentId = await getOrCreateFolder(token, parentPath);
  }

  // Chercher si ce dossier existe déjà
  const listRes = await apiCall(token, 'GET',
    `/upload/folders?filters[name][$eq]=${encodeURIComponent(name)}${parentId ? `&filters[parent][id][$eq]=${parentId}` : '&filters[parent][$null]=true'}`
  );

  if (listRes.ok && listRes.data?.data?.length > 0) {
    const id = listRes.data.data[0].id;
    folderCache[strapiPath] = id;
    console.log(`  📁 Dossier existant : ${strapiPath} (id=${id})`);
    return id;
  }

  // Créer le dossier
  const createRes = await apiCall(token, 'POST', '/upload/folders', {
    name,
    parent: parentId || null,
  });

  if (!createRes.ok) {
    throw new Error(`Impossible de créer le dossier "${strapiPath}" : ${JSON.stringify(createRes.data)}`);
  }

  const id = createRes.data?.data?.id;
  folderCache[strapiPath] = id;
  console.log(`  📁 Dossier créé : ${strapiPath} (id=${id})`);
  return id;
}

// ──────────────────────── FILE UPLOAD ──────────────────────────────────────
async function uploadFile(token, filePath, folderId, strapiPath) {
  const ext  = path.extname(filePath).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) return { skipped: true };

  const fileName = path.basename(filePath);
  const mime     = MIME[ext] || 'application/octet-stream';
  const buffer   = fs.readFileSync(filePath);

  // Vérifier si le fichier existe déjà dans ce dossier
  const checkRes = await apiCall(token, 'GET',
    `/upload/files?filters[name][$eq]=${encodeURIComponent(fileName)}&filters[folder][id][$eq]=${folderId}`
  );
  if (checkRes.ok && checkRes.data?.results?.length > 0) {
    return { skipped: true, reason: 'already exists' };
  }

  const form = new FormData();
  form.set('files', new Blob([buffer], { type: mime }), fileName);
  form.set('fileInfo', JSON.stringify({
    name: fileName,
    folder: folderId,
  }));

  const res = await apiCall(token, 'POST', '/upload', form, true);

  if (!res.ok) {
    return { error: JSON.stringify(res.data) };
  }
  return { ok: true, id: res.data?.[0]?.id };
}

// ──────────────────────── MAIN ─────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  Upload public/ → Strapi Media Library');
  console.log('═══════════════════════════════════════════');

  const token = await login();

  let totalUploaded = 0;
  let totalSkipped  = 0;
  let totalErrors   = 0;

  for (const { localPath, strapiPath, rootOnly } of UPLOAD_DIRS) {
    const absDir = path.join(PUBLIC_DIR, localPath);
    if (!fs.existsSync(absDir)) {
      console.log(`\n⚠️  Dossier introuvable : ${localPath} — ignoré`);
      continue;
    }

    console.log(`\n📂 Traitement : public/${localPath}  →  Media Library/${strapiPath}`);

    // Créer le dossier dans Strapi
    let folderId;
    try {
      folderId = await getOrCreateFolder(token, strapiPath);
    } catch (e) {
      console.error(`  ❌ ${e.message}`);
      continue;
    }

    // Lister les fichiers (rootOnly = true : seulement les fichiers directs, pas les sous-dossiers)
    const entries = fs.readdirSync(absDir, { withFileTypes: true });
    const files   = entries
      .filter(e => e.isFile())
      .filter(e => !rootOnly || !e.isDirectory())
      .map(e => path.join(absDir, e.name));

    console.log(`  🗂  ${files.length} fichier(s) trouvé(s)`);

    for (const filePath of files) {
      const fileName = path.basename(filePath);
      const ext = path.extname(filePath).toLowerCase();

      if (!ALLOWED_EXT.has(ext)) {
        console.log(`  ⏭️  Ignoré (extension) : ${fileName}`);
        totalSkipped++;
        continue;
      }

      process.stdout.write(`  ⬆️  ${fileName} … `);
      try {
        const result = await uploadFile(token, filePath, folderId, strapiPath);
        if (result.skipped) {
          console.log(`déjà présent`);
          totalSkipped++;
        } else if (result.error) {
          console.log(`❌ ERREUR : ${result.error}`);
          totalErrors++;
        } else {
          console.log(`✅ (id=${result.id})`);
          totalUploaded++;
        }
      } catch (e) {
        console.log(`❌ Exception : ${e.message}`);
        totalErrors++;
      }

      // Petite pause pour ne pas surcharger Strapi
      await sleep(100);
    }
  }

  console.log('\n═══════════════════════════════════════════');
  console.log(`  ✅ Uploadés  : ${totalUploaded}`);
  console.log(`  ⏭️  Ignorés   : ${totalSkipped}`);
  console.log(`  ❌ Erreurs   : ${totalErrors}`);
  console.log('═══════════════════════════════════════════\n');
}

main().catch(e => {
  console.error('\n💥 Erreur fatale :', e.message);
  process.exit(1);
});
