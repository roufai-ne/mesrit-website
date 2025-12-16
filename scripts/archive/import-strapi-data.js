// scripts/import-strapi-data.js
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const dotenv = require('dotenv');

// Config
dotenv.config();

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
// Use a permanent token or login as admin to get one. For migration, asking user to provide token is safer/easier.
const STRAPI_TOKEN = process.env.STRAPI_ADMIN_TOKEN;

const DATA_DIR = path.join(__dirname, '../data/migration-export');

if (!STRAPI_TOKEN) {
    console.error('❌ Error: STRAPI_ADMIN_TOKEN is missing in .env');
    console.error('👉 Please create an API Token in Strapi Admin (Settings > API Tokens) and add it to your .env file.');
    process.exit(1);
}

const mapArticle = (news) => ({
    title: news.title,
    slug: news.slug, // Strapi might regenerate this if not forced, but we want to keep SEO urls
    content: news.content, // TODO: Convert HTML to Blocks if using Blocks field, or Markdown/RichText
    summary: news.summary,
    category: news.category === 'evenement' ? 'evenement' : 'actualite', // Simple mapping
    publishedAt: news.status === 'published' ? (news.publishedAt || news.date) : null,
    // cover: We need to handle media separately
});

const normalizeDocCategory = (doc) => {
    const cat = doc.category;
    if (cat === 'regulatory') {
        const lowerText = (doc.title + ' ' + (doc.description || '')).toLowerCase();
        if (lowerText.includes('decret') || lowerText.includes('décret')) return 'decret';
        if (lowerText.includes('loi')) return 'loi';
        if (lowerText.includes('arrete') || lowerText.includes('arrêté')) return 'arrete';
        if (lowerText.includes('ordonnance')) return 'ordonnance';
        if (lowerText.includes('circulaire')) return 'circulaire';
        return 'loi'; // Default fallback
    }

    const map = {
        'guides': 'guide',
        'rapports': 'rapport',
        'lois': 'loi',
        'decrets': 'decret',
        'arretes': 'arrete',
        'circulaires': 'circulaire',
        'reports': 'rapport'
    };
    return map[cat] || cat;
};

const mapDocument = (doc) => {
    const category = normalizeDocCategory(doc);

    // Infer subType if missing
    let subType = doc.subType;
    if (!subType) {
        if (category === 'decret') subType = 'Décret';
        else if (category === 'loi') subType = 'Loi';
        else if (category === 'arrete') subType = 'Arrêté';
        else if (category === 'ordonnance') subType = 'Ordonnance';
        else if (category === 'circulaire') subType = 'Circulaire';
        else if (category === 'rapport') subType = 'Rapport';
        else if (category === 'guide') subType = 'Guide';
    }

    return {
        title: doc.title,
        description: doc.description,
        category: category,
        subType: subType,
        audience: doc.audience || 'Tous',
        publicationDate: doc.createdAt
    };
};

const mapFAQ = (faq) => ({
    question: faq.question,
    answer: faq.answer,
    category: faq.category || 'Général',
    order: faq.order || 0
});

const mapEstablishment = (est) => ({
    name: est.nom || est.name,
    type: est.type,
    status: est.statut || 'public',
    region: est.region,
    city: est.ville,
    openingDate: est.dateOuverture,
    website: est.website,
    description: est.description,
    contactEmail: est.contact?.email,
    contactPhone: est.contact?.phone,
    contactAddress: est.contact?.address,
    studentCount: est.numberOfStudents,
    programCount: est.numberOfPrograms
});

const mapService = (srv) => ({
    title: srv.title,
    description: srv.description,
    longDescription: srv.longDescription,
    icon: srv.icon,
    category: srv.category,
    url: srv.url,
    isExternal: srv.isExternal,
    priority: srv.priority || 0
});

const mapPartner = (prt) => ({
    name: prt.name,
    type: prt.type,
    description: prt.description,
    website: prt.website,
    country: prt.country,
    isFeatured: prt.isFeatured,
    order: prt.order || 0
});

const mapEvent = (evt) => {
    // Combine date and time if possible, or just use date
    let start = evt.startDate || evt.date;
    if (evt.date && evt.time) {
        try {
            // Very basic parsing, might fail if formats differ
            const d = new Date(evt.date);
            const [hours, minutes] = evt.time.split(':');
            d.setHours(hours || 0, minutes || 0);
            start = d.toISOString();
        } catch (e) {
            // fallback to date only
        }
    }
    return {
        title: evt.title,
        description: evt.description,
        startDate: start,
        endDate: evt.endDate,
        location: evt.location
    };
};

const mapDirector = (dir) => ({
    nom: dir.nom,
    titre: dir.titre,
    direction: dir.direction,
    mission: dir.mission,
    email: dir.email,
    telephone: dir.telephone,
    order: dir.order || 0
});

const mapSubscriber = (sub) => ({
    email: sub.email,
    status: sub.status === 'confirmed' ? 'active' : (sub.status || 'pending'),
    subscribedAt: sub.createdAt || sub.subscribedAt || new Date().toISOString()
});

const mapAlert = (alert) => ({
    title: alert.title,
    description: alert.description,
    priority: alert.priority || 'medium',
    startDate: alert.startDate || alert.date,
    endDate: alert.endDate
});

const importCollection = async (filename, endpoint, mapper) => {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️ File ${filename} not found, skipping.`);
        return;
    }

    const rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    console.log(`🚀 Importing ${rawData.length} items from ${filename} to ${endpoint}...`);

    let success = 0;
    let skipped = 0;
    let failed = 0;

    for (const item of rawData) {
        try {
            const payload = { data: mapper(item) };

            await axios.post(`${STRAPI_URL}/api/${endpoint}`, payload, {
                headers: {
                    Authorization: `Bearer ${STRAPI_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log(`  ✅ Imported: ${item.title || item.name || item.email || item.nom || 'Item'}`);
            success++;
        } catch (error) {
            if (error.response?.status === 400 && error.response?.data?.error?.message?.includes('must be unique')) {
                console.log(`  ⏩ Skipped (Duplicate): ${item.title || item.slug || item.email}`);
                skipped++;
            } else {
                console.error(`  ❌ Failed: ${item.title || item.name || item.email}`);
                console.error('Error Details:', JSON.stringify(error.response?.data?.error || error.message, null, 2));
                failed++;
            }
        }
        // Small delay to avoid rate limiting or DB locks
        await new Promise(r => setTimeout(r, 50));
    }

    console.log(`📊 Result for ${endpoint}: ${success} success, ${skipped} skipped, ${failed} failed.`);
};

async function runImport() {
    console.log(`Starting Import to ${STRAPI_URL}`);

    // Import Articles (News)
    await importCollection('news.json', 'articles', mapArticle);

    // Import Documents
    await importCollection('documents.json', 'documents', mapDocument);

    // Import FAQs
    await importCollection('faqs.json', 'faqs', mapFAQ);

    // Import Establishments
    await importCollection('establishments.json', 'establishments', mapEstablishment);

    // Import Services
    await importCollection('services.json', 'services', mapService);

    // Import Partners
    await importCollection('partners.json', 'partners', mapPartner);

    // Import Events
    await importCollection('events.json', 'events', mapEvent);

    // Import Directors
    await importCollection('directors.json', 'directors', mapDirector);

    // Import Subscribers
    await importCollection('newsletters.json', 'subscribers', mapSubscriber);

    // Import Alerts
    await importCollection('alerts.json', 'alerts', mapAlert);

    console.log('✨ Import finished!');
}

runImport();
