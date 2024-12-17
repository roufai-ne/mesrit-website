// src/components/admin/AccessControl.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AccessControl({ children }) {
  const router = useRouter();

  useEffect(() => {
    // Vérification simple avec localStorage
    const isAuthenticated = localStorage.getItem('token');
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [router]);

  return children;
}