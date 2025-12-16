// src/types/strapi.ts

export interface StrapiResponse<T> {
    data: StrapiData<T> | StrapiData<T>[];
    meta: StrapiMeta;
}

export interface StrapiData<T> {
    id: number;
    attributes: T;
}

export interface StrapiMeta {
    pagination?: {
        page: number;
        pageSize: number;
        pageCount: number;
        total: number;
    };
}

export interface StrapiImageFormat {
    name: string;
    hash: string;
    ext: string;
    mime: string;
    path: string | null;
    width: number;
    height: number;
    size: number;
    url: string;
}

export interface StrapiImage {
    name: string;
    alternativeText: string;
    caption: string;
    width: number;
    height: number;
    formats: {
        thumbnail: StrapiImageFormat;
        small?: StrapiImageFormat;
        medium?: StrapiImageFormat;
        large?: StrapiImageFormat;
    };
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl: string | null;
    provider: string;
    provider_metadata: any;
    createdAt: string;
    updatedAt: string;
}

// Content Types

export interface Article {
    title: string;
    slug: string;
    content: string; // Rich text or markdown
    summary: string;
    category: 'actualite' | 'evenement' | 'communique' | 'autre';
    status: 'draft' | 'published' | 'archived';
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
    cover?: {
        data: StrapiData<StrapiImage>;
    };
    // Relations
    tags?: {
        data: StrapiData<Tag>[];
    };
    author?: {
        data: StrapiData<Author>;
    };
}

export interface Tag {
    name: string;
    slug: string;
}

export interface Author {
    name: string;
    email: string;
    avatar?: {
        data: StrapiData<StrapiImage>;
    };
}

export interface Document {
    title: string;
    description: string;
    file: {
        data: StrapiData<StrapiImage>; // Strapi treats files as media too
    };
    category: 'loi' | 'decret' | 'arrete' | 'circulaire' | 'rapport' | 'guide';
    publicationDate: string;
}

export interface Event {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    cover?: {
        data: StrapiData<StrapiImage>;
    };
}
