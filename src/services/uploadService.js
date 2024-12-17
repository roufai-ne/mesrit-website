// src/services/uploadService.js
import path from 'path';
import { writeFile } from 'fs/promises';

export async function uploadDocument(file) {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Générer un nom de fichier unique
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(process.cwd(), 'public', 'documents', fileName);

    // Sauvegarder le fichier
    await writeFile(filePath, buffer);

    // Retourner l'URL du fichier
    return `/documents/${fileName}`;
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    throw new Error("Erreur lors du téléchargement du fichier");
  }
}