import Head from 'next/head';
import Link from 'next/link';
import { Shield, Lock, Eye, Database, UserCheck, Calendar, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function PolitiqueConfidentialite() {
  return (
    <>
      <Head>
        <title>Politique de confidentialité - Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique</title>
        <meta name="description" content="Politique de confidentialité et protection des données personnelles du site officiel du Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique du Niger." />
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
                <Shield className="w-8 h-8 mr-3" />
                <h1 className="text-3xl font-bold">Politique de confidentialité</h1>
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
                        Engagement de confidentialité
                      </h2>
                      <p className="text-blue-700 dark:text-blue-300 text-sm">
                        Le Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique s'engage à protéger la confidentialité de vos données personnelles conformément à la législation en vigueur au Niger.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Responsable du traitement */}
              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4 flex items-center">
                  <UserCheck className="w-5 h-5 mr-2 text-niger-orange" />
                  Responsable du traitement
                </h2>
                <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Le responsable du traitement des données personnelles collectées sur ce site est :
                  </p>
                  <div className="space-y-2">
                    <div>
                      <strong className="text-niger-green dark:text-niger-green-light">Organisme :</strong>
                      <span className="ml-2 text-gray-700 dark:text-gray-300">
                        Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique
                      </span>
                    </div>
                    <div>
                      <strong className="text-niger-green dark:text-niger-green-light">Adresse :</strong>
                      <span className="ml-2 text-gray-700 dark:text-gray-300">Niamey, République du Niger</span>
                    </div>
                    <div>
                      <strong className="text-niger-green dark:text-niger-green-light">Contact :</strong>
                      <span className="ml-2 text-gray-700 dark:text-gray-300">contact@mesrit.ne</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Données collectées */}
              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4 flex items-center">
                  <Database className="w-5 h-5 mr-2 text-niger-orange" />
                  Données personnelles collectées
                </h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-niger-green dark:text-niger-green-light mb-3">
                      Données collectées automatiquement
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                      <li>Adresse IP de votre ordinateur</li>
                      <li>Type et version de votre navigateur</li>
                      <li>Système d'exploitation utilisé</li>
                      <li>Pages visitées et durée de visite</li>
                      <li>Date et heure de connexion</li>
                      <li>Site web de provenance (référent)</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-niger-green dark:text-niger-green-light mb-3">
                      Données collectées volontairement
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                      <li>Nom et prénom (formulaires de contact)</li>
                      <li>Adresse e-mail (newsletter, contact)</li>
                      <li>Numéro de téléphone (optionnel)</li>
                      <li>Message ou commentaire</li>
                      <li>Organisation ou établissement</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Finalités du traitement */}
              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4 flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-niger-orange" />
                  Finalités du traitement
                </h2>
                <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Vos données personnelles sont collectées et traitées pour les finalités suivantes :
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    <li>Répondre à vos demandes d'information et de contact</li>
                    <li>Vous envoyer notre newsletter (avec votre consentement)</li>
                    <li>Améliorer le fonctionnement et le contenu du site</li>
                    <li>Réaliser des statistiques de fréquentation anonymisées</li>
                    <li>Assurer la sécurité du site et prévenir les fraudes</li>
                    <li>Respecter nos obligations légales et réglementaires</li>
                  </ul>
                </div>
              </section>

              {/* Base légale */}
              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4 flex items-center">
                  <Lock className="w-5 h-5 mr-2 text-niger-orange" />
                  Base légale du traitement
                </h2>
                <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-6 space-y-4">
                  <div>
                    <h3 className="font-medium text-niger-green dark:text-niger-green-light mb-2">Mission d'intérêt public</h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      Le traitement des données de navigation et d'utilisation du site est fondé sur la mission d'intérêt public du Ministère.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-niger-green dark:text-niger-green-light mb-2">Consentement</h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      L'inscription à la newsletter et l'utilisation de cookies non essentiels sont fondées sur votre consentement libre et éclairé.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-niger-green dark:text-niger-green-light mb-2">Intérêt légitime</h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      L'amélioration du site et la réalisation de statistiques anonymisées sont fondées sur notre intérêt légitime.
                    </p>
                  </div>
                </div>
              </section>

              {/* Conservation des données */}
              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4">
                  Durée de conservation
                </h2>
                <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-6">
                  <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <div>
                      <strong className="text-niger-green dark:text-niger-green-light">Données de navigation :</strong>
                      <span className="ml-2">13 mois maximum</span>
                    </div>
                    <div>
                      <strong className="text-niger-green dark:text-niger-green-light">Formulaires de contact :</strong>
                      <span className="ml-2">3 ans après le dernier contact</span>
                    </div>
                    <div>
                      <strong className="text-niger-green dark:text-niger-green-light">Newsletter :</strong>
                      <span className="ml-2">Jusqu'à désabonnement ou 3 ans d'inactivité</span>
                    </div>
                    <div>
                      <strong className="text-niger-green dark:text-niger-green-light">Cookies :</strong>
                      <span className="ml-2">13 mois maximum</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Vos droits */}
              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4">
                  Vos droits
                </h2>
                <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Conformément à la législation en vigueur, vous disposez des droits suivants :
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    <li><strong>Droit d'accès :</strong> Obtenir confirmation que des données vous concernant sont traitées</li>
                    <li><strong>Droit de rectification :</strong> Corriger des données inexactes ou incomplètes</li>
                    <li><strong>Droit d'effacement :</strong> Supprimer vos données dans certaines conditions</li>
                    <li><strong>Droit d'opposition :</strong> Vous opposer au traitement pour des raisons légitimes</li>
                    <li><strong>Droit à la portabilité :</strong> Récupérer vos données dans un format structuré</li>
                    <li><strong>Droit de limitation :</strong> Limiter le traitement dans certaines conditions</li>
                  </ul>
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <strong>Pour exercer vos droits :</strong> Contactez-nous à l'adresse contact@mesrit.ne en précisant votre demande et en joignant une copie d'une pièce d'identité.
                    </p>
                  </div>
                </div>
              </section>

              {/* Sécurité */}
              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4">
                  Sécurité des données
                </h2>
                <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-6 space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    Nous mettons en œuvre les mesures techniques et organisationnelles appropriées pour assurer la sécurité de vos données personnelles :
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Chiffrement des données sensibles (HTTPS)</li>
                    <li>Accès restreint aux données par le personnel autorisé</li>
                    <li>Sauvegardes régulières et sécurisées</li>
                    <li>Mise à jour des systèmes de sécurité</li>
                    <li>Audits de sécurité réguliers</li>
                  </ul>
                </div>
              </section>

              {/* Cookies */}
              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4">
                  Cookies
                </h2>
                <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-6 space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    Ce site utilise des cookies pour améliorer votre expérience de navigation :
                  </p>
                  <div className="space-y-3">
                    <div>
                      <strong className="text-niger-green dark:text-niger-green-light">Cookies essentiels :</strong>
                      <span className="ml-2">Nécessaires au fonctionnement du site (session, sécurité)</span>
                    </div>
                    <div>
                      <strong className="text-niger-green dark:text-niger-green-light">Cookies analytiques :</strong>
                      <span className="ml-2">Statistiques de fréquentation anonymisées (avec consentement)</span>
                    </div>
                    <div>
                      <strong className="text-niger-green dark:text-niger-green-light">Cookies de préférences :</strong>
                      <span className="ml-2">Mémorisation de vos choix (langue, thème)</span>
                    </div>
                  </div>
                  <p className="text-sm">
                    Vous pouvez configurer votre navigateur pour accepter ou refuser les cookies. La désactivation des cookies peut affecter certaines fonctionnalités du site.
                  </p>
                </div>
              </section>

              {/* Modifications */}
              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4">
                  Modifications de la politique
                </h2>
                <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-6 text-gray-700 dark:text-gray-300">
                  <p>
                    Cette politique de confidentialité peut être mise à jour pour refléter les changements dans nos pratiques ou pour se conformer aux évolutions légales.
                    Nous vous encourageons à consulter régulièrement cette page. En cas de modification substantielle, nous vous en informerons par un avis sur le site.
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

// Forcer SSR pour éviter les erreurs durant le SSG
export async function getServerSideProps() {
  return {
    props: {}
  };
}
