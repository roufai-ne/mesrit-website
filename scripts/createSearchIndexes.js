// Script pour créer les index de recherche MongoDB
import { connectDB } from '@/lib/mongodb.js';
import News from '@/models/News.js';
import Document from '@/models/Document.js';
import Service from '@/models/Service.js';
import Establishment from '@/models/Establishment.js';

const createSearchIndexes = async () => {
  try {
    console.log('🔍 Création des index de recherche MongoDB...\n');
    
    await connectDB();
    
    // Créer les index pour News
    console.log('📰 Création des index pour News...');
    await News.createIndexes();
    console.log('✅ Index News créés');
    
    // Créer les index pour Documents
    console.log('📄 Création des index pour Documents...');
    await Document.createIndexes();
    console.log('✅ Index Documents créés');
    
    // Créer les index pour Services (déjà existants, mais on s'assure)
    console.log('🛠️ Création des index pour Services...');
    await Service.createIndexes();
    console.log('✅ Index Services créés');
    
    // Créer les index pour Establishments
    console.log('🏫 Création des index pour Establishments...');
    await Establishment.createIndexes();
    console.log('✅ Index Establishments créés');
    
    console.log('\n🎉 Tous les index de recherche ont été créés avec succès!');
    
    // Afficher les statistiques des index
    console.log('\n📊 Statistiques des index:');
    
    const newsIndexes = await News.collection.getIndexes();
    console.log(`📰 News: ${Object.keys(newsIndexes).length} index`);
    
    const docIndexes = await Document.collection.getIndexes();
    console.log(`📄 Documents: ${Object.keys(docIndexes).length} index`);
    
    const serviceIndexes = await Service.collection.getIndexes();
    console.log(`🛠️ Services: ${Object.keys(serviceIndexes).length} index`);
    
    const estIndexes = await Establishment.collection.getIndexes();
    console.log(`🏫 Establishments: ${Object.keys(estIndexes).length} index`);
    
    console.log('\n💡 Les performances de recherche sont maintenant optimisées!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des index:', error);
  } finally {
    process.exit(0);
  }
};

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  createSearchIndexes();
}

export default createSearchIndexes;