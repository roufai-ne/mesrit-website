import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { 
 Building2, Users, GraduationCap, School, FlaskConical, 
 LayoutGrid, Network,  Download, ChevronRight} from 'lucide-react';
import Link from 'next/link';


const OrgSection = ({ title, icon: Icon, color = "blue", children, className = "" }) => (
 <div className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-soft overflow-hidden hover:shadow-xl transition-shadow ${className}`}>
   <div className={`bg-gradient-to-r from-${color}-50 to-white border-b px-4 py-3 flex items-center gap-2`}>
     {Icon && <Icon className={`w-4 h-4 text-${color}-600`} />}
     <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
   </div>
   <div className="p-4">
     {children}
   </div>
 </div>
);

const DirectionList = ({ items }) => (
 <ul className="space-y-1.5">
   {items.map((item, index) => (
     <li key={index} className="group flex items-start">
       <div className="w-1 h-1 rounded-full bg-blue-500 mt-2 mr-2 group-hover:scale-125 transition-transform" />
       <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{item}</span>
     </li>
   ))}
 </ul>
);

export default function OrganisationPage() {
 return (
   <MainLayout>
     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
     
       <div className="container mx-auto px-4 py-8">
       <div className="flex items-center text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-blue-600">Accueil</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href="/ministere" className="hover:text-blue-600">Le Ministère</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span>Organisation</span>
          </div>
         {/* En-tête */}
         <div className="flex justify-between items-center mb-8">
           <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600 animate-subtle-fade">
             Organigramme du Ministère de l'Enseignement Supérieur
           </h1>
           <button className="btn btn-primary bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center gap-2 animate-subtle-fade">
             <Download className="w-4 h-4" />
             Télécharger
           </button>
         </div>

         <div className="space-y-6">
           {/* Cabinet du Ministre */}
           <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-soft p-6">
             <div className="text-center mb-8">
               <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 rounded-xl mb-4">
                 <Users className="w-8 h-8 text-indigo-600" />
               </div>
               <h2 className="text-xl font-bold text-gray-900">
                 Ministre de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique (MES/R/IT)
               </h2>
             </div>

             {/* Entités directement rattachées au Ministre */}
             <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
               {[
                 "Conseillers Techniques",
                 "Responsable de la communication",
                 "Chef de Cabinet",
                 "Attaché de Protocole",
                 "Secrétaire Particulier",
                 "Inspection Générale des Services (IGS)"
               ].map((item, index) => (
                 <div key={index} className="bg-indigo-50/50 rounded-lg p-3 text-center">
                   <p className="text-sm text-gray-700">{item}</p>
                 </div>
               ))}
             </div>

             {/* Secrétariat Général */}
             <div className="space-y-6">
               <OrgSection 
                 title="Secrétariat Général (SG/SGA)" 
                 icon={Building2}
                 color="indigo"
                 className="border-2 border-indigo-100"
               >
                 <div className="grid grid-cols-3 gap-4">
                   <div>
                     <h4 className="text-sm font-medium text-gray-700 mb-2">Services Directs</h4>
                     <DirectionList items={[
                       "Attachés académiques",
                       "Cellule Santé Universitaire et des Grandes Ecoles",
                       "Celle genre",
                       "Bureau d'Ordre",
                       "Secrétariat"
                     ]} />
                   </div>
                 </div>
               </OrgSection>

               {/* Structures sous le SG */}
               <div className="grid grid-cols-3 gap-6">
                 {/* Directions Générales */}
                 <div className="col-span-3 grid grid-cols-2 gap-6">
                   <OrgSection 
                     title="Direction Générale des Enseignements (DGE)"
                     icon={GraduationCap}
                     color="blue"
                   >
                     <DirectionList items={[
                       "Direction de l'Enseignement Supérieur Privé (DESPRI)",
                       "Direction de l'Enseignement Supérieur Public (DESP)",
                       "Direction des Sports et des Activités Culturelles Universitaires (DSAC/U/GE)",
                       "Direction de l'Enseignement Supérieur Arabe (DESA)",
                       "Direction de l'Orientation et du Suivi du Cursus des Etudiants (DOSCE)"
                     ]} />
                   </OrgSection>

                   <OrgSection 
                     title="Direction Générale de la Recherche et de l'Innovation (DGR/I)"
                     icon={FlaskConical}
                     color="purple"
                   >
                     <DirectionList items={[
                       "Direction de la Recherche (DR)",
                       "Direction de l'Innovation Technologique (DIT)"
                     ]} />
                   </OrgSection>
                 </div>

                 {/* Directions Centrales */}
                 <div className="col-span-3">
                   <OrgSection 
                     title="Directions Centrales" 
                     icon={LayoutGrid}
                     color="cyan"
                   >
                     <div className="grid grid-cols-2 gap-4">
                       <DirectionList items={[
                         "Direction des Études et de la Programmation (DEP)",
                         "Direction des Ressources Humaines (DRH)",
                         "Direction des Ressources Financières et des Marchés Publics (DRF/M/MP/DSP)",
                         "Direction des Statistiques et de l'Informatique (DSI)"
                       ]} />
                       <DirectionList items={[
                         "Direction de la Législation (DL)",
                         "Direction des Archives et Relations Publiques (DAIDR/P)",
                         "Direction des Infrastructures et Equipements Universitaires (DI/EU)"
                       ]} />
                     </div>
                   </OrgSection>
                 </div>

                 {/* Services et Organismes Rattachés */}
                 <div className="col-span-3 grid grid-cols-2 gap-6">
                   <OrgSection 
                     title="Services Rattachés"
                     icon={Network}
                     color="emerald"
                   >
                     <DirectionList items={[
                       "Agence Nigérienne des Allocations et des Bourses (ANAB)",
                       "Agence Nationale pour l'Assurance Qualité (ANAQ-Sup)",
                       "Centres Régionaux des Œuvres Universitaires (CROU)",
                       "Office du Baccalauréat (OBEECS)"
                     ]} />
                   </OrgSection>

                   <OrgSection 
                     title="Établissements Universitaires"
                     icon={School}
                     color="amber"
                   >
                     <DirectionList items={[
                       "Université Abdou Moumouni de Niamey (UAM)",
                       "Université Dan Dicko Dan Koulodo de Maradi (UDDM)",
                       "Université Djibo Hamani de Tahoua (UDH)",
                       "Université André Salifou de Zinder (UAS)",
                       "Université Boubacar Bah de Tillabéry (UBBA)",
                       "Université de Dosso (UDO)",
                       "Université d'Agadez (UAZ)",
                       "Université de Diffa (UDA)",
                       "Université Islamique au Niger (UIN)",
                       "École des Mines de l'Industrie et de la Géologie (EMIG)"
                     ]} />
                   </OrgSection>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </div>
     </div>
   </MainLayout>
 );
}