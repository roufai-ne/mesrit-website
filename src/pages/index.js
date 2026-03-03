// pages/index.js
import dynamic from 'next/dynamic';
import MainLayout from '@/components/layout/MainLayout';
import SeoHead from '@/components/seo/SeoHead';
import HeroNewsCarousel from '@/components/home/HeroNewsCarousel';
import SectionContainer from '@/components/home/SectionContainer';
import SectionDivider from '@/components/home/SectionDivider';
import PageFooter from '@/components/home/PageFooter';
import StatsSection from '@/components/home/StatsSection';
import { fetchAPI, endpoints } from '@/lib/strapi';
import { mapStrapiList, mapArticleToNews } from '@/utils/strapiMapper';

// Lazy loading des composants pour améliorer les performances
// News section supprimée - intégrée dans HeroNewsCarousel

const Services = dynamic(() => import('@/components/home/Services'), {
  loading: () => (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl h-48"></div>
        ))}
      </div>
    </div>
  ),
  ssr: false
});

const ExternalServices = dynamic(() => import('@/components/home/ExternalServices'), {
  loading: () => (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-56 mx-auto"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl h-32"></div>
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
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-20"></div>
      ))}
    </div>
  ),
  ssr: false
});

// StatsSection importé directement ci-dessus pour débugger

export default function Home({ initialNews = [] }) {
  // Les alertes sont affichées dans le panneau latéral (MinisterialAgenda compact)
  // Les événements sont affichés dans la section dédiée (MinisterialAgenda normal)
  // Données chargées via ISR (revalidate 300s) puis mises à jour côté client

  return (
    <MainLayout>
      <SeoHead
        title="Accueil"
        description="Site officiel du Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique du Niger. Formations, services aux étudiants, actualités et documents officiels."
        url="/"
      />
      {/* Section Hero + Agenda - Layout en colonnes 80%/20% */}
      <section className="relative py-6 sm:py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
            {/* Hero News Carousel - 80% de largeur */}
            <div className="w-full lg:w-[80%]">
              <HeroNewsCarousel initialNews={initialNews} />
            </div>

            {/* Agenda Ministériel - 20% de largeur */}
            <div className="w-full lg:w-[20%]">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 h-full">
                <MinisterialAgenda compact={true} title="Annonces" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Statistiques */}
      <SectionContainer variant="light" showDivider={true}>
        <StatsSection />
      </SectionContainer>



      {/* Section Services */}
      <SectionContainer variant="transparent" showDivider={true}>
        <Services />
      </SectionContainer>

      {/* Section Services Externes */}
      <SectionContainer variant="accent" showDivider={false}>
        <ExternalServices />
      </SectionContainer>

      {/* Section Partenaires */}
      <SectionContainer variant="light" showDivider={true}>
        <Partners />
      </SectionContainer>

      {/* Pied de page avec séparateur élégant */}
      <PageFooter />

      {/* AuthDebug supprimé */}
    </MainLayout>
  );
}


export async function getStaticProps() {
  try {
    const response = await fetchAPI(endpoints.articles, {
      sort: ['publishedAt:desc'],
      pagination: { limit: 8 },
      populate: ['cover', 'videos'],
    });
    const initialNews = mapStrapiList(response, mapArticleToNews);
    return { props: { initialNews }, revalidate: 300 };
  } catch {
    return { props: { initialNews: [] }, revalidate: 60 };
  }
}
