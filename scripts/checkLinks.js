const axios = require('axios');
const cheerio = require('cheerio');

// Configuration
const BASE_URL = 'http://localhost:3000';

// Liste des pages à vérifier (Extrait du sitemap/crawler)
const SEED_PAGES = [
    '/',
    '/sitemap',
    '/services-etudiants',
    '/ministere',
    '/ministere/missions',
    '/ministere/historique',
    '/ministere/organisation',
    '/ministere/direction',
    '/etablissements',
    '/etablissements/universites',
    '/etablissements/instituts',
    '/etablissements/ecoles',
    '/etablissements/centres',
    '/actualites',
    '/documentation',
    '/documentation/lois',
    '/documentation/circulaires',
    '/documentation/rapports',
    '/documentation/guides',
    '/services',
    '/contact',
    '/faq',
    '/mentions-legales',
    '/politique-confidentialite',
    '/conditions-utilisation'
];

async function checkLinks() {
    console.log('🔗 Starting Link Integrity Check...');
    console.log(`📍 Base URL: ${BASE_URL}\n`);

    const results = {
        checked: 0,
        ok: 0,
        broken: 0,
        errors: []
    };

    for (const path of SEED_PAGES) {
        const url = `${BASE_URL}${path}`;
        try {
            process.stdout.write(`Checking ${path.padEnd(40)} ... `);
            const response = await axios.get(url, {
                validateStatus: () => true, // Don't throw on 404/500
                timeout: 5000
            });

            if (response.status >= 200 && response.status < 400) {
                console.log(`✅ ${response.status}`);
                results.ok++;
            } else {
                console.log(`❌ ${response.status}`);
                results.broken++;
                results.errors.push({ path, status: response.status });
            }
        } catch (error) {
            console.log(`❌ ERROR: ${error.message}`);
            results.broken++;
            results.errors.push({ path, error: error.message });
        }
        results.checked++;
    }

    console.log('\n═══════════════════════════════════════════');
    console.log('📊 CHECK COMPLETE');
    console.log(`✅ OK: ${results.ok}`);
    console.log(`❌ BROKEN: ${results.broken}`);

    if (results.broken > 0) {
        console.log('\nFAILED LINKS:');
        results.errors.forEach(e => console.log(`- ${e.path}: ${e.status || e.error}`));
    } else {
        console.log('\n🎉 No broken links found in main navigation!');
    }
}

checkLinks();
