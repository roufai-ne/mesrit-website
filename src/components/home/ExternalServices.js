// src/components/home/ExternalServices.js
import React from 'react';
import { ExternalLink, GraduationCap, Award, FileCheck, ArrowRight } from 'lucide-react';

export default function ExternalServices() {
 const services = [
   {
     title: "ANAB",
     description: "Agence Nationale des Allocations et Bourses",
     longDesc: "Gérez vos demandes de bourses et suivez leur état d'avancement",
     url: "https://anab.ne",
     icon: <Award className="w-8 h-8" />,
     color: "blue"
   },
   {
     title: "OBEECS",
     description: "Office du Baccalauréat et des Examens et Concours du Supérieur",
     longDesc: "Consultez les résultats et informations sur le baccalauréat et le BTS",
     url: "https://www.obeecsniger.com/",
     icon: <GraduationCap className="w-8 h-8" />,
     color: "green"
   },
   {
     title: "ANAQ-SUP",
     description: "Agence Nationale d'Assurance Qualité de l'Enseignement Supérieur",
     longDesc: "Evaluation et accréditation des établissements et des programmes de formation d'enseignement supérieur",
     url: "https://anaq-sup.ne",
     icon: <FileCheck className="w-8 h-8" />,
     color: "purple"
   }
 ];

 const getColorClasses = (color) => {
   const colors = {
     blue: "bg-blue-50 border-blue-200 hover:border-blue-300 text-blue-600",
     green: "bg-green-50 border-green-200 hover:border-green-300 text-green-600",
     purple: "bg-purple-50 border-purple-200 hover:border-purple-300 text-purple-600"
   };
   return colors[color];
 };

 return (
   <section className="py-16 bg-gray-50">
     <div className="container mx-auto">
       <h2 className="text-3xl font-bold text-center mb-4 text-gradient">Services rattachés</h2>
       <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
         Accédez directement aux services des institutions rattachées
       </p>

       <div className="grid md:grid-cols-3 gap-8">
         {services.map((service, index) => (
           
           <a
             key={index}
             href={service.url}
             target="_blank"
             rel="noopener noreferrer"
             className={`block relative rounded-2xl border-2 p-6 transition-all duration-300 
                        transform hover:-translate-y-1 hover:shadow-lg ${getColorClasses(service.color)}`}
           >
             <div className="flex flex-col h-full">
               <div className="bg-white p-3 rounded-xl shadow-sm w-fit mb-4">
                 {service.icon}
               </div>
               
               <h3 className="text-xl font-bold mb-2">{service.title}</h3>
               <p className="text-gray-600 text-sm mb-2">{service.description}</p>
               <p className="text-gray-700 mb-6 flex-grow">{service.longDesc}</p>
               
               <div className="flex items-center justify-between mt-auto">
                 <span className="text-sm font-medium">Accéder au service</span>
                 <div className="flex items-center space-x-2">
                   <ArrowRight className="w-4 h-4" />
                   <ExternalLink className="w-4 h-4" />
                 </div>
               </div>
             </div>
           </a>
         ))}
       </div>
     </div>
   </section>
 );
}