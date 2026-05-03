import { useState, useCallback, useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"
import { SearchBar } from "@/components/search/SearchBar"
import { MapView } from "@/components/search/MapView"
import { LaverieList } from "@/components/search/LaverieList"
import { FilterModal } from "@/components/search/FilterModal"
import { ActiveFilters } from "@/components/search/ActiveFilters"
import { searchWithFilters, searchByLocation } from "@/components/utils/laverieService"
import type { LaverieSearch, SearchFilters } from "@/components/utils/type"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button" 

// ─── HomePage — page d'accueil avec carte, recherche et filtres ───────────────
// Carte vierge centrée sur Paris au chargement.
// L'utilisateur saisit une adresse → les laveries proches s'affichent.
// Un bouton "Filtres" ouvre une modal pour affiner par services, paiements, horaires.
// Les filtres actifs s'affichent sous forme de chips supprimables au-dessus de la carte.

const EMPTY_FILTERS: SearchFilters = { openAt: "", services: [], payments: [] }

export default function HomePage() {
    const { t } = useTranslation()
    const [searchParams, setSearchParams] = useSearchParams()

    const initialQuery = searchParams.get("q") ?? ""

    // ─── État ─────────────────────────────────────────────────────────────────
    const [laveries, setLaveries] = useState<LaverieSearch[]>([])
    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hasSearched, setHasSearched] = useState(false)

    const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS)
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [lastQuery, setLastQuery] = useState(initialQuery)
    const [geoModalOpen, setGeoModalOpen] = useState(false)
    const [autoStartLocate, setAutoStartLocate] = useState(false)
    const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null)
    const [fitBoundsKey, setFitBoundsKey] = useState(0)
    const [searchClearKey, setSearchClearKey] = useState(0)

    const lastSearchPosRef = useRef<{ lat: number; lng: number } | null>(null)

    // ─── Helpers ──────────────────────────────────────────────────────────────

    const activeFilterCount =
        (filters.openAt ? 1 : 0) + filters.services.length + filters.payments.length

    // ─── Lancement de l'app ────────────────────────────────────────────

    useEffect(() => {
        if (!navigator.permissions) return
        navigator.permissions.query({ name: "geolocation" }).then((result) => {
            if (result.state === 'granted') {
                setAutoStartLocate(true)
            } else if (result.state === 'prompt' && !localStorage.getItem('geo_modal_answered')) {
                setGeoModalOpen(true)
            }
        })
    }, [])

    const handleLocationStop = useCallback(() => {
        setUserPosition(null)
        lastSearchPosRef.current = null
    }, [])

    const handleAcceptGeo = useCallback(() => {
        localStorage.setItem('geo_modal_answered', '1')
        setGeoModalOpen(false)
        setAutoStartLocate(true)
    }, [])
    const handleRefuseGeo = useCallback(() => {
        localStorage.setItem('geo_modal_answered', '1')
        setGeoModalOpen(false)
    }, [])

    const handleLocationFound = useCallback(async (pos: { lat: number; lng: number}) => {                                                                                                 
        // Ne relance la recherche que si la position a changé de plus de ~100m                                                                                                           
        if (lastSearchPosRef.current) {                                                                                                                                                   
            const dLat = Math.abs(pos.lat - lastSearchPosRef.current.lat)                                                                                                                 
            const dLng = Math.abs(pos.lng - lastSearchPosRef.current.lng)                                                                                                                 
            if (dLat < 0.001 && dLng < 0.001) return                                                                                                                                      
        }                                                                                                                                                                                 
        lastSearchPosRef.current = pos
        setUserPosition(pos)
        setLoading(true)
        setError(null)
        setSelectedId(null)
        setLastQuery("")
        setSearchParams(prev => { prev.delete("q"); return prev })
        setSearchClearKey(k => k + 1)
        try {
            const results = await searchByLocation(pos.lat, pos.lng)
            setLaveries(results)
            setHasSearched(true)                                                                                                                                                          
        } catch {               
            setError(t("search_error"))                                                                                                                                                   
            setLaveries([])                               
        } finally {        
            setLoading(false)
        }                                                                                                                                                                                 
    }, [t])

    // ─── Lancement de la recherche ────────────────────────────────────────────

    const runSearch = useCallback(async (query: string, activeFilters: SearchFilters) => {
        setLoading(true)
        setError(null)
        setSelectedId(null)

        try {
            const results = await searchWithFilters(query, activeFilters)
            setLaveries(results)
            setHasSearched(true)
        } catch {
            setError(t("search_error"))
            setLaveries([])
        } finally {
            setLoading(false)
        }
    }, [t])

    // Déclenché par la SearchBar quand l'utilisateur valide une adresse
    const handleSearch = useCallback((query: string, coords?: { lat: number; lng: number }) => {
        void coords  // coords transmises par SearchBar mais le centrage se fait via fitBounds sur les markers
        lastSearchPosRef.current = null  // Permet à la géoloc de relancer même si la position n'a pas changé
        setLastQuery(query)
        setSearchParams(prev => { prev.set("q", query); return prev })
        setFitBoundsKey(k => k + 1)
        runSearch(query, filters)
    }, [filters, runSearch, setSearchParams])

    // Re-lance la recherche au chargement si q est présent dans l'URL
    useEffect(() => {
        if (initialQuery) {
            runSearch(initialQuery, EMPTY_FILTERS)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Re-recherche automatique quand les filtres changent (si une recherche a déjà eu lieu)
    useEffect(() => {
        if (hasSearched && lastQuery) {
            runSearch(lastQuery, filters)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters])

    // ─── Suppression d'un filtre depuis un chip ───────────────────────────────

    const handleRemoveFilter = useCallback(
        (type: "openAt" | "service" | "payment", value: string) => {
            setFilters((prev) => {
                if (type === "openAt") return { ...prev, openAt: "" }
                if (type === "service") return { ...prev, services: prev.services.filter((s) => s !== value) }
                return { ...prev, payments: prev.payments.filter((p) => p !== value) }
            })
        },
        []
    )

    // Sélection bidirectionnelle carte ↔ liste
    const handleSelectLaverie = useCallback((id: number) => {
        setSelectedId(id)
    }, [])

    // ─── Rendu ────────────────────────────────────────────────────────────────

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-5">

                {/* Barre de recherche + bouton filtres — z-10 pour passer au-dessus de la carte */}
                <div className="relative z-10">
                    <SearchBar
                        onSearch={handleSearch}
                        loading={loading}
                        onFilterClick={() => setIsFilterOpen(true)}
                        activeFilterCount={activeFilterCount}
                        initialValue={initialQuery}
                        clearKey={searchClearKey}
                    />
                </div>

                {/* Chips des filtres actifs */}
                <ActiveFilters filters={filters} onRemoveFilter={handleRemoveFilter} />

                {/* Carte interactive — isolate emprisonne les z-index internes de Leaflet */}
                <div className="isolate">
                    <MapView
                        laveries={laveries}
                        selectedId={selectedId}
                        onSelectLaverie={handleSelectLaverie}
                        onLocationFound={handleLocationFound}
                        onLocationStop={handleLocationStop}
                        autoStart={autoStartLocate}
                        userPosition={userPosition}
                        searchRadius={1000}
                        fitBoundsKey={fitBoundsKey}
                    />
                </div>

                {/* Liste des résultats */}
                <section aria-labelledby="list-title">
                    <h2
                        id="list-title"
                        className="text-lg font-semibold text-gray-800 mb-4"
                    >
                        {t("search_title")}
                        {hasSearched && laveries.length > 0 && (
                            <span className="ml-2 text-sm font-normal text-gray-400">
                                ({laveries.length} résultat{laveries.length > 1 ? "s" : ""})
                            </span>
                        )}
                    </h2>

                    <LaverieList
                        laveries={laveries}
                        loading={loading}
                        error={error}
                        hasSearched={hasSearched}
                        selectedId={selectedId}
                        onSelectLaverie={handleSelectLaverie}
                        hasActiveFilters={activeFilterCount > 0}
                    />
                </section>
            </div>

            {/* Modale de filtres — en dehors du conteneur principal pour z-index correct */}
            <FilterModal
                open={isFilterOpen}
                onOpenChange={setIsFilterOpen}
                filters={filters}
                onFiltersChange={setFilters}
            />
            <Dialog open={geoModalOpen} onOpenChange={setGeoModalOpen}>
                <DialogContent>
                    <DialogTitle>{t("geo_permission_title")}</DialogTitle>
                    <DialogDescription>{t("geo_permission_desc")}</DialogDescription>
                    <Button onClick={handleAcceptGeo}>{t("geo_permission_accept")}</Button>
                    {/* <DialogClose className="ml-2">{t("geo_permission_decline")}</DialogClose> */}
                    <Button variant={'secondary'}onClick={handleRefuseGeo}>{t("geo_permission_decline")}</Button>
                </DialogContent>
            </Dialog>
        </main>
    )
}
