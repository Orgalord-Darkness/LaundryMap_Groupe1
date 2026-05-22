import { Card } from "@/components/ui/card"
import { MapPin } from "lucide-react"
import type { LaverieSearch } from "@/components/utils/type"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { StatusBadge } from "@/components/utils/StatusBadge"

const API_BASE = import.meta.env.VITE_API_BASE_URL

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
    const navigate = useNavigate()

    function todayHours(fermetures: LaverieSearch["fermetures"]): string | null {
        const currentDay = new Date().toLocaleDateString("fr-FR", { weekday: "long" }).toLowerCase()
        const todaySlots = fermetures?.filter(slot => slot.jour === currentDay) ?? []
        if (todaySlots.length === 0) return null
        return todaySlots.map(slot => `${slot.heureDebut} - ${slot.heureFin}`).join(" / ")
    }

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
            <div className="relative bg-card overflow-hidden shrink-0 w-full">
                {laverie.logoUrl ? (
                    <img
                        src={`${API_BASE}${laverie.logoUrl}`}
                        alt={laverie.nomEtablissement}
                        className="w-full h-auto max-h-24 object-contain"
                    />
                ) : (
                    <div className="h-24 w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                        <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M4 4h16v2H4V4zm0 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8zm4 4v4m4-4v4" />
                        </svg>
                    </div>
                )}

                {/* Badge statut dynamique */}
                <StatusBadge fermetures={laverie.fermetures} className="absolute top-2 right-2" />

                {/* Badge favori */}
                {laverie.isFavorite && (
                    <span className="absolute top-2 left-2 p-1 rounded-full bg-card/80 backdrop-blur-sm shadow-sm" aria-label="Favori">
                        <svg className="w-4 h-4 text-rose-500 fill-rose-500" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </span>
                )}

                {/* Badge distance */}
                <span className="absolute bottom-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-card/90 text-foreground shadow-sm font-medium flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5" aria-hidden="true" />
                    {formatDistance(laverie.distanceMetres)}
                </span>
            </div>

            {/* Contenu */}
            <div className="p-3 flex flex-col gap-1 flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2">
                    {laverie.nomEtablissement}
                </h3>

                <p className="text-xs text-muted-foreground flex items-start gap-1 line-clamp-1">
                    <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-gray-400" aria-hidden="true" />
                    {laverie.adresse.rue}, {laverie.adresse.codePostal} {laverie.adresse.ville}
                </p>

                {laverie.fermetures && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                        <span className="truncate">{todayHours(laverie.fermetures)}</span>
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
