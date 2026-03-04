// pages/index.js
import dynamic from 'next/dynamic';
import MainLayout from '@/components/layout/MainLayout';
import SeoHead from '@/components/seo/SeoHead';
import HeroNewsCarousel from '@/components/home/HeroNewsCarousel';
import AlertBanner from '@/components/home/AlertBanner';
import MinisterSpotlight from '@/components/home/MinisterSpotlight';
import SectionContainer from '@/components/home/SectionContainer';
import PageFooter from '@/components/home/PageFooter';
import StatsSection from '@/components/home/StatsSection';
import { fetchAPI, endpoints } from '@/lib/strapi';
import { mapStrapiList, mapArticleToNews, mapDirector } from '@/utils/strapiMapper';

// Lazy loading des composants lourds
const Services = dynamic(() => import('@/components/home/Services'), {
  loading: () => (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl h-48" />
        ))}
      </div>
    </div>
  ),
  ssr: false
});

const ExternalServices = dynamic(() => import('@/components/home/ExternalServices'), {
  loading: () => (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-56 mx-auto" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl h-32" />
        ))}
      </div>
    </div>
  ),
  ssr: false
});

const Partners = dynamic(() => import('@/components/home/Partners'), { ssr: false });

const MinisterialAgenda = dynamic(() => import('@/components/home/MinisterialAgenda'), {
  loading: () => (
    <div className="animate-pulse space-y-4">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32" />
        ))}
      </div>
    </div>
  ),
  ssr: false
});

export default function Home({ initialNews = [], ministre = null }) {
  return (
    <MainLayout>
      <SeoHead
        title="Accueil"
        description="Site officiel du Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique du Niger. Formations, services aux étudiants, actualités et documents officiels."
        url="/"
      />

      {/* ①② AlertBanner + Hero News Carousel (full-width, plus de sidebar) */}
      <section className="relative py-6 sm:py-8 md:py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Bande d'annonce — se masque automatiquement si aucune alerte */}
          <div className="mb-4">
            <AlertBanner />
          </div>
          {/* Carousel pleine largeur */}
          <HeroNewsCarousel initialNews={initialNews} />
        </div>
      </section>

      {/* ③ Statistiques */}
      <SectionContainer variant="light" showDivider={true}>
        <StatsSection />
      </SectionContainer>

      {/* ④ Mot du Ministre — masqué si données indisponibles */}
      {ministre && (
        <section className="py-12 md:py-16 bg-gradient-to-b from-white via-niger-cream/20 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <MinisterSpotlight ministre={ministre} />
          </div>
        </section>
      )}

      {/* ⑤ Agenda & Événements (mode normal — grille full-width) */}
      <SectionContainer variant="transparent" showDivider={true}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <MinisterialAgenda compact={false} title="Agenda & Événements" />
        </div>
      </SectionContainer>

      {/* ⑥ Services */}
      <SectionContainer variant="transparent" showDivider={true}>
        <Services />
      </SectionContainer>

      {/* ⑦ Plateformes Externes */}
      <SectionContainer variant="accent" showDivider={false}>
        <ExternalServices />
      </SectionContainer>

      {/* ⑧ Partenaires */}
      <SectionContainer variant="light" showDivider={true}>
        <Partners />
      </SectionContainer>

      {/* ⑨ Séparateur décoratif de fin */}
      <PageFooter />
    </MainLayout>
  );
}

export async function getStaticProps() {
  try {
    const [newsResponse, directorsResponse] = await Promise.all([
      fetchAPI(endpoints.articles, {
        sort: ['publishedAt:desc'],
        pagination: { limit: 8 },
        populate: ['cover', 'videos'],
      }),
      fetchAPI(endpoints.directors, {
        populate: ['photo'],
        pagination: { limit: 20 },
      }),
    ]);

    const initialNews = mapStrapiList(newsResponse, mapArticleToNews);
    const directors = mapStrapiList(directorsResponse, mapDirector);
    const ministre = directors.find(d => d.key === 'Ministre') || null;

    return {
      props: { initialNews, ministre },
      revalidate: 300,
    };
  } catch {
    return {
      props: { initialNews: [], ministre: null },
      revalidate: 60,
    };
  }
}
