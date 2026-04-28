import { Button } from "@/components/ui/button";

export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12">

        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mentions légales</h1>
            <p className="text-gray-500 mt-1">LaundryMap — Applicables à compter du 1er janvier 2025</p>
            <p className="text-gray-400 text-sm mt-0.5">Plateforme web – Annuaire de laveries automatiques</p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.print()}
            className="px-4 print:hidden"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Imprimer / Télécharger en PDF
          </Button>
        </div>

        <hr className="border-gray-200 mb-10" />

        <div className="space-y-10 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Éditeur du site</h2>
            <p className="mb-3">Le site LaundryMap est édité par la société :</p>
            <div className="bg-gray-50 rounded-xl p-5 space-y-1.5 text-sm">
              <p><span className="font-semibold">Raison sociale :</span> EC2E (Electro Câblage Engineering et Équipement)</p>
              <p><span className="font-semibold">Forme juridique :</span> SAS (Société par Actions Simplifiée)</p>
              <p><span className="font-semibold">Capital social :</span> 1 600 000,00 €</p>
              <p><span className="font-semibold">SIRET :</span> 312 517 071 000 48</p>
              <p><span className="font-semibold">RCS :</span> 312 517 071 RCS Pontoise (immatriculation le 24/03/1998)</p>
              <p><span className="font-semibold">RNE :</span> Immatriculé le 24/03/1998</p>
              <p><span className="font-semibold">N° intracommunautaire TVA :</span> FR 53 312 517 071</p>
              <p><span className="font-semibold">Code APE :</span> 2790Z</p>
              <p><span className="font-semibold">Siège social :</span> 4 boulevard Napoléon 1er, ZAC du Pont des Rayons, 95290 L'Isle-Adam, France</p>
              <p><span className="font-semibold">Téléphone :</span> +33 (0)1 83 02 02 02</p>
              <p><span className="font-semibold">Fax :</span> +33 (0)1 34 08 18 18</p>
              <p><span className="font-semibold">Email :</span> contact@ec2e.com</p>
              <p><span className="font-semibold">Site institutionnel :</span> https://www.ec2e.com</p>
              <p><span className="font-semibold">Directeurs de la publication :</span> Marion LAMY, Florence MARTINEAU, Pierre FUSTIER</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Hébergement</h2>
            <p className="mb-3">Le site LaundryMap est hébergé par :</p>
            <div className="bg-gray-50 rounded-xl p-5 space-y-1.5 text-sm">
              <p><span className="font-semibold">Société :</span> OVHcloud</p>
              <p><span className="font-semibold">Adresse :</span> 2 rue Kellermann, 59100 Roubaix, France</p>
              <p><span className="font-semibold">Téléphone :</span> 1007</p>
              <p><span className="font-semibold">Site web :</span> https://www.ovhcloud.com</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Présentation du service</h2>
            <p className="mb-3">
              LaundryMap est une application web d'annuaire de laveries automatiques. Elle permet aux utilisateurs de localiser, consulter et évaluer des laveries automatiques en France métropolitaine et dans les DOM-TOM.
            </p>
            <p className="mb-3">Le service propose les fonctionnalités suivantes :</p>
            <ul className="list-disc list-inside space-y-1.5 text-sm pl-2">
              <li>Recherche de laveries par géolocalisation ou saisie manuelle</li>
              <li>Consultation des fiches laveries (informations, horaires, équipements, photos)</li>
              <li>Obtention d'itinéraires via des services tiers (Google Maps, Waze)</li>
              <li>Création de compte utilisateur et gestion d'un espace personnel</li>
              <li>Enregistrement de laveries en favoris et notifications de fermetures</li>
              <li>Dépôt de notes et de commentaires</li>
              <li>Espace professionnel permettant aux gérants de référencer leurs établissements</li>
              <li>Connexion en temps réel aux centrales de paiement WI-LINE d'EC2E via API</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Propriété intellectuelle</h2>
            <p className="mb-3">
              L'ensemble des éléments constituant le site LaundryMap (structure, design, textes, graphiques, logos, images, base de données) est la propriété exclusive de la société EC2E, sauf mention contraire explicite.
            </p>
            <p className="mb-3">
              Toute reproduction, distribution, modification, adaptation, retransmission ou publication de ces éléments, même partielle, est strictement interdite sans l'accord écrit d'EC2E, conformément aux dispositions du Code de la propriété intellectuelle français.
            </p>
            <p className="mb-3">
              Les marques, logos et signes distinctifs présents sur le site sont protégés. Leur reproduction ou utilisation sans autorisation préalable est interdite et constitue une contrefaçon.
            </p>
            <p>
              Les contenus générés par les utilisateurs (commentaires, notes, photos de laveries déposées par des professionnels) restent la propriété de leurs auteurs. En les publiant sur LaundryMap, ces derniers concèdent à EC2E une licence non exclusive, mondiale et gratuite d'utilisation, d'affichage et de reproduction dans le cadre du service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Protection des données personnelles (RGPD)</h2>
            <p className="mb-3">
              Conformément au Règlement Général sur la Protection des Données (RGPD – Règlement UE 2016/679) et à la loi Informatique et Libertés du 6 janvier 1978 modifiée, EC2E s'engage à assurer la protection, la confidentialité et la sécurité des données personnelles des utilisateurs de LaundryMap.
            </p>

            <h3 className="text-base font-semibold text-gray-800 mt-5 mb-2">5.1 Responsable du traitement</h3>
            <p className="text-sm">EC2E – 4 boulevard Napoléon 1er, ZAC du Pont des Rayons, 95290 L'Isle-Adam – contact@ec2e.com</p>

            <h3 className="text-base font-semibold text-gray-800 mt-5 mb-2">5.2 Données collectées</h3>
            <p className="mb-2 text-sm">Selon le profil de l'utilisateur, les données suivantes peuvent être collectées :</p>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-gray-800 mb-1">Utilisateurs non connectés :</p>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>Données de navigation (adresse IP, type de navigateur, pages consultées, durée de visite) via des cookies techniques</li>
                  <li>Position géographique approximative si l'utilisateur autorise la géolocalisation</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-gray-800 mb-1">Utilisateurs connectés (en plus des données ci-dessus) :</p>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>Adresse e-mail et mot de passe (hashé et salé, jamais stocké en clair)</li>
                  <li>Prénom / nom (optionnel)</li>
                  <li>Préférences de l'application (langue, thème clair/sombre, notifications)</li>
                  <li>Laveries enregistrées en favoris, notes et commentaires publiés, historique des signalements</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-gray-800 mb-1">Professionnels (gérants de laveries) :</p>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>Nom, prénom, adresse e-mail, mot de passe</li>
                  <li>Numéro SIREN / SIRET (vérifié auprès de la base publique SIRENE de l'INSEE)</li>
                  <li>Informations des établissements référencés (nom, adresse, horaires, photos, équipements, tarifs)</li>
                </ul>
              </div>
            </div>

            <h3 className="text-base font-semibold text-gray-800 mt-5 mb-2">5.3 Finalités du traitement</h3>
            <ul className="list-disc list-inside space-y-1 text-sm pl-2">
              <li>Fourniture et amélioration du service LaundryMap</li>
              <li>Gestion des comptes utilisateurs et de l'authentification (SSO Google inclus)</li>
              <li>Affichage personnalisé de la carte et des résultats de recherche</li>
              <li>Notification par e-mail (fermetures exceptionnelles, réponses aux avis)</li>
              <li>Modération des contenus générés par les utilisateurs</li>
              <li>Validation des comptes professionnels et des fiches laveries</li>
              <li>Respect des obligations légales et de sécurité</li>
            </ul>

            <h3 className="text-base font-semibold text-gray-800 mt-5 mb-2">5.4 Bases légales</h3>
            <ul className="list-disc list-inside space-y-1 text-sm pl-2">
              <li><span className="font-medium">Exécution d'un contrat :</span> fourniture du service, gestion du compte</li>
              <li><span className="font-medium">Intérêt légitime :</span> sécurité de la plateforme, lutte contre les abus, amélioration du service</li>
              <li><span className="font-medium">Consentement :</span> géolocalisation, cookies non essentiels, notifications optionnelles</li>
              <li><span className="font-medium">Obligation légale :</span> conservation des journaux d'accès, réponse aux injonctions judiciaires</li>
            </ul>

            <h3 className="text-base font-semibold text-gray-800 mt-5 mb-2">5.5 Durée de conservation</h3>
            <ul className="list-disc list-inside space-y-1 text-sm pl-2">
              <li>Données de compte actif : conservées pendant la durée d'activité du compte</li>
              <li>Après suppression du compte : suppression immédiate des données personnelles identifiantes. Les journaux techniques sont conservés 12 mois</li>
              <li>Données professionnelles : conservées pendant la durée d'activité, puis 3 ans à des fins de traçabilité</li>
            </ul>

            <h3 className="text-base font-semibold text-gray-800 mt-5 mb-2">5.6 Destinataires des données</h3>
            <p className="text-sm mb-2">
              Les données personnelles collectées sont destinées exclusivement à EC2E et ne sont pas vendues à des tiers. Elles peuvent être transmises à :
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm pl-2">
              <li>OVHcloud (hébergeur) – dans le cadre de l'hébergement sécurisé de l'application</li>
              <li>Google (SSO Google, Google Maps) – uniquement si l'utilisateur utilise ces services</li>
              <li>L'INSEE / base SIRENE – pour la vérification des numéros SIREN des professionnels</li>
            </ul>

            <h3 className="text-base font-semibold text-gray-800 mt-5 mb-2">5.7 Droits des utilisateurs</h3>
            <p className="text-sm mb-2">Conformément au RGPD, tout utilisateur dispose des droits suivants :</p>
            <ul className="list-disc list-inside space-y-1 text-sm pl-2">
              <li><span className="font-medium">Droit d'accès :</span> obtenir une copie des données vous concernant</li>
              <li><span className="font-medium">Droit de rectification :</span> corriger des données inexactes ou incomplètes</li>
              <li><span className="font-medium">Droit à l'effacement :</span> demander la suppression de votre compte et de vos données (accessible depuis « Mon Profil »)</li>
              <li><span className="font-medium">Droit à la portabilité :</span> recevoir vos données dans un format structuré et lisible</li>
              <li><span className="font-medium">Droit d'opposition :</span> vous opposer à certains traitements</li>
              <li><span className="font-medium">Droit à la limitation :</span> restreindre temporairement un traitement</li>
            </ul>
            <p className="text-sm mt-2">
              Pour exercer ces droits : <span className="font-medium">contact@ec2e.com</span>
            </p>
            <p className="text-sm mt-1">
              Vous disposez également du droit d'introduire une réclamation auprès de la <span className="font-medium">CNIL</span> : www.cnil.fr
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">6. Politique relative aux cookies</h2>
            <p className="mb-3">
              LaundryMap utilise des cookies et technologies similaires (localStorage) afin d'assurer le bon fonctionnement de l'application et d'améliorer l'expérience utilisateur.
            </p>

            <h3 className="text-base font-semibold text-gray-800 mt-4 mb-2">6.1 Cookies strictement nécessaires (pas de consentement requis)</h3>
            <ul className="list-disc list-inside space-y-1 text-sm pl-2">
              <li>Cookie de session / jeton d'authentification (JWT) : maintient la connexion de l'utilisateur</li>
              <li>Cookie de préférence de langue (i18n)</li>
              <li>Cookie de préférence de thème (clair / sombre)</li>
            </ul>

            <h3 className="text-base font-semibold text-gray-800 mt-4 mb-2">6.2 Cookies soumis à consentement</h3>
            <ul className="list-disc list-inside space-y-1 text-sm pl-2">
              <li>Cookies de géolocalisation : utilisés uniquement si l'utilisateur autorise explicitement la géolocalisation</li>
              <li>Cookies analytiques (si mis en place ultérieurement) : mesure d'audience anonymisée</li>
            </ul>
            <p className="text-sm mt-2">
              L'utilisateur peut à tout moment gérer ses préférences via les paramètres de son navigateur. Le refus des cookies non essentiels n'affecte pas l'accès aux fonctionnalités principales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">7. Sécurité des données</h2>
            <p className="mb-3">EC2E met en œuvre des mesures techniques et organisationnelles appropriées pour garantir la sécurité des données personnelles :</p>
            <ul className="list-disc list-inside space-y-1.5 text-sm pl-2">
              <li>Chiffrement des communications via le protocole HTTPS (SSL/TLS)</li>
              <li>Mots de passe stockés sous forme hachée et salée (jamais en clair)</li>
              <li>Protection contre les attaques XSS (Cross-Site Scripting) et CSRF (Cross-Site Request Forgery)</li>
              <li>Authentification sécurisée par jeton JWT</li>
              <li>Validation des numéros SIREN auprès de la base officielle INSEE</li>
              <li>Modération et système de signalement des contenus inappropriés</li>
              <li>Journalisation des accès et des actions d'administration</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">8. Liens hypertextes et services tiers</h2>
            <p className="mb-3">
              LaundryMap peut contenir des liens vers des sites tiers (Google Maps, Waze, etc.) et intègre des services externes. EC2E n'exerce aucun contrôle sur ces sites et ne peut être tenu responsable de leur contenu ni de leur politique de confidentialité.
            </p>
            <p className="mb-3">
              L'utilisation de Google Maps et de Waze pour l'obtention d'itinéraires est soumise aux conditions générales d'utilisation et à la politique de confidentialité de Google LLC et de Waze Mobile Ltd respectivement.
            </p>
            <p>
              L'utilisation de Google Sign-In (SSO) est soumise aux conditions d'utilisation de Google. L'utilisateur est invité à consulter la politique de confidentialité de Google avant d'utiliser cette méthode de connexion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">9. Limitation de responsabilité</h2>
            <p className="mb-3">EC2E s'efforce de maintenir LaundryMap accessible et à jour. Toutefois, la société ne saurait être tenue responsable :</p>
            <ul className="list-disc list-inside space-y-1.5 text-sm pl-2">
              <li>Des interruptions temporaires du service pour maintenance ou incident technique</li>
              <li>De l'exactitude des informations saisies par les gérants de laveries (malgré le processus de validation)</li>
              <li>Des dommages liés à l'utilisation de services tiers (navigation, itinéraires)</li>
              <li>Des contenus inappropriés publiés par des utilisateurs avant leur modération</li>
              <li>De l'indisponibilité temporaire de l'API WI-LINE affectant l'affichage de l'état des machines en temps réel</li>
            </ul>
            <p className="text-sm mt-3">
              Les informations présentes sur LaundryMap (horaires, tarifs, équipements) sont fournies à titre indicatif. EC2E recommande aux utilisateurs de vérifier directement auprès des établissements en cas de doute.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">10. Accessibilité numérique</h2>
            <p>
              EC2E s'engage à rendre LaundryMap accessible à toutes et à tous, y compris aux personnes en situation de handicap, conformément au Référentiel Général d'Amélioration de l'Accessibilité (RGAA) et aux normes WCAG 2.1. Pour signaler un problème d'accessibilité : <span className="font-medium">contact@ec2e.com</span>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">11. Droit applicable et juridiction compétente</h2>
            <p>
              Les présentes mentions légales sont régies par le droit français. En cas de litige relatif à l'utilisation de LaundryMap, et à défaut de résolution amiable, les tribunaux français compétents dans le ressort du siège social d'EC2E (Pontoise) seront seuls compétents.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">12. Contact</h2>
            <div className="bg-gray-50 rounded-xl p-5 text-sm space-y-1">
              <p className="font-semibold text-gray-800">EC2E</p>
              <p>4 boulevard Napoléon 1er, ZAC du Pont des Rayons</p>
              <p>95290 L'Isle-Adam, France</p>
              <p>Tél. : +33 (0)1 83 02 02 02</p>
              <p>Fax : +33 (0)1 34 08 18 18</p>
              <p>Email : contact@ec2e.com</p>
              <p>Site institutionnel : https://www.ec2e.com</p>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Document établi dans le cadre du projet scolaire LaundryMap – Bachelor Développeur Web – EC2E – 2025
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
