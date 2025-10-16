import AccessControl from '@/components/admin/AccessControl';
import SideNav from '@/components/admin/SideNav';
import NewsletterManager from '@/components/admin/NewsletterManager';

export default function NewsletterPage() {
  return (
    <AccessControl>
      <div className="flex min-h-screen bg-gray-100 dark:bg-secondary-700">
        <SideNav />
        <main className="flex-1">
          <NewsletterManager />
        </main>
      </div>
    </AccessControl>
  );
}