import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CGU_READ_KEY = "laundrymap_cgu_read";

export default function CGU() {
  const navigate = useNavigate();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [hasRead, setHasRead] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [refused, setRefused] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(CGU_READ_KEY) === "true") {
      setHasRead(true);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRead) {
          localStorage.setItem(CGU_READ_KEY, "true");
          setHasRead(true);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasRead]);

  return (
    <>
      {/* Barre de progression sticky */}
      <div className="sticky top-0 z-50 bg-white shadow-sm print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center gap-3">
          <span className="text-xs text-gray-500 whitespace-nowrap">Progression de lecture</span>
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-100"
              style={{
                width: `${scrollProgress}%`,
                background: "linear-gradient(90deg, #1ab3d8, #4ecfee)",
              }}
            />
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap">{Math.round(scrollProgress)}%</span>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12">

          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Conditions Générales d'Utilisation</h1>
              <p className="text-gray-500 mt-1">LaundryMap — Version du 1er janvier 2025</p>
              <p className="text-gray-400 text-sm mt-0.5">Éditeur : EC2E (Electro Câblage Engineering et Équipement)</p>
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
              <h2 className="text-xl font-bold text-gray-900 mb-3">Article 1 — Objet et champ d'application</h2>
              <p className="mb-3">
                Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») régissent l'accès et l'utilisation de la plateforme LaundryMap, éditée par EC2E (Electro Câblage Engineering et Équipement), SAS au capital de 1 600 000,00 €, immatriculée au RCS de Pontoise sous le numéro 312 517 071, dont le siège social est situé 4 boulevard Napoléon 1er, ZAC du Pont des Rayons, 95290 L'Isle-Adam, France.
              </p>
              <p>
                Toute utilisation de LaundryMap implique l'acceptation sans réserve des présentes CGU. Si vous n'acceptez pas ces conditions, vous devez cesser immédiatement toute utilisation du service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Article 2 — Accès au service</h2>
              <p className="mb-3">
                LaundryMap est accessible gratuitement à toute personne disposant d'un accès à Internet. Les fonctionnalités de base (recherche et consultation des fiches laveries) sont disponibles sans inscription préalable.
              </p>
              <p className="mb-3">
                Certaines fonctionnalités avancées (enregistrement de favoris, dépôt d'avis, espace professionnel) nécessitent la création d'un compte utilisateur ou professionnel.
              </p>
              <p>
                EC2E se réserve le droit de modifier, suspendre ou interrompre l'accès au service à tout moment, notamment pour des opérations de maintenance ou en cas d'incident technique, sans que cela n'ouvre droit à une indemnité pour l'utilisateur.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Article 3 — Création de compte</h2>

              <h3 className="text-base font-semibold text-gray-800 mt-4 mb-2">3.1 Compte utilisateur</h3>
              <p className="mb-2 text-sm">
                Toute personne physique majeure peut créer un compte utilisateur en fournissant les informations suivantes :
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm pl-2 mb-3">
                <li>Une adresse e-mail valide</li>
                <li>Un mot de passe sécurisé (minimum 8 caractères, incluant au moins une majuscule, une minuscule, un chiffre et un caractère spécial)</li>
                <li>Prénom et nom (optionnel)</li>
              </ul>
              <p className="text-sm mb-2">La connexion via Google Sign-In (SSO) est également disponible.</p>
              <p className="text-sm">
                L'utilisateur s'engage à maintenir la confidentialité de ses identifiants et à notifier EC2E de toute utilisation non autorisée de son compte à l'adresse : contact@ec2e.com.
              </p>

              <h3 className="text-base font-semibold text-gray-800 mt-5 mb-2">3.2 Compte professionnel</h3>
              <p className="mb-2 text-sm">
                Les gérants de laveries automatiques peuvent créer un compte professionnel en fournissant, en plus des informations personnelles mentionnées ci-dessus :
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm pl-2 mb-3">
                <li>Le numéro SIREN de leur entreprise (9 chiffres, vérifié auprès de la base SIRENE de l'INSEE)</li>
                <li>L'adresse complète de leur établissement</li>
              </ul>
              <p className="text-sm">
                Les comptes professionnels sont soumis à une validation par l'équipe EC2E avant activation. EC2E se réserve le droit de refuser ou de supprimer tout compte dont les informations s'avèrent inexactes ou frauduleuses.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Article 4 — Services proposés</h2>

              <h3 className="text-base font-semibold text-gray-800 mt-4 mb-2">4.1 Services aux utilisateurs</h3>
              <ul className="list-disc list-inside space-y-1 text-sm pl-2">
                <li>Recherche de laveries par géolocalisation ou saisie manuelle d'adresse</li>
                <li>Consultation des fiches laveries (horaires, équipements, photos, tarifs)</li>
                <li>Obtention d'itinéraires via Google Maps ou Waze</li>
                <li>Enregistrement de laveries en favoris</li>
                <li>Dépôt de notes et commentaires sur les laveries visitées</li>
                <li>Notifications de fermetures exceptionnelles</li>
              </ul>

              <h3 className="text-base font-semibold text-gray-800 mt-5 mb-2">4.2 Services aux professionnels</h3>
              <ul className="list-disc list-inside space-y-1 text-sm pl-2">
                <li>Référencement et gestion de leurs établissements sur la plateforme</li>
                <li>Mise à jour des informations (horaires, équipements, photos, tarifs)</li>
                <li>Consultation et réponse aux avis déposés sur leurs établissements</li>
                <li>Connexion aux centrales de paiement WI-LINE d'EC2E via API (état des machines en temps réel)</li>
                <li>Tableau de bord de gestion de l'espace professionnel</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Article 5 — Obligations des utilisateurs</h2>
              <p className="mb-3">En utilisant LaundryMap, tout utilisateur s'engage à :</p>
              <ul className="list-disc list-inside space-y-1.5 text-sm pl-2">
                <li>Fournir des informations exactes, complètes et à jour lors de la création de son compte</li>
                <li>Ne pas usurper l'identité d'une autre personne physique ou morale</li>
                <li>Ne pas publier de contenu illicite, diffamatoire, injurieux, raciste, pornographique ou contraire à l'ordre public et aux bonnes mœurs</li>
                <li>Ne pas tenter de contourner, neutraliser ou compromettre les systèmes de sécurité de la plateforme</li>
                <li>Ne pas utiliser LaundryMap à des fins commerciales non autorisées par EC2E</li>
                <li>Respecter les droits de propriété intellectuelle d'EC2E et des tiers</li>
                <li>Signaler tout contenu inapproprié ou toute anomalie via le système de modération mis à disposition</li>
                <li>Ne pas publier de faux avis ou de commentaires trompeurs sur les laveries</li>
              </ul>
              <p className="text-sm mt-3">
                EC2E se réserve le droit de modérer, modifier ou supprimer tout contenu ne respectant pas les présentes règles, et de suspendre ou fermer le compte de l'utilisateur concerné.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Article 6 — Obligations spécifiques aux professionnels</h2>
              <p className="mb-3">En plus des obligations listées à l'Article 5, les utilisateurs professionnels s'engagent à :</p>
              <ul className="list-disc list-inside space-y-1.5 text-sm pl-2">
                <li>Fournir un numéro SIREN valide correspondant à leur activité réelle et légalement enregistrée</li>
                <li>Publier uniquement des informations exactes et à jour sur leurs établissements</li>
                <li>Ne pas créer de fiches laveries frauduleuses, fictives ou relatives à des établissements dont ils ne sont pas responsables</li>
                <li>Mettre à jour les informations de leurs établissements en cas de modification (horaires de fermeture, travaux, changement de tarifs, nouveaux équipements)</li>
                <li>Ne pas publier de photos ne correspondant pas à leurs établissements ou portant atteinte aux droits de tiers</li>
                <li>Ne pas utiliser l'espace professionnel à des fins publicitaires abusives ou trompeuses</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Article 7 — Propriété intellectuelle</h2>
              <p className="mb-3">
                L'ensemble des éléments constituant LaundryMap (structure, design, textes, graphiques, logos, images, base de données, code source) est la propriété exclusive d'EC2E, sauf mention contraire explicite. Toute reproduction, distribution, modification, adaptation ou publication, même partielle, est strictement interdite sans accord écrit préalable d'EC2E, conformément aux dispositions du Code de la propriété intellectuelle français.
              </p>
              <p>
                Les contenus générés par les utilisateurs (commentaires, notes, photos déposées par les professionnels) restent la propriété de leurs auteurs. En les publiant sur LaundryMap, ces derniers concèdent à EC2E une licence non exclusive, mondiale et gratuite d'utilisation, d'affichage et de reproduction dans le cadre du service, pour la durée de protection des droits d'auteur.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Article 8 — Protection des données personnelles</h2>
              <p className="mb-3">
                EC2E traite les données personnelles des utilisateurs de LaundryMap conformément au Règlement Général sur la Protection des Données (RGPD – Règlement UE 2016/679) et à la loi Informatique et Libertés du 6 janvier 1978 modifiée.
              </p>
              <p className="mb-3">
                Les informations détaillées relatives à la collecte, au traitement, à la conservation et aux droits des utilisateurs concernant leurs données personnelles sont disponibles dans les <a href="/mentions-legales" className="text-blue-600 underline hover:text-blue-800">Mentions Légales</a> de la plateforme (sections 5 et 6).
              </p>
              <p className="text-sm">
                Pour exercer vos droits (accès, rectification, effacement, portabilité, opposition, limitation) ou pour toute question relative à la protection de vos données, contactez le responsable du traitement : <span className="font-medium">contact@ec2e.com</span>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Article 9 — Responsabilité</h2>
              <p className="mb-3">
                EC2E s'efforce de maintenir LaundryMap disponible et à jour. Toutefois, EC2E ne peut être tenu responsable :
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-sm pl-2 mb-3">
                <li>Des interruptions temporaires du service pour maintenance, mise à jour ou incident technique imprévu</li>
                <li>De l'exactitude ou de l'exhaustivité des informations saisies par les gérants de laveries (malgré le processus de validation mis en place)</li>
                <li>Des dommages directs ou indirects résultant de l'utilisation de services tiers (Google Maps, Waze, WI-LINE)</li>
                <li>Des contenus inappropriés publiés par des utilisateurs avant leur détection et modération</li>
                <li>De l'indisponibilité temporaire de l'API WI-LINE affectant l'affichage de l'état des machines en temps réel</li>
                <li>Des pertes de données ou dommages consécutifs à une utilisation non conforme du service</li>
              </ul>
              <p className="text-sm">
                Les informations présentes sur LaundryMap (horaires, tarifs, équipements, disponibilité) sont fournies à titre indicatif. EC2E recommande aux utilisateurs de vérifier directement auprès des établissements avant tout déplacement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Article 10 — Modification des CGU</h2>
              <p className="mb-3">
                EC2E se réserve le droit de modifier les présentes CGU à tout moment, afin notamment de les adapter aux évolutions légales, réglementaires ou techniques, ou aux évolutions du service.
              </p>
              <p className="mb-3">
                Les utilisateurs disposant d'un compte seront informés de toute modification substantielle par e-mail ou par notification sur la plateforme, avec un préavis raisonnable.
              </p>
              <p>
                La poursuite de l'utilisation du service après la date d'entrée en vigueur des nouvelles CGU vaut acceptation de celles-ci. Si l'utilisateur refuse les nouvelles CGU, il doit cesser d'utiliser le service et peut demander la suppression de son compte.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Article 11 — Résiliation et suppression de compte</h2>

              <h3 className="text-base font-semibold text-gray-800 mt-4 mb-2">11.1 À l'initiative de l'utilisateur</h3>
              <p className="text-sm mb-3">
                Tout utilisateur peut supprimer son compte à tout moment depuis la page « Mon Profil ». Cette action entraîne la suppression immédiate des données personnelles identifiantes, conformément à la politique de conservation décrite dans les Mentions Légales.
              </p>

              <h3 className="text-base font-semibold text-gray-800 mt-4 mb-2">11.2 À l'initiative d'EC2E</h3>
              <p className="text-sm">
                EC2E se réserve le droit de suspendre ou résilier, sans préavis ni indemnité, tout compte en cas de :
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm pl-2 mt-2">
                <li>Non-respect des présentes CGU</li>
                <li>Fourniture d'informations fausses ou frauduleuses lors de l'inscription</li>
                <li>Comportement abusif, harcelant ou préjudiciable envers d'autres utilisateurs ou EC2E</li>
                <li>Tentative de compromission de la sécurité ou de l'intégrité de la plateforme</li>
                <li>Décision judiciaire ou obligation légale</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Article 12 — Droit applicable et juridiction compétente</h2>
              <p className="mb-3">
                Les présentes CGU sont régies par le droit français, à l'exclusion de toute autre législation.
              </p>
              <p className="mb-3">
                En cas de litige relatif à l'interprétation, à l'exécution ou à la résiliation des présentes CGU, les parties s'engagent à rechercher une solution amiable dans un délai de 30 jours à compter de la notification du litige.
              </p>
              <p>
                À défaut de résolution amiable, le litige sera soumis à la compétence exclusive des tribunaux français compétents dans le ressort du siège social d'EC2E (Pontoise).
              </p>
            </section>

            <hr className="border-gray-200" />

            <div className="bg-gray-50 rounded-xl p-5 text-sm text-gray-600">
              <p className="font-medium text-gray-800 mb-1">Contact EC2E</p>
              <p>4 boulevard Napoléon 1er, ZAC du Pont des Rayons, 95290 L'Isle-Adam, France</p>
              <p>Tél. : +33 (0)1 83 02 02 02 — Email : contact@ec2e.com</p>
              <p className="text-xs text-gray-400 mt-2">Document établi dans le cadre du projet scolaire LaundryMap – Bachelor Développeur Web – EC2E – 2025</p>
            </div>

          </div>

          {/* Sentinel pour détecter la fin de lecture */}
          <div ref={sentinelRef} className="h-1 mt-8" aria-hidden="true" />

          {/* Boutons Accepter / Refuser */}
          <div className="mt-8 flex flex-col items-center gap-4 print:hidden">
            <p className="text-sm text-gray-500 text-center">
              Avez-vous lu et acceptez-vous les présentes Conditions Générales d'Utilisation ?
            </p>

            {refused && (
              <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-center">
                Vous avez refusé les CGU. Vous ne pourrez pas créer de compte sur LaundryMap.
              </p>
            )}

            {hasRead && !refused && (
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-center">
                Vous avez lu les CGU. Vous pouvez maintenant cocher la case d'acceptation dans le formulaire d'inscription.
              </p>
            )}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  localStorage.removeItem(CGU_READ_KEY);
                  setHasRead(false);
                  setRefused(true);
                }}
                className="px-6"
              >
                Refuser
              </Button>
              <Button
                type="button"
                onClick={() => {
                  localStorage.setItem(CGU_READ_KEY, "true");
                  setHasRead(true);
                  setRefused(false);
                  navigate(-1);
                }}
                className="px-6"
              >
                Accepter
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
