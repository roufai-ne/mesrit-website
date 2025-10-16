// scripts/autoArchiveNews.js
// Script d'archivage intelligent automatique des articles

const mongoose = require('mongoose');
const { News } = require('../src/models/News');
const { NewsArchiveService } = require('../src/lib/newsArchive');
const { connectDB } = require('../src/lib/mongodb');

async function autoArchiveNews() {
  await connectDB();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  // Cherche les articles publiés depuis plus d'un an et non archivés
  const oldNews = await News.find({
    status: 'published',
    date: { $lte: oneYearAgo },
    archived: { $ne: true }
  });

  console.log(`Articles à archiver: ${oldNews.length}`);

  for (const article of oldNews) {
    try {
      await NewsArchiveService.archiveArticle(article._id, 'auto-archive', 'Archivage automatique (>1 an)');
      console.log(`Archivé: ${article.title}`);
    } catch (err) {
      console.error(`Erreur archivage ${article.title}:`, err.message);
    }
  }

  mongoose.connection.close();
}

autoArchiveNews();
