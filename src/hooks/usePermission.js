// hooks/usePermission.js
import { useAuth } from '@/contexts/AuthContext';

export function usePermission() {
  const { user } = useAuth();
  
  if (!user) return { canManageUsers: false, canManageStats: false };
  
  return {
    canManageUsers: user.role === 'admin',
    canManageStats: user.role === 'admin'
  };
}