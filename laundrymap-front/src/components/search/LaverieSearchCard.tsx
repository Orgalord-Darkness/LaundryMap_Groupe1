import { forwardRef } from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone } from "lucide-react"
import type { LaverieSearch } from "@/components/utils/type"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import {CardFooter} from "@/components/ui/card"


// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDistance(metres: number): string {
    if (metres < 1000) return `${Math.round(metres)} m`
    return `${(metres / 1000).toFixed(1)} km`
}

// ─── LaverieSearchCard — carte résultat de recherche ─────────────────────────
// Affiche les données retournées par l'API search : nom, adresse, distance,
// email et description si présents.

interface LaverieSearchCardProps {
    laverie: LaverieSearch
    selected: boolean
    onClick: () => void
}

export const LaverieSearchCard = forwardRef<HTMLDivElement, LaverieSearchCardProps>(
    ({ laverie, selected, onClick }, ref) => {
        const { t } = useTranslation()
        const navigate = useNavigate()
        return (
            <div ref={ref} onClick={onClick} className="cursor-pointer h-full">
                <Card
                    className={`
                        h-full flex flex-col overflow-hidden rounded-2xl p-0 gap-0 shadow-sm
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
                    <div className="relative h-36 bg-gray-100 overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                            <svg className="w-12 h-12 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M4 4h16v2H4V4zm0 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8zm4 4v4m4-4v4" />
                            </svg>
                        </div>

                        {/* Badge statut */}
                        <span className="absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
                            {t("search_open")}
                        </span>

                        {/* Badge distance */}
                        <span className="absolute bottom-3 left-3 text-xs px-2.5 py-1 rounded-full bg-white/90 text-gray-700 shadow-sm font-medium flex items-center gap-1">
                            <MapPin className="w-3 h-3" aria-hidden="true" />
                            {formatDistance(laverie.distanceMetres)}
                        </span>
                    </div>

                    {/* Contenu */}
                    <CardContent className="p-4 flex flex-col gap-2 flex-1">
                        <h3 className="font-semibold text-gray-900 text-base leading-tight">
                            {laverie.nomEtablissement}
                        </h3>

                        <p className="text-sm text-gray-500 flex items-start gap-1">
                            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" aria-hidden="true" />
                            {laverie.adresse.rue}, {laverie.adresse.codePostal} {laverie.adresse.ville}
                        </p>

                        {laverie.contactEmail && (
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5 shrink-0 text-gray-400" aria-hidden="true" />
                                {laverie.contactEmail}
                            </p>
                        )}

                        {laverie.description && (
                            <p className="text-xs text-gray-400 line-clamp-2">
                                {laverie.description}
                            </p>
                        )}
                    </CardContent>
                   <CardFooter className="pt-0 pb-4 w-full flex items-center justify-center">
                        <Button
                            className="w-full mt-2"
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                navigate(`/user/fiche-laverie/${laverie.id}`) 
                            }}
                        >
                            Voir la fiche
                        </Button>
                    </CardFooter>



                </Card>
            </div>
        )
    }
)

LaverieSearchCard.displayName = "LaverieSearchCard"
