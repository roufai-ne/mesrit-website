import { getStrapiMedia } from '@/lib/strapi';

/**
 * Maps a Strapi Article to the legacy News format
 */
export const mapArticleToNews = (article) => {
    if (!article) return null;

    const attrs = article.attributes || article;
    const numericId = article.id || article._id;
    const routeId = attrs.slug || article.documentId || numericId;

    // Strapi 5 retourne les champs media comme tableaux
    const coverArray  = Array.isArray(attrs.cover)  ? attrs.cover  : (attrs.cover ? [attrs.cover] : []);
    const videosArray = Array.isArray(attrs.videos)  ? attrs.videos : (attrs.videos ? [attrs.videos] : []);

    // Images : toutes les covers mappées avec url accessible via proxy
    const images = coverArray
        .filter(m => m?.url)
        .map(m => ({
            url: m.url.startsWith('/uploads/') ? `/api${m.url}` : m.url,
            alt: m.alternativeText || attrs.title || '',
            description: m.caption || m.alternativeText || '',
            width: m.width,
            height: m.height,
        }));

    // Vidéos : tous les fichiers vidéo mappés
    const videos = videosArray
        .filter(m => m?.url)
        .map((m, i) => ({
            url: m.url.startsWith('/uploads/') ? `/api${m.url}` : m.url,
            thumbnail: m.previewUrl
                ? (m.previewUrl.startsWith('/uploads/') ? `/api${m.previewUrl}` : m.previewUrl)
                : (images[0]?.url || null),
            title: m.name || m.alternativeText || `Vidéo ${i + 1}`,
            isMain: i === 0,
            mime: m.mime,
        }));

    return {
        _id: routeId,
        documentId: article.documentId || null,
        strapiId: numericId,
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
        // Champ unique pour les composants qui n'utilisent qu'une image
        image: images[0]?.url || null,
        // Tous les médias
        images,
        videos,
        mainVideo: videos[0]?.url || null,
        status: attrs.publishedAt ? 'published' : 'draft',
        tags: (attrs.tags?.data ?? attrs.tags)?.map(t => t.name || t.attributes?.name).filter(Boolean) || [],
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

    // Strapi 5 : attrs.file est un tableau [{ ext, size, ... }], même si multiple:false
    const fileItem = Array.isArray(attrs.file) ? attrs.file[0]
                   : (attrs.file?.data?.attributes || attrs.file);

    const subTypeMap = {
        'loi': 'Loi',
        'decret': 'Décret',
        'arrete': 'Arrêté',
        'ordonnance': 'Ordonnance',
        'circulaire': 'Circulaire',
        'rapport': 'Rapport',
        'guide': 'Guide'
    };

    const sizeKB = fileItem?.size;
    const sizeStr = sizeKB
        ? (sizeKB >= 1024 ? `${(sizeKB / 1024).toFixed(1)} Mo` : `${Math.round(sizeKB)} Ko`)
        : null;

    return {
        _id: id,
        title: attrs.title || 'Document sans titre',
        description: attrs.description || '',
        category: attrs.category,
        subType: subTypeMap[attrs.category] || attrs.category,
        type: fileItem?.ext?.replace('.', '').toUpperCase() || null,
        url: getStrapiMedia(attrs.file),
        size: sizeStr,
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
        statut: attrs.status_ets, // Frontend expects 'statut'
        status: attrs.status_ets,
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
        contactName: attrs.contactName ?? null,
        contactPhone: attrs.contactPhone ?? null,
        contactEmail: attrs.contactEmail ?? null,
        details: attrs.details ?? null,
    };
};

export const mapDirector = (director) => {
    if (!director) return null;
    const attrs = director.attributes || director;
    const id = director.id;

    // Utiliser le champ 'key' du schéma Strapi en priorité, sinon inférer depuis le titre
    let key = attrs.key || null;
    if (!key) {
      const lowerTitre = (attrs.titre || '').toLowerCase();
      if (lowerTitre.includes('ministre')) key = 'Ministre';
      else if (lowerTitre.includes('secrétaire général') && !lowerTitre.includes('adjoint')) key = 'SG';
      else if (lowerTitre.includes('secrétaire général adjoint')) key = 'SGA';
      else if (lowerTitre.includes('enseignement')) key = 'DGES';
      else if (lowerTitre.includes('recherche')) key = 'DGR';
    }

    return {
        _id: id,
        id,
        nom: attrs.nom,
        titre: attrs.titre,
        direction: attrs.direction, // Might be "DGES" or parent direction
        mission: attrs.mission,
        message: attrs.message ?? null,
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
    // Strapi 5 n'a pas de champ status : une alerte publiée = active
    const status = attrs.status || (attrs.publishedAt ? 'active' : 'inactive');
    return {
        _id: id,
        id,
        title: attrs.title,
        description: attrs.description,
        priority: attrs.priority || 'medium',
        startDate: attrs.startDate,
        endDate: attrs.endDate,
        status,
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

/**
 * Maps a Strapi HistoryMilestone to the frontend format
 */
export const mapHistoryMilestone = (milestone) => {
    if (!milestone) return null;
    const attrs = milestone.attributes || milestone;
    return {
        id: milestone.id,
        year: attrs.year ? String(attrs.year) : null,
        title: attrs.title,
        content: attrs.content || attrs.description,
        icon: attrs.icon || 'Building',
        color: attrs.color || 'bg-blue-500',
        order: attrs.order || 0
    };
};

/**
 * Maps a Strapi OrganizationalUnit to the frontend format
 */
export const mapOrgUnit = (unit) => {
    if (!unit) return null;
    const attrs = unit.attributes || unit;
    return {
        id: unit.id,
        name: attrs.name,
        type: attrs.type || 'other',
        description: attrs.description,
        order: attrs.order || 0
    };
};

/**
 * Maps a Strapi ExternalService to the frontend format
 */
export const mapExternalService = (item) => {
    if (!item) return null;
    const attrs = item.attributes || item;
    return {
        id: item.id,
        title: attrs.title,
        description: attrs.description ?? null,
        longDesc: attrs.longDesc ?? null,
        url: attrs.url ?? null,
        icon: attrs.icon || 'ExternalLink',
        color: attrs.color || 'blue',
        order: attrs.order || 0,
    };
};
