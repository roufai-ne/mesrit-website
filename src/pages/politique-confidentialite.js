import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { Shield, Lock, Eye, Database, UserCheck, Calendar, AlertTriangle, ChevronRight } from 'lucide-react';
import SeoHead from '@/components/seo/SeoHead';

export default function PolitiqueConfidentialite() {
  return (
    <MainLayout>
      <SeoHead title="Politique de confidentialité" description="Politique de confidentialité et protection des données personnelles du site officiel du MESRIT Niger." url="/politique-confidentialite" />

      <div className="relative bg-gradient-to-br from-niger-orange via-niger-orange-dark to-niger-green text-white py-14 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="container mx-auto px-6 relative">
          <div className="flex items-center text-sm mb-3 opacity-80">
            <Link href="/" className="hover:opacity-100 transition-opacity">Accueil</Link>
            <ChevronRight className="w-4 h-4 mx-1.5" />
            <span className="font-medium">Politique de confidentialité</span>
          </div>
          <div className="flex items-center gap-4">
            <Shield className="w-10 h-10 flex-shrink-0" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Politique de confidentialité</h1>
              <p className="text-white/80 mt-1">Protection de vos données personnelles</p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12 bg-gray-50 dark:bg-secondary-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-secondary-800 rounded-2xl border border-gray-100 dark:border-secondary-700 overflow-hidden">
            <div className="px-8 py-6 space-y-8">

              <section>
                <div className="bg-niger-orange/10 dark:bg-niger-orange/20 border border-niger-orange/20 rounded-lg p-6">
                  <div className="flex items-start">
                    <AlertTriangle className="w-6 h-6 text-niger-orange mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h2 className="text-lg font-semibold text-niger-green dark:text-niger-green-light mb-2">Engagement de confidentialité</h2>
                      <p className="text-readable dark:text-foreground text-sm">Le Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique s'engage à protéger la confidentialité de vos données personnelles conformément à la législation en vigueur au Niger.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4 flex items-center">
                  <UserCheck className="w-5 h-5 mr-2 text-niger-orange" />
                  Responsable du traitement
                </h2>
                <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-6">
                  <p className="text-readable dark:text-foreground mb-4">Le responsable du traitement des données personnelles collectées sur ce site est :</p>
                  <div className="space-y-2">
                    <div><strong className="text-niger-green dark:text-niger-green-light">Organisme :</strong><span className="ml-2 text-readable dark:text-foreground">Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique</span></div>
                    <div><strong className="text-niger-green dark:text-niger-green-light">Adresse :</strong><span className="ml-2 text-readable dark:text-foreground">Niamey, République du Niger</span></div>
                    <div><strong className="text-niger-green dark:text-niger-green-light">Contact :</strong><span className="ml-2 text-readable dark:text-foreground">contact@mesrit.ne</span></div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4 flex items-center">
                  <Database className="w-5 h-5 mr-2 text-niger-orange" />
                  Données personnelles collectées
                </h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-niger-green dark:text-niger-green-light mb-3">Données collectées automatiquement</h3>
                    <ul className="list-disc list-inside space-y-2 text-readable dark:text-foreground">
                      <li>Adresse IP de votre ordinateur</li>
                      <li>Type et version de votre navigateur</li>
                      <li>Système d'exploitation utilisé</li>
                      <li>Pages visitées et durée de visite</li>
                      <li>Date et heure de connexion</li>
                      <li>Site web de provenance (référent)</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-niger-green dark:text-niger-green-light mb-3">Données collectées volontairement</h3>
                    <ul className="list-disc list-inside space-y-2 text-readable dark:text-foreground">
                      <li>Nom et prénom (formulaires de contact)</li>
                      <li>Adresse e-mail (newsletter, contact)</li>
                      <li>Numéro de téléphone (optionnel)</li>
                      <li>Message ou commentaire</li>
                      <li>Organisation ou établissement</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4 flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-niger-orange" />
                  Finalités du traitement
                </h2>
                <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-6">
                  <p className="text-readable dark:text-foreground mb-4">Vos données personnelles sont collectées et traitées pour les finalités suivantes :</p>
                  <ul className="list-disc list-inside space-y-2 text-readable dark:text-foreground">
                    <li>Répondre à vos demandes d'information et de contact</li>
                    <li>Vous envoyer notre newsletter (avec votre consentement)</li>
                    <li>Améliorer le fonctionnement et le contenu du site</li>
                    <li>Réaliser des statistiques de fréquentation anonymisées</li>
                    <li>Assurer la sécurité du site et prévenir les fraudes</li>
                    <li>Respecter nos obligations légales et réglementaires</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4 flex items-center">
                  <Lock className="w-5 h-5 mr-2 text-niger-orange" />
                  Base légale du traitement
                </h2>
                <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-6 space-y-4">
                  <div>
                    <h3 className="font-medium text-niger-green dark:text-niger-green-light mb-2">Mission d'intérêt public</h3>
                    <p className="text-readable dark:text-foreground text-sm">Le traitement des données de navigation et d'utilisation du site est fondé sur la mission d'intérêt public du Ministère.</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-niger-green dark:text-niger-green-light mb-2">Consentement</h3>
                    <p className="text-readable dark:text-foreground text-sm">L'inscription à la newsletter et l'utilisation de cookies non essentiels sont fondées sur votre consentement libre et éclairé.</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-niger-green dark:text-niger-green-light mb-2">Intérêt légitime</h3>
                    <p className="text-readable dark:text-foreground text-sm">L'amélioration du site et la réalisation de statistiques anonymisées sont fondées sur notre intérêt légitime.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4">Durée de conservation</h2>
                <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-6">
                  <div className="space-y-4 text-readable dark:text-foreground">
                    <div><strong className="text-niger-green dark:text-niger-green-light">Données de navigation :</strong><span className="ml-2">13 mois maximum</span></div>
                    <div><strong className="text-niger-green dark:text-niger-green-light">Formulaires de contact :</strong><span className="ml-2">3 ans après le dernier contact</span></div>
                    <div><strong className="text-niger-green dark:text-niger-green-light">Newsletter :</strong><span className="ml-2">Jusqu'à désabonnement ou 3 ans d'inactivité</span></div>
                    <div><strong className="text-niger-green dark:text-niger-green-light">Cookies :</strong><span className="ml-2">13 mois maximum</span></div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4">Vos droits</h2>
                <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-6">
                  <p className="text-readable dark:text-foreground mb-4">Conformément à la législation en vigueur, vous disposez des droits suivants :</p>
                  <ul className="list-disc list-inside space-y-2 text-readable dark:text-foreground">
                    <li><strong>Droit d'accès :</strong> Obtenir confirmation que des données vous concernant sont traitées</li>
                    <li><strong>Droit de rectification :</strong> Corriger des données inexactes ou incomplètes</li>
                    <li><strong>Droit d'effacement :</strong> Supprimer vos données dans certaines conditions</li>
                    <li><strong>Droit d'opposition :</strong> Vous opposer au traitement pour des raisons légitimes</li>
                    <li><strong>Droit à la portabilité :</strong> Récupérer vos données dans un format structuré</li>
                    <li><strong>Droit de limitation :</strong> Limiter le traitement dans certaines conditions</li>
                  </ul>
                  <div className="mt-4 p-4 bg-niger-orange/10 dark:bg-niger-orange/20 rounded-lg">
                    <p className="text-sm text-readable dark:text-foreground"><strong>Pour exercer vos droits :</strong> Contactez-nous à l'adresse contact@mesrit.ne en précisant votre demande et en joignant une copie d'une pièce d'identité.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4">Sécurité des données</h2>
                <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-6 space-y-4 text-readable dark:text-foreground">
                  <p>Nous mettons en œuvre les mesures techniques et organisationnelles appropriées pour assurer la sécurité de vos données personnelles :</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Chiffrement des données sensibles (HTTPS)</li>
                    <li>Accès restreint aux données par le personnel autorisé</li>
                    <li>Sauvegardes régulières et sécurisées</li>
                    <li>Mise à jour des systèmes de sécurité</li>
                    <li>Audits de sécurité réguliers</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4">Cookies</h2>
                <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-6 space-y-4 text-readable dark:text-foreground">
                  <p>Ce site utilise des cookies pour améliorer votre expérience de navigation :</p>
                  <div className="space-y-3">
                    <div><strong className="text-niger-green dark:text-niger-green-light">Cookies essentiels :</strong><span className="ml-2">Nécessaires au fonctionnement du site (session, sécurité)</span></div>
                    <div><strong className="text-niger-green dark:text-niger-green-light">Cookies analytiques :</strong><span className="ml-2">Statistiques de fréquentation anonymisées (avec consentement)</span></div>
                    <div><strong className="text-niger-green dark:text-niger-green-light">Cookies de préférences :</strong><span className="ml-2">Mémorisation de vos choix (langue, thème)</span></div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-4">Modifications de la politique</h2>
                <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-6 text-readable dark:text-foreground">
                  <p>Cette politique de confidentialité peut être mise à jour pour refléter les changements dans nos pratiques ou pour se conformer aux évolutions légales. Nous vous encourageons à consulter régulièrement cette page.</p>
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
