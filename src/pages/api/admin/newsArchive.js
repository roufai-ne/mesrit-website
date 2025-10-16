// src/pages/api/admin/newsArchive.js
import { NewsArchiveService } from '../../../lib/newsArchive';
import { connectDB } from '../../../lib/mongodb';

export default async function handler(req, res) {
  await connectDB();
  const { method } = req;

  try {
    if (method === 'DELETE' && req.query.action === 'purgeTrash') {
      // Purge automatique de la corbeille
      const { userId } = req.body;
      const result = await NewsArchiveService.purgeTrash(userId);
      return res.status(200).json({ success: true, result });
    }

    if (method === 'POST' && req.query.action === 'batchArchive') {
      // Archiver plusieurs articles
      const { newsIds, userId, reason } = req.body;
      const result = await NewsArchiveService.batchArchive(newsIds, userId, reason);
      return res.status(200).json({ success: true, result });
    }
    if (method === 'PUT' && req.query.action === 'batchRestore') {
      // Restaurer plusieurs articles archivés
      const { newsIds, userId } = req.body;
      const result = await NewsArchiveService.batchRestore(newsIds, userId);
      return res.status(200).json({ success: true, result });
    }
    if (method === 'PUT' && req.query.action === 'batchRestoreTrash') {
      // Restaurer plusieurs articles de la corbeille
      const { newsIds, userId } = req.body;
      const result = await NewsArchiveService.batchRestoreFromTrash(newsIds, userId);
      return res.status(200).json({ success: true, result });
    }
    if (method === 'DELETE' && req.query.action === 'batchDelete') {
      // Mettre plusieurs articles à la corbeille
      const { newsIds, userId, reason } = req.body;
      const result = await NewsArchiveService.batchDelete(newsIds, userId, reason);
      return res.status(200).json({ success: true, result });
    }
    if (method === 'DELETE' && req.query.action === 'batchPermanentDelete') {
      // Supprimer définitivement plusieurs articles
      const { newsIds, userId } = req.body;
      const result = await NewsArchiveService.batchPermanentDelete(newsIds, userId);
      return res.status(200).json({ success: true, result });
    }
    if (method === 'POST' && req.body.auto) {
      // Archivage intelligent automatique
      const result = await NewsArchiveService.autoArchiveOldArticles();
      return res.status(200).json({ success: true, result });
    }
    if (method === 'POST') {
      // Archiver un article
      const { newsId, userId, reason } = req.body;
      const result = await NewsArchiveService.archiveArticle(newsId, userId, reason);
      return res.status(200).json({ success: true, result });
    }
    if (method === 'PUT' && req.query.action === 'restore') {
      // Restaurer un article archivé
      const { newsId, userId } = req.body;
      const result = await NewsArchiveService.restoreArticle(newsId, userId);
      return res.status(200).json({ success: true, result });
    }
    if (method === 'DELETE') {
      // Mettre à la corbeille
      const { newsId, userId } = req.body;
      const result = await NewsArchiveService.trashArticle(newsId, userId);
      return res.status(200).json({ success: true, result });
    }
    if (method === 'PUT' && req.query.action === 'restoreTrash') {
      // Restaurer depuis la corbeille
      const { newsId, userId } = req.body;
      const result = await NewsArchiveService.restoreFromTrash(newsId, userId);
      return res.status(200).json({ success: true, result });
    }
    if (method === 'GET' && req.query.action === 'list') {
      // Lister les articles par statut
      const { status } = req.query;
      const result = await NewsArchiveService.listByStatus(status);
      return res.status(200).json({ success: true, result });
    }
    if (method === 'GET' && req.query.action === 'versions') {
      // Accéder à l’historique des versions
      const { newsId } = req.query;
      const result = await NewsArchiveService.getVersions(newsId);
      return res.status(200).json({ success: true, result });
    }
    return res.status(405).json({ error: 'Méthode non autorisée' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
