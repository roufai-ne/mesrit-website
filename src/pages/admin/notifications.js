import AccessControl from '@/components/admin/AccessControl';
import SideNav from '@/components/admin/SideNav';
import NotificationManager from '@/components/admin/NotificationManager';

export default function NotificationsPage() {
  return (
    <AccessControl>
      <div className="flex min-h-screen bg-gray-100">
        <SideNav />
        <main className="flex-1">
          <NotificationManager />
        </main>
      </div>
    </AccessControl>
  );
}