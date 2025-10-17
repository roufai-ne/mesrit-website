#!/usr/bin/env node
// scripts/initializeV2Collections.js
const { MongoClient } = require('mongodb');

/**
 * Initialise les collections V2 avec leurs index optimisés
 */
class V2CollectionInitializer {
  constructor() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mesrit';
    this.client = new MongoClient(uri);
    this.db = null;
  }

  async initialize() {
    console.log('🔧 INITIALISATION COLLECTIONS V2');
    console.log('=================================\n');

    try {
      await this.client.connect();
      this.db = this.client.db();

      // Créer les collections V2
      await this.createV2Collections();

      // Créer les index optimisés
      await this.createOptimizedIndexes();

      // Réparer les données existantes
      await this.repairExistingData();

      console.log('\n✅ Initialisation V2 terminée avec succès!');
    } catch (error) {
      console.error('❌ Erreur initialisation:', error.message);
      throw error;
    } finally {
      await this.client.close();
    }
  }

  /**
   * Créer les collections V2
   */
  async createV2Collections() {
    console.log('📦 Création des collections V2...');

    const collections = [
      {
        name: 'viewevents',
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['newsId', 'timestamp', 'userAgent'],
            properties: {
              newsId: { bsonType: 'string' },
              timestamp: { bsonType: 'date' },
              userAgent: { bsonType: 'string' },
              ipAddress: { bsonType: 'string' },
              sessionId: { bsonType: 'string' },
              userId: { bsonType: ['string', 'null'] },
              expireAt: { bsonType: 'date' }
            }
          }
        }
      },
      {
        name: 'shareevents',
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['newsId', 'platform', 'timestamp'],
            properties: {
              newsId: { bsonType: 'string' },
              platform: { bsonType: 'string' },
              timestamp: { bsonType: 'date' },
              userId: { bsonType: ['string', 'null'] },
              sessionId: { bsonType: 'string' }
            }
          }
        }
      },
      {
        name: 'dailynewsstats',
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['newsId', 'date', 'totalViews'],
            properties: {
              newsId: { bsonType: 'string' },
              date: { bsonType: 'date' },
              totalViews: { bsonType: 'int' },
              uniqueViews: { bsonType: 'int' },
              totalShares: { bsonType: 'int' }
            }
          }
        }
      }
    ];

    for (const collection of collections) {
      try {
        await this.db.createCollection(collection.name, {
          validator: collection.validator
        });
        console.log(`✅ Collection ${collection.name} créée`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`ℹ️ Collection ${collection.name} existe déjà`);
        } else {
          console.error(`❌ Erreur création ${collection.name}:`, error.message);
        }
      }
    }
  }

  /**
   * Créer les index optimisés
   */
  async createOptimizedIndexes() {
    console.log('\n🗂️ Création des index optimisés...');

    const indexes = [
      // News collection
      {
        collection: 'news',
        indexes: [
          { fields: { slug: 1 }, options: { unique: true, background: true } },
          { fields: { status: 1, publishedAt: -1 }, options: { background: true } },
          { fields: { category: 1, publishedAt: -1 }, options: { background: true } },
          { fields: { publishedAt: -1 }, options: { background: true } },
          { fields: { archived: 1, status: 1 }, options: { background: true } }
        ]
      },
      // ViewEvents collection
      {
        collection: 'viewevents',
        indexes: [
          { fields: { newsId: 1, timestamp: -1 }, options: { background: true } },
          { fields: { timestamp: -1 }, options: { background: true } },
          { fields: { expireAt: 1 }, options: { expireAfterSeconds: 0, background: true } },
          { fields: { sessionId: 1 }, options: { background: true } },
          { fields: { userId: 1 }, options: { sparse: true, background: true } }
        ]
      },
      // ShareEvents collection
      {
        collection: 'shareevents',
        indexes: [
          { fields: { newsId: 1, platform: 1 }, options: { background: true } },
          { fields: { timestamp: -1 }, options: { background: true } },
          { fields: { platform: 1 }, options: { background: true } },
          { fields: { userId: 1 }, options: { sparse: true, background: true } }
        ]
      },
      // DailyNewsStats collection
      {
        collection: 'dailynewsstats',
        indexes: [
          { fields: { newsId: 1, date: -1 }, options: { unique: true, background: true } },
          { fields: { date: -1 }, options: { background: true } },
          { fields: { newsId: 1 }, options: { background: true } }
        ]
      },
      // NewsAnalytics collection (V1)
      {
        collection: 'newsanalytics',
        indexes: [
          { fields: { newsId: 1 }, options: { unique: true, background: true } },
          { fields: { lastUpdated: -1 }, options: { background: true } }
        ]
      }
    ];

    for (const { collection, indexes: collectionIndexes } of indexes) {
      console.log(`🔍 Index pour ${collection}:`);

      try {
        const coll = this.db.collection(collection);

        for (const { fields, options } of collectionIndexes) {
          try {
            await coll.createIndex(fields, options);
            const indexName = Object.keys(fields).map(k => `${k}_${fields[k]}`).join('_');
            console.log(`  ✅ ${indexName}`);
          } catch (error) {
            if (error.message.includes('already exists')) {
              const indexName = Object.keys(fields).map(k => `${k}_${fields[k]}`).join('_');
              console.log(`  ℹ️ ${indexName} existe déjà`);
            } else {
              console.error(`  ❌ Erreur index:`, error.message);
            }
          }
        }
      } catch (error) {
        console.error(`❌ Erreur collection ${collection}:`, error.message);
      }
    }
  }

  /**
   * Réparer les données existantes
   */
  async repairExistingData() {
    console.log('\n🔧 Réparation des données existantes...');

    await this.fixDuplicateSlugs();
    await this.generateMissingSlugs();
  }

  /**
   * Corriger les slugs dupliqués
   */
  async fixDuplicateSlugs() {
    console.log('🔧 Correction des slugs dupliqués...');

    const newsCollection = this.db.collection('news');

    // Trouver les slugs dupliqués
    const duplicates = await newsCollection.aggregate([
      { $group: { _id: '$slug', count: { $sum: 1 }, docs: { $push: '$_id' } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    for (const duplicate of duplicates) {
      console.log(`🔧 Réparation slug dupliqué: "${duplicate._id}"`);

      const docs = duplicate.docs;
      // Garder le premier, renommer les autres
      for (let i = 1; i < docs.length; i++) {
        const newSlug = `${duplicate._id}-${i}`;
        await newsCollection.updateOne(
          { _id: docs[i] },
          { $set: { slug: newSlug } }
        );
        console.log(`  ✅ ${duplicate._id} → ${newSlug}`);
      }
    }
  }

  /**
   * Générer les slugs manquants
   */
  async generateMissingSlugs() {
    console.log('🔧 Génération des slugs manquants...');

    const newsCollection = this.db.collection('news');

    // Trouver les actualités sans slug
    const newsWithoutSlug = await newsCollection.find({
      $or: [
        { slug: { $exists: false } },
        { slug: '' },
        { slug: null }
      ]
    }).toArray();

    for (const news of newsWithoutSlug) {
      const slug = this.generateSlug(news.title);
      await newsCollection.updateOne(
        { _id: news._id },
        { $set: { slug } }
      );
      console.log(`  ✅ "${news.title}" → ${slug}`);
    }
  }

  /**
   * Générer un slug à partir d'un titre
   */
  generateSlug(title) {
    if (!title) return 'actualite-sans-titre';

    return title
      .toLowerCase()
      .trim()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[ñ]/g, 'n')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 60);
  }
}

// Exécution
async function main() {
  const initializer = new V2CollectionInitializer();
  await initializer.initialize();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { V2CollectionInitializer };