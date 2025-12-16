// scripts/export-mongo-data.js
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Config
dotenv.config();

const EXPORT_DIR = path.join(__dirname, '../data/migration-export');
const COLLECTIONS_TO_EXPORT = [
    'news',
    'users',
    'documents',
    'events',
    'partners',
    'establishments',
    'services',
    'directors',
    'pagecontents', // For search index content
    'newsletters', // For subscribers
    'alerts' // For alerts
];

if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

async function exportData() {
    if (!process.env.MONGODB_URI) {
        console.error('Error: MONGODB_URI not found in .env');
        process.exit(1);
    }

    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        for (const collectionName of COLLECTIONS_TO_EXPORT) {
            console.log(`Exporting raw collection: ${collectionName}...`);

            // Access raw collection to avoid model schema issues during export
            const collection = mongoose.connection.db.collection(collectionName);
            const data = await collection.find({}).toArray();

            const filePath = path.join(EXPORT_DIR, `${collectionName}.json`);
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

            console.log(`✅ Saved ${data.length} records to ${filePath}`);
        }

        console.log('Easy export completed!');
        process.exit(0);

    } catch (error) {
        console.error('Migration Export Error:', error);
        process.exit(1);
    }
}

exportData();
