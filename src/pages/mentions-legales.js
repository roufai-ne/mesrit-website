import Head from 'next/head';
import Link from 'next/link';
import { Scale, Building, Mail, Phone, MapPin, Calendar, ArrowLeft } from 'lucide-react';

export default function MentionsLegales() {
  return (
    <>
      <Head>
        <title>Mentions légales - Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique</title>
        <meta name="description" content="Mentions légales du site officiel du Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique du Niger." />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-secondary-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Bouton retour */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-white dark:bg-secondary-800 text-niger-green dark:text-niger-green-light border border-niger-orange/20 dark:border-secondary-600 rounded-lg hover:bg-niger-orange/10 dark:hover:bg-secondary-700 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Link>
          </div>
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-niger-green to-niger-orange px-8 py-6">
              <div className="flex items-center text-white">
                <Scale className="w-8 h-8 mr-3" />
                <h1 className="text-3xl font-bold">Mentions légales</h1>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-6 space-y-8">
              {/* Éditeur du site */}
              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4 flex items-center">
                  <Building className="w-5 h-5 mr-2 text-niger-orange" />
                  Éditeur du site
                </h2>
                <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-6 space-y-3">
                  <div>
                    <strong className="text-niger-green dark:text-niger-green-light">Raison sociale :</strong>
                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                      Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique
                    </span>
                  </div>
                  <div>
                    <strong className="text-niger-green dark:text-niger-green-light">Statut juridique :</strong>
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Administration publique de la République du Niger</span>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="w-4 h-4 mr-2 text-niger-orange mt-1" />
                    <div>
                      <strong className="text-niger-green dark:text-niger-green-light">Adresse :</strong>
                      <span className="ml-2 text-gray-700 dark:text-gray-300">Niamey, République du Niger</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-niger-orange" />
                    <strong className="text-niger-green dark:text-niger-green-light">Téléphone :</strong>
                    <span className="ml-2 text-gray-700 dark:text-gray-300">+227 XX XX XX XX</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-niger-orange" />
                    <strong className="text-niger-green dark:text-niger-green-light">Email :</strong>
                    <span className="ml-2 text-gray-700 dark:text-gray-300">contact@mesrit.ne</span>
                  </div>
                </div>
              </section>

              {/* Directeur de publication */}
              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4">
                  Directeur de publication
                </h2>
                <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-6">
                  <p className="text-gray-700 dark:text-gray-300">
                    Le directeur de publication est le Ministre de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique.
                  </p>
                </div>
              </section>

              {/* Hébergement */}
              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4">
                  Hébergement
                </h2>
                <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-6 space-y-3">
                  <div>
                    <strong className="text-niger-green dark:text-niger-green-light">Hébergeur :</strong>
                    <span className="ml-2 text-gray-700 dark:text-gray-300">[Nom de l'hébergeur]</span>
                  </div>
                  <div>
                    <strong className="text-niger-green dark:text-niger-green-light">Adresse :</strong>
                    <span className="ml-2 text-gray-700 dark:text-gray-300">[Adresse de l'hébergeur]</span>
                  </div>
                  <div>
                    <strong className="text-niger-green dark:text-niger-green-light">Téléphone :</strong>
                    <span className="ml-2 text-gray-700 dark:text-gray-300">[Téléphone de l'hébergeur]</span>
                  </div>
                </div>
              </section>

              {/* Propriété intellectuelle */}
              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4">
                  Propriété intellectuelle
                </h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    L'ensemble de ce site relève de la législation nigérienne et internationale sur le droit d'auteur et la propriété intellectuelle.
                    Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
                  </p>
                  <p>
                    La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse du directeur de publication.
                  </p>
                  <p>
                    La reproduction des textes de ce site sur un support papier est autorisée, notamment dans le cadre pédagogique, sous réserve du respect des trois conditions suivantes :
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Gratuité de la diffusion</li>
                    <li>Respect de l'intégrité des documents reproduits : pas de modification ni d'altération d'aucune sorte</li>
                    <li>Citation claire et lisible de la source sous la forme suivante : "Ce document provient du site internet du Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique. Les droits de reproduction sont réservés et strictement limités."</li>
                  </ul>
                </div>
              </section>

              {/* Limitation de responsabilité */}
              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4">
                  Limitation de responsabilité
                </h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    Les informations contenues dans ce site sont aussi précises que possible et le site remis à jour à différentes périodes de l'année.
                  </p>
                  <p>
                    Cependant, des erreurs ou omissions peuvent survenir. L'internaute devra donc s'assurer de l'exactitude des informations auprès du Ministère et signaler toutes corrections jugées utiles.
                  </p>
                  <p>
                    Le Ministère ne pourra être tenu responsable des dommages directs et indirects causés au matériel de l'utilisateur, lors de l'accès au site, et résultant soit de l'utilisation d'un matériel ne répondant pas aux spécifications indiquées, soit de l'apparition d'un bug ou d'une incompatibilité.
                  </p>
                </div>
              </section>

              {/* Liens hypertextes */}
              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4">
                  Liens hypertextes
                </h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    Des liens hypertextes peuvent renvoyer vers d'autres sites. Le Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique n'a pas de contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
                  </p>
                  <p>
                    L'autorisation de mise en place d'un lien est accordée pour tout site à vocation d'information du public, sous réserve de :
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Respecter la charte graphique du site (ne pas reproduire nos pages dans un cadre)</li>
                    <li>Faire mention de la source et permettre à l'utilisateur de savoir qu'il accède au site du Ministère</li>
                    <li>Accepter que cette autorisation soit révoquée sur simple demande</li>
                  </ul>
                </div>
              </section>

              {/* Collecte d'informations */}
              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4">
                  Collecte d'informations
                </h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    Aucune information personnelle n'est collectée à votre insu. Aucune information personnelle n'est cédée à des tiers.
                  </p>
                  <p>
                    Les adresses électroniques figurant sur ce site ne sont utilisées que pour répondre aux messages que vous nous envoyez. Elles ne sont jamais utilisées à d'autres fins et ne sont jamais cédées à des tiers.
                  </p>
                </div>
              </section>

              {/* Date de mise à jour */}
              <section className="border-t border-gray-200 dark:border-secondary-600 pt-6">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}