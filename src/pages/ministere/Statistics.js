// src/components/ministere/Statistics.js
import React from 'react';
import { Users, Building2, GraduationCap, BookOpen } from 'lucide-react';

export default function Statistics() {
  const stats = [
    {
      label: "Étudiants",
      value: "31,300",
      icon: <Users className="w-8 h-8" />,
      change: "+5%",
      color: "blue"
    },
    {
      label: "Enseignants",
      value: "2,500",
      icon: <GraduationCap className="w-8 h-8" />,
      change: "+3%",
      color: "green"
    },
    {
      label: "Établissements",
      value: "15",
      icon: <Building2 className="w-8 h-8" />,
      change: "+2",
      color: "purple"
    },
    {
      label: "Publications",
      value: "450",
      icon: <BookOpen className="w-8 h-8" />,
      change: "+12%",
      color: "orange"
    }
  ];

  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8">Chiffres clés</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className={`text-${stat.color}-600 mb-4`}>
                {stat.icon}
              </div>
              <div className="text-3xl font-bold mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
              <div className={`text-${stat.color}-600 text-sm mt-2`}>
                {stat.change} cette année
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}