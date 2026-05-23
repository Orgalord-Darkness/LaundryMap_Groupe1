import { useState, useMemo, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { LaverieSearchCard } from "./LaverieSearchCard"
import type { LaverieSearch, SortOrder } from "@/components/utils/type"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// ─── LaverieList — liste des résultats de recherche ───────────────────────────
// Gère les états : chargement, erreur, vide (après recherche), invitation initiale

interface LaverieListProps {
    laveries: LaverieSearch[]
    loading: boolean
    error: string | null
    hasSearched: boolean
    selectedId: number | null
    onSelectLaverie: (id: number) => void
    hasActiveFilters?: boolean
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return isMobile;
}

export function LaverieList({
    laveries,
    loading,
    error,
    hasSearched,
    selectedId,
    onSelectLaverie,
    hasActiveFilters = false,
}: LaverieListProps) {
    const { t } = useTranslation()
    const [sortOrder, setSortOrder] = useState<SortOrder>("distance_asc")
    const isMobile = useIsMobile()

    const sortedLaveries = useMemo(() => {
        const copy = [...laveries]
        switch (sortOrder) {
            case "distance_desc":
                return copy.sort((a, b) => b.distanceMetres - a.distanceMetres)
            case "name_asc":
                return copy.sort((a, b) => a.nomEtablissement.localeCompare(b.nomEtablissement, 'fr'))
            default:
                return copy.sort((a, b) => a.distanceMetres - b.distanceMetres)
        }
    }, [laveries, sortOrder])

    // ─── États ────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12" role="status" aria-label={t("search_loading")}>
                <span className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" aria-hidden="true" />
                <span className="ml-3 text-sm text-muted-foreground">{t("search_loading")}</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-center" role="alert">
                <p className="text-red-500 dark:text-red-400 text-sm">{t("search_error")}</p>
            </div>
        )
    }

    if (!hasSearched) {
        return (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center px-4">
                <svg className="w-14 h-14 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm text-gray-400 max-w-xs">{t("search_invite")}</p>
            </div>
        )
    }

    if (laveries.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center px-4">
                <p className="text-sm text-gray-400">
                    {hasActiveFilters
                        ? "Aucune laverie trouvée. Essayez de modifier vos filtres."
                        : t("search_no_results")}
                </p>
            </div>
        )
    }

    // ─── Résultats ────────────────────────────────────────────────────────────

    return (
        <div>
            <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs text-muted-foreground">
                    {laveries.length} résultat{laveries.length > 1 ? "s" : ""}
                </span>
                <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as SortOrder)}>
                    <SelectTrigger className="w-44 h-7 text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="distance_asc">Distance croissante</SelectItem>
                        <SelectItem value="distance_desc">Distance décroissante</SelectItem>
                        <SelectItem value="name_asc">Nom A → Z</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {isMobile ? (
                <ScrollArea className="h-[400px]" aria-label="Liste des laveries trouvées">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-1">
                    {sortedLaveries.map((laverie) => (
                        <LaverieSearchCard
                        key={laverie.id}
                        laverie={laverie}
                        selected={selectedId === laverie.id}
                        onClick={() => onSelectLaverie(laverie.id)}
                        />
                    ))}
                    </div>
                </ScrollArea>
                ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-1">
                    {sortedLaveries.map((laverie) => (
                    <LaverieSearchCard
                        key={laverie.id}
                        laverie={laverie}
                        selected={selectedId === laverie.id}
                        onClick={() => onSelectLaverie(laverie.id)}
                    />
                    ))}
                </div>
                )
            }

           
        </div>
    )
}
