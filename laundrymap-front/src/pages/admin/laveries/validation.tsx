import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import axios from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────

type StatutOnglet = "EN_ATTENTE" | "VALIDE" | "REFUSE"

interface Laverie {
    id: number
    nom_etablissement: string
    proprietaire_nom: string
    date_creation: string
    statut: StatutOnglet
    image_url?: string
    soumis_il_y_a?: string
}

interface Pagination {
    page: number
    total_pages: number
    total: number
}

// ─── Config ───────────────────────────────────────────────────────────────────

const ONGLETS: { label: string; statut: StatutOnglet }[] = [
    { label: "En attente", statut: "EN_ATTENTE" },
    { label: "Validés",    statut: "VALIDE"     },
    { label: "Refusés",    statut: "REFUSE"     },
]

const BADGE_STYLES: Record<StatutOnglet, string> = {
    EN_ATTENTE: "bg-amber-100 text-amber-700 border border-amber-200",
    VALIDE:     "bg-emerald-100 text-emerald-700 border border-emerald-200",
    REFUSE:     "bg-red-100 text-red-600 border border-red-200",
}

const BADGE_LABELS: Record<StatutOnglet, string> = {
    EN_ATTENTE: "En attente",
    VALIDE:     "Validé",
    REFUSE:     "Refusé",
}

const API_BASE = import.meta.env.VITE_API_BASE_URL

export const api = axios.create({
    baseURL: `${API_BASE}/api/v1`,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ─── Composant carte ─────────────────────────────────────────────────────────

function LaverieCard({
    laverie,
    onVoir,
    handleValider, 
    handleRefuser
}: {
    laverie: Laverie
    onVoir: (id: number) => void
    handleValider: (id: number) => void
    handleRefuser: (id: number) => void
}) {
    return (
        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
            {/* Image */}
            <div className="relative h-44 bg-gray-200 overflow-hidden">
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
                {/* Badge statut */}
                <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${BADGE_STYLES[laverie.statut]}`}>
                    {BADGE_LABELS[laverie.statut]}
                </span>
            </div>

            {/* Contenu */}
            <div className="p-4 flex flex-col gap-3">
                <div>
                    <h3 className="font-semibold text-gray-900 text-base leading-tight">
                        {laverie.nom_etablissement}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
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
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-xl px-4"
                        aria-label={`Voir la demande de ${laverie.nom_etablissement}`}
                    >
                        Voir la demande
                    </Button>

                   <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleValider(laverie.id)}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm rounded-xl px-4"
                    >
                        Valider
                    </Button>

                    <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleRefuser(laverie.id)}
                        className="bg-red-600 hover:bg-red-700 text-white text-sm rounded-xl px-4"
                    >
                        Refuser
                    </Button>


                    {laverie.soumis_il_y_a && (
                        <span className="text-xs text-gray-400">
                            Soumis il y a {laverie.soumis_il_y_a}
                        </span>
                    )}
                </div>
            </div>
        </article>
    )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function PaginationBar({
    page,
    totalPages,
    onChange,
}: {
    page: number
    totalPages: number
    onChange: (p: number) => void
}) {
    const pages: (number | "…")[] = []

    if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
        pages.push(1)
        if (page > 3) pages.push("…")
        for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
            pages.push(i)
        }
        if (page < totalPages - 2) pages.push("…")
        pages.push(totalPages)
    }

    return (
        <nav
            aria-label="Pagination"
            className="flex items-center justify-center gap-1 mt-8"
        >
            <button
                onClick={() => onChange(page - 1)}
                disabled={page === 1}
                aria-label="Page précédente"
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
                ‹
            </button>

            {pages.map((p, i) =>
                p === "…" ? (
                    <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">
                        …
                    </span>
                ) : (
                    <button
                        key={p}
                        onClick={() => onChange(p as number)}
                        aria-current={p === page ? "page" : undefined}
                        aria-label={`Page ${p}`}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                            p === page
                                ? "bg-blue-600 text-white shadow-sm"
                                : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                        {p}
                    </button>
                )
            )}

            <button
                onClick={() => onChange(page + 1)}
                disabled={page === totalPages}
                aria-label="Page suivante"
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
                ›
            </button>
        </nav>
    )
}


// ─── Page principale ──────────────────────────────────────────────────────────

export default function LaveriesValidation() {
    const [onglet, setOnglet]         = useState<StatutOnglet>("EN_ATTENTE")
    const [laveries, setLaveries]     = useState<Laverie[]>([])
    const [pagination, setPagination] = useState<Pagination>({ page: 1, total_pages: 1, total: 0 })
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
            setLaveries(json.data ?? [])
            setPagination({
                page:        json.page        ?? page,
                total_pages: json.total_pages ?? 1,
                total:       json.total       ?? 0,
            })
        } catch (e) {
            setError("Impossible de charger les laveries.")
        } finally {
            setLoading(false)
        }
    }, [])

    const handleValider = async (id: number) => {
    try {
        console.log("🚀 VALIDATION ID:", id)

        const res = await api.post(`/laverie/admin/valider/${id}`, {
        action: "VALIDE",
        motif: "Validation effectuée"
        })

        console.log("✅ SUCCESS:", res.data)

        fetchLaveries(onglet, pagination.page)

    } catch (error: any) {
        console.error("❌ ERREUR:", error)

        if (error.response) {
        console.log("📦 DATA:", error.response.data)
        console.log("📊 STATUS:", error.response.status)
        } else if (error.request) {
        console.log("🚨 PAS DE RÉPONSE (CORS ?)")
        }
    }
    }

    const handleRefuser = async (id: number) => {
        try {
            await api.post(`/laverie/admin/valider/${id}`, {
                action: "REFUSE",
                motif: "Refus effectué"
            });

            fetchLaveries(onglet, pagination.page);
        } catch (e) {
            console.error(e);
            alert("Erreur lors du refus");
        }
    };

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
            
            {/* Contenu */}
            <main className="max-w-2xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-5">
                    Demandes de laveries
                </h1>

                {/* Onglets */}
                <div
                    role="tablist"
                    aria-label="Filtrer par statut"
                    className="flex gap-0 border-b border-gray-200 mb-6"
                >
                    {ONGLETS.map(({ label, statut }) => (
                        <button
                            key={statut}
                            role="tab"
                            aria-selected={onglet === statut}
                            onClick={() => setOnglet(statut)}
                            className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                                onglet === statut
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* États */}
                {loading && (
                    <div
                        role="status"
                        aria-live="polite"
                        className="flex flex-col gap-4"
                    >
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl h-64 animate-pulse border border-gray-100" />
                        ))}
                        <span className="sr-only">Chargement des laveries…</span>
                    </div>
                )}

                {!loading && error && (
                    <div
                        role="alert"
                        className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm"
                    >
                        {error}
                    </div>
                )}

                {!loading && !error && laveries.length === 0 && (
                    <p className="text-center text-gray-400 py-12 text-sm">
                        Aucune laverie dans cette catégorie.
                    </p>
                )}

                {!loading && !error && laveries.length > 0 && (
                    <>
                        <div
                            role="list"
                            aria-label={`Laveries ${BADGE_LABELS[onglet].toLowerCase()}`}
                            className="flex flex-col gap-5"
                        >
                            {laveries.map(laverie => (
                                <div key={laverie.id} role="listitem">
                                    <LaverieCard laverie={laverie} onVoir={handleVoirDemande} handleValider={handleValider} handleRefuser={handleRefuser} />
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
