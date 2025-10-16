// API pour créer les index de recherche MongoDB
import { connectDB } from '@/lib/mongodb';
import News from '@/models/News';
import Document from '@/models/Document';
import Service from '@/models/Service';
import Establishment from '@/models/Establishment';
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';

const createIndexesHandler = async (req, res) => {
  try {
    console.log('🔍 Début de la création des index de recherche...');
    
    await connectDB();
    
    const results = {};
    const errors = [];
    
    // Créer les index pour chaque modèle
    const models = [
      { name: 'News', model: News },
      { name: 'Document', model: Document },
      { name: 'Service', model: Service },
      { name: 'Establishment', model: Establishment }
    ];
    
    for (const { name, model } of models) {
      try {
        console.log(`📊 Création des index pour ${name}...`);
        await model.createIndexes();
        
        // Obtenir les statistiques des index
        const indexes = await model.collection.getIndexes();
        results[name] = {
          success: true,
          indexCount: Object.keys(indexes).length,
          indexes: Object.keys(indexes)
        };
        
        console.log(`✅ Index ${name} créés: ${Object.keys(indexes).length} index`);
        
      } catch (error) {
        console.error(`❌ Erreur pour ${name}:`, error);
        errors.push(`${name}: ${error.message}`);
        results[name] = {
          success: false,
          error: error.message
        };
      }
    }
    
    // Statistiques globales
    const totalIndexes = Object.values(results)
      .filter(r => r.success)
      .reduce((sum, r) => sum + r.indexCount, 0);
    
    const response = {
      message: 'Création des index terminée',
      success: errors.length === 0,
      results,
      summary: {
        totalModels: models.length,
        successfulModels: Object.values(results).filter(r => r.success).length,
        failedModels: errors.length,
        totalIndexes,
        errors: errors.length > 0 ? errors : null
      },
      timestamp: new Date().toISOString()
    };
    
    if (errors.length > 0) {
      console.log(`⚠️ Création terminée avec ${errors.length} erreurs`);
      res.status(207).json(response); // 207 Multi-Status
    } else {
      console.log('🎉 Tous les index ont été créés avec succès!');
      res.status(200).json(response);
    }
    
  } catch (error) {
    console.error('❌ Erreur générale lors de la création des index:', error);
    res.status(500).json({
      message: 'Erreur lors de la création des index',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Export avec middleware de sécurité (admin seulement)
export default apiHandler({
  POST: createIndexesHandler
}, {
  POST: ROUTE_TYPES.ADMIN
});