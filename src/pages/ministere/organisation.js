import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { 
  Building2, 
  Users, 
  GraduationCap, 
  School, 
  FlaskConical, 
  LayoutGrid, 
  Network, 
  Download, 
  ChevronRight,
  Search,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Link from 'next/link';

const OrgSection = ({ title, icon: Icon, children, className = "", isExpandable = false }) => {
  const [isExpanded, setIsExpanded] = useState(!isExpandable);

  return (
    <div className={`bg-white dark:bg-secondary-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-niger-orange/10 ${className}`}>
      <div 
        className={`bg-gradient-to-r from-niger-orange/10 to-niger-green/10 dark:from-niger-orange/20 dark:to-niger-green/20 border-b border-niger-orange/20 px-6 py-4 flex items-center justify-between ${isExpandable ? 'cursor-pointer hover:from-niger-orange/20 hover:to-niger-green/20' : ''}`}
        onClick={isExpandable ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 bg-gradient-to-br from-niger-orange/20 to-niger-green/20 rounded-lg flex items-center justify-center">
              <Icon className="w-5 h-5 text-niger-orange" />
            </div>
          )}
          <h3 className="font-bold text-niger-green dark:text-niger-green-light text-lg">{title}</h3>
        </div>
        {isExpandable && (
          <div className="flex items-center gap-2 text-niger-orange">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        )}
      </div>
      {isExpanded && (
        <div className="p-6">
          {children}
        </div>
      )}
    </div>
  );
};

const DirectionList = ({ items, searchTerm = "" }) => {
  const filteredItems = items.filter(item => 
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ul className="space-y-3">
      {filteredItems.map((item, index) => (
        <li key={index} className="group flex items-start p-3 rounded-lg hover:bg-niger-cream/20 dark:hover:bg-secondary-700 transition-all duration-300">
          <div className="w-2 h-2 rounded-full bg-niger-orange mt-2 mr-3 group-hover:scale-125 transition-transform" />
          <span className="text-readable dark:text-foreground group-hover:text-niger-green dark:group-hover:text-niger-green-light transition-colors leading-relaxed">
            {item}
          </span>
        </li>
      ))}
      {filteredItems.length === 0 && searchTerm && (
        <li className="text-center py-4 text-readable-muted dark:text-muted-foreground">
          Aucun résultat pour "{searchTerm}"
        </li>
      )}
    </ul>
  );
};

