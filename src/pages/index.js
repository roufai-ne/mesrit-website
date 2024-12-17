// pages/index.js
import MainLayout from '@/components/layout/MainLayout';
import Hero from '@/components/home/Hero';
import News from '@/components/home/News';
import ExternalServices from '@/components/home/ExternalServices';
import AlertBanner from '@/components/home/AlertBanner';
import MinisterialAgenda from '@/components/home/MinisterialAgenda';

export default function Home() {
 
  const alerts = [
 
  ];

  const agendaEvents = [
    
 
  ];

  return (
    <MainLayout>
      <AlertBanner alerts={alerts} />
      <Hero />
      <MinisterialAgenda events={agendaEvents} />
      <News />
      <ExternalServices />
    </MainLayout>
  );
}
