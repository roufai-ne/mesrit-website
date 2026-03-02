export const ROUTE_TYPES = {
    PUBLIC: 'public',
    PROTECTED: 'protected',
    ADMIN: 'admin'
};

// Simple In-Memory Rate Limiter (replacement for Redis)
class SimpleRateLimit {
    constructor(windowMs = 60000, maxRequests = 100) {
        this.windowMs = windowMs;
        this.maxRequests = maxRequests;
        this.hits = new Map();

        // Cleanup interval
        setInterval(() => this.cleanup(), windowMs);
    }

    cleanup() {
        const now = Date.now();
        for (const [ip, data] of this.hits.entries()) {
            if (now - data.timestamp > this.windowMs) {
                this.hits.delete(ip);
            }
        }
    }

    check(req, res) {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        const now = Date.now();

        if (!this.hits.has(ip)) {
            this.hits.set(ip, { count: 1, timestamp: now });
            return true;
        }

        const data = this.hits.get(ip);

        if (now - data.timestamp > this.windowMs) {
            // Reset window
            data.count = 1;
            data.timestamp = now;
            return true;
        }

        if (data.count >= this.maxRequests) {
            return false;
        }

        data.count++;
        return true;
    }
}

// Export pre-configured limiters
// NOTE: in-memory uniquement — reset au redémarrage du serveur, non distribué
export const rateLimiters = {
    chat: new SimpleRateLimit(60 * 1000, 5),       // 5 req/min par IP — chatbot
    newsletter: new SimpleRateLimit(60 * 1000, 3),  // 3 req/min par IP — inscription newsletter
    contact: new SimpleRateLimit(60 * 1000, 3),     // 3 req/min par IP — formulaire contact
    api: new SimpleRateLimit(60 * 1000, 60)         // 60 req/min par IP — général
};

/**
 * Middleware de gestion des routes API
 * Simplifié pour la migration Strapi (suppression des dépendances Mongo/Redis complexes)
 */
export function apiHandler(handlers, routeConfig = {}) {
    return async (req, res) => {
        const method = req.method;
        const handler = handlers[method];

        if (!handler) {
            return res.status(405).json({
                success: false,
                error: `Méthode ${method} non autorisée`
            });
        }

        try {
            await handler(req, res);
        } catch (error) {
            console.error(`[API] Erreur non gérée sur ${req.url}:`, error);

            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    error: 'Erreur serveur interne'
                });
            }
        }
    };
}
