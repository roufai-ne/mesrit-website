import Head from 'next/head';
import Link from 'next/link';
import { FileText, CheckCircle, XCircle, AlertTriangle, Users, Calendar, ExternalLink, ArrowLeft } from 'lucide-react';

export default function ConditionsUtilisation() {
  return (
    <>
      <Head>
        <title>Conditions d'utilisation - Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique</title>
        <meta name="description" content="Conditions d'utilisation du site officiel du Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique du Niger." />
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
                <FileText className="w-8 h-8 mr-3" />
                <h1 className="text-3xl font-bold">Conditions d'utilisation</h1>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-6 space-y-8">
              {/* Introduction */}
              <section>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                  <div className="flex items-start">
                    <AlertTriangle className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 mt-1" />
                    <div>
                      <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
                        Acceptation des conditions
                      </h2>
                      <p className="text-blue-700 dark:text-blue-300 text-sm">
                        L'utilisation de ce site web implique l'acceptation pleine et entière des conditions générales d'utilisation décrites ci-dessous.
                        Si vous n'acceptez pas ces conditions, nous vous demandons de ne pas utiliser ce site.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Objet du site */}
              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-niger-orange" />
                  Objet du site
                </h2>
                <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-6 space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    Le site web du Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique a pour objet de :
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Informer le public sur les missions, activités et actualités du Ministère</li>
                    <li>Fournir des informations sur l'enseignement supérieur au Niger</li>
                    <li>Présenter les établissements d'enseignement supérieur</li>
                    <li>Diffuser des documents officiels et des ressources pédagogiques</li>
                    <li>Faciliter les démarches administratives des étudiants et établissements</li>
                    <li>Promouvoir la recherche et l'innovation technologique</li>
                  </ul>
                </div>
              </section>

              {/* Utilisation autorisée */}
              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Utilisation autorisée
                </h2>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                  <p className="text-green-800 dark:text-green-300 mb-4">
                    Vous êtes autorisé à utiliser ce site pour :
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-green-700 dark:text-green-300 ml-4">
                    <li>Consulter et lire les informations mises à disposition</li>
                    <li>Télécharger et imprimer les documents pour un usage personnel ou pédagogique</li>
                    <li>Partager les liens vers les pages du site</li>
                    <li>Citer les contenus en respectant les règles de citation académique</li>
                    <li>Utiliser les formulaires de contact mis à disposition</li>
                    <li>S'abonner à la newsletter officielle</li>
                  </ul>
                </div>
              </section>

              {/* Utilisation interdite */}
              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4 flex items-center">
                  <XCircle className="w-5 h-5 mr-2 text-red-600" />
                  Utilisation interdite
                </h2>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                  <p className="text-red-800 dark:text-red-300 mb-4">
                    Il est strictement interdit d'utiliser ce site pour :
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-red-700 dark:text-red-300 ml-4">
                    <li>Reproduire, modifier ou distribuer le contenu à des fins commerciales</li>
                    <li>Créer des liens profonds sans autorisation</li>
                    <li>Extraire automatiquement des données (scraping, crawling non autorisé)</li>
                    <li>Tenter d'accéder à des zones restreintes ou d'altérer le système</li>
                    <li>Diffuser des contenus illégaux, diffamatoires ou contraires à l'ordre public</li>
                    <li>Usurper l'identité du Ministère ou de ses représentants</li>
                    <li>Perturber le fonctionnement normal du site</li>
                    <li>Utiliser le site pour des activités de phishing ou de spam</li>
                  </ul>
                </div>
              </section>

              {/* Responsabilités de l'utilisateur */}
              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4">
                  Responsabilités de l'utilisateur
                </h2>
                <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-6 space-y-4 text-gray-700 dark:text-gray-300">
                  <p>En utilisant ce site, vous vous engagez à :</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Respecter les lois et règlements en vigueur</li>
                    <li>Ne pas porter atteinte aux droits de propriété intellectuelle</li>
                    <li>Fournir des informations exactes dans les formulaires</li>
                    <li>Protéger vos identifiants de connexion (le cas échéant)</li>
                    <li>Signaler tout dysfonctionnement ou contenu inapproprié</li>
                    <li>Utiliser le site de manière responsable et éthique</li>
                  </ul>
                  <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      <strong>Important :</strong> Vous êtes responsable de l'utilisation que vous faites de ce site et des conséquences de cette utilisation.
                    </p>
                  </div>
                </div>
              </section>

              {/* Propriété intellectuelle */}
              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4">
                  Propriété intellectuelle
                </h2>
                <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-6 space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    Tous les éléments de ce site (textes, images, sons, vidéos, programmes, etc.) sont protégés par le droit d'auteur,
                    des marques déposées et/ou d'autres droits de propriété intellectuelle.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <strong className="text-niger-green dark:text-niger-green-light">Contenus officiels :</strong>
                      <span className="ml-2">
                        Les documents officiels, communiqués et informations institutionnelles sont propriété du Ministère.
                      </span>
                    </div>
                    <div>
                      <strong className="text-niger-green dark:text-niger-green-light">Marques et logos :</strong>
                      <span className="ml-2">
                        Les logos et marques du Ministère et de la République du Niger sont protégés.
                      </span>
                    </div>
                    <div>
                      <strong className="text-niger-green dark:text-niger-green-light">Contenus tiers :</strong>
                      <span className="ml-2">
                        Certains contenus peuvent être soumis aux droits de leurs auteurs respectifs.
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Limitation de responsabilité */}
              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4">
                  Limitation de responsabilité
                </h2>
                <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-6 space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    Le Ministère s'efforce de maintenir les informations de ce site à jour et exactes, cependant :
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Les informations sont fournies "en l'état" sans garantie d'exactitude</li>
                    <li>Le Ministère ne garantit pas la disponibilité continue du site</li>
                    <li>Des interruptions peuvent survenir pour maintenance ou mise à jour</li>
                    <li>Le Ministère n'est pas responsable des dommages directs ou indirects</li>
                    <li>La responsabilité est limitée aux obligations légales du service public</li>
                  </ul>
                  <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <p className="text-sm text-orange-800 dark:text-orange-300">
                      <strong>Conseil :</strong> Vérifiez toujours les informations importantes auprès des services officiels concernés.
                    </p>
                  </div>
                </div>
              </section>

              {/* Liens externes */}
              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4 flex items-center">
                  <ExternalLink className="w-5 h-5 mr-2 text-niger-orange" />
                  Liens externes
                </h2>
                <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-6 space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    Ce site peut contenir des liens vers des sites web externes. Le Ministère :
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>N'exerce aucun contrôle sur ces sites externes</li>
                    <li>N'est pas responsable de leur contenu ou de leurs pratiques</li>
                    <li>Ne garantit pas leur disponibilité ou leur exactitude</li>
                    <li>Vous encourage à lire leurs conditions d'utilisation</li>
                  </ul>
                  <p className="text-sm">
                    L'inclusion d'un lien n'implique pas l'approbation du site externe par le Ministère.
                  </p>
                </div>
              </section>

              {/* Données personnelles */}
              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4">
                  Protection des données personnelles
                </h2>
                <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-6 text-gray-700 dark:text-gray-300">
                  <p>
                    L'utilisation de ce site implique l'acceptation de notre politique de confidentialité concernant
                    la collecte et le traitement de vos données personnelles.
                  </p>
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <strong>Pour en savoir plus :</strong> Consultez notre
                      <span className="ml-1 underline">politique de confidentialité</span> pour connaître vos droits et nos pratiques.
                    </p>
                  </div>
                </div>
              </section>

              {/* Modification des conditions */}
              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4">
                  Modification des conditions
                </h2>
                <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-6 space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    Le Ministère se réserve le droit de modifier ces conditions d'utilisation à tout moment.
                    Les modifications entrent en vigueur dès leur publication sur le site.
                  </p>
                  <p>
                    Il est de votre responsabilité de consulter régulièrement ces conditions.
                    L'utilisation continue du site après modification vaut acceptation des nouvelles conditions.
                  </p>
                </div>
              </section>

              {/* Droit applicable */}
              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4">
                  Droit applicable et juridiction
                </h2>
                <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-6 space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    Ces conditions d'utilisation sont régies par le droit nigérien.
                    Tout litige relatif à l'utilisation de ce site sera soumis à la juridiction des tribunaux compétents du Niger.
                  </p>
                  <p>
                    En cas de conflit entre ces conditions et des dispositions légales impératives,
                    ces dernières prévaudront sans remettre en cause la validité des autres clauses.
                  </p>
                </div>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4">
                  Contact
                </h2>
                <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-6 text-gray-700 dark:text-gray-300">
                  <p className="mb-4">
                    Pour toute question concernant ces conditions d'utilisation, vous pouvez nous contacter :
                  </p>
                  <div className="space-y-2">
                    <div>
                      <strong className="text-niger-green dark:text-niger-green-light">Par email :</strong>
                      <span className="ml-2">contact@mesrit.ne</span>
                    </div>
                    <div>
                      <strong className="text-niger-green dark:text-niger-green-light">Par courrier :</strong>
                      <span className="ml-2">Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique, Niamey, Niger</span>
                    </div>
                  </div>
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