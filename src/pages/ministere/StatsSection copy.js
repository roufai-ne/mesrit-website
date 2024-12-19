import React, { useState, useEffect } from 'react';
import { Users, Building2, BookOpen, Award } from 'lucide-react';

function AnimatedCounter({ endValue, duration = 2000 }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime;
    let animationFrame;
    
    const startValue = 0;
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

export default function StatsSection() {
  const stats = [
    {
      label: "Étudiants",
      value: "100K+",
      icon: Users,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-500",
      borderColor: "border-blue-200"
    },
    {
      label: "Établissements",
      value: "200",
      icon: Building2,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-500",
      borderColor: "border-purple-200"
    },
    {
      label: "Programmes",
      value: "100+",
      icon: BookOpen,
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-500",
      borderColor: "border-emerald-200"
    },
    {
      label: "Publications",
      value: "500+",
      icon: Award,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-500",
      borderColor: "border-orange-200"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`${stat.bgColor} border-2 ${stat.borderColor} rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1`}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`rounded-full p-4 bg-white shadow-sm mb-4`}>
                <Icon className={`w-8 h-8 ${stat.iconColor}`} />
              </div>
              <div className={`text-3xl font-bold mb-2 ${stat.iconColor}`}>
                <AnimatedCounter endValue={stat.value} />
              </div>
              <div className="text-gray-700 font-medium">
                {stat.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}