// src/components/admin/RoleManager.js
import React, { useState } from 'react';
import { Shield, CheckSquare, Square, Save } from 'lucide-react';

export default function RoleManager() {
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: 'admin',
      label: 'Administrateur',
      permissions: ['all']
    },
    {
      id: 2,
      name: 'editor',
      label: 'Éditeur',
      permissions: ['create_content', 'edit_content', 'upload_media']
    },
    {
      id: 3,
      name: 'contributor',
      label: 'Contributeur',
      permissions: ['create_content', 'upload_media']
    }
  ]);

  const allPermissions = [
    { id: 'create_content', label: 'Créer du contenu' },
    { id: 'edit_content', label: 'Modifier du contenu' },
    { id: 'delete_content', label: 'Supprimer du contenu' },
    { id: 'upload_media', label: 'Uploader des médias' },
    { id: 'manage_users', label: 'Gérer les utilisateurs' },
    { id: 'manage_settings', label: 'Gérer les paramètres' }
  ];

  const togglePermission = (roleId, permissionId) => {
    setRoles(prevRoles => {
      return prevRoles.map(role => {
        if (role.id === roleId) {
          const updatedPermissions = role.permissions.includes(permissionId)
            ? role.permissions.filter(p => p !== permissionId)
            : [...role.permissions, permissionId];
          return { ...role, permissions: updatedPermissions };
        }
        return role;
      });
    });
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <Shield className="w-6 h-6 mr-2" />
              Gestion des rôles
            </h2>
            <button className="btn btn-primary">
              <Save className="w-4 h-4 mr-2" />
              Enregistrer les modifications
            </button>
          </div>

          {/* Table des permissions */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-4 text-left">Rôle</th>
                  {allPermissions.map(permission => (
                    <th key={permission.id} className="p-4 text-left">
                      {permission.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roles.map(role => (
                  <tr key={role.id} className="border-t">
                    <td className="p-4 font-medium">{role.label}</td>
                    {allPermissions.map(permission => (
                      <td key={`${role.id}-${permission.id}`} className="p-4">
                        <button
                          onClick={() => togglePermission(role.id, permission.id)}
                          className="text-gray-500 hover:text-blue-600"
                        >
                          {role.permissions.includes(permission.id) || 
                           role.permissions.includes('all') ? (
                            <CheckSquare className="w-5 h-5" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}