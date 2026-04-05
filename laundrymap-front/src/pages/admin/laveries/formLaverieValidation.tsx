import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Button } from "@/components/ui/button"
import { Textarea } from '@/components/ui/textarea'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL

// Instance Axios configurée une fois pour toute
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

// ─── Types ────────────────────────────────────────────────────────────────────
interface LaverieDetail {
    id: number
    nom_etablissement: string
    statut: string
    description: string | null
    contact_email: string | null
    date_ajout: string
    date_modification: string
    wi_line_reference: number | null
    logo: { id: number; emplacement: string } | null
    adresse: {
        adresse: string; rue: string; code_postal: number; ville: string; pays: string;
        latitude: number | null; longitude: number | null;
    } | null
    professionnel: {
        id: number; siren: number; statut: string;
        utilisateur: { id: number; prenom: string; nom: string; email: string }
    } | null
    services: { id: number; nom: string }[]
    methodePaiements: { id: number; nom: string }[]
    laverieHistoriqueInteractions: {
        id: number; action: string; motif_action: string | null; date: string
    }[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleDateString("fr-FR", {
        day: "numeric", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    })
}

const STATUT_STYLES: Record<string, string> = {
    EN_ATTENTE: "bg-amber-100 text-amber-700 border border-amber-200",
    VALIDE:     "bg-emerald-100 text-emerald-700 border border-emerald-200",
    REFUSE:     "bg-red-100 text-red-600 border border-red-200",
}

const STATUT_LABELS: Record<string, string> = {
    EN_ATTENTE: "En attente",
    VALIDE:     "Validé",
    REFUSE:     "Refusé",
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">{title}</h2>
            {children}
        </div>
    )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-400">{label}</span>
            <span className="text-sm text-gray-800">{value ?? "—"}</span>
        </div>
    )
}

export default function LaverieValidation() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [laverie, setLaverie]   = useState<LaverieDetail | null>(null)
    const [loading, setLoading]   = useState(true)
    const [error, setError]       = useState<string | null>(null)
    const [motif, setMotif]       = useState("")
    const [motifError, setMotifError] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)

    // ─── Chargement ───────────────────────────────────────────────────────────
    const fetchLaverieData = async () => {
        try {
            const res = await api.get(`/laverie/${id}`)
            const data = res.data.laverie ?? res.data
            if (!data) throw new Error("Laverie introuvable.")
            setLaverie(data)
        } catch (err) {
            console.error("Erreur chargement:", err)
            setError("Impossible de charger les données.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (id) fetchLaverieData()
    }, [id])

    // ─── Action valider / refuser ─────────────────────────────────────────────
    const handleAction = async (action: "VALIDE" | "REFUSE") => {
        if (action === "REFUSE" && !motif.trim()) {
            setMotifError("Le motif est obligatoire pour un refus.")
            return
        }
        
        setSubmitting(true)
        setFeedback(null)

        try {
            await api.post(`/laverie/admin/valider/${id}`, {
                action,
                motif: motif.trim() || (action === "VALIDE" ? "Validation effectuée" : undefined),
            })

            setFeedback({
                type: "success",
                message: action === "VALIDE" ? "Laverie validée." : "Laverie refusée.",
            })

            // On rafraîchit les données après l'action
            await fetchLaverieData()
        } catch (err) {
            setFeedback({ type: "error", message: "Une erreur est survenue lors de l'action." })
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="p-10 text-center">Chargement...</div>
    if (error || !laverie) return <div className="p-10 text-red-500">{error}</div>

    const imageUrl = laverie.logo ? `${API_BASE}/${laverie.logo.emplacement.replace(/^\//, '')}` : null
    const statutActuel = laverie.statut as keyof typeof STATUT_STYLES

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => navigate(-1)}>‹ Retour</Button>
                    <h1 className="text-xl font-bold flex-1">{laverie.nom_etablissement}</h1>
                    <span className={`text-xs px-2.5 py-1 rounded-full ${STATUT_STYLES[statutActuel]}`}>
                        {STATUT_LABELS[statutActuel] || statutActuel}
                    </span>
                </div>

                {feedback && (
                    <div className={`p-4 rounded-xl border ${feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {feedback.message}
                    </div>
                )}

                {imageUrl && (
                    <div className="h-52 rounded-2xl overflow-hidden shadow-md">
                        <img src={imageUrl} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                )}

                <Section title="Informations générales">
                    <InfoRow label="Nom" value={laverie.nom_etablissement} />
                    <InfoRow label="Email" value={laverie.contact_email} />
                    <InfoRow label="Description" value={laverie.description} />
                </Section>

                {laverie.adresse && (
                    <Section title="Adresse">
                        <InfoRow label="Ville" value={`${laverie.adresse.code_postal} ${laverie.adresse.ville}`} />
                        <InfoRow label="Rue" value={`${laverie.adresse.adresse} ${laverie.adresse.rue}`} />
                    </Section>
                )}

                {/* Zone de décision */}
                <div className="bg-white rounded-2xl border p-4 shadow-lg flex flex-col gap-4 mt-4">
                    <h2 className="font-bold text-gray-700">Prendre une décision</h2>
                    <Textarea 
                        placeholder="Motif de la décision..." 
                        value={motif} 
                        onChange={(e) => setMotif(e.target.value)}
                        className={motifError ? "border-red-500" : ""}
                    />
                    {motifError && <span className="text-red-500 text-xs">{motifError}</span>}
                    
                    <div className="flex gap-4">
                        <Button 
                            className="flex-1 bg-red-500 hover:bg-red-600" 
                            disabled={submitting} 
                            onClick={() => handleAction("REFUSE")}
                        >
                            Refuser
                        </Button>
                        <Button 
                            className="flex-1 bg-green-600 hover:bg-green-700" 
                            disabled={submitting} 
                            onClick={() => handleAction("VALIDE")}
                        >
                            Valider la laverie
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    )
}