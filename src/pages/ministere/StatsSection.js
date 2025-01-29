import React, { useState, useEffect } from 'react';
import { Users, Building2, BookOpen, Loader2 } from 'lucide-react';

import { PieChart, Pie, Cell,  Tooltip,  ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function AnimatedCounter({ endValue, duration = 2000 }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime;
    let animationFrame;
    
    
    const endValueNum = parseInt(endValue.replace(/\D/g, ''));
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      
      if (progress < duration) {
        const currentCount = Math.round(
          (endValueNum * progress) / duration
        );
        setCount(currentCount);
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(endValueNum);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [endValue, duration]);
  
  return `${count}${endValue.includes('+') ? '+' : ''}`;
}
const Dhis2Button = () => (
  <a
    href="https://dsi-mesrit.org/"
    target="_blank"
    rel="noopener noreferrer"
    className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
  >
    <div className="relative w-8 h-8">
      <img
        src="/images/dhis2-logo.png" // Assurez-vous d'avoir ce logo dans votre dossier public
        alt="DHIS2"
        className="w-full h-full object-contain"
      />
    </div>
    <span className="font-medium">
      Accès à la plateforme des données
    </span>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 transform transition-transform group-hover:translate-x-1"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M14 5l7 7m0 0l-7 7m7-7H3"
      />
    </svg>
  </a>
);
function StatsModal({ isOpen, onClose, data, type }) {
  if (!data || !isOpen) return null;

  const renderStudentDistribution = () => {
    const genderData = [
      { name: 'Hommes', value: data.genderDistribution.male },
      { name: 'Femmes', value: data.genderDistribution.female }
    ];

    const sectorData = [
      { name: 'Public', value: data.sectorDistribution.public.total },
      { name: 'Privé', value: data.sectorDistribution.private.total }
    ];

    return (
      <div className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Distribution par Genre</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Distribution par Secteur</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                  >
                    {sectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-4">Secteur Public</h4>
            <div className="space-y-3">
              <div>
                <p className="text-3xl font-bold text-blue-700">{data.sectorDistribution.public.total.toLocaleString()}</p>
                <p className="text-sm text-blue-600">Étudiants total</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-xl font-semibold text-blue-700">{data.sectorDistribution.public.universities.toLocaleString()}</p>
                  <p className="text-sm text-blue-600">Universités</p>
                </div>
                <div>
                  <p className="text-xl font-semibold text-blue-700">{data.sectorDistribution.public.grandesEcoles.toLocaleString()}</p>
                  <p className="text-sm text-blue-600">Grandes Écoles</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-4">Secteur Privé</h4>
            <div className="space-y-3">
              <div>
                <p className="text-3xl font-bold text-purple-700">{data.sectorDistribution.private.total.toLocaleString()}</p>
                <p className="text-sm text-purple-600">Étudiants total</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-xl font-semibold text-purple-700">{data.sectorDistribution.private.universities.toLocaleString()}</p>
                  <p className="text-sm text-purple-600">Universités</p>
                </div>
                <div>
                  <p className="text-xl font-semibold text-purple-700">{data.sectorDistribution.private.grandesEcoles.toLocaleString()}</p>
                  <p className="text-sm text-purple-600">Grandes Écoles</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm border border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-2">Ratio d'Étudiants</h3>
          <p className="text-3xl font-bold text-green-700">{data.studentsPerCapita.toLocaleString()}</p>
          <p className="text-sm text-green-600">Étudiants pour 100 000 habitants</p>
        </div>
      </div>
    );
  };

  const renderTeacherDistribution = () => {
    const genderData = [
      { name: 'Hommes', value: data.privateInstitutions.genderDistribution.male + 
        data.publicUniversities.reduce((acc, curr) => acc + curr.genderDistribution.male, 0) },
      { name: 'Femmes', value: data.privateInstitutions.genderDistribution.female + 
        data.publicUniversities.reduce((acc, curr) => acc + curr.genderDistribution.female, 0) }
    ];

    return (
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Distribution Globale par Genre</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value.toLocaleString()} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Distribution par Grade (Universités Publiques)</h3>
          <div className="grid gap-4">
            {data.publicUniversities.map((grade, index) => (
              <div 
                key={index} 
                className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200"
              >
                <h4 className="font-semibold text-blue-900">{grade.grade}</h4>
                <p className="text-3xl font-bold text-blue-700 mt-2">{grade.total.toLocaleString()}</p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xl font-semibold text-blue-700">{grade.genderDistribution.male.toLocaleString()}</p>
                    <p className="text-sm text-blue-600">Hommes</p>
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-blue-700">{grade.genderDistribution.female.toLocaleString()}</p>
                    <p className="text-sm text-blue-600">Femmes</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderInstitutionDistribution = () => {
    // Regrouper les établissements par type
    const typeGroups = data.institutions.reduce((acc, inst) => {
      const existing = acc.find(g => g.type === inst.type);
      if (existing) {
        existing.public += inst.sector === 'public' ? inst.count : 0;
        existing.private += inst.sector === 'private' ? inst.count : 0;
      } else {
        acc.push({
          type: inst.type,
          public: inst.sector === 'public' ? inst.count : 0,
          private: inst.sector === 'private' ? inst.count : 0
        });
      }
      return acc;
    }, []);
  
    // Créer les données pour les graphiques
    const pieData = typeGroups.map(group => [
      { name: 'Public', value: group.public },
      { name: 'Privé', value: group.private }
    ]);
  
    return (
      <div className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          {typeGroups.map((group, index) => (
            <div key={group.type} className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">{group.type}</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData[index]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    >
                      <Cell fill="#0088FE" />
                      <Cell fill="#00C49F" />
                    </Pie>
                    <Tooltip formatter={(value) => value.toLocaleString()} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-lg font-semibold text-blue-600">
                    {group.public.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Public</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-emerald-600">
                    {group.private.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Privé</p>
                </div>
              </div>
            </div>
          ))}
        </div>
  
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200">
            <h4 className="font-semibold text-blue-900">Total Public</h4>
            <p className="text-3xl font-bold text-blue-700 mt-2">
              {data.totalPublic.toLocaleString()}
            </p>
            <p className="text-sm text-blue-600">Établissements</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl shadow-sm border border-emerald-200">
            <h4 className="font-semibold text-emerald-900">Total Privé</h4>
            <p className="text-3xl font-bold text-emerald-700 mt-2">
              {data.totalPrivate.toLocaleString()}
            </p>
            <p className="text-sm text-emerald-600">Établissements</p>
          </div>
        </div>
      </div>
    );
  };
  

  const renderContent = () => {
    switch (type) {
      case 'students':
        return renderStudentDistribution();
      case 'teachers':
        return renderTeacherDistribution();
      case 'institutions':
        return renderInstitutionDistribution();
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-gray-50 rounded-xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {type === 'students' && 'Statistiques des Étudiants'}
              {type === 'teachers' && 'Statistiques des Enseignants'}
              {type === 'institutions' && 'Statistiques des Établissements'}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-4">
            {renderContent()}
          </div>

          {/* Séparateur et section DHIS2 */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col items-center space-y-4">
              <p className="text-gray-600 text-center">
                Accédez à des données détaillées et à des analyses approfondies sur notre plateforme DHIS2
              </p>
              <Dhis2Button />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StatsSection() {
  const [stats, setStats] = useState(null);
  const [selectedStat, setSelectedStat] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [students, teachers, institutions] = await Promise.all([
          fetch('/api/stats/students').then(res => res.json()),
          fetch('/api/stats/teachers').then(res => res.json()),
          fetch('/api/stats/institutions').then(res => res.json())
        ]);

        setStats({
          students: students[0],
          teachers: teachers[0],
          institutions: institutions[0]
        });
      } catch (error) {
        console.error('Erreur lors du chargement des stats:', error);
        setError("Impossible de charger les statistiques");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleStatClick = (type) => {
    setSelectedStat({ type, data: stats[type] });
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        {error}
      </div>
    );
  }

  const statBoxes = [
    {
      label: "Étudiants",
      value: stats?.students?.totalStudents.toLocaleString(),
      icon: Users,
      type: "students",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-500",
      borderColor: "border-blue-200",
      hoverColor: "hover:border-blue-400"
    },
    {
      label: "Enseignants",
      value: (
        (stats?.teachers?.privateInstitutions?.total || 0) +
        stats?.teachers?.publicUniversities?.reduce((acc, curr) => acc + curr.total, 0)
      ).toLocaleString(),
      icon: BookOpen,
      type: "teachers",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-500",
      borderColor: "border-purple-200",
      hoverColor: "hover:border-purple-400"
    },
    {
      label: "Établissements",
      value: (stats?.institutions?.totalPublic + stats?.institutions?.totalPrivate).toLocaleString(),
      icon: Building2,
      type: "institutions",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-500",
      borderColor: "border-emerald-200",
      hoverColor: "hover:border-emerald-400"
    }
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {statBoxes.map((stat, index) => (
          <div
            key={index}
            className={`group relative ${stat.bgColor} border-2 ${stat.borderColor} ${stat.hoverColor} rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer`}
            onClick={() => handleStatClick(stat.type)}
          >
            {/* Badge "Cliquez pour plus de détails" */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-white border shadow-sm rounded-full text-xs font-medium text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Cliquez pour plus de détails
            </div>

            <div className="flex flex-col items-center text-center">
              <div className={`rounded-full p-4 bg-white shadow-sm mb-4 transition-transform duration-300 group-hover:scale-110`}>
                <stat.icon className={`w-8 h-8 ${stat.iconColor}`} />
              </div>
              <div className={`text-3xl font-bold mb-2 ${stat.iconColor}`}>
                <AnimatedCounter endValue={stat.value} />
              </div>
              <div className="text-gray-700 font-medium">
                {stat.label}
              </div>
              
              {/* Indicateur visuel "Plus d'infos" */}
              <div className={`mt-4 text-sm ${stat.iconColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2`}>
                <span>Plus d'informations</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>

            {/* Effet de surbrillance au hover */}
            <div className={`absolute inset-0 ${stat.iconColor} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-xl`}></div>
          </div>
        ))}
      </div>

      <StatsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        data={selectedStat?.data}
        type={selectedStat?.type}
      />
    </>
  );
}