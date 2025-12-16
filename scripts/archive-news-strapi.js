const fetch = require('node-fetch');

// Configuration
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_ADMIN_TOKEN;

async function archiveOldNews() {
    if (!STRAPI_TOKEN) {
        console.error('STRAPI_ADMIN_TOKEN is missing');
        process.exit(1);
    }

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const dateStr = oneYearAgo.toISOString().split('T')[0];

    console.log(`Searching for articles older than ${dateStr}...`);

    try {
        // 1. Find old articles (published)
        const searchUrl = `${STRAPI_URL}/api/articles?filters[publishedAt][$lt]=${dateStr}&filters[status][$eq]=published`;
        const res = await fetch(searchUrl, {
            headers: { Authorization: `Bearer ${STRAPI_TOKEN}` }
        });
        const data = await res.json();
        const articles = data.data || [];

        console.log(`Found ${articles.length} articles to archive.`);

        // 2. Update status to 'archived'
        for (const article of articles) {
            console.log(`Archiving: ${article.attributes.title} (ID: ${article.id})`);

            const updateRes = await fetch(`${STRAPI_URL}/api/articles/${article.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${STRAPI_TOKEN}`
                },
                body: JSON.stringify({
                    data: { status: 'archived' }
                })
            });

            if (!updateRes.ok) {
                console.error(`Failed to archive ID ${article.id}: ${updateRes.statusText}`);
            }
        }

        console.log('Archiving complete.');

    } catch (error) {
        console.error('Error during archiving:', error);
    }
}

archiveOldNews();