export default function OrganisationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState(null);

  const handleExport = () => {
    // Export PDF sera implémenté avec react-pdf ou puppeteer
    alert('Export PDF en cours de développement');
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-niger-orange via-niger-orange-dark to-niger-green text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-niger-white/[0.05] bg-[size:20px_20px] opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="container mx-auto px-6 relative">
          <div className="flex items-center text-sm mb-4">
            <Link href="/" className="hover:text-niger-cream transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href="/ministere" className="hover:text-niger-cream transition-colors">
              Le Ministère
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-niger-cream font-medium">Organisation</span>
          </div>
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center mb-6">
                <Building2 className="w-12 h-12 mr-4 text-niger-cream" />
                <div>
                  <h1 className="text-5xl font-bold">Organisation</h1>
                  <p className="text-niger-cream/80 text-lg mt-2">Structure et Organigramme</p>
                </div>
              </div>
              <p className="text-xl text-niger-cream max-w-3xl leading-relaxed mb-6">
                Découvrez la structure organisationnelle complète du Ministère de l'Enseignement Supérieur, 
                de la Recherche et de l'Innovation Technologique avec ses différentes directions et services.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <button 
                onClick={handleExport}
                className="px-8 py-4 bg-niger-white/20 hover:bg-niger-white/30 backdrop-blur-sm rounded-xl transition-all duration-300 flex items-center gap-3 text-white font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Download className="w-6 h-6" />
                <span>Télécharger l'organigramme</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="bg-gradient-to-b from-niger-cream to-white dark:from-secondary-900 dark:to-secondary-800 shadow-2xl relative -mt-12 rounded-2xl mx-auto container px-6 transition-colors duration-300">
        <div className="p-8">
          {/* Barre de recherche */}
          <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg p-6 mb-8 border border-niger-orange/10">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-niger-orange" />
              <h3 className="text-lg font-semibold text-niger-green dark:text-niger-green-light">Rechercher dans l'organigramme</h3>
            </div>
            <div className="relative">
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher une direction, un service..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-niger-orange/20 focus:ring-2 focus:ring-niger-orange focus:border-niger-orange transition-all duration-300 bg-white dark:bg-secondary-700 text-readable dark:text-foreground"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-niger-orange w-5 h-5" />
            </div>
          </div>

          <div className="space-y-8">
            {/* Cabinet du Ministre */}
            <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg p-8 border border-niger-orange/10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-niger-orange/20 to-niger-green/20 rounded-2xl mb-6 border border-niger-orange/30">
                  <Users className="w-10 h-10 text-niger-orange" />
                </div>
                <h2 className="text-3xl font-bold text-niger-green dark:text-niger-green-light mb-2">
                  Cabinet du Ministre
                </h2>
                <p className="text-readable-muted dark:text-muted-foreground">
                  Ministre de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique (MES/R/IT)
                </p>
              </div>

              {/* Entités directement rattachées au Ministre */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {[
                  "Conseillers Techniques",
                  "Responsable de la communication", 
                  "Chef de Cabinet",
                  "Attaché de Protocole",
                  "Secrétaire Particulier",
                  "Inspection Générale des Services (IGS)"
                ].map((item, index) => (
                  <div key={index} className="bg-gradient-to-r from-niger-orange/10 to-niger-green/10 dark:from-niger-orange/20 dark:to-niger-green/20 rounded-xl p-4 text-center border border-niger-orange/20 hover:shadow-md transition-all duration-300 group">
                    <div className="w-8 h-8 bg-niger-orange/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Users className="w-4 h-4 text-niger-orange" />
                    </div>
                    <p className="text-sm font-medium text-readable dark:text-foreground">{item}</p>
                  </div>
                ))}
              </div>

              {/* Secrétariat Général */}
              <div className="space-y-8">
                <OrgSection 
                  title="Secrétariat Général (SG/SGA)" 
                  icon={Building2}
                  className="border-2 border-niger-orange/30"
                >
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-niger-green dark:text-niger-green-light mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-niger-orange" />
                        Services Directs
                      </h4>
                      <DirectionList 
                        searchTerm={searchTerm}
                        items={[
                          "Attachés académiques",
                          "Cellule Santé Universitaire et des Grandes Ecoles",
                          "Cellule Genre",
                          "Bureau d'Ordre",
                          "Secrétariat"
                        ]} 
                      />
                    </div>
                  </div>
                </OrgSection>

                {/* Structures sous le SG */}
                <div className="space-y-8">
                  {/* Directions Générales */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <OrgSection 
                      title="Direction Générale des Enseignements (DGE)"
                      icon={GraduationCap}
                      isExpandable={true}
                    >
                      <DirectionList 
                        searchTerm={searchTerm}
                        items={[
                          "Direction de l'Enseignement Supérieur Privé (DESPRI)",
                          "Direction de l'Enseignement Supérieur Public (DESP)",
                          "Direction des Sports et des Activités Culturelles Universitaires (DSAC/U/GE)",
                          "Direction de l'Enseignement Supérieur Arabe (DESA)",
                          "Direction de l'Orientation et du Suivi du Cursus des Etudiants (DOSCE)"
                        ]} 
                      />
                    </OrgSection>

                    <OrgSection 
                      title="Direction Générale de la Recherche et de l'Innovation Technologique (DGR/IT)"
                      icon={FlaskConical}
                      isExpandable={true}
                    >
                      <DirectionList 
                        searchTerm={searchTerm}
                        items={[
                          "Direction de la Recherche (DR)",
                          "Direction de l'Innovation Technologique (DIT)"
                        ]} 
                      />
                    </OrgSection>
                  </div>

                  {/* Directions Centrales */}
                  <OrgSection 
                    title="Directions Centrales" 
                    icon={LayoutGrid}
                    isExpandable={true}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <DirectionList 
                        searchTerm={searchTerm}
                        items={[
                          "Direction des Études et de la Programmation (DEP)",
                          "Direction des Ressources Humaines (DRH)",
                          "Direction des Ressources Financières et Matérielles (DRFM)",
                          "Direction des Marchés Publics et Delegation des Services (DMP/DSP)",
                          "Direction des Statistiques et de l'Informatique (DSI)"
                        ]} 
                      />
                      <DirectionList 
                        searchTerm={searchTerm}
                        items={[
                          "Direction de la Législation (DL)",
                          "Direction des Archives, de l'Information et Relations Publiques (DAIDR/P)",
                          "Direction des Infrastructures et Equipements Universitaires (DI/EU)"
                        ]} 
                      />
                    </div>
                  </OrgSection>

                  {/* Services et Organismes Rattachés */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <OrgSection 
                      title="Services Rattachés"
                      icon={Network}
                      isExpandable={true}
                    >
                      <DirectionList 
                        searchTerm={searchTerm}
                        items={[
                          "Agence Nigérienne des Allocations et des Bourses (ANAB)",
                          "Agence Nationale pour l'Assurance Qualité (ANAQ-Sup)",
                          "Centres Régionaux des Œuvres Universitaires (CROU)",
                          "Office du Baccalauréat (OBEECS)"
                        ]} 
                      />
                    </OrgSection>

                    <OrgSection 
                      title="Établissements Universitaires"
                      icon={School}
                      isExpandable={true}
                    >
                      <DirectionList 
                        searchTerm={searchTerm}
                        items={[
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
                        ]} 
                      />
                    </OrgSection>
                  </div>
                </div>
              </div>
            </div>

            {/* Liens vers autres pages */}
            <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg p-8 border border-niger-orange/10">
              <h2 className="text-2xl font-bold text-niger-green dark:text-niger-green-light mb-6 flex items-center gap-3">
                <Eye className="w-6 h-6 text-niger-orange" />
                En savoir plus
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                  href="/ministere/direction"
                  className="group flex items-center p-6 rounded-xl hover:bg-niger-orange/10 dark:hover:bg-niger-orange/20 transition-all duration-300 border border-niger-orange/20 hover:border-niger-orange/40"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-niger-orange/20 to-niger-green/20 rounded-xl flex items-center justify-center mr-4">
                    <Users className="w-6 h-6 text-niger-orange" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 group-hover:text-niger-orange transition-colors text-niger-green dark:text-niger-green-light">
                      Équipe Dirigeante
                    </h3>
                    <p className="text-readable-muted dark:text-muted-foreground text-sm">
                      Découvrez les profils des responsables
                    </p>
                  </div>
                </Link>

                <Link
                  href="/ministere/missions"
                  className="group flex items-center p-6 rounded-xl hover:bg-niger-green/10 dark:hover:bg-niger-green/20 transition-all duration-300 border border-niger-green/20 hover:border-niger-green/40"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-niger-green/20 to-niger-orange/20 rounded-xl flex items-center justify-center mr-4">
                    <GraduationCap className="w-6 h-6 text-niger-green" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 group-hover:text-niger-green transition-colors text-niger-green dark:text-niger-green-light">
                      Nos Missions
                    </h3>
                    <p className="text-readable-muted dark:text-muted-foreground text-sm">
                      Objectifs et vision stratégique
                    </p>
                  </div>
                </Link>

                <Link
                  href="/etablissements"
                  className="group flex items-center p-6 rounded-xl hover:bg-niger-orange/10 dark:hover:bg-niger-orange/20 transition-all duration-300 border border-niger-orange/20 hover:border-niger-orange/40"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-niger-orange/20 to-niger-green/20 rounded-xl flex items-center justify-center mr-4">
                    <School className="w-6 h-6 text-niger-orange" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 group-hover:text-niger-orange transition-colors text-niger-green dark:text-niger-green-light">
                      Établissements
                    </h3>
                    <p className="text-readable-muted dark:text-muted-foreground text-sm">
                      Réseau d'enseignement supérieur
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}