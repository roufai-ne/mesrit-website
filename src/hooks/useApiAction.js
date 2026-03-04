// src/hooks/useApiAction.js
// Séparé de secureApi.js pour satisfaire les règles de Fast Refresh
import { useState, useCallback } from 'react';

export function useApiAction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (action) => {
    try {
      setLoading(true);
      setError(null);
      const result = await action();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, loading, error };
}
