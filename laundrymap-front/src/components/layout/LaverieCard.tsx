import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BADGE_LABELS, BADGE_STYLES } from "../utils/config"
import type { Laverie } from "../utils/type"
import { LaverieActions } from "@/components/ui/optionsButton"

// ─── LaverieCard — composant de carte pour afficher une laverie dans la liste de validation ────────────────────────
// Usage :
//   <LaverieCard laverie={laverie} onVoir={(id) => navigate(`/admin/laveries/${id}`)} />

export function LaverieCard({
    laverie,
    onVoir,
}: {
    laverie: Laverie
    onVoir: (id: number) => void
}) {
    return (
        <Card className="overflow-hidden rounded-2xl p-0 gap-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* Image */}
            <div className="relative h-44 bg-gray-100 overflow-hidden">
                {laverie.image_url ? (
                    <img
                        src={laverie.image_url}
                        alt={`Photo de ${laverie.nom_etablissement}`}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                        <svg className="w-14 h-14 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M4 4h16v2H4V4zm0 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8zm4 4v4m4-4v4" />
                        </svg>
                    </div>
                )}
                <span className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full ${BADGE_STYLES[laverie.statut]}`}>
                    {BADGE_LABELS[laverie.statut]}
                </span>
            </div>
            {/* 🔵 Bouton 3 points */}
            <div className="absolute top-2 right-2">
                <div className="bg-white/90 backdrop-blur rounded-lg shadow-sm">
                    <LaverieActions
                        id={laverie.id}
                        onDeleted={() => {
                            // refresh liste ou refetch
                            console.log("supprimé");
                        }}
                        onEdit={() => {
                            console.log("edit");
                        }}
                        name={laverie.nom_etablissement}
                    />
                </div>
            </div>

            {/* Contenu */}
            <CardContent className="p-4 flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                    <h3 className="font-semibold text-gray-900 text-base leading-tight">
                        {laverie.nom_etablissement}
                    </h3>
                    <p className="text-sm text-gray-500">
                        Propriétaire : {laverie.proprietaire_nom}
                    </p>
                    <p className="text-sm text-gray-500">
                        Créé le {laverie.date_creation}
                    </p>
                </div>

                <div className="flex items-center justify-between">
                    <Button
                        variant="default"
                        size="sm"
                        onClick={() => onVoir(laverie.id)}
                        aria-label={`Voir la demande de ${laverie.nom_etablissement}`}
                    >
                        Voir la demande
                    </Button>

                    <span className="text-xs text-gray-400">
                        Soumis il y a {laverie.soumis_il_y_a}
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}