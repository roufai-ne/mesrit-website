// src/components/stats/AdvancedStats.js
import React from 'react';
import dynamic from 'next/dynamic';

// Lazy loading des composants Recharts pour améliorer les performances
const LineChart = dynamic(() => import('recharts').then(mod => ({ default: mod.LineChart })), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => ({ default: mod.Line })), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(mod => ({ default: mod.PieChart })), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => ({ default: mod.Pie })), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.XAxis })), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.YAxis })), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => ({ default: mod.CartesianGrid })), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => ({ default: mod.Tooltip })), { ssr: false });
const Legend = dynamic(() => import('recharts').then(mod => ({ default: mod.Legend })), { ssr: false });

export default function AdvancedStats() {
  const studentData = [
    { year: '2020', count: 45000 },
    { year: '2021', count: 48000 },
    { year: '2022', count: 52000 },
    { year: '2023', count: 55000 },
    { year: '2024', count: 58000 }
  ];

  const repartitionData = [
    { name: 'Sciences', value: 35 },
    { name: 'Lettres', value: 25 },
    { name: 'Technologie', value: 20 },
    { name: 'Autres', value: 20 }
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Statistiques détaillées</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Évolution des effectifs */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Évolution des effectifs</h3>
          <LineChart width={500} height={300} data={studentData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#1e40af" />
          </LineChart>
        </div>

        {/* Répartition par domaine */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Répartition par domaine</h3>
          <PieChart width={500} height={300}>
            <Pie
              data={repartitionData}
              cx={250}
              cy={150}
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            />
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </div>
    </div>
  );
}