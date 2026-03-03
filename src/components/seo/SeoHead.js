// src/components/seo/SeoHead.js
// Composant SEO réutilisable — Open Graph + JSON-LD
import Head from 'next/head';

const SITE_NAME = 'MESRIT Niger';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://mesri.ne';
const DEFAULT_IMAGE = `${BASE_URL}/images/og-default.jpg`;
const TWITTER_HANDLE = '@mesrit_niger';

/**
 * @param {object} props
 * @param {string} props.title             — Titre de la page (sans le nom du site)
 * @param {string} [props.description]     — Description (160 chars max)
 * @param {string} [props.url]             — URL canonique de la page (chemin relatif ou absolu)
 * @param {string} [props.image]           — URL image OG (relative ou absolue)
 * @param {string} [props.ogImage]         — Alias de image (rétrocompatibilité)
 * @param {'website'|'article'} [props.type]    — Type OG (défaut: website)
 * @param {'website'|'article'} [props.ogType]  — Alias de type (rétrocompatibilité)
 * @param {object} [props.article]         — Métadonnées article { publishedTime, modifiedTime, author }
 * @param {string} [props.publishedTime]   — Alias raccourci pour article.publishedTime
 * @param {string} [props.modifiedTime]    — Alias raccourci pour article.modifiedTime
 * @param {object|object[]} [props.jsonLd] — JSON-LD custom (objet ou tableau d'objets)
 */
export default function SeoHead({
  title,
  description = "Site officiel du Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique du Niger.",
  url = '/',
  image,
  ogImage,
  type,
  ogType,
  article = null,
  publishedTime = null,
  modifiedTime = null,
  jsonLd = null,
}) {
  // Résoudre les aliases pour rétrocompatibilité
  const resolvedImage = image || ogImage || DEFAULT_IMAGE;
  const resolvedType = type || ogType || 'website';
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonicalUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  const absoluteImage = resolvedImage.startsWith('http') ? resolvedImage : `${BASE_URL}${resolvedImage}`;

  // Fusionner publishedTime/modifiedTime directs dans l'objet article
  const resolvedArticle = (publishedTime || modifiedTime)
    ? { publishedTime, modifiedTime, ...article }
    : article;

  // jsonLd accepte un objet ou un tableau
  const jsonLdSchemas = jsonLd
    ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd])
    : [];

  // JSON-LD Organisation (toujours présent)
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentOrganization',
    name: SITE_NAME,
    alternateName: 'MESRIT',
    url: BASE_URL,
    logo: `${BASE_URL}/images/logo.png`,
    sameAs: [],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'NE',
      addressLocality: 'Niamey',
    },
  };

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={resolvedType} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="fr_FR" />

      {/* Article */}
      {resolvedType === 'article' && resolvedArticle?.publishedTime && (
        <meta property="article:published_time" content={resolvedArticle.publishedTime} />
      )}
      {resolvedType === 'article' && resolvedArticle?.modifiedTime && (
        <meta property="article:modified_time" content={resolvedArticle.modifiedTime} />
      )}
      {resolvedType === 'article' && resolvedArticle?.author && (
        <meta property="article:author" content={resolvedArticle.author} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />

      {/* JSON-LD Organisation */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* JSON-LD custom (article, breadcrumb, event, etc.) — supporte tableau */}
      {jsonLdSchemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </Head>
  );
}
