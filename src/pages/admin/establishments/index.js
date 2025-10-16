// src/pages/admin/establishments/index.js
import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import EstablishmentManager from '@/components/admin/EstablishmentManager';
import { ReadOnlyGuard } from '@/components/admin/PermissionGuard';
import { usePermission } from '@/hooks/usePermission';

export default function AdminEstablishments() {
  const permissions = usePermission();
  
  return (
    <AdminLayout 
      title="Gestion des établissements" 
      subtitle="Réseau des établissements d'enseignement supérieur"
      requiredPermissions={['canManageEstablishments', 'canViewEstablishments']}
      requireAll={false}
    >
      {permissions.canManageEstablishments ? (
        <EstablishmentManager />
      ) : (
        <ReadOnlyGuard
          editPermission="canManageEstablishments"
          viewPermission="canViewEstablishments"
          readOnlyMessage="Consultation des établissements - Mode lecture seule"
        >
          <EstablishmentManager readOnly={true} />
        </ReadOnlyGuard>
      )}
    </AdminLayout>
  );
}