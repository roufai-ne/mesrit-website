// src/components/home/QuickLinks.js
import React from 'react';
import { GraduationCap, BookOpen, FileText, Flask, Users, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function QuickLinks() {
 const links = [
   {
     title: "Études & Formations",
     description: "Découvrez nos programmes académiques",
     icon: <GraduationCap className="w-8 h-8" />,
     href: "/formations",
     color: "blue"
   },
   {
     title: "Bourses",
     description: "Informations sur les bourses disponibles",
     icon: <BookOpen className="w-8 h-8" />,
     href: "/bourses",
     color: "green"
   },
   {
     title: "Documentation",
     description: "Ressources et formulaires",
     icon: <FileText className="w-8 h-8" />,
     href: "/documentation",
     color: "purple"
   },
   {
     title: "Recherche",
     description: "Nos activités de recherche",
     icon: <Flask className="w-8 h-8" />,
     href: "/recherche",
     color: "orange"
   },
   {
     title: "Établissements",
     description: "Universités et instituts",
     icon: <Building2 className="w-8 h-8" />,
     href: "/etablissements",
     color: "indigo"
   },
   {
     title: "Services aux étudiants",
     description: "Accompagnement et assistance",
     icon: <Users className="w-8 h-8" />,
     href: "/services",
     color: "red"
   }
 ];

 const getColorClasses = (color) => {
   const colorClasses = {
     blue: "bg-blue-50 text-blue-600 hover:bg-blue-100",
     green: "bg-green-50 text-green-600 hover:bg-green-100",
     purple: "bg-purple-50 text-purple-600 hover:bg-purple-100",
     orange: "bg-orange-50 text-orange-600 hover:bg-orange-100",
     indigo: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
     red: "bg-red-50 text-red-600 hover:bg-red-100"
   };
   return colorClasses[color];
 };

 return (
   <section className="py-16 bg-white">
     <div className="container mx-auto">
       <h2 className="text-3xl font-bold text-center mb-12 text-gradient">
         Accès rapide
       </h2>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {links.map((link, index) => (
           <Link 
             href={link.href} 
             key={index}
             className={`rounded-2xl p-6 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg ${getColorClasses(link.color)}`}
           >
             <div className="flex items-start space-x-4">
               <div className="bg-white p-3 rounded-xl shadow-sm">
                 {link.icon}
               </div>
               <div>
                 <h3 className="font-bold text-lg mb-1">{link.title}</h3>
                 <p className="text-gray-600">{link.description}</p>
               </div>
             </div>
           </Link>
         ))}
       </div>
     </div>
   </section>
 );
}