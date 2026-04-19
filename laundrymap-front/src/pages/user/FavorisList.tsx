import axios from "axios"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DeleteFavoriteButton } from "@/components/ui/deleteFavoriButton"
import { PersonalSpaceNavbar, TAB_ROUTES, type PersonalSpaceTab } from "@/components/ui/PersonalSpaceNavbar"

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/v1`,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
})
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`
    return config
})

// ─── Types ───────────────────────────────────────────────────────────────────

interface BackendLaverie {
    id: number
    nom_etablissement: string
    statut: string
    adresse?: {
        adresse?: string
        rue?: string
        code_postal?: string
        ville?: string
    }
    logo?: string
}

function mapLaverie(b: BackendLaverie): FavoriLaverie {
    return {
        id: b.id,
        nom_etablissement: b.nom_etablissement,
        adresse: b.adresse?.adresse ?? b.adresse?.rue ?? "",
        ville: b.adresse?.ville ?? "",
        code_postal: b.adresse?.code_postal ?? "",
        image_url: b.logo ?? undefined,
        statut: (b.statut as FavoriLaverie["statut"]) ?? "INCONNU",
    }
}

export interface FavoriLaverie {
    id: number
    nom_etablissement: string
    adresse: string
    ville: string
    code_postal: string
    image_url?: string
    statut: "OUVERT" | "FERME" | "INCONNU"
    horaires_aujourd_hui?: string // ex: "Ouverture de 9H à 21H"
    note?: number
}

// ─── Composant carte favori ───────────────────────────────────────────────────

function FavoriCard({
    laverie,
    onRemoved,
}: {
    laverie: FavoriLaverie
    onRemoved: () => void
}) {
    const navigate = useNavigate()

    const statutLabel: Record<FavoriLaverie["statut"], string> = {
        OUVERT: "Ouverte",
        FERME: "Fermée",
        INCONNU: "Inconnu",
    }

    const statutStyle: Record<FavoriLaverie["statut"], string> = {
        OUVERT: "bg-green-100 text-green-700",
        FERME: "bg-red-100 text-red-700",
        INCONNU: "bg-gray-100 text-gray-500",
    }

    return (
        <Card className="overflow-hidden rounded-2xl p-0 gap-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* Image */}
            <div className="relative h-44 bg-gray-100 overflow-hidden">
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
                <span className={`absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full font-medium ${statutStyle[laverie.statut]}`}>
                    {statutLabel[laverie.statut]}
                </span>

                {/* Bouton cœur (supprimer des favoris) */}
                <div className="absolute top-3 right-3">
                    <DeleteFavoriteButton laverieId={laverie.id} onRemoved={onRemoved} />
                </div>
            </div>

            {/* Contenu */}
            <CardContent className="p-4 flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                    <h3 className="font-semibold text-gray-900 text-base leading-tight">
                        {laverie.nom_etablissement}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {laverie.adresse}, {laverie.code_postal} {laverie.ville}
                    </p>
                    {laverie.horaires_aujourd_hui && (
                        <p className="text-sm text-gray-500">
                            Aujourd'hui : {laverie.horaires_aujourd_hui}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <Button
                        variant="default"
                        size="sm"
                        onClick={() => navigate(`/laveries/${laverie.id}`)}
                        aria-label={`Voir la fiche de ${laverie.nom_etablissement}`}
                    >
                        Fiche de laverie
                    </Button>

                    {laverie.note !== undefined && (
                        <span className="flex items-center gap-1 text-sm font-medium text-gray-600">
                            Note : {laverie.note.toFixed(1)}
                            <svg className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

// ─── État vide ────────────────────────────────────────────────────────────────

function EmptyFavoris() {
    const navigate = useNavigate()
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="w-10 h-10 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
            </div>
            <div>
                <p className="font-semibold text-gray-800 text-base">Aucune laverie en favori</p>
                <p className="text-sm text-gray-500 mt-1">
                    Explorez la carte et ajoutez des laveries à vos favoris pour les retrouver ici.
                </p>
            </div>
            <Button variant="default" onClick={() => navigate("/")}>
                Explorer les laveries
            </Button>
        </div>
    )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export function FavorisList() {
    const navigate = useNavigate()
    const [favoris, setFavoris] = useState<FavoriLaverie[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Onglet actif dans la navbar de l'espace personnel
    const [activeTab, setActiveTab] = useState<PersonalSpaceTab>("Favoris")

    const fetchFavoris = async () => {
        setLoading(true)
        setError(null)
        try {
            const { data } = await api.get<{ data: BackendLaverie[] }>("/favori/list")
            setFavoris(data.data.map(mapLaverie))
        } catch {
            setError("Impossible de charger vos favoris. Veuillez réessayer.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchFavoris()
    }, [])

    const handleTabChange = (tab: PersonalSpaceTab) => {
        const route = TAB_ROUTES[tab]
        if (route) {
            setActiveTab(tab)
            navigate(route)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* En-tête de section */}
            <div className="bg-white px-4 pt-6 pb-0">
                <div className="max-w-lg mx-auto">
                    <div className="text-center mb-4">
                        <h1 className="text-xl font-bold text-gray-900">Espace personnel</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Mes laveries favorites</p>
                    </div>

                    {/* Onglets de navigation */}
                    <PersonalSpaceNavbar active={activeTab} onChange={handleTabChange} />
                </div>
            </div>

            {/* Contenu */}
            <main className="flex-1 px-4 py-5">
            <div className="max-w-lg mx-auto">
                {loading ? (
                    // Skeleton loader
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="rounded-2xl overflow-hidden bg-white shadow-sm animate-pulse">
                                <div className="h-44 bg-gray-200" />
                                <div className="p-4 flex flex-col gap-3">
                                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                                    <div className="h-3 bg-gray-100 rounded w-3/5" />
                                    <div className="flex justify-between items-center">
                                        <div className="h-8 bg-gray-200 rounded-lg w-28" />
                                        <div className="h-4 bg-gray-100 rounded w-16" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                        <p className="text-sm text-red-500">{error}</p>
                        <Button variant="outline" size="sm" onClick={fetchFavoris}>
                            Réessayer
                        </Button>
                    </div>
                ) : favoris.length === 0 ? (
                    <EmptyFavoris />
                ) : (
                    <div className="flex flex-col gap-4">
                        {favoris.map((laverie) => (
                            <FavoriCard
                                key={laverie.id}
                                laverie={laverie}
                                onRemoved={() => {
                                    // Suppression optimiste : retire la carte immédiatement de la liste locale
                                    setFavoris((prev) => prev.filter((l) => l.id !== laverie.id))
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
            </main>
        </div>
    )
}