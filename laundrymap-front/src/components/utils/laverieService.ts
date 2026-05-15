import type { LaverieSearch, SearchFilters } from "@/components/utils/type"
import apiClient from "@/lib/apiClient"

// ─── Config ───────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL
// ─── Service laveries ─────────────────────────────────────────────────────────

/**
 * Recherche les laveries validées autour d'une position GPS.
 * Retourne un tableau vide si aucune laverie n'est trouvée dans le périmètre.
 */
export async function searchByLocation(
    lat: number,
    lng: number,
    radius: number = 1000
): Promise<LaverieSearch[]> {
    const response = await apiClient.get("/laverie/search", {
        params: { lat, lng, radius },
        validateStatus: (status) => status === 200 || status === 404,
    })
    if (response.status === 404) return []
    return response.data as LaverieSearch[]
}

/**
 * Recherche les laveries validées à partir d'une adresse textuelle.
 * Le géocodage est effectué côté backend via api-adresse.data.gouv.fr.
 * Retourne un tableau vide si aucune laverie n'est trouvée.
 */
export async function searchByQuery(
    query: string,
    radius: number = 1000
): Promise<LaverieSearch[]> {
    const response = await apiClient.get("/laverie/search", {
        params: { query, radius },
        validateStatus: (status) => status === 200 || status === 400 || status === 404,
    })
    if (response.status === 404 || response.status === 400) return []
    return response.data as LaverieSearch[]
}

/**
 * Recherche les laveries avec filtres (services, paiements, horaires).
 * Utilise l'endpoint /filter-search qui accepte les mêmes params que /search
 * plus des filtres optionnels.
 */
export async function searchWithFilters(
    query: string,
    filters: SearchFilters,
    radius: number = 1000
): Promise<LaverieSearch[]> {
    const params: Record<string, unknown> = { query, radius }

    if (filters.services.length > 0) params["services[]"] = filters.services
    if (filters.payments.length > 0) params["payments[]"] = filters.payments
    if (filters.openAt) {
        params.hourly_open = filters.openAt
        params.hourly_end = filters.openAt
    }

    const response = await apiClient.get("/laverie/filter-search", {
        params,
        validateStatus: (status) => status === 200 || status === 400 || status === 404,
    })
    if (response.status === 404 || response.status === 400) return []
    return response.data as LaverieSearch[]
}
