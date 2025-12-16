import { getStrapiMedia } from '@/lib/strapi';

/**
 * Maps a Strapi Article to the legacy News format
 */
export const mapArticleToNews = (article) => {
    if (!article) return null;

    const attrs = article.attributes || article;
    const id = article.id || article._id;

    return {
        _id: id,
        title: attrs.title,
        slug: attrs.slug,
        content: attrs.content,
        summary: attrs.summary,
        category: attrs.category === 'evenement' ? 'Événements' :
            attrs.category === 'communique' ? 'Communiqués' :
                'Actualités',
        date: attrs.publishedAt || attrs.createdAt,
        publishedAt: attrs.publishedAt,
        createdAt: attrs.createdAt,
        updatedAt: attrs.updatedAt,
        image: getStrapiMedia(attrs.cover),
        status: attrs.publishedAt ? 'published' : 'draft',
        tags: attrs.tags?.data?.map(t => t.attributes.name) || [],
    };
};

/**
 * Maps a Strapi List response
 */
export const mapStrapiList = (response, mapper) => {
    if (!response?.data) return [];
    return response.data.map(mapper);
};

export const mapDocument = (doc) => {
    if (!doc) return null;
    const attrs = doc.attributes || doc;
    const id = doc.id || doc._id;

    const subTypeMap = {
        'loi': 'Loi',
        'decret': 'Décret',
        'arrete': 'Arrêté',
        'ordonnance': 'Ordonnance',
        'circulaire': 'Circulaire',
        'rapport': 'Rapport',
        'guide': 'Guide'
    };

    return {
        _id: id,
        title: attrs.title,
        description: attrs.description,
        category: attrs.category,
        subType: subTypeMap[attrs.category] || attrs.category,
        type: attrs.file?.data?.attributes?.ext?.replace('.', '').toUpperCase() || 'PDF',
        url: getStrapiMedia(attrs.file),
        size: (attrs.file?.data?.attributes?.size || 0) + ' KB',
        publicationDate: attrs.publicationDate || attrs.createdAt,
        createdAt: attrs.createdAt,
        status: 'published'
    };
};

export const mapFAQ = (faq) => {
    if (!faq) return null;
    const attrs = faq.attributes || faq;
    return {
        id: faq.id,
        _id: faq.id,
        question: attrs.question,
        answer: attrs.answer,
        category: attrs.category,
        order: attrs.order
    };
};

export const mapEstablishment = (est) => {
    if (!est) return null;
    const attrs = est.attributes || est;
    const id = est.id;

    return {
        _id: id,
        id: id,
        nom: attrs.name, // Frontend expects 'nom'
        name: attrs.name,
        type: attrs.type,
        statut: attrs.status, // Frontend expects 'statut'
        status: attrs.status,
        region: attrs.region,
        ville: attrs.city, // Frontend expects 'ville'
        city: attrs.city,
        dateOuverture: attrs.openingDate, // Frontend expects 'dateOuverture'
        website: attrs.website,
        description: attrs.description,
        contact: {
            email: attrs.contactEmail,
            phone: attrs.contactPhone,
            address: attrs.contactAddress
        },
        numberOfStudents: attrs.studentCount, // Frontend expects this for stats
        numberOfPrograms: attrs.programCount,
        logo: getStrapiMedia(attrs.logo)
    };
};

export const mapService = (service) => {
    if (!service) return null;
    const attrs = service.attributes || service;
    const id = service.id;
    return {
        id,
        title: attrs.title,
        description: attrs.description,
        longDescription: attrs.longDescription,
        icon: attrs.icon,
        category: attrs.category,
        url: attrs.url,
        isExternal: attrs.isExternal,
        priority: attrs.priority,
        isPopular: (attrs.priority || 0) > 5,
        image: getStrapiMedia(attrs.image),
    };
};

export const mapDirector = (director) => {
    if (!director) return null;
    const attrs = director.attributes || director;
    const id = director.id;

    // Logic to infer 'key' if missing, for frontend compatibility
    let key = null;
    const lowerTitre = (attrs.titre || '').toLowerCase();

    if (lowerTitre.includes('ministre')) key = 'Ministre'; // Not usually a key but special role
    else if (lowerTitre.includes('secrétaire général') && !lowerTitre.includes('adjoint')) key = 'SG';
    else if (lowerTitre.includes('secrétaire général adjoint')) key = 'SGA';
    else if (lowerTitre.includes('enseignement')) key = 'DGES';
    else if (lowerTitre.includes('recherche')) key = 'DGR';

    return {
        _id: id,
        id,
        nom: attrs.nom,
        titre: attrs.titre,
        direction: attrs.direction, // Might be "DGES" or parent direction
        mission: attrs.mission,
        email: attrs.email,
        telephone: attrs.telephone,
        photo: getStrapiMedia(attrs.photo),
        key: key,
        nomComplet: attrs.titre, // often used as label
        responsable: attrs.nom
    };
};

export const mapAlert = (alert) => {
    if (!alert) return null;
    const attrs = alert.attributes || alert;
    const id = alert.id;
    return {
        id,
        title: attrs.title,
        description: attrs.description,
        priority: attrs.priority,
        startDate: attrs.startDate,
        endDate: attrs.endDate,
        status: attrs.endDate > new Date().toISOString() ? 'active' : 'inactive' // Computed status
    };
};

export const mapEvent = (event) => {
    if (!event) return null;
    const attrs = event.attributes || event;
    const id = event.id;
    return {
        _id: id,
        title: attrs.title,
        description: attrs.description,
        date: attrs.startDate,
        startDate: attrs.startDate,
        endDate: attrs.endDate,
        location: attrs.location,
        participants: attrs.participants || null,
        category: attrs.category || 'Événement'
    };
};

export const mapStatistic = (stat) => {
    if (!stat) return null;

    // Defensive check for attributes
    let attrs = stat;
    if (stat.attributes) {
        attrs = stat.attributes;
    }

    if (!attrs) return null;

    return {
        key: attrs.statKey || attrs.key || `stat_${stat.id}`, // fallback
        value: attrs.value || 0,
        label: attrs.label || '',
        suffix: attrs.suffix || '',
        color: attrs.color || 'blue',
        order: attrs.order || 0
    };
};

export const mapPartner = (partner) => {
    if (!partner) return null;
    const attrs = partner.attributes || partner;
    const id = partner.id;
    return {
        id,
        name: attrs.name,
        type: attrs.type,
        description: attrs.description,
        website: attrs.website,
        logo: getStrapiMedia(attrs.logo),
        isFeatured: attrs.isFeatured
    };
};
