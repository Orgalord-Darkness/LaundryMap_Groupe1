import { Button } from "@/components/ui/button";

export default function Accessibilite() {
  const RAPPORT_AUDIT_URL = "/fichiers/informations/Rapport_Accessibilite_Accueil_2026-06-23.pdf";
  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-4xl mx-auto bg-card rounded-2xl shadow-sm p-8 md:p-12">

        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Accessibilité</h1>
            <p className="text-muted-foreground mt-1">LaundryMap — Ce qui est mis en place pour l'accessibilité</p>
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

        <hr className="border-border mb-10" />

        <div className="space-y-10 text-foreground leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">1. Mention légale</h2>
            <p className="mb-3">
              Le RGAA (Référentiel Général d'Amélioration de l'Accessibilité) est le référentiel utilisé en France pour évaluer l'accessibilité d'un site web. Il reprend les critères des WCAG (Web Content Accessibility Guidelines), le standard international d'accessibilité numérique défini par le W3C, qui se décline en trois niveaux de conformité : A, AA et AAA. Les mesures décrites à la partie 2 ci-dessous s'appuient sur ces deux référentiels.
            </p>
            <p>
              Conformément à l'article 47 de la loi n° 2005-102 du 11 février 2005, si vous ne parvenez pas à accéder à un contenu ou à obtenir une réponse satisfaisante de notre part, vous pouvez saisir le Défenseur des droits : www.defenseur-des-droits.fr, par téléphone au 3928, ou par courrier (Défenseur des droits – Libre réponse 71120 – 75342 Paris CEDEX 07).
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">2. Ce qui est mis en place</h2>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Thème clair / sombre : le site détecte la préférence du système (clair ou sombre) et le choix de l'utilisateur est mémorisé</li>
              <li>Navigation au clavier : les boutons, champs et liens affichent un contour de focus visible quand on navigue avec la touche Tab</li>
              <li>Fenêtres modales (ex : détail d'une machine) annoncées aux lecteurs d'écran via les attributs <code>role="dialog"</code> et <code>aria-modal</code></li>
              <li>Messages d'erreur et indicateurs de chargement signalés aux lecteurs d'écran via <code>role="alert"</code> et <code>role="status"</code></li>
              <li>Champs de recherche et boutons d'action avec un libellé accessible (<code>aria-label</code>) quand le texte visible ne suffit pas</li>
              <li>Listes de suggestions d'adresse navigables au clavier (<code>role="listbox"</code> / <code>role="option"</code>)</li>
              <li>Images avec texte alternatif (logo, photos de laveries, avatars)</li>
              <li>Mise en page responsive (mobile, tablette, ordinateur)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">3. Test d'accessibilité</h2>
            <p>
              Pour des raisons de manque de moyens seule la page d'accueil a pu être testé avec getWCAG voici le pdf résumant le test. Toutes les solutions pour tester l'accessibilité de l'intégralité du site sont payantes.<br/>
              La page d'accueil a été testée le 23 juin 2026 et a obtenu un score de 93/100. Le rapport d'audit est disponible en téléchargement ci-dessous. 
            </p>
            <a href={RAPPORT_AUDIT_URL} download className="inline-flex items-center text-primary hover:underline mt-2">                                                                                                                   
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">                                   
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />                                                                                              
              <polyline points="7 10 12 15 17 10" />                                                                                                              
                <line x1="12" y1="15" x2="12" y2="3" />                                                                                                             
              </svg>                                                                                                                                                
              Télécharger le rapport d'audit d'accessibilité de la page d'accueil (PDF)                                                                                                  
            </a> 
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">4. Contact</h2>
            <p>
              Pour signaler un problème d'accessibilité : <span className="font-medium">contact@ec2e.com</span>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
