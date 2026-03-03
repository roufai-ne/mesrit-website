import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { Scale, Building, Mail, Phone, MapPin, Calendar, ChevronRight } from 'lucide-react';
import SeoHead from '@/components/seo/SeoHead';

export default function MentionsLegales() {
  return (
    <MainLayout>
      <SeoHead title="Mentions légales" description="Mentions légales du site officiel du Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique du Niger." url="/mentions-legales" />

      <div className="relative bg-gradient-to-br from-niger-orange via-niger-orange-dark to-niger-green text-white py-14 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="container mx-auto px-6 relative">
          <div className="flex items-center text-sm mb-3 opacity-80">
            <Link href="/" className="hover:opacity-100 transition-opacity">Accueil</Link>
            <ChevronRight className="w-4 h-4 mx-1.5" />
            <span className="font-medium">Mentions légales</span>
          </div>
          <div className="flex items-center gap-4">
            <Scale className="w-10 h-10 flex-shrink-0" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Mentions légales</h1>
              <p className="text-white/80 mt-1">Informations légales du site officiel MESRIT</p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12 bg-gray-50 dark:bg-secondary-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-secondary-800 rounded-2xl border border-gray-100 dark:border-secondary-700 overflow-hidden">
            <div className="px-8 py-6 space-y-8">

              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4 flex items-center">
                  <Building className="w-5 h-5 mr-2 text-niger-orange" />
                  Éditeur du site
                </h2>
                <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-6 space-y-3">
                  <div>
                    <strong className="text-niger-green dark:text-niger-green-light">Raison sociale :</strong>
                    <span className="ml-2 text-readable dark:text-foreground">Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique</span>
                  </div>
                  <div>
                    <strong className="text-niger-green dark:text-niger-green-light">Statut juridique :</strong>
                    <span className="ml-2 text-readable dark:text-foreground">Administration publique de la République du Niger</span>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="w-4 h-4 mr-2 text-niger-orange mt-1" />
                    <div>
                      <strong className="text-niger-green dark:text-niger-green-light">Adresse :</strong>
                      <span className="ml-2 text-readable dark:text-foreground">Niamey, République du Niger</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-niger-orange" />
                    <strong className="text-niger-green dark:text-niger-green-light">Téléphone :</strong>
                    <span className="ml-2 text-readable dark:text-foreground">+227 XX XX XX XX</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-niger-orange" />
                    <strong className="text-niger-green dark:text-niger-green-light">Email :</strong>
                    <span className="ml-2 text-readable dark:text-foreground">contact@mesrit.ne</span>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4">Directeur de publication</h2>
                <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-6">
                  <p className="text-readable dark:text-foreground">Le directeur de publication est le Ministre de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4">Hébergement</h2>
                <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-6 space-y-3">
                  <div><strong className="text-niger-green dark:text-niger-green-light">Hébergeur :</strong><span className="ml-2 text-readable dark:text-foreground">[Nom de l'hébergeur]</span></div>
                  <div><strong className="text-niger-green dark:text-niger-green-light">Adresse :</strong><span className="ml-2 text-readable dark:text-foreground">[Adresse de l'hébergeur]</span></div>
                  <div><strong className="text-niger-green dark:text-niger-green-light">Téléphone :</strong><span className="ml-2 text-readable dark:text-foreground">[Téléphone de l'hébergeur]</span></div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4">Propriété intellectuelle</h2>
                <div className="space-y-4 text-readable dark:text-foreground">
                  <p>L'ensemble de ce site relève de la législation nigérienne et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.</p>
                  <p>La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse du directeur de publication.</p>
                  <p>La reproduction des textes de ce site sur un support papier est autorisée, notamment dans le cadre pédagogique, sous réserve du respect des trois conditions suivantes :</p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Gratuité de la diffusion</li>
                    <li>Respect de l'intégrité des documents reproduits : pas de modification ni d'altération d'aucune sorte</li>
                    <li>Citation claire et lisible de la source</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4">Limitation de responsabilité</h2>
                <div className="space-y-4 text-readable dark:text-foreground">
                  <p>Les informations contenues dans ce site sont aussi précises que possible et le site remis à jour à différentes périodes de l'année.</p>
                  <p>Cependant, des erreurs ou omissions peuvent survenir. L'internaute devra donc s'assurer de l'exactitude des informations auprès du Ministère et signaler toutes corrections jugées utiles.</p>
                  <p>Le Ministère ne pourra être tenu responsable des dommages directs et indirects causés au matériel de l'utilisateur, lors de l'accès au site.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4">Liens hypertextes</h2>
                <div className="space-y-4 text-readable dark:text-foreground">
                  <p>Des liens hypertextes peuvent renvoyer vers d'autres sites. Le Ministère n'a pas de contrôle sur ces sites et décline toute responsabilité quant à leur contenu.</p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Respecter la charte graphique du site</li>
                    <li>Faire mention de la source</li>
                    <li>Accepter que cette autorisation soit révoquée sur simple demande</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4">Collecte d'informations</h2>
                <div className="space-y-4 text-readable dark:text-foreground">
                  <p>Aucune information personnelle n'est collectée à votre insu. Aucune information personnelle n'est cédée à des tiers.</p>
                  <p>Les adresses électroniques figurant sur ce site ne sont utilisées que pour répondre aux messages que vous nous envoyez.</p>
                </div>
              </section>

              <section className="border-t border-gray-200 dark:border-secondary-600 pt-6">
                <div className="flex items-center text-sm text-readable-muted dark:text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export async function getStaticProps() {
  return { props: {}, revalidate: 86400 };
}
