import { fetchAPI } from '@/lib/strapi';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { q, type, limit = 5 } = req.query;

    if (!q) {
        return res.status(400).json({ message: 'Search query required' });
    }

    try {
        // Determine which content types to search based on 'type'
        // For now, we search 'news' as a primary source.
        // You can expand this to search pages, documents, etc.

        const searchLimit = parseInt(limit, 10);

        // Search News (Articles)
        const newsResponse = await fetchAPI('/news', {
            filters: {
                $or: [
                    { title: { $containsi: q } },
                    { content: { $containsi: q } },
                ],
            },
            pagination: {
                limit: searchLimit,
            },
            populate: ['cover'],
        });

        // Determine results format
        const results = [];

        if (newsResponse?.data) {
            newsResponse.data.forEach((item) => {
                results.push({
                    _id: item.id,
                    title: item.attributes.title,
                    type: 'news', // Frontend icon type
                    category: item.attributes.category || 'Actualités',
                    url: `/actualites/${item.attributes.slug}`,
                    description: item.attributes.summary || item.attributes.content?.substring(0, 100) + '...',
                    // Add other fields as needed
                });
            });
        }

        // You can add parallel fetches for other content types here if needed
        // const documentsResponse = ...

        res.status(200).json({ results });

    } catch (error) {
        console.error('Search API Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
