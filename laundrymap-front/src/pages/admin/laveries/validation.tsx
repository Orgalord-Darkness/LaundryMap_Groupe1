import { useEffect, useState, useCallback } from "react"
import { FilterTabs } from "@/components/layout/Filter"
import axios from "axios"
import { PaginationBar } from "@/components/ui/pagination"
import type { Laverie } from "@/components/utils/type"
import { BADGE_LABELS } from "@/components/utils/config"
import { LaverieCard } from "@/components/layout/LaverieCard"
import type {LaverieAPI} from "@/components/utils/type"
import type { PaginationState } from "@/components/utils/type"

// ─── Types ────────────────────────────────────────────────────────────────────

type StatutOnglet = "EN_ATTENTE" | "VALIDE" | "REFUSE"

// Correspond exactement à la réponse API


// ─── Config ───────────────────────────────────────────────────────────────────

const ONGLETS = [
    { label: "En attente", value: "EN_ATTENTE" as StatutOnglet },
    { label: "Validés",    value: "VALIDE"     as StatutOnglet },
    { label: "Refusés",    value: "REFUSE"     as StatutOnglet },
]

const API_BASE = import.meta.env.VITE_API_BASE_URL

export const api = axios.create({
    baseURL: `${API_BASE}/api/v1`,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("fr-FR", {
        day:   "numeric",
        month: "long",
        year:  "numeric",
    })
}

function tempsEcoule(iso: string): string {
    const diff    = Date.now() - new Date(iso).getTime()
    const jours   = Math.floor(diff / 86_400_000)
    const heures  = Math.floor(diff / 3_600_000)
    const minutes = Math.floor(diff / 60_000)

    if (jours > 0)   return `${jours} jour${jours > 1 ? "s" : ""}`
    if (heures > 0)  return `${heures} heure${heures > 1 ? "s" : ""}`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""}`
    return "quelques secondes"
}

function normaliser(raw: LaverieAPI): Laverie {
    const u = raw.professionnel?.utilisateur

    return {
        id:                raw.id,
        nom_etablissement: raw.nom_etablissement,
        statut:            raw.statut,
        image_url:         raw.logo ? `${API_BASE}/${raw.logo.emplacement}` : undefined,
        proprietaire_nom:  u ? `${u.prenom} ${u.nom}` : "—",
        date_creation:     formatDate(raw.date_ajout),
        soumis_il_y_a:     tempsEcoule(raw.date_ajout),
    }
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function LaveriesValidation() {
    const [onglet, setOnglet]         = useState<StatutOnglet>("EN_ATTENTE")
    const [laveries, setLaveries]     = useState<Laverie[]>([])
    const [pagination, setPagination] = useState<PaginationState>({ page: 1, total_pages: 1, total: 0 })
    const [loading, setLoading]       = useState(false)
    const [error, setError]           = useState<string | null>(null)

    const fetchLaveries = useCallback(async (statut: StatutOnglet, page: number) => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(
                `${API_BASE}/api/v1/laverie/list?statut=${statut}&page=${page}&limit=4`,
                { credentials: "include" }
            )
            if (!res.ok) throw new Error("Erreur lors du chargement")
            const json = await res.json()
            const data: LaverieAPI[] = json.data ?? []
            setLaveries(data.map(normaliser))
            setPagination({
                page:        json.page        ?? page,
                total_pages: json.total_pages ?? 1,
                total:       json.total       ?? 0,
            })
        } catch {
            setError("Impossible de charger les laveries.")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchLaveries(onglet, 1)
        setPagination(prev => ({ ...prev, page: 1 }))
    }, [onglet, fetchLaveries])

    const handlePageChange = (p: number) => {
        fetchLaveries(onglet, p)
        setPagination(prev => ({ ...prev, page: p }))
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const handleVoirDemande = (id: number) => {
        window.location.href = `/admin/laverie/${id}`
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-2xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-semibold text-gray-900 mb-5">
                    Demandes de laveries
                </h1>

                <FilterTabs
                    tabs={ONGLETS}
                    active={onglet}
                    onChange={setOnglet}
                />

                {/* État chargement */}
                {loading && (
                    <div role="status" aria-live="polite" className="flex flex-col gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl h-64 animate-pulse border border-gray-100" />
                        ))}
                        <span className="sr-only">Chargement des laveries…</span>
                    </div>
                )}

                {/* État erreur */}
                {!loading && error && (
                    <div role="alert" className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                {/* État vide */}
                {!loading && !error && laveries.length === 0 && (
                    <p className="text-center text-gray-400 py-12 text-sm">
                        Aucune laverie dans cette catégorie.
                    </p>
                )}

                {/* Liste */}
                {!loading && !error && laveries.length > 0 && (
                    <>
                        <div
                            role="list"
                            aria-label={`Laveries ${BADGE_LABELS[onglet].toLowerCase()}`}
                            className="flex flex-col gap-5"
                        >
                            {laveries.map(laverie => (
                                <div key={laverie.id} role="listitem">
                                    <LaverieCard laverie={laverie} onVoir={handleVoirDemande} />
                                </div>
                            ))}
                        </div>

                        <PaginationBar
                            page={pagination.page}
                            totalPages={pagination.total_pages}
                            onChange={handlePageChange}
                        />
                    </>
                )}
            </main>
        </div>
    )
}