import { useState, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { SearchBar } from "@/components/search/SearchBar"
import { MapView } from "@/components/search/MapView"
import { LaverieList } from "@/components/search/LaverieList"
import { searchByQuery } from "@/components/utils/laverieService"
import type { LaverieSearch } from "@/components/utils/type"

// ─── HomePage — page d'accueil avec carte et liste de laveries ────────────────
// Carte vierge centrée sur Paris au chargement.
// L'utilisateur saisit une adresse → les laveries proches s'affichent sur la
// carte et dans la liste synchronisée en dessous.

export default function HomePage() {
    const { t } = useTranslation()

    // ─── État ─────────────────────────────────────────────────────────────────
    const [laveries, setLaveries] = useState<LaverieSearch[]>([])
    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hasSearched, setHasSearched] = useState(false)

    // ─── Handlers ─────────────────────────────────────────────────────────────

    const handleSearch = useCallback(async (query: string) => {
        setLoading(true)
        setError(null)
        setSelectedId(null)

        try {
            const results = await searchByQuery(query)
            setLaveries(results)
            setHasSearched(true)
        } catch {
            setError(t("search_error"))
            setLaveries([])
        } finally {
            setLoading(false)
        }
    }, [t])

    // Sélection bidirectionnelle carte ↔ liste
    const handleSelectLaverie = useCallback((id: number) => {
        setSelectedId(id)
    }, [])

    // ─── Rendu ────────────────────────────────────────────────────────────────

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-5">

                {/* Barre de recherche — relative z-10 pour passer au-dessus de la carte */}
                <div className="relative z-10">
                    <SearchBar onSearch={handleSearch} loading={loading} />
                </div>

                {/* Carte interactive — isolate emprisonne les z-index internes de Leaflet
                    (tuiles z-200, markers z-400, contrôles z-800) dans ce contexte,
                    ils ne peuvent plus passer devant des éléments extérieurs */}
                <div className="isolate">
                    <MapView
                        laveries={laveries}
                        selectedId={selectedId}
                        onSelectLaverie={handleSelectLaverie}
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
                    />
                </section>
            </div>
        </main>
    )
}
