import { useTranslation } from "react-i18next"
import { Card } from "@/components/ui/card"
import { MapPin, Mail } from "lucide-react"
import type { LaverieSearch } from "@/components/utils/type"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"


// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDistance(metres: number): string {
    if (metres < 1000) return `${Math.round(metres)} m`
    return `${(metres / 1000).toFixed(1)} km`
}

// ─── LaverieSearchCard — carte résultat de recherche ─────────────────────────

interface LaverieSearchCardProps {
    laverie: LaverieSearch
    selected: boolean
    onClick: () => void
}

export function LaverieSearchCard({ laverie, selected, onClick }: LaverieSearchCardProps) {
    const { t } = useTranslation()
    const navigate = useNavigate()

    return (
        <Card
            onClick={onClick}
            className={`
                cursor-pointer h-full flex flex-col overflow-hidden rounded-2xl p-0 gap-0 shadow-sm
                transition-all duration-200
                ${selected
                    ? "ring-2 ring-primary shadow-md"
                    : "hover:shadow-md"
                }
            `}
            aria-selected={selected}
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onClick()}
            role="button"
            aria-label={`Laverie ${laverie.nomEtablissement}`}
        >
            {/* Image / Placeholder */}
            <div className="relative h-24 bg-gray-100 overflow-hidden shrink-0">
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                    <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M4 4h16v2H4V4zm0 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8zm4 4v4m4-4v4" />
                    </svg>
                </div>

                {/* Badge statut */}
                <span className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 leading-tight">
                    {t("search_open")}
                </span>

                {/* Badge distance */}
                <span className="absolute bottom-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-white/90 text-gray-700 shadow-sm font-medium flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5" aria-hidden="true" />
                    {formatDistance(laverie.distanceMetres)}
                </span>
            </div>

            {/* Contenu */}
            <div className="p-3 flex flex-col gap-1 flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                    {laverie.nomEtablissement}
                </h3>

                <p className="text-xs text-gray-500 flex items-start gap-1 line-clamp-1">
                    <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-gray-400" aria-hidden="true" />
                    {laverie.adresse.rue}, {laverie.adresse.codePostal} {laverie.adresse.ville}
                </p>

                {laverie.contactEmail && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3 shrink-0 text-gray-400" aria-hidden="true" />
                        <span className="truncate">{laverie.contactEmail}</span>
                    </p>
                )}

                {laverie.description && (
                    <p className="text-xs text-gray-400 line-clamp-1">
                        {laverie.description}
                    </p>
                )}
            </div>

            {/* Footer */}
            <div className="px-3 pb-3 pt-0">
                <Button
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/user/fiche-laverie/${laverie.id}`)
                    }}
                >
                    Voir la fiche
                </Button>
            </div>
        </Card>
    )
}
