// scripts/generate-strapi-content-types.js
const fs = require('fs');
const path = require('path');

const BACKEND_API_DIR = path.join(__dirname, '../backend/src/api');

// Helper to create directory if not exists
const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// Helper to write file
const writeFile = (filePath, content) => {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, content);
    console.log(`Created: ${filePath}`);
};

// Templates
const getController = (uid) => `/**
 * ${uid} controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::${uid}.${uid}');
`;

const getService = (uid) => `/**
 * ${uid} service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::${uid}.${uid}');
`;

const getRouter = (uid) => `/**
 * ${uid} router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::${uid}.${uid}');
`;

// Definitions
const contentTypes = {
    article: {
        schema: {
            kind: 'collectionType',
            collectionName: 'articles',
            info: {
                singularName: 'article',
                pluralName: 'articles',
                displayName: 'Article',
                description: 'News and Articles'
            },
            options: {
                draftAndPublish: true,
            },
            pluginOptions: {},
            attributes: {
                title: { type: 'string', required: true },
                slug: { type: 'uid', targetField: 'title', required: true },
                content: { type: 'richtext' }, // Changed to richtext to support HTML/Markdown migration
                summary: { type: 'text' },
                category: { type: 'enumeration', enum: ['actualite', 'evenement', 'communique', 'autre'], default: 'actualite' },
                publishedAt: { type: 'datetime' },
                // Media
                cover: { type: 'media', multiple: false, allowedTypes: ['images'], required: false },
                // Relations
                // We will skip relations for now to avoid circular dependency errors if target doesn't exist
            }
        }
    },
    document: {
        schema: {
            kind: 'collectionType',
            collectionName: 'documents',
            info: {
                singularName: 'document',
                pluralName: 'documents',
                displayName: 'Document',
            },
            options: {
                draftAndPublish: true,
            },
            attributes: {
                title: { type: 'string', required: true },
                description: { type: 'text' },
                category: { type: 'enumeration', enum: ['loi', 'decret', 'arrete', 'circulaire', 'rapport', 'guide'] },
                subType: { type: 'string' }, // For specific report types e.g. 'Rapport Annuel'
                audience: { type: 'enumeration', enum: ['Étudiants', 'Enseignants', 'Administrateurs', 'Chercheurs', 'Tous'] },
                file: { type: 'media', multiple: false, allowedTypes: ['files', 'images'] },
                publicationDate: { type: 'date' }
            }
        }
    },
    event: {
        schema: {
            kind: 'collectionType',
            collectionName: 'events',
            info: {
                singularName: 'event',
                pluralName: 'events',
                displayName: 'Event',
            },
            options: {
                draftAndPublish: true,
            },
            attributes: {
                title: { type: 'string', required: true },
                description: { type: 'text' },
                startDate: { type: 'datetime' },
                endDate: { type: 'datetime' },
                location: { type: 'string' },
                cover: { type: 'media', multiple: false, allowedTypes: ['images'] }
            }
        }
    },
    faq: {
        schema: {
            kind: 'collectionType',
            collectionName: 'faqs',
            info: {
                singularName: 'faq',
                pluralName: 'faqs',
                displayName: 'FAQ',
                description: 'Frequently Asked Questions'
            },
            options: {
                draftAndPublish: true,
            },
            attributes: {
                question: { type: 'string', required: true },
                answer: { type: 'richtext', required: true },
                category: { type: 'string', required: true },
                order: { type: 'integer', default: 0 }
            }
        }
    },
    message: {
        schema: {
            kind: 'collectionType',
            collectionName: 'messages',
            info: {
                singularName: 'message',
                pluralName: 'messages',
                displayName: 'Message',
                description: 'Contact form messages'
            },
            options: {
                draftAndPublish: false, // No need to publish messages
            },
            attributes: {
                name: { type: 'string', required: true },
                email: { type: 'email', required: true },
                subject: { type: 'string', required: true },
                message: { type: 'text', required: true },
                status: { type: 'enumeration', enum: ['new', 'read', 'replied'], default: 'new' }
            }
        }
    },
    establishment: {
        schema: {
            kind: 'collectionType',
            collectionName: 'establishments',
            info: {
                singularName: 'establishment',
                pluralName: 'establishments',
                displayName: 'Establishment',
                description: 'Universities, Schools and Institutes'
            },
            options: { draftAndPublish: true },
            attributes: {
                name: { type: 'string', required: true },
                type: { type: 'enumeration', enum: ['Université', 'Institut', 'École', 'Centre'], required: true },
                status: { type: 'enumeration', enum: ['public', 'privé'], default: 'public' },
                region: { type: 'string' },
                city: { type: 'string' },
                openingDate: { type: 'date' },
                website: { type: 'string' },
                description: { type: 'text' },
                contactEmail: { type: 'email' },
                contactPhone: { type: 'string' },
                contactAddress: { type: 'text' },
                studentCount: { type: 'integer' },
                programCount: { type: 'integer' },
                logo: { type: 'media', multiple: false, allowedTypes: ['images'] }
            }
        }
    },
    service: {
        schema: {
            kind: 'collectionType',
            collectionName: 'services',
            info: {
                singularName: 'service',
                pluralName: 'services',
                displayName: 'Service',
                description: 'Services offerts (Bourses, CNOU, etc.)'
            },
            options: { draftAndPublish: true },
            attributes: {
                title: { type: 'string', required: true },
                description: { type: 'text' },
                longDescription: { type: 'richtext' },
                icon: { type: 'string' },
                category: {
                    type: 'enumeration',
                    enum: ['etudiants', 'etablissements', 'recherche', 'administration', 'formation'],
                    default: 'etudiants'
                },
                url: { type: 'string' },
                isExternal: { type: 'boolean', default: false },
                priority: { type: 'integer', default: 0 },
                image: { type: 'media', multiple: false, allowedTypes: ['images'] }
            }
        }
    },
    partner: {
        schema: {
            kind: 'collectionType',
            collectionName: 'partners',
            info: {
                singularName: 'partner',
                pluralName: 'partners',
                displayName: 'Partner',
                description: 'Technical and Financial Partners'
            },
            options: { draftAndPublish: true },
            attributes: {
                name: { type: 'string', required: true },
                type: {
                    type: 'enumeration',
                    enum: ['technique', 'financier', 'academique', 'institutionnel'],
                    default: 'technique'
                },
                description: { type: 'text' },
                website: { type: 'string' },
                country: { type: 'string' },
                isFeatured: { type: 'boolean', default: false },
                order: { type: 'integer', default: 0 },
                logo: { type: 'media', multiple: false, allowedTypes: ['images'] }
            }
        }
    },
    director: {
        schema: {
            kind: 'collectionType',
            collectionName: 'directors',
            info: {
                singularName: 'director',
                pluralName: 'directors',
                displayName: 'Director',
                description: 'Directeurs et Responsables (Organigramme)'
            },
            options: { draftAndPublish: true },
            attributes: {
                nom: { type: 'string', required: true },
                titre: { type: 'string', required: true },
                direction: { type: 'string' },
                key: { type: 'string' }, // Added key for filtering (SG, DGES, etc.)
                nomComplet: { type: 'string' }, // Added nomComplet
                responsable: { type: 'string' }, // Added responsable
                mission: { type: 'text' },
                email: { type: 'email' },
                telephone: { type: 'string' },
                order: { type: 'integer', default: 0 },
                photo: { type: 'media', multiple: false, allowedTypes: ['images'] }
            }
        }
    },
    subscriber: {
        schema: {
            kind: 'collectionType',
            collectionName: 'subscribers',
            info: {
                singularName: 'subscriber',
                pluralName: 'subscribers',
                displayName: 'Newsletter Subscriber',
                description: 'Abonnés à la newsletter'
            },
            options: { draftAndPublish: false },
            attributes: {
                email: { type: 'email', required: true, unique: true },
                status: { type: 'enumeration', enum: ['pending', 'active', 'unsubscribed'], default: 'pending' },
                subscribedAt: { type: 'datetime', default: null },
                confirmationToken: { type: 'string' },
                unsubscribeToken: { type: 'string' },
                confirmationTokenExpires: { type: 'datetime' },
                unsubscribeTokenExpires: { type: 'datetime' }
            }
        }
    },
    alert: {
        schema: {
            kind: 'collectionType',
            collectionName: 'alerts',
            info: {
                singularName: 'alert',
                pluralName: 'alerts',
                displayName: 'Alert',
                description: 'Bannières d\'alerte et d\'information'
            },
            options: { draftAndPublish: true },
            attributes: {
                title: { type: 'string', required: true },
                description: { type: 'text', required: true },
                priority: { type: 'enumeration', enum: ['high', 'medium', 'low'], default: 'medium' },
                startDate: { type: 'datetime' },
                endDate: { type: 'datetime' }
            }
        }
    },
    statistic: {
        schema: {
            kind: 'collectionType',
            collectionName: 'statistics',
            info: {
                singularName: 'statistic',
                pluralName: 'statistics',
                displayName: 'Statistic',
                description: 'Chiffres clés (Homepage)'
            },
            options: { draftAndPublish: true },
            attributes: {
                statKey: { type: 'string', required: true, unique: true },
                label: { type: 'string', required: true },
                value: { type: 'integer', required: true },
                suffix: { type: 'string' }, // ex: '+' or '%'
                color: { type: 'string' }, // blue, green, etc.
                icon: { type: 'string' }, // Lucide icon name
                order: { type: 'integer', default: 0 }
            }
        }
    }
};

async function generate() {
    console.log('Generating Strapi Content Types in:', BACKEND_API_DIR);

    for (const [uid, def] of Object.entries(contentTypes)) {
        const apiDir = path.join(BACKEND_API_DIR, uid);

        // 1. Schema
        writeFile(
            path.join(apiDir, 'content-types', uid, 'schema.json'),
            JSON.stringify(def.schema, null, 2)
        );

        // 2. Controller
        writeFile(
            path.join(apiDir, 'controllers', `${uid}.ts`),
            getController(uid)
        );

        // 3. Service
        writeFile(
            path.join(apiDir, 'services', `${uid}.ts`),
            getService(uid)
        );

        // 4. Router
        writeFile(
            path.join(apiDir, 'routes', `${uid}.ts`),
            getRouter(uid)
        );
    }

    console.log('✅ Generation Complete. Strapi expects "npm run develop" to be restarted.');
}

generate();
