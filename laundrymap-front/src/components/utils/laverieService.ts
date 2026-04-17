import axios from "axios"
import type { LaverieSearch, SearchFilters } from "@/components/utils/type"

// ─── Config ───────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL

const api = axios.create({
    baseURL: `${API_BASE}/api/v1`,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`
    return config
})

// ─── Service laveries ─────────────────────────────────────────────────────────

/**
 * Recherche les laveries validées autour d'une position GPS.
 * Retourne un tableau vide si aucune laverie n'est trouvée dans le périmètre.
 */
export async function searchByLocation(
    lat: number,
    lng: number,
    radius: number = 5000
): Promise<LaverieSearch[]> {
    const response = await api.get("/laverie/search", {
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
    radius: number = 5000
): Promise<LaverieSearch[]> {
    const response = await api.get("/laverie/search", {
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
    radius: number = 5000
): Promise<LaverieSearch[]> {
    const params: Record<string, unknown> = { query, radius }

    if (filters.services.length > 0) params["services[]"] = filters.services
    if (filters.payments.length > 0) params["payments[]"] = filters.payments
    if (filters.openAt) {
        params.hourly_open = filters.openAt
        params.hourly_end = filters.openAt
    }

    const response = await api.get("/laverie/filter-search", {
        params,
        validateStatus: (status) => status === 200 || status === 400 || status === 404,
    })
    if (response.status === 404 || response.status === 400) return []
    return response.data as LaverieSearch[]
}
