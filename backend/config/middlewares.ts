export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      origin: [
        // Origines de développement — exclues en production
        ...(process.env.NODE_ENV !== 'production'
          ? ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://192.168.10.115:3000']
          : []),
        // Origines de production
        'https://site.mesrit.com',
        'https://www.site.mesrit.com',
        'https://mesrit.ma',
        'https://www.mesrit.ma',
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      keepHeaderOnError: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
