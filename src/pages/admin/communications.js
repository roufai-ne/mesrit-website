import AccessControl from '@/components/admin/AccessControl';
import CommunicationsManager from '@/components/admin/CommunicationsManager';
import SideNav from '@/components/admin/SideNav';

export default function CommunicationsPage() {

  return (
    <AccessControl>
      <div className="flex min-h-screen bg-gray-100">
        <SideNav />
        <main className="flex-1">
        <CommunicationsManager />
        </main>
      </div>
    </AccessControl>
  );
}