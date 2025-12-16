const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env in the root directory
dotenv.config({ path: path.join(__dirname, '../.env') }); // Assuming script is in /scripts

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_ADMIN_TOKEN;

if (!STRAPI_TOKEN) {
    console.error('Error: STRAPI_ADMIN_TOKEN is not defined in .env');
    process.exit(1);
}

const defaultStats = [
    { statKey: "students", value: 25000, label: "Étudiants", color: "blue", suffix: "+", order: 1 },
    { statKey: "institutions", value: 15, label: "Établissements", color: "green", order: 2 },
    { statKey: "teachers", value: 1500, label: "Enseignants", color: "purple", suffix: "+", order: 3 },
    { statKey: "publications", value: 120, label: "Publications Scientifiques", color: "orange", order: 4 }
];

async function seed() {
    console.log(`Seeding statistics to ${STRAPI_URL}...`);

    // First, check if stats already exist to avoid duplicates if re-run (rudimentary check)
    try {
        const check = await axios.get(`${STRAPI_URL}/api/statistics`, {
            headers: { Authorization: `Bearer ${STRAPI_TOKEN}` }
        });
        if (check.data.data && check.data.data.length > 0) {
            console.log('Statistics already exist. Skipping seed to avoid duplicates.');
            // Optionally delete them? No, safety first.
            return;
        }
    } catch (e) {
        console.log('Could not check existing stats, proceeding with caution...', e.message);
    }

    for (const stat of defaultStats) {
        try {
            await axios.post(`${STRAPI_URL}/api/statistics`, { data: stat }, {
                headers: {
                    Authorization: `Bearer ${STRAPI_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log(`✅ Seeded: ${stat.label}`);
        } catch (error) {
            console.error(`❌ Failed to seed ${stat.label}:`, error.response?.data?.error?.message || error.message);
        }
    }
    console.log('Seeding complete.');
}

seed();
