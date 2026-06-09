import { useEffect } from 'react';
import Head from 'next/head';

export default function AdminCatchAll() {
  useEffect(() => {
    const strapiAdminUrl = process.env.NEXT_PUBLIC_STRAPI_ADMIN_URL || 'http://localhost:1337/admin';
    window.location.href = strapiAdminUrl;
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Head>
        <title>Redirection vers l&apos;Administration</title>
      </Head>
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-niger-orange mx-auto mb-4" />
        <h1 className="text-xl font-semibold mb-2">Redirection en cours…</h1>
        <p className="text-gray-600">Vous êtes redirigé vers le panneau d&apos;administration.</p>
      </div>
    </div>
  );
}
