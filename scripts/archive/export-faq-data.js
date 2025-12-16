const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in .env');
    process.exit(1);
}

const FAQSchema = new mongoose.Schema({
    question: String,
    answer: String,
    category: String,
    order: Number,
    isActive: Boolean
}, { timestamps: true });

const FAQ = mongoose.models.FAQ || mongoose.model('FAQ', FAQSchema);

const exportData = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected');

        const outputDir = path.join(__dirname, '../data/migration-export');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        console.log('Exporting FAQs...');
        const faqs = await FAQ.find({ isActive: true });
        fs.writeFileSync(path.join(outputDir, 'faqs.json'), JSON.stringify(faqs, null, 2));
        console.log(`✅ Exported ${faqs.length} FAQs`);

        console.log('✨ Export Complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Export failed:', error);
        process.exit(1);
    }
};

exportData();
