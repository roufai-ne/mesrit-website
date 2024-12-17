// src/components/admin/Dashboard.js
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Users, Building2, FileText } from 'lucide-react';

export default function Dashboard() {
  const statsData = [
    { name: 'UAM', etudiants: 23000 },
    { name: 'EMIG', etudiants: 4500 },
    { name: 'ENSP', etudiants: 3800 }
  ];

  const quickStats = [
    { icon: <Users />, label: 'Étudiants', value: '31,300' },
    { icon: <Building2 />, label: 'Établissements', value: '15' },
    { icon: <FileText />, label: 'Documents', value: '245' }
  ];

  return (
    <div className="p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center space-x-4">
              {stat.icon}
              <div>
                <p className="text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Graphique */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-bold mb-4">Effectifs par établissement</h2>
        <BarChart width={600} height={300} data={statsData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="etudiants" fill="#1e40af" />
        </BarChart>
      </div>
    </div>
  );
}

