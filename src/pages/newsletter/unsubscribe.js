import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Unsubscribe() {
  const [message, setMessage] = useState('Chargement...');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { token } = router.query;

  useEffect(() => {
    if (!token) {
      setMessage('Token manquant. Veuillez vérifier le lien.');
      setLoading(false);
      return;
    }

    const unsubscribe = async () => {
      try {
        const response = await fetch('/api/newsletter/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        if (response.ok) {
          setMessage(data.message);
        } else {
          setMessage(data.error || 'Erreur lors de la désinscription');
        }
      } catch (error) {
        setMessage('Erreur serveur');
      } finally {
        setLoading(false);
      }
    };

    unsubscribe();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        {loading ? (
          <p>Chargement...</p>
        ) : (
          <p className={message.includes('Erreur') ? 'text-red-600' : 'text-green-600'}>
            {message}
          </p>
        )}
        <button
          onClick={() => router.push('/')}
          className="mt-4 px-4 py-2 bg-niger-orange text-white rounded-lg hover:bg-niger-orange-dark transition-colors"
        >
          Retour à l’accueil
        </button>
      </div>
    </div>
  );
}

// Forcer SSR pour éviter les erreurs durant le SSG
export async function getServerSideProps() {
  return {
    props: {}
  };
}
