import { fetchAPI, endpoints } from '@/lib/strapi';

export default async function handler(req, res) {
    const { id } = req.query;
    const method = req.method;

    if (method === 'GET') {
        if (!id) return res.status(400).json({ error: 'ID required' });
        try {
            const response = await fetchAPI(`${endpoints.articles}/${id}`, {
                populate: ['seo']
            });
            return res.status(200).json(response.data?.attributes?.seo || {});
        } catch (error) {
            return res.status(500).json({ error: 'Strapi error' });
        }
    }

    if (method === 'POST') {
        const { articleId, seoData } = req.body;
        // Note: Updating Strapi from here requires Admin Token and write permissions
        // This might fail if the token is read-only.
        // For now, we stub it to return success or error if not implemented
        return res.status(501).json({ error: 'SEO Updates via Client API not fully implemented in V2' });
    }

    return res.status(405).end();
}
